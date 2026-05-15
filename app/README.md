# 1PRIDE app (Level 5 capstone — scaffold)

The deployed analytics app. Final destination: `app.1pride.app`.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS 4**
- TypeScript

A FastAPI backend will live alongside this when Level 5 work begins, exposing
typed endpoints over the local Postgres. Until then this is a scaffold with
placeholder pages.

## Dev

```bash
cd app
npm install
npm run dev      # → http://localhost:3000
```

## Pages

| Route | What it does |
|---|---|
| `/`            | Landing page — what L5 is, what's coming |
| `/charts`      | Placeholder cards for the L5 charts |
| `/api/health`  | JSON status endpoint |

## Why this lives in the same repo

The brief calls for two repos eventually: `1pride` (curriculum) and `1pride-app`
(deployed analytics). For Phase 0 they live together so you can iterate on the
shape without splitting overhead. When the L5 build starts in earnest, this
directory moves to its own repo.

## What's intentionally not here yet

- **No shadcn/ui**. We're using plain Tailwind classes until a real component
  surface justifies the install. Easy to add later with `npx shadcn@latest init`.
- **No data fetching.** The placeholder pages don't talk to a database. The
  charts will, once the FastAPI service ships in Phase 3.
- **No auth.** Public read-only site.
