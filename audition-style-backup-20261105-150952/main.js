
import {
  supabase,
  configured,
  CATS,
  placeholders,
  logo,
  footer,
  safe,
  setNotice,
  turnstileSiteKey,
  getBrowserToken
} from './shared.js';

let selected = 'all';
let contestants = [];
let votingEvent = null;
let busy = false;
let turnstileToken = null;
let widgetId = null;
let candidate = null;

const app = document.getElementById('app');

app.innerHTML = `
<div class="site-noise"></div>

<header class="topbar">
  <div class="wrap topbar-inner">
    ${logo()}

    <nav>
      <a class="nav-active" href="#performers">THE FINALISTS</a>
      <a href="#how">HOW TO VOTE</a>
      
    </nav>

    <button
      class="menu-toggle"
      id="menu-toggle"
      aria-label="Toggle menu"
    >â˜°</button>
  </div>
</header>

<main>
  <section class="hero">
    <div class="wrap hero-grid">

      <div class="hero-copy">
        <div class="eyebrow">
          <span class="live-dot"></span>
          NADANU 3.0 â€¢ THE GRAND FINALE
        </div>

        <div class="hero-title">
          <span class="title-top">YOUR VOTE.</span>
          <span class="title-main">
            THEIR <em>STAGE.</em>
          </span>
        </div>

        <p class="hero-body">
          One night. Limitless talent. The power is in your hands.
          Vote for the performer who deserves the
          <b>PEOPLE'S CHOICE</b> crown.
        </p>

        <div class="hero-actions">
          <a class="btn btn-orange" href="#performers">
            VOTE FOR YOUR FAVORITE <span>â†—</span>
          </a>

          <a class="btn btn-outline" href="#how">
            HOW IT WORKS â†“
          </a>
        </div>

        <div class="hero-mini">
          <span>âœ¦ SOLO SINGING</span>
          <span>âœ³ SOLO DANCING</span>
          <span>â˜… GROUP DANCING</span>
        </div>
      </div>

      <div class="hero-art" aria-hidden="true">
        <div class="poster-outline"></div>

        <div class="poster-halo">
          <span>ONE<br/>VOTE</span>
        </div>

        <div class="poster-rays">âœº</div>

        <div class="poster-ticket">
          PEOPLE'S<br/>CHOICE <b>2026</b>
        </div>

        <div class="poster-stamp">
          ICBT<br/>COMPUTING<br/>SOCIETY
        </div>

        <div class="poster-cut">
          FEEL THE BEAT â€¢ OWN THE STAGE
        </div>
      </div>
    </div>

    <div class="ticker">
      <div>
        PEOPLE'S CHOICE AWARD <span>â˜…</span>
        YOUR VOICE DECIDES THE WINNER <span>â˜…</span>
        NADANU 3.0 GRAND FINALE <span>â˜…</span>
        PEOPLE'S CHOICE AWARD <span>â˜…</span>
      </div>
    </div>
  </section>

  <section class="main-vote wrap" id="performers">
    <div class="section-heading">
      <div>
        <div class="tiny-label">
          âœ¦ THE MAIN EVENT / 2026
        </div>

        <h2>MAKE YOUR <em>MARK.</em></h2>
        <p>Pick your favorite act. Every vote counts.</p>
      </div>

      <div class="vote-status" id="vote-status">
        <span class="live-dot"></span>
        CHECKING VOTING STATUS
      </div>
    </div>

    <div id="notice" class="notice" hidden></div>

    <div class="filters" id="filters">
      <button class="filter active" data-cat="all">
        ALL PERFORMERS <small>â†—</small>
      </button>

      ${CATS.map(c => `
        <button class="filter" data-cat="${c.slug}">
          ${c.name} <small>${c.num}</small>
        </button>
      `).join('')}
    </div>

    <div class="cards" id="cards"></div>

    <div class="voting-foot">
      <span>âš¡ ONE VOTE TOTAL ACROSS ALL CATEGORIES</span>
      <span>VOTING IS SUBJECT TO VERIFICATION.</span>
    </div>
  </section>

  <section class="how" id="how">
    <div class="wrap how-grid">
      <div>
        <div class="tiny-label">HOW TO TAKE PART</div>

        <h2>
          ONE VOTE.<br/>
          <em>BIG IMPACT.</em>
        </h2>

        <p>
          No registration form. No long process.
          Just a few simple steps to support your favorite performer.
        </p>
      </div>

      <div class="steps">
        <div class="step">
          <b>01</b>
          <div>
            <h3>EXPLORE THE FINALISTS</h3>
            <p>
              Browse all three categories and find your
              favorite performance.
            </p>
          </div>
        </div>

        <div class="step">
          <b>02</b>
          <div>
            <h3>CHOOSE YOUR ONE FAVORITE</h3>
            <p>
              You get one vote total,
              not one vote per category.
            </p>
          </div>
        </div>

        <div class="step">
          <b>03</b>
          <div>
            <h3>CONFIRM YOUR VOTE</h3>
            <p>
              Pass the security check and cast your vote.
              You cannot change it afterward.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="end-banner">
    <div class="wrap">
      <span>DARE TO DAZZLE</span>

      <h2>
        THE STAGE IS THEIRS.<br/>
        <em>THE CHOICE IS YOURS.</em>
      </h2>
    </div>
  </section>
</main>

${footer()}

<dialog class="vote-modal" id="vote-modal">
  <button
    class="modal-x"
    id="close-modal"
    aria-label="Close"
  >âœ•</button>

  <div class="tiny-label">
    âœ¦ OFFICIAL PEOPLE'S CHOICE VOTE
  </div>

  <h2>MAKE IT <em>COUNT.</em></h2>

  <p id="modal-desc"></p>

  <p class="warn">
    You may cast only one vote total.
    This choice is final.
  </p>

  <div id="turnstile" class="turnstile"></div>

  <button
    class="btn btn-orange modal-submit"
    id="submit-vote"
  >
    CONFIRM MY VOTE â†—
  </button>

  <p
    class="modal-feedback"
    id="modal-feedback"
    role="status"
  ></p>
</dialog>
`;

// ========================================
// VOTING STATUS
// ========================================

function status() {
  const el = document.getElementById('vote-status');

  let label = 'PREVIEW MODE';
  let cls = 'closed';

  if (configured) {
    const now = new Date();

    const started =
      !votingEvent?.starts_at ||
      new Date(votingEvent.starts_at) <= now;

    const notEnded =
      !votingEvent?.ends_at ||
      new Date(votingEvent.ends_at) > now;

    if (
      votingEvent?.status === 'open' &&
      started &&
      notEnded
    ) {
      label = 'VOTING OPEN';
      cls = 'open';
    } else if (votingEvent?.status === 'closed') {
      label = 'VOTING CLOSED';
    } else {
      label = 'VOTING NOT OPEN';
    }
  }

  el.className = `vote-status ${cls}`;
  el.innerHTML = `
    <span class="live-dot"></span>
    ${label}
  `;
}

// ========================================
// CONTESTANT CARDS
// ========================================

function cardMarkup(c, i) {
  const cat = CATS.find(x => x.slug === c.category_slug);

  const now = new Date();

  const disabled =
    !configured ||
    !votingEvent ||
    votingEvent.status !== 'open' ||
    (
      votingEvent.starts_at &&
      new Date(votingEvent.starts_at) > now
    ) ||
    (
      votingEvent.ends_at &&
      new Date(votingEvent.ends_at) <= now
    ) ||
    c.demo;

  return `
    <article class="performer-card">

      <div class="card-art ${cat?.slug || ''}">
        ${
          c.image_url
            ? `<img
                src="${safe(c.image_url)}"
                alt="Photo of ${safe(c.name)}"
                loading="lazy"
                onerror="this.remove()"
              />`
            : `<div class="art-letter">
                ${cat?.symbol || 'â˜…'}
              </div>`
        }

        <div class="card-corner">
          ${safe(cat?.name || 'FINALIST')}
        </div>

        <div class="card-index">
          #${String(c.sort_order || i + 1).padStart(2, '0')}
        </div>

        <div class="art-mark">
          N<span>3.0</span>
        </div>
      </div>

      <div class="card-info">
        <span class="card-label">
          THE FINALISTS / ${safe(cat?.num || '00')}
        </span>

        <h3>${safe(c.name)}</h3>

        <p class="card-stage">
          ${safe(
            c.stage_name ||
            c.performance_title ||
            cat?.sub ||
            ''
          )}
        </p>

        <div class="card-bottom">
          <span>
            ${safe(
              c.performance_title ||
              cat?.name ||
              'NADANU 3.0'
            )}
          </span>

          <button
            class="vote-button"
            data-vote="${safe(c.id)}"
            ${disabled ? 'disabled' : ''}
          >
            ${disabled ? 'NOT OPEN YET' : 'VOTE NOW'}
            <span>â†—</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

// ========================================
// RENDER CONTESTANTS
// ========================================

function render() {
  const data =
    selected === 'all'
      ? contestants
      : contestants.filter(
          c => c.category_slug === selected
        );

  document.getElementById('cards').innerHTML =
    data.length
      ? data.map(cardMarkup).join('')
      : `
        <div class="empty">
          NO FINALISTS ADDED TO THIS CATEGORY YET.
          <br/>
          <small>
            ORGANIZERS WILL ADD THEM SOON.
          </small>
        </div>
      `;

  status();
}

// ========================================
// CATEGORY FILTERS
// ========================================

document
  .getElementById('filters')
  .addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');

    if (!btn) return;

    selected = btn.dataset.cat;

    document.querySelectorAll('.filter').forEach(x => {
      x.classList.toggle('active', x === btn);
    });

    render();
  });

// ========================================
// SELECT CONTESTANT
// ========================================

document
  .getElementById('cards')
  .addEventListener('click', e => {
    const btn = e.target.closest('[data-vote]');

    if (!btn || btn.disabled) return;

    const c = contestants.find(
      x => x.id === btn.dataset.vote
    );

    if (c) openVote(c);
  });

// ========================================
// MOBILE MENU
// ========================================

document.getElementById('menu-toggle').onclick = () => {
  document.querySelector('nav').classList.toggle('open');
};

// ========================================
// OPEN VOTING MODAL
// ========================================

function openVote(c) {
  candidate = c;
  turnstileToken = null;

  document.getElementById('modal-feedback').textContent = '';

  document.getElementById('modal-desc').innerHTML = `
    You are voting for
    <strong>${safe(c.name)}</strong>.
  `;

  const target = document.getElementById('turnstile');

  target.innerHTML = '';
  widgetId = null;

  if (
    turnstileSiteKey &&
    !/REPLACE|YOUR_/i.test(turnstileSiteKey)
  ) {
    if (window.turnstile) {
      widgetId = window.turnstile.render(target, {
        sitekey: turnstileSiteKey,

        callback: token => {
          turnstileToken = token;
        },

        'expired-callback': () => {
          turnstileToken = null;
        },

        'error-callback': () => {
          turnstileToken = null;
          document.getElementById(
            'modal-feedback'
          ).textContent =
            'Security verification failed. Please try again.';
        }
      });
    } else {
      target.textContent =
        'Security widget is loading. Please close and retry.';
    }
  } else {
    target.textContent =
      'Turnstile is not configured yet. Voting is not available.';
  }

  document.getElementById('vote-modal').showModal();
}

// ========================================
// CLOSE VOTING MODAL
// ========================================

document.getElementById('close-modal').onclick = () => {
  document.getElementById('vote-modal').close();
};

document
  .getElementById('vote-modal')
  .addEventListener('close', () => {
    if (widgetId !== null && window.turnstile) {
      try {
        window.turnstile.remove(widgetId);
      } catch (err) {
        console.warn('Turnstile cleanup:', err);
      }
    }

    widgetId = null;
    turnstileToken = null;
  });

// ========================================
// FIX: ANONYMOUS VOTER AUTHENTICATION
// ========================================

// A public vote must use an anonymous
// Supabase Auth user, not an admin account.

async function ensureAnonymousVoter() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  // Read any existing session.
  const {
    data: sessionData,
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(
      `Could not read voting session: ${sessionError.message}`
    );
  }

  if (sessionData.session) {
    // Validate the session with Supabase Auth.
    const {
      data: userData,
      error: userError
    } = await supabase.auth.getUser();

    // Reuse an existing valid anonymous session.
    if (
      !userError &&
      userData.user?.is_anonymous === true
    ) {
      return userData.user;
    }

    // If this is an admin session or an invalid
    // session, switch to anonymous authentication.
    //
    // This may sign out the admin on this browser.
    // Use a separate browser profile for organizers.
    const { error: signOutError } =
      await supabase.auth.signOut({
        scope: 'local'
      });

    if (signOutError) {
      throw new Error(
        `Could not switch to anonymous voting: ${signOutError.message}`
      );
    }
  }

  // Create a fresh anonymous Supabase session.
  const {
    data,
    error
  } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(
      `Anonymous sign-in failed: ${error.message}`
    );
  }

  if (
    !data.user?.is_anonymous ||
    !data.session?.access_token
  ) {
    throw new Error(
      'Anonymous voting session could not be created. ' +
      'Check Supabase anonymous sign-ins.'
    );
  }

  return data.user;
}

// ========================================
// GET EDGE FUNCTION ERROR DETAILS
// ========================================

async function functionErrorMessage(error, data) {
  if (data?.error) {
    return data.error;
  }

  // Supabase FunctionsHttpError exposes
  // the HTTP response through error.context.
  if (error?.context?.json) {
    try {
      const body = await error.context.json();

      if (body?.error) return body.error;
      if (body?.message) return body.message;
    } catch {
      // Use the general error message.
    }
  }

  return error?.message || 'Vote was not accepted';
}

// ========================================
// SUBMIT VOTE
// ========================================

document.getElementById('submit-vote').onclick =
  async () => {
    if (busy || !candidate) return;

    const out = document.getElementById(
      'modal-feedback'
    );

    if (!configured || !supabase) {
      out.textContent =
        'Supabase is not configured.';
      return;
    }

    if (!turnstileToken) {
      out.textContent =
        'Please complete the security check first.';
      return;
    }

    busy = true;

    const btn = document.getElementById(
      'submit-vote'
    );

    btn.disabled = true;
    btn.textContent = 'CASTING YOUR VOTEâ€¦';
    out.textContent = '';

    try {
      // FIX: Ensure this browser is authenticated
      // as an anonymous voter before submitting.
      await ensureAnonymousVoter();

      // Submit through the secure Edge Function.
      // The function must enforce authentication,
      // Turnstile and duplicate-vote restrictions.
      const {
        data,
        error
      } = await supabase.functions.invoke(
        'cast-vote',
        {
          body: {
            contestant_id: candidate.id,
            device_id: getBrowserToken(),
            turnstile_token: turnstileToken
          }
        }
      );

      if (error) {
        throw new Error(
          await functionErrorMessage(error, data)
        );
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Store only a local success indicator.
      // Real duplicate protection remains server-side.
      localStorage.setItem(
        'nadanu_vote_cast',
        '1'
      );

      document
        .getElementById('vote-modal')
        .close();

      setNotice(
        'YOUR VOTE IS IN! THANK YOU FOR SUPPORTING NADANU 3.0.',
        'success'
      );

    } catch (err) {
      out.textContent =
        err?.message ||
        'Unable to cast vote. Please try again.';

      // Reset Turnstile after an unsuccessful
      // attempt, so the next request uses a new token.
      if (
        window.turnstile &&
        widgetId !== null
      ) {
        try {
          window.turnstile.reset(widgetId);
        } catch {
          // Widget might have been removed.
        }
      }

      turnstileToken = null;

    } finally {
      busy = false;
      btn.disabled = false;
      btn.textContent = 'CONFIRM MY VOTE â†—';
    }
  };

// ========================================
// LOAD FINALISTS FROM SUPABASE
// ========================================

async function boot() {
  if (!configured) {
    contestants = placeholders;

    setNotice(
      'DESIGN PREVIEW â€” Connect Supabase to load real finalists. ' +
      'No demo votes are recorded.'
    );

    render();
    return;
  }

  try {
    const [
      { data: cats, error: ce },
      { data: entries, error: ee },
      { data: events, error: ve }
    ] = await Promise.all([
      supabase
        .from('categories')
        .select('id,slug,name'),

      supabase
        .from('contestants')
        .select(
          'id,name,stage_name,performance_title,' +
          'image_url,sort_order,category_id'
        )
        .eq('active', true)
        .order('sort_order'),

      supabase
        .from('voting_events')
        .select('id,status,starts_at,ends_at')
        .eq('id', 1)
        .maybeSingle()
    ]);

    if (ce || ee || ve) {
      throw ce || ee || ve;
    }

    const byId = new Map(
      (cats || []).map(x => [x.id, x.slug])
    );

    contestants = (entries || []).map(x => ({
      ...x,
      category_slug: byId.get(x.category_id)
    }));

    votingEvent = events;

    if (!contestants.length) {
      setNotice(
        'THE STAGE IS BEING SET. FINALISTS WILL APPEAR ' +
        'HERE ONCE ADDED BY THE ORGANIZERS.'
      );
    }

    if (votingEvent?.status !== 'open') {
      setNotice(
        'VOTING IS NOT OPEN YET. ' +
        'EXPLORE THE FINALISTS BELOW.'
      );
    }

    render();

  } catch (err) {
    contestants = [];

    render();

    setNotice(
      `COULD NOT LOAD FINALISTS: ${err.message}. ` +
      'Check database migration, API and RLS policies.',
      'error'
    );
  }
}

// ========================================
// LOAD CLOUDFLARE TURNSTILE
// ========================================

const script = document.createElement('script');

script.src =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

script.async = true;
script.defer = true;

document.head.appendChild(script);

// ========================================
// START WEBSITE
// ========================================

boot();

