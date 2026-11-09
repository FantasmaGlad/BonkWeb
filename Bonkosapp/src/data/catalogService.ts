import type { Catalog } from "../types/catalog";
import { CATALOG_URL } from "./links";

export const loadCatalog = async (): Promise<Catalog> => {
  const response = await fetch(`${CATALOG_URL}catalog.json`);
  if (!response.ok) {
    throw new Error(String(response.status));
  }
  return response.json();
};

/** Logos shipped with the site in higher resolution; the other systems keep the catalog's icon. */
export const LOCAL_LOGOS: ReadonlySet<string> = new Set([
  "almalinux",
  "arch",
  "debian",
  "fedora",
  "gentoo",
  "kali",
  "linuxmint",
  "manjaro",
  "nixos",
  "opensuse",
  "rockylinux",
  "ubuntu",
  "windows",
  "zorin",
]);

export const logoOf = (family: { id: string; icon: string }): string =>
  LOCAL_LOGOS.has(family.id) ? `/logos/${family.id}.png` : `${CATALOG_URL}${family.icon}`;

export const localLogo = (name: string): string => `/logos/${name}.png`;
