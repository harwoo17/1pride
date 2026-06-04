// src/components/FilmRoom.tsx
//
// The Film Room — a live, in-browser SQL playground.
// Loads DuckDB-WASM client-side, registers parquet datasets as views, runs the
// learner's query, shows a results table, and auto-renders a Vega-Lite chart.
//
// Mount it as a client-only island so the heavy WASM never runs on the server:
//   ---  (in a .astro lesson page)
//   import FilmRoom from '../components/FilmRoom.tsx';
//   const entry = ...; // your lesson content entry
//   ---
//   <FilmRoom client:only="react"
//             initialQuery={entry.data.starterQuery}
//             datasets={entry.data.dataset}
//             vizSpec={entry.data.vizSpec} />
//
// Setup:
//   npx astro add react
//   npm i @duckdb/duckdb-wasm codemirror @codemirror/lang-sql vega vega-lite vega-embed
//
// Styling uses the brief's CSS variables (--honolulu, --silver, --retro-green, --ink).

import { useEffect, useRef, useState, useCallback } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import { EditorView, basicSetup } from 'codemirror';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import embed from 'vega-embed';

// --- dataset registry ---------------------------------------------------
// Map a view name (what lessons reference, e.g. `player_stats_2025`) to its parquet URL.
// 2025 is bundled in /public/data/2025/. 2026 weeks come from the manifest (see note).
const DATASETS: Record<string, string> = {
  player_stats_2025: '/data/2025/player_stats_2025.parquet',
  pbp_2025: '/data/2025/pbp_2025.parquet',
  schedules_2025: '/data/2025/schedules_2025.parquet',
  rosters_2025: '/data/2025/rosters_2025.parquet',
  // 2026: build these from /src/data/season-2026.json at page load and pass via props,
  // e.g. pbp_2026 -> '/data/2026/week-01.parquet' (or a UNION view of published weeks).
};

type Props = {
  initialQuery: string;
  datasets: string[];     // view names this lesson needs registered
  vizSpec?: Record<string, any>; // optional explicit Vega-Lite spec; else auto-suggested
  extraViews?: { name: string; urls: string[] }[]; // multi-file views (e.g. 2026 weeks)
};

type Cell = string | number | boolean | null;
type Row = Record<string, Cell>;

// DuckDB returns BigInt for SUM/COUNT — coerce so React + Vega can handle it.
const norm = (v: unknown): Cell =>
  typeof v === 'bigint' ? Number(v) : (v as Cell);

function autoSpec(columns: string[], rows: Row[]): Record<string, any> | null {
  if (!rows.length) return null;
  const isNum = (c: string) => typeof rows[0][c] === 'number';
  const cat = columns.find((c) => typeof rows[0][c] === 'string');
  const measure = columns.find(isNum);
  if (!cat || !measure) return null; // nothing obvious to chart
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    mark: { type: 'bar', cornerRadiusEnd: 3 },
    encoding: {
      y: { field: cat, type: 'nominal', sort: '-x', title: null },
      x: { field: measure, type: 'quantitative', title: measure },
      color: { value: '#0076B6' },
    },
    config: {
      background: null,
      view: { stroke: null },
      axis: { labelFont: 'JetBrains Mono', titleFont: 'JetBrains Mono', grid: false },
      font: 'Saira',
    },
  };
}

export default function FilmRoom({ initialQuery, datasets, vizSpec, extraViews = [] }: Props) {
  const editorHost = useRef<HTMLDivElement>(null);
  const editorView = useRef<EditorView | null>(null);
  const chartHost = useRef<HTMLDivElement>(null);
  const connRef = useRef<duckdb.AsyncDuckDBConnection | null>(null);

  const [status, setStatus] = useState<'booting' | 'ready' | 'running' | 'error'>('booting');
  const [error, setError] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);

  // --- boot DuckDB-WASM + register views (once) -------------------------
  useEffect(() => {
    let cancelled = false;
    let db: duckdb.AsyncDuckDB | null = null;
    let worker: Worker | null = null;

    (async () => {
      try {
        const bundles = duckdb.getJsDelivrBundles();
        const bundle = await duckdb.selectBundle(bundles);
        const workerUrl = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
        );
        worker = new Worker(workerUrl);
        db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(workerUrl);

        const conn = await db.connect();
        for (const name of datasets) {
          const url = DATASETS[name];
          if (!url) throw new Error(`Unknown dataset "${name}" — add it to the registry.`);
          await db.registerFileURL(
            `${name}.parquet`,
            new URL(url, window.location.origin).href,
            duckdb.DuckDBDataProtocol.HTTP,
            false
          );
          // Expose it under the bare name the lessons use.
          await conn.query(
            `CREATE OR REPLACE VIEW ${name} AS SELECT * FROM read_parquet('${name}.parquet');`
          );
        }
        // Multi-file views (e.g. 2026 weeks unioned into one table)
        for (const v of extraViews) {
          const files: string[] = [];
          for (let i = 0; i < v.urls.length; i++) {
            const fname = `${v.name}__${i}.parquet`;
            await db.registerFileURL(
              fname,
              new URL(v.urls[i], window.location.origin).href,
              duckdb.DuckDBDataProtocol.HTTP,
              false
            );
            files.push(fname);
          }
          const list = files.map((f) => `'${f}'`).join(', ');
          await conn.query(
            `CREATE OR REPLACE VIEW ${v.name} AS SELECT * FROM read_parquet([${list}]);`
          );
        }
        if (cancelled) return;
        connRef.current = conn;
        setStatus('ready');
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? String(e));
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      connRef.current?.close().catch(() => {});
      db?.terminate().catch(() => {});
      worker?.terminate();
    };
  }, [datasets.join(','), JSON.stringify(extraViews)]);

  // --- mount CodeMirror editor (once) -----------------------------------
  useEffect(() => {
    if (!editorHost.current || editorView.current) return;
    editorView.current = new EditorView({
      doc: initialQuery,
      extensions: [basicSetup, sql({ dialect: PostgreSQL })],
      parent: editorHost.current,
    });
    return () => {
      editorView.current?.destroy();
      editorView.current = null;
    };
  }, []);

  // --- run the query ----------------------------------------------------
  const run = useCallback(async () => {
    const conn = connRef.current;
    const query = editorView.current?.state.doc.toString() ?? '';
    if (!conn || !query.trim()) return;
    setStatus('running');
    setError('');
    try {
      const table = await conn.query(query);
      const cols = table.schema.fields.map((f) => f.name);
      const data: Row[] = table.toArray().map((r: any) => {
        const o: Row = {};
        for (const c of cols) o[c] = norm(r[c]);
        return o;
      });
      setColumns(cols);
      setRows(data);
      setStatus('ready');
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setStatus('error');
    }
  }, []);

  // Cmd/Ctrl+Enter to run
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [run]);

  // --- render chart whenever rows change --------------------------------
  useEffect(() => {
    if (!chartHost.current) return;
    const spec = vizSpec ?? autoSpec(columns, rows);
    if (!spec || !rows.length) { chartHost.current.innerHTML = ''; return; }
    embed(chartHost.current, { ...spec, data: { values: rows } }, { actions: false })
      .catch((e) => { if (chartHost.current) chartHost.current.textContent = `Chart error: ${e.message}`; });
  }, [columns, rows, vizSpec]);

  return (
    <div className="film-room" style={{ border: '1px solid var(--silver)', borderRadius: 10, overflow: 'hidden', fontFamily: 'Saira, system-ui' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--honolulu)', color: '#fff' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: 2 }}>THE FILM ROOM</span>
        <button
          onClick={run}
          disabled={status !== 'ready' && status !== 'running'}
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, padding: '6px 14px', borderRadius: 6, border: '1px solid #fff', background: status === 'running' ? 'var(--silver)' : '#fff', color: 'var(--ink)', cursor: 'pointer' }}
        >
          {status === 'booting' ? 'Loading…' : status === 'running' ? 'Running…' : '▶ Run  ⌘↵'}
        </button>
      </div>

      <div ref={editorHost} style={{ borderBottom: '1px solid var(--silver)' }} />

      {status === 'booting' && (
        <p className="fr-loader" style={{ padding: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--honolulu)' }}>
          Warming up The Film Room… {/* swap in <SpinningFootball /> here */}
        </p>
      )}

      {status === 'error' && (
        <pre style={{ padding: 12, margin: 0, color: '#b00', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
          {error}{'\n\n'}Tip: run  DESCRIBE SELECT * FROM {datasets[0]};  to check column names.
        </pre>
      )}

      {rows.length > 0 && (
        <div style={{ overflowX: 'auto', maxHeight: 320 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
            <thead>
              <tr>{columns.map((c) => (
                <th key={c} style={{ position: 'sticky', top: 0, textAlign: 'left', padding: '6px 10px', background: 'var(--silver-light, #D7DCE0)', color: 'var(--ink)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{c}</th>
              ))}</tr>
            </thead>
            <tbody>
              {rows.slice(0, 200).map((r, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--silver)' }}>
                  {columns.map((c) => (
                    <td key={c} style={{ padding: '5px 10px', color: 'var(--ink)' }}>{String(r[c] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 200 && (
            <p style={{ padding: '6px 10px', margin: 0, fontSize: 11, color: 'var(--silver)' }}>Showing first 200 of {rows.length} rows.</p>
          )}
        </div>
      )}

      <div ref={chartHost} style={{ padding: 12 }} />
    </div>
  );
}
