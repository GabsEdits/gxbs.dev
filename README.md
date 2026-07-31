# gxbs.dev

Gabriel Cozma's portfolio and blog, built with [Steno](https://github.com/stenodevs/steno).

The commissions/studio backend lives in `studio/` as its own Astro app,
deployed independently at `studio.gxbs.dev`. It is not part of the Steno
build — see `studio/README.md`.

## Requirements

- Deno 2

## Development

```sh
deno task dev
```

Steno serves the site with live reload, normally at `http://localhost:5735`.

## Production build

```sh
deno task doctor
deno task build
deno task preview
```

The static site is written to `dist/`.

The build uses the official Steno Tailwind and SEO plugins. The Tau layouts use
Tailwind utilities directly; the theme stylesheet only initializes Tailwind,
defines the bundled fonts and tokens, and contains interaction styles that need
pseudo-elements or keyframes. Tailwind scans the generated HTML and writes
`dist/assets/tailwind.css`. The SEO plugin writes `dist/sitemap.xml`,
`dist/feed.xml`, and `dist/atom.xml`.

The init README currently advertises Tailwind plugin `^0.8.0`, but that release
is not available on JSR. This prototype uses the published, Steno-compatible
`^0.3.0` line instead.

## Structure

```text
content/
  .steno/config.yml   # site, theme, and collection configuration
  blog/               # Markdown posts
  *.md                # public routes
theme/
  styles.css           # Tailwind entry and every site style
  layouts/            # Tau layouts
  components/         # shared Tau components
  assets/             # browser scripts, fonts, and images
```

The public site includes `/`, `/projects`, `/gallery`, `/partnerships`, and
`/blog`. Studio and its server APIs are intentionally not part of the Steno
content tree or static output.

## Blog posts

Add posts under `content/blog/` with this frontmatter:

```yaml
---
layout: article
title: My Post
date: 2026-07-31
tags: [steno, web]
draft: false
archived: false
description: A short search and social description.
canonical: https://gxbs.dev/blog/my-post
image: https://gxbs.dev/assets/og/blog/my-post.png
---
```

Drafts are omitted from production builds. Archived posts remain public and
are listed under `/blog/archive`.
