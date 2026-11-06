// NADANU 3.0 STAGING-ONLY end-to-end voting load test.
// Tests public read -> anonymous sign-in -> vote -> duplicate vote rejection.
// Runs once per VU to avoid creating unlimited Auth users or votes.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const url = (__ENV.STAGING_SUPABASE_URL || '').replace(/\/$/, '');
const key = __ENV.STAGING_PUBLISHABLE_KEY || '';
const ref = __ENV.STAGING_PROJECT_REF || '';
const finalistId = __ENV.STAGING_CONTESTANT_ID || '';
const vus = Number(__ENV.TEST_VUS || 5);
const origin = 'http://localhost:5173';
const productionRef = 'xgaibywmetlficnnataf';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

if (__ENV.CONFIRM_STAGING_ONLY !== 'YES' ||
    !/^[a-z0-9]{20}$/.test(ref) ||
    ref === productionRef ||
    url !== `https://${ref}.supabase.co` ||
    !key.startsWith('sb_publishable_') ||
    !uuid.test(finalistId) ||
    !Number.isInteger(vus) || vus < 1 || vus > 20) {
  throw new Error('SAFETY STOP: provide a verified, different STAGING Supabase project, publishable key, staging contestant UUID, TEST_VUS=1..20, and CONFIRM_STAGING_ONLY=YES.');
}

const voteTime = new Trend('vote_submit_ms', true);
const authTime = new Trend('anonymous_auth_ms', true);
const voteSuccess = new Counter('vote_success');
const duplicateSuccess = new Counter('duplicate_rejected');
const flowFailures = new Counter('flow_failures');

export const options = {
  scenarios: {
    end_to_end: {
      executor: 'per-vu-iterations',
      vus,
      iterations: 1,
      maxDuration: '2m'
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.60'], // Expected duplicate rejections are HTTP 409; use checks for correctness.
    checks: ['rate>0.95'],
    vote_submit_ms: ['p(95)<3000'],
  },
};

function json(res) {
  try { return res.json(); } catch { return {}; }
}
function headers(token) {
  const h = {
    apikey: key,
    'Content-Type': 'application/json',
    Origin: origin
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}
function fail(stage, response) {
  flowFailures.add(1);
  console.error(`${stage} failed: HTTP ${response.status} ${String(response.body || '').slice(0, 250)}`);
}

export default function () {
  // 1. Public read - actual homepage RPC (no vote access).
  const boot = http.post(`${url}/rest/v1/rpc/public_voting_bootstrap`, '{}', {
    headers: headers(),
    timeout: '15s',
    tags: {step: 'public_bootstrap'}
  });
  const bootOK = check(boot, {
    'bootstrap HTTP 200': r => r.status === 200,
    'bootstrap has contestants': r => Array.isArray(json(r)?.contestants)
  });
  if (!bootOK) { fail('bootstrap', boot); return; }

  // 2. Sign in anonymously, creating ONE staging test user for this VU.
  // This is rate-limited per IP by Supabase (often 30/hr).
  const auth = http.post(`${url}/auth/v1/signup`, '{}', {
    headers: headers(),
    timeout: '15s',
    tags: {step: 'anonymous_auth'}
  });
  authTime.add(auth.timings.duration);
  const session = json(auth);
  const token = session?.access_token;
  if (!check(auth, {
    'anonymous signup HTTP 2xx': r => r.status >= 200 && r.status < 300,
    'anonymous token issued': () => typeof token === 'string' && token.length > 20
  })) { fail('anonymous signup', auth); return; }

  // 3. Submit one vote to actual staging Edge Function with official test token.
  // Staging Edge Secret TURNSTILE_SECRET_KEY must be Cloudflare TEST secret,
  // TURNSTILE_EXPECTED_HOSTNAME must be localhost.
  const deviceId = `nadanu-staging-k6-${__VU}-${__ITER}-${session.user?.id || 'device'}`;
  const payload = JSON.stringify({
    contestant_id: finalistId,
    device_id: deviceId,
    turnstile_token: 'XXXX.DUMMY.TOKEN.XXXX'
  });
  const params = {
    headers: headers(token),
    timeout: '20s',
    tags: {step: 'cast_vote'}
  };
  const vote = http.post(`${url}/functions/v1/cast-vote`, payload, params);
  voteTime.add(vote.timings.duration);
  if (!check(vote, {
    'vote accepted HTTP 200': r => r.status === 200,
    'vote success confirmed': r => json(r)?.ok === true
  })) { fail('vote', vote); return; }
  voteSuccess.add(1);
  sleep(0.2);

  // 4. Submit the SAME identity+device again: must reject with 409.
  // Expected rejection is NOT a failure of the voting system.
  const duplicate = http.post(`${url}/functions/v1/cast-vote`, payload, {
    ...params,
    tags: {step: 'duplicate_vote'}
  });
  if (check(duplicate, {
    'duplicate blocked HTTP 409': r => r.status === 409
  })) duplicateSuccess.add(1);
  else fail('duplicate protection', duplicate);
}
