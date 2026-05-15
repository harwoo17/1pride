# Deploying 1PRIDE

Two Vercel projects, one repo. The root is a monorepo; each project deploys
from its own subdirectory.

| Project | Subdirectory | Production domain | Vercel framework |
|---|---|---|---|
| Curriculum site | `site/` | `1pride.dev` | Astro |
| L5 app          | `app/`  | `app.1pride.dev` | Next.js |

## First deploy — CLI (no GitHub required)

You can deploy from your laptop without linking GitHub. Useful while git auth
is still being sorted.

### One-time: log into Vercel

```bash
npx vercel login
```

Opens a browser. Pick the email associated with your Vercel account; it
authenticates once and saves a token locally.

### Curriculum site

```bash
cd "Ventures & Work Products/1PRIDE/Code/site"
npx vercel               # preview deploy → 1pride-<hash>.vercel.app
npx vercel --prod        # production deploy
```

When prompted on first deploy:

- **Set up and deploy?** Yes
- **Which scope?** your personal account
- **Link to existing project?** No
- **Project name?** `1pride`
- **In which directory is your code located?** `./` (you're already in `site/`)
- **Want to modify these settings?** No (`vercel.json` provides them)

### L5 app

```bash
cd "Ventures & Work Products/1PRIDE/Code/app"
npx vercel               # preview
npx vercel --prod        # production
```

Same prompts. Project name: `1pride-app`.

## Custom domains

Once each project has a production URL, attach the domains:

1. **Vercel dashboard → Project → Settings → Domains**
2. Add `1pride.dev` to the `1pride` project; add `app.1pride.dev` to the
   `1pride-app` project.
3. At your registrar (Cloudflare / Namecheap / Porkbun), point DNS to the
   records Vercel shows. Typical:
   - `1pride.dev` (apex)     → `A` record to `76.76.21.21`
   - `www.1pride.dev`        → `CNAME` to `cname.vercel-dns.com`
   - `app.1pride.dev`        → `CNAME` to `cname.vercel-dns.com`
4. SSL provisions automatically once DNS resolves (usually under a minute).

## Once git is connected

After GitHub auth is sorted and `harwoo17/1pride` exists, switch from CLI
deploys to GitHub-connected auto-deploys:

1. **Vercel dashboard → Project → Settings → Git → Connect Git Repository**
2. Pick `harwoo17/1pride`.
3. For each project, set the **Root Directory** to `site` or `app`
   respectively. Vercel will redeploy on every push to `main`.

You can keep running `npx vercel` from the CLI either way — it works alongside
GitHub-connected deploys.

## Environment variables

When the L5 FastAPI backend lands and the Next.js app needs a `DATABASE_URL`
or `API_BASE`, set them in **Project → Settings → Environment Variables** in
the Vercel dashboard (or pass them on the command line with
`vercel env add`). Don't commit secrets.
