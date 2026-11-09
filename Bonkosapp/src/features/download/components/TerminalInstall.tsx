import { PACKAGE_MANAGERS, SCRIPTS } from "../../../data/packageManagers";
import { useText } from "../../../i18n/I18nProvider";
import { CommandBlock } from "../../../shared/components/CommandBlock";
import { Tabs } from "../../../shared/components/Tabs";
import type { Machine } from "../../../types/machine";
import { SCRIPT, useInstallMethod } from "../hooks/useInstallMethod";
import styles from "./TerminalInstall.module.css";

function Step({ title, value }: { title: string; value: string }) {
  return (
    <>
      <h3 className={styles.step}>{title}</h3>
      <CommandBlock value={value} />
    </>
  );
}

export function TerminalInstall({ machine }: { machine: Machine }) {
  const text = useText();
  const install = text.install;
  const { selected, manager, select } = useInstallMethod(machine);
  const tabs = [
    { id: SCRIPT, label: install.script },
    ...PACKAGE_MANAGERS.map(({ id, name }) => ({ id, label: name })),
  ];
  return (
    <Tabs label={install.methods} tabs={tabs} selected={selected} onSelect={select}>
      {manager ? (
        <>
          <p className={styles.scope}>
            {[
              manager.scope,
              manager.status === "real" ? undefined : text.common.status[manager.status],
            ]
              .filter(Boolean)
              .join(". ")}
          </p>
          <Step title={install.steps.install} value={manager.install} />
          <Step title={install.steps.cli} value={manager.cli} />
          <Step title={install.steps.update} value={manager.update} />
          <Step title={install.steps.remove} value={manager.remove} />
        </>
      ) : (
        <>
          <p className={styles.scope}>{install.scriptText}</p>
          <Step title={install.unix} value={SCRIPTS.unix.install} />
          <Step title={install.windows} value={SCRIPTS.windows.install} />
          <Step
            title={install.steps.remove}
            value={`${SCRIPTS.unix.remove}\n${SCRIPTS.windows.remove}`}
          />
        </>
      )}
    </Tabs>
  );
}
