import { describe, expect, it } from "vitest";
import { recentReleases, summarize, summaryOf } from "../../../shared/lib/catalog";
import { CATALOG } from "../../../test/fixtures";
import type { CatalogFilter } from "../../../types/system";
import { filterFromParams, filterSystems, NO_FILTER, paramsOfFilter, splitByRam } from "./filter";
import { choicesFor, defaultImage, editionKey, reselect } from "./selection";

const ALL = summarize(CATALOG);
const ids = (filter: Partial<CatalogFilter>) =>
  filterSystems(ALL, { ...NO_FILTER, ...filter }).map((system) => system.family.id);
const ubuntu = ALL.find((system) => system.family.id === "ubuntu");
const images = ubuntu?.images ?? [];
const named = (id: string) => {
  const found = images.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(id);
  }
  return found;
};

describe("résumé", () => {
  it("résume chaque système par sa dernière version maintenue, triés par nom", () => {
    expect(ALL.map((system) => system.family.id)).toEqual(["fedora", "haiku", "tails", "ubuntu"]);
    expect(ubuntu?.latest.id).toBe("u26");
    expect(ubuntu?.architectures).toEqual(["aarch64", "x86_64"]);
    expect(ubuntu?.memory).toEqual({ value: 6144, source: "https://ubuntu.example/desktop" });
  });

  it("donne la clé nécessaire : celle de l'image, ou celle que l'éditeur demande", () => {
    expect(ubuntu?.driveGb).toBe(2);
    expect(ALL.find((system) => system.family.id === "tails")?.driveGb).toBe(8);
  });
});

describe("dernières sorties", () => {
  it("donne une sortie par système, la plus récente d'abord, jamais une version en fin de vie", () => {
    const dated = summarize({
      families: CATALOG.families,
      images: CATALOG.images.map((image) =>
        image.id === "u24" ? { ...image, released: "2026-09-09" } : image,
      ),
    });
    const recent = recentReleases(dated, 2);
    expect(recent.map((system) => system.latest.id)).toEqual(["u24", "f44"]);
    expect(recentReleases(dated, 9).length).toBe(4);
  });
});

describe("filtres", () => {
  it("classe par les usages que le catalogue donne à chaque famille", () => {
    expect(ids({ category: "desktop" })).toEqual(["fedora", "ubuntu"]);
    expect(ids({ category: "server" })).toEqual(["ubuntu"]);
    expect(ids({ category: "privacy" })).toEqual(["tails"]);
    expect(ids({ category: "other" })).toEqual(["haiku"]);
    expect(ids({ category: "gaming" })).toEqual([]);
  });

  it("prend la mémoire la plus basse parmi les variantes, celle de l'image avant celle du système", () => {
    const tails = CATALOG.families.find((family) => family.id === "tails");
    const light = { ...named("u26srv"), ram_mb: 1024, ram_source: "https://x.example/light" };
    expect(tails && summaryOf(tails, [named("u24"), light])?.memory?.value).toBe(1024);
    expect(tails && summaryOf(tails, [named("u24")])?.memory?.value).toBe(3072);
  });

  it("cherche sans accent ni casse, aussi dans les éditions et la description", () => {
    expect(ids({ query: "KUBUNTU" })).toEqual(["ubuntu"]);
    expect(ids({ query: "workstation" })).toEqual(["fedora"]);
    expect(ids({ query: "nothing" })).toEqual([]);
    const described = filterSystems(ALL, { ...NO_FILTER, query: "systeme live" }, (id) =>
      id === "tails" ? "Système live" : "",
    );
    expect(described.map((system) => system.family.id)).toEqual(["tails"]);
  });

  it("filtre par processeur, mémoire et clé, sans promettre ce que l'éditeur ne dit pas", () => {
    expect(ids({ arch: "aarch64" })).toEqual(["ubuntu"]);
    expect(ids({ ramMb: 4096 })).toEqual(["fedora", "haiku", "tails"]);
    expect(ids({ ramMb: 8192 })).toEqual(["fedora", "haiku", "tails", "ubuntu"]);
    expect(ids({ driveGb: 4 })).toEqual(["fedora", "haiku", "ubuntu"]);
    const small = filterSystems(ALL, { ...NO_FILTER, driveGb: 4 });
    expect(small.find((system) => system.family.id === "ubuntu")?.latest.id).toBe("u26arm");
  });

  it("met à part, sans les cacher, les systèmes dont l'éditeur ne publie pas la mémoire", () => {
    const filter = { ...NO_FILTER, ramMb: 4096 };
    const { fitting, unstated } = splitByRam(filterSystems(ALL, filter), filter);
    expect(fitting.map((system) => system.family.id)).toEqual(["tails"]);
    expect(unstated.map((system) => system.family.id)).toEqual(["fedora", "haiku"]);
    expect(splitByRam(ALL, NO_FILTER).unstated).toEqual([]);
  });

  it("lit et écrit l'état dans l'adresse", () => {
    const params = new URLSearchParams("q=pro&category=server&arch=aarch64&ram=2048&drive=8");
    const filter = filterFromParams(params);
    expect(filter).toEqual({
      query: "pro",
      category: "server",
      arch: "aarch64",
      ramMb: 2048,
      driveGb: 8,
    });
    expect(paramsOfFilter(filter)).toEqual({
      q: "pro",
      category: "server",
      arch: "aarch64",
      ram: "2048",
      drive: "8",
    });
    expect(filterFromParams(new URLSearchParams("category=nope&ram=x"))).toEqual(NO_FILTER);
  });
});

describe("cascade édition, architecture, version", () => {
  it("part de la dernière image inscriptible, au processeur demandé s'il existe", () => {
    expect(defaultImage(images, undefined)?.id).toBe("u26");
    expect(defaultImage(images, "aarch64")?.id).toBe("u26arm");
    expect(defaultImage(images, "riscv64")?.id).toBe("u26");
  });

  it("n'offre à chaque étape que ce qui existe pour les précédentes", () => {
    const choices = choicesFor(images, named("u26"));
    expect(choices.editions.map(editionKey)).toEqual([
      "Ubuntu|desktop",
      "Ubuntu|server",
      "Kubuntu|",
    ]);
    expect(choices.architectures).toEqual(["aarch64", "x86_64"]);
    expect(choices.versions.map((candidate) => candidate.id)).toEqual(["u26", "u24", "u20"]);
    expect(choicesFor(images, named("k26")).architectures).toEqual(["x86_64"]);
  });

  it("propose d'abord une édition que Bonk sait écrire", () => {
    const dvd = { ...named("u26srv"), id: "dvd", edition: "dvd", usb_boot: false };
    const live = { ...named("u26"), id: "live", edition: "live" };
    expect(choicesFor([dvd, live], dvd).editions.map((image) => image.id)).toEqual(["live", "dvd"]);
    const family = ubuntu?.family;
    expect(family && summaryOf(family, [dvd, live])?.latest.id).toBe("live");
  });

  it("garde la version quand on change de processeur, sinon retombe sur la plus récente", () => {
    expect(reselect(images, named("u26"), { arch: "aarch64" }).id).toBe("u26arm");
    expect(reselect(images, named("u24"), { arch: "aarch64" }).id).toBe("u26arm");
    expect(reselect(images, named("u26arm"), { edition: "Kubuntu|" }).id).toBe("k26");
    expect(reselect(images, named("u24"), { edition: "Ubuntu|server" }).id).toBe("u26srv");
  });
});
