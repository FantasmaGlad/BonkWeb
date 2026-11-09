import { expect, it } from "vitest";
import { languageFrom } from "./language";

it("suit l'adresse avant tout, puis le navigateur, l'anglais par défaut", () => {
  expect(languageFrom("", ["fr-FR"])).toBe("fr");
  expect(languageFrom("", ["en-GB", "fr"])).toBe("en");
  expect(languageFrom("", ["de-DE"])).toBe("en");
  expect(languageFrom("", [])).toBe("en");
  expect(languageFrom("?lang=en", ["fr-FR"])).toBe("en");
  expect(languageFrom("?lang=fr", ["en-US"])).toBe("fr");
  expect(languageFrom("?lang=de", ["fr-CA"])).toBe("fr");
});
