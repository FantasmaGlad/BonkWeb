import { DISK_PLACEHOLDER, WRITE_TEMPLATE } from "../../../data/commands";
import { writable } from "../../../shared/lib/catalog";
import type { CatalogImage } from "../../../types/catalog";

export const writeCommand = (image: string): string =>
  WRITE_TEMPLATE.replace("{disk}", DISK_PLACEHOLDER).replace("{image}", image);

/** The exact command that writes this image; none for a file that cannot boot from a drive. */
export function useCommandBuilder(image: CatalogImage): string | undefined {
  return writable(image) ? writeCommand(image.id) : undefined;
}
