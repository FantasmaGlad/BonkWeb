export type Language = "en" | "fr";

/** The address decides first, so a page can be shared in a given language. */
export const languageFrom = (search: string, preferred: string | undefined): Language => {
  const asked = new URLSearchParams(search).get("lang");
  if (asked === "fr" || asked === "en") {
    return asked;
  }
  return preferred?.toLowerCase().startsWith("fr") ? "fr" : "en";
};

/** `lang` only when the address names it, so other visitors keep following their browser. */
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
