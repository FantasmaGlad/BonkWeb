import { useLanguage } from "../../../i18n/I18nProvider";
import type { CommandRow } from "../../../types/command";
import styles from "./OptionRows.module.css";

export function OptionRows({ rows }: { rows: readonly CommandRow[] }) {
  const language = useLanguage();
  return (
    <dl className={styles.rows}>
      {rows.map((row) => (
        <div key={row.flag}>
          <dt>
            <code>{row.flag}</code>
          </dt>
          <dd>{row.text[language]}</dd>
        </div>
      ))}
    </dl>
  );
}
