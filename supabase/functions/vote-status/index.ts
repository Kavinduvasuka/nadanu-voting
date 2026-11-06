import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const url = Deno.env.get('SUPABASE_URL') || '';
const secretKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const hashSecret = Deno.env.get('VOTING_HASH_SECRET') || '';
const origins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(x => x.trim()).filter(Boolean);
const admin = url && secretKey ? createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false }
}) : null;

function respond(origin: string, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'access-control-allow-origin': origin,
      'vary': 'Origin',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info'
    }
  });
}

async function deviceHash(deviceId: string) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(hashSecret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(deviceId));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async req => {
  const origin = req.headers.get('origin') || '';
  if (!origins.includes(origin)) return respond('null', 403, { error: 'Origin not permitted.' });
  if (req.method === 'OPTIONS') return respond(origin, 200, {});
  if (req.method !== 'POST') return respond(origin, 405, { error: 'Method not allowed.' });
  if (!admin || hashSecret.length < 32) return respond(origin, 503, { error: 'Voting status unavailable.' });
  try {
    const authorization = req.headers.get('authorization') || '';
    if (!authorization.startsWith('Bearer ')) return respond(origin, 401, { error: 'Session required.' });
    const { data: { user }, error: authError } = await admin.auth.getUser(authorization.slice(7));
    if (authError || !user) return respond(origin, 401, { error: 'Valid session required.' });
    const body = await req.json();
    if (typeof body.device_id !== 'string' || body.device_id.length < 20 || body.device_id.length > 200) {
      return respond(origin, 400, { error: 'Invalid device identifier.' });
    }
    const hashed = await deviceHash(body.device_id);
    // Read only. A reset of this vote immediately changes the result on the next check.
    // An authenticated session can only check the browser identifier it supplies.
    // Anonymous voters are additionally checked by their verified Auth user ID.
    // This works even when the same browser is currently signed in as an organizer.
    const filter = user.is_anonymous
      ? `voter_id.eq.${user.id},device_hash.eq.${hashed}`
      : `device_hash.eq.${hashed}`;
    const { data, error } = await admin.from('votes').select('id')
      .or(filter).limit(1);
    if (error) {
      console.error('vote-status query failed:', error.code);
      return respond(origin, 503, { error: 'Voting status unavailable.' });
    }
    return respond(origin, 200, { voted: (data?.length || 0) > 0 });
  } catch (err) {
    console.error('vote-status failed:', err instanceof Error ? err.name : 'unknown');
    return respond(origin, 503, { error: 'Voting status unavailable.' });
  }
});
