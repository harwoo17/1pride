# 1PRIDE
**Run your reps. Climb the depth chart.**

A self-paced data curriculum that takes you from SELECT * to a deployed analytics app, using Detroit Lions data as the substrate and a football-org hierarchy as the level progression.

---

## 1. What this is

Two things in one:
- A learning ladder that takes you from zero to a deployable analytics app, built on real NFL data via nflverse.
- A portfolio piece for the job search that proves SQL, Python, modeling, and full-stack data depth.

Built for you first. Designed so other fans (Lions or otherwise) can run it.

## 2. Why this works pedagogically

Three reasons the structure earns its keep:

**Stakes you actually care about.** Lions football, Dan Campbell era, MSU brain wired for sports analysis. Domain familiarity removes the friction of pretending to care about a fake dataset.

**A clean unlock loop.** Each level has a capstone and an unlock criterion. You move up because you shipped the artifact, not because a week passed.

**A natural seniority arc.** Analyst pulls stats, Position Coach compares groups, Head Coach makes situational calls, GM builds models, Owner ships the platform. The org chart is the curriculum. Skills track the responsibility, the same way technical depth grows in real careers.

## 3. The 5-level progression

| Level | Role | SQL focus | Python focus |
|---|---|---|---|
| 1 | Analyst | SELECT, WHERE, ORDER BY, basic aggregates | pandas basics, read_csv, filtering, simple plots |
| 2 | Position coach | JOINs, GROUP BY, HAVING, multi-table queries | merge, groupby, pivot_table, matplotlib styling |
| 3 | Head coach | Window functions, CTEs, subqueries, CASE | plotly, scipy.stats, play-by-play parsing |
| 4 | General manager | Schema design, indexing, query optimization, dbt basics | scikit-learn, feature engineering, pipelines, model eval |
| 5 | Owner | Prod DB admin, performance tuning, multi-source integration | FastAPI, async, ETL orchestration, deployment, logging |

### Level 1: Analyst
**Identity.** You pull stats on request. You answer factual questions about what happened.
**Capstone.** Lions 2024 season recap notebook. Weekly leaders, defensive standouts, week-over-week changes.
**Unlock.** Clear 8 of 10 stat-lookup challenges + ship the capstone.

### Level 2: Position coach
**Identity.** You develop a position group. You compare your guys to the league.
**Capstone.** WR efficiency report. LaPorta, ARSB, Jameson Williams vs NFC North receivers across 6+ metrics.
**Unlock.** Ship a position scouting card with comparative table + at least 3 charts.

### Level 3: Head coach
**Identity.** Game-by-game decisions. Situational thinking, not just averages.
**Capstone.** Lions 4th-down decision analyzer. Given down, distance, field position, score, and clock, output EV of going vs kicking. Run on every Lions 4th down 2022-2025.
**Unlock.** Working calculator + writeup of one Lions game where it disagreed with Campbell's call.

### Level 4: General manager
**Identity.** Roster construction, multi-year strategy, draft and FA.
**Capstone.** Draft pick value model. Predict career AV from college production, combine, draft position. Train 2000-2020, test 2021-2023, project 2025 Lions class.
**Unlock.** Predictive model with documented features, held-out test set, baseline comparison, one-page writeup.

### Level 5: Owner
**Identity.** Franchise strategy, full-stack thinking.
**Capstone.** Public Lions analytics app, end to end. Raw nflverse → ETL → Postgres → FastAPI → Next.js UI → deployed to `app.1pride.app`.
**Unlock.** Live URL, public repo, README good enough that a stranger could fork and contribute.

## 4. Content structure (tutorial-first)

Each level has the same content shape:

**Lessons (concept blocks).** 6-10 per level. Each one runs 5-10 minutes.

Lesson template:
- **Hook** (1-2 sentences on why this matters)
- **Concept** (the SQL or Python idea, plain language)
- **Lions example** (worked example with real data)
- **Try it** (inline exercise, 2-3 minutes)
- **Common mistakes** (the gotchas)
- **Quick check** (2-3 questions to confirm)

**Challenges (apply).** 8-12 per level.

Challenge template:
- **Prompt** (one sentence: "find the Lions' leading rusher each week of 2024")
- **Expected output** (table shape or value)
- **Difficulty** (rookie / starter / All-Pro)
- **Hint** (collapsible)
- **Solution** (collapsible, available after submission)

**Capstone.**
- **Brief** (one paragraph)
- **Required deliverables** (notebook, queries, optional dashboard)
- **Evaluation criteria** (3-5 specific things it must do)
- **Reference solution** (released after you ship yours)

**Volume per level:**

| Level | Lessons | Challenges | Capstone deliverable |
|---|---|---|---|
| 1 | 6-8 | 10-12 | Season recap notebook |
| 2 | 6-8 | 10-12 | Position scouting card |
| 3 | 8-10 | 8-10 | 4th-down analyzer |
| 4 | 10-12 | 6-8 | Draft pick value model |
| 5 | 8-10 | 4-6 | Deployed analytics app |

Roughly 40-50 lessons, 40-50 challenges, 5 capstones across the whole curriculum.

## 5. Tech stack

**Curriculum site (1pride.app).** Astro Starlight. Static, content-heavy, content-as-files in MDX. Already in your stack from stifledcreative.com.

**L5 capstone app (app.1pride.app).** Next.js + Tailwind + shadcn/ui frontend. FastAPI backend. Built when you reach L5.

**Database.** Postgres. Local via Docker for L1-L3. Managed (Neon or Supabase) starting L4 when you need to point an API at it.

**Data source.** nflverse-data on GitHub. The `nfl_data_py` Python package wraps it cleanly. Play-by-play back to 1999, rosters, schedules, advanced metrics, NextGen tracking.

**Python environment.** `uv` for dependency management. Jupyter notebooks for L1-L3. Python modules and scripts for L4-L5.

**Visualization.** matplotlib (L1-L2) → plotly (L3) → Observable Plot or D3 for the L5 dashboard.

**Deployment.** Vercel for both sites. Neon or Supabase for the database.

**Version control.** Public GitHub repo from day one. Two repos likely: `1pride` (the curriculum site) and `1pride-app` (the L5 capstone).

## 6. Data sources

**Primary.** nflverse-data. Free, robust, well-documented, educationally licensed.

**Secondary.** Pro-Football-Reference for biographical/historical context. Use sparingly, respect TOS.

**Tertiary.** Public Lions team-published stats where they add color.

## 7. IP and branding strategy

**Use freely:**
- The word "Lions" in factual data references. "Lions rushing leader" is descriptive fact.
- Player names, stats, performance data. Public, distributed by nflverse for educational use.
- A palette resembling Honolulu Blue (#0076B6) and Silver (#B0B7BC). Colors are not trademarkable.
- Custom art you create yourself.

**Avoid:**
- The Detroit Lions official logo and wordmark.
- The NFL shield.
- Any team-branded broadcast or merchandise imagery.
- Naming or framing that implies official endorsement.

**Practical move.** "1PRIDE" is generic enough to dodge trademark issues. Default the dataset to Lions, but architect so users can pick any team. This broadens shareability and gives you a wider portfolio surface.

## 8. Visual direction

**Palette.**
- Primary: ~#0076B6 (Honolulu Blue family)
- Secondary: ~#B0B7BC (silver / steel)
- Accent dark: #1A1A1A
- Background: white / off-white

**Typography.** Inter or Geist for UI. JetBrains Mono or Geist Mono for code. EB Garamond optional if you want to echo stifledcreative.com.

**Level badges.** Rank-style insignia, one per level. Clipboard (Analyst), whistle (Position Coach), headset (Head Coach), dossier (GM), pennant or signet (Owner). Flat and simple.

**No NFL logos.** Custom lion silhouette or pixel mascot if you want one, or skip mascot imagery and lean on color + typography.

## 9. Build phases

**Phase 0: Setup (week 1).**
- Buy `1pride.app`
- Set up Astro Starlight project, deploy a placeholder to Vercel
- Create `1pride` GitHub repo (public)
- Set up Postgres locally via Docker
- Load nflverse data
- Write the README with the level progression locked in
- Draft the lesson template MDX component

**Phase 1: Levels 1-2 content (weeks 2-5).**
- Write 6-8 lessons per level using the template
- Write 10-12 challenges per level
- Build the L1 capstone (season recap notebook)
- Build the L2 capstone (scouting card)
- Establish notebook style guide

**Phase 2: Levels 3-4 content (weeks 6-9).**
- More involved lessons (CTEs, window functions, scikit-learn)
- L3 capstone: 4th-down analyzer
- L4 capstone: draft pick value model

**Phase 3: Level 5 build (weeks 10-13).**
- L5 lessons (FastAPI, deployment, ETL)
- Build the deployed app at app.1pride.app
- Scheduled data refresh
- Public launch

**Phase 4: Polish and share (week 14+).**
- Blog post on stifledcreative.com walking through the build
- LinkedIn post
- Add the link to resume + portfolio
- Pitch as a portfolio piece in screens

## 10. Success metrics

**Job search signal.** Recruiter mentions 1PRIDE on a screen. Hiring manager opens the GitHub repo or 1pride.app. Click-through from your resume or LinkedIn.

**Learning signal.** You can write a CTE without looking it up. You can build a scikit-learn pipeline from a blank file. You can deploy a Next.js + FastAPI app end to end without a tutorial.

**Shareability signal.** Repo gets stars from strangers. Other fans clone it for their team. Inquiries from analysts or PMs who want to use it.

## 11. Remaining open decisions

1. **Public from day 1 vs polish-first.** Recommend: public from day 1. The point is a portfolio piece, and "watch me build this" is its own story.
2. **Lions-only vs multi-team architecture.** Recommend: multi-team data layer with Lions as the default. Same code, ten times the shareability.

## 12. Risks and mitigations

**Risk: scope creep on L5.** The capstone is the size of a real product. Mitigation: ship a minimum-viable version in week 13 with one page, one chart, one data refresh. Polish after.

**Risk: nflverse data structure changes.** Mitigation: pin package versions, snapshot data locally, document the schema you depend on.

**Risk: trademark complaint.** Very low if you avoid logos and don't imply NFL endorsement. Mitigation: section 7 rules + generic 1PRIDE branding.

**Risk: time competition with job search and Kellogg.** Job search is the priority. Mitigation: 4-6 hours per week. L1-L2 in spare evenings. L3-L5 are weekend chunks. The project should help the job search, not steal from it.

## 13. What this looks like done

Fourteen weeks from start: a public GitHub repo, a live curriculum at 1pride.app, a deployed analytics app at app.1pride.app, and a blog post on stifledcreative.com walking through the journey.

A hiring manager opens the link, sees the architecture, reads the code, and knows in two minutes that you can do the job.
