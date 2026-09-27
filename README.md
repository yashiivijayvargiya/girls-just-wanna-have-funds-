# Order & Profit Tracker

A multi-tenant order/payment/profit tracker. Anyone who visits your deployed
link can create their own account, and their orders are private to them.

## What this is built with
- **Next.js** — the app itself
- **Supabase** — the database (Postgres) + email/password login and signup
- **Vercel** — hosting

Nothing else to install, buy, or configure beyond the two free accounts below.

---

## 1. Create your database (Supabase) — ~5 minutes

1. Go to https://supabase.com, sign up, and click **New project**.
2. Pick any name and password (save the password somewhere — you won't need
   it day-to-day, but keep it safe).
3. Once the project finishes setting up, open **SQL Editor** in the left
   sidebar, click **New query**, paste in the entire contents of
   `supabase/schema.sql` from this project, and click **Run**.
   This creates your two tables (`orders` and `business_settings`) and locks
   them so each signed-up user can only ever see their own data.
4. Go to **Project Settings -> API**. You'll need two values from this page
   in the next step: **Project URL** and the **anon public** key.
5. (Optional but recommended for a real launch) Go to **Authentication ->
   Providers -> Email** and turn **off** "Confirm email" while you're testing
   locally, or leave it on if you want new users to verify their email before
   logging in.

## 2. Run it on your own computer first

1. Install [Node.js](https://nodejs.org) if you don't have it.
2. In this project folder:
   ```
   npm install
   cp .env.local.example .env.local
   ```
3. Open `.env.local` and paste in your Supabase **Project URL** and
   **anon public** key from step 1.4 above.
4. ```
   npm run dev
   ```
5. Open http://localhost:3000 — you should see the login page. Click
   **Create an account** and try it out.

## 3. Deploy it for real (Vercel) — ~5 minutes

1. Push this project to a GitHub repository (create a new empty repo on
   GitHub, then `git init`, `git add .`, `git commit -m "first version"`,
   `git remote add origin <your repo URL>`, `git push -u origin main`).
2. Go to https://vercel.com, sign up (you can use your GitHub account), and
   click **Add New -> Project**. Pick the repo you just pushed.
3. Before clicking Deploy, open **Environment Variables** and add the same
   two values from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. In about a minute you'll get a live link like
   `your-project.vercel.app` — that's it, live on the internet, with
   working signup for anyone you share it with.
5. Want your own domain (e.g. `app.fringe.com`)? In the Vercel project,
   go to **Settings -> Domains** and follow the prompts — Vercel gives you
   exact DNS records to add wherever you bought the domain.

## Notes
- Every signup is a real account in Supabase's Auth system (Project ->
  Authentication -> Users lets you see/manage everyone who's signed up).
- Each user's orders and business name are private to them — enforced at
  the database level (row-level security), not just hidden in the UI.
- The "Download Excel backup" button works the same as before — it builds
  the file in the browser and downloads it, no server needed for that part.
- If you ever want to invite a teammate to share *one* business's data
  (rather than every signup getting their own separate business), that's a
  bigger change to the database rules — ask and I can build that next.
