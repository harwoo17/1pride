// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://1pride.app',
	integrations: [
		starlight({
			title: '1PRIDE',
			description:
				'Run your reps. Climb the depth chart. A self-paced data curriculum on Detroit Lions data.',
			customCss: ['./src/styles/custom.css'],
			// Open Graph + Twitter + theme color. The og:image points at
			// the L5 app's dynamic OG endpoint so both sites share one
			// branded image. Cross-domain OG works fine on every major
			// platform.
			head: [
				// Force light theme — Starlight's dark default rendered a
				// navy backdrop, which is off-palette (blue + silver + white
				// only). Runs before Starlight's own theme script so there's
				// no flash of dark.
				{
					tag: 'script',
					content:
						"try{localStorage.setItem('starlight-theme','light');document.documentElement.dataset.theme='light';}catch(e){}",
				},
				{
					tag: 'meta',
					attrs: { property: 'og:type', content: 'website' },
				},
				{
					tag: 'meta',
					attrs: { property: 'og:site_name', content: '1PRIDE' },
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:image',
						content: 'https://app.1pride.app/opengraph-image',
					},
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:image:alt',
						content: '1PRIDE — Lions Analytics, Campbell Era',
					},
				},
				{
					tag: 'meta',
					attrs: { property: 'og:image:width', content: '1200' },
				},
				{
					tag: 'meta',
					attrs: { property: 'og:image:height', content: '630' },
				},
				{
					tag: 'meta',
					attrs: { name: 'twitter:card', content: 'summary_large_image' },
				},
				{
					tag: 'meta',
					attrs: {
						name: 'twitter:image',
						content: 'https://app.1pride.app/opengraph-image',
					},
				},
				{
					tag: 'meta',
					attrs: { name: 'theme-color', content: '#0076B6' },
				},
				{
					tag: 'meta',
					attrs: {
						name: 'keywords',
						content:
							'Detroit Lions, NFL analytics, Dan Campbell, data curriculum, nflverse, SQL, Python, FastAPI',
					},
				},
				{
					tag: 'meta',
					attrs: { name: 'author', content: 'Joe Harwood' },
				},
			],
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
					items: [
						{ label: 'Overview', slug: 'levels/3-head-coach' },
						{
							label: 'Lessons',
							items: [{ autogenerate: { directory: 'levels/3-head-coach/lessons' } }],
						},
						{
							label: 'Challenges',
							items: [{ autogenerate: { directory: 'levels/3-head-coach/challenges' } }],
						},
					],
				},
				{
					label: 'Level 4 — General manager',
					collapsed: true,
					items: [
						{ label: 'Overview', slug: 'levels/4-general-manager' },
						{
							label: 'Lessons',
							items: [{ autogenerate: { directory: 'levels/4-general-manager/lessons' } }],
						},
						{
							label: 'Challenges',
							items: [{ autogenerate: { directory: 'levels/4-general-manager/challenges' } }],
						},
					],
				},
				{
					label: 'Level 5 — Owner',
					collapsed: true,
					items: [
						{ label: 'Overview', slug: 'levels/5-owner' },
						{
							label: 'Lessons',
							items: [{ autogenerate: { directory: 'levels/5-owner/lessons' } }],
						},
						{ label: 'Capstone', slug: 'levels/5-owner/capstone' },
					],
				},
			],
		}),
	],
});
