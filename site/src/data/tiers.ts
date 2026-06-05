// The Depth Chart — 7 tiers (design brief §8 + the 3D avatar spec).
// Climbed via the unlock loop: Analyst → Quality Control → Position Coach
// → Coordinator → Head Coach → General Manager → Owner.

export type Tier = {
	slug: string;
	n: number;
	label: string;
	prop: string;       // distinguishing prop (avatar)
	accent: 'green' | 'gold';
	blurb: string;
	unlock: string;
	lang: 'sql' | 'python';
	/** A real, representative snippet of what you write at this tier. */
	learn: string;
};

export const TIERS: Tier[] = [
	{
		slug: 'analyst',
		n: 1,
		label: 'Analyst',
		prop: 'Headset + clipboard',
		accent: 'green',
		blurb: 'Pull stats on request. SELECT, WHERE, ORDER BY, aggregates.',
		unlock: 'Start here — clear the run-game drill in The Film Room.',
		lang: 'sql',
		learn: `SELECT player_display_name, rushing_yards
FROM weekly_stats
WHERE recent_team = 'DET' AND week = 1
ORDER BY rushing_yards DESC;`,
	},
	{
		slug: 'quality-control',
		n: 2,
		label: 'Quality Control',
		prop: 'Stopwatch',
		accent: 'green',
		blurb: 'Chart the film. JOINs, GROUP BY, comparative reads — tag the plays and time the reps coaches act on.',
		unlock: 'Bank the Analyst drills + the season-recap capstone.',
		lang: 'sql',
		learn: `SELECT s.week, s.result, w.player_display_name, w.receiving_yards
FROM schedules s
JOIN weekly_stats w USING (season, week)
WHERE s.season = 2024 AND w.recent_team = 'DET';`,
	},
	{
		slug: 'position-coach',
		n: 3,
		label: 'Position Coach',
		prop: 'Whistle',
		accent: 'green',
		blurb: 'Develop a group. HAVING, ranks, per-player rate stats.',
		unlock: 'Ship a position-group scouting card.',
		lang: 'sql',
		learn: `SELECT player_display_name,
       SUM(receiving_yards) / NULLIF(SUM(targets), 0) AS yds_per_target
FROM weekly_stats
WHERE position = 'WR' AND recent_team = 'DET'
GROUP BY player_display_name
HAVING SUM(targets) >= 30
ORDER BY yds_per_target DESC;`,
	},
	{
		slug: 'coordinator',
		n: 4,
		label: 'Coordinator',
		prop: 'Call-sheet',
		accent: 'green',
		blurb: 'Situational calls. Window functions, CTEs, EPA by down.',
		unlock: 'Build a 4th-down decision analyzer.',
		lang: 'sql',
		learn: `SELECT week, qtr, epa,
       AVG(epa) OVER (
         ORDER BY game_seconds_remaining DESC
         ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
       ) AS rolling_epa
FROM pbp
WHERE posteam = 'DET' AND down = 4;`,
	},
	{
		slug: 'head-coach',
		n: 5,
		label: 'Head Coach',
		prop: 'Visor + headset',
		accent: 'green',
		blurb: 'Own the game plan. Plotly, scipy, week-over-week trends.',
		unlock: 'Pass the situational-analytics capstone.',
		lang: 'python',
		learn: `import plotly.express as px
fig = px.line(weekly, x="week", y="epa_per_play",
              color="unit", markers=True,
              title="Lions EPA/play — week over week")
fig.show()`,
	},
	{
		slug: 'general-manager',
		n: 6,
		label: 'General Manager',
		prop: 'Roster tablet',
		accent: 'green',
		blurb: 'Build the roster. Schema design, scikit-learn, dbt.',
		unlock: 'Ship a draft-pick value model.',
		lang: 'python',
		learn: `from sklearn.ensemble import RandomForestRegressor
model = RandomForestRegressor(n_estimators=300)
model.fit(X_train, y_train)        # draft-capital → career value
print(model.score(X_test, y_test))`,
	},
	{
		slug: 'owner',
		n: 7,
		label: 'Owner',
		prop: 'Silver blazer + ring',
		accent: 'gold',
		blurb: 'Run the franchise. FastAPI + Next.js, end to end, deployed.',
		unlock: 'Ship the live app. The whole curriculum’s destination.',
		lang: 'python',
		learn: `@app.get("/api/lions/top-receivers")
async def top_receivers(season: int = 2025, limit: int = Query(10, le=50)):
    rows = await db.fetch(TOP_RECEIVERS_SQL, season, limit)
    return {"season": season, "receivers": rows}`,
	},
];
