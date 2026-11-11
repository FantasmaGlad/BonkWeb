import { memoryOf, supported, writable } from "../../../shared/lib/catalog";
import type { CatalogFamily, CatalogImage } from "../../../types/catalog";
import type { Stated } from "../../../types/system";
import { choicesFor, defaultImage, editionKey, reselect } from "./selection";

export type VariantGroup = "desktop" | "choice" | "headless" | "boards" | "elsewhere";

export const GROUPS: readonly VariantGroup[] = [
  "desktop",
  "choice",
  "headless",
  "boards",
  "elsewhere",
];

/** Most common desktops first; one missing from the list goes last. */
const DESKTOP_ORDER = [
  "gnome",
  "kde",
  "cinnamon",
  "xfce",
  "mate",
  "lxqt",
  "lxde",
  "budgie",
  "cosmic",
  "pantheon",
  "deepin",
  "enlightenment",
  "pixel",
  "i3",
  "sway",
];

const desktopRank = (image: CatalogImage): number => {
  const rank = DESKTOP_ORDER.indexOf(image.desktop ?? "");
  return rank < 0 ? DESKTOP_ORDER.length : rank;
};

export type Variant = {
  key: string;
  group: VariantGroup;
  /** What choosing this variant gives: same version and processor when they exist. */
  image: CatalogImage;
  memory: Stated | undefined;
};

export const groupOf = (image: CatalogImage): VariantGroup => {
  if (image.media === "optical" || image.usb_boot === false) {
    return "elsewhere";
  }
  if (image.media === "sd") {
    return "boards";
  }
  if (image.desktop === "none") {
    return "headless";
  }
  return image.desktop === "choice" ? "choice" : "desktop";
};

/** Every variant of a system, grouped, the writable ones first within each group. */
export const variantsOf = (
  family: CatalogFamily,
  images: readonly CatalogImage[],
  selected: CatalogImage,
): Variant[] => {
  const variants = choicesFor(images, selected).editions.map((first) => {
    const key = editionKey(first);
    const image =
      editionKey(selected) === key ? selected : reselect(images, selected, { edition: key });
    return { key, group: groupOf(image), image, memory: memoryOf(image, family) };
  });
  const rank = (variant: Variant) => [
    GROUPS.indexOf(variant.group),
    Number(!writable(variant.image)),
    desktopRank(variant.image),
  ];
  const compare = (a: Variant, b: Variant) =>
    rank(a).reduce((order, value, index) => order || value - (rank(b)[index] ?? 0), 0);
  return variants
    .map((variant, index) => ({ variant, index }))
    .sort((a, b) => compare(a.variant, b.variant) || a.index - b.index)
    .map(({ variant }) => variant);
};

/** The first variant shown that Bonk can write, at the processor asked for when it exists. */
export const firstVariant = (
  family: CatalogFamily,
  images: readonly CatalogImage[],
  arch: string | undefined,
): CatalogImage | undefined => {
  const base = defaultImage(images, arch);
  if (!base) {
    return undefined;
  }
  const usable = variantsOf(family, images, base).find(
    (variant) => writable(variant.image) && supported(variant.image),
  );
  return usable?.image ?? base;
};
