import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bonkLink } from "../features/marketplace/hooks/useBonkLink";
import { writeCommand } from "../features/marketplace/hooks/useCommandBuilder";
import { compareVersions } from "../shared/lib/catalog";
import { LOCAL_LOGOS } from "./catalogService";
import { CATEGORIES } from "./categories";
import {
  COMMON_FLAGS,
  commandNamed,
  ESSENTIAL_FLOW,
  isCommonFlag,
  REFERENCE_COMMANDS,
  WRITE_COMMAND,
} from "./commands";
import { PACKAGE_MANAGERS } from "./packageManagers";
import { APP_PLATFORMS, CLI_PLATFORMS, DEEP_LINK, OS_GROUPS } from "./platforms";
import { APPS, CLIS, RELEASE } from "./releases";
import { PUBLISHER_DRIVES } from "./systems";

describe("dernière version", () => {
  // A declared file missing from the release is hidden until published (the next version's builds).
  it("chaque plateforme déclarée a au moins un fichier publié, sous son nom publié", () => {
    expect(APPS.map((platform) => platform.id)).toEqual(APP_PLATFORMS.map(({ id }) => id));
    const due = ({ from }: { from?: string }) =>
      !from || compareVersions(RELEASE.version, from) <= 0;
    expect(CLIS.map((platform) => platform.id)).toEqual(
      CLI_PLATFORMS.filter(due).map(({ id }) => id),
    );
    for (const { builds } of [...APPS, ...CLIS]) {
      for (const build of builds) {
        expect(build.url).toBe(`${RELEASE.base}/${build.name}`);
        expect(build.name).toContain(RELEASE.version);
        expect(build.sha256).toMatch(/^[0-9a-f]{64}$/);
        expect(build.size).toBeGreaterThan(0);
      }
    }
  });

  it("chaque système d'exploitation a ses fichiers et chaque logo son image", () => {
    for (const group of OS_GROUPS) {
      expect(
        APPS.some((platform) => platform.os === group.os),
        group.os,
      ).toBe(true);
    }
    const logos = [...APPS, ...CLIS].flatMap((platform) => platform.logos);
    for (const logo of [...logos, ...OS_GROUPS.map((group) => group.logo), ...LOCAL_LOGOS]) {
      expect(existsSync(`public/logos/${logo}.png`), logo).toBe(true);
    }
  });
});

describe("gestionnaires de paquets", () => {
  it("donnent installer, sans fenêtre, mettre à jour et retirer", () => {
    for (const manager of PACKAGE_MANAGERS) {
      expect(manager.install && manager.update && manager.remove, manager.id).toBeTruthy();
      expect(manager.cli).toContain("bonk-cli");
    }
  });

  it("donne à Zypper le dépôt du processeur de la machine, jamais un dépôt x86_64 écrit en dur", () => {
    const zypper = PACKAGE_MANAGERS.find((manager) => manager.id === "zypper");
    expect(zypper?.install).toContain("/rpm/bonk.repo");
    expect(zypper?.install).not.toContain("/rpm/x86_64");
  });
});

describe("commandes", () => {
  it("le flux et la référence ne citent que des commandes et des options qui existent", () => {
    for (const name of [...REFERENCE_COMMANDS, ...ESSENTIAL_FLOW.map((step) => step.command)]) {
      const entry = commandNamed(name);
      expect(entry?.text.en && entry.text.fr, name).toBeTruthy();
    }
    const flags = REFERENCE_COMMANDS.flatMap((name) => commandNamed(name)?.options ?? []);
    for (const common of COMMON_FLAGS) {
      expect(
        flags.some((row) => row.flag.includes(common)),
        common,
      ).toBe(true);
    }
    expect(isCommonFlag("--image <ID>")).toBe(true);
    expect(isCommonFlag("--sha256-file <PATH_OR_URL>")).toBe(false);
  });

  it("la commande d'écriture ne devine aucun disque et n'emploie que des options de bonk", () => {
    expect(writeCommand("ubuntu-26.04-desktop-x86_64")).toBe(
      "bonk disk write <DISK> --image ubuntu-26.04-desktop-x86_64 --yes",
    );
    const options = commandNamed(WRITE_COMMAND)?.options.map((row) => row.flag) ?? [];
    expect(options).toContain("--image <ID>");
    expect(options).toContain("--yes");
  });
});

describe("lien bonk://", () => {
  it("n'existe pas tant qu'aucune version publiée ne gère le schéma", () => {
    expect(DEEP_LINK.since).toBeNull();
    expect(bonkLink("mint", "0.0.5", DEEP_LINK)).toBeUndefined();
  });

  it("apparaît à partir de la version qui le déclare", () => {
    const config = { since: "0.1.0", template: "bonk://install/{image}" };
    expect(bonkLink("linuxmint-22.3", "0.0.9", config)).toBeUndefined();
    expect(bonkLink("linuxmint-22.3", "0.1.0", config)).toBe("bonk://install/linuxmint-22.3");
    expect(bonkLink("a b", "1.0.0", config)).toBe("bonk://install/a%20b");
  });
});

describe("fiches des systèmes", () => {
  it("toute valeur matérielle cite la page de l'éditeur", () => {
    for (const [id, drive] of Object.entries(PUBLISHER_DRIVES)) {
      expect(drive.source, id).toMatch(/^https:\/\//);
    }
  });

  it("le rail commence par toutes les catégories", () => {
    expect(CATEGORIES[0]?.id).toBe("all");
  });
});
