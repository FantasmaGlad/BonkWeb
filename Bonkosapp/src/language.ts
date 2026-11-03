export type Language = "en" | "fr";

/**
 * The address decides first, so a page can be shared in a given language (`?lang=fr`); otherwise the
 * browser's preferred language. English unless French is asked for.
 */
export const languageFrom = (search: string, preferred: string | undefined): Language => {
  const asked = new URLSearchParams(search).get("lang");
  if (asked === "fr" || asked === "en") {
    return asked;
  }
  return preferred?.toLowerCase().startsWith("fr") ? "fr" : "en";
};

/**
 * A link inside the site, carrying `lang` only when the current address names it: a visitor who
 * arrived through `?lang=fr` stays in French, the others keep following their browser.
 */
export const localHref = (
  path: string,
  search: string,
  params: Record<string, string | undefined> = {},
): string => {
  const [base = path, hash] = path.split("#");
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }
  const asked = new URLSearchParams(search).get("lang");
  if (asked === "fr" || asked === "en") {
    query.set("lang", asked);
  }
  const text = query.toString();
  return `${base}${text ? `?${text}` : ""}${hash ? `#${hash}` : ""}`;
};
