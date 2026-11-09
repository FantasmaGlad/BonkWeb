import type { CatalogFamily, CatalogImage } from "./catalog";

export type UsageTag = "daily" | "server" | "light" | "security";

/** Editorial facts the signed catalog does not carry, each with the publisher page it was read on. */
export type SystemProfile = {
  tags: readonly UsageTag[];
  ramMb?: number;
  /** Drive size the publisher asks for, when larger than the image itself. */
  driveGb?: number;
  source?: string;
};

export type CategoryId =
  | "all"
  | "daily"
  | "windows"
  | "server"
  | "light"
  | "security"
  | "arm"
  | "alt";

export type SystemSummary = {
  family: CatalogFamily;
  images: CatalogImage[];
  /** Newest supported image: it stands for the system on its card. */
  latest: CatalogImage;
  architectures: string[];
  profile: SystemProfile;
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
