export type Os = "linux" | "windows" | "macos" | "android";
export type Arch = "x86_64" | "aarch64" | "i686";
export type Distro = "debian" | "fedora" | "suse" | "arch" | "manjaro" | "other";

export type Machine = {
  os: Os | "other";
  /** Absent when the browser does not say; never guessed. */
  arch?: Arch | undefined;
  /** A browser rarely names the distribution: only some Linux builds of Firefox do. */
  distro?: Distro | undefined;
};
