import { a as supabase, c as configured, C as CATS, p as placeholders, l as logo, f as footer, b as safe, s as setNotice, t as turnstileSiteKey, g as getBrowserToken } from './shared-C4YcSOgO.js';
const VOTED_CATEGORIES_KEY = 'nadanu_voted_categories_v1';
const LEGACY_VOTE_FLAG_KEY = 'nadanu_vote_cast';
const VALID_CATEGORY_ID = /^[0-9a-f-]{36}$/i;
let votedCategories = new Set();
try {
  const cached = JSON.parse(localStorage.getItem(VOTED_CATEGORIES_KEY) || '[]');
  if (Array.isArray(cached)) votedCategories = new Set(cached.filter(id => typeof id === 'string' && VALID_CATEGORY_ID.test(id)));
} catch {}
const hasVotedIn = categoryId => votedCategories.has(categoryId);
function applyVotedCategories(ids, message = '') {
  const next = new Set(ids.filter(id => typeof id === 'string' && VALID_CATEGORY_ID.test(id)));
  const changed = [...next].some(id => !votedCategories.has(id)) || [...votedCategories].some(id => !next.has(id));
  votedCategories = next;
  localStorage.setItem(VOTED_CATEGORIES_KEY, JSON.stringify([...votedCategories]));
  localStorage.removeItem(LEGACY_VOTE_FLAG_KEY);
  if (changed) render();
  updateVoteStatusButton();
  if (message) setNotice(message, 'success');
}
function markCategoryVoted(categoryId) {
  applyVotedCategories([...votedCategories, categoryId],
    'VOTE RECORDED FOR THIS CATEGORY. OTHER CATEGORIES ARE STILL AVAILABLE.');
}
window.addEventListener('storage', e => {
  if (e.key === VOTED_CATEGORIES_KEY) {
    try {
      const ids = JSON.parse(e.newValue || '[]');
      if (Array.isArray(ids)) {
        votedCategories = new Set(ids.filter(id => typeof id === 'string' && VALID_CATEGORY_ID.test(id)));
        render();
      }
    } catch {}
  }
});
let checkingVoteStatus = false;
async function syncVoteStatus() {
  if (!configured || !supabase || checkingVoteStatus) return;
  checkingVoteStatus = true;
  updateVoteStatusButton();
  try {
    let { data: sessionInfo, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionInfo.session && (votedCategories.size || localStorage.getItem(LEGACY_VOTE_FLAG_KEY) === '1')) {
      const { error: loginError } = await supabase.auth.signInAnonymously();
      if (loginError) throw loginError;
      ({ data: sessionInfo, error: sessionError } = await supabase.auth.getSession());
      if (sessionError) throw sessionError;
    }
    if (!sessionInfo.session) return;
    const { data, error } = await supabase.functions.invoke('vote-status', {
      body: { device_id: getBrowserToken() }
    });
    if (error || !Array.isArray(data?.voted_categories)) {
      throw new Error('Could not check voting status.');
    }
    const previous = new Set(votedCategories);
    applyVotedCategories(data.voted_categories);
    if ([...previous].some(id => !votedCategories.has(id))) {
      setNotice('AN ORGANIZER RESET YOUR VOTE. YOU MAY VOTE AGAIN IN THAT CATEGORY.', 'success');
    }
  } catch {
    if (votedCategories.size) setNotice('COULD NOT VERIFY CATEGORY VOTE STATUS. REFRESH TO RETRY.', 'error');
  } finally {
    checkingVoteStatus = false;
    updateVoteStatusButton();
  }
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) void syncVoteStatus();
});
function updateVoteStatusButton() {
  const button = document.getElementById('recheck-vote');
  if (!button) return;
  button.hidden = !votedCategories.size && localStorage.getItem(LEGACY_VOTE_FLAG_KEY) !== '1';
  button.disabled = checkingVoteStatus;
  button.textContent = checkingVoteStatus ? 'CHECKING VOTE STATUS…' : 'REFRESH VOTING STATUS ↻';
}
let selected = 'all', contestants = [], votingEvent=null, busy=false, turnstileToken=null, widgetId=null;
const app=document.getElementById('app');
app.innerHTML=`<div class="concert-atmosphere" aria-hidden="true"><div class="light-beam beam-left"></div><div class="light-beam beam-right"></div><div class="ambient-orb orb-one"></div><div class="ambient-orb orb-two"></div><div class="retro-grid"></div><div class="music-sparks"></div></div><div class="site-noise"></div><header class="topbar"><div class="wrap topbar-inner">${logo()}<nav><a class="nav-active" href="#performers">THE FINALISTS</a><a href="#how">HOW TO VOTE</a></nav><button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu">☰</button></div></header>
<main><section class="mini-hero" aria-label="Nadanu People's Choice"><div class="wrap mini-hero-inner"><div class="mini-hero-copy"><span class="mini-hero-kicker">NADANU 3.0 · GRAND FINALE 2026</span><h1>PEOPLE'S <em>CHOICE.</em></h1><p>Feel the Beat. Own the Stage. Your vote decides.</p></div><a class="mini-hero-link" href="#performers">EXPLORE FINALISTS <span aria-hidden="true">↗</span></a></div></section><section class="main-vote wrap" id="performers"><div class="section-heading"><div><div class="tiny-label">✦ THE MAIN EVENT / 2026</div><h2>MAKE YOUR <em>MARK.</em></h2><p>Pick your favorite act. Every vote counts.</p></div><div class="vote-status" id="vote-status"><span class="live-dot"></span> CHECKING VOTING STATUS</div></div><div id="notice" class="notice" hidden></div><button class="btn btn-outline" type="button" id="recheck-vote" hidden>REFRESH VOTING STATUS ↻</button><div class="filters" id="filters"><button class="filter active" data-cat="all">ALL PERFORMERS <small>↗</small></button>${CATS.map(c=>`<button class="filter" data-cat="${c.slug}">${c.name} <small>${c.num}</small></button>`).join('')}</div><div class="cards" id="cards"></div><div class="voting-foot"><span>⚡ ONE VOTE PER CATEGORY • UP TO THREE VOTES</span><span>VOTING IS SUBJECT TO VERIFICATION.</span></div></section>
<section class="how" id="how"><div class="wrap how-grid"><div><div class="tiny-label">HOW TO TAKE PART</div><h2>THREE CATEGORIES.<br/><em>YOUR CHOICE.</em></h2><p>No registration form. No long process. Just a few simple steps to support your favorite performer.</p></div><div class="steps"><div class="step"><b>01</b><div><h3>EXPLORE THE FINALISTS</h3><p>Browse all three categories and find your favorite performance.</p></div></div><div class="step"><b>02</b><div><h3>CHOOSE YOUR ONE FAVORITE</h3><p>You can vote for one finalist in each category.</p></div></div><div class="step"><b>03</b><div><h3>CONFIRM YOUR VOTE</h3><p>Pass the security check and cast your vote. You cannot change it afterward.</p></div></div></div></div></section><section class="end-banner"><div class="wrap"><span>DARE TO DAZZLE</span><h2>THE STAGE IS THEIRS.<br/><em>THE CHOICE IS YOURS.</em></h2></div></section></main>${footer()}
<dialog class="vote-modal" id="vote-modal"><button class="modal-x" id="close-modal" aria-label="Close">✕</button><div class="tiny-label">✦ OFFICIAL PEOPLE'S CHOICE VOTE</div><h2>MAKE IT <em>COUNT.</em></h2><p id="modal-desc"></p><p class="warn">You may vote once per category. Your choice in this category is final.</p><div id="turnstile" class="turnstile"></div><button class="btn btn-orange modal-submit" id="submit-vote">CONFIRM MY VOTE ↗</button><p class="modal-feedback" id="modal-feedback" role="status"></p></dialog>`;

function status(){const el=document.getElementById('vote-status');let label='PREVIEW MODE';let cls='closed';if(configured){if(votingEvent?.status==='open' && (!votingEvent.starts_at || new Date(votingEvent.starts_at)<=new Date()) && (!votingEvent.ends_at || new Date(votingEvent.ends_at)>new Date())){label='VOTING OPEN';cls='open'}else if(votingEvent?.status==='closed'){label='VOTING CLOSED'}else label='VOTING NOT OPEN';}el.className=`vote-status ${cls}`;el.innerHTML=`<span class="live-dot"></span> ${label}`;}
function cardMarkup(c,i){const cat=CATS.find(x=>x.slug===c.category_slug);let categoryVoted = hasVotedIn(c.category_id);let disabled= categoryVoted || !configured || !votingEvent || votingEvent.status!=='open' || (votingEvent.starts_at && new Date(votingEvent.starts_at)>new Date()) || (votingEvent.ends_at && new Date(votingEvent.ends_at)<new Date()) || c.demo;
return `<article class="performer-card"><div class="card-art ${cat?.slug||''}">${c.image_url?`<img src="${safe(c.image_url)}" alt="Photo of ${safe(c.name)}" loading="lazy" onerror="this.remove()"/>`: `<div class="art-letter">${cat?.symbol||'★'}</div>`}<div class="card-corner">${safe(cat?.name||'FINALIST')}</div><div class="card-index">#${String(c.sort_order||i+1).padStart(2,'0')}</div><div class="art-mark">N<span>3.0</span></div></div><div class="card-info"><span class="card-label">THE FINALISTS / ${safe(cat?.num||'00')}</span><h3>${safe(c.name)}</h3><p class="card-stage">${safe(c.stage_name||c.performance_title||cat?.sub||'')}</p><div class="card-bottom"><span>${safe(c.performance_title||cat?.name||'NADANU 3.0')}</span><button class="vote-button" data-vote="${safe(c.id)}" ${disabled?'disabled':''}>${categoryVoted?'ALREADY VOTED':disabled?'NOT OPEN YET':'VOTE NOW'} <span>↗</span></button></div></div></article>`}
function render(){updateVoteStatusButton();const data=selected==='all'?contestants:contestants.filter(c=>c.category_slug===selected);document.getElementById('cards').innerHTML=data.length?data.map(cardMarkup).join(''):'<div class="empty">NO FINALISTS ADDED TO THIS CATEGORY YET.<br/><small>ORGANIZERS WILL ADD THEM SOON.</small></div>';status()}
document.getElementById('recheck-vote').addEventListener('click', () => { void syncVoteStatus(); });
document.getElementById('filters').addEventListener('click',e=>{const btn=e.target.closest('[data-cat]');if(!btn)return;selected=btn.dataset.cat;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===btn));render()});
document.getElementById('cards').addEventListener('click',e=>{const btn=e.target.closest('[data-vote]');if(!btn||btn.disabled)return;const c=contestants.find(x=>x.id===btn.dataset.vote);if(c)openVote(c)});
document.getElementById('menu-toggle').onclick=()=>document.querySelector('nav').classList.toggle('open');
let candidate=null;
function openVote(c){if(hasVotedIn(c.category_id)){setNotice('ALREADY VOTED IN THIS CATEGORY. CHOOSE ANOTHER CATEGORY.', 'success');return;}candidate=c;turnstileToken=null;document.getElementById('modal-feedback').textContent='';document.getElementById('modal-desc').innerHTML=`You are voting for <strong>${safe(c.name)}</strong>.`;const target=document.getElementById('turnstile');target.innerHTML='';widgetId=null;if(turnstileSiteKey && !/REPLACE|YOUR_/i.test(turnstileSiteKey)){if(window.turnstile){widgetId=window.turnstile.render(target,{sitekey:turnstileSiteKey,callback:t=>turnstileToken=t,'expired-callback':()=>turnstileToken=null})}else target.textContent='Security widget is loading. Please close and retry.';}else target.textContent='Turnstile is not configured yet. Voting is not available.';document.getElementById('vote-modal').showModal();}
document.getElementById('close-modal').onclick=()=>document.getElementById('vote-modal').close();
document.getElementById('vote-modal').addEventListener('close',()=>{if(widgetId!==null&&window.turnstile)try{window.turnstile.remove(widgetId)}catch{}widgetId=null});
// A public vote must use an anonymous Supabase Auth identity, never the organizer login.
// This retains the original browser/device identifier and does not bypass any server checks.
async function ensureAnonymousVoter() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(`Could not read voting session: ${sessionError.message}`);

  if (sessionData.session) {
    // Use the cached session only to decide whether to create an anonymous identity.
    // The cast-vote Edge Function independently validates the access token with
    // Supabase Auth on EVERY submission. This avoids a redundant client network call.
    if (sessionData.session.user?.is_anonymous === true) {
      return;
    }

    // Admin accounts cannot submit an anonymous vote.
    // This signs out the admin on this browser; use a separate browser profile for admin.
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
    if (signOutError) throw new Error(`Could not switch to anonymous voting: ${signOutError.message}`);
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw new Error(`Anonymous sign-in failed: ${error.message}`);
  if (!data.user?.is_anonymous || !data.session?.access_token) {
    throw new Error('Anonymous voting session could not be created. Check Supabase anonymous sign-ins.');
  }
}

async function functionErrorMessage(error, data) {
  if (data?.error) return data.error;
  // Supabase FunctionsHttpError provides the response body via context.
  if (error?.context?.json) {
    try {
      const body = await error.context.json();
      if (body?.error) return body.error;
      if (body?.message) return body.message;
    } catch { /* Use the generic error below. */ }
  }
  return error?.message || 'Vote was not accepted';
}

document.getElementById('submit-vote').onclick = async () => {
  if (busy || !candidate || hasVotedIn(candidate.category_id)) return;
  const out = document.getElementById('modal-feedback');
  if (!configured || !supabase) {
    out.textContent = 'Supabase is not configured.';
    return;
  }
  if (!turnstileToken) {
    out.textContent = 'Please complete the security check first.';
    return;
  }

  busy = true;
  const btn = document.getElementById('submit-vote');
  btn.disabled = true;
  btn.textContent = 'CASTING YOUR VOTE…';
  out.textContent = '';

  try {
    await ensureAnonymousVoter();

    const { data, error } = await supabase.functions.invoke('cast-vote', {
      body: {
        contestant_id: candidate.id,
        device_id: getBrowserToken(),
        turnstile_token: turnstileToken
      }
    });

    if (error) throw new Error(await functionErrorMessage(error, data));
    if (data?.error) throw new Error(data.error);

    markCategoryVoted(candidate.category_id);
    document.getElementById('vote-modal').close();
    setNotice('YOUR VOTE IS IN! THANK YOU FOR SUPPORTING NADANU 3.0.', 'success');
  } catch (err) {
    const message = err?.message || 'Unable to cast vote. Please try again.';
    if (/already been recorded|already voted|duplicate/i.test(message)) {
      markCategoryVoted(candidate.category_id);
      document.getElementById('vote-modal').close();
      return;
    }
    out.textContent = message;
    if (window.turnstile && widgetId !== null) {
      try { window.turnstile.reset(widgetId); } catch { /* Widget may already be gone. */ }
    }
    turnstileToken = null;
  } finally {
    busy = false;
    btn.disabled = false;
    btn.textContent = 'CONFIRM MY VOTE ↗';
  }
};
// Cache only public, non-sensitive finalist/status metadata for a short window.
// Backend cast-vote always checks the real event state and never trusts this cache.
const BOOT_CACHE_KEY = 'nadanu_public_bootstrap_v2';
const BOOT_CACHE_MS = 15000;
function renderBootstrap(payload){
  const cats = payload?.categories || [];
  const entries = payload?.contestants || [];
  const byId = new Map(cats.map(x=>[x.id,x.slug]));
  contestants = entries.map(x=>({...x,category_slug:byId.get(x.category_id)}));
  votingEvent = payload?.event || null;
  if(!contestants.length)setNotice('THE STAGE IS BEING SET. FINALISTS WILL APPEAR HERE ONCE ADDED BY THE ORGANIZERS.');
  if(votingEvent?.status!=='open')setNotice('VOTING IS NOT OPEN YET. EXPLORE THE FINALISTS BELOW.');
  render();
  if (votedCategories.size) setNotice('YOU HAVE ALREADY VOTED IN SELECTED CATEGORIES. OTHERS ARE STILL AVAILABLE.', 'success');
}
async function loadBootstrap(){
  // New RPC fetches categories, active contestants and event status in one HTTP request.
  const {data,error}=await supabase.rpc('public_voting_bootstrap');
  if(!error && data && Array.isArray(data.categories) && Array.isArray(data.contestants))return data;
  // Compatibility path until the migration has been applied in Supabase.
  const [{data:cats,error:ce},{data:entries,error:ee},{data:events,error:ve}]=await Promise.all([
    supabase.from('categories').select('id,slug,name'),
    supabase.from('contestants').select('id,name,stage_name,performance_title,image_url,sort_order,category_id').eq('active',true).order('sort_order'),
    supabase.from('voting_events').select('id,status,starts_at,ends_at').eq('id',1).maybeSingle()
  ]);
  if(ce||ee||ve)throw ce||ee||ve;
  return {categories:cats||[],contestants:entries||[],event:events};
}
async function boot(){
  if(!configured){
    contestants=placeholders;
    setNotice('DESIGN PREVIEW — Connect Supabase to load real finalists. No demo votes are recorded.');
    render();return;
  }
  try{
    let cached=null;
    try{
      const item=JSON.parse(sessionStorage.getItem(BOOT_CACHE_KEY)||'null');
      if(item && Date.now()-item.at < BOOT_CACHE_MS && item.payload)cached=item.payload;
    }catch{}
    if(cached){renderBootstrap(cached);void syncVoteStatus();return;}
    const payload=await loadBootstrap();
    renderBootstrap(payload);
    void syncVoteStatus();
    try{sessionStorage.setItem(BOOT_CACHE_KEY,JSON.stringify({at:Date.now(),payload}));}catch{}
  }catch(err){
    contestants=[];render();
    setNotice(`COULD NOT LOAD FINALISTS: ${err.message}. Please refresh to try again.`,'error');
  }
}
const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.defer=true;document.head.appendChild(script);
boot();
