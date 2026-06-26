<div align="center">
  <img src="https://cdn.jsdelivr.net/npm/twemoji@11.3.0/2/svg/1f33f.svg" width="64">
  <h1>gxbs.dev (ethos)</h1>
  <p>This is the source code of my personal website, were you're going to find my projects, who am I, and how to find me.<p>
  <small>Powered by <a href="https://astro.build/">Astro</a></small>
</div>

## Overview

This repository powers a content-first website with:

- a homepage (`/`)
- a commissions/partnerships experience (`/partnerships`)
- a markdown-driven blog (`/blog` and `/blog/[slug]`)
- a private studio gate and session dashboard (`/studio`, `/studio/[session]`)

The project uses Astro for routing/rendering, Svelte for interactive UI, and Tailwind CSS v4 for styling.

## Tech Stack

- Astro 6
- Svelte 5 (`@astrojs/svelte`)
- Tailwind CSS 4 + `@tailwindcss/typography`
- TypeScript
- Node adapter (`@astrojs/node`) in `standalone` mode
- Markdown parsing in blog detail pages via `gray-matter` + `marked`

## Requirements

- Node.js `>=22.12.0` (enforced in `package.json`)
- pnpm (recommended, lockfile is included)

## Quick Start

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:4321`.

## Available Scripts

From `package.json`:

- `pnpm dev` - start local dev server
- `pnpm build` - create production build
- `pnpm preview` - preview the production build locally
- `pnpm astro -- <command>` - run Astro CLI commands directly

## Project Structure

```text
gxbs.dev/
  public/                  # static assets (images, favicons, fonts)
  src/
    components/            # Svelte/Astro UI components
    content/blog/          # markdown blog posts
    layouts/               # shared Astro layouts
    pages/                 # file-based routes
    styles/global.css      # Tailwind import + theme + font faces
    utils/                 # utility modules
  astro.config.mjs         # Astro config + Node adapter + Tailwind Vite plugin
  svelte.config.js         # Svelte preprocess config
  src/content.config.ts    # content collection schema
```

## Content and Blog Workflow

Blog posts live in `src/content/blog/*.md` and are rendered by:

- listing page: `src/pages/blog/index.astro`
- detail page: `src/pages/blog/[slug].astro`

Use this frontmatter shape:

```yaml
---
title: My Post Title
date: 2026-04-25
tags:
  - astro
  - svelte
draft: false
---
```

Notes:

- `draft: true` posts are hidden from `/blog` and redirected away on detail pages.
- The slug is derived from the markdown filename.

## Environment Variables

Create a local env file before using the commissions form integration:

```bash
cat > .env <<'EOF'
VITE_TOKEN=your_telegram_bot_token
EOF
```

The commissions form (`src/components/Commissions.svelte`) sends submissions to Telegram using this token.

If you do not set `VITE_TOKEN`, the partnerships form submission will fail.

## Studio Routes

- `src/pages/studio/index.astro`: access gate view
- `src/pages/studio/[session].astro`: session-based dashboard route (`prerender = false`)

Current behavior in `src/components/studio/StudioDashboard.svelte`:

- `DEV_MODE` is set to `true`, so mock data is used.
- Set `DEV_MODE` to `false` to fetch real data from `https://api.gxbs.dev/api/studio/${uuid}`.

## Styling and Assets

- Global styles: `src/styles/global.css`
- Typography plugin enabled for rich markdown rendering
- Custom `PPEditorialNew` & `PPNeueMontreal` font files are loaded from `public/fonts/`

## Build and Deployment

Build for production:

```bash
pnpm build
```

This project uses the Astro Node adapter in standalone mode (`astro.config.mjs`), suitable for Node hosting platforms.

Typical deployment flow:

1. Install dependencies
2. Run `pnpm build`
3. Run the generated Node server output from `dist/`

If your platform supports Astro directly, follow its Astro Node adapter deployment docs and point it to this repository.
