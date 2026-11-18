import { describe, expect, it } from "vitest";
import { summaryOf } from "../../../shared/lib/catalog";
import table from "../../../test/search-cases.json";
import type { CatalogFamily, CatalogImage } from "../../../types/catalog";
import type { SystemSummary } from "../../../types/system";
import { filterSystems, NO_FILTER } from "./filter";

type Query = {
  text?: string;
  uses?: string;
  base?: string;
  desktop?: string;
  media?: string;
  arch?: string;
};

const families: CatalogFamily[] = table.families.map((family) => ({
  id: family.id,
  name: family.name,
  icon: "",
  uses: family.uses,
  ...(family.category ? { category: family.category } : {}),
}));

const images: CatalogImage[] = table.images.map((image) => ({
  id: image.id,
  family: image.family,
  name: image.name,
  version: "1",
  channel: "stable",
  released: "2026-01-01",
  arch: image.arch,
  homepage: "https://example.org/",
  usb_boot: image.usb_boot,
  ...(image.edition ? { edition: image.edition } : {}),
  ...(image.desktop ? { desktop: image.desktop } : {}),
  ...(image.media ? { media: image.media as NonNullable<CatalogImage["media"]> } : {}),
}));

const systems: SystemSummary[] = families.flatMap(
  (family) =>
    summaryOf(
      family,
      images.filter((image) => image.family === family.id),
    ) ?? [],
);

const kept = (query: Query): string[] =>
  filterSystems(systems, {
    ...NO_FILTER,
    query: query.text ?? "",
    category: query.uses ?? "all",
    base: query.base ?? "",
    desktop: query.desktop ?? "",
    media: query.media ?? "",
    arch: query.arch ?? "",
  }).flatMap((system) => system.images.map((image) => image.id));

describe("search rule shared with Bonk", () => {
  it.each(table.cases.map((c) => [c.name, c.query as Query, c.images] as const))(
    "%s",
    (_, query, expected) => {
      expect(kept(query)).toEqual(expected);
    },
  );
});
