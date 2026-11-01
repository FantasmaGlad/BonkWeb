import { existsSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import commands from "./commands.json";
import { contrastRatio } from "./contrast";
import { CLI_FAMILIES, downloadUrl, FAMILIES, VERSION } from "./downloads";
import { MANAGERS } from "./install";
import { detect, suggestBonk, suggestImages } from "./machine";

afterEach(cleanup);
afterEach(() => vi.unstubAllGlobals());

describe("page de départ", () => {
  it("donne le téléchargement et les sources", () => {
    vi.stubGlobal("fetch", async () => new Response("", { status: 503 }));
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Bonk" })).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 3 }).length).toBe(
      FAMILIES.length + CLI_FAMILIES.length + 1,
    );
    expect(screen.getByRole("link", { name: "All files and checksums" })).toBeTruthy();
  });

  it("change de langue, et le dit au document", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Français" }));
    expect(screen.getByRole("heading", { level: 2, name: /^Obtenir Bonk/ })).toBeTruthy();
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

  it("dit que Windows et macOS restent à essayer sur une vraie clé, et eux seuls", () => {
    render(<App />);
    const previews = [...FAMILIES, ...CLI_FAMILIES]
      .filter((family) => !family.writes)
      .map((family) => family.id);
    expect(previews).toEqual(["windows", "macos", "cli-windows", "cli-macos"]);
    expect(
      screen.getAllByText(
        "Writes to disks; proven in continuous integration, not yet on a real drive.",
      ).length,
    ).toBe(previews.length);
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

describe("liens directs de l'accueil", () => {
  it("donne les fichiers officiels de chaque système, la version récente d'abord", async () => {
    const catalog = {
      families: [{ id: "ubuntu", name: "Ubuntu", icon: "icons/ubuntu.png" }],
      images: [
        {
          id: "u24",
          family: "ubuntu",
          name: "Ubuntu",
          version: "24.04.5",
          channel: "lts",
          released: "2026-09-09",
          homepage: "https://u/",
          url: "https://u/24.iso",
          size_bytes: 4e9,
        },
        {
          id: "u26",
          family: "ubuntu",
          name: "Ubuntu",
          version: "26.04.1",
          edition: "desktop",
          channel: "lts",
          released: "2026-08-26",
          homepage: "https://u/",
          url: "https://u/26.iso",
          size_bytes: 6e9,
        },
      ],
    };
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify(catalog)));
    const { container } = render(<App />);
    const titre = await screen.findByRole("heading", { level: 3, name: "Ubuntu" });
    const section = titre.closest("section");
    const liens = [...(section?.querySelectorAll("a") ?? [])];
    expect(liens.map((lien) => lien.getAttribute("href"))).toEqual([
      "https://u/26.iso",
      "https://u/24.iso",
    ]);
    expect(liens[0]?.textContent).toBe("26.04.1 desktop LTS 6.0 GB");
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations.map((violation) => violation.id)).toEqual([]);
    vi.unstubAllGlobals();
  });
});

describe("page des images", () => {
  const catalog = {
    families: [{ id: "ubuntu", name: "Ubuntu", icon: "icons/ubuntu.svg" }],
    images: [
      {
        id: "u24",
        family: "ubuntu",
        name: "Ubuntu",
        version: "24.04.5",
        channel: "lts",
        released: "2026-09-09",
        homepage: "https://u/",
        url: "https://u/24.iso",
        sha256: "a".repeat(64),
        size_bytes: 4e9,
      },
      {
        id: "u26",
        family: "ubuntu",
        name: "Ubuntu",
        version: "26.04.1",
        channel: "lts",
        released: "2026-08-26",
        homepage: "https://u/",
        url: "https://u/26.iso",
        sha256: "b".repeat(64),
        size_bytes: 6e9,
      },
      {
        id: "u20",
        family: "ubuntu",
        name: "Ubuntu",
        version: "20.04.5",
        channel: "end_of_life",
        released: "2022-08-31",
        homepage: "https://u/",
        official_page: "https://u/page",
      },
    ],
  };

  it("range les versions de la plus récente à la plus ancienne, avec logo et lien officiel", async () => {
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify(catalog)));
    const { container } = render(<App page="images" />);
    await screen.findByRole("heading", { level: 2, name: "Ubuntu" });
    const titles = [...container.querySelectorAll("li strong")].map((item) => item.textContent);
    expect(titles).toEqual([
      "Ubuntu 26.04.1 LTS",
      "Ubuntu 24.04.5 LTS",
      "Ubuntu 20.04.5 (end of life)",
    ]);
    expect(container.querySelector(".logos img")?.getAttribute("src")).toBe(
      "https://catalog.bonk-os.app/v1/icons/ubuntu.svg",
    );
    expect(screen.getByRole("link", { name: "Publisher's download page" })).toBeTruthy();
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations.map((violation) => violation.id)).toEqual([]);
    vi.unstubAllGlobals();
  });

  it("garde une catégorie ou un seul système, et trie", async () => {
    const image = (
      id: string,
      family: string,
      version: string,
      released: string,
      size: number,
    ) => ({
      id,
      family,
      name: family,
      version,
      channel: "stable",
      released,
      arch: "x86_64",
      homepage: "https://h/",
      url: `https://h/${id}.iso`,
      sha256: "a".repeat(64),
      size_bytes: size,
    });
    const sorted = {
      families: [
        { id: "ubuntu", name: "Ubuntu", icon: "u.png", category: "Debian derivatives" },
        { id: "mint", name: "Mint", icon: "m.png", category: "Debian derivatives" },
        { id: "fedora", name: "Fedora", icon: "f.png", category: "Red Hat family" },
      ],
      images: [
        image("u1", "ubuntu", "24.04", "2026-01-01", 5e9),
        image("u2", "ubuntu", "26.04", "2025-01-01", 6e9),
        image("m", "mint", "22", "2024-01-01", 2e9),
        { ...image("f", "fedora", "44", "2026-04-22", 1e9), note: "Only an example" },
      ],
    };
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify(sorted)));
    const { container } = render(<App page="images" />);
    await screen.findByRole("heading", { level: 2, name: "Ubuntu" });
    expect(screen.getByText("Only an example")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Debian derivatives" },
    });
    expect(screen.queryByRole("heading", { level: 2, name: "Fedora" })).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "Mint" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("System"), { target: { value: "ubuntu" } });
    expect(screen.queryByRole("heading", { level: 2, name: "Mint" })).toBeNull();
    fireEvent.change(screen.getByLabelText("Sort by"), { target: { value: "released" } });
    expect(container.querySelector("li strong")?.textContent).toBe("ubuntu 24.04");
    vi.unstubAllGlobals();
  });

  it("dit quand le catalogue ne répond pas", async () => {
    vi.stubGlobal("fetch", async () => new Response("", { status: 503 }));
    render(<App page="images" />);
    expect((await screen.findByRole("alert")).textContent).toContain("cannot be read");
    vi.unstubAllGlobals();
  });
});

describe("suggestion selon la machine", () => {
  it("lit le système et le processeur sans inventer la distribution", () => {
    const chrome = "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 Chrome/140 Safari/537.36";
    expect(detect(chrome, "Linux aarch64")).toEqual({
      os: "linux",
      arch: "aarch64",
      distro: undefined,
    });
    const firefox =
      "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0";
    expect(detect(firefox, "Linux x86_64").distro).toBe("debian");
    expect(detect("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Win32").arch).toBe("x86_64");
    expect(
      detect("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Win32", {
        architecture: "arm",
        bitness: "64",
      }).arch,
    ).toBe("aarch64");
    expect(
      detect("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel").arch,
    ).toBeUndefined();
    expect(detect("Mozilla/5.0 (Linux; Android 15; Pixel 9)", "Linux aarch64").os).toBe("other");
    expect(detect("Mozilla/5.0 (X11; CrOS x86_64 16000.0.0)", "Linux x86_64").os).toBe("other");
  });

  it("choisit le paquet et refuse de deviner le processeur", () => {
    expect(suggestBonk("linux", "x86_64", "debian")?.file.format).toBe(".deb");
    expect(suggestBonk("linux", "x86_64", "manjaro")?.file.format).toBe(".pkg.tar.zst");
    expect(suggestBonk("macos", undefined, "other")?.file.format).toBe(".dmg");
    expect(suggestBonk("windows", undefined, "other")).toBeUndefined();
  });

  it("propose Manjaro ARM sur une machine Manjaro ARM, jamais une image qui ne démarre pas", () => {
    const image = (id: string, family: string, arch: string, extra = {}) => ({
      id,
      family,
      name: id,
      version: "1",
      channel: "stable" as const,
      released: "2026-01-01",
      homepage: "https://h/",
      arch,
      url: `https://h/${id}`,
      ...extra,
    });
    const catalog = {
      families: [],
      images: [
        image("mx", "manjaro", "x86_64"),
        image("marm", "manjaro", "aarch64"),
        image("archx", "arch", "x86_64"),
        image("cd", "endeavouros", "aarch64", { usb_boot: false }),
      ],
    };
    expect(suggestImages(catalog, "linux", "aarch64", "manjaro").map((i) => i.id)).toEqual([
      "marm",
    ]);
    expect(suggestImages(catalog, "linux", "x86_64", "manjaro").map((i) => i.id)).toEqual([
      "mx",
      "archx",
    ]);
  });
});
