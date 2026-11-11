import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { contrastRatio } from "../shared/lib/contrast";

it("calcule le rapport de la norme", () => {
  expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
  expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
});

const css = readFileSync("src/styles/tokens.css", "utf8");
const dark = css.slice(css.indexOf("prefers-color-scheme: dark"));

it.each([
  ["clair", css],
  ["sombre", dark],
])(
  "thème %s : chaque couleur de texte atteint 4,5:1 sur chaque fond, et le corps 7:1",
  (_, block) => {
    const token = (name: string) => {
      const value = block.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
      expect(value, name).toBeTruthy();
      return value as string;
    };
    const backgrounds = ["paper", "surface", "sunk", "accent-soft", "warn-soft"].map(token);
    for (const text of ["ink", "muted", "accent", "warn"].map(token)) {
      for (const background of backgrounds) {
        expect(contrastRatio(text, background), `${text} / ${background}`).toBeGreaterThanOrEqual(
          4.5,
        );
      }
    }
    for (const background of backgrounds) {
      expect(contrastRatio(token("ink"), background)).toBeGreaterThanOrEqual(7);
    }
    for (const background of ["accent", "accent-strong"].map(token)) {
      expect(contrastRatio(token("on-accent"), background)).toBeGreaterThanOrEqual(7);
    }
  },
);
