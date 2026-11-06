import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const AUTH_KEY = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || SERVICE_KEY;
const ALLOWED = (Deno.env.get('ALLOWED_ORIGINS') || '')
  .split(',').map(x => x.trim()).filter(Boolean);

function respond(status: number, body: unknown, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': origin,
      'vary': 'Origin',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info',
      'cache-control': 'no-store'
    }
  });
}

Deno.serve(async req => {
  const origin = req.headers.get('origin') || '';
  if (!ALLOWED.includes(origin)) return respond(403, {error: 'Origin not permitted.'}, 'null');
  if (req.method === 'OPTIONS') return respond(200, {}, origin);
  if (req.method !== 'POST') return respond(405, {error: 'Method not allowed.'}, origin);
  if (!URL || !SERVICE_KEY || !AUTH_KEY) return respond(503, {error: 'Backend not configured.'}, origin);

  try {
    const jwt = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
    if (!jwt || jwt === req.headers.get('authorization')) {
      return respond(401, {error: 'Admin login required.'}, origin);
    }

    const admin = createClient(URL, SERVICE_KEY, {
      auth: {persistSession: false, autoRefreshToken: false}
    });
    const {data: userData, error: userErr} = await admin.auth.getUser(jwt);
    const caller = userData?.user;
    if (userErr || !caller || caller.is_anonymous) {
      return respond(401, {error: 'Invalid admin session.'}, origin);
    }

    const {data: role, error: roleErr} = await admin.from('admin_roles')
      .select('role').eq('user_id', caller.id).maybeSingle();
    if (roleErr || !role) return respond(403, {error: 'Organizer access required.'}, origin);

    const {vote_id, email, password} = await req.json();
    if (typeof vote_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vote_id)) {
      return respond(400, {error: 'Invalid vote selected.'}, origin);
    }
    if (typeof email !== 'string' || typeof password !== 'string' ||
        email.length > 320 || password.length > 1024 || password.length < 1 ||
        email.trim().toLowerCase() !== (caller.email || '').trim().toLowerCase()) {
      return respond(403, {error: 'Admin email or password is incorrect.'}, origin);
    }

    // Server-side reauthentication. A browser-only password dialog can be bypassed.
    // Use a separate client, never overwrite the caller's login session.
    const verifier = createClient(URL, AUTH_KEY, {
      auth: {persistSession: false, autoRefreshToken: false}
    });
    const {data: verified, error: passwordErr} = await verifier.auth.signInWithPassword({
      email: email.trim(), password
    });
    if (passwordErr || !verified.user || verified.user.id !== caller.id) {
      return respond(403, {error: 'Admin email or password is incorrect.'}, origin);
    }

    // service_role-only RPC performs atomic deletion and audit.
    const {data: deleted, error: resetErr} = await admin.rpc('admin_reset_one_vote', {
      p_vote_id: vote_id,
      p_admin_id: caller.id
    });
    if (resetErr) {
      console.error('vote reset error:', resetErr.code);
      return respond(500, {error: 'Could not reset this vote.'}, origin);
    }
    if (!deleted) return respond(404, {error: 'Vote already removed or not found.'}, origin);
    return respond(200, {ok: true, message: 'Vote reset and audited.'}, origin);
  } catch (e) {
    console.error('admin reset error:', e);
    return respond(500, {error: 'Could not process the request.'}, origin);
  }
});
