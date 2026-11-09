import {
  COMMANDS,
  commandNamed,
  ESSENTIAL_FLOW,
  isCommonFlag,
  REFERENCE_COMMANDS,
} from "../../../data/commands";
import { REFERENCE } from "../../../data/links";
import { useLanguage, useText } from "../../../i18n/I18nProvider";
import { CommandBlock } from "../../../shared/components/CommandBlock";
import type { CommandEntry } from "../../../types/command";
import styles from "./CommandReference.module.css";
import { OptionRows } from "./OptionRows";

function Entry({ entry }: { entry: CommandEntry }) {
  const text = useText().install;
  const language = useLanguage();
  const common = entry.options.filter((row) => isCommonFlag(row.flag));
  const advanced = entry.options.filter((row) => !isCommonFlag(row.flag));
  return (
    <details className={styles.entry}>
      <summary>
        <code>{[entry.command, ...entry.args.map((row) => row.flag)].join(" ")}</code>
        <span>{entry.text[language]}</span>
      </summary>
      <div className={styles.body}>
        {entry.args.length ? (
          <>
            <h4>{text.arguments}</h4>
            <OptionRows rows={entry.args} />
          </>
        ) : null}
        {common.length ? (
          <>
            <h4>{text.options}</h4>
            <OptionRows rows={common} />
          </>
        ) : null}
        {advanced.length ? (
          <details className={styles.advanced}>
            <summary>{text.advanced}</summary>
            <OptionRows rows={advanced} />
          </details>
        ) : null}
      </div>
    </details>
  );
}

export function CommandReference() {
  const text = useText().install;
  const language = useLanguage();
  const entries = REFERENCE_COMMANDS.flatMap((name) => commandNamed(name) ?? []);
  return (
    <>
      <h3>{text.flowTitle}</h3>
      <ol className={styles.flow}>
        {ESSENTIAL_FLOW.map(({ command, line }) => (
          <li key={line}>
            <p>{commandNamed(command)?.text[language]}</p>
            <CommandBlock value={line} />
          </li>
        ))}
      </ol>
      <h3 className={styles.title}>{text.referenceTitle}</h3>
      <div className={styles.list}>
        {entries.map((entry) => (
          <Entry key={entry.command} entry={entry} />
        ))}
        <details className={styles.entry}>
          <summary>
            <span>{text.global}</span>
          </summary>
          <div className={styles.body}>
            <OptionRows rows={COMMANDS.global} />
          </div>
        </details>
      </div>
      <p className={styles.more}>
        <a href={REFERENCE}>{text.full}</a>
      </p>
    </>
  );
}
