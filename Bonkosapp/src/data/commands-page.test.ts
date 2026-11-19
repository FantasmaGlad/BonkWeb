import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { RELEASE } from "./releases";

const page = readFileSync("public/commands/index.html", "utf8");

it("la page des commandes vient de la version proposée au téléchargement, sans script", () => {
  expect(page).toContain(`as printed by Bonk ${RELEASE.version}`);
  expect(page).toContain('id="errors"');
  expect(page).toContain("<h2>bonk write</h2>");
  expect(page).toContain('href="/commands/site.css"');
  expect(page).not.toContain("<script");
  expect(page).not.toContain("<style");
});

it("l'ancienne adresse /reference/ renvoie vers /commands/, sans script", () => {
  const redirect = readFileSync("public/reference/index.html", "utf8");
  expect(redirect).toContain('content="0; url=/commands/"');
  expect(redirect).toContain('rel="canonical" href="https://bonk-os.app/commands/"');
  expect(redirect).not.toContain("<script");
});
