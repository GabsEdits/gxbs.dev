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

The project uses Astro for routing/rendering, Svelte for interactive UI, and
Tailwind CSS v4 for styling.

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

- `draft: true` posts are hidden from `/blog` and redirected away on detail
  pages.
- The slug is derived from the markdown filename.

## Environment Variables

Create a local env file before using the commissions form integration:

```bash
cat > .env <<'EOF'
VITE_TOKEN=your_telegram_bot_token
PUBLIC_STUDIO_API_BASE_URL=https://api.gxbs.dev
PUBLIC_STUDIO_USE_MOCK_DATA=true
STUDIO_COMMISSIONS_FILE=/absolute/path/to/studio-commissions.json
STUDIO_ADMIN_USERNAME=owner
STUDIO_ADMIN_PASSWORD=change_me
STUDIO_AUTH_SECRET=replace_with_a_long_random_secret
STUDIO_KOFI_URL=https://ko-fi.com/gabs
STUDIO_GITHUB_SPONSORS_URL=https://github.com/sponsors/gabs
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
STUDIO_EMAIL_FROM="gxbs Studio <studio@your-domain.com>"
STUDIO_EMAIL_REPLY_TO=hello@your-domain.com
EOF
```

The commissions form (`src/components/Commissions.svelte`) sends submissions to
Telegram using this token. `PUBLIC_STUDIO_API_BASE_URL` controls where the
Studio client fetches production project data from.
`PUBLIC_STUDIO_USE_MOCK_DATA` only applies during local development; set it to
`false` to exercise the live API path. `STUDIO_COMMISSIONS_FILE` optionally
overrides the server-side JSON persistence file used by Studio admin APIs.
`STUDIO_ADMIN_USERNAME` and `STUDIO_ADMIN_PASSWORD` define admin credentials.
`STUDIO_AUTH_SECRET` signs the admin session cookie and should be a long random
secret. `STUDIO_KOFI_URL` sets the default client payment page used by the admin
payment-link action. `STUDIO_GITHUB_SPONSORS_URL` is optional fallback for
sponsor-style payments. `RESEND_API_KEY` enables transactional Studio emails via
Resend. `STUDIO_EMAIL_FROM` controls the sender identity (must be verified in
Resend). `STUDIO_EMAIL_REPLY_TO` is optional and sets the reply-to mailbox.

If you do not set `VITE_TOKEN`, the partnerships form submission will fail. If
Ko-fi/GitHub payment URLs are not set, Studio defaults to
`https://ko-fi.com/gabs`.

## Studio Routes

- `src/pages/studio/index.astro`: access gate view
- `src/pages/studio/[session].astro`: session-based dashboard route
  (`prerender = false`)
- `src/pages/studio/admin.astro`: authenticated admin dashboard route
- `src/pages/studio/admin/login.astro`: admin sign-in route

Current behavior in `src/components/studio/StudioDashboard.svelte`:

- Client mode fetches from `PUBLIC_STUDIO_API_BASE_URL` (defaults to
  `https://api.gxbs.dev`).
- Local mock data can be enabled in development with
  `PUBLIC_STUDIO_USE_MOCK_DATA`.
- In `mode="admin"`, approved commissions can generate Ko-fi payment links and
  mark invoices paid.
- Admin commission records are persisted server-side via
  `src/pages/api/studio/commissions*.ts`.
- Studio admin route and admin APIs are protected by a signed cookie in
  `src/middleware.ts`.
- Lifecycle emails are sent on review/approve/deny/payment updates using Resend
  and templates from `src/utils/studioEmailTemplates.ts`.

## Styling and Assets

- Global styles: `src/styles/global.css`
- Typography plugin enabled for rich markdown rendering
- Custom `PPEditorialNew` & `PPNeueMontreal` font files are loaded from
  `public/fonts/`

## Build and Deployment

Build for production:

```bash
pnpm build
```

This project uses the Astro Node adapter in standalone mode
(`astro.config.mjs`), suitable for Node hosting platforms.

Typical deployment flow:

1. Install dependencies
2. Run `pnpm build`
3. Run the generated Node server output from `dist/`

If your platform supports Astro directly, follow its Astro Node adapter
deployment docs and point it to this repository.
