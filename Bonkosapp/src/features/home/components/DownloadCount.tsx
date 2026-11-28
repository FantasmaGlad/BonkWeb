import { RELEASES } from "../../../data/links";
import { RELEASE } from "../../../data/releases";
import { useLanguage, useText } from "../../../i18n/I18nProvider";
import { wholeNumber } from "../../../shared/lib/format";
import styles from "./DownloadCount.module.css";

export function DownloadCount() {
  const text = useText().home;
  const language = useLanguage();
  return (
    <a className={styles.badge} href={RELEASES} title={text.downloadsTitle}>
      <span className={styles.label}>{text.downloads}</span>{" "}
      <span className={styles.value}>{wholeNumber(RELEASE.downloads, language)}</span>
    </a>
  );
}
