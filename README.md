# Abhishek Dukare — Portfolio v4 · Light edition (branch `v4-light`)

Apple-style: light surfaces, one idea per screen, motion driven by scroll.
The dark 3D "Agent Graph" edition lives on branch `v4-agent-graph`.

**Stack:** Vite · React · TypeScript · GSAP ScrollTrigger · Lenis · Framer Motion (no 3D engine)

**Signature moments**
- Black "Pro" hero: an 81-frame sequence (from `design/video/hero-turn.mov`, via `design/video/export_dark.py`) scrubs as you scroll — Abhishek turns to face you while the name gives way to the headline.
- Scroll-lit statement, bento numbers, sticky IngestIQ story (13-node graph lights up per step), a film that grows edge-to-edge, "Get to know"-style experience cards with detail sheets, segmented-control toolkit.

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
| `src/sections/` | One component per section; readable without 3D |
| `src/components/` | Nav, Reveal / Highlight / Count motion primitives, command palette (`/` or ⌘K) |

- **Mobile:** portrait hero frames (`public/img/hero-dark/m`), stacked layouts.
- **`prefers-reduced-motion`:** no pinning or smooth scroll; the hero stacks name → portrait → headline.

## Deploy

`.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages on every push to `main`.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Custom domain later: add `public/CNAME` containing the domain.

The previous site remains on `main`.

---

Designed & built by [Webforge](https://webforge.in).
