import type { CatalogFamily, CatalogImage } from "./catalog";

/** `all`, or a usage of the catalog's taxonomy. */
export type CategoryId = string;

/** A figure the publisher states, with the page it was read on. */
export type Stated = { value: number; source: string };

export type SystemSummary = {
  family: CatalogFamily;
  images: CatalogImage[];
  /** Newest supported image: it stands for the system on its card. */
  latest: CatalogImage;
  architectures: string[];
  /** Least memory among its variants, in MiB, when the publisher states one. */
  memory?: Stated | undefined;
  driveGb?: number | undefined;
};

export type CatalogFilter = {
  query: string;
  category: CategoryId;
  /** Technical base of the system (`debian`); empty for any. */
  base: string;
  arch: string;
  /** Memory of the target computer, in MiB; 0 for any. */
  ramMb: number;
  /** Size of the drive at hand, in GB; 0 for any. */
  driveGb: number;
  /** Desktop of the image (`xfce`, `none`); empty for any. */
  desktop: string;
  /** `usb`, `sd` or `optical`; empty for any. */
  media: string;
};
