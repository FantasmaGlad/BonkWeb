import type { CatalogImage } from "../../../types/catalog";
import { choicesFor, defaultImage, reselect } from "../lib/selection";

/** Cascade edition, architecture, version: each step narrows the next, and one image comes out. */
export function useImageSelection(
  images: readonly CatalogImage[],
  imageId: string,
  preferredArch: string | undefined,
  onSelect: (image: string) => void,
) {
  const selected =
    images.find((image) => image.id === imageId) ?? defaultImage(images, preferredArch);
  if (!selected) {
    return undefined;
  }
  return {
    selected,
    choices: choicesFor(images, selected),
    setEdition: (edition: string) => onSelect(reselect(images, selected, { edition }).id),
    setArch: (arch: string) => onSelect(reselect(images, selected, { arch }).id),
    setVersion: (image: string) => onSelect(image),
  };
}
