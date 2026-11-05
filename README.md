# NADANU 3.0 — People's Choice · Retro Rebuild

Fresh original **voting-only** website, inspired by the uploaded Naadanu event system's public voting and administrator functionality, but visually reimagined in the 80s orange/brown/grunge style associated with the Nadanu auditions site. Includes a public site, organizer control room, secure Supabase SQL, and a Turnstile-verified Edge Function. **Does not copy the old project's public-votes RLS or IP-blocking behavior.**

## Included

- Three categories only: Solo Singing, Solo Dancing, Group Dancing
- Finalist cards with image URL, name, category, stage text, and voting confirmation
- No public account/OTP forms; anonymous Supabase authentication runs behind the scenes
- One vote **total**, enforced server-side via unique anonymous user and hashed browser ID
- Cloudflare Turnstile verified in server-side Edge Function; votes not public
- Admin login, finalist add/hide/delete, voting open/closed status, admin-only tallies
- Responsive original retro design with Bungee and Audiowide Google Fonts
- GitHub Pages-ready Vite build; **demo preview cards shown only when Supabase is not configured and cannot receive votes**

### Privacy / limitations

Browser identifiers can be reset/changed. No website can guarantee one vote per **physical** device; this implementation is a practical one-browser-session deterrent. It does **not** block entire campus Wi-Fi networks by IP. For high-stakes competitions, additional anti-abuse measures and organizer review are recommended.

## 1. Install

Extract and copy the **contents** of this project folder into your chosen fresh `Voting` directory. In PowerShell:

```powershell
cd "D:\ICBT\cs\design\Nadanu\Voting"
npm.cmd install
Copy-Item .env.example .env
notepad .env
npm.cmd run dev
```

Open `http://localhost:5173/` and `http://localhost:5173/admin.html`.

## 2. New Supabase project

Create a **new** Supabase project. Fill in `.env` using the new Project URL and new **publishable** key. Do not put secret/service-role keys in `.env` or GitHub.

Go to SQL Editor and run all of `supabase/migrations/202611050001_nadanu_voting.sql`. It is designed for a **new empty** project and inserts the three categories and one draft voting event.

Go to **Authentication → Providers** and enable **Anonymous Sign-ins**. Under **Authentication → Users**, manually create the organizer account. Copy the organizer's Auth User UID and run:

```sql
insert into public.admin_roles(user_id,role)
values ('PASTE_YOUR_ORGANIZER_AUTH_USER_UUID','superadmin');
```

## 3. Turnstile

Create a Cloudflare Turnstile widget with hostname `kavinduvasuka.github.io` for your GitHub Pages deployment (or your actual custom domain). For local testing, create a second widget or use Turnstile test keys and matching test secrets, and make sure the hostname matches the server-side setting. Add its **site key** to `.env`, and keep its **secret key** in Supabase Edge Function secrets.

## 4. Edge Function

From the project directory:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref YOUR_NEW_PROJECT_REF
npx.cmd supabase functions deploy cast-vote
```

Set Edge Function secrets through Supabase Dashboard → Edge Functions → Secrets:

```
VOTING_HASH_SECRET=<32+ random characters, keep private>
TURNSTILE_SECRET_KEY=<Cloudflare private Turnstile secret>
ALLOWED_ORIGINS=https://kavinduvasuka.github.io
TURNSTILE_EXPECTED_HOSTNAME=kavinduvasuka.github.io
```

The Edge runtime supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in supported Supabase environments. Verify both exist. **Never commit server secrets.** If testing locally, you must explicitly add `http://localhost:5173` to `ALLOWED_ORIGINS`, and use a Turnstile test setup with matching hostname. Function checks the Turnstile hostname to prevent token reuse from other sites.

**Voting stays blocked until security secrets, allowed hostname and event status are correctly configured.**

## 5. Publish on GitHub Pages (new repository)

The project has **two HTML entry points** (`index.html`, `admin.html`), so Vite must explicitly build both. `vite.config.js` already handles the proper GitHub Pages base path; to publish to a new `nadanu-voting` repository via `docs`:

```powershell
$env:VITE_BASE_PATH='/nadanu-voting/'
npm.cmd run build
Remove-Item Env:VITE_BASE_PATH
if (Test-Path docs) { Remove-Item docs -Recurse -Force }
New-Item -ItemType Directory docs | Out-Null
Copy-Item dist\* docs\ -Recurse -Force
# IMPORTANT: Vite build must include admin.html (check Test-Path docs\admin.html)
git add .
# .env and node_modules are ignored; double-check git status before commit
# push to new remote, and set GitHub Pages: Deploy from branch → main → /docs
```

For `admin.html`, `vite.config.js` uses a Rollup multi-page input; see file.

## 6. Before public voting

- Add real finalists from `/admin.html`; no final names invented in this template.
- Verify organizer login and access control.
- Only change status to OPEN once votes should be accepted.
- Cast a test vote and verify second vote fails in the same browser.
- Confirm counts are hidden from public pages and visible to authorized organizers only.
- Verify Turnstile domain, CORS, Edge Function security settings and mobile layout.

## Troubleshooting

**"Configure Supabase"**: Copy `.env.example` to `.env` and set actual project URL and publishable key, then rebuild. Placeholder configuration displays **design preview** only, not a broken page. For GitHub Pages, values are embedded when building locally, so always rebuild with `.env` before copying `dist` to `docs`.

**"Vote could not be recorded"**: Check Supabase Edge Function logs, Turnstile expected hostname, allowed origin, Anonymous Sign-ins, and that the event is OPEN.

**No finalists**: Use the admin dashboard to add them; this is not a database connection failure.

**Admin cannot sign in**: Ensure the organizer exists in Auth Users and the correct UUID is in `admin_roles`.
