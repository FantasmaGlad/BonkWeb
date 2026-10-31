import { existsSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";
import commands from "./commands.json";
import { contrastRatio } from "./contrast";
import { CLI_FAMILIES, downloadUrl, FAMILIES, VERSION } from "./downloads";
import { MANAGERS } from "./install";

afterEach(cleanup);

describe("page de départ", () => {
  it("donne le téléchargement et les sources", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Bonk" })).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 3 }).length).toBe(
      FAMILIES.length + CLI_FAMILIES.length,
    );
    expect(screen.getByRole("link", { name: "All files and checksums" })).toBeTruthy();
  });

  it("change de langue, et le dit au document", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Français" }));
    expect(screen.getByRole("heading", { level: 2, name: /Télécharger/ })).toBeTruthy();
    expect(document.documentElement.lang).toBe("fr");
  });

  it("ne viole aucune règle d'accessibilité vérifiable sans rendu", async () => {
    const { container } = render(<App />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations.map((violation) => violation.id)).toEqual([]);
  });
});

describe("téléchargements", () => {
  it("chaque famille a son logo et des fichiers de la version annoncée", () => {
    for (const family of [...FAMILIES, ...CLI_FAMILIES]) {
      expect(family.files.length).toBeGreaterThan(0);
      for (const logo of family.logos) {
        expect(existsSync(`public/icons/${logo}.svg`), logo).toBe(true);
      }
      for (const { file } of family.files) {
        expect(file).toContain(VERSION);
        expect(downloadUrl(file)).toContain(`/releases/download/v${VERSION}/`);
      }
    }
  });

  it("dit que Windows et macOS sont des aperçus, et eux seuls", () => {
    render(<App />);
    const previews = [...FAMILIES, ...CLI_FAMILIES]
      .filter((family) => !family.writes)
      .map((family) => family.id);
    expect(previews).toEqual(["windows", "macos", "cli-windows", "cli-macos"]);
    expect(screen.getAllByText("Preview: cannot write to disks yet.").length).toBe(previews.length);
  });
});

describe("installation", () => {
  it("donne installer, mettre à jour et retirer pour chaque gestionnaire", () => {
    render(<App page="install" />);
    expect(screen.getAllByRole("heading", { level: 2 }).length).toBe(MANAGERS.length + 1);
    for (const manager of MANAGERS) {
      expect(manager.install && manager.cli && manager.update && manager.remove).toBeTruthy();
      expect(manager.cli).toContain("bonk-cli");
    }
  });
});

describe("commandes", () => {
  it("liste chaque commande, sans texte vide, dans les deux langues", () => {
    render(<App page="docs" />);
    expect(commands.commands.length).toBeGreaterThan(20);
    for (const command of commands.commands) {
      expect(command.text.en && command.text.fr, command.command).toBeTruthy();
      expect(document.getElementById(command.command.replaceAll(" ", "-"))).toBeTruthy();
    }
  });

  it("reste accessible", async () => {
    const { container } = render(<App page="docs" />);
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
