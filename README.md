# Village Playground

Registration and community platform for the Village Playground gathering (Sept 25–29, 2026, Camp Ki-Wa-Y).

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Supabase** (Postgres, Auth, Storage, Realtime)
- **Vercel** hosting

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

3. Run the database migrations in the Supabase SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_claim_anon_read.sql`
   - `supabase/migrations/003_avatars_storage.sql`
   - `supabase/migrations/004_seed_content_from_guides.sql`
   - `supabase/migrations/005_google_oauth_profile_name.sql`
   - `supabase/migrations/006_phase3_logistics.sql`
   - `supabase/migrations/007_phase4_chat_policies.sql`
   - `supabase/migrations/008_seed_event_content.sql`

4. In Supabase → Authentication → URL Configuration, add:
   - Site URL: `http://localhost:3000` (or your Vercel URL in production)
   - Redirect URLs: `http://localhost:3000/auth/callback` and your production callback URL

5. **Enable Google sign-in** (see [Google auth setup](#google-auth-setup) below)

## Supabase project

- **Project:** `Village Playground Gathering` (us-west-2)
- **Dashboard:** https://supabase.com/dashboard/project/jrbsqpamkhzasnrhhgey

After your first Google login, promote yourself to admin:

```sql
UPDATE profiles SET is_admin = TRUE WHERE email = 'tessmhart@gmail.com';
```

### Auth redirect URLs (required)

In Supabase → Authentication → URL Configuration, set:

- **Site URL:** `http://localhost:3000` (change to your domain when deployed)
- **Redirect URLs:** `http://localhost:3000/auth/callback` and your production URL

## Domain recommendation

You don't need a domain to start — use the free Vercel URL (`*.vercel.app`) while testing.

When you're ready to buy (~$12–15/yr):

1. **Best option:** a subdomain of whatever you already use for VNP/Village Playground marketing — e.g. `register.villagenetworkplayground.org` or `gather.villageplayground.org`. Keeps the main Squarespace/marketing site separate; this app lives on its own subdomain pointing to Vercel.

2. **Registrar:** Cloudflare Registrar (at-cost pricing) or Namecheap.

3. **DNS:** Point a CNAME from your subdomain to `cname.vercel-dns.com` (Vercel gives exact instructions when you add the domain).

Avoid buying a whole new brand domain unless you want one — a subdomain is cheaper, clearer ("this is where you register"), and matches the PRD's standalone-app design.


### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Style guide (dev)

Visit [http://localhost:3000/dev/styleguide](http://localhost:3000/dev/styleguide) to preview UI components.

## What's built

| Phase | Status |
|-------|--------|
| **Phase 0** — Scaffold, UI library, auth, style guide | Done |
| **Phase 1** — Landing, registration (4 steps), payment page, admin table | Done |
| **Phase 2** — Linked guests, co-creation, admin edit + column toggle | Done |
| **Phase 3** — Directory, network map, notifications, logistics hub | Done |
| **Phase 4** — Announcements, chat, schedule, map, agreements | Done |

## Deploy to Vercel

The repo is at [github.com/TeresaHart-7/vpg](https://github.com/TeresaHart-7/vpg).

### First-time setup (one-time, ~5 min)

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. **Import** the `TeresaHart-7/vpg` repository.
3. Leave framework as **Next.js** (auto-detected). Click **Deploy** once env vars are set (step 4).
4. Before or right after first deploy, add **Environment Variables** (Settings → Environment Variables):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jrbsqpamkhzasnrhhgey.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(copy from Supabase → Project Settings → API → anon public key)* |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel URL, e.g. `https://vpg.vercel.app` |

5. **Redeploy** after adding env vars (Deployments → ⋯ → Redeploy) so the build picks them up.

### Supabase auth (required for production login)

In [Supabase → Authentication → URL Configuration](https://supabase.com/dashboard/project/jrbsqpamkhzasnrhhgey/auth/url-configuration):

- **Site URL:** your Vercel URL (e.g. `https://vpg.vercel.app`)
- **Redirect URLs:** add both:
  - `http://localhost:3000/auth/callback`
  - `https://YOUR-VERCEL-URL.vercel.app/auth/callback`

Google sign-in won't complete until these match your live site URL.

### Google auth setup

Login uses **Google OAuth** (no magic-link emails — avoids Supabase's 2/hour email cap).

1. **Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com))
   - Create a project (or use an existing one)
   - APIs & Services → **OAuth consent screen** → configure (External is fine for a gathering app)
   - Credentials → **Create credentials → OAuth client ID → Web application**
   - **Authorized redirect URI** (required):

     `https://jrbsqpamkhzasnrhhgey.supabase.co/auth/v1/callback`

   - Copy the **Client ID** and **Client secret**

2. **Supabase** → [Authentication → Providers → Google](https://supabase.com/dashboard/project/jrbsqpamkhzasnrhhgey/auth/providers)
   - Enable Google
   - Paste Client ID and Client secret → Save

3. Test: visit `/login` → **Continue with Google**

For local dev, add `http://localhost:3000/auth/callback` to Supabase redirect URLs (already in step 4 above). Google redirect URI stays the Supabase one above — Google always redirects to Supabase first, then Supabase redirects to your app.

### Custom domain (later)

Vercel → Project → Settings → Domains → Add your subdomain (e.g. `register.yoursite.org`). Then update `NEXT_PUBLIC_SITE_URL` and Supabase redirect URLs to match.

### Auto-deploy

Every push to `main` on GitHub triggers a new Vercel deployment automatically.

## Project docs

- `Village-Playground-PRD.md` — features and data model
- `Village-Playground-Visual-Design-Spec.md` — design tokens
- `Village-Playground-Development-Plan.md` — build checklist
