export const VERSION = "0.0.2";

const BASE = `https://github.com/FantasmaGlad/Bonk/releases/download/v${VERSION}`;

export type Download = { arch: string; format: string; file: string };
export type Family = {
  id: string;
  name: string;
  logos: readonly string[];
  /** Le système écrit-il déjà sur un disque ? Sinon, aperçu. */
  writes: boolean;
  files: readonly Download[];
};

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
    files: [tar("x86_64", "linux-x86_64"), tar("ARM64", "linux-aarch64")],
  },
  {
    id: "linux",
    name: "Linux",
    logos: ["linux"],
    writes: true,
    files: [
      tar("x86_64", "linux-x86_64"),
      tar("ARM64", "linux-aarch64"),
      tar("x86", "linux-i686"),
      tar("x86_64 CLI", "linux-x86_64-musl"),
      tar("ARM64 CLI", "linux-aarch64-musl"),
    ],
  },
  {
    id: "windows",
    name: "Windows 10+",
    logos: ["windows"],
    writes: false,
    files: [
      { arch: "x86_64", format: ".exe", file: `bonk-${VERSION}-windows-x86_64.exe` },
      { arch: "ARM64", format: ".exe", file: `bonk-${VERSION}-windows-aarch64.exe` },
      { arch: "x86", format: ".exe", file: `bonk-${VERSION}-windows-i686.exe` },
    ],
  },
  {
    id: "macos",
    name: "macOS 12+",
    logos: ["apple"],
    writes: false,
    files: [tar("Universal", "macos-universal")],
  },
];

export const downloadUrl = (file: string): string => `${BASE}/${file}`;
