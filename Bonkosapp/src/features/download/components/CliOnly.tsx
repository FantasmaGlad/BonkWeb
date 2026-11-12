import { PACKAGE_MANAGERS, SCRIPTS } from "../../../data/packageManagers";
import { OS_GROUPS } from "../../../data/platforms";
import { CLIS } from "../../../data/releases";
import { useText } from "../../../i18n/I18nProvider";
import { CommandBlock } from "../../../shared/components/CommandBlock";
import type { Arch } from "../../../types/machine";
import rows from "./AppDownloads.module.css";
import { BuildLinks } from "./BuildLinks";
import styles from "./CliOnly.module.css";

/** Three ways to the windowless build: the script, the bonk-cli package, the archives. */
const TERMUX = CLIS.some((platform) => platform.id === "cli-termux");

export function CliOnly({ arch }: { arch: Arch | undefined }) {
  const text = useText().install;
  return (
    <>
      <h3 className={styles.title}>{text.cliScript}</h3>
      <p className={styles.note}>{text.cliScriptText}</p>
      <dl className={styles.commands}>
        {(["unix", "windows"] as const).map((system) => (
          <div key={system}>
            <dt>{text[system]}</dt>
            <dd>
              <CommandBlock value={SCRIPTS[system].install} />
            </dd>
          </div>
        ))}
        {TERMUX ? (
          <div>
            <dt>{text.termux}</dt>
            <dd>
              <p className={styles.note}>{text.termuxText}</p>
              <CommandBlock value={SCRIPTS.termux.install} />
            </dd>
          </div>
        ) : null}
      </dl>
      <h3 className={styles.title}>{text.cliPackages}</h3>
      <p className={styles.note}>{text.cliSwitch}</p>
      <dl className={styles.commands}>
        {PACKAGE_MANAGERS.map((manager) => (
          <div key={manager.id}>
            <dt>{manager.name}</dt>
            <dd>
              <CommandBlock value={manager.cli} />
            </dd>
          </div>
        ))}
      </dl>
      <h3 className={styles.title}>{text.cliArchives}</h3>
      <ul className={rows.rows}>
        {CLIS.map((platform) => (
          <BuildLinks
            key={platform.id}
            platform={platform}
            name={
              platform.name ??
              OS_GROUPS.find((group) => group.os === platform.os)?.name ??
              platform.id
            }
            arch={arch}
          />
        ))}
      </ul>
    </>
  );
}
