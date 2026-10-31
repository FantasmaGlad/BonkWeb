import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";
import { contrastRatio } from "./contrast";

afterEach(cleanup);

describe("page de départ", () => {
  it("donne le téléchargement et les sources", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Bonk" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Download" }).getAttribute("href")).toContain(
      "releases/latest",
    );
  });

  it("change de langue, et le dit au document", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Français" }));
    expect(screen.getByRole("link", { name: "Télécharger" })).toBeTruthy();
    expect(document.documentElement.lang).toBe("fr");
  });

  it("ne viole aucune règle d'accessibilité vérifiable sans rendu", async () => {
    const { container } = render(<App />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations.map((violation) => violation.id)).toEqual([]);
  });
});

describe("contraste", () => {
  it("calcule le rapport de la norme", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
  });

  it("n'emploie que le noir et le blanc, au niveau AAA", () => {
    const css = readFileSync("src/styles.css", "utf8");
    const colors = new Set(css.match(/#[0-9a-f]{6}\b/gi));
    expect(colors).toEqual(new Set(["#000000", "#ffffff"]));
    expect(contrastRatio("#000000", "#ffffff")).toBeGreaterThanOrEqual(7);
  });
});
