import { distinct, supported } from "../../../shared/lib/catalog";
import type { CatalogImage } from "../../../types/catalog";

/** An edition is a product name and its variant: "Ubuntu desktop", "Kubuntu". */
export const editionKey = (image: CatalogImage): string => `${image.name}|${image.edition ?? ""}`;

export const editionLabel = (image: CatalogImage, familyName: string, standard: string): string =>
  image.name === familyName
    ? (image.edition ?? standard)
    : [image.name, image.edition].filter(Boolean).join(" ");

export type ImageChoices = {
  editions: CatalogImage[];
  architectures: string[];
  versions: CatalogImage[];
};

/** What each step of the cascade offers once the steps before it are fixed. */
export const choicesFor = (
  images: readonly CatalogImage[],
  selected: CatalogImage,
): ImageChoices => {
  const seen = new Set<string>();
  const editions = images.filter((image) => {
    const first = !seen.has(editionKey(image));
    seen.add(editionKey(image));
    return first;
  });
  const sameEdition = images.filter((image) => editionKey(image) === editionKey(selected));
  return {
    editions,
    architectures: distinct(sameEdition.map((image) => image.arch)),
    versions: sameEdition.filter((image) => image.arch === selected.arch),
  };
};

const writable = (image: CatalogImage) => Boolean(image.url) && image.usb_boot !== false;

const best = (
  images: readonly CatalogImage[],
  arch: string | undefined,
): CatalogImage | undefined => {
  const ranked = [
    (image: CatalogImage) => supported(image) && writable(image) && image.arch === arch,
    (image: CatalogImage) => supported(image) && writable(image) && image.arch === "x86_64",
    (image: CatalogImage) => supported(image) && writable(image),
    supported,
    () => true,
  ];
  for (const rule of ranked) {
    const found = images.find(rule);
    if (found) {
      return found;
    }
  }
  return undefined;
};

export const defaultImage = best;

/** Changing a step keeps the later ones when they still exist, else falls to the newest image. */
export const reselect = (
  images: readonly CatalogImage[],
  selected: CatalogImage,
  change: { edition?: string; arch?: string },
): CatalogImage => {
  const edition = change.edition ?? editionKey(selected);
  const arch = change.arch ?? selected.arch;
  const sameEdition = images.filter((image) => editionKey(image) === edition);
  return (
    sameEdition.find((image) => image.arch === arch && image.version === selected.version) ??
    best(
      sameEdition.filter((image) => !change.arch || image.arch === arch),
      arch,
    ) ??
    selected
  );
};
