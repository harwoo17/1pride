// The Depth Chart — 7 tiers (design brief §8 + the 3D avatar spec).
// Climbed via the unlock loop: Analyst → Scout → Position Coach →
// Coordinator → Head Coach → General Manager → Owner.

export type Tier = {
	slug: string;
	n: number;
	label: string;
	prop: string;       // distinguishing prop (avatar)
	accent: 'green' | 'gold';
	blurb: string;
	unlock: string;
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
	},
	{
		slug: 'quality-control',
		n: 2,
		label: 'Quality Control',
		prop: 'Stopwatch',
		accent: 'green',
		blurb: 'Chart the film. JOINs, GROUP BY, comparative reads — tag the plays and time the reps coaches act on.',
		unlock: 'Bank the Analyst drills + the season-recap capstone.',
	},
	{
		slug: 'position-coach',
		n: 3,
		label: 'Position Coach',
		prop: 'Whistle',
		accent: 'green',
		blurb: 'Develop a group. HAVING, ranks, per-player rate stats.',
		unlock: 'Ship a position-group scouting card.',
	},
	{
		slug: 'coordinator',
		n: 4,
		label: 'Coordinator',
		prop: 'Call-sheet',
		accent: 'green',
		blurb: 'Situational calls. Window functions, CTEs, EPA by down.',
		unlock: 'Build a 4th-down decision analyzer.',
	},
	{
		slug: 'head-coach',
		n: 5,
		label: 'Head Coach',
		prop: 'Visor + headset',
		accent: 'green',
		blurb: 'Own the game plan. Plotly, scipy, week-over-week trends.',
		unlock: 'Pass the situational-analytics capstone.',
	},
	{
		slug: 'general-manager',
		n: 6,
		label: 'General Manager',
		prop: 'Roster tablet',
		accent: 'green',
		blurb: 'Build the roster. Schema design, scikit-learn, dbt.',
		unlock: 'Ship a draft-pick value model.',
	},
	{
		slug: 'owner',
		n: 7,
		label: 'Owner',
		prop: 'Silver blazer + ring',
		accent: 'gold',
		blurb: 'Run the franchise. FastAPI + Next.js, end to end, deployed.',
		unlock: 'Ship the live app. The whole curriculum’s destination.',
	},
];
