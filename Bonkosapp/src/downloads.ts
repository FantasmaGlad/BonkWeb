export const VERSION = "0.0.4";

const BASE = `https://github.com/FantasmaGlad/Bonk/releases/download/v${VERSION}`;

export type Download = { arch: string; format: string; file: string };
export type Family = {
  id: string;
  name: string;
  logos: readonly string[];
  /** Écriture déjà essayée sur une vraie clé ? Sinon, le site le signale. */
  writes: boolean;
  files: readonly Download[];
};

const cli = (arch: string, target: string, format: ".tar.gz" | ".zip"): Download => ({
  arch,
  format,
  file: `bonk-cli-${VERSION}-${target}${format}`,
});

const tar = (arch: string, target: string): Download => ({
  arch,
  format: ".tar.gz",
  file: `bonk-${VERSION}-${target}.tar.gz`,
});

export const FAMILIES: readonly Family[] = [
  {
    id: "debian",
    name: "Debian, Ubuntu, Mint",
    logos: ["debian", "ubuntu", "linuxmint"],
    writes: true,
    files: [
      { arch: "x86_64", format: ".deb", file: `bonk_${VERSION}-1_amd64.deb` },
      { arch: "ARM64", format: ".deb", file: `bonk_${VERSION}-1_arm64.deb` },
    ],
  },
  {
    id: "redhat",
    name: "Fedora, RHEL, openSUSE",
    logos: ["fedora", "rhel", "opensuse"],
    writes: true,
    files: [
      { arch: "x86_64", format: ".rpm", file: `bonk-${VERSION}-1.x86_64.rpm` },
      { arch: "ARM64", format: ".rpm", file: `bonk-${VERSION}-1.aarch64.rpm` },
    ],
  },
  {
    id: "arch",
    name: "Arch, Manjaro",
    logos: ["arch", "manjaro"],
    writes: true,
    files: [
      { arch: "x86_64", format: ".pkg.tar.zst", file: `bonk-${VERSION}-1-x86_64.pkg.tar.zst` },
      tar("ARM64", "linux-aarch64"),
    ],
  },
  {
    id: "linux",
    name: "Linux",
    logos: ["linux"],
    writes: true,
    files: [tar("x86_64", "linux-x86_64"), tar("ARM64", "linux-aarch64"), tar("x86", "linux-i686")],
  },
  {
    id: "windows",
    name: "Windows 10+",
    logos: ["windows"],
    writes: false,
    files: [
      { arch: "x86_64", format: ".exe", file: `bonk-${VERSION}-windows-x86_64-setup.exe` },
      { arch: "ARM64", format: ".exe", file: `bonk-${VERSION}-windows-aarch64-setup.exe` },
      { arch: "x86", format: ".exe", file: `bonk-${VERSION}-windows-i686-setup.exe` },
    ],
  },
  {
    id: "macos",
    name: "macOS 12+",
    logos: ["apple"],
    writes: false,
    files: [{ arch: "Universal", format: ".dmg", file: `bonk-${VERSION}-macos-universal.dmg` }],
  },
];

/** Version sans fenêtre. */
export const CLI_FAMILIES: readonly Family[] = [
  {
    id: "cli-linux",
    name: "Linux CLI",
    logos: ["linux"],
    writes: true,
    files: [cli("x86_64", "linux-x86_64", ".tar.gz"), cli("ARM64", "linux-aarch64", ".tar.gz")],
  },
  {
    id: "cli-windows",
    name: "Windows 10+ CLI",
    logos: ["windows"],
    writes: false,
    files: [
      cli("x86_64", "windows-x86_64", ".zip"),
      cli("ARM64", "windows-aarch64", ".zip"),
      cli("x86", "windows-i686", ".zip"),
    ],
  },
  {
    id: "cli-macos",
    name: "macOS 12+ CLI",
    logos: ["apple"],
    writes: false,
    files: [cli("x86_64", "macos-x86_64", ".tar.gz"), cli("ARM64", "macos-aarch64", ".tar.gz")],
  },
];

export const downloadUrl = (file: string): string => `${BASE}/${file}`;
