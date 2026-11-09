import { OS_GROUPS } from "../../../data/platforms";
import { APPS } from "../../../data/releases";
import { useText } from "../../../i18n/I18nProvider";
import type { Arch } from "../../../types/machine";
import styles from "./AppDownloads.module.css";
import { BuildLinks } from "./BuildLinks";

export function AppDownloads({ arch }: { arch: Arch | undefined }) {
  const text = useText();
  return (
    <>
      {OS_GROUPS.map((group) => {
        const platforms = APPS.filter((platform) => platform.os === group.os);
        return platforms.length ? (
          <section key={group.os} className={styles.group} aria-labelledby={`os-${group.os}`}>
            <h3 id={`os-${group.os}`}>{group.name}</h3>
            <p className={styles.status}>
              {[
                text.common.status[group.status],
                group.status === "beta" ? text.install.androidBeta : undefined,
              ]
                .filter(Boolean)
                .join(" ")}
            </p>
            <ul className={styles.rows}>
              {platforms.map((platform) => (
                <BuildLinks
                  key={platform.id}
                  platform={platform}
                  name={
                    platform.name ?? (platform.distros ? text.install.anyDistribution : group.name)
                  }
                  arch={arch}
                />
              ))}
            </ul>
          </section>
        ) : null;
      })}
    </>
  );
}
