import type { SystemProfile } from "../types/system";

/** Memory figures are the publisher's own; a system without one stays without. */
export const SYSTEM_PROFILES: Readonly<Record<string, SystemProfile>> = {
  ubuntu: { tags: ["daily", "server"], ramMb: 6144, source: "https://ubuntu.com/download/desktop" },
  debian: {
    tags: ["daily", "server"],
    ramMb: 1024,
    source: "https://www.debian.org/releases/stable/amd64/ch03s04.en.html",
  },
  linuxmint: { tags: ["daily"], ramMb: 2048, source: "https://linuxmint.com/faq.php" },
  popos: {
    tags: ["daily"],
    ramMb: 4096,
    source: "https://system76.com/support/articles/install-pop/",
  },
  zorin: {
    tags: ["daily"],
    ramMb: 2048,
    source: "https://help.zorin.com/docs/getting-started/system-requirements/",
  },
  fedora: { tags: ["daily"] },
  manjaro: { tags: ["daily"] },
  endeavouros: { tags: ["daily"] },
  opensuse: { tags: ["daily"] },
  tails: {
    tags: ["security"],
    ramMb: 3072,
    driveGb: 8,
    source: "https://tails.net/doc/about/requirements/",
  },
  kali: {
    tags: ["security"],
    ramMb: 2048,
    source: "https://www.kali.org/docs/installation/hard-disk-install/",
  },
  parrot: { tags: ["security"] },
  almalinux: {
    tags: ["server"],
    ramMb: 1536,
    source: "https://wiki.almalinux.org/documentation/installation-guide.html",
  },
  rockylinux: { tags: ["server"] },
  alpine: { tags: ["server", "light"] },
  freebsd: { tags: ["server"] },
  openbsd: { tags: ["server"] },
  proxmox: {
    tags: ["server"],
    ramMb: 2048,
    source: "https://pve.proxmox.com/wiki/System_Requirements",
  },
  truenas: {
    tags: ["server"],
    ramMb: 8192,
    source: "https://www.truenas.com/docs/scale/gettingstarted/tnhardwareguide/",
  },
  void: {
    tags: ["light"],
    ramMb: 520,
    source: "https://docs.voidlinux.org/installation/index.html",
  },
  haiku: { tags: ["light"] },
  windows: {
    tags: [],
    ramMb: 4096,
    source: "https://www.microsoft.com/en-us/windows/windows-11-specifications",
  },
};

export const NO_PROFILE: SystemProfile = { tags: [] };
