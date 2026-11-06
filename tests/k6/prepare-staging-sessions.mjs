// STAGING-ONLY: Prepare a small pool of anonymous sessions at a controlled pace.
// Never create accounts in the production project. Stored tokens are sensitive.
import { createClient } from '@supabase/supabase-js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const ref = process.env.STAGING_PROJECT_REF || '';
const url = process.env.STAGING_SUPABASE_URL || '';
const key = process.env.STAGING_PUBLISHABLE_KEY || '';
const count = Number(process.env.PREPARE_SESSIONS || 5);
const prod = 'xgaibywmetlficnnataf';
if (process.env.CONFIRM_STAGING_ONLY !== 'YES' ||
    !/^[a-z0-9]{20}$/.test(ref) || ref === prod ||
    url !== `https://${ref}.supabase.co` ||
    !key.startsWith('sb_publishable_') ||
    !Number.isInteger(count) || count < 1 || count > 10) {
  throw new Error('STAGING SAFETY STOP. Check STAGING_PROJECT_REF, URL, publishable key, CONFIRM_STAGING_ONLY=YES, PREPARE_SESSIONS=1..10.');
}
const output = resolve('tests/k6/.local/staging-sessions.json');
await mkdir(dirname(output), {recursive:true});
let sessions = [];
try {
  sessions = JSON.parse(await readFile(output,'utf8')).sessions || [];
} catch {}
if (sessions.length && sessions.some(s=>s.project_ref !== ref)) {
  throw new Error('Existing local sessions belong to a different staging project.');
}
const client = createClient(url,key,{
  auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
});
for(let i=0;i<count;i++){
  try {
    const {data,error} = await client.auth.signInAnonymously();
    if(error){
      console.error(`Stopped on Auth error (${error.status ?? 'unknown'}): ${error.message}`);
      break; // Respect rate limits. Do not retry 429.
    }
    if (!data.session?.access_token || !data.user?.is_anonymous) throw Error('Anonymous session missing');
    sessions.push({
      project_ref:ref,
      user_id:data.user.id,
      access_token:data.session.access_token,
      expires_at:data.session.expires_at,
      device_id:`nadanu-stage-device-${data.user.id}`,
    });
    await writeFile(output,JSON.stringify({project_ref:ref,sessions},null,2),{mode:0o600});
    console.log(`Prepared ${i+1}/${count} new staging sessions; total stored: ${sessions.length}`);
    if(i<count-1) await new Promise(done=>setTimeout(done,2500));
  }catch(e){ console.error(String(e));break; }
}
console.log(`Staging sessions file created locally. Never commit: ${output}`);
console.log('Tokens expire. If expired, create fresh sessions within official Auth limits.');
