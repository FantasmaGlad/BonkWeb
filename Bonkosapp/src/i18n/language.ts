export type Language = "en" | "fr";

export const isLanguage = (value: string | null): value is Language =>
  value === "fr" || value === "en";

/** The address decides first, so a page can be shared in a given language. */
export const languageFrom = (search: string, preferred: readonly string[]): Language => {
  const asked = new URLSearchParams(search).get("lang");
  if (isLanguage(asked)) {
    return asked;
  }
  return preferred[0]?.toLowerCase().startsWith("fr") ? "fr" : "en";
};
