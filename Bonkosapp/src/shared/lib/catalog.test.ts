import { expect, it } from "vitest";
import type { CatalogImage } from "../../types/catalog";
import { writable } from "./catalog";

const image = (extra: Partial<CatalogImage>): CatalogImage => ({
  id: "a",
  family: "f",
  name: "F",
  version: "1",
  channel: "stable",
  released: "2026-01-01",
  arch: "x86_64",
  homepage: "https://h/",
  url: "https://h/a.iso",
  ...extra,
});

it("n'écrit sur une clé qu'une image avec un lien, qui démarre d'une clé et n'est pas réservée au disque optique", () => {
  expect(writable(image({}))).toBe(true);
  const { url, ...noLink } = image({});
  expect(url).toBeDefined();
  expect(writable(noLink)).toBe(false);
  expect(writable(image({ usb_boot: false }))).toBe(false);
  expect(writable(image({ media: "optical" }))).toBe(false);
});
