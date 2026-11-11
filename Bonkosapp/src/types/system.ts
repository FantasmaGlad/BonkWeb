import type { CatalogFamily, CatalogImage } from "./catalog";

export type UseId =
  | "desktop"
  | "beginner"
  | "gaming"
  | "light"
  | "creative"
  | "advanced"
  | "server"
  | "homelab"
  | "privacy"
  | "rescue"
  | "media"
  | "boards"
  | "windows"
  | "other";

export type CategoryId = "all" | UseId;

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

export type Category = { id: CategoryId; match: (system: SystemSummary) => boolean };

export type CatalogFilter = {
  query: string;
  category: CategoryId;
  arch: string;
  /** Memory of the target computer, in MiB; 0 for any. */
  ramMb: number;
  /** Size of the drive at hand, in GB; 0 for any. */
  driveGb: number;
};
