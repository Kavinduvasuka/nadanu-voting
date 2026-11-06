// Real vote INSERT load, against ONLY the isolated Nadanu staging Supabase project.
// Every VU uses one unique REAL anonymous Supabase session, real JWT verification,
// staging Cloudflare Turnstile test secret and the original cast-vote Edge Function.
// Warning: All prepared sessions used by the test will cast their one permitted vote.
import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';
import { Counter, Trend } from 'k6/metrics';

const REF='gyssokbrcnatbusojodj';
const ref=__ENV.STAGING_PROJECT_REF;
const url=__ENV.STAGING_SUPABASE_URL;
const key=__ENV.STAGING_PUBLISHABLE_KEY||'';
const contestant=__ENV.STAGING_CONTESTANT_ID||'';
const vus=Number(__ENV.TEST_VUS||0);
const sessions=new SharedArray('private staging voters',()=>{
  const payload=JSON.parse(open('./.local/staging-600-sessions.json'));
  if(payload.project_ref!==REF)throw Error('Wrong staging sessions file');
  return payload.sessions;
});
const now=Math.floor(Date.now()/1000);
if (__ENV.CONFIRM_STAGING_ONLY!=='YES' ||
    __ENV.CONFIRM_ACTUAL_STAGING_VOTES!=='YES' ||
    ref!==REF || url!==`https://${REF}.supabase.co` ||
    !key.startsWith('sb_publishable_') ||
    !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(contestant) ||
    !Number.isInteger(vus)||vus<1||vus>600||vus>sessions.length ||
    sessions.some((s,i)=>i<vus && (s.project_ref!==REF ||
      !s.access_token || !s.device_id || s.expires_at<=now+300)) ||
    new Set(sessions.slice(0,vus).map(s=>s.user_id)).size!==vus) {
  throw Error('SAFETY STOP: staging confirmations, required 5-minute token lifetime, unique voters, or VU count invalid.');
}
export const options={
  scenarios:{
    concurrent_real_staging_votes:{
      executor:'per-vu-iterations', vus,iterations:1,maxDuration:'2m',
      gracefulStop:'10s'
    }
  },
  thresholds:{
    checks:['rate>0.98'],
    http_req_failed:['rate<0.02'],
    vote_insert_latency_ms:['p(95)<3000']
  }
};
const inserted=new Counter('staging_votes_inserted');
const failed=new Counter('staging_votes_failed');
const voteLatency=new Trend('vote_insert_latency_ms',true);

export default function(){
  const session=sessions[__VU-1];
  const res=http.post(`${url}/functions/v1/cast-vote`,JSON.stringify({
    contestant_id:contestant,
    device_id:session.device_id,
    turnstile_token:'XXXX.DUMMY.TOKEN.XXXX'
  }),{
    headers:{
      apikey:key,
      Authorization:`Bearer ${session.access_token}`,
      Origin:'http://localhost:5173',
      'Content-Type':'application/json'
    },
    timeout:'25s',
    tags:{name:'staging_actual_vote'}
  });
  voteLatency.add(res.timings.duration);
  let valid=false;
  if(res.status===200) {
    try{valid=res.json('ok')===true;}catch{}
  }
  check(res,{'HTTP 200 and vote recorded':()=>valid});
  if(valid)inserted.add(1);
  else{
    failed.add(1);
    // Never log tokens, passwords or other session data.
    console.error(`Vote VU ${__VU} failed: HTTP ${res.status}; ${String(res.body||'').slice(0,150)}`);
  }
}
