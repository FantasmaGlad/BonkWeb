import { expect, it } from "vitest";
import { PACKAGE_MANAGERS } from "../../data/packageManagers";
import { APP_PLATFORMS } from "../../data/platforms";
import { resolvePlatforms } from "../../data/releases";
import { UBUNTU_FIREFOX } from "../../test/fixtures";
import type { Release } from "../../types/release";
import { detect, suggestBuild, suggestManager } from "./machine";

const release = (version: string, without: string[] = []): Release => ({
  version,
  tag: `v${version}`,
  published: "2026-01-01",
  base: `https://example.test/v${version}`,
  assets: APP_PLATFORMS.flatMap((platform) => platform.builds)
    .map((build) => build.file.replaceAll("{version}", version))
    .filter((name) => !without.some((part) => name.includes(part)))
    .map((name) => ({ name, size: 1, sha256: "a".repeat(64) })),
});

const ALL = resolvePlatforms(APP_PLATFORMS, release("9.9.9"));
const ARM_ONLY_APK = resolvePlatforms(APP_PLATFORMS, release("9.9.9", ["android-x86_64"]));

it("lit le système et le processeur sans inventer la distribution", () => {
  const chrome = "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 Chrome/140 Safari/537.36";
  expect(detect(chrome, "Linux aarch64")).toEqual({
    os: "linux",
    arch: "aarch64",
    distro: undefined,
  });
  expect(detect(UBUNTU_FIREFOX, "Linux x86_64").distro).toBe("debian");
  const windows = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
  expect(detect(windows, "Win32").arch).toBe("x86_64");
  expect(detect(windows, "Win32", { architecture: "arm", bitness: "64" }).arch).toBe("aarch64");
  expect(
    detect("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel").arch,
  ).toBeUndefined();
  expect(detect("Mozilla/5.0 (Linux; Android 15; Pixel 9)", "Linux aarch64").os).toBe("android");
  expect(detect("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)", "iPhone").os).toBe("other");
  expect(detect("Mozilla/5.0 (X11; CrOS x86_64 16000.0.0)", "Linux x86_64").os).toBe("other");
});

it("choisit le paquet de la distribution et refuse de deviner le processeur", () => {
  const format = (machine: Parameters<typeof suggestBuild>[1]) =>
    suggestBuild(ALL, machine)?.build.format;
  expect(format({ os: "linux", arch: "x86_64", distro: "debian" })).toBe(".deb");
  expect(format({ os: "linux", arch: "x86_64" })).toBe(".deb");
  expect(format({ os: "linux", arch: "x86_64", distro: "manjaro" })).toBe(".pkg.tar.zst");
  expect(format({ os: "linux", arch: "i686", distro: "other" })).toBe(".tar.gz");
  expect(format({ os: "macos" })).toBe(".dmg");
  expect(format({ os: "windows" })).toBeUndefined();
  expect(format({ os: "other" })).toBeUndefined();
});

it("ne propose l'application Android qu'aux processeurs que la release couvre", () => {
  const apk = (platforms: typeof ALL, arch?: "x86_64" | "aarch64" | "i686") =>
    suggestBuild(platforms, { os: "android", arch })?.build.name;
  expect(apk(ARM_ONLY_APK, "aarch64")).toContain("android-arm64.apk");
  expect(apk(ARM_ONLY_APK, undefined)).toContain("android-arm64.apk");
  expect(apk(ARM_ONLY_APK, "x86_64")).toBeUndefined();
  expect(apk(ALL, "x86_64")).toContain("android-x86_64.apk");
  expect(apk(ALL, "i686")).toBeUndefined();
});

it("ouvre sur le gestionnaire de paquets de la machine", () => {
  const manager = (machine: Parameters<typeof suggestManager>[1]) =>
    suggestManager(PACKAGE_MANAGERS, machine)?.id;
  expect(manager({ os: "linux", distro: "suse" })).toBe("zypper");
  expect(manager({ os: "linux" })).toBe("apt");
  expect(manager({ os: "macos" })).toBe("brew");
  expect(manager({ os: "windows" })).toBe("scoop");
  expect(manager({ os: "android" })).toBeUndefined();
});
