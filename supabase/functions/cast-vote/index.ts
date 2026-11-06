import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL=Deno.env.get('SUPABASE_URL')||'';
const SERVICE_KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const HASH_SECRET=Deno.env.get('VOTING_HASH_SECRET')||'';
const TURNSTILE_SECRET=Deno.env.get('TURNSTILE_SECRET_KEY')||'';
// Comma separated exact origins, e.g. https://example.github.io,http://localhost:5173
const allowedOrigins=(Deno.env.get('ALLOWED_ORIGINS')||'').split(',').map(x=>x.trim()).filter(Boolean);
const expectedHostname=(Deno.env.get('TURNSTILE_EXPECTED_HOSTNAME')||'').trim();
function response(data:unknown,status:number,origin:string){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','access-control-allow-origin':origin,'vary':'Origin','access-control-allow-headers':'authorization, x-client-info, apikey, content-type','access-control-allow-methods':'POST, OPTIONS'}})}
async function shaHmac(value:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(HASH_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);const sig=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value));return Array.from(new Uint8Array(sig)).map(x=>x.toString(16).padStart(2,'0')).join('')}
Deno.serve(async (req)=>{
  const origin=req.headers.get('origin')||'';
  const okOrigin=allowedOrigins.includes(origin);
  if(!okOrigin)return response({error:'This website origin is not authorized to vote.'},403,'null');
  if(req.method==='OPTIONS')return response({},200,origin);
  if(req.method!=='POST')return response({error:'Method not allowed'},405,origin);
  if(!SUPABASE_URL||!SERVICE_KEY||HASH_SECRET.length<32||!TURNSTILE_SECRET||!expectedHostname)return response({error:'Voting backend security settings are incomplete.'},503,origin);
  try{
    const bearer=req.headers.get('authorization')||'';
    if(!bearer.startsWith('Bearer '))return response({error:'Voting session required'},401,origin);
    const admin=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false}});
    const {data:{user},error:authError}=await admin.auth.getUser(bearer.slice(7));
    if(authError||!user||!user.is_anonymous)return response({error:'A valid anonymous voter session is required.'},401,origin);
    const body=await req.json();
    if(typeof body.contestant_id!=='string'||!/^[0-9a-f-]{36}$/i.test(body.contestant_id))return response({error:'Invalid finalist'},400,origin);
    if(typeof body.device_id!=='string'||body.device_id.length<20||body.device_id.length>200)return response({error:'Invalid browser identifier'},400,origin);
    if(typeof body.turnstile_token!=='string'||!body.turnstile_token)return response({error:'Security check missing'},400,origin);
    // Always verify Turnstile on the server and confirm the expected hostname.
    const fd=new FormData();fd.set('secret',TURNSTILE_SECRET);fd.set('response',body.turnstile_token);
    const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:fd});
    const checked=await verify.json();
    if(!checked.success||checked.hostname!==expectedHostname)return response({error:'Security check failed. Please retry.'},403,origin);
    // Independent read-only validations can run concurrently to reduce vote latency.
    // Both results are still verified on the server before inserting any vote.
    const [{data:event,error:eventErr},{data:cont,error:contErr}]=await Promise.all([
      admin.from('voting_events').select('status,starts_at,ends_at').eq('id',1).single(),
      admin.from('contestants').select('id,active').eq('id',body.contestant_id).maybeSingle()
    ]);
    if(eventErr||!event||event.status!=='open'||(event.starts_at&&new Date(event.starts_at)>new Date())||(event.ends_at&&new Date(event.ends_at)<=new Date()))return response({error:'Voting is not open.'},403,origin);
    if(contErr||!cont||!cont.active)return response({error:'This finalist is not available for voting.'},400,origin);
    const device_hash=await shaHmac(body.device_id);
    const {error:voteErr}=await admin.from('votes').insert({contestant_id:cont.id,voter_id:user.id,device_hash});
    if(voteErr){if(voteErr.code==='23505')return response({error:'A vote has already been recorded for this browser/session.'},409,origin);return response({error:'Vote could not be recorded. Please contact organizers.'},500,origin);}
    return response({ok:true,message:'Vote recorded successfully'},200,origin);
  }catch(err){console.error(err);return response({error:'Unable to process vote.'},500,origin)}
});
