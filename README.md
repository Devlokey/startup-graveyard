# ⚰ Startup Graveyard

**A public tracker of every Indian startup that didn't make it.**

Live at → [startup-graveyard-mocha.vercel.app](https://startup-graveyard-mocha.vercel.app)

258 startups. ₹78,116 Cr burned. And counting.

---

## What is this?

Startup Graveyard is an open dataset and interactive web app cataloguing failed Indian startups — their sectors, funding raised, years active, and why they shut down. The goal is to make failure data transparent and searchable, not buried in paywalled news archives.

---

## Features

- **Animated particle field** — startup names float across the homepage canvas; hover or tap to see details
- **Live counters** — total failures and capital burned animate on load
- **Search from homepage** — type a name and press Enter to jump straight to filtered results
- **Graveyard grid** — paginated card grid with search, sector, year, and tag filters
- **Click-to-expand cards** — click any card to read the full failure summary in a modal
- **Mobile-optimised** — particle density capped on small screens, centre zone kept clear for UI legibility
- **Tag system** — startups tagged as Overfunded / Too Early / Bad Product / Market Shift

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Database | Supabase (PostgreSQL + RLS) |
| Canvas | HTML Canvas 2D API |
| AI (crawler) | Anthropic Claude API (`@anthropic-ai/sdk`) |
| RSS parsing | `rss-parser` |
| Testing | Vitest + happy-dom + @testing-library/react |
| Deployment | Vercel |

---

## Project structure

```
app/
  page.tsx              # Homepage (server component — fetches stats + startups)
  graveyard/
    page.tsx            # Full graveyard grid page (accepts ?search= param)
  api/
    cron/crawl/         # Automated crawler endpoint (called daily by Vercel cron)
    debug/              # Debug endpoint

components/
  HomepageClient.tsx    # Client shell — search state, tag toggles, particle field
  ParticleField.tsx     # HTML Canvas particle animation with touch & hover tooltips
  GraveyardGrid.tsx     # Filterable, paginated startup grid with modal
  StartupCard.tsx       # Individual startup card
  LiveCounter.tsx       # Animated number counter

lib/
  supabase.ts           # Supabase client (server-side)
  types.ts              # Shared TypeScript types

supabase/
  migrations/           # SQL schema — apply via Supabase SQL Editor

crawler/                # RSS-based startup failure crawler (Claude-powered extraction)
__tests__/              # Vitest test suite
```

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/Devlokey/startup-graveyard.git
cd startup-graveyard
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Open the SQL Editor and run `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and keys from **Settings → API**

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `ANTHROPIC_API_KEY` | Claude API key — used by the crawler to extract startup data from news |
| `CRON_SECRET` | A random secret string to authenticate the cron endpoint |
| `NEXT_PUBLIC_APP_URL` | Your app URL (`http://localhost:3000` for local dev) |

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database schema

```sql
CREATE TABLE startups (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  sector        text,
  funding_inr   bigint,   -- in lakhs (₹1 Cr = 100 lakhs)
  founded_year  int,
  shutdown_date date,
  reason        text,     -- full failure summary
  failure_tag   text CHECK (failure_tag IN ('Overfunded', 'Too Early', 'Bad Product', 'Market Shift')),
  source_url    text,
  source_name   text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

A `startup_stats` view aggregates total count and total funding burned for the homepage counters.

---

## Running tests

```bash
npm test          # run once
npm run test:watch  # watch mode
```

20 tests across 6 files covering components and pure utility functions.

---

## Deployment

The app is deployed on Vercel. To deploy your own instance:

```bash
npx vercel --prod
```

Set the same environment variables in your Vercel project settings. The cron job at `/api/cron/crawl` runs daily — protect it with the `CRON_SECRET` header.

---

## Contributing

Pull requests welcome. If you know of an Indian startup that should be in the dataset but isn't, open an issue with the name, sector, approximate funding, and a source link.

---

## License

MIT
