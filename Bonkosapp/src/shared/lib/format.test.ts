import { expect, it } from "vitest";
import { driveFor, exactBytes, ramLabel, sizeLabel } from "./format";

it("écrit les tailles à la française et ne montre jamais 0.0 pour une petite image", () => {
  expect(sizeLabel(5_100_000_000, "en")).toBe("5.1 GB");
  expect(sizeLabel(5_100_000_000, "fr")).toBe("5,1 Go");
  expect(sizeLabel(17_350_656, "en")).toBe("17 MB");
  expect(sizeLabel(17_350_656, "fr")).toBe("17 Mo");
  expect(exactBytes(6482409472, "en")).toBe("6,482,409,472");
});

it("écrit la mémoire dans l'unité de l'éditeur", () => {
  expect(ramLabel(520, "en")).toBe("520 MB");
  expect(ramLabel(1536, "fr")).toBe("1,5 Go");
  expect(ramLabel(6144, "en")).toBe("6 GB");
});

it("donne la plus petite clé qui contient l'image", () => {
  expect(driveFor(17_350_656)).toBe(1);
  expect(driveFor(6_482_409_472)).toBe(8);
  expect(driveFor(8_000_000_001)).toBe(16);
  expect(driveFor(2e11)).toBeUndefined();
});
