---
layout: article
title: My Time with VitePress
titleTemplate: Gabs' Blog
author:
  - Gabriel Cozma
description: My personal experience with VitePress and how it transformed my website development process.
comments: giscus
date: 2024-03-11T13:19:00+02:00
update: 2024-06-20T09:03:41Z
prev: Changing Up My Website
next: Why Developer Experience Actually Matters
tags:
  - tech
  - web
  - personal
  - experience
---

As you may know, I recently launched a new project named ["Aplós"](https://aplos.gxbs.me/) – a VitePress theme that introduced me to the world of "Markdown" on the web.

Until then, I wasn't a fan of Zola, Jekyll, VuePress, and all these 'blog' static engines. In fact, I wasn't fond of VitePress initially; it seemed confusing. However, Aplós changed my perspective on static engines and led me to the point where I [rebuilt my website](changing-up-my-website) using both VitePress and Aplós.

I understood that it's actually amazing! I've become a genuine fan of VitePress. It offers a fresh approach to website development. Coming from building Vue & Vite websites, I found it clean and simple. Unlike the complexity of writing in <abbr title="Hyper Text Markup Language">HTML</abbr>/Vue Template, VitePress provides a simpler yet powerful way to create websites. By using VitePress as with the option "custom theme", I had the flexibility of any other Vue app but in a much simpler manner! I even tried converting the [Semantic HTML Website](https://semantichtml.github.io) into VitePress.

Spoiler: <span>It worked!</span> {.spoiler}

## Semantic HTML

If you're not aware, I have a small project called "Semantic HTML Documentation." It's a one-page website that explains the core concepts of Semantic HTML alongside other links for further reading.

Until recently, I used Vue & Vite to build the website and GitHub Pages to host it. And it was a big mess.

<a href="https://github.com/semantichtml/semantichtml.github.io/tree/8e9c5c9972e86b98888084bd86419982d94c8ca6">
<picture>
<source srcset="/assets/blog/my-experience-with-vitepress/screenshot.png" media="(prefers-color-scheme:dark)">
<img src="/assets/blog/my-experience-with-vitepress/screenshot-light.png" alt="A screenshot of the old files of the Semantic HTML Website on GitHub">
</picture>
</a>
<figcaption style="margin-top: 10px">A screenshot of the old files of the Semantic HTML Website on GitHub</figcaption>

It was more complicated than necessary. So, just minutes before going to sleep yesterday, I had a great idea: to rebuild the website from Vue & Vite to VitePress. And I got to work!

Surprisingly, it didn't take long. Since the project already used Vue, I simply copied and pasted to bring all the components to my new branch. Additionally, I moved to <abbr title="Sassy Cascading Style Sheets">SCSS</abbr> for its ease of use. In about 30 minutes, the [Pull Request](https://github.com/semantichtml/semantichtml.github.io/pull/81) was ready!

This demonstrates how easy VitePress is: you can migrate from Vue & Vite to VitePress in about 30 minutes (including converting HTML into Markdown using a nice online tool). The new VitePress version is live at [semantichtml.github.io](https://semantichtml.github.io/).

> **Update:** _After receiving multiple suggestions to simplify the webpage design, similar to the design that multiple [GNOME project webpages have](https://mutter.gnome.org), I decided to rebuild <abbr title="the Semantic HTML Documentation">Semantic's</abbr> website using Aplós. I was pleased with the result, so I switched to the new version. Of course, the process was quick and straightforward._

## Conclusion

It's been over three months since I delved into VitePress, and I have no regrets. I haven't encountered any serious issues with VitePress, and it supports all the features we enjoy with both Vite and Vue. The intresting part is that it hasn't even reached a stable release yet (as of the time of writing, it's on version `1.0.0-rc.45`)! I highly recommend anyone to try VitePress, whether you're coming from Zola/Jekyll, and especially if you're still using VuePress (spoiler: <spoiler>VitePress is waaay better</spoiler>).

Lastly, I want to thank the team at VitePress for making such a good project. **Looking forward to the stable release!**
