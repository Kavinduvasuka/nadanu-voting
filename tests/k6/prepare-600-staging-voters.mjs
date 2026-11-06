// Prepare up to 600 unique real anonymous voter sessions in the DEDICATED staging project.
// Uses the ordinary public signInAnonymously() flow; DOES NOT bypass Auth or security.
// Requires explicitly approved staging rate-limit capacity. Do not run on production.
// Run near the load test: default JWT access tokens may expire within an hour.
import { createClient } from '@supabase/supabase-js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const REF='gyssokbrcnatbusojodj';
const ref=process.env.STAGING_PROJECT_REF;
const url=process.env.STAGING_SUPABASE_URL;
const key=process.env.STAGING_PUBLISHABLE_KEY||'';
const target=Number(process.env.PREPARE_TARGET||'50');
const delay=Number(process.env.PREPARE_DELAY_MS||'300');
const file=resolve('tests/k6/.local/staging-600-sessions.json');
if(process.env.CONFIRM_STAGING_ONLY!=='YES' ||
   process.env.CONFIRM_LARGE_STAGING_SIGNUPS!=='YES' ||
   ref!==REF || url!==`https://${REF}.supabase.co` ||
   !key.startsWith('sb_publishable_') ||
   !Number.isInteger(target)||target<1||target>600 ||
   !Number.isInteger(delay)||delay<250||delay>10000) {
  throw Error('SAFETY STOP: verify staging project, two confirmations, PREPARE_TARGET 1..600, delay >=250ms.');
}
await mkdir(dirname(file),{recursive:true});
let sessions=[];
try {
  const saved=JSON.parse(await readFile(file,'utf8'));
  if(saved.project_ref!==REF || !Array.isArray(saved.sessions)) throw Error('Wrong staging session file');
  sessions=saved.sessions;
}catch(err){
  if(err?.code!=='ENOENT')throw err;
}
if(sessions.length>target)throw Error('Existing session count already exceeds target; do not overwrite the local record.');
if(sessions.some(s=>s.project_ref!==REF) || new Set(sessions.map(s=>s.user_id)).size!==sessions.length){
  throw Error('Invalid or duplicate saved staging sessions');
}
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
console.log(`Staging preparation only. Existing ${sessions.length}; target ${target}; adding ${target-sessions.length}.`);
for(let i=sessions.length;i<target;i++){
  const {data,error}=await client.auth.signInAnonymously();
  if(error){
    console.error(`Stopped at ${sessions.length}/${target}: HTTP ${error.status??'?'} - ${error.message}. DO NOT repeatedly retry rate limits.`);
    break;
  }
  if(!data.user?.is_anonymous || !data.session?.access_token || !data.session?.expires_at)throw Error('Invalid anonymous session');
  sessions.push({
    project_ref:REF,user_id:data.user.id,access_token:data.session.access_token,
    expires_at:data.session.expires_at,device_id:`nadanu-stage-voter-${data.user.id}`
  });
  await writeFile(file,JSON.stringify({project_ref:REF,sessions},null,2),{mode:0o600});
  if(sessions.length%25===0 || sessions.length===target)console.log(`Prepared ${sessions.length}/${target}`);
  if(i<target-1)await new Promise(resolve=>setTimeout(resolve,delay));
}
console.log(`Prepared ${sessions.length} real staging anonymous sessions. Keep private. Never commit ${file}`);
