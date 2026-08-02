# Athidhi Banquet Hall Reservation System

Next.js 14 (App Router) + Prisma + PostgreSQL. Two-hall, two-slot (Morning/Evening)
booking calendar with an optional Google Sheets sync. Works on any standard
Node.js host — Railway, Render, Fly.io, or Vercel + an external Postgres like Neon.

## 1. Run it locally first (do this before deploying anywhere)

```bash
npm install
cp .env.example .env
# edit .env - at minimum set DATABASE_URL, DIRECT_URL, and AUTH_SECRET (see below)
npx prisma db push     # creates the tables in your database
npm run dev
```

Open http://localhost:3000 — you should see the login screen. If `npm install`
or `npm run dev` throws an error, that's expected to happen occasionally with
AI-generated code — copy the exact error message back to Claude and it can be
fixed quickly.

### Generating AUTH_SECRET

```bash
openssl rand -base64 32
```
Paste the output as `AUTH_SECRET` in `.env`.

## 2. Get a free Postgres database

The walkthrough below uses **Neon**, but Railway, Supabase, or any standard
Postgres provider works too — just note that only Neon (and similar serverless
Postgres) needs the pooled-vs-direct URL split described in Step B; with
Railway/Supabase/a regular Postgres server, `DATABASE_URL` and `DIRECT_URL`
can just be the same connection string.

## 3. Deploy to Vercel + Neon (recommended for testing)

### Step A — Push the code to GitHub
Render/Vercel both deploy from a GitHub repo, not a zip upload.
```bash
git init
git add .
git commit -m "Initial commit"
# create a new empty repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/athidhi-app.git
git push -u origin main
```

### Step B — Create the Neon database
1. Go to neon.tech → sign up (free) → **New Project**
2. Name it (e.g. `athidhi`), pick a region close to you, create it
3. On the project's dashboard, find the **Connection string** section. Neon shows two variants:
   - one with **`-pooler`** in the hostname → this is `DATABASE_URL`
   - one **without** `-pooler` → this is `DIRECT_URL`
   Copy both — you'll need them in Step D.

### Step C — Import the project into Vercel
1. Go to vercel.com → sign up/log in with GitHub → **Add New → Project**
2. Select your `athidhi-app` repo → Import
3. Framework preset should auto-detect as **Next.js** — leave build settings as default

### Step D — Set environment variables
Still on Vercel's import screen (or Project → Settings → Environment Variables after import), add:
- `DATABASE_URL` → the **pooled** connection string from Neon
- `DIRECT_URL` → the **direct** connection string from Neon
- `AUTH_SECRET` → output of `openssl rand -base64 32`
- `APP_PASSWORD` → `Athidhi6`
- Leave `GOOGLE_*` blank for now

Click **Deploy**.

### Step E — Create the database tables
The build itself doesn't create tables. After the first successful deploy, run this
**locally** (from your project folder), pointed at the same Neon database:
```bash
# in your local .env, use the DIRECT_URL (non-pooled) as DATABASE_URL for this step
npx prisma db push
```
This only needs to be done once (and again any time you change `schema.prisma`).

### Step F — Test it
Visit the `.vercel.app` URL Vercel gives you → you should see the login screen.

---

## 3b. Other hosts (Render, Railway, self-hosted)

The app is a normal Next.js app, so deployment is the same three steps
on any host:

1. Push this project to a GitHub repo (see Step A above)
2. Connect that repo to your host of choice
3. In the host's dashboard, set environment variables: `DATABASE_URL`, `DIRECT_URL`
   (can equal `DATABASE_URL` if your host isn't Neon), `AUTH_SECRET`, `APP_PASSWORD`,
   and optionally the `GOOGLE_*` ones
4. Build command: `npm install && npm run build` · Start command: `npm start`
5. After the first deploy, run `npx prisma db push` once (locally, pointed at
   that database, or via the host's shell/console if it has one) to create the tables

**Never commit your `.env` file or paste real credentials into a chat.**
Only enter secrets directly into your hosting provider's dashboard.

## 4. Optional: Google Sheets sync

Every time a booking is created, edited, converted, completed, or cancelled,
the app tries to write a matching row to a Google Sheet. If the three
`GOOGLE_*` env vars are left blank, this is silently skipped — everything else
still works normally.

### Setting it up

1. Go to console.cloud.google.com → create a project (or use an existing one)
2. Enable the **Google Sheets API** for that project
3. Go to "IAM & Admin" → "Service Accounts" → create a new service account
   (this is a robot identity, not a personal Google login)
4. On that service account, create a new key → JSON → download it
5. From the downloaded JSON file:
   - `client_email` → set as `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → set as `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (keep the `\n` characters exactly as they appear in the file)
6. Create a Google Sheet, and add a tab named exactly `Bookings`
7. Click "Share" on that Sheet and share it with the service account's email
   address (the same one as `client_email`) — give it **Editor** access
8. Copy the Sheet's ID from its URL: `https://docs.google.com/spreadsheets/d/THIS_PART/edit` → set as `GOOGLE_SHEET_ID`
9. Paste all three values into your hosting provider's environment variables
   (not into this repo)

The header row and all columns are created automatically on the first sync.

## What's in here

- `prisma/schema.prisma` — the data model (one `Booking` table + a `HistoryEntry`
  audit trail per booking)
- `src/lib/rules.ts` — the business rules: hall auto-allocation (>250 guests =
  both halls), conflict detection, and the "convert to booking auto-rejects
  overlapping enquiries" rule
- `src/lib/sheets.ts` — the optional Google Sheets sync (never blocks a booking
  from saving even if Sheets is down or misconfigured)
- `src/app/api/**` — all backend routes
- `src/app/(app)/**` — the four staff-facing pages (dashboard, calendar, enquiries, bookings)
- `src/components/**` — shared modals (booking form, slot view, booking details)

## Known limitations / next steps

- Login is a single shared password for two named staff members — fine for
  two people, not meant to scale much further without real per-user accounts
- No automated backups configured — most managed Postgres providers (Neon,
  Supabase, Railway) offer automatic daily backups on their free/cheap tiers;
  worth double-checking that's switched on
- No test suite included
