import { defineConfig } from "vitepress";
import { genFeed } from "./feed.ts";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "en-US",
  title: "Gabs",
  description:
    "Human, Front-end Developer & Open Source Contributor",

  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    author: "Gabriel Cozma",
    blog: {
      data: {
        repo: "GabsEdits/gabs.eu.org",
        repoid: "R_kgDOLDBscA",
        categoryid: "DIC_kwDOLDBscM4CdfK8",
      },
    },
    nav: {
      links: [
        { text: "Blog", link: "/blog/" },
        { text: "Find Me", link: "/findme" },
        { text: "Projects", link: "/projects" },
      ],
      git: "https://github.com/GabsEdits/gabs.eu.org",
      rss: "/atom.xml",
    },
    footer: {
      copyright: true,
      poweredBy: true,

      madeby: {
        show: false,
        name: "Gabs",
        link: "https://gabs.eu.org",
      },

      copyleft: {
        show: true,
        license: "MIT License",
        info: "https://opensource.org/license/mit/",
      },
    },
  },

  markdown: {
    container: {
      warningLabel: "⚠ Warning",
      tipLabel: "Tip",
      dangerLabel: "⚠ Danger",
      infoLabel: "Info",
    },
  },
  head: [
    ["meta", { name: "author", content: "Gabriel Cozma" }],
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["link", { rel: "me", href: "https://fosstodon.org/@gxbs" }],
    ["meta", { name: "theme-color", content: "#f17755" }],
    ["meta", { name: "og:type", content: "website" }],
    ["meta", { name: "og:locale", content: "en" }],
    ["meta", { name: "og:description", content: "Human, Front-end Developer & Open Source Contributor." }],
    ["meta", { name: "og:site_name", content: "Gabs | Gabriel Cozma" }],
    ["meta", { name: "twitter:title", content: "Gabs | Gabriel Cozma" }],
    [
      "meta",
      {
        name: "twitter:description",
        content:
          "Human, Front-end Developer & Open Source Contributor.",
      },
    ],
    ["meta", { name: "twitter:url", content: "https://gabs.eu.org" }],
  ],
  sitemap: {
    hostname: "https://gabs.eu.org",
  },
  buildEnd: genFeed,
});
