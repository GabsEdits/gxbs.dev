import path from "path";
import { writeFileSync } from "fs";
import { Feed } from "feed";
import { createContentLoader, type SiteConfig } from "vitepress";

const baseUrl = `https://gabs.eu.org`;

export async function genFeed(config: SiteConfig) {
  const feed = new Feed({
    title: "Gabs' Blog",
    description:
      "This is a blog, where I post about my projects, and other things I find interesting.",
    id: baseUrl,
    link: baseUrl,
    language: "en",
    image: "https://blog.gabs.eu.org/android-chrome-512x512.png",
    favicon: `${baseUrl}/favicon.ico`,
    copyright: "Copyright (c) 2024-present, Gabriel Cozma/Gabs",
    feedLinks: {
      atom: `${baseUrl}/atom.xml`,
    },
  });

  const posts = await createContentLoader("blog/posts/*.md", {
    excerpt: true,
    render: true,
  }).load();

  posts.sort(
    (a, b) =>
      +new Date(b.frontmatter.date as string) -
      +new Date(a.frontmatter.date as string)
  );

  for (const { url, excerpt, frontmatter, html } of posts) {
    feed.addItem({
      title: frontmatter.title,
      id: `${baseUrl}${url}`,
      link: `${baseUrl}${url}`,
      description: excerpt,
      content: html?.replace(/&ZeroWidthSpace;/g, ""),
      author: [
        {
          name: frontmatter.author,
          link: frontmatter.twitter
            ? `https://twitter.com/${frontmatter.twitter}`
            : undefined,
        },
      ],
      date: frontmatter.date,
    });
  }

  writeFileSync(path.join(config.outDir, "atom.xml"), feed.atom1());
}
