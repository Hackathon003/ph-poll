# PH Poll 2025 — Deploy Guide

Unofficial Philippine election survey site. Next.js 14 + Supabase + Upstash Redis + Vercel.

---

## Stack

| Layer | Service | Cost |
|---|---|---|
| Frontend + API | Vercel | Free |
| Database | Supabase | Free (500MB) |
| Rate Limiting | Upstash Redis | Free (10k req/day) |
| DDoS Protection | Cloudflare | Free |
| Image Hosting | Cloudinary | Free (25GB) |

---

## Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a region close to the Philippines (Singapore is best)
3. Once created, go to **SQL Editor** → paste the entire contents of `supabase_schema.sql` → **Run**
4. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep secret!

---

## Step 2 — Upstash Redis Setup

1. Go to [upstash.com](https://upstash.com) → **Create Database**
2. Name it `ph-poll`, choose **Singapore** region, **Global** enabled
3. Once created, go to **Details → REST API** and copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## Step 3 — Local Development

```bash
# Clone or unzip project
cd ph-poll

# Install dependencies
npm install

# Copy env template
cp .env.example .env.local

# Fill in .env.local with your actual keys from steps 1-2

# Generate a secret for IP hashing
# Mac/Linux:
openssl rand -hex 32
# Windows PowerShell:
[System.Web.Security.Membership]::GeneratePassword(64, 0)
# Paste output as IP_HASH_SECRET in .env.local

# Run dev server
npm run dev
# → Open http://localhost:3000
```

---

## Step 4 — Deploy to Vercel

### Option A: GitHub (recommended)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ph-poll.git
git push -u origin main
```

Then:
1. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
2. Framework preset: **Next.js** (auto-detected)
3. Go to **Environment Variables** and add all variables from `.env.example` with real values
4. Click **Deploy**

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel
# Follow prompts, then add env vars in Vercel dashboard
vercel --prod
```

---

## Step 5 — Cloudflare (DDoS Protection)

1. Go to [cloudflare.com](https://cloudflare.com) → Add your domain
2. Update your domain's nameservers to Cloudflare's (shown in setup)
3. In Cloudflare DNS, add a CNAME:
   - Name: `@` (or `www`)
   - Target: your Vercel deployment URL (e.g., `ph-poll.vercel.app`)
   - Proxy: **Enabled** (orange cloud ☁️)
4. In Vercel, add your custom domain under **Settings → Domains**

Cloudflare free tier gives you:
- DDoS mitigation
- 100GB free bandwidth
- SSL/HTTPS
- Basic WAF rules

---

## Step 6 — Cloudinary (Candidate Photos, Optional)

1. Go to [cloudinary.com](https://cloudinary.com) → Create account
2. From Dashboard, copy your Cloud Name, API Key, API Secret
3. Add to Vercel environment variables
4. Upload candidate photos via Cloudinary dashboard
5. In Supabase, update `photo_url` for each candidate with the Cloudinary URL

Example update SQL:
```sql
UPDATE candidates 
SET photo_url = 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/candidates/bbm.jpg'
WHERE name LIKE '%Marcos%';
```

---

## Step 7 — Enable Supabase Realtime (Optional)

For live vote updates without polling:

1. In Supabase → **Database → Replication**
2. Enable replication for the `votes` table
3. In your app, replace the 30-second interval with Supabase realtime subscription

---

## Customization

### Adding/Editing Candidates

In Supabase SQL Editor:
```sql
-- Add a candidate
INSERT INTO candidates (name, party, position, sort_order)
VALUES ('New Candidate', 'Party Name', 'senator', 13);

-- Remove a candidate
UPDATE candidates SET active = false WHERE name = 'Candidate Name';

-- Edit a candidate
UPDATE candidates SET party = 'New Party' WHERE name = 'Candidate Name';
```

### Changing Vote Limits

- Senator max votes: edit `MAX_SENATOR_VOTES` in `src/app/api/senators-vote/route.ts`
- Rate limit: edit `Ratelimit.slidingWindow(5, '1 m')` in `src/lib/ratelimit.ts`

### Resetting Votes (for testing)

```sql
-- Delete all votes (CAREFUL in production!)
DELETE FROM votes;
```

---

## Security Notes

- ✅ IPs are hashed with SHA-256 + secret — never stored in plain text
- ✅ Service role key only used server-side (API routes), never exposed to browser
- ✅ Row Level Security enabled on all tables
- ✅ Rate limiting via Upstash Redis
- ✅ No personal data collected — no login, no email, no name
- ✅ Cookie is a random UUID — not linkable to any person
- ⚠️ This is a survey, not a real election system

---

## Troubleshooting

**Votes not saving?**
- Check Supabase RLS policies are correct
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (not just anon key)

**Rate limiter errors?**
- Check Upstash Redis URL and token are correct
- Verify the database is in active state on Upstash dashboard

**Images not loading?**
- Add Cloudinary domain to `next.config.js` remotePatterns

**Duplicate vote getting through?**
- Check unique index was created: `votes_ip_position_unique` and `votes_cookie_position_unique`
- Verify `IP_HASH_SECRET` is set

---

## Project Structure

```
ph-poll/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── vote/route.ts          # Presidential voting API
│   │   │   ├── senators-vote/route.ts # Senator voting API
│   │   │   ├── comments/route.ts      # Comments API
│   │   │   └── analytics/route.ts     # Analytics API
│   │   ├── analytics/
│   │   │   └── page.tsx               # Analytics dashboard
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                   # Main poll page
│   ├── components/
│   │   ├── CandidateCard.tsx
│   │   └── Toast.tsx
│   └── lib/
│       ├── supabase.ts               # DB client
│       └── ratelimit.ts              # Rate limiting + IP hashing
├── supabase_schema.sql               # Copy-paste into Supabase SQL editor
├── .env.example                      # Copy to .env.local and fill in
├── next.config.js
├── tailwind.config.js
└── package.json
```
