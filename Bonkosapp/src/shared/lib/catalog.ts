import { PUBLISHER_DRIVES } from "../../data/systems";
import type { Catalog, CatalogImage, Term } from "../../types/catalog";
import type { Stated, SystemSummary } from "../../types/system";
import { driveFor } from "./format";

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

export const supported = (image: CatalogImage) =>
  image.channel !== "end_of_life" && image.channel !== "archive";

/** Bonk can download and write it: a link and a file that boots from a drive, never a disc-only image. */
export const writable = (image: CatalogImage) =>
  Boolean(image.url) && image.usb_boot !== false && image.media !== "optical";

export const distinct = (values: string[]): string[] => [...new Set(values)].sort();

/** Within one version, the system itself before its flavours (Ubuntu before Kubuntu). */
const imagesOf = (catalog: Catalog, family: { id: string; name: string }): CatalogImage[] =>
  catalog.images
    .filter((image) => image.family === family.id)
    .sort(
      (a, b) =>
        compareVersions(a.version, b.version) ||
        Number(a.name !== family.name) - Number(b.name !== family.name) ||
        a.id.localeCompare(b.id),
    );

/** A variant's own figure, else the system's. */
export const memoryOf = (
  image: CatalogImage,
  family: SystemSummary["family"],
): Stated | undefined => {
  const value = image.ram_mb ?? family.ram_mb;
  const source = image.ram_mb ? image.ram_source : family.ram_source;
  return value && source ? { value, source } : undefined;
};

const leastMemory = (family: SystemSummary["family"], images: CatalogImage[]): Stated | undefined =>
  images
    .flatMap((image) => memoryOf(image, family) ?? [])
    .reduce<Stated | undefined>(
      (least, memory) => (least && least.value <= memory.value ? least : memory),
      undefined,
    );

export const summaryOf = (
  family: SystemSummary["family"],
  images: CatalogImage[],
): SystemSummary | undefined => {
  const latest =
    images.find((image) => supported(image) && writable(image)) ??
    images.find(supported) ??
    images[0];
  if (!latest) {
    return undefined;
  }
  const asked = PUBLISHER_DRIVES[family.id]?.value;
  const sizes = images.filter(supported).flatMap((image) => image.size_bytes ?? []);
  const fitting = sizes.length ? driveFor(Math.min(...sizes)) : undefined;
  const driveGb = Math.max(asked ?? 0, fitting ?? 0) || undefined;
  return {
    family,
    images,
    latest,
    architectures: distinct(images.map((image) => image.arch)),
    memory: leastMemory(family, images.filter(supported)),
    driveGb,
  };
};

export const summarize = (catalog: Catalog): SystemSummary[] =>
  catalog.families
    .flatMap((family) => summaryOf(family, imagesOf(catalog, family)) ?? [])
    .sort((a, b) => a.family.name.localeCompare(b.family.name));

/** Desktops present in the catalog, in a stable order. */
export const desktopsOf = (catalog: Catalog): string[] =>
  distinct(catalog.images.flatMap((image) => image.desktop ?? []));

/** The bases some system rests on, in the taxonomy's order. */
export const basesOf = (catalog: Catalog, bases: readonly Term[]): Term[] =>
  bases.filter(({ id }) => catalog.families.some((family) => family.category === id));

export const architecturesOf = (catalog: Catalog): string[] =>
  distinct(catalog.images.map((image) => image.arch));

/** Newest releases, one per system, so a single publisher's batch does not fill the list. */
export const recentReleases = (systems: readonly SystemSummary[], count: number): SystemSummary[] =>
  systems
    .filter((system) => supported(system.latest))
    .map((system) => ({
      ...system,
      latest: system.images
        .filter(supported)
        .reduce(
          (newest, image) => (image.released > newest.released ? image : newest),
          system.latest,
        ),
    }))
    .sort(
      (a, b) =>
        b.latest.released.localeCompare(a.latest.released) ||
        a.family.name.localeCompare(b.family.name),
    )
    .slice(0, count);
