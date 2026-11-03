import { existsSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import commands from "./commands.json";
import { contrastRatio } from "./contrast";
import { CLI_FAMILIES, downloadUrl, FAMILIES, VERSION } from "./downloads";
import {
  type Catalog,
  categoryLabel,
  NO_STORE_FILTER,
  recentReleases,
  sizeLabel,
  storeFromAddress,
  summarize,
} from "./images";
import { MANAGERS } from "./install";
import { languageFrom, localHref } from "./language";
import { detect, suggestBonk, suggestImages } from "./machine";

afterEach(cleanup);
afterEach(() => vi.unstubAllGlobals());
beforeEach(() => history.replaceState(null, "", "/"));

const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations.map(
    (violation) => violation.id,
  );

const image = (
  id: string,
  family: string,
  version: string,
  released: string,
  extra: Record<string, unknown> = {},
) => ({
  id,
  family,
  name: family,
  version,
  channel: "stable" as const,
  released,
  arch: "x86_64",
  homepage: `https://${family}.example/`,
  url: `https://${family}.example/${id}.iso`,
  sha256: "a".repeat(64),
  size_bytes: 2e9,
  ...extra,
});

const CATALOG: Catalog = {
  families: [
    { id: "ubuntu", name: "Ubuntu", icon: "icons/ubuntu.png", category: "Debian derivatives" },
    { id: "linuxmint", name: "Linux Mint", icon: "icons/mint.png", category: "Debian derivatives" },
    { id: "fedora", name: "Fedora", icon: "icons/fedora.png", category: "Red Hat family" },
    { id: "haiku", name: "Haiku", icon: "icons/haiku.png", category: "Other systems" },
  ],
  images: [
    image("u24", "ubuntu", "24.04.5", "2026-09-09", { channel: "lts", edition: "desktop" }),
    image("u26", "ubuntu", "26.04.1", "2026-08-26", { channel: "lts", edition: "desktop" }),
    image("u26arm", "ubuntu", "26.04.1", "2026-08-26", { channel: "lts", arch: "aarch64" }),
    image("u20", "ubuntu", "20.04.5", "2022-08-31", {
      channel: "end_of_life",
      url: undefined,
      sha256: undefined,
      size_bytes: undefined,
      official_page: "https://ubuntu.example/old",
    }),
    image("mint", "linuxmint", "22.3", "2026-01-10", { edition: "cinnamon" }),
    image("f44", "fedora", "44", "2026-10-20", {
      edition: "workstation",
      usb_boot: false,
      note: "DVD or virtual machine only.",
    }),
    image("haiku", "haiku", "r1beta5", "2024-09-13"),
  ],
};

const serve = (catalog: unknown = CATALOG) =>
  vi.stubGlobal("fetch", async () => new Response(JSON.stringify(catalog)));

describe("langue", () => {
  it("suit le navigateur, l'anglais par défaut, et l'adresse avant tout", () => {
    expect(languageFrom("", "fr-FR")).toBe("fr");
    expect(languageFrom("", "en-GB")).toBe("en");
    expect(languageFrom("", "de-DE")).toBe("en");
    expect(languageFrom("", undefined)).toBe("en");
    expect(languageFrom("?lang=en", "fr-FR")).toBe("en");
    expect(languageFrom("?lang=fr", "en-US")).toBe("fr");
    expect(languageFrom("?lang=de", "fr-CA")).toBe("fr");
  });

  it("garde dans les liens la langue de l'adresse, et elle seule", () => {
    expect(localHref("/images/", "")).toBe("/images/");
    expect(localHref("/images/", "?lang=fr&q=x", { system: "ubuntu" })).toBe(
      "/images/?system=ubuntu&lang=fr",
    );
    expect(localHref("/install/#cli", "?lang=en")).toBe("/install/?lang=en#cli");
    expect(localHref("/", "?lang=xx")).toBe("/");
  });

  it("n'affiche aucun bouton de langue, et le dit au document", () => {
    serve();
    render(<App language="fr" />);
    expect(screen.queryByRole("button", { name: /English|Français/ })).toBeNull();
    expect(screen.getByRole("link", { name: "Systèmes" })).toBeTruthy();
    expect(document.documentElement.lang).toBe("fr");
  });

  it("lit la langue dans l'adresse quand rien n'est imposé", () => {
    serve();
    history.replaceState(null, "", "/?lang=fr");
    render(<App />);
    expect(screen.getByRole("link", { name: "Systèmes" }).getAttribute("href")).toBe(
      "/images/?lang=fr",
    );
  });
});

describe("accueil", () => {
  it("ouvre sur le téléchargement de Bonk, puis les systèmes, accessible", async () => {
    serve();
    history.replaceState(null, "", "/");
    vi.stubGlobal("navigator", {
      ...navigator,
      userAgent: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0",
      platform: "Linux x86_64",
      language: "en-US",
    });
    const { container } = render(<App language="en" />);
    const hero = screen.getByRole("heading", { level: 1 }).closest("section") as HTMLElement;
    const actions = within(hero).getAllByRole("link");
    expect(actions[0]?.textContent).toBe("Download Bonk .deb");
    expect(actions[0]?.getAttribute("href")).toBe(downloadUrl(`bonk_${VERSION}-1_amd64.deb`));
    expect(actions[1]?.textContent).toBe("Explore systems");
    await screen.findByRole("heading", { level: 2, name: "Just released" });
    expect(screen.getByText("4 systems, 7 images")).toBeTruthy();
    expect(await violations(container)).toEqual([]);
  });

  it("dit quand le catalogue ne répond pas, et garde le téléchargement de Bonk", async () => {
    vi.stubGlobal("fetch", async () => new Response("", { status: 503 }));
    render(<App language="en" />);
    expect((await screen.findByRole("alert")).textContent).toContain("cannot be read");
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });

  it("montre une sortie récente par système, jamais une version en fin de vie", () => {
    expect(recentReleases(CATALOG, 6).map((i) => i.id)).toEqual(["f44", "u24", "mint", "haiku"]);
  });
});

describe("systèmes", () => {
  it("résume chaque système par sa dernière version maintenue, triée par nom", () => {
    const all = summarize(CATALOG, NO_STORE_FILTER, "en");
    expect(all.map((s) => s.family.id)).toEqual(["fedora", "haiku", "linuxmint", "ubuntu"]);
    const ubuntu = all.find((s) => s.family.id === "ubuntu");
    expect(ubuntu?.latest.version).toBe("26.04.1");
    expect(ubuntu?.count).toBe(4);
    expect(ubuntu?.architectures).toEqual(["aarch64", "x86_64"]);
  });

  it("cherche sans accent ni casse, aussi dans la famille traduite", () => {
    const find = (query: string, language: "en" | "fr" = "en") =>
      summarize(CATALOG, { ...NO_STORE_FILTER, query }, language).map((s) => s.family.id);
    expect(find("MINT")).toEqual(["linuxmint"]);
    expect(find("dérivées", "fr")).toEqual(["linuxmint", "ubuntu"]);
    expect(find("red hat")).toEqual(["fedora"]);
    expect(find("nothing")).toEqual([]);
  });

  it("filtre par processeur et trie par dernière sortie", () => {
    const arm = summarize(CATALOG, { ...NO_STORE_FILTER, arch: "aarch64" }, "en");
    expect(arm.map((s) => s.family.id)).toEqual(["ubuntu"]);
    const recent = summarize(CATALOG, { ...NO_STORE_FILTER, sort: "recent" }, "en");
    expect(recent.map((s) => s.family.id)).toEqual(["fedora", "ubuntu", "linuxmint", "haiku"]);
  });

  it("lit l'état de la vitrine dans l'adresse", () => {
    expect(storeFromAddress("?category=Servers&arch=aarch64&q=pro&sort=recent&system=x")).toEqual({
      filter: { query: "pro", category: "Servers", arch: "aarch64", sort: "recent" },
      system: "x",
    });
    expect(storeFromAddress("?sort=nope").filter.sort).toBe("name");
  });

  it("filtre par le menu des familles, écrit l'adresse et propose d'effacer quand rien ne reste", async () => {
    serve();
    const { container } = render(<App page="images" language="en" />);
    await screen.findByRole("link", { name: /Ubuntu/ });
    expect(await violations(container)).toEqual([]);
    fireEvent.click(screen.getByRole("link", { name: /^Red Hat family/ }));
    expect(screen.getByRole("link", { name: /^Red Hat family/ }).getAttribute("aria-current")).toBe(
      "true",
    );
    expect(screen.queryByRole("link", { name: /Ubuntu/ })).toBeNull();
    expect(location.search).toBe("?category=Red+Hat+family");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "ubuntu" } });
    expect(screen.getByText("No system matches these filters.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(container.querySelectorAll(".system-card").length).toBe(4);
  });

  it("ouvre un système : versions récentes d'abord, fin de vie à part, aucun disque deviné", async () => {
    serve();
    history.replaceState(null, "", "/images/?system=ubuntu");
    const { container } = render(<App page="images" language="en" />);
    await screen.findByRole("heading", { level: 1, name: "Ubuntu" });
    const versions = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(versions.slice(0, 2)).toEqual([
      "ubuntu 26.04.1LTS2026-08-26",
      "ubuntu 24.04.5LTS2026-09-09",
    ]);
    const ended = container.querySelector(".ended");
    expect(ended && within(ended as HTMLElement).getByText("Publisher's page")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Copy the Bonk command" }).length).toBe(3);
    expect(await violations(container)).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "aarch64" }));
    expect(screen.getAllByRole("link", { name: /^Download/ }).length).toBe(1);
  });

  it("signale une image qui ne démarre pas sur clé et ne donne pas de commande pour elle", async () => {
    serve();
    history.replaceState(null, "", "/images/?system=fedora");
    render(<App page="images" language="fr" />);
    await screen.findByRole("heading", { level: 1, name: "Fedora" });
    expect(screen.getByText("DVD ou VM seulement")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Copier la commande Bonk" })).toBeNull();
  });

  it("dit quand le système demandé n'existe pas", async () => {
    serve();
    history.replaceState(null, "", "/images/?system=absent");
    render(<App page="images" language="en" />);
    expect(await screen.findByText("This system is not in the catalog.")).toBeTruthy();
  });
});

describe("téléchargements", () => {
  it("chaque famille a son logo et des fichiers de la version annoncée", () => {
    for (const family of [...FAMILIES, ...CLI_FAMILIES]) {
      expect(family.files.length).toBeGreaterThan(0);
      for (const logo of family.logos) {
        expect(existsSync(`public/logos/${logo}.png`), logo).toBe(true);
      }
      for (const { file } of family.files) {
        expect(file).toContain(VERSION);
        expect(downloadUrl(file)).toContain(`/releases/download/v${VERSION}/`);
      }
    }
  });

  it("dit que Windows, macOS et Android restent à essayer sur une vraie clé, et eux seuls", () => {
    render(<App page="install" language="en" />);
    const previews = [...FAMILIES, ...CLI_FAMILIES]
      .filter((family) => !family.writes)
      .map((family) => family.id);
    expect(previews).toEqual(["windows", "macos", "android", "cli-windows", "cli-macos"]);
    expect(
      screen.getAllByText(
        "Writes to disks; proven in continuous integration, not yet on a real drive.",
      ).length,
    ).toBe(previews.length - 1);
  });
});

describe("installation", () => {
  it("donne installer, sans fenêtre, mettre à jour et retirer pour chaque gestionnaire", async () => {
    const { container } = render(<App page="install" language="en" />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(MANAGERS.length);
    for (const manager of MANAGERS) {
      expect(manager.install && manager.cli && manager.update && manager.remove).toBeTruthy();
      expect(manager.cli).toContain("bonk-cli");
    }
    fireEvent.click(screen.getByRole("tab", { name: "pacman" }));
    const panel = screen.getByRole("tabpanel");
    expect(panel.textContent).toContain("sudo pacman -R bonk");
    fireEvent.keyDown(screen.getByRole("tab", { name: "pacman" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { selected: true }).textContent).toBe("Homebrew");
    expect(await violations(container)).toEqual([]);
  });
});

describe("commandes", () => {
  it("liste chaque commande, sans texte vide, dans les deux langues", async () => {
    const { container } = render(<App page="docs" language="en" />);
    expect(commands.commands.length).toBeGreaterThan(20);
    for (const command of commands.commands) {
      expect(command.text.en && command.text.fr, command.command).toBeTruthy();
      expect(document.getElementById(command.command.replaceAll(" ", "-"))).toBeTruthy();
    }
    expect(await violations(container)).toEqual([]);
  });
});

describe("contraste", () => {
  it("calcule le rapport de la norme", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
  });

  it("chaque couleur de texte atteint 4,5:1 sur chaque fond, et le corps 7:1", () => {
    const css = readFileSync("src/styles.css", "utf8");
    const token = (name: string) => {
      const value = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
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
    expect(detect("Mozilla/5.0 (Linux; Android 15; Pixel 9)", "Linux aarch64").os).toBe("android");
    expect(detect("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)", "iPhone").os).toBe("other");
    expect(detect("Mozilla/5.0 (X11; CrOS x86_64 16000.0.0)", "Linux x86_64").os).toBe("other");
  });

  it("choisit le paquet et refuse de deviner le processeur", () => {
    expect(suggestBonk("linux", "x86_64", "debian")?.file.format).toBe(".deb");
    expect(suggestBonk("linux", "x86_64", "manjaro")?.file.format).toBe(".pkg.tar.zst");
    expect(suggestBonk("macos", undefined, "other")?.file.format).toBe(".dmg");
    expect(suggestBonk("windows", undefined, "other")).toBeUndefined();
  });

  it("ne propose l'application Android qu'à un processeur ARM64", () => {
    expect(suggestBonk("android", "aarch64", "other")?.file.format).toBe(".apk");
    expect(suggestBonk("android", undefined, "other")?.file.format).toBe(".apk");
    expect(suggestBonk("android", "x86_64", "other")).toBeUndefined();
    expect(suggestBonk("android", "i686", "other")).toBeUndefined();
  });

  it("donne à Zypper le dépôt du processeur de la machine, jamais un dépôt x86_64 écrit en dur", () => {
    const zypper = MANAGERS.find((manager) => manager.id === "zypper");
    expect(zypper?.install).toContain("/rpm/bonk.repo");
    expect(zypper?.install).not.toContain("/rpm/x86_64");
  });

  it("propose Manjaro ARM sur une machine Manjaro ARM, jamais une image qui ne démarre pas", () => {
    const catalog = {
      families: [],
      images: [
        image("mx", "manjaro", "1", "2026-01-01"),
        image("marm", "manjaro", "1", "2026-01-01", { arch: "aarch64" }),
        image("archx", "arch", "1", "2026-01-01"),
        image("cd", "endeavouros", "1", "2026-01-01", { arch: "aarch64", usb_boot: false }),
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

describe("libellés du catalogue", () => {
  it("traduit les catégories en français et garde l'anglais tel quel", () => {
    expect(categoryLabel("Debian derivatives", "fr")).toBe("Dérivées de Debian");
    expect(categoryLabel("Servers", "fr")).toBe("Serveurs");
    expect(categoryLabel("Servers", "en")).toBe("Servers");
    expect(categoryLabel("Une catégorie nouvelle", "fr")).toBe("Une catégorie nouvelle");
  });

  it("écrit les tailles à la française et ne montre jamais 0.0 pour une petite image", () => {
    expect(sizeLabel(5_100_000_000, "en")).toBe("5.1 GB");
    expect(sizeLabel(5_100_000_000, "fr")).toBe("5,1 Go");
    expect(sizeLabel(17_350_656, "en")).toBe("17 MB");
    expect(sizeLabel(17_350_656, "fr")).toBe("17 Mo");
  });
});
