import { DEEP_LINK } from "../../../data/platforms";
import { RELEASE } from "../../../data/releases";
import { compareVersions } from "../../../shared/lib/catalog";
import type { CatalogImage } from "../../../types/catalog";

/** Address that opens the image in an installed Bonk, once a published version handles the scheme. */
export const bonkLink = (
  image: string,
  latest: string,
  config: { since: string | null; template: string },
): string | undefined =>
  config.since !== null && compareVersions(config.since, latest) >= 0
    ? config.template.replace("{image}", encodeURIComponent(image))
    : undefined;

export function useBonkLink(image: CatalogImage): string | undefined {
  return image.url && image.usb_boot !== false
    ? bonkLink(image.id, RELEASE.version, DEEP_LINK)
    : undefined;
}
