import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// The Playbook — guided lessons (brief §9b). Each lesson seeds a query
// into The Film Room and teaches a Vega-Lite visualization. Lives outside
// Starlight's docs collection, rendered by src/pages/lessons/[...slug].astro.
const lessons = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
	schema: z.object({
		title: z.string(),
		tier: z.enum([
			'Analyst',
			'Quality Control',
			'Position Coach',
			'Coordinator',
			'Head Coach',
			'General Manager',
			'Owner',
		]),
		order: z.number(),
		section: z.string().default('The Playbook'),
		kicker: z.string().optional(),
		dataset: z
			.union([z.string(), z.array(z.string())])
			.transform((d) => (Array.isArray(d) ? d : [d])),
		prereqs: z.array(z.string()).default([]),
		starterQuery: z.string(),
		vizSpec: z.record(z.any()).optional(),
	}),
});

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	lessons,
};
