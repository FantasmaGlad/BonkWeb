import { isLanguage } from "../i18n/language";

export type Params = Record<string, string | undefined>;

/** `lang` only when the address names it, so other visitors keep following their browser. */
export const buildHref = (to: string, currentSearch: string, params: Params = {}): string => {
  const [base = to, hash] = to.split("#");
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }
  const asked = new URLSearchParams(currentSearch).get("lang");
  if (isLanguage(asked)) {
    query.set("lang", asked);
  }
  const text = query.toString();
  return `${base}${text ? `?${text}` : ""}${hash ? `#${hash}` : ""}`;
};

/** Same page, some parameters changed; an empty value removes its key. */
export const patchSearch = (currentSearch: string, patch: Params): string => {
  const query = new URLSearchParams(currentSearch);
  for (const [key, value] of Object.entries(patch)) {
    if (value) {
      query.set(key, value);
    } else {
      query.delete(key);
    }
  }
  const text = query.toString();
  return text ? `?${text}` : "";
};

export const normalizePath = (path: string): string => (path.endsWith("/") ? path : `${path}/`);
