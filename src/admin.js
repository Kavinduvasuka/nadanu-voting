
import {
  supabase,
  configured,
  logo,
  footer,
  safe,
  setNotice
} from './shared.js';

const root = document.getElementById('app');

root.innerHTML = `
<div class="site-noise"></div>

<header class="topbar">
  <div class="wrap topbar-inner">
    ${logo()}
    <nav>
      <a href="./index.html">← BACK TO VOTING</a>
      <span class="admin-pill">ORGANIZER CONTROL ROOM</span>
    </nav>
  </div>
</header>

<main class="wrap admin-main">
  <div class="tiny-label">
    OFFICIAL NADANU 3.0 / BACKSTAGE
  </div>

  <h1 class="admin-title">CONTROL <em>ROOM.</em></h1>
  <div id="notice" class="notice" hidden></div>

  <section id="login" class="admin-panel narrow">
    <h2>AUTHORIZED ACCESS</h2>
    <p>Sign in using the organizer account created in Supabase Authentication.</p>

    <form id="login-form">
      <label>
        EMAIL
        <input type="email" id="email"
          autocomplete="username" required
          placeholder="organizer@example.com"/>
      </label>

      <label>
        PASSWORD
        <input type="password" id="password"
          autocomplete="current-password"
          required minlength="6"/>
      </label>

      <button class="btn btn-orange" type="submit">
        SIGN IN ↗
      </button>
    </form>
  </section>

  <section id="dashboard" hidden>
    <div class="dash-top">
      <div>
        <h2>THE LINEUP</h2>
        <p>Manage finalists, event status, and voting window.</p>
      </div>

      <button class="btn btn-outline" id="logout">
        SIGN OUT ↗
      </button>
    </div>

    <div class="admin-columns">
      <div class="admin-panel">
        <div class="tiny-label">VOTING CONTROL</div>

        <form id="event-form">
          <label>
            EVENT STATUS
            <select id="event-status">
              <option value="draft">DRAFT — NOT OPEN</option>
              <option value="open">OPEN FOR VOTING</option>
              <option value="closed">CLOSED</option>
            </select>
          </label>

          <label>
            START DATE & TIME (OPTIONAL)
            <input id="starts-at" type="datetime-local"/>
          </label>

          <label>
            END DATE & TIME (OPTIONAL)
            <input id="ends-at" type="datetime-local"/>
          </label>

          <button class="btn btn-orange" type="submit"
            id="save-status">
            SAVE VOTING STATUS
          </button>
        </form>
      </div>

      <div class="admin-panel">
        <div class="tiny-label">ADD A FINALIST</div>

        <form id="contestant-form">
          <label>
            CATEGORY
            <select id="category" required></select>
          </label>

          <label>
            PERFORMER / TEAM NAME
            <input id="name" required maxlength="120"
              placeholder="e.g. The Fire Crew"/>
          </label>

          <label>
            STAGE NAME / SUBTITLE
            <input id="stage-name" maxlength="140"
              placeholder="e.g. Grand Finale Act"/>
          </label>

          <label>
            PERFORMANCE TITLE
            <input id="performance-title" maxlength="160"
              placeholder="e.g. Showstopper"/>
          </label>

          <label>
            PHOTO URL (OPTIONAL)
            <input id="image-url" type="url"
              placeholder="https://..."/>
          </label>

          <label>
            DISPLAY ORDER
            <input id="sort-order" type="number"
              min="0" value="1" required/>
          </label>

          <button class="btn btn-orange" type="submit">
            ADD FINALIST ↗
          </button>
        </form>
      </div>
    </div>

    <div class="admin-panel">
      <div class="tiny-label">ACTIVE FINALISTS</div>
      <div id="finalists" class="finalist-list"></div>
    </div>

    <div class="admin-panel" id="edit-panel" hidden>
      <div class="tiny-label">EDIT FINALIST</div>
      <form id="edit-form">
        <input id="edit-id" type="hidden"/>
        <label>CATEGORY<select id="edit-category" required></select></label>
        <label>PERFORMER / TEAM NAME<input id="edit-name" maxlength="120" required/></label>
        <label>STAGE NAME / SUBTITLE<input id="edit-stage-name" maxlength="140"/></label>
        <label>PERFORMANCE TITLE<input id="edit-performance-title" maxlength="160"/></label>
        <label>PHOTO URL<input id="edit-image-url" type="url"/></label>
        <label>DISPLAY ORDER<input id="edit-sort-order" type="number" min="0" required/></label>
        <button class="btn btn-orange" type="submit">SAVE CHANGES</button>
        <button class="btn btn-outline" id="cancel-edit" type="button">CANCEL</button>
      </form>
    </div>
    <div class="admin-panel">
      <div class="tiny-label">VOTE RESULTS</div>
      <p>
        Vote counts are restricted to authorized administrators
        and are not shown on the public voting page.
      </p>
      <div id="results" class="results-list"></div>

      <button class="btn btn-outline" id="refresh">
        REFRESH RESULTS ↻
      </button>
    </div>
    <div class="admin-panel">
      <div class="tiny-label">VOTER DEVICE RECORDS</div>
      <p>These device references are anonymous hashes, not phone names. Select a vote using its finalist, timestamp and reference. Resetting ONE vote requires admin credentials and is audited.</p>
      <button class="btn btn-outline" id="load-votes" type="button" aria-expanded="false" aria-controls="voter-records">VIEW VOTED DEVICES</button>
      <div id="voter-records" class="finalist-list" hidden></div>
      <form id="reset-form" hidden>
        <input id="reset-vote-id" type="hidden"/>
        <p id="reset-selection"></p>
        <label>ADMIN EMAIL<input id="reset-email" type="email" required autocomplete="username"/></label>
        <label>ADMIN PASSWORD<input id="reset-password" type="password" required autocomplete="current-password"/></label>
        <button class="btn btn-orange" id="confirm-reset" type="submit">VERIFY ADMIN & RESET SELECTED VOTE</button>
        <button class="btn btn-outline" id="cancel-reset" type="button">CANCEL</button>
      </form>
    </div>
  </section>
</main>

${footer()}
`;

// ========================================
// HELPERS
// ========================================

let contestantCache = [];
let voteCache = [];
function showDash(on) {
  document.getElementById('login').hidden = on;
  document.getElementById('dashboard').hidden = !on;
}

function value(id) {
  return document.getElementById(id).value.trim();
}

function toLocal(ts) {
  if (!ts) return '';

  const d = new Date(ts);
  const p = n => String(n).padStart(2, '0');

  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ========================================
// ADMIN AUTHORIZATION
// ========================================

async function authorized() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user || data.user.is_anonymous) {
    return false;
  }

  const { data: role, error: roleError } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (roleError) throw roleError;

  return !!role;
}

// ========================================
// LOAD DASHBOARD DATA
// ========================================

async function load() {
  const [
    { data: cats, error: ce },
    { data: contestants, error: te },
    { data: event, error: ee }
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('id,slug,name')
      .order('name'),

    supabase
      .from('contestants')
      .select(
        'id,name,stage_name,performance_title,' +
        'image_url,sort_order,active,category_id'
      )
      .order('sort_order'),

    supabase
      .from('voting_events')
      .select('id,status,starts_at,ends_at')
      .eq('id', 1)
      .maybeSingle()
  ]);

  if (ce || te || ee) throw ce || te || ee;

  if (!event) {
    throw new Error(
      'Voting event not found. Check voting_events table.'
    );
  }

  contestantCache = contestants || [];
  document.getElementById("edit-category").innerHTML = (cats || []).map(c => `<option value="${safe(c.id)}">${safe(c.name)}</option>`).join("");
  const byId = new Map(
    (cats || []).map(c => [c.id, c.name])
  );

  // Categories
  document.getElementById('category').innerHTML =
    (cats || []).map(c =>
      `<option value="${safe(c.id)}">${safe(c.name)}</option>`
    ).join('');

  // Load the actual database status.
  document.getElementById('event-status').value =
    event.status;

  document.getElementById('starts-at').value =
    toLocal(event.starts_at);

  document.getElementById('ends-at').value =
    toLocal(event.ends_at);

  // Finalists
  document.getElementById('finalists').innerHTML =
    contestants?.length
      ? contestants.map(c => `
        <div class="finalist-row">
          <div>
            <strong>${safe(c.name)}</strong>
            <small>
              ${safe(byId.get(c.category_id) || '')}
              · ${safe(c.stage_name || '')}
            </small>
          </div>

          <div class="finalist-actions">
            <button data-edit="${safe(c.id)}" class="small-btn">EDIT</button>
            <button
              data-toggle="${safe(c.id)}"
              data-state="${c.active}"
              class="small-btn">
              ${c.active ? 'HIDE' : 'SHOW'}
            </button>

            <button
              data-delete="${safe(c.id)}"
              class="small-btn danger">
              DELETE
            </button>
          </div>
        </div>
      `).join('')
      : '<p>No finalists yet. Add one using the form above.</p>';

  // Vote results
  const { data: counts, error: re } =
    await supabase.rpc('admin_vote_results');

  if (re) {
    document.getElementById('results').textContent =
      'Results unavailable: ' + re.message;
  } else {
    document.getElementById('results').innerHTML =
      counts?.length
        ? counts.map(x => `
          <div class="result-row">
            <span>${safe(x.name)}</span>
            <strong>${Number(x.vote_count) || 0} VOTES</strong>
          </div>
        `).join('')
        : '<p>No votes yet.</p>';
  }
}

// ========================================
// AUTHENTICATION & ADMIN ACTIONS
// ========================================

if (!configured) {
  setNotice(
    'Supabase is not configured. Check your environment settings.',
    'error'
  );

  document.querySelector(
    '#login-form button'
  ).disabled = true;

} else {

  // ADMIN LOGIN
  document.getElementById('login-form').onsubmit =
    async e => {
      e.preventDefault();

      const { error } =
        await supabase.auth.signInWithPassword({
          email: value('email'),
          password: value('password')
        });

      if (error) {
        setNotice(error.message, 'error');
        return;
      }

      try {
        if (!(await authorized())) {
          await supabase.auth.signOut();
          setNotice(
            'This user is not an authorized Nadanu organizer.',
            'error'
          );
          return;
        }

        showDash(true);
        await load();

      } catch (err) {
        setNotice(err.message, 'error');
      }
    };

  // ADMIN LOGOUT
  document.getElementById('logout').onclick =
    async () => {
      await supabase.auth.signOut();
      showDash(false);
      setNotice('Signed out.');
    };

  // ========================================
  // FIXED VOTING STATUS UPDATE
  // ========================================

  document.getElementById('event-form').onsubmit =
    async e => {
      e.preventDefault();

      const newStatus = value('event-status');
      const start = value('starts-at');
      const end = value('ends-at');

      const button = document.getElementById('save-status');

      if (!['draft', 'open', 'closed'].includes(newStatus)) {
        setNotice('Invalid voting status.', 'error');
        return;
      }

      if (
        start &&
        end &&
        new Date(end) <= new Date(start)
      ) {
        setNotice(
          'End date must be later than start date.',
          'error'
        );
        return;
      }

      button.disabled = true;
      button.textContent = 'SAVING STATUS…';

      try {
        // Verify that admin login is valid.
        if (!(await authorized())) {
          throw new Error(
            'Admin session expired. Please log in again.'
          );
        }

        // Update the event and request the updated row.
        const { data, error } = await supabase
          .from('voting_events')
          .update({
            status: newStatus,
            starts_at: start
              ? new Date(start).toISOString()
              : null,
            ends_at: end
              ? new Date(end).toISOString()
              : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', 1)
          .select('id,status,starts_at,ends_at')
          .maybeSingle();

        if (error) throw error;

        // No matching row may mean RLS blocked the update.
        if (!data) {
          throw new Error(
            'Status was not saved. Check Supabase admin permissions and RLS policies.'
          );
        }

        if (data.status !== newStatus) {
          throw new Error(
            'Saved status does not match the selected status.'
          );
        }

        // Reload directly from Supabase.
        await load();

        if (
          value('event-status') !== newStatus
        ) {
          throw new Error(
            'Database status changed unexpectedly. Please reload.'
          );
        }

        setNotice(
          `VOTING STATUS UPDATED TO ${newStatus.toUpperCase()}.`,
          'success'
        );

      } catch (err) {
        setNotice(
          'Failed to save voting status: ' + err.message,
          'error'
        );

      } finally {
        button.disabled = false;
        button.textContent = 'SAVE VOTING STATUS';
      }
    };

  // ========================================
  // ADD FINALIST
  // ========================================

  document.getElementById('contestant-form').onsubmit =
    async e => {
      e.preventDefault();

      try {
        if (!(await authorized())) {
          throw new Error('Admin session expired.');
        }

        const { error } = await supabase
          .from('contestants')
          .insert({
            category_id: value('category'),
            name: value('name'),
            stage_name: value('stage-name'),
            performance_title: value('performance-title'),
            image_url: value('image-url') || null,
            sort_order: Number(value('sort-order')),
            active: true
          });

        if (error) throw error;

        e.target.reset();
        await load();
        setNotice('Finalist added.', 'success');

      } catch (err) {
        setNotice(err.message, 'error');
      }
    };

  // ========================================
  // FINALIST ACTIONS
  // ========================================

  document.getElementById('finalists').onclick =
    async e => {
      const t = e.target.closest(
        '[data-edit],[data-delete],[data-toggle]'
      );

      if (!t) return;
      if (t.dataset.edit) {
        const c = contestantCache.find(x => x.id === t.dataset.edit);
        if (!c) return;
        const fields = {
          'edit-id': c.id, 'edit-category': c.category_id,
          'edit-name': c.name, 'edit-stage-name': c.stage_name || '',
          'edit-performance-title': c.performance_title || '',
          'edit-image-url': c.image_url || '', 'edit-sort-order': c.sort_order
        };
        for (const [id,v] of Object.entries(fields)) document.getElementById(id).value = v;
        document.getElementById('edit-panel').hidden = false;
        document.getElementById('edit-panel').scrollIntoView({behavior:'smooth'});
        return;
      }

      try {
        if (!(await authorized())) {
          throw new Error('Admin session expired.');
        }

        let error;

        if (t.dataset.delete) {
          if (!confirm(
            'Delete this finalist? Existing votes may also be deleted.'
          )) return;

          ({ error } = await supabase
            .from('contestants')
            .delete()
            .eq('id', t.dataset.delete));

        } else {
          ({ error } = await supabase
            .from('contestants')
            .update({
              active: t.dataset.state !== 'true'
            })
            .eq('id', t.dataset.toggle));
        }

        if (error) throw error;

        await load();
        setNotice('Finalist updated.', 'success');

      } catch (err) {
        setNotice(err.message, 'error');
      }
    };


  // Edit a finalist without deleting its votes.
  document.getElementById('cancel-edit').onclick = () => {
    document.getElementById('edit-panel').hidden = true;
  };
  document.getElementById('edit-form').onsubmit = async e => {
    e.preventDefault();
    try {
      if (!await authorized()) throw Error('Admin session expired. Sign in again.');
      const {data,error} = await supabase.from('contestants').update({
        category_id:value('edit-category'), name:value('edit-name'),
        stage_name:value('edit-stage-name'), performance_title:value('edit-performance-title'),
        image_url:value('edit-image-url')||null, sort_order:Number(value('edit-sort-order'))
      }).eq('id',value('edit-id')).select('id').maybeSingle();
      if(error)throw error;
      if(!data)throw Error('Finalist was not updated. Check admin access.');
      document.getElementById('edit-panel').hidden=true;
      await load();setNotice('Finalist updated successfully.','success');
    } catch(err){setNotice(err.message,'error');}
  };

  async function refreshVoterRecords(){
    if(!await authorized())throw Error('Admin session expired.');
    const {data,error}=await supabase.rpc('admin_list_voter_records');
    if(error)throw error;
    voteCache=data||[];
    document.getElementById('voter-records').innerHTML=voteCache.length
      ?voteCache.map(v=>`<div class="finalist-row"><div><strong>${safe(v.finalist_name)}</strong><small>${safe(new Date(v.voted_at).toLocaleString())} · Device ref: ${safe(v.device_reference)}</small></div><button class="small-btn danger" type="button" data-reset="${safe(v.vote_id)}">RESET VOTE</button></div>`).join('')
      :'<p>No votes recorded.</p>';
  }
  document.getElementById('load-votes').onclick=async()=>{
    const btn=document.getElementById('load-votes');
    const list=document.getElementById('voter-records');
    const form=document.getElementById('reset-form');
    if(!list.hidden){
      list.hidden=true;
      form.hidden=true;
      document.getElementById('reset-password').value='';
      btn.textContent='VIEW VOTED DEVICES';
      btn.setAttribute('aria-expanded','false');
      return;
    }
    btn.disabled=true;
    btn.textContent='LOADING DEVICES…';
    try{
      await refreshVoterRecords();
      list.hidden=false;
      btn.textContent='HIDE VOTED DEVICES';
      btn.setAttribute('aria-expanded','true');
    }catch(err){
      list.hidden=true;
      btn.textContent='VIEW VOTED DEVICES';
      setNotice(err.message,'error');
    }finally{btn.disabled=false;}
  };
  document.getElementById('voter-records').onclick=e=>{
    const b=e.target.closest('[data-reset]');if(!b)return;
    const v=voteCache.find(x=>x.vote_id===b.dataset.reset);if(!v)return;
    document.getElementById('reset-vote-id').value=v.vote_id;
    document.getElementById('reset-selection').textContent='Selected: '+v.finalist_name+' · '+new Date(v.voted_at).toLocaleString()+' · '+v.device_reference;
    document.getElementById('reset-password').value='';
    document.getElementById('reset-form').hidden=false;
  };
  document.getElementById('cancel-reset').onclick=()=>{
    document.getElementById('reset-password').value='';
    document.getElementById('reset-form').hidden=true;
  };
  document.getElementById('reset-form').onsubmit=async e=>{
    e.preventDefault();
    const vote_id=value('reset-vote-id');
    if(!voteCache.some(v=>v.vote_id===vote_id)){setNotice('Invalid selected vote.','error');return;}
    if(!confirm('Permanently reset only the selected vote? This allows the browser/session to vote again and is audit logged.'))return;
    const btn=document.getElementById('confirm-reset');btn.disabled=true;
    try{
      if(!await authorized())throw Error('Admin session expired.');
      const {data,error}=await supabase.functions.invoke('admin-reset-vote',{body:{vote_id,email:value('reset-email'),password:value('reset-password')}});
      if(error){let msg=error.message;try{msg=(await error.context?.json())?.error||msg;}catch{}throw Error(msg);}
      if(!data?.ok)throw Error(data?.error||'Reset was not confirmed.');
      document.getElementById('reset-form').hidden=true;
      await load();await refreshVoterRecords();
      setNotice('Selected vote reset. Audit log updated.','success');
    }catch(err){setNotice('Vote reset failed: '+err.message,'error');}
    finally{btn.disabled=false;document.getElementById('reset-password').value='';}
  };

  // ========================================
  // REFRESH RESULTS
  // ========================================

  document.getElementById('refresh').onclick =
    () => load().catch(
      err => setNotice(err.message, 'error')
    );

  // ========================================
  // RESTORE ADMIN SESSION
  // ========================================

  authorized()
    .then(async yes => {
      if (yes) {
        showDash(true);
        await load();
      }
    })
    .catch(err => {
      setNotice(err.message, 'error');
    });
}
