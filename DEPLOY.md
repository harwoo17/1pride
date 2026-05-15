# Deploying 1PRIDE

Domain: `1pride.app` (Cloudflare Registrar).
Three services to deploy, $0/yr beyond the domain itself.

| Service | Where | Production URL |
|---|---|---|
| Curriculum site | Vercel free | `1pride.app` (apex) + `www.1pride.app` |
| L5 app | Vercel free | `app.1pride.app` |
| FastAPI backend | Fly.io free | `api.1pride.app` |
| Postgres | Neon free (0.5 GB) | `ep-xxx.neon.tech` |

Read top to bottom — each step assumes the previous is done.

---

## 0. One-time logins (all browser-based)

```bash
# Vercel (deploys the two web projects)
npx vercel login

# Fly.io (deploys the FastAPI backend)
brew install flyctl
fly auth signup        # if you don't have an account
# or
fly auth login         # if you already do

# Neon (free Postgres — sign up via browser)
open https://console.neon.tech/
```

After Neon signup: click **New Project** → name it `1pride` → region `US East`
or `US Central` → copy the connection string they show you. It'll look like
`postgresql://neondb_owner:xxxxx@ep-xxx-pooler.us-east-2.aws.neon.tech/onepride?sslmode=require`.

Save it somewhere safe; we'll use it as `DATABASE_URL` in two places.

---

## 1. Deploy the curriculum site

```bash
cd "Documents/Ventures & Work Products/1PRIDE/Code/site"
npx vercel
```

Prompts:

- **Set up and deploy?** Yes
- **Which scope?** your personal account
- **Link to existing project?** No
- **Project name?** `1pride`
- **Directory?** `./` (you're already in `site/`)
- **Modify settings?** No

You'll get a preview URL like `https://1pride-xyz.vercel.app`. Then promote
to production:

```bash
npx vercel --prod
```

---

## 2. Deploy the L5 app (Next.js)

```bash
cd ../app
npx vercel
```

Same prompts. Project name: `1pride-app`.

```bash
npx vercel --prod
```

---

## 3. Set up Neon Postgres + load Lions data

```bash
cd ../data

# Save the raw Neon connection string (the one their UI gave you)
export NEON_URL='postgresql://...@ep-xxx.neon.tech/onepride?sslmode=require'

# Apply schema to Neon
/opt/homebrew/opt/postgresql@16/bin/psql "$NEON_URL" -f schema.sql

# Load Lions data into Neon. The --neon-url flag auto-prefixes the URL
# with `postgresql+psycopg://` so you don't need to remember the
# SQLAlchemy variant. NEON_URL is also picked up automatically as
# the env var.
uv run --python 3.11 python -m onepride_data.load \
  --years 2021-2024 --tables all                # weekly + schedules + PBP, ~10-15 min
uv run --python 3.11 python -m onepride_data.load \
  --years 2025 --tables schedules
uv run --python 3.11 python -m onepride_data.load \
  --years 2025 --tables pbp                     # 2025 weekly isn't published yet — schedules + PBP only
uv run --python 3.11 python -m onepride_data.load \
  --years 2025 --tables derive-weekly           # rebuild weekly_stats for 2025 from PBP
```

Note: Neon hands you `postgresql://...`. Internally the loader needs
`postgresql+psycopg://...` (SQLAlchemy variant). The `--neon-url` flag
(or `NEON_URL` env var) handles that automatically.

---

## 4. Deploy the FastAPI backend to Fly.io

From `data/`:

```bash
fly launch --copy-config --no-deploy --name 1pride-api
```

When prompted:
- **Region?** `ord` (Chicago) — already in `fly.toml`
- **Postgres cluster?** No (we have Neon)
- **Redis?** No

Set the DB URL as a secret (so it's not in the repo):

```bash
fly secrets set DATABASE_URL='postgresql+psycopg://<neon-conn-string-here>'
```

Deploy:

```bash
fly deploy
```

After it finishes, you'll have `https://1pride-api.fly.dev`. Verify:

```bash
curl https://1pride-api.fly.dev/health
curl https://1pride-api.fly.dev/api/lions/seasons
```

---

## 5. Wire the app to the production API

In **Vercel → 1pride-app project → Settings → Environment Variables**:

```
Key:   NEXT_PUBLIC_API_BASE
Value: https://api.1pride.app
Env:   Production, Preview, Development
```

Redeploy so the new env var ships:

```bash
cd ../app && npx vercel --prod
```

(For now you could point at `https://1pride-api.fly.dev` directly if you
want to skip the custom domain. Just remember to swap to `api.1pride.app`
once DNS is set up.)

---

## 6. Custom domain — DNS at Cloudflare

You bought `1pride.app` through Cloudflare Registrar. The DNS panel for the
domain lives at: **Cloudflare dashboard → 1pride.app → DNS → Records**.

You need three subdomains pointing at three providers:

| Subdomain | Type | Target | Where |
|---|---|---|---|
| `1pride.app` (apex) | `CNAME` (flattened) or `A` | Vercel | `1pride` Vercel project |
| `www.1pride.app` | `CNAME` | `cname.vercel-dns.com` | redirects to apex |
| `app.1pride.app` | `CNAME` | `cname.vercel-dns.com` | `1pride-app` Vercel project |
| `api.1pride.app` | `CNAME` | `<your-app>.fly.dev` | `1pride-api` Fly app |

### Vercel side (do this first, **before** the DNS records)

1. **Vercel → `1pride` project → Settings → Domains → Add Domain** →
   `1pride.app`. Vercel will show the exact DNS values it wants (usually
   the apex via `A 76.76.21.21` or a CNAME flattening to
   `cname.vercel-dns.com`).
2. Same for `www.1pride.app`.
3. **`1pride-app` project → Settings → Domains → Add Domain** →
   `app.1pride.app`.

### Fly side

```bash
cd data
fly certs add api.1pride.app
fly certs show api.1pride.app   # shows what CNAME target to use
```

It'll print something like `Hostname: 1pride-api.fly.dev`.

### Cloudflare DNS panel — add the records

1. **Type:** CNAME → **Name:** `app` → **Target:** `cname.vercel-dns.com`
   → **Proxy:** **off** (gray cloud) — Vercel issues its own TLS.
2. **Type:** CNAME → **Name:** `www` → **Target:** `cname.vercel-dns.com`
   → **Proxy:** off.
3. **Type:** CNAME → **Name:** `api` → **Target:** `1pride-api.fly.dev`
   → **Proxy:** off.
4. **Type:** A → **Name:** `@` (or `1pride.app`) → **Target:** `76.76.21.21`
   (Vercel's apex IP — check what Vercel told you in step 1) → **Proxy:** off.

Cloudflare's proxy (the orange cloud) interferes with how Vercel and Fly
issue Let's Encrypt certs. Keep proxy **off** for all four records.

DNS usually resolves in 1-5 minutes. Vercel and Fly will auto-provision
SSL certs once they can verify the records.

---

## 7. Sanity-check the live stack

```bash
# Curriculum
curl -I https://1pride.app

# L5 app — should 200
curl -I https://app.1pride.app

# API — should return JSON
curl https://api.1pride.app/health
curl https://api.1pride.app/api/lions/seasons

# End-to-end — the app's stat-leaders block should render real data
curl -s https://app.1pride.app | grep -o "Amon-Ra" | head -1
```

If everything passes you're live. Total spend: $12 for the domain. Server
costs: $0 unless usage exceeds Fly/Vercel/Neon free tiers (very unlikely
for a portfolio site).

---

## 8. Going forward — scheduled data refresh

Once a week (Tuesday morning post-MNF), refresh the data with a GitHub
Actions cron. The workflow file goes at `.github/workflows/refresh.yml` —
see L5 Lesson 3 in the curriculum for the YAML. Set the same
`DATABASE_URL` as a GitHub repo secret.

That's it. Site, app, API — all live, all free, all yours.
