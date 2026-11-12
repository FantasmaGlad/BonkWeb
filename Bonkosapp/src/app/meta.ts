import type { Dictionary } from "../i18n/en";
import type { Catalog } from "../types/catalog";
import { PATHS, type View } from "./routes";

export const SITE = "https://bonk-os.app";

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Facts = { version: string; source: string };

const description = (text: Dictionary, view: View, catalog: Catalog | null): string => {
  if (view !== "marketplace") {
    return text.descriptions[view];
  }
  const systems = new Set(catalog?.images.map((image) => image.family)).size;
  return catalog
    ? text.descriptions.marketplace(systems, catalog.images.length)
    : text.titles.marketplace;
};

const trailName = (text: Dictionary, view: View): string =>
  view === "marketplace" ? text.nav.systems : `${text.nav.download}${text.nav.downloadMore}`;

/** Structured data limited to what the page states: the application on the home page, the trail elsewhere. */
const structured = (text: Dictionary, view: View, summary: string, facts: Facts): object =>
  view === "home"
    ? {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Bonk",
        description: summary,
        url: `${SITE}/`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Linux, Windows, macOS, Android",
        softwareVersion: facts.version,
        license: "https://opensource.org/license/mit",
        downloadUrl: `${SITE}${PATHS.download}`,
        sameAs: facts.source,
      }
    : {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Bonk", item: `${SITE}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: trailName(text, view),
            item: `${SITE}${PATHS[view]}`,
          },
        ],
      };

/** The head of a prerendered page: what search engines and link previews read without running scripts. */
export const headFor = (
  text: Dictionary,
  view: View,
  catalog: Catalog | null,
  facts: Facts,
): string => {
  const url = `${SITE}${PATHS[view]}`;
  const summary = description(text, view, catalog);
  const json = JSON.stringify(structured(text, view, summary, facts)).replace(/</g, "\\u003c");
  return [
    `<title>${escapeHtml(text.titles[view])}</title>`,
    `<meta name="description" content="${escapeHtml(summary)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Bonk" />`,
    `<meta property="og:title" content="${escapeHtml(text.titles[view])}" />`,
    `<meta property="og:description" content="${escapeHtml(summary)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE}/logo.png" />`,
    `<script type="application/ld+json">${json}</script>`,
  ].join("\n    ");
};
