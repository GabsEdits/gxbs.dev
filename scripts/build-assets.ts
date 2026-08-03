import { transpile } from "jsr:@deno/emit";

const scriptsDir = new URL("../theme/scripts/", import.meta.url);
const assetsDir = new URL("../theme/assets/", import.meta.url);

for await (const entry of Deno.readDir(scriptsDir)) {
  if (!entry.isFile || !entry.name.endsWith(".ts")) continue;

  const source = new URL(entry.name, scriptsDir);
  const result = await transpile(source);
  const code = result.get(source.href);
  if (!code) {
    throw new Error(`Failed to transpile ${entry.name}`);
  }

  const outName = entry.name.replace(/\.ts$/, ".js");
  await Deno.writeTextFile(new URL(outName, assetsDir), code);
  console.log(`[build-assets] ${entry.name} -> theme/assets/${outName}`);
}
