// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'https://1pride.app',
    integrations: [starlight({
        title: '1PRIDE',
        description:
            'Training the next generation of NFL analysts. Run your reps, climb the depth chart.',
        customCss: ['./src/styles/custom.css'],
        // Override Starlight's built-in splash Hero with the Honolulu
        // Rebuild hero (Hero.astro). Per design brief §3: green grid
        // line, keyed lion + tap-to-roar, spinning wireframe football,
        // solid/outline hero type, blueprint annotations.
        components: {
            Hero: './src/components/Hero.astro',
        },
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
            // Sound system (brief §11). Football audio, accessibility-first:
            //   · NEVER autoplay — every sound fires on a user gesture only
            //   · snap  → synthesized, on primary button/link press
            //   · whistle → synthesized, exposed as window.PRIDE.whistle()
            //     for level-up / correct-answer (paired with a visual)
            //   · roar → lives on the hero lion (Hero.astro), not here
            //   · Global mute toggle injected bottom-right, persists
            //     'pride-muted' to localStorage (read by Hero.astro too)
            //   · Never conveys information by sound alone
            {
                tag: 'script',
                content:
                    "(function(){var KEY='pride-muted';var actx=null;function muted(){return localStorage.getItem(KEY)==='1';}function ctx(){if(!actx&&(window.AudioContext||window.webkitAudioContext))actx=new(window.AudioContext||window.webkitAudioContext)();if(actx&&actx.state==='suspended')actx.resume();return actx;}function snap(){if(muted())return;var x=ctx();if(!x)return;var t=x.currentTime;var o=x.createOscillator(),g=x.createGain();o.type='square';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(90,t+0.04);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.14,t+0.004);g.gain.exponentialRampToValueAtTime(0.0001,t+0.07);o.connect(g).connect(x.destination);o.start(t);o.stop(t+0.08);var nb=x.createBuffer(1,x.sampleRate*0.03,x.sampleRate),d=nb.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);var n=x.createBufferSource();n.buffer=nb;var ng=x.createGain();ng.gain.setValueAtTime(0.12,t);ng.gain.exponentialRampToValueAtTime(0.0001,t+0.03);n.connect(ng).connect(x.destination);n.start(t);n.stop(t+0.04);}function whistle(){if(muted())return;var x=ctx();if(!x)return;var t=x.currentTime;for(var k=0;k<2;k++){var o=x.createOscillator(),g=x.createGain();o.type='sine';var s=t+k*0.16;o.frequency.setValueAtTime(2600,s);o.frequency.linearRampToValueAtTime(3100,s+0.02);var lfo=x.createOscillator(),lg=x.createGain();lfo.frequency.setValueAtTime(28,s);lg.gain.setValueAtTime(45,s);lfo.connect(lg).connect(o.frequency);g.gain.setValueAtTime(0.0001,s);g.gain.exponentialRampToValueAtTime(0.16,s+0.01);g.gain.setValueAtTime(0.16,s+0.1);g.gain.exponentialRampToValueAtTime(0.0001,s+0.14);o.connect(g).connect(x.destination);o.start(s);o.stop(s+0.15);lfo.start(s);lfo.stop(s+0.15);}}window.PRIDE={whistle:whistle,snap:snap,muted:muted};document.addEventListener('click',function(e){var t=e.target;if(!t.closest)return;if(t.closest('#prideMute'))return;if(t.closest('button, a[href], [role=button]'))snap();});function mountToggle(){if(document.getElementById('prideMute'))return;var b=document.createElement('button');b.id='prideMute';b.type='button';b.setAttribute('aria-label','Toggle sound');b.style.cssText='position:fixed;right:16px;bottom:16px;z-index:9999;width:40px;height:40px;border-radius:999px;border:1px solid #B0B7BC;background:#0076B6;color:#fff;font-family:monospace;font-size:15px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;';function paint(){b.textContent=muted()?'\\uD83D\\uDD07':'\\uD83D\\uDD0A';b.setAttribute('aria-pressed',muted()?'true':'false');}paint();b.addEventListener('click',function(){localStorage.setItem(KEY,muted()?'0':'1');paint();if(!muted())snap();});document.body.appendChild(b);}if(document.body)mountToggle();else document.addEventListener('DOMContentLoaded',mountToggle);})();",
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
                    { label: 'The Depth Chart', slug: 'depth-chart' },
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
		}), react()],
});