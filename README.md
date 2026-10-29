<div align="center">
  <h1>gxbs.dev</h1>
  <p>This is the source code of my personal website, were you're going to find my projects, who am I, and how to find me.<p>
  <small>Powered by <a href="https://github.com/stenodevs/steno">Steno</a> and Deno</small>
</div>

## Development

The development command is:

```sh
deno task dev
```

Which steno serves the site with live reload, usually at `http://localhost:5735`.

While you _obviously_ build it with:

```sh
deno task build
```

The static site is written to `dist/`.

Other cool commands are:

```sh
deno task doctor
deno task preview
```

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
  scripts/             # browser scripts, written in TypeScript (source of truth)
  assets/             # fonts, images, and *generated* browser JS — don't hand-edit assets/*.js
```

I think it's clear why stuff are where they are.

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

Drafts are omitted from production builds. Archived posts remain public and are
listed under `/blog/archive`.
