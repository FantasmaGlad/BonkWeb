import { CATEGORIES } from "../../../data/categories";
import { summaryOf } from "../../../shared/lib/catalog";
import type { CatalogFilter, CategoryId, SystemSummary } from "../../../types/system";

/** Accents and case ignored, so "elementary" finds "Elementary". */
const fold = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export const NO_FILTER: CatalogFilter = {
  query: "",
  category: "all",
  arch: "",
  ramMb: 0,
  driveGb: 0,
};

export const isFiltered = (filter: CatalogFilter): boolean =>
  Object.entries(NO_FILTER).some(([key, value]) => filter[key as keyof CatalogFilter] !== value);

export const filterSystems = (
  systems: readonly SystemSummary[],
  filter: CatalogFilter,
  describe: (system: string) => string = () => "",
): SystemSummary[] => {
  const words = fold(filter.query).split(/\s+/).filter(Boolean);
  const category = CATEGORIES.find((candidate) => candidate.id === filter.category);
  return systems.flatMap((system) => {
    const { family, profile } = system;
    if (category && !category.match(system)) {
      return [];
    }
    // A system whose publisher states no memory figure cannot be promised to fit a given one.
    if (filter.ramMb && !(profile.ramMb !== undefined && profile.ramMb <= filter.ramMb)) {
      return [];
    }
    if (filter.driveGb && (profile.driveGb ?? 0) > filter.driveGb) {
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
    const images = system.images.filter(
      (image) =>
        (!filter.arch || image.arch === filter.arch) &&
        (!filter.driveGb ||
          (image.size_bytes !== undefined && image.size_bytes <= filter.driveGb * 1e9)),
    );
    return summaryOf(family, images) ?? [];
  });
};

const isCategory = (value: string | null): value is CategoryId =>
  CATEGORIES.some((category) => category.id === value);

/** Marketplace state carried in the address, so a view can be linked and the back button works. */
export const filterFromParams = (params: URLSearchParams): CatalogFilter => {
  const category = params.get("category");
  return {
    query: params.get("q") ?? "",
    category: isCategory(category) ? category : "all",
    arch: params.get("arch") ?? "",
    ramMb: Number(params.get("ram")) || 0,
    driveGb: Number(params.get("drive")) || 0,
  };
};

export const paramsOfFilter = (filter: CatalogFilter): Record<string, string | undefined> => ({
  q: filter.query || undefined,
  category: filter.category === "all" ? undefined : filter.category,
  arch: filter.arch || undefined,
  ram: filter.ramMb ? String(filter.ramMb) : undefined,
  drive: filter.driveGb ? String(filter.driveGb) : undefined,
});
