import type { Platform, PlatformDefinition, Release } from "../types/release";
import { APP_PLATFORMS, CLI_PLATFORMS } from "./platforms";
import snapshot from "./releases.json";

export const RELEASE: Release = snapshot;

export const resolvePlatforms = (
  definitions: readonly PlatformDefinition[],
  release: Release,
): Platform[] =>
  definitions
    .map((definition) => ({
      ...definition,
      builds: definition.builds.flatMap(({ arch, format, file }) => {
        const name = file.replaceAll("{version}", release.version);
        const asset = release.assets.find((candidate) => candidate.name === name);
        return asset
          ? [
              {
                arch,
                format,
                name,
                url: `${release.base}/${name}`,
                size: asset.size,
                sha256: asset.sha256,
              },
            ]
          : [];
      }),
    }))
    .filter((platform) => platform.builds.length > 0);

export const APPS = resolvePlatforms(APP_PLATFORMS, RELEASE);
export const CLIS = resolvePlatforms(CLI_PLATFORMS, RELEASE);
