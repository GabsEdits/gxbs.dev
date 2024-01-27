import { defineConfig } from "vitepress";
import { genFeed } from "./rss.ts";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "en-US",
  title: "Gabs",
  description:
    "Gabs' Personal Website. Explore my world: About me, My Projects, and more. Connect and collaborate.",

  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    author: "Gabriel Cozma/Gabs",
    nav: {
      links: [
        { text: "Projects", link: "/projects" },
        { text: "Find Me", link: "/findme" },
        { text: "Blog", link: "/blog/" },
      ],
      git: "https://github.com/GabsEdits/gabs.eu.org",
      rss: "/feed.rss",
    },
    footer: {
      copyright: true,
      poweredBy: true,

      madeby: {
        show: true,
        name: "Gabs",
        link: "https://gabs.eu.org",
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
    ["meta", { name: "og:site_name", content: "Gabs | Gabriel Cozma" }],
    ["meta", { name: "twitter:title", content: "Gabs | Gabriel Cozma" }],
    [
      "meta",
      {
        name: "twitter:description",
        content:
          "Gabs' Personal Website. Explore my world: About me, My Projects, and more. Connect and collaborate",
      },
    ],
    ["meta", { name: "twitter:url", content: "https://next.gxbs.me" }],
  ],
  sitemap: {
    hostname: "https://next.gxbs.me",
  },
  buildEnd: genFeed,
});
