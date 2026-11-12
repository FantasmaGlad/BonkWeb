import type { BuildArch, OsGroup, PlatformDefinition } from "../types/release";

export const OS_GROUPS: readonly OsGroup[] = [
  { os: "linux", name: "Linux", logo: "linux", status: "real" },
  { os: "windows", name: "Windows 10+", logo: "windows", status: "ci" },
  { os: "macos", name: "macOS 12+", logo: "apple", status: "ci" },
  { os: "android", name: "Android 8+", logo: "android", status: "beta" },
];

export const ARCH_LABELS: Record<BuildArch, string> = {
  x86_64: "x86_64",
  aarch64: "ARM64",
  i686: "x86",
  universal: "Universal",
};

/** `{version}` is replaced by the latest release; a file the release lacks is not offered. */
export const APP_PLATFORMS: readonly PlatformDefinition[] = [
  {
    id: "linux-deb",
    os: "linux",
    name: "Debian, Ubuntu, Mint",
    logos: ["debian", "ubuntu", "linuxmint"],
    distros: ["debian"],
    builds: [
      { arch: "x86_64", format: ".deb", file: "bonk_{version}-1_amd64.deb" },
      { arch: "aarch64", format: ".deb", file: "bonk_{version}-1_arm64.deb" },
    ],
  },
  {
    id: "linux-rpm",
    os: "linux",
    name: "Fedora, RHEL, openSUSE",
    logos: ["fedora", "rhel", "opensuse"],
    distros: ["fedora", "suse"],
    builds: [
      { arch: "x86_64", format: ".rpm", file: "bonk-{version}-1.x86_64.rpm" },
      { arch: "aarch64", format: ".rpm", file: "bonk-{version}-1.aarch64.rpm" },
    ],
  },
  {
    id: "linux-pacman",
    os: "linux",
    name: "Arch, Manjaro",
    logos: ["arch", "manjaro"],
    distros: ["arch", "manjaro"],
    builds: [
      { arch: "x86_64", format: ".pkg.tar.zst", file: "bonk-{version}-1-x86_64.pkg.tar.zst" },
      { arch: "aarch64", format: ".tar.gz", file: "bonk-{version}-linux-aarch64.tar.gz" },
    ],
  },
  {
    id: "linux-tar",
    os: "linux",
    logos: ["linux"],
    distros: ["other"],
    builds: [
      { arch: "x86_64", format: ".tar.gz", file: "bonk-{version}-linux-x86_64.tar.gz" },
      { arch: "aarch64", format: ".tar.gz", file: "bonk-{version}-linux-aarch64.tar.gz" },
      { arch: "i686", format: ".tar.gz", file: "bonk-{version}-linux-i686.tar.gz" },
    ],
  },
  {
    id: "windows",
    os: "windows",
    logos: ["windows"],
    builds: [
      { arch: "x86_64", format: ".exe", file: "bonk-{version}-windows-x86_64-setup.exe" },
      { arch: "aarch64", format: ".exe", file: "bonk-{version}-windows-aarch64-setup.exe" },
      { arch: "i686", format: ".exe", file: "bonk-{version}-windows-i686-setup.exe" },
    ],
  },
  {
    id: "macos",
    os: "macos",
    logos: ["apple"],
    builds: [{ arch: "universal", format: ".dmg", file: "bonk-{version}-macos-universal.dmg" }],
  },
  {
    id: "android",
    os: "android",
    logos: ["android"],
    builds: [
      { arch: "aarch64", format: ".apk", file: "bonk-{version}-android-arm64.apk" },
      { arch: "x86_64", format: ".apk", file: "bonk-{version}-android-x86_64.apk" },
    ],
  },
];

export const CLI_PLATFORMS: readonly PlatformDefinition[] = [
  {
    id: "cli-linux",
    os: "linux",
    logos: ["linux"],
    builds: [
      { arch: "x86_64", format: ".tar.gz", file: "bonk-cli-{version}-linux-x86_64.tar.gz" },
      { arch: "aarch64", format: ".tar.gz", file: "bonk-cli-{version}-linux-aarch64.tar.gz" },
      { arch: "i686", format: ".tar.gz", file: "bonk-cli-{version}-linux-i686.tar.gz" },
    ],
  },
  {
    id: "cli-windows",
    os: "windows",
    logos: ["windows"],
    builds: [
      { arch: "x86_64", format: ".zip", file: "bonk-cli-{version}-windows-x86_64.zip" },
      { arch: "aarch64", format: ".zip", file: "bonk-cli-{version}-windows-aarch64.zip" },
      { arch: "i686", format: ".zip", file: "bonk-cli-{version}-windows-i686.zip" },
    ],
  },
  {
    id: "cli-macos",
    os: "macos",
    logos: ["apple"],
    builds: [
      { arch: "universal", format: ".tar.gz", file: "bonk-cli-{version}-macos-universal.tar.gz" },
      { arch: "x86_64", format: ".tar.gz", file: "bonk-cli-{version}-macos-x86_64.tar.gz" },
      { arch: "aarch64", format: ".tar.gz", file: "bonk-cli-{version}-macos-aarch64.tar.gz" },
    ],
  },
  {
    id: "cli-termux",
    os: "android",
    name: "Termux",
    from: "0.0.6",
    logos: ["android"],
    builds: [
      { arch: "aarch64", format: ".tar.gz", file: "bonk-cli-{version}-android-aarch64.tar.gz" },
      { arch: "x86_64", format: ".tar.gz", file: "bonk-cli-{version}-android-x86_64.tar.gz" },
    ],
  },
];

/** First Bonk version that registers the bonk:// scheme; null while no release does. */
export const DEEP_LINK: { since: string | null; template: string } = {
  since: null,
  template: "bonk://install/{image}",
};
