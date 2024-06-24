---
layout: article
title: Changing Up My Website
titleTemplate: Gabs' Blog
author: Gabriel Cozma
description: Rebuilding my personal website with Aplós, prioritizing simplicity and readability.
comments: giscus
date: 2024-01-13T11:28:00+02:00
prev: Behind Aplós
next: My Time with VitePress
tags:
  - tech
  - web
  - personal
  - devlog
---

[[toc]]

I had a bunch of problems with my old website, and I thought it's time for something new, something simpler.

## Getting Started

I recently did a project called [Aplós](https://aplos.gxbs.me/), and you can check out the blog about it [here](https://gabs.eu.org/blog/posts/behind-apl%C3%B3s).

**TL;DR**: Made it with VitePress, and it was a breeze to use. Got me thinking, why not redo my website with a focus on making it easy to read? As I didn't really pay attention to that when I built the old one about 2 years ago.

You might wonder, why not just tweak the old one (Gabs Website 3.0)? Well, it's not that good of an idea. Plus, it's a pain to add new stuff, being a Vue Single Page thingy, and even worse, Vue.js <abbr title="Content Delivery Network">CDN</abbr>, which I never understood how to make use of. Tried fixing just the engine, but no luck.

<video src="/assets/blog/changing-up-my-website/oldsite-screencast.webm" controls="true" alt="A screencast of the my Old Website on Firefox showing how laggy the transictions were" />

<figcaption>A screencast of the my Old Website on Firefox RPM Desktop showing how laggy the transictions were</figcaption>

It took me too long to sort out the mess and figure out what the website was even telling its visitors. So, I figured, why not start fresh with a new website that's:

1. Easy to read
2. Simple and easy on the eyes
3. Just performs better overall

Sure, it's not the most original idea, but I'm all about readability > originality.

## Aplós Making Life Easier

Surprisingly (or not), Aplós made things a breeze. Most of the time spend was on making the content, not
the looks. The cool thing was, I only had to set up the `config.mts` the way I liked it and then just create the pages I needed using something as simple as Markdown (`index.md`, `projects.md`, & `findme.md`). When thinking about how to show my projects, I thought, why not reuse the style I used for the Posts List on the blog? Seemed easy, and got it working, and boom.

<picture>
<source srcset="/assets/blog/changing-up-my-website/screenshot-dark.png" media="(prefers-color-scheme:dark)">
<img src="/assets/blog/changing-up-my-website/screenshot.png" alt="Screenshot of me writing this blog in Apostrophe">
</picture>

<figcaption>Screenshot of me writing this blog in Apostrophe</figcaption>

## A Fresh Structure

The new website gave me freedom to show off more stuff (no more of the old website's `<p>` & `<span>` limits). Also, I ditched the "everything in one file" deal. Now, each page has its own spot. Much better, right?

I also made a new Blog using Aplós, so I moved the blog into the main repository. Took me 5 minutes to put it in the `/blog/` folder. Here's the new structure:

| Component | Location             |
| --------- | -------------------- |
| About Me  | `pages`, index.md    |
| Projects  | `pages`, projects.md |
| Find Me   | `pages`, findme.md   |
| Blog      | `pages`, /blog/      |

Way better than the old:

| Component | Location            |
| --------- | ------------------- |
| About Me  | `pages`, index.html |
| Projects  | `pages`, index.html |
| Find Me   | `pages`, index.html |
| Blog      | `blog`              |

<br />

- `pages` = main repository
- `blog` = old blog repository

<br />

> The blog folder keeps it straightforward: `/blog/index.md` is the main page, and `/blogs/posts/` is where I have all the posts.
>
> > Sadly I am still figuring out how to auto-list posts on the posts list page. For now, I've made up a simple way to show the latest posts using the `formatter`.

## Design

Check it out, the website has a new look. Tried to keep the old colors, but it's just a simple Aplós design, inspired by [Duckquill](https://daudix.codeberg.page/duckquill/). Shoutout to [Jamie/Monster](https://jamie.garden/) for helping with design suggestions.

## Wrapping Up

In a nutshell, even though I liked the old website, too many issues led me to something better. Also, it's interesting to see how my taste in website looks changed over the past 2 years... And it's a good thing!
