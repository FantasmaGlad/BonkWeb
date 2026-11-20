import { copyFileSync, existsSync, writeFileSync } from "node:fs";

// Pull requests, tests and local work build from a fixed test release: their checks never depend on
// release timing. The deployment reads the latest release first, and --sample then keeps it.
if (process.argv.includes("--sample")) {
  if (!existsSync("src/data/releases.json")) {
    copyFileSync("src/data/releases.sample.json", "src/data/releases.json");
  }
  process.exit(0);
}

const REPO = "FantasmaGlad/Bonk";
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "bonk-site",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

const get = async (url) => {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
};

const release = await (await get(`https://api.github.com/repos/${REPO}/releases/latest`)).json();
const base = `https://github.com/${REPO}/releases/download/${release.tag_name}`;
const sums = await (await get(`${base}/SHA256SUMS`)).text();
const hashes = new Map(
  [...sums.matchAll(/^([0-9a-f]{64})\s+\*?(\S+)$/gm)].map(([, hash, name]) => [name, hash]),
);

// Only files listed in SHA256SUMS: a download the site offers always has a published hash.
const assets = release.assets
  .filter((asset) => hashes.has(asset.name))
  .map((asset) => ({ name: asset.name, size: asset.size, sha256: hashes.get(asset.name) }))
  .sort((a, b) => a.name.localeCompare(b.name));
if (assets.length === 0) throw new Error("no asset of the latest release is listed in SHA256SUMS");

const data = {
  version: release.tag_name.replace(/^v/, ""),
  tag: release.tag_name,
  published: release.published_at.slice(0, 10),
  base,
  assets,
};
writeFileSync("src/data/releases.json", `${JSON.stringify(data, null, 2)}\n`);
// Published with the site: the hourly check compares it with the latest release.
writeFileSync("public/version.txt", `${data.version}\n`);
console.log(`src/data/releases.json: ${data.tag}, ${assets.length} files`);
