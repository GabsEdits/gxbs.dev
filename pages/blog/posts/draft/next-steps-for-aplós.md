---
layout: article
title: Next Steps Aplós
titleTemplate: Gabs' Blog
author: Gabriel Cozma
description: The future of Aplós and what's next for the project.
comments: giscus
date: 2024-05-06T10:08:00+03:00
prev: Changing Up My Website
tags:
  - tech
  - web
  - oss
  - nuxt
---

It's been more then 4 months since I released the blog "Behind Aplós", since then, a lot has changed for Aplós, including adding special layouts, better styles and most importantly **it became an NPM Package**.

While this groth is really nice, it started to block what could I *actually* do with this project. I first decided to make Aplós an VitePress theme because this was the only good "SSG" I really knew back then, but now, I started to find more SSGs that could maybe be an alternative to VitePress, don't give me wrong, VitePress *is* great, but it has some limitations, as it's *for* docs, not really blogs, and others.

Which took me to **Nuxt Themes**, I recently found out about these by looking at <https://docs.vmst.io>, and it felt that it was what I wanted all along. It seems that Nuxt Themes have way more freedom in what you could do, while still providing what I loved the most about VitePress, Configuration files. Another thing is that Nuxt Themes are meant to be an NPM Package, rather then me trying to build a package full of files, and then trying to import them (while that works too, it's not as easy and quite annoying). Another issue is that VitePress (at least to my knowledge) doesn't offer custom views and other useful options by default. Another issue was that it felt really hard to develop an package without having a proper demo app inside it (that might be possible with VitePress too using PNPM Workspaces).

That's why, I am introducing a project (under the Aplós project) called **Safi** - Aplós, but as an Nuxt Theme, that might offer in the future more options and a better user experience for the reader then what Aplós provides, that could lead to the two project switching roles. Of course, Safi is still an *experiment* as it is, and might not even fully take off.

