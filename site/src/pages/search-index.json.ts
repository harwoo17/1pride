import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Build-time page index for the inline header search (Search.astro).
// Small + static — title, url, section, blurb for every doc + lesson.
export const GET: APIRoute = async () => {
	const items: { title: string; url: string; section: string; desc: string }[] = [];

	const docs = await getCollection('docs');
	for (const d of docs) {
		const id = d.id;
		const url = id ? `/${id}/` : '/';
		const section = id.startsWith('levels/')
			? 'Levels'
			: id === '' ? 'Home' : 'Start here';
		items.push({
			title: d.data.title,
			url,
			section,
			desc: d.data.description ?? '',
		});
	}

	const lessons = await getCollection('lessons');
	for (const l of lessons) {
		items.push({
			title: l.data.title,
			url: `/lessons/${l.id}`,
			section: l.data.section ?? 'The Playbook',
			desc: '',
		});
	}

	return new Response(JSON.stringify(items), {
		headers: { 'content-type': 'application/json' },
	});
};
