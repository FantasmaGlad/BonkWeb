export type CatalogFamily = {
  id: string;
  name: string;
  icon: string;
  category?: string;
  /** The system a flavour derives from: `ubuntu` for Kubuntu. */
  parent?: string;
  /** Usage categories, the main one first. */
  uses?: string[];
  /** Minimum memory the publisher states for the whole system, and where. */
  ram_mb?: number;
  ram_source?: string;
};

export type CatalogImage = {
  id: string;
  family: string;
  name: string;
  version: string;
  edition?: string;
  /** `archive`: an older version served by the publisher's own archive. */
  channel: "lts" | "stable" | "end_of_life" | "archive";
  released: string;
  arch: string;
  note?: string;
  usb_boot?: boolean;
  homepage: string;
  url?: string;
  sha256?: string;
  size_bytes?: number;
  official_page?: string;
  /** Desktop installed: `none` without one, `choice` picked during installation. */
  desktop?: string;
  kind?: "live" | "installer" | "netinst" | "preinstalled" | "rescue";
  media?: "usb" | "sd" | "optical";
  /** Memory the publisher states for this variant, when it differs from the system's. */
  ram_mb?: number;
  ram_source?: string;
};

export type Catalog = { families: CatalogFamily[]; images: CatalogImage[] };
