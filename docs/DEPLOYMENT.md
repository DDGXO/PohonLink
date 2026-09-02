# DEPLOYMENT.md - Pohonlink

> How to set up and deploy Pohonlink.

---

## Local Development

### 1. Clone & Install

```bash
git clone https://github.com/your-org/pohonlink.git
cd pohonlink
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Fill in your Supabase keys in `.env.local`.

### 3. Database Setup

Go to Supabase Dashboard > SQL Editor. Copy-paste the entire SQL schema from [ARCHITECTURE.md](ARCHITECTURE.md) and run it.

This creates:
- Tables: `profiles`, `links`, `analytics_events`
- Enums: `user_role`, `link_type`, `event_type`
- Indexes, RLS policies, triggers, and RPC functions

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Deploy (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "feat: initial project setup"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Vercel auto-detects Next.js. Framework preset: **Next.js**
4. Add environment variables in Vercase dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` = your production URL
   - `NEXT_PUBLIC_APP_NAME` = `Pohonlink`
5. Deploy

### 3. Custom Domain (Optional)

1. In Vercel project settings > Domains
2. Add your domain
3. Update DNS as instructed by Vercel
4. Update `NEXT_PUBLIC_APP_URL` in environment variables

## Supabase Setup Checklist

- [ ] Create Supabase project
- [ ] Run SQL schema from ARCHITECTURE.md
- [ ] Create Storage buckets: `avatars`, `backgrounds`
- [ ] Set bucket policies for public read access
- [ ] Copy project URL and keys to `.env.local`

## Rollback

On Vercel: go to Deployments > find previous deployment > click "..." > Promote to Production.

## Health Check

```bash
# Test locally
curl -I http://localhost:3000

# Test production
curl -I https://your-domain.com
```
