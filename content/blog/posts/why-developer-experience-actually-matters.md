---
layout: article
title: Why Developer Experience Actually Matters
titleTemplate: Gabs' Blog
author:
  - Gabriel Cozma
comments: giscus
date: 2024-05-08T12:05:00+03:00
update: 2024-08-24T12:45:00+03:00
type: featured
head:
  - - meta
    - property: og:image
      content: /assets/blog/why-developer-experience-actually-matters/cover.png
  - - meta
    - name: og:description
      content: A significant issue in open-source projects is the lack of a proper good developer experience; this blog looks into why and how it matters.
  - - meta
    - name: og:site_name
      content: Why Developer Experience Actually Matters | Gabs' Blog
  - - meta
    - name: twitter:card
      content: summary_large_image
  - - meta
    - name: twitter:image
      content: /assets/blog/why-developer-experience-actually-matters/cover.png
  - - meta
    - name: twitter:title
      content: Why Developer Experience Actually Matters | Gabs' Blog
prev: My Time with VitePress
next: MacOS for Web Development
tags:
  - Tech
  - DevEx
  - OSS
---

Developer Experience, or DevEx, is a term that's been thrown around a lot lately, but what does it actually mean? And why does it matter, especially in open-source projects? Let's dive deep into this topic and see why it's important to have a good Developer Experience in your projects.

---

Before we dive deep, what even _is_ Developer Experience? Well, as mentioned by [Gwen Davis](https://github.blog/2023-06-08-developer-experience-what-is-it-and-why-should-you-care/): It "refers to the systems, technology, process, and culture that influence the effectiveness of software development". Of course, it's important for the average developer to maintain their project while having a basic level of <abbr title="Developer Experience">DevEx</abbr> to allow easy modifications to the already built project, and to make the code easy on the eye.

## The Issue

And here comes the issue, DevEx isn't something widely used across projects, including <abbr title="Open Source Software">OSS</abbr>. Normally, once an open-source project gets quite big, their existing maintainer should start seeking collaborators to help maintain, fix, and add features to the software. The potential new collaborators surf the code to find issues or other pieces of code that could be improved, and that's where DevEx comes in.

## Why It Matters in Open Source

DevEx is important to allow potential new collaborators to find the bad piece of code faster and understand it better, even if they don't know the language that was used to build the project.

Big projects happen to not provide good DevEx, which leads to the contributor having to do extra work to understand the code. We can take a big project like [Next.js](https://nextjs.org) as an example. Surfing its source code, we can see that much of the code is actually hard to understand, including a big mess of files, objects, and other code that doesn't mix well. And I am not picking specifically on Next.js; don't get me wrong, it's a great project, but its DevEx - it's bad. There are countless more projects that have an even worse DevEx than Next.js, which need to find a fix.

## How to Prevent Bad Developer Experience?

Sadly, there isn't a standard way of how we can get to better DevEx, but there are a set of things that can be done to prevent it:

- **Deployment frequency**: Believe it or not, the way new software is released also is important, playing a key role in first understanding how you can make the changes.

- **Formatting the code**: It might not play a big role, but it's still important. When potential contributors open the code, they should quickly understand where the key areas are.

- **Consistent APIs and Interfaces**: Maintain consistency in APIs and user interfaces across the projects. This consistency reduces cognitive load on potential developers and makes it easier for them to switch between different parts of the ecosystem.

- **Modern Development Tools**: It shouldn't be a surprise that modern development tools allow the developer to understand the code better, while old tech just makes it harder.

By focusing on these key areas, we can help prevent bad Developer Experience and create a more productive and enjoyable environment for new collaborators to work in.

## Outside the Lines of Code

We've already talked about the issues new contributors face when trying to contribute to new projects, but what about what gets the contributors to your projects and the ecosystem?

### GNOME

This is where **GNOME** comes in. GNOME is known for its great DevEx, which led to the big boom in indie GNOME apps. We need to look into how GNOME has managed to build such a great DevEx at a larger scale. We can see that GNOME managed to do it by building a stable platform and streamlining the tooling used to develop apps, including by building the [GNOME Circle](https://circle.gnome.org) - Applications and libraries extending the GNOME ecosystem.

As I mentioned, it's not only about how you code your project, but also how you distribute it, how the platform components work, how good the developer documentation is, and a lot more.

To have a better understanding, let's look into how developers create new GNOME apps:

1. Before anything, they get started with the [amazing documentation](https://developer.gnome.org/) built by GNOME, where you can find what your first steps should be.

   - Including an introduction to the app you will use to build it (GNOME Builder). That allows them to start off easily.

2. **Choosing the right Programming Language**: With the power of a great community, GNOME provides a long list of programming languages that can be used to build the applications. That already makes it easy for the developer to build an app with their language of choice.

3. **Design**: [The GNOME Human Interface Guidelines](https://developer.gnome.org/hig/) offer step-by-step guides on how you can build your application easily and efficiently, not only improving the DevEx, but also the <abbr title="User Experience">UserEx</abbr>.

4. **Distribution**: With Flatpak, it allows the Developer to have an easy experience to publish their package to the world.

These 4 steps allow the developer to easily build the application and also make it easy for new contributors to join in on the project. Which means that GNOME has created a great DevEx for everyone.

There are multiple other things that allowed GNOME to build such a platform, including SDKs, that help the contributors create the project with the "Works on my machine" issue. For that, Platforms exist:

[![A schema of what a "Platform" includes](https://blogs.gnome.org/tbernard/files/2019/12/platform-parts-1-768x432.png)](https://blogs.gnome.org/tbernard/2019/12/04/there-is-no-linux-platform-1/)

<figcaption>A schema of what a "Platform" includes</figcaption>

Of course, not everything is perfect, which is why there are complaints of the limitations that GNOME provides. There is a great list of [things to admit when responding to complaints](https://fosstodon.org/@bragefuglseth/112192368132343854) made by [Brage Fuglseth](https://bragefuglseth.dev/).

## Conclusion

In conclusion, I'd like to say that yes, **DevEx matters for a sustainability of projects, especially within the open-source community**. As developers, maintainers, and contributors, it's important that we recognize the impact that DevEx has on project accessibility, collaboration, and longevity.

It's important to start the project with a great DevEx, by using up to date technologies and follow the documentation given by the source right. It's good to follow what GNOME is trying to do in arias like Web Development, where DevEx is really bad. The good part is that good DevEx is gaining popularity, and starting to be seen in other general projects.

As open source gains more collaborators, it's important to maintain DevEx at it's highest levels, to make sure that the projects we are starting can be continued and developed for as long as possible.

> This my first non-devlog blog post, and I hope you enjoyed it. If you have any feedback, feel free to [open an issue](https://github.com/GabsEdits/gxbs.dev/issues/new), I will be happy to hear it.
