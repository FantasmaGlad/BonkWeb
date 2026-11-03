import type { Language } from "./text";

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

const distinct = (values: (string | undefined)[]): string[] =>
  [...new Set(values.filter((value): value is string => Boolean(value)))].sort();

export const categoriesOf = (catalog: Catalog): string[] =>
  distinct(catalog.families.map((family) => family.category));

export const architecturesOf = (catalog: Catalog): string[] =>
  distinct(catalog.images.map((image) => image.arch));

/** Decimal units, as the publishers print them; below 0.1 GB, megabytes, so a small image never reads "0.0". */
export const sizeLabel = (bytes: number, language: Language): string => {
  const [value, unit] =
    bytes < 1e8 ? [String(Math.round(bytes / 1e6)), "MB"] : [(bytes / 1e9).toFixed(1), "GB"];
  return language === "fr"
    ? `${value.replace(".", ",")} ${unit === "GB" ? "Go" : "Mo"}`
    : `${value} ${unit}`;
};

/** The catalog names its categories in English; unknown ones stay as published. */
const CATEGORY_FR: Record<string, string> = {
  "Arch family": "Famille Arch",
  "Debian derivatives": "Dérivées de Debian",
  "Independent Linux": "Linux indépendants",
  "Other systems": "Autres systèmes",
  "Red Hat family": "Famille Red Hat",
  "SUSE family": "Famille SUSE",
  Servers: "Serveurs",
};

export const categoryLabel = (category: string, language: Language): string =>
  language === "fr" ? (CATEGORY_FR[category] ?? category) : category;

/** The catalog writes its notes in English; a note not listed here stays as published. */
const NOTE_FR: Record<string, string> = {
  "DVD or virtual machine only: this file has no USB disk boot.":
    "DVD ou machine virtuelle seulement : ce fichier ne démarre pas depuis une clé USB.",
  "90-day evaluation; hash computed from Microsoft's file, none is published":
    "Évaluation de 90 jours ; empreinte calculée sur le fichier de Microsoft, qui n'en publie pas",
  "Last image published in 2023. Hash computed from the publisher's file and checked against its SHA-1.":
    "Dernière image publiée en 2023. Empreinte calculée sur le fichier de l'éditeur et contrôlée avec son SHA-1.",
  "Hash computed from the publisher's file and checked against its SHA-512.":
    "Empreinte calculée sur le fichier de l'éditeur et contrôlée avec son SHA-512.",
  "Hash computed from the publisher's mirror file.":
    "Empreinte calculée sur le fichier du miroir de l'éditeur.",
  "CD or virtual machine only: the file has no USB boot sector. Hash computed from the publisher's file; it matches the MD5 the publisher lists.":
    "CD ou machine virtuelle seulement : le fichier n'a pas de secteur de démarrage USB. Empreinte calculée sur le fichier de l'éditeur ; elle correspond au MD5 qu'il publie.",
  "Hash computed from the publisher's file.": "Empreinte calculée sur le fichier de l'éditeur.",
};

export const noteLabel = (note: string, language: Language): string =>
  language === "fr" ? (NOTE_FR[note] ?? note) : note;

/** Higher-resolution logos shipped with the site; the other systems keep the catalog's icon. */
const LOCAL_LOGOS = new Set([
  "almalinux",
  "arch",
  "debian",
  "fedora",
  "gentoo",
  "kali",
  "linuxmint",
  "manjaro",
  "nixos",
  "opensuse",
  "rockylinux",
  "ubuntu",
  "windows",
  "zorin",
]);

export const logoOf = (family: CatalogFamily): string =>
  LOCAL_LOGOS.has(family.id) ? `/logos/${family.id}.png` : `${CATALOG_URL}${family.icon}`;

/** What a system's card shows: its newest supported image stands for it. */
export type SystemSummary = {
  family: CatalogFamily;
  latest: CatalogImage;
  count: number;
  architectures: string[];
};

const supportedFirst = (images: CatalogImage[]): CatalogImage | undefined =>
  images.find((image) => image.channel !== "end_of_life") ?? images[0];

export type StoreFilter = {
  query: string;
  category: string;
  arch: string;
  sort: "name" | "recent";
};

export const NO_STORE_FILTER: StoreFilter = { query: "", category: "", arch: "", sort: "name" };

/** Accents and case ignored, so "elementary" finds "Elementary" and "debian" finds "Dérivées de Debian". */
const fold = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export const summarize = (
  catalog: Catalog,
  filter: StoreFilter,
  language: Language,
): SystemSummary[] => {
  const words = fold(filter.query).split(/\s+/).filter(Boolean);
  const summaries = catalog.families.flatMap((family): SystemSummary[] => {
    if (filter.category && family.category !== filter.category) {
      return [];
    }
    const haystack = fold(
      [
        family.name,
        family.id,
        family.category ?? "",
        categoryLabel(family.category ?? "", language),
      ]
        .concat(catalog.images.filter((image) => image.family === family.id).map((i) => i.name))
        .join(" "),
    );
    if (!words.every((word) => haystack.includes(word))) {
      return [];
    }
    const images = imagesOf(catalog, family.id).filter(
      (image) => !filter.arch || image.arch === filter.arch,
    );
    const latest = supportedFirst(images);
    return latest
      ? [
          {
            family,
            latest,
            count: images.length,
            architectures: distinct(images.map((i) => i.arch)),
          },
        ]
      : [];
  });
  return filter.sort === "recent"
    ? summaries.sort(
        (a, b) =>
          b.latest.released.localeCompare(a.latest.released) ||
          a.family.name.localeCompare(b.family.name),
      )
    : summaries.sort((a, b) => a.family.name.localeCompare(b.family.name));
};

/** Newest releases, one per system, so a single publisher's batch does not fill the row. */
export const recentReleases = (catalog: Catalog, count: number): CatalogImage[] => {
  const seen = new Set<string>();
  return [...catalog.images]
    .filter((image) => image.channel !== "end_of_life" && image.url)
    .sort((a, b) => b.released.localeCompare(a.released) || a.id.localeCompare(b.id))
    .filter((image) => {
      const first = !seen.has(image.family);
      seen.add(image.family);
      return first;
    })
    .slice(0, count);
};

export const countByCategory = (catalog: Catalog): [string, number][] =>
  categoriesOf(catalog).map((category) => [
    category,
    catalog.families.filter((family) => family.category === category).length,
  ]);

/** Store state carried in the address, so a filter or a system can be linked and the back button works. */
export const storeFromAddress = (search: string): { filter: StoreFilter; system: string } => {
  const query = new URLSearchParams(search);
  const sort = query.get("sort");
  return {
    filter: {
      query: query.get("q") ?? "",
      category: query.get("category") ?? "",
      arch: query.get("arch") ?? "",
      sort: sort === "recent" ? "recent" : "name",
    },
    system: query.get("system") ?? "",
  };
};

/** Versions of one system, newest first, each with its editions. */
export const versionsOf = (images: CatalogImage[]): [string, CatalogImage[]][] => {
  const groups = new Map<string, CatalogImage[]>();
  for (const image of images) {
    const key = `${image.name} ${image.version}`;
    groups.set(key, [...(groups.get(key) ?? []), image]);
  }
  return [...groups.entries()];
};

export const loadCatalog = async (): Promise<Catalog> => {
  const response = await fetch(`${CATALOG_URL}catalog.json`);
  if (!response.ok) {
    throw new Error(String(response.status));
  }
  return response.json();
};
