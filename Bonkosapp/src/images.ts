export const CATALOG_URL = "https://catalog.bonk-os.app/v1/";

export type CatalogFamily = { id: string; name: string; icon: string };

export type CatalogImage = {
  id: string;
  family: string;
  name: string;
  version: string;
  edition?: string;
  channel: "lts" | "stable" | "end_of_life";
  released: string;
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

export const sizeLabel = (bytes: number): string => `${(bytes / 1e9).toFixed(1)} GB`;

export const loadCatalog = async (): Promise<Catalog> => {
  const response = await fetch(`${CATALOG_URL}catalog.json`);
  if (!response.ok) {
    throw new Error(String(response.status));
  }
  return response.json();
};
