import { ARCH_LABELS } from "../../../data/platforms";
import { useLanguage } from "../../../i18n/I18nProvider";
import { sizeLabel } from "../../../shared/lib/format";
import type { Arch } from "../../../types/machine";
import type { Platform } from "../../../types/release";
import styles from "./BuildLinks.module.css";

/** One row per package: its format, then a download per processor, the visitor's own marked. */
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
          <img key={logo} src={`/logos/${logo}.png`} alt="" width="24" height="24" />
        ))}
        <strong>{name}</strong>
      </span>
      <span className={styles.format}>{formats.join(", ")}</span>
      <span className={styles.builds}>
        {platform.builds.map((build) => (
          <a
            key={build.name}
            href={build.url}
            aria-current={build.arch === arch ? "true" : undefined}
            title={`${build.name} · ${sizeLabel(build.size, language)}`}
          >
            {ARCH_LABELS[build.arch]}
          </a>
        ))}
      </span>
    </li>
  );
}
