import { defineConfig } from "vitepress";
import { genFeed } from "./feed.ts";
import { imgMark } from "@mdit/plugin-img-mark";
const accent = "#DA6944";

// https://vitepress.dev/reference/site-config

export default defineConfig({
  lang: "en-US",
  title: "Gabriel Cozma (Gabs)",
  description: "Human, Front-End Developer & Open Source Contributor",

  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    author: "Gabriel Cozma",
    articles: {
      giscus: {
        repo: "GabsEdits/gxbs.dev",
        repoid: "R_kgDOLDBscA",
        categoryid: "DIC_kwDOLDBscM4CdfK8",
        category: "Blog Comments",
      },
    },
    nav: {
      title: "Gabs",
      links: [
        { text: "Blog", link: "/blog/" },
        { text: "Find", link: "/find" },
        { text: "Projects", link: "/projects" },
      ],
      git: "https://github.com/GabsEdits/gxbs.dev",
      rss: "/atom.xml",
    },
    footer: {
      copyright: true,
      poweredBy: true,

      links: [
        { text: "Commissions", link: "/commissions" },
        { text: "Photos", link: "https://photo.gxbs.dev" },
        { text: "GitHub", link: "https://github.com/GabsEdits" },
        { text: "Mastodon", link: "https://vmst.io/@gabs" },
      ],

      message: "Searching for the best future 🚀",

      madeby: {
        show: false,
        name: "Gabs",
        link: "https://gxbs.dev",
      },

      copyleft: {
        show: true,
        license: "MIT License",
        info: "https://github.com/GabsEdits/gxbs.dev/blob/main/LICENSE",
      },
    },
  },

  markdown: {
    config: (md) => {
      md.use(imgMark);
    },
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
    ["link", { rel: "me", href: "https://vmst.io/@gabs" }],
    ["meta", { name: "theme-color", content: "#f17755" }],
    ["meta", { name: "og:locale", content: "en_IE" }],
    ["meta", { name: "og:type", content: "website" }],
    ["meta", { name: "og:locale", content: "en" }],
    [
      "meta",
      {
        name: "og:description",
        content: "Human, Front-end Developer & Open Source Contributor.",
      },
    ],
    [
      "meta",
      {
        name: "description",
        content: "Human, Front-End Developer & Open Source Contributor.",
      },
    ],
    ["meta", { name: "og:site_name", content: "Gabriel Cozma (Gabs)" }],

    ["meta", { name: "og:title", content: "Gabriel Cozma (Gabs)" }],
    ["meta", { name: "og:url", content: "https://gxbs.dev" }],
    [
      "meta",
      { name: "og:image", content: "https://gxbs.dev/assets/cover.png" },
    ],
    [
      "meta",
      {
        name: "twitter:image",
        content: "https://gxbs.dev/assets/cover.png",
      },
    ],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: "Gabriel Cozma (Gabs)" }],
    [
      "meta",
      {
        name: "twitter:description",
        content: "Human, Front-end Developer & Open Source Contributor.",
      },
    ],
    ["meta", { name: "twitter:url", content: "https://gxbs.dev/" }],
    ["link", { rel: "canonical", href: "https://gxbs.dev/" }],
    [
      "meta",
      {
        httpEquiv: "Content-Security-Policy",
        content:
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'self';",
      },
    ],
  ],
  sitemap: {
    hostname: "https://gxbs.dev/",
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @use "sass:color";
          $color-accent: ${accent};
          $color-accent-l: color.scale($color-accent, $lightness: -60%);
          $bg-color-d: color.scale($color-accent, $lightness: -90%, $saturation: -60%);
          $bg-color-l: color.scale($color-accent, $lightness: 95%, $saturation: -65%);
          $bg-color-s-d: mix($color-accent, $bg-color-d, 20%);
          $bg-color-s-l: color.scale($color-accent, $lightness: 75%);
          $nav-bg-l: color.scale($bg-color-s-l, $alpha: -20%, $lightness: 60%, $saturation: -30%);
          $nav-bg-d: color.scale($bg-color-s-d, $alpha: -20%, $lightness: -40%);
          `,
        },
      },
    },
  },
  buildEnd: genFeed,
});
