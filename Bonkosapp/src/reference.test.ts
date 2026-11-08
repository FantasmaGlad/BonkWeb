import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { VERSION } from "./downloads";

const page = readFileSync("public/reference/index.html", "utf8");

it("la référence vient de la version proposée au téléchargement, sans script", () => {
  expect(page).toContain(`as printed by Bonk ${VERSION}`);
  expect(page).toContain('id="errors"');
  expect(page).toContain("<h2>bonk write</h2>");
  expect(page).toContain('href="/reference/site.css"');
  expect(page).not.toContain("<script");
  expect(page).not.toContain("<style");
});
