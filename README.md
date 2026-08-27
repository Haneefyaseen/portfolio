# Portfolio — Mohamed Haneef Yaseen

A 3D, scroll-driven personal site built with nothing but HTML, CSS and JavaScript.
There is no build step, no bundler and no `node_modules`; every dependency is
loaded from a CDN at runtime.

## Running it

The 3D layer uses native ES modules, which browsers refuse to load from
`file://`. Serve the folder over HTTP:

```bash
python -m http.server 5173
```

Then open <http://127.0.0.1:5173>. Any static server works equally well
(`npx serve`, VS Code Live Server, and so on).

Double-clicking `index.html` will **not** work. Browsers block ES modules on
`file://` URLs, so the 3D layer never loads. The page detects this and tells you
what to do rather than sitting on the loading screen.

## Deploying

Upload the folder as-is to any static host — GitHub Pages, Vercel, Netlify or
Cloudflare Pages. There is nothing to compile.

## Dependencies

All pinned to exact versions in `index.html`. Nothing is installed locally.

| Library | Version | Source | Purpose |
| --- | --- | --- | --- |
| Three.js | 0.185.1 | jsDelivr, via `<script type="importmap">` | WebGL rendering |
| GSAP | 3.15.0 | cdnjs | Animation engine |
| ScrollTrigger | 3.15.0 | cdnjs | Scroll-linked timelines |
| Lenis | 1.3.26 | unpkg | Inertial smooth scrolling |
| Space Grotesk / JetBrains Mono | — | Google Fonts | Typography |

Three.js resolves through an import map, so `import * as THREE from "three"`
and `three/addons/...` work directly in the browser. To upgrade, change the
version in the import map and the two `<script src>` tags.

## Structure

```
index.html          markup, import map, CDN tags, meta and JSON-LD
css/base.css        reset, design tokens, typography, nav, preloader
css/sections.css    per-section composition
js/data.js          all site content
js/render.js        builds the DOM from data.js
js/main.js          entry point and fallbacks
js/scroll.js        Lenis + ScrollTrigger, shared scroll state
js/scene.js         renderer, camera, lights, bloom, render loop
js/objects.js       the morphing geometry and particle field
js/animations.js    DOM reveals, timeline draw, counters, nav state
```

## Editing content

Everything you would normally want to change lives in `js/data.js` — roles,
dates, bullet points, skills, projects, education and links. Markup and
animations pick up the changes automatically.

To add an email address and turn the contact button into a `mailto:` link, set
`contact.email` in `js/data.js`. Leaving it empty falls back to LinkedIn and
shows a location card instead.

## How the 3D works

One fixed canvas sits behind all content. A single normalised scroll value in
`js/scroll.js` drives the camera, the geometry and the colours, so the scene
stays in sync with the DOM no matter how fast you scroll.

Each section owns a stage. On entering one, the central object crossfades to a
new shape while an `InstancedMesh` of shards flies between per-section layouts
(sphere, ring, stack, orbit, grid, helix, arc, scatter).

## Performance and accessibility

- Pixel ratio is capped, and particle count, bloom and geometry detail drop on
  phones and low-core devices.
- The render loop pauses when the tab is hidden.
- `prefers-reduced-motion` skips smooth scrolling, the 3D scene and all
  reveal animations; the content stays fully readable.
- If WebGL or a CDN is unavailable, the site degrades to a static page rather
  than breaking.
