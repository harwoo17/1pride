// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://1pride.dev',
	integrations: [
		starlight({
			title: '1PRIDE',
			description:
				'Run your reps. Climb the depth chart. A self-paced data curriculum on Detroit Lions data.',
			customCss: ['./src/styles/custom.css'],
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/harwoo17/1pride',
				},
			],
			sidebar: [
				{
					label: 'Start here',
					items: [
						{ label: 'About 1PRIDE', slug: 'about' },
						{ label: 'How it works', slug: 'how-it-works' },
						{ label: 'Setup', slug: 'setup' },
					],
				},
				{
					label: 'Level 1 — Analyst',
					collapsed: false,
					items: [
						{ label: 'Overview', slug: 'levels/1-analyst' },
						{
							label: 'Lessons',
							items: [{ autogenerate: { directory: 'levels/1-analyst/lessons' } }],
						},
						{
							label: 'Challenges',
							items: [{ autogenerate: { directory: 'levels/1-analyst/challenges' } }],
						},
					],
				},
				{
					label: 'Level 2 — Position coach',
					collapsed: true,
					items: [
						{ label: 'Overview', slug: 'levels/2-position-coach' },
						{
							label: 'Lessons',
							items: [{ autogenerate: { directory: 'levels/2-position-coach/lessons' } }],
						},
						{
							label: 'Challenges',
							items: [{ autogenerate: { directory: 'levels/2-position-coach/challenges' } }],
						},
					],
				},
				{
					label: 'Level 3 — Head coach',
					collapsed: true,
					items: [{ label: 'Overview', slug: 'levels/3-head-coach' }],
				},
				{
					label: 'Level 4 — General manager',
					collapsed: true,
					items: [{ label: 'Overview', slug: 'levels/4-general-manager' }],
				},
				{
					label: 'Level 5 — Owner',
					collapsed: true,
					items: [{ label: 'Overview', slug: 'levels/5-owner' }],
				},
			],
		}),
	],
});
