# Abhishek Dukare — Portfolio v4 · "The Agent Graph"

The site is one continuous 3D agent graph. Scrolling flies the camera from `START` through each node (About → Experience → Projects → Skills) to `END` (Contact).

**Stack:** Vite · React · TypeScript · Three.js via React Three Fiber (+ postprocessing bloom) · GSAP ScrollTrigger · Lenis · Framer Motion

## Edit content

All copy, links and media live in **`src/data/content.ts`**. Search it for `TODO(abhishek)` to find items waiting on confirmation.

- Resume PDF → `public/resume/Abhishek_Dukare_AI_Engineer_Resume.pdf` (path set in `site.resume`)
- Photos → originals in `design/photos/`, web versions in `public/img/photos/` (`cwebp -q 80 -resize 1100 0 in.png -o out.webp`, plus a `-sm` 640px copy). Which photo goes where is set in `photos` in `content.ts`.
- Headings: wrap words in `*asterisks*` to set them in the serif italic accent.
- Videos → put files in `public/video/` and set `media.heroLoop` / `media.dataCore` (or a project's `media`) in `content.ts`. With no video the site uses the pure Three.js scene.

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/
```

## How it fits together

| Path | What |
|---|---|
| `src/three/` | The lazy-loaded 3D scene: graph layout, GLSL for nodes/edges/pulses, camera rig |
| `src/lib/stationTracker.ts` | Maps scroll position → continuous "station" value the camera follows |
| `src/sections/` | One component per section; readable without 3D |
| `src/components/` | Loader, cursor, graph nav, command palette (`/` or ⌘K), project cards, skills constellation |

- **Mobile (<768px):** ~150 nodes, no bloom, simpler camera.
- **`prefers-reduced-motion`:** no 3D, no smooth scroll; a static SVG graph and simple fades.
- **No WebGL:** same static SVG fallback.

## Deploy

`.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages on every push to `main`.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Custom domain later: add `public/CNAME` containing the domain.

The previous site is kept in `legacy/` until v4 is live.

---

Designed & built by [Webforge](https://webforge.in).
