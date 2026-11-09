import { vi } from "vitest";
import type { Catalog, CatalogImage } from "../types/catalog";

export const image = (
  id: string,
  family: string,
  version: string,
  extra: Partial<CatalogImage> = {},
): CatalogImage => ({
  id,
  family,
  name: family,
  version,
  channel: "stable",
  released: "2026-01-01",
  arch: "x86_64",
  homepage: `https://${family}.example/`,
  url: `https://${family}.example/${id}.iso`,
  sha256: id.padEnd(64, "0"),
  size_bytes: 2e9,
  ...extra,
});

/** An image the publisher no longer serves: only its page remains. */
const withdrawn = ({ url, sha256, size_bytes, ...rest }: CatalogImage): CatalogImage => rest;

export const CATALOG: Catalog = {
  families: [
    { id: "ubuntu", name: "Ubuntu", icon: "icons/ubuntu.png", category: "Debian derivatives" },
    { id: "tails", name: "Tails", icon: "icons/tails.png", category: "Debian derivatives" },
    { id: "fedora", name: "Fedora", icon: "icons/fedora.png", category: "Red Hat family" },
    { id: "haiku", name: "Haiku", icon: "icons/haiku.png", category: "Other systems" },
  ],
  images: [
    image("u24", "ubuntu", "24.04.5", { name: "Ubuntu", channel: "lts", edition: "desktop" }),
    image("u26", "ubuntu", "26.04.1", {
      name: "Ubuntu",
      channel: "lts",
      edition: "desktop",
      size_bytes: 6482409472,
    }),
    image("u26arm", "ubuntu", "26.04.1", {
      name: "Ubuntu",
      channel: "lts",
      edition: "desktop",
      arch: "aarch64",
    }),
    image("u26srv", "ubuntu", "26.04.1", { name: "Ubuntu", channel: "lts", edition: "server" }),
    image("k26", "ubuntu", "26.04.1", { name: "Kubuntu", channel: "lts" }),
    withdrawn(
      image("u20", "ubuntu", "20.04.6", {
        name: "Ubuntu",
        channel: "end_of_life",
        edition: "desktop",
        official_page: "https://ubuntu.example/old",
      }),
    ),
    image("tails", "tails", "7.16", { name: "Tails", edition: "USB image" }),
    image("f44", "fedora", "44", {
      name: "Fedora",
      edition: "workstation",
      usb_boot: false,
      note: "DVD or virtual machine only: this file has no USB disk boot.",
    }),
    image("haiku", "haiku", "R1 beta 6", { name: "Haiku" }),
  ],
};

export const serveCatalog = (catalog: unknown = CATALOG) =>
  vi.stubGlobal("fetch", async () => new Response(JSON.stringify(catalog)));

export const UBUNTU_FIREFOX =
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0";

export const browseAs = (userAgent: string, platform: string, language = "en-US") =>
  vi.stubGlobal("navigator", {
    userAgent,
    platform,
    language,
    languages: [language],
    clipboard: navigator.clipboard,
  });
