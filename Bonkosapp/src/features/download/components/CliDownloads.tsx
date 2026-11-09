import { OS_GROUPS } from "../../../data/platforms";
import { CLIS } from "../../../data/releases";
import type { Arch } from "../../../types/machine";
import styles from "./AppDownloads.module.css";
import { BuildLinks } from "./BuildLinks";

export function CliDownloads({ arch }: { arch: Arch | undefined }) {
  return (
    <ul className={styles.rows}>
      {CLIS.map((platform) => (
        <BuildLinks
          key={platform.id}
          platform={platform}
          name={OS_GROUPS.find((group) => group.os === platform.os)?.name ?? platform.id}
          arch={arch}
        />
      ))}
    </ul>
  );
}
