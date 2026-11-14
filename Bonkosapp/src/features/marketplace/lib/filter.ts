import { PUBLISHER_DRIVES } from "../../../data/systems";
import { summaryOf } from "../../../shared/lib/catalog";
import type { CatalogImage } from "../../../types/catalog";
import type { CatalogFilter, SystemSummary } from "../../../types/system";

/** Accents and case ignored, so "elementary" finds "Elementary". */
const fold = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export const NO_FILTER: CatalogFilter = {
  query: "",
  category: "all",
  base: "",
  arch: "",
  ramMb: 0,
  driveGb: 0,
  desktop: "",
  media: "",
};

/** What a file is written to; a catalog without the field says so through `usb_boot`. */
export const mediaOf = (image: CatalogImage): string =>
  image.media ?? (image.usb_boot === false ? "optical" : "usb");

const imageFits = (image: CatalogImage, filter: CatalogFilter): boolean =>
  (!filter.arch || image.arch === filter.arch) &&
  (!filter.desktop || image.desktop === filter.desktop) &&
  (!filter.media || mediaOf(image) === filter.media) &&
  (!filter.driveGb || (image.size_bytes !== undefined && image.size_bytes <= filter.driveGb * 1e9));

export const isFiltered = (filter: CatalogFilter): boolean =>
  Object.entries(NO_FILTER).some(([key, value]) => filter[key as keyof CatalogFilter] !== value);

export const filterSystems = (
  systems: readonly SystemSummary[],
  filter: CatalogFilter,
  describe: (system: string) => string = () => "",
): SystemSummary[] => {
  const words = fold(filter.query).split(/\s+/).filter(Boolean);
  return systems.flatMap((system) => {
    const { family } = system;
    if (filter.category !== "all" && !family.uses?.includes(filter.category)) {
      return [];
    }
    if (filter.base && family.category !== filter.base) {
      return [];
    }
    if (filter.ramMb && system.memory && system.memory.value > filter.ramMb) {
      return [];
    }
    if (filter.driveGb && (PUBLISHER_DRIVES[family.id]?.value ?? 0) > filter.driveGb) {
      return [];
    }
    const haystack = fold(
      [family.name, family.id, describe(family.id)]
        .concat(system.images.flatMap((image) => [image.name, image.edition ?? ""]))
        .join(" "),
    );
    if (!words.every((word) => haystack.includes(word))) {
      return [];
    }
    const images = system.images.filter((image) => imageFits(image, filter));
    return summaryOf(family, images) ?? [];
  });
};

/** With a memory filter, systems whose publisher states no figure are set apart rather than promised to fit. */
export const splitByRam = (
  systems: readonly SystemSummary[],
  filter: CatalogFilter,
): { fitting: SystemSummary[]; unstated: SystemSummary[] } => {
  const unstated = (system: SystemSummary) => filter.ramMb > 0 && system.memory === undefined;
  return {
    fitting: systems.filter((system) => !unstated(system)),
    unstated: systems.filter(unstated),
  };
};

/** Marketplace state carried in the address, so a view can be linked and the back button works. */
export const filterFromParams = (params: URLSearchParams): CatalogFilter => {
  return {
    query: params.get("q") ?? "",
    category: params.get("category") || "all",
    base: params.get("base") ?? "",
    arch: params.get("arch") ?? "",
    ramMb: Number(params.get("ram")) || 0,
    driveGb: Number(params.get("drive")) || 0,
    desktop: params.get("desktop") ?? "",
    media: params.get("media") ?? "",
  };
};

export const paramsOfFilter = (filter: CatalogFilter): Record<string, string | undefined> => ({
  q: filter.query || undefined,
  category: filter.category === "all" ? undefined : filter.category,
  base: filter.base || undefined,
  arch: filter.arch || undefined,
  ram: filter.ramMb ? String(filter.ramMb) : undefined,
  drive: filter.driveGb ? String(filter.driveGb) : undefined,
  desktop: filter.desktop || undefined,
  media: filter.media || undefined,
});
