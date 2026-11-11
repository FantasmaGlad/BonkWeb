import { localLogo } from "../../../data/catalogService";
import { ARCH_LABELS } from "../../../data/platforms";
import { useLanguage } from "../../../i18n/I18nProvider";
import { Logo } from "../../../shared/components/Logo";
import { sizeLabel } from "../../../shared/lib/format";
import type { Arch } from "../../../types/machine";
import type { Platform } from "../../../types/release";
import styles from "./BuildLinks.module.css";

/** One row per package: its format, then a download per processor with its size, the visitor's own marked. */
export function BuildLinks({
  platform,
  name,
  arch,
}: {
  platform: Platform;
  name: string;
  arch: Arch | undefined;
}) {
  const language = useLanguage();
  const formats = [...new Set(platform.builds.map((build) => build.format))];
  return (
    <li className={styles.row}>
      <span className={styles.name}>
        {platform.logos.map((logo) => (
          <Logo key={logo} src={localLogo(logo)} size={28} />
        ))}
        <strong>{name}</strong>
      </span>
      <span className={styles.format}>{formats.join(", ")}</span>
      <span className={styles.builds}>
        {platform.builds.map((build) => (
          <span key={build.name}>
            <a href={build.url} aria-current={build.arch === arch ? "true" : undefined}>
              {ARCH_LABELS[build.arch]}
            </a>{" "}
            <small>{sizeLabel(build.size, language)}</small>
          </span>
        ))}
      </span>
    </li>
  );
}
