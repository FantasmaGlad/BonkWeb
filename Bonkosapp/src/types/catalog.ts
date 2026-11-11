export type CatalogFamily = {
  id: string;
  name: string;
  icon: string;
  category?: string;
  /** The system a flavour derives from: `ubuntu` for Kubuntu. */
  parent?: string;
};

export type CatalogImage = {
  id: string;
  family: string;
  name: string;
  version: string;
  edition?: string;
  channel: "lts" | "stable" | "end_of_life";
  released: string;
  arch: string;
  note?: string;
  usb_boot?: boolean;
  homepage: string;
  url?: string;
  sha256?: string;
  size_bytes?: number;
  official_page?: string;
};

export type Catalog = { families: CatalogFamily[]; images: CatalogImage[] };
