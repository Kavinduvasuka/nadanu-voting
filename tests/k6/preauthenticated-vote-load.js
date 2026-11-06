// STAGING-ONLY k6: exercise actual vote inserts using pre-created anonymous sessions.
// This deliberately does NOT call /auth/v1/signup in the measured load stage.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Counter, Trend } from 'k6/metrics';

const ref = __ENV.STAGING_PROJECT_REF || '';
const url = __ENV.STAGING_SUPABASE_URL || '';
const key = __ENV.STAGING_PUBLISHABLE_KEY || '';
const contestant = __ENV.STAGING_CONTESTANT_ID || '';
const vus = Number(__ENV.TEST_VUS || 5);
const now = Math.floor(Date.now()/1000);
const sessions = new SharedArray('staging sessions', () => {
  const d=JSON.parse(open('./.local/staging-sessions.json'));
  return d.sessions || [];
});
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
if (__ENV.CONFIRM_STAGING_ONLY !== 'YES' ||
    !/^[a-z0-9]{20}$/.test(ref) ||
    ref === 'xgaibywmetlficnnataf' ||
    url !== `https://${ref}.supabase.co` ||
    !key.startsWith('sb_publishable_') ||
    !uuid.test(contestant) ||
    !Number.isInteger(vus) || vus<1 || vus>20 ||
    vus>sessions.length ||
    sessions.some(s => s.project_ref !== ref || !s.access_token || s.expires_at <= now+30) ||
    new Set(sessions.map(s => s.user_id)).size !== sessions.length) {
  throw new Error('SAFETY STOP: staging config, expired sessions, or insufficient unique sessions. Test VUs must be <= prepared sessions and <=20.');
}
const successful = new Counter('successful_new_votes');
const duplicates = new Counter('correct_duplicate_rejections');
const votingLatency = new Trend('voting_latency_ms', true);
const timingAuth = new Trend('server_auth_ms', true);
const timingTurnstile = new Trend('server_turnstile_ms', true);
const timingAtomic = new Trend('server_atomic_vote_ms', true);
const timingTotal = new Trend('server_total_ms', true);
const timingMetrics = {auth:timingAuth,turnstile:timingTurnstile,atomic_vote:timingAtomic,total:timingTotal};

function captureTimings(res) {
  const value = res.headers['Server-Timing'] || res.headers['server-timing'] || '';
  for (const match of String(value).matchAll(/([a-z_]+);dur=([0-9.]+)/g)) {
    const metric = timingMetrics[match[1]];
    const ms = Number(match[2]);
    if (metric && Number.isFinite(ms)) metric.add(ms);
  }
}

export const options={
  scenarios:{
    vote_once_per_user: {executor:'per-vu-iterations',vus,iterations:1,maxDuration:'2m'}
  },
  thresholds:{checks:['rate>0.95'],http_req_failed:['rate<0.01'],voting_latency_ms:['p(95)<3000']}
};

function data(res){try{return res.json()}catch{return {}}}
export default function(){
  const session=sessions[__VU-1];
  const body=JSON.stringify({
    contestant_id:contestant,
    device_id:session.device_id,
    turnstile_token:'XXXX.DUMMY.TOKEN.XXXX'
  });
  const params={
    headers:{
      apikey:key, Authorization:`Bearer ${session.access_token}`,
      Origin:'http://localhost:5173','Content-Type':'application/json'
    },
    timeout:'20s',
    tags:{step:'cast_vote'}
  };
  const res=http.post(`${url}/functions/v1/cast-vote`,body,params);
  votingLatency.add(res.timings.duration);
  captureTimings(res);
  const ok=check(res,{
    'new vote HTTP 200':r=>r.status===200,
    'new vote recorded':r=>data(r)?.ok===true
  });
  if (!ok) {
    console.error(`Vote failed for VU ${__VU}: HTTP ${res.status}, ${String(res.body||'').slice(0,180)}`);
    return;
  }
  successful.add(1);
  sleep(0.1);
  const second=http.post(`${url}/functions/v1/cast-vote`,body,{
    ...params,
    tags:{step:'duplicate_vote'},
    responseCallback:http.expectedStatuses(409)
  });
  if(check(second,{'same voter blocked with 409':r=>r.status===409}))duplicates.add(1);
}
