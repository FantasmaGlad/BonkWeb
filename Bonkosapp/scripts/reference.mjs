import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const VERSION = readFileSync("src/downloads.ts", "utf8").match(/VERSION = "([^"]+)"/)?.[1];
if (!VERSION) throw new Error("VERSION not found in src/downloads.ts");

async function download() {
  const base = `https://github.com/FantasmaGlad/Bonk/releases/download/v${VERSION}`;
  const name = `bonk-cli-${VERSION}-linux-x86_64.tar.gz`;
  const get = async (file) => {
    const response = await fetch(`${base}/${file}`);
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  };
  const sums = (await get("SHA256SUMS")).toString();
  const expected = sums.match(
    new RegExp(`^([0-9a-f]{64})\\s+\\*?${name.replace(/\./g, "\\.")}$`, "m"),
  )?.[1];
  const archive = await get(name);
  if (!expected || createHash("sha256").update(archive).digest("hex") !== expected) {
    throw new Error(`${name}: hash does not match SHA256SUMS`);
  }
  const dir = mkdtempSync(join(tmpdir(), "bonk-reference-"));
  writeFileSync(join(dir, name), archive);
  const untar = spawnSync("tar", ["-xzf", name], { cwd: dir });
  if (untar.status !== 0) throw new Error(untar.stderr.toString());
  return join(dir, `bonk-cli-${VERSION}-linux-x86_64`, "bonk");
}

const bonk = process.argv[2] ?? (await download());

function run(args) {
  const result = spawnSync(bonk, args, { env: { PATH: process.env.PATH, NO_COLOR: "1" } });
  if (result.status !== 0) throw new Error(`bonk ${args.join(" ")}: ${result.stderr}`);
  return result.stdout.toString().trimEnd();
}

function commands(path) {
  const help = run([...path, "--help"]);
  const block = help.split("\n\nCommands:\n")[1]?.split("\n\n")[0] ?? "";
  const children = block
    .split("\n")
    .map((line) => line.trim().split(/\s+/)[0])
    .filter((name) => name && name !== "help");
  return [{ path, help }, ...children.flatMap((child) => commands([...path, child]))];
}

const html = (text) =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const anchor = (path) => (path.length ? path.join("-") : "bonk");

const all = commands([]);
const errors = JSON.parse(run(["explain", "--json"])).codes;

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bonk command reference</title>
<meta name="description" content="Every Bonk command, its options and its error codes, as printed by Bonk ${VERSION}.">
<link rel="canonical" href="https://bonk-os.app/reference/">
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/reference/site.css">
</head>
<body>
<main>
<header>
<h1>Bonk command reference</h1>
<p class="lead">Every command, its options and its error codes, as printed by Bonk ${VERSION}: <code>bonk &lt;command&gt; --help</code> and <code>bonk explain --json</code>.</p>
</header>
<section>
<h2>Commands</h2>
<p>${all.map(({ path }) => `<a href="#${anchor(path)}">${html(["bonk", ...path].join(" "))}</a>`).join(" · ")}</p>
</section>
${all
  .map(
    ({ path, help }) => `<section id="${anchor(path)}">
<h2>${html(["bonk", ...path].join(" "))}</h2>
<pre><code>${html(help)}</code></pre>
</section>`,
  )
  .join("\n")}
<section id="errors">
<h2>Error codes</h2>
<table>
<thead><tr><th>Code</th><th>Exit</th><th>Error</th><th>Causes</th><th>Remedy</th></tr></thead>
<tbody>
${errors
  .map(
    (e) =>
      `<tr><td><code>${html(e.code)}</code></td><td>${html(e.exit_code)}</td><td>${html(e.title)}</td><td>${e.causes.map(html).join("<br>")}</td><td>${html(e.remedy)}</td></tr>`,
  )
  .join("\n")}
</tbody>
</table>
</section>
</main>
<footer>
<p><a href="https://bonk-os.app">bonk-os.app</a> · <a href="https://bonk-os.app/docs/">Commands</a> · <a href="https://catalog.bonk-os.app">catalog</a> · <a href="https://packages.bonk-os.app">packages</a> · <a href="https://github.com/FantasmaGlad/Bonk">GitHub</a></p>
</footer>
</body>
</html>
`;

writeFileSync("public/reference/index.html", page);
console.log(`${all.length} commands, ${errors.length} error codes, Bonk ${VERSION}`);
