const outputDir = new URL("../dist/", import.meta.url);

const robots = `User-agent: *
Allow: /

Sitemap: https://gxbs.dev/sitemap.xml
`;

await Deno.writeTextFile(new URL("robots.txt", outputDir), robots);
console.log("[write-robots] dist/robots.txt");
