#!/usr/bin/env node
/**
 * add-week.mjs — Owner tool for adding a 2026 (or later) week of data.
 *
 * What it does:
 *   1. Reads a CSV export of one week's nflverse data
 *   2. Converts it to parquet via DuckDB
 *   3. Writes it to /public/data/<season>/week-NN.parquet
 *   4. Adds/updates the entry in /src/data/season-<season>.json (creating the manifest if missing)
 *
 * Then you just commit + push and Vercel rebuilds — the week appears behind the
 * owner-gated season toggle in The Film Room.
 *
 * Setup (once):
 *   npm i -D @duckdb/node-api
 *   # optional: add to package.json -> "scripts": { "add-week": "node scripts/add-week.mjs" }
 *
 * Usage:
 *   node scripts/add-week.mjs --week 1 --in ~/exports/det_week1.csv
 *   node scripts/add-week.mjs --week 2 --in ./w2.csv --season 2026
 *   node scripts/add-week.mjs --week 3 --in ./w3.csv --draft   # stage it unpublished
 *
 * Place this file at: scripts/add-week.mjs (relative to repo root).
 */

import { parseArgs } from 'node:util';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { DuckDBInstance } from '@duckdb/node-api';

const REPO_ROOT = process.cwd();

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

// --- parse args ---------------------------------------------------------
const { values } = parseArgs({
  options: {
    week:    { type: 'string' },
    in:      { type: 'string' },
    season:  { type: 'string', default: '2026' },
    draft:   { type: 'boolean', default: false },
  },
});

const weekNum = Number(values.week);
if (!Number.isInteger(weekNum) || weekNum < 1 || weekNum > 18) {
  fail('Pass a valid --week between 1 and 18.  e.g. --week 1');
}
if (!values.in) fail('Pass the CSV path with --in.  e.g. --in ./det_week1.csv');

const csvPath = path.resolve(values.in);
if (!existsSync(csvPath)) fail(`CSV not found: ${csvPath}`);

const season   = values.season;
const ww        = String(weekNum).padStart(2, '0');
const fileName  = `week-${ww}.parquet`;
const dataDir   = path.join(REPO_ROOT, 'public', 'data', season);
const outPath   = path.join(dataDir, fileName);
const manifest  = path.join(REPO_ROOT, 'src', 'data', `season-${season}.json`);
const published = !values.draft;

// --- CSV -> parquet -----------------------------------------------------
console.log(`\n→ Converting ${path.basename(csvPath)} → public/data/${season}/${fileName}`);
await mkdir(dataDir, { recursive: true });

const instance   = await DuckDBInstance.create();
const connection = await instance.connect();
// read_csv_auto sniffs types/headers; COPY writes a single tidy parquet file.
const esc = (p) => p.replace(/'/g, "''");
await connection.run(
  `COPY (SELECT * FROM read_csv_auto('${esc(csvPath)}', header = true))
   TO '${esc(outPath)}' (FORMAT PARQUET);`
);
console.log('  ✓ parquet written');

// --- update manifest ----------------------------------------------------
await mkdir(path.dirname(manifest), { recursive: true });
let weeks = [];
if (existsSync(manifest)) {
  try {
    weeks = JSON.parse(await readFile(manifest, 'utf8'));
    if (!Array.isArray(weeks)) throw new Error('manifest is not an array');
  } catch (e) {
    fail(`Could not read existing manifest (${manifest}): ${e.message}`);
  }
}

const entry = { week: weekNum, file: fileName, published, addedAt: new Date().toISOString() };
const idx = weeks.findIndex((w) => w.week === weekNum);
if (idx >= 0) {
  weeks[idx] = entry;
  console.log(`  ✓ manifest entry for week ${weekNum} updated`);
} else {
  weeks.push(entry);
  console.log(`  ✓ manifest entry for week ${weekNum} added`);
}
weeks.sort((a, b) => a.week - b.week);
await writeFile(manifest, JSON.stringify(weeks, null, 2) + '\n', 'utf8');

// --- done ---------------------------------------------------------------
console.log(`\n✓ Week ${weekNum} ready (${published ? 'PUBLISHED' : 'draft / unpublished'}).`);
console.log('  Next:  git add -A && git commit -m "data: 2026 week ' + weekNum + '" && git push\n');
