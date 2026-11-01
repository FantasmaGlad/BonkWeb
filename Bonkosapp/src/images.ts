export const CATALOG_URL = "https://catalog.bonk-os.app/v1/";

export type CatalogFamily = { id: string; name: string; icon: string; category?: string };

export type CatalogImage = {
  id: string;
  family: string;
  name: string;
  version: string;
  edition?: string;
  channel: "lts" | "stable" | "end_of_life";
  released: string;
  arch?: string;
  note?: string;
  usb_boot?: boolean;
  homepage: string;
  url?: string;
  sha256?: string;
  size_bytes?: number;
  official_page?: string;
};

export type Catalog = { families: CatalogFamily[]; images: CatalogImage[] };

/** Newest version first: 24.04.5 stays below 26.04.1 even when released later, and 9 below 10. */
export const compareVersions = (a: string, b: string): number => {
  const numbers = (version: string) => (version.match(/\d+/g) ?? []).map(Number);
  const [left, right] = [numbers(a), numbers(b)];
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (right[index] ?? 0) - (left[index] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }
  return 0;
};

export const imagesOf = (catalog: Catalog, family: string): CatalogImage[] =>
  catalog.images
    .filter((image) => image.family === family)
    .sort((a, b) => compareVersions(a.version, b.version) || a.id.localeCompare(b.id));

export type SortBy = "version" | "released" | "size";

export type CatalogFilter = { category: string; family: string; arch: string; sort: SortBy };

export const NO_FILTER: CatalogFilter = { category: "", family: "", arch: "", sort: "version" };

const distinct = (values: (string | undefined)[]): string[] =>
  [...new Set(values.filter((value): value is string => Boolean(value)))].sort();

export const categoriesOf = (catalog: Catalog): string[] =>
  distinct(catalog.families.map((family) => family.category));

export const architecturesOf = (catalog: Catalog): string[] =>
  distinct(catalog.images.map((image) => image.arch));

/** Filter given in the address, so a category can be linked from elsewhere. */
export const filterFromAddress = (search: string): CatalogFilter => {
  const query = new URLSearchParams(search);
  return {
    ...NO_FILTER,
    category: query.get("category") ?? "",
    family: query.get("system") ?? "",
    arch: query.get("arch") ?? "",
  };
};

export const familiesIn = (catalog: Catalog, filter: CatalogFilter): CatalogFamily[] =>
  catalog.families.filter(
    (family) =>
      (!filter.category || family.category === filter.category) &&
      (!filter.family || family.id === filter.family),
  );

/** One system's images once filtered; a system left without any is not shown. */
export const selectImages = (
  catalog: Catalog,
  family: string,
  filter: CatalogFilter,
): CatalogImage[] => {
  const images = imagesOf(catalog, family).filter(
    (image) => !filter.arch || image.arch === filter.arch,
  );
  if (filter.sort === "released") {
    return images.sort((a, b) => b.released.localeCompare(a.released));
  }
  if (filter.sort === "size") {
    return images.sort((a, b) => (a.size_bytes ?? Infinity) - (b.size_bytes ?? Infinity));
  }
  return images;
};

export const sizeLabel = (bytes: number): string => `${(bytes / 1e9).toFixed(1)} GB`;

export const loadCatalog = async (): Promise<Catalog> => {
  const response = await fetch(`${CATALOG_URL}catalog.json`);
  if (!response.ok) {
    throw new Error(String(response.status));
  }
  return response.json();
};
