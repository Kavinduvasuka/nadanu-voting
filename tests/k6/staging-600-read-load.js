// NADANU 3.0 - STAGING ONLY 500-600 concurrent read load (not full voting).
// No authentication signups, no votes; ramps gradually, stops on sustained errors.
// Staging reference must match expected project, never the production project.
import http from 'k6/http';
import { check, sleep } from 'k6';

const ref = __ENV.STAGING_PROJECT_REF || '';
const url = (__ENV.STAGING_SUPABASE_URL || '').replace(/\/$/, '');
const key = __ENV.STAGING_PUBLISHABLE_KEY || '';
const peak = Number(__ENV.PEAK_VUS || 500);

if (
  __ENV.CONFIRM_STAGING_ONLY !== 'YES' ||
  ref !== 'gyssokbrcnatbusojodj' ||
  url !== `https://${ref}.supabase.co` ||
  !key.startsWith('sb_publishable_') ||
  ![500,600].includes(peak)
) {
  throw Error('SAFETY STOP: only the dedicated Nadanu staging project and PEAK_VUS=500 or 600 are permitted.');
}

export const options = {
  discardResponseBodies: false,
  scenarios: {
    gradual_read_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 50 },
        { duration: '20s', target: 100 },
        { duration: '20s', target: 250 },
        { duration: '20s', target: 500 },
        { duration: '30s', target: peak },
        { duration: '20s', target: 0 }
      ],
      gracefulRampDown: '5s',
      gracefulStop: '5s'
    }
  },
  thresholds: {
    http_req_failed: [{ threshold: 'rate<0.02', abortOnFail: true, delayAbortEval: '20s' }],
    http_req_duration: [{ threshold: 'p(95)<3000', abortOnFail: true, delayAbortEval: '20s' }],
    checks: [{ threshold: 'rate>0.98', abortOnFail: true, delayAbortEval: '20s' }]
  }
};

export default function () {
  const res = http.post(`${url}/rest/v1/rpc/public_voting_bootstrap`, '{}', {
    headers: {
      apikey: key,
      'Content-Type': 'application/json'
    },
    timeout: '8s',
    tags: { operation: 'read_only_staging_bootstrap' }
  });
  check(res, {
    'status 200': r => r.status === 200,
    'valid JSON bootstrap': r => {
      if (r.status !== 200) return false;
      try {
        const v = r.json();
        return Array.isArray(v.categories) &&
          Array.isArray(v.contestants) &&
          typeof v.event === 'object';
      } catch { return false; }
    }
  });
  sleep(6); // approximately up to 100 RPS at 600 VUs, depending on latency.
}
