import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PACKAGE_MANAGERS } from "../data/packageManagers";
import { APPS, CLIS, RELEASE } from "../data/releases";
import { browseAs, serveCatalog, UBUNTU_FIREFOX } from "../test/fixtures";
import { App } from "./App";

afterEach(cleanup);
afterEach(() => vi.unstubAllGlobals());
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("scrollTo", () => undefined);
  serveCatalog();
});

const violations = async (container: HTMLElement) =>
  (await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations.map(
    (violation) => violation.id,
  );

const header = () => within(screen.getByRole("navigation", { name: "Bonk" }));

const open = (address: string) => {
  history.replaceState(null, "", address);
  return render(<App />);
};

describe("langue", () => {
  it("suit l'adresse, sans bouton de langue, et le dit au document", () => {
    open("/?lang=fr");
    expect(screen.queryByRole("button", { name: /English|Français/ })).toBeNull();
    expect(header().getByRole("link", { name: "Systèmes" }).getAttribute("href")).toBe(
      "/images/?lang=fr",
    );
    expect(document.documentElement.lang).toBe("fr");
  });

  it("suit le navigateur quand l'adresse ne dit rien, sans l'écrire dans les liens", () => {
    browseAs(UBUNTU_FIREFOX, "Linux x86_64", "fr-FR");
    open("/");
    expect(header().getByRole("link", { name: "Systèmes" }).getAttribute("href")).toBe("/images/");
  });
});

describe("navigation", () => {
  it("change de vue sans recharger la page et garde la langue de l'adresse", async () => {
    const { container } = open("/?lang=fr");
    const root = container.firstChild;
    const pages = history.length;
    fireEvent.click(header().getByRole("link", { name: "Systèmes" }));
    expect(`${location.pathname}${location.search}`).toBe("/images/?lang=fr");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Systèmes");
    expect(document.title).toBe("Bonk : systèmes");
    expect(history.length).toBe(pages + 1);
    fireEvent.click(header().getByRole("link", { name: /^Télécharger/ }));
    expect(`${location.pathname}${location.search}`).toBe("/install/?lang=fr");
    expect(container.firstChild).toBe(root);
  });

  it("renvoie l'ancienne page des commandes vers leur section, langue comprise", () => {
    open("/docs/?lang=fr");
    expect(`${location.pathname}${location.search}${location.hash}`).toBe(
      "/install/?lang=fr#commands",
    );
    expect(screen.getByRole("heading", { level: 2, name: "Commandes" })).toBeTruthy();
  });
});

describe("accueil", () => {
  it("propose l'installateur de cette machine puis les systèmes, sans commande", async () => {
    browseAs(UBUNTU_FIREFOX, "Linux x86_64");
    const { container } = open("/");
    const hero = screen.getByRole("heading", { level: 1 }).closest("section") as HTMLElement;
    const [download, explore] = within(hero).getAllByRole("link");
    const deb = APPS.find((platform) => platform.id === "linux-deb")?.builds[0];
    expect(download?.textContent).toBe("Download for Linux.deb");
    expect(download?.getAttribute("href")).toBe(deb?.url);
    expect(explore?.textContent).toBe("Explore systems");
    expect(download?.querySelector("img")?.getAttribute("src")).toBe("/logos/linux.png");
    await screen.findByRole("link", { name: "See all 4 systems" });
    const recent = screen.getByRole("heading", { level: 3, name: "Latest releases" }).parentElement;
    expect(recent?.querySelectorAll("li").length).toBe(4);
    expect(container.querySelector("pre")).toBeNull();
    expect(await violations(container)).toEqual([]);
  });

  it("laisse choisir un autre système et s'en souvient", () => {
    browseAs(UBUNTU_FIREFOX, "Linux x86_64");
    const { unmount } = open("/");
    fireEvent.click(screen.getByRole("button", { name: "Another system" }));
    expect(screen.getByRole("tab", { selected: true }).textContent).toBe("Linux");
    expect(screen.getAllByRole("button", { pressed: true }).length).toBe(1);
    fireEvent.click(screen.getByRole("tab", { name: "macOS 12+" }));
    fireEvent.click(screen.getByRole("button", { name: /\.dmg/ }));
    expect(screen.queryByRole("tab")).toBeNull();
    const dmg = APPS.find((platform) => platform.id === "macos")?.builds[0];
    expect(screen.getByRole("link", { name: /Download for macOS/ }).getAttribute("href")).toBe(
      dmg?.url,
    );
    unmount();
    open("/");
    expect(screen.getByRole("link", { name: /Download for macOS/ })).toBeTruthy();
  });

  it("renvoie vers les téléchargements quand le processeur est inconnu", () => {
    browseAs("Mozilla/5.0 (Windows NT 10.0)", "Win32");
    open("/");
    expect(screen.getByRole("link", { name: "Download Bonk" }).getAttribute("href")).toBe(
      "/install/#apps",
    );
  });

  it("dit quand le catalogue ne répond pas, et garde le téléchargement de Bonk", async () => {
    vi.stubGlobal("fetch", async () => new Response("", { status: 503 }));
    open("/");
    expect((await screen.findByRole("alert")).textContent).toContain("cannot be read");
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });
});

describe("systèmes", () => {
  const cards = () =>
    within(screen.getByRole("main"))
      .getAllByRole("listitem")
      .map((item) => item.querySelector("strong")?.textContent)
      .filter(Boolean);

  it("filtre par catégorie, écrit l'adresse et propose d'effacer quand rien ne reste", async () => {
    const { container } = open("/images/");
    await screen.findByRole("link", { name: /^Ubuntu/ });
    expect(await violations(container)).toEqual([]);
    const rail = within(screen.getByRole("navigation", { name: "Categories" }));
    fireEvent.click(rail.getByRole("link", { name: /^Security/ }));
    expect(rail.getByRole("link", { name: /^Security/ }).getAttribute("aria-current")).toBe("true");
    expect(cards()).toEqual(["Tails"]);
    expect(location.search).toBe("?category=security");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "ubuntu" } });
    expect(screen.getByText("No system matches these filters.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(cards()).toEqual(["Fedora", "Haiku", "Tails", "Ubuntu"]);
    fireEvent.change(screen.getByRole("combobox", { name: "Available memory" }), {
      target: { value: "4096" },
    });
    expect(cards()).toEqual(["Tails"]);
    expect(location.search).toBe("?ram=4096");
  });

  it("montre sur la carte la version, la mémoire et la clé, en texte", async () => {
    open("/images/?lang=fr");
    const card = await screen.findByRole("link", { name: /^Ubuntu/ });
    expect(card.textContent).toContain("26.04.1 · LTS");
    expect(card.textContent).toContain("aarch64 · x86_64 · 6 Go de RAM · clé de 2 Go");
  });

  it("ouvre le panneau d'un système et met à jour taille, empreinte et commande", async () => {
    const { container } = open("/images/");
    fireEvent.click(await screen.findByRole("link", { name: /^Ubuntu/ }));
    expect(location.search).toBe("?system=ubuntu");
    const panel = screen.getByRole("dialog", { name: "Ubuntu" });
    const read = () => panel.textContent ?? "";
    expect(read()).toContain("bonk disk write <DISK> --image u26 --yes");
    expect(read()).toContain("6,482,409,472 bytes (6.5 GB)");
    expect(within(panel).getByRole("link", { name: /^Download the image/ })).toBeTruthy();
    expect(within(panel).queryByRole("link", { name: "Open in Bonk" })).toBeNull();
    expect(await violations(container)).toEqual([]);

    fireEvent.change(within(panel).getByRole("combobox", { name: "Architecture" }), {
      target: { value: "aarch64" },
    });
    expect(location.search).toBe("?system=ubuntu&image=u26arm");
    expect(read()).toContain("--image u26arm --yes");
    expect(read()).toContain("u26arm".padEnd(64, "0"));

    fireEvent.change(within(panel).getByRole("combobox", { name: "Edition" }), {
      target: { value: "Kubuntu|" },
    });
    expect(read()).toContain("--image k26 --yes");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(location.search).toBe("");
  });

  it("rouvre un panneau depuis l'adresse, version en fin de vie comprise", async () => {
    open("/images/?system=ubuntu&image=u20");
    const panel = await screen.findByRole("dialog", { name: "Ubuntu" });
    expect(within(panel).getByRole("link", { name: "Publisher's page" })).toBeTruthy();
    expect(panel.textContent).not.toContain("bonk disk write");
  });

  it("signale une image qui ne démarre pas sur clé et ne donne pas de commande pour elle", async () => {
    open("/images/?system=fedora&lang=fr");
    const panel = await screen.findByRole("dialog", { name: "Fedora" });
    expect(panel.textContent).toContain("DVD ou machine virtuelle seulement");
    expect(panel.textContent).not.toContain("bonk disk write");
  });

  it("dit quand le système demandé n'existe pas", async () => {
    open("/images/?system=absent");
    expect(await screen.findByText("This system is not in the catalog.")).toBeTruthy();
  });
});

describe("téléchargement et commandes", () => {
  it("liste les fichiers de la dernière version et marque le processeur de la machine", async () => {
    browseAs(UBUNTU_FIREFOX, "Linux x86_64");
    const { container } = open("/install/");
    expect(screen.getByText(new RegExp(`Bonk ${RELEASE.version},`))).toBeTruthy();
    for (const build of APPS.flatMap((platform) => platform.builds)) {
      expect(container.querySelector(`a[href="${build.url}"]`), build.name).toBeTruthy();
    }
    const deb = APPS[0]?.builds[0];
    expect(container.querySelector(`a[href="${deb?.url}"]`)?.getAttribute("aria-current")).toBe(
      "true",
    );
    expect(await violations(container)).toEqual([]);
  });

  it("dit ce qui n'a pas été essayé sur une vraie clé", () => {
    open("/install/");
    const heading = (name: string) =>
      screen.getByRole("heading", { level: 3, name }).parentElement?.textContent ?? "";
    expect(heading("Linux")).toContain("Tried on real drives.");
    expect(heading("Windows 10+")).toContain("not yet on a real drive");
    expect(heading("Android 8+")).toContain("Beta.");
  });

  it("ouvre sur le gestionnaire de la machine et parcourt les onglets au clavier", () => {
    browseAs(UBUNTU_FIREFOX, "Linux x86_64");
    open("/install/");
    expect(screen.getAllByRole("tab").length).toBe(PACKAGE_MANAGERS.length);
    expect(screen.getByRole("tab", { selected: true }).textContent).toBe("APT");
    fireEvent.click(screen.getByRole("tab", { name: "pacman" }));
    expect(screen.getByRole("tabpanel").textContent).toContain("sudo pacman -R bonk");
    fireEvent.keyDown(screen.getByRole("tab", { name: "pacman" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { selected: true }).textContent).toBe("Homebrew");
    expect(screen.getByRole("tabpanel").textContent).not.toContain("bonk-cli");
  });

  it("réunit la version sans fenêtre : script, paquet bonk-cli et archives avec leur taille", () => {
    const { container } = open("/install/");
    const section = container.querySelector("#cli") as HTMLElement;
    expect(section.textContent).toContain("install.sh | sh");
    expect(section.textContent).toContain("install.ps1 | iex");
    for (const manager of PACKAGE_MANAGERS) {
      expect(section.textContent, manager.id).toContain(manager.cli);
    }
    for (const build of CLIS.flatMap((platform) => platform.builds)) {
      expect(section.querySelector(`a[href="${build.url}"]`), build.name).toBeTruthy();
    }
    expect(section.textContent).toMatch(/\d MB/);
  });

  it("ouvre sur un premier écran qui mène aux quatre sections", () => {
    const { container } = open("/install/");
    const first = screen.getByRole("heading", { level: 1 }).closest("section") as HTMLElement;
    const targets = within(first)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"))
      .filter((href) => href?.startsWith("#"));
    expect(targets).toEqual(["#apps", "#terminal", "#cli", "#commands", "#apps"]);
    for (const target of targets) {
      expect(container.querySelector(target ?? ""), target ?? "").toBeTruthy();
    }
  });

  it("donne le flux essentiel puis la référence, options avancées à part", () => {
    const { container } = open("/install/?lang=fr");
    const section = container.querySelector("#commands") as HTMLElement;
    const flow = [...section.querySelectorAll("ol pre")].map((pre) => pre.textContent);
    expect(flow).toEqual([
      "bonk disk list",
      "bonk catalog list",
      "bonk disk write <DISK> --image <ID> --yes",
    ]);
    const write = within(section).getByText("bonk disk write <TARGET> [SOURCE]").closest("details");
    const advanced = write?.querySelector("details");
    expect(advanced?.querySelector("summary")?.textContent).toBe("Options avancées");
    expect(advanced?.textContent).toContain("--trace-io");
    expect(advanced?.textContent).not.toContain("--image <ID>");
    expect(within(section).getByText("bonk cache clean")).toBeTruthy();
  });
});
