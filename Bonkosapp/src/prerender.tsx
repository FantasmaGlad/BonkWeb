import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { headFor } from "./app/meta";
import { PATHS } from "./app/routes";
import { SOURCE } from "./data/links";
import { RELEASE } from "./data/releases";
import { en } from "./i18n/en";
import type { Catalog } from "./types/catalog";

/** Pages written as HTML at build time, in English: the language of an address without `lang`. */
export const PAGES = (["home", "marketplace", "download"] as const).map((view) => ({
  view,
  path: PATHS[view],
}));

export const mount = (container: HTMLElement) => {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  return root;
};

export const head = (view: (typeof PAGES)[number]["view"], catalog: Catalog | null): string =>
  headFor(en, view, catalog, { version: RELEASE.version, source: SOURCE });
