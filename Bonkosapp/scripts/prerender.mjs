import { readFile, rm, writeFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const SITE = "https://bonk-os.app";
const CATALOG = "https://catalog.bonk-os.app/v2/catalog.json";
const DIST = new URL("../dist/", import.meta.url);
const ENTRY = new URL("../dist-ssr/prerender.js", import.meta.url);
const FILES = {
  "/": "index.html",
  "/images/": "images/index.html",
  "/install/": "install/index.html",
};

async function readCatalog() {
  try {
    const response = await fetch(CATALOG, { signal: AbortSignal.timeout(20_000) });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`catalog unreadable, systems page written without it: ${error}`);
    return null;
  }
}

/** The browser globals the application reads, from one jsdom window. */
function browser(catalog) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: `${SITE}/`,
    pretendToBeVisual: true,
  });
  const { window } = dom;
  window.scrollTo = () => undefined;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.HTMLElement.prototype.scrollIntoView = () => undefined;
  const page = async (url) =>
    catalog && String(url).startsWith(CATALOG.replace("catalog.json", ""))
      ? new Response(JSON.stringify(catalog))
      : new Response("", { status: 404 });
  const values = [
    "window",
    "document",
    "navigator",
    "location",
    "history",
    "localStorage",
    "sessionStorage",
    "HTMLElement",
    "Element",
    "Node",
  ];
  const methods = [
    "getComputedStyle",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "addEventListener",
    "removeEventListener",
    "scrollTo",
    "matchMedia",
  ];
  const define = (name, value) =>
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  for (const name of values) {
    define(name, window[name]);
  }
  for (const name of methods) {
    define(name, window[name].bind(window));
  }
  globalThis.fetch = page;
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  return dom;
}

/** Done when the markup has not changed for a few ticks: the catalog arrives after the first render. */
async function settled(element) {
  let last = "";
  let still = 0;
  for (let tick = 0; tick < 100 && still < 4; tick += 1) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    still = element.innerHTML === last ? still + 1 : 0;
    last = element.innerHTML;
  }
  return last;
}

async function render(dom, entry, path) {
  dom.reconfigure({ url: `${SITE}${path}` });
  document.body.innerHTML = '<div id="root"></div>';
  const container = document.getElementById("root");
  const root = entry.mount(container);
  const html = await settled(container);
  root.unmount();
  return html;
}

function fill(template, html, head) {
  const page = template
    .replace(/<title>.*?<\/title>\s*/s, "")
    .replace(/<meta\s+name="description"[^>]*>\s*/s, "")
    .replace("</head>", `  ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  if (!page.includes(html)) {
    throw new Error("no root element in the template");
  }
  return page;
}

function sitemap(paths) {
  const day = new Date().toISOString().slice(0, 10);
  const urls = paths.map(
    (path) => `  <url>\n    <loc>${SITE}${path}</loc>\n    <lastmod>${day}</lastmod>\n  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

const catalog = await readCatalog();
const dom = browser(catalog);
const entry = await import(ENTRY.href);
for (const { view, path } of entry.PAGES) {
  const file = new URL(FILES[path], DIST);
  const html = await render(dom, entry, path);
  await writeFile(file, fill(await readFile(file, "utf8"), html, entry.head(view, catalog)));
  console.log(`${path}: ${html.length} characters`);
}
await writeFile(new URL("sitemap.xml", DIST), sitemap(entry.PAGES.map((page) => page.path)));
await rm(new URL("../dist-ssr/", import.meta.url), { recursive: true, force: true });
dom.window.close();
