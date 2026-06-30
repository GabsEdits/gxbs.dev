import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "src", "content", "blog");
const OUTPUT_DIR = path.join(ROOT, "public", "og", "blog");

const LOGO_SVG = `
  <path d="M10.5611 0C11.8704 0 13.124 0.236903 14.2809 0.669847C11.4469 3.01458 9.64274 6.54776 9.64273 10.4999C9.64273 14.4521 11.4469 17.9851 14.2809 20.3299C13.124 20.7628 11.8704 21 10.5611 21C4.72838 21 0 16.2989 0 10.4999C3.01747e-05 4.70099 4.7284 3.00037e-05 10.5611 0Z" fill="#1A1A1A"/>
  <path d="M34.4387 0C40.2715 0 45 4.70097 45 10.4999C45 16.2989 40.2715 21 34.4387 21C33.1294 21 31.8758 20.7629 30.7188 20.3299C33.5528 17.9851 35.357 14.4521 35.357 10.4999C35.357 6.5478 33.5528 3.01472 30.7188 0.669986C31.8758 0.236985 33.1294 6.73506e-06 34.4387 0Z" fill="#1A1A1A"/>
  <path d="M22.5001 1.36965C27.5721 1.36965 31.6837 5.45748 31.6837 10.5001C31.6837 15.5426 27.572 19.6305 22.5001 19.6305C17.4281 19.6305 13.3165 15.5426 13.3164 10.5001C13.3164 5.45748 17.4281 1.36965 22.5001 1.36965Z" fill="#1A1A1A"/>
`;

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const splitTitle = (title, maxLineLength = 30, maxLines = 3) => {
  const words = title.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const tentative = current ? `${current} ${word}` : word;
    if (tentative.length <= maxLineLength) {
      current = tentative;
      continue;
    }

    if (current) {
      lines.push(current);
    }
    current = word;

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  if (
    lines.length === maxLines && words.join(" ").length > lines.join(" ").length
  ) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.]{3,}$/, "")}...`;
  }

  return lines;
};

const truncateText = (value, maxLength) =>
  value.length > maxLength
    ? `${value.slice(0, maxLength - 1).trimEnd()}...`
    : value;

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const buildOgSvg = ({ slug, title, tags, date }) => {
  const tagsLine = truncateText(tags.join(" · "), 64);
  const titleLines = splitTitle(title || slug, 32, 3);

  const lineHeight = 72;
  const titleStartY = 270;
  const titleSvg = titleLines
    .map((line, index) => {
      const y = titleStartY + index * lineHeight;
      return `<text x="600" y="${y}" text-anchor="middle" font-size="58" font-style="italic" font-weight="700" fill="#1A1A1A" font-family="'Times New Roman', Georgia, serif">${
        escapeXml(line)
      }</text>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#FDFDFB"/>
  <text x="80" y="104" font-size="28" font-weight="300" fill="#1A1A1A" font-family="'Times New Roman', Georgia, serif">${
    escapeXml(date)
  }</text>
  <text x="1120" y="104" text-anchor="end" font-size="28" font-weight="300" fill="#1A1A1A" font-family="'Times New Roman', Georgia, serif">${
    escapeXml(tagsLine)
  }</text>
  ${titleSvg}
  <line x1="80" y1="442" x2="1120" y2="442" stroke="#E5E7EB" stroke-width="2"/>
  <g transform="translate(80 548) scale(2)">
    ${LOGO_SVG}
  </g>
</svg>`;
};

const ensureOutputDirectory = async () => {
  await mkdir(OUTPUT_DIR, { recursive: true });
};

const cleanOldPngs = async () => {
  const entries = await readdir(OUTPUT_DIR, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
      .map((entry) => rm(path.join(OUTPUT_DIR, entry.name), { force: true })),
  );
};

const generate = async () => {
  await ensureOutputDirectory();
  await cleanOldPngs();

  const entries = await readdir(BLOG_DIR, { withFileTypes: true });
  const mdFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  let generatedCount = 0;

  for (const fileName of mdFiles) {
    const slug = fileName.replace(/\.md$/, "");
    const sourcePath = path.join(BLOG_DIR, fileName);
    const source = await readFile(sourcePath, "utf-8");
    const { data } = matter(source);

    if (data?.draft) {
      continue;
    }

    const title = String(data?.title ?? slug);
    const tags = Array.isArray(data?.tags)
      ? data.tags.map((tag) => String(tag)).filter(Boolean)
      : [];
    const date = formatDate(data?.date);

    const svg = buildOgSvg({ slug, title, tags, date });
    const outPath = path.join(OUTPUT_DIR, `${slug}.png`);

    const pngBuffer = await sharp(Buffer.from(svg))
      .resize(WIDTH, HEIGHT)
      .png({ compressionLevel: 9, quality: 100 })
      .toBuffer();

    await writeFile(outPath, pngBuffer);
    generatedCount += 1;
  }

  process.stdout.write(`Generated ${generatedCount} blog OG PNG file(s).\n`);
};

generate().catch((error) => {
  process.stderr.write(
    `Failed to generate blog OG PNGs: ${
      error instanceof Error ? error.message : String(error)
    }\n`,
  );
  process.exitCode = 1;
});
