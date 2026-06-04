// src/lib/season.ts
//
// Build-time loader for week-by-week season data (e.g. 2026).
// Reads the manifest that add-week.mjs maintains and returns the PUBLISHED weeks.
// Runs in Astro frontmatter (Node context) at build — exactly right for a static
// site that rebuilds when you push a new week.

import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type WeekEntry = {
  week: number;
  file: string;        // e.g. "week-01.parquet"
  published: boolean;
  addedAt?: string;
};

/** All published weeks for a season, sorted ascending. Empty if no manifest yet. */
export async function getPublishedWeeks(season = '2026'): Promise<WeekEntry[]> {
  const manifestPath = path.join(process.cwd(), 'src', 'data', `season-${season}.json`);
  try {
    const all = JSON.parse(await readFile(manifestPath, 'utf8')) as WeekEntry[];
    return all.filter((w) => w.published).sort((a, b) => a.week - b.week);
  } catch {
    return []; // manifest missing or unreadable -> no 2026 data yet
  }
}

/**
 * Build an `extraViews` entry that UNIONs every published week into one view name.
 * Pass the result into <FilmRoom extraViews={[...]} /> so lessons can query e.g.
 * `pbp_2026` as a single table across all published weeks.
 * Returns null when nothing is published yet (so the season toggle can stay disabled).
 */
export async function seasonWeekView(viewName: string, season = '2026') {
  const weeks = await getPublishedWeeks(season);
  if (!weeks.length) return null;
  return {
    name: viewName,
    urls: weeks.map((w) => `/data/${season}/${w.file}`),
  };
}
