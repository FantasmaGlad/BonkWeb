import { normalizePath } from "../router/address";

export type View = "home" | "marketplace" | "download";

export const PATHS: Record<View, string> = {
  home: "/",
  marketplace: "/images/",
  download: "/install/",
};

export const COMMANDS_ANCHOR = "commands";

/** Addresses published before the commands moved under the download page. */
const REDIRECTS: Record<string, string> = {
  "/docs/": `${PATHS.download}#${COMMANDS_ANCHOR}`,
};

export const redirectOf = (path: string): string | undefined => REDIRECTS[normalizePath(path)];

export const viewOf = (path: string): View => {
  const normal = normalizePath(path);
  const found = (Object.keys(PATHS) as View[]).find((view) => PATHS[view] === normal);
  return found ?? "home";
};
