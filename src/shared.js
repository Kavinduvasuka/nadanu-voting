
import { createClient } from '@supabase/supabase-js';
import './style.css';
import './audition-theme.css';

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const url = (
  import.meta.env.VITE_SUPABASE_URL || ''
).trim();

const key = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
).trim();

export const turnstileSiteKey = (
  import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
).trim();

export const configured =
  /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url) &&
  (
    /^sb_publishable_[A-Za-z0-9_-]+$/.test(key) ||
    /^eyJ[A-Za-z0-9._-]+$/.test(key)
  ) &&
  !/REPLACE|YOUR_/i.test(url + key);

export const supabase = configured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
  : null;

// ==========================================
// VOTING CATEGORIES
// ==========================================

export const CATS = [
  {
    slug: 'solo-singing',
    name: 'SOLO SINGING',
    num: '01',
    symbol: '✦',
    sub: 'The voices that move us'
  },
  {
    slug: 'solo-dancing',
    name: 'SOLO DANCING',
    num: '02',
    symbol: '✳',
    sub: 'One dancer. All the energy.'
  },
  {
    slug: 'group-dancing',
    name: 'GROUP DANCING',
    num: '03',
    symbol: '★',
    sub: 'One crew. One stage. All in.'
  }
];

// ==========================================
// DEMO FINALISTS
// ==========================================

export const placeholders = [
  {
    id: 'demo1',
    category_slug: 'solo-singing',
    name: 'THE NEXT VOICE',
    stage_name: 'SOLO SINGING FINALIST',
    performance_title: 'Your finalist goes here',
    sort_order: 1,
    demo: true
  },
  {
    id: 'demo2',
    category_slug: 'solo-singing',
    name: 'THE SPOTLIGHT',
    stage_name: 'SOLO SINGING FINALIST',
    performance_title: 'Your finalist goes here',
    sort_order: 2,
    demo: true
  },
  {
    id: 'demo3',
    category_slug: 'solo-dancing',
    name: 'THE SOLO ACT',
    stage_name: 'SOLO DANCING FINALIST',
    performance_title: 'Your finalist goes here',
    sort_order: 1,
    demo: true
  },
  {
    id: 'demo4',
    category_slug: 'solo-dancing',
    name: 'THE SHOWSTOPPER',
    stage_name: 'SOLO DANCING FINALIST',
    performance_title: 'Your finalist goes here',
    sort_order: 2,
    demo: true
  },
  {
    id: 'demo5',
    category_slug: 'group-dancing',
    name: 'THE MOVEMENT',
    stage_name: 'GROUP DANCING FINALIST',
    performance_title: 'Your finalist goes here',
    sort_order: 1,
    demo: true
  },
  {
    id: 'demo6',
    category_slug: 'group-dancing',
    name: 'THE CREW',
    stage_name: 'GROUP DANCING FINALIST',
    performance_title: 'Your finalist goes here',
    sort_order: 2,
    demo: true
  }
];

// ==========================================
// SAFE HTML TEXT
// ==========================================

export function safe(str = '') {
  return String(str ?? '').replace(
    /[&<>"']/g,
    c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c])
  );
}

// ==========================================
// OFFICIAL NADANU 3.0 HEADER
// ==========================================

export function logo() {
  return `
    <a
      class="nadanu-brand"
      href="./index.html"
      aria-label="Nadanu 3.0 home"
    >
      <img
        class="nadanu-brand-logo"
        src="${import.meta.env.BASE_URL}nadanu-logo.png"
        alt="Nadanu 3.0 official logo"
      />

      <span class="nadanu-brand-text">
        <strong class="nadanu-brand-title">
          Nadanu <span>3.0 | 2026</span>
        </strong>

        <small class="nadanu-brand-subtitle">
          By Computing Society of ICBT Campus
        </small>
      </span>
    </a>
  `;
}

// ==========================================
// FOOTER
// ==========================================

export function footer() {
  return `
    <footer class="footer">
      <div class="footer-stripe"></div>

      <div class="footer-inner">
        <span>
          © 2026 COMPUTING SOCIETY OF ICBT
        </span>

        <span>
          FEEL THE BEAT. OWN THE STAGE.
        </span>

        <div class="social">
          <a
            href="https://www.instagram.com/csoficbt"
            target="_blank"
            rel="noopener noreferrer"
          >
            INSTAGRAM ↗
          </a>

          <a
            href="https://www.facebook.com/profile.php?id=61560469306166"
            target="_blank"
            rel="noopener noreferrer"
          >
            FACEBOOK ↗
          </a>

          <a
            href="https://www.tiktok.com/@csoficbt"
            target="_blank"
            rel="noopener noreferrer"
          >
            TIKTOK ↗
          </a>
        </div>
      </div>
    </footer>
  `;
}

// ==========================================
// NOTIFICATIONS
// ==========================================

export function setNotice(text, type = 'info') {
  const el = document.getElementById('notice');

  if (!el) return;

  el.textContent = text;
  el.className = `notice ${type}`;
  el.hidden = false;
}

// ==========================================
// BROWSER VOTING TOKEN
// ==========================================

export function getBrowserToken() {
  const k = 'nadanu_voter_device_v1';

  let t = localStorage.getItem(k);

  if (!t) {
    t = crypto.randomUUID();
    localStorage.setItem(k, t);
  }

  return t;
}
