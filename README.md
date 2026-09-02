# ShopTok Admin Portal

React admin dashboard for ShopTok, deployed to GitHub Pages.

## Stack

- Vite + React + TypeScript + Tailwind CSS
- Supabase Auth (email/password) + RLS admin policies

## Local development

```bash
cp .env.example .env
# Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Open `http://localhost:5173/shopTok-Admin/` (Vite uses the `base` path).

## Backend setup (shopTok repo)

1. Apply migration `supabase/migrations/20260902160000_admin_rbac.sql`
2. Enable **Email** provider in Supabase Auth
3. Deploy Edge Function: `supabase functions deploy admin-create-user`
4. Bootstrap first admin:

```bash
cd ../shopTok
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/bootstrap-admin.mjs
```

Default bootstrap credentials: `bakht@gmail.com` / `123123`

## GitHub Pages deploy

1. Push this repo to `https://github.com/bakht200/shopTok-Admin`
2. Add repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Settings → Pages → Source: **GitHub Actions**
4. Push to `main` triggers deploy → `https://bakht200.github.io/shopTok-Admin/`

## Pages

| Route | Purpose |
|-------|---------|
| `/login` | Admin sign in |
| `/dashboard` | Stats + recent orders |
| `/users` | User list, search, ban |
| `/admins` | Admin list + create admin |
| `/orders` | Order list + filters |
| `/orders/:id` | Order detail + status override |
| `/deliveries` | Rider jobs (read-only) |
| `/content` | Posts/products moderation |
