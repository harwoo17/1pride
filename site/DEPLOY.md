# Deploying 1PRIDE site

The Astro Starlight site at `site/` deploys to Vercel as a static build.

## First deploy

```bash
cd site
npx vercel
# Project name:        1pride
# Link to existing?    No (first time)
# Directory:           ./
# Override settings?   No  (vercel.json provides everything)
```

This creates a Vercel project and gives you a preview URL like
`https://1pride-<hash>.vercel.app`.

## Production

```bash
cd site
npx vercel --prod
```

## Custom domain (1pride.app)

1. Buy `1pride.app` (e.g. Namecheap, Cloudflare, Porkbun).
2. In Vercel: **Project → Settings → Domains → Add → `1pride.app`**.
3. Set DNS at your registrar to the records Vercel shows (usually an `A` record
   to `76.76.21.21` and a `CNAME` for `www` to `cname.vercel-dns.com`).
4. SSL provisions automatically once DNS resolves.

## Notes

- `site/vercel.json` declares Astro as the framework and `dist` as the output.
- Root of the Vercel project is `site/`, not the monorepo root. When prompted
  by `npx vercel` for the directory, leave it as `./` from inside `site/`.
- `trailingSlash: true` mirrors Starlight's default URL shape so internal links
  don't redirect.
