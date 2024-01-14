---
title: "Behind Aplós"
titleTemplate: Gabs' Blog
author: Gabriel Cozma
description: My awesome post description
date: 2024-01-04T21:26:00+02:00
---

# {{ $frontmatter.title }}

For the past two weeks, I've been working on a new project called "Aplós"! I had a lot of fun making this project, and here's what I learned:

## Why?

In the last week of December, I came across a fun project by Daudix called [Duckquill](https://daudix.codeberg.page/duckquill/). It inspired me to create something similar but for CSS & Vue.js.

## The Start

Initially, I began the project with HTML & CSS, creating a template with styles. Later, I decided to switch to **Vue.js & Vite** to leverage the powerful Vue.js Components system. This is how Cards/Custom Containers became a thing, making website creation a breeze:

```vue
<Warning warning="Your warning here" />
```

This approach simplified the process of building websites in minutes. However, I realized there was an even better option for creating such websites.

## Vitepress

While I've known about Vitepress for a while, I never fully explored it. With the new project, incorporating Vitepress seemed like one of the best decisions. Markdown is easy to use, and Vitepress simplified website configuration compared to the 100 files you had to change in the old Vite version. The structure was straightforward:

```
.
├── package.json
├── package-lock.json
└── pages/
    ├── index.md
    └── .vitepress/
        ├── config.mts
        ├── custom.scss
        └── theme/
            └── all-theme-stuff
```

To build a website with Vitepress, all you need to know is that `config.mts` exists, where you'll spend your time configuring the website. Just create a Markdown file inside the `pages` folder, and you're good to go.\
Well, yes, you do have to do some work inside `config.mts`, but it's not that hard.

So, I moved my project to Vitepress. It wasn't that hard, as Aplós acted as custom stylesheet for the default Vitepress themes. I could use cool `Custom Containers` & `pre`'s without having to configure them.

Everything was fun, but there was one issue: Some parts of the theme you **can't** configure through our unified `config.mts` file.  I got the great idea of making the Vue.js Components (Navigation & Footer) fully changeable inside the `config.mts` file, using the `{ useData }` feature provided by Vitepress. For the Navigation, it wasn't that hard:

```html
<nav>
    <ul>
        <li class="h1-nav">
            <a href="/" @click="setActive('/')">
                <h1>{{ site.title }}</h1>
            </a>
        </li>
        <li v-for="(navItem, index) in navigation" :key="index">
            <a :href="navItem.link" :class="{ 'active': isActive(navItem.link) }" @click="setActive(navItem.link)">
                {{ navItem.text }}
            </a>
        </li>
        <li v-if="theme.nav.git">
            <a :href="theme.nav.git">
                <GitAlt />
            </a>
        </li>
    </ul>
</nav>
```

It was quite easy, as I was just taking the required data. With that done, this is how your configuration looked:

```ts
themeConfig: {
  nav: {
    links: [ // Navigation Links
      { text: "Something", link: "/something" },
      // And you can add the same
    ],
     git: "https://github.com/GabsEdits/blog", 
  },
},
```

I was happy with the result, so I did the same with the footer, which was even easier:

```ts
footer: {
  copyright: true,
  poweredBy: true,

  madeby: {
    show: true,
    name: "Gabs",
    link: "https://gxbs.me",
  },
},
```

Now that can easily be changed in the config. There is one more issue: The Colors that still need to be fully changed inside the theme folder.

While looking for ideas on how these can be configured, I got the idea to make a script that takes the accent data from the `config.mts` and creates it into a `<style>` tag. Somehow, I made it come true, but I got mad when I saw that it made the website slower and added a script that is run when you open the page.

Again, I was searching for options to not have an issue like this. While looking through the [Duckquill](https://daudix.codeberg.page/duckquill/) source code, I saw an `SCSS` file that created the color palette, and I saw how powerful `SCSS` is. That's when I got the idea to also do something like this, so instead of having to make background-color (dark & light), background-color-second (dark & light), background-color-mute (dark & light), and color-accent, you now will need just a color-accent, and even that is optional! Then, I moved all of my stylesheets to SCSS. But still, we had one issue, the same issue why all of this started, to have the accent color inside the `config.mts`.

Sadly, I didn't find an option, so I got the idea (also from Duckquill) to make a `custom.scss` file where we will have the accent color **and** other custom styles not from the theme. I did that, for now, we will keep this as it is, maybe in the future we will be able to connect an SCSS file to a TypeScript/Javascript file.

## The rest
After two weeks of building this project during the winter holidays, I am happy to announce that we reached the stable version, and we will continue making this project even better.

I want to thank every project that helped make this come true, special thanks to [Duckquill](https://daudix.codeberg.page/duckquill/).