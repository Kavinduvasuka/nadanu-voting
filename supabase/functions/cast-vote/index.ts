import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const HASH_SECRET = Deno.env.get('VOTING_HASH_SECRET') || '';
const TURNSTILE_SECRET = Deno.env.get('TURNSTILE_SECRET_KEY') || '';
const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '')
  .split(',').map(x => x.trim()).filter(Boolean);
const expectedHostname = (Deno.env.get('TURNSTILE_EXPECTED_HOSTNAME') || '').trim();

// Enable detailed timings ONLY in staging, never expose them by default.
const timingEnabled = Deno.env.get('ENABLE_VOTE_TIMINGS') === 'true';

const admin = SUPABASE_URL && SERVICE_KEY
  ? createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

function respond(
  data: unknown, status: number, origin: string, started: number,
  timings: Record<string, number> = {}
) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'access-control-allow-origin': origin,
    'vary': 'Origin',
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
    'cache-control': 'no-store'
  };
  if (timingEnabled && origin !== 'null') {
    headers['server-timing'] = [
      ...Object.entries(timings).map(([name, ms]) => `${name};dur=${ms.toFixed(1)}`),
      `total;dur=${(performance.now()-started).toFixed(1)}`
    ].join(', ');
    headers['access-control-expose-headers'] = 'server-timing';
  }
  return new Response(JSON.stringify(data), { status, headers });
}

async function shaHmac(value: string) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(HASH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig))
    .map(x => x.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const started = performance.now();
  const timing: Record<string, number> = {};
  const origin = req.headers.get('origin') || '';
  const send = (data: unknown, code: number) => respond(data, code, origin, started, timing);

  if (!allowedOrigins.includes(origin))
    return respond({ error: 'This website origin is not authorized to vote.' }, 403, 'null', started);
  if (req.method === 'OPTIONS') return send({}, 200);
  if (req.method !== 'POST') return send({ error: 'Method not allowed' }, 405);
  if (!admin || HASH_SECRET.length < 32 || !TURNSTILE_SECRET || !expectedHostname)
    return send({ error: 'Voting backend security settings are incomplete.' }, 503);

  try {
    const bearer = req.headers.get('authorization') || '';
    if (!bearer.startsWith('Bearer ')) return send({ error: 'Voting session required' }, 401);

    const body = await req.json();
    if (typeof body.contestant_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.contestant_id))
      return send({ error: 'Invalid finalist' }, 400);
    if (typeof body.device_id !== 'string' || body.device_id.length < 20 || body.device_id.length > 200)
      return send({ error: 'Invalid browser identifier' }, 400);
    if (typeof body.turnstile_token !== 'string' || !body.turnstile_token)
      return send({ error: 'Security check missing' }, 400);

    // Auth and remote Turnstile verification have no dependency on each other.
    // Parallel verification reduces latency without bypassing either check.
    const authStarted = performance.now();
    const verifyUser = admin.auth.getUser(bearer.slice(7)).then(result => {
      timing.auth = performance.now() - authStarted;
      return result;
    });
    const turnStarted = performance.now();
    const fd = new FormData();
    fd.set('secret', TURNSTILE_SECRET);
    fd.set('response', body.turnstile_token);
    const verifyTurnstile = fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: fd, signal: AbortSignal.timeout(10000)
    }).then(async result => {
      const checked = await result.json();
      timing.turnstile = performance.now() - turnStarted;
      return checked;
    });
    const [authResult, checked] = await Promise.all([verifyUser, verifyTurnstile]);
    const user = authResult.data.user;

    if (authResult.error || !user || !user.is_anonymous)
      return send({ error: 'A valid anonymous voter session is required.' }, 401);
    if (!checked.success || checked.hostname !== expectedHostname)
      return send({ error: 'Security check failed. Please retry.' }, 403);

    // Hash is still server-side. No device identifier is stored in plaintext.
    const hashStarted = performance.now();
    const device_hash = await shaHmac(body.device_id);
    timing.hash = performance.now() - hashStarted;

    // A single service-role-only SQL call validates event/finalist AND inserts vote.
    // The DB applies the same uniqueness constraints as before.
    // Requires migration 202611060004_atomic_vote_rpc.sql BEFORE function deployment.
    const voteStarted = performance.now();
    const { data: result, error: voteErr } = await admin.rpc('cast_vote_atomic', {
      p_contestant_id: body.contestant_id,
      p_voter_id: user.id,
      p_device_hash: device_hash
    });
    timing.atomic_vote = performance.now() - voteStarted;

    if (voteErr) {
      console.error('Atomic vote RPC failed:', voteErr.code);
      return send({ error: 'Vote could not be recorded. Please contact organizers.' }, 500);
    }
    if (result === 'duplicate')
      return send({ error: 'A vote has already been recorded for this browser/session.' }, 409);
    if (result === 'voting_closed')
      return send({ error: 'Voting is not open.' }, 403);
    if (result === 'finalist_unavailable')
      return send({ error: 'This finalist is not available for voting.' }, 400);
    if (result === 'invalid_request')
      return send({ error: 'Invalid vote request.' }, 400);
    if (result !== 'ok')
      return send({ error: 'Vote could not be recorded. Please contact organizers.' }, 500);

    return send({ ok: true, message: 'Vote recorded successfully' }, 200);
  } catch (err) {
    console.error('cast-vote failure:', err);
    return send({ error: 'Unable to process vote.' }, 500);
  }
});
