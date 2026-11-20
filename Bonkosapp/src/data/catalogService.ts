import type { Catalog } from "../types/catalog";
import { TRUSTED_KEYS } from "./catalogKeys";
import { ed25519Available, verifiedText } from "./catalogSignature";
import { CATALOG_URL } from "./links";

const bytes = async (name: string): Promise<Uint8Array<ArrayBuffer>> => {
  const response = await fetch(`${CATALOG_URL}${name}`);
  if (!response.ok) {
    throw new Error(String(response.status));
  }
  return new Uint8Array(await response.arrayBuffer());
};

/** Checked as Bonk checks it; a browser without Ed25519 shows it unchecked, and says so in the console. */
export const loadCatalog = async (): Promise<Catalog> => {
  const [manifest, signature] = await Promise.all([
    bytes("catalog.json"),
    bytes("catalog.json.sig"),
  ]);
  if (!(await ed25519Available())) {
    console.warn("Bonk catalog: this browser cannot check Ed25519 signatures, shown unchecked");
    return JSON.parse(new TextDecoder().decode(manifest));
  }
  return JSON.parse(await verifiedText(manifest, signature, TRUSTED_KEYS, Date.now() / 1000));
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
