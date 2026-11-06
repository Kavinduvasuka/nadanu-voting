
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
  </section>
</main>

${footer()}
`;

// ========================================
// HELPERS
// ========================================

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
        'sort_order,active,category_id'
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
        '[data-delete],[data-toggle]'
      );

      if (!t) return;

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
