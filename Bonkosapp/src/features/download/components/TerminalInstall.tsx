import { PACKAGE_MANAGERS } from "../../../data/packageManagers";
import { useText } from "../../../i18n/I18nProvider";
import { CommandBlock } from "../../../shared/components/CommandBlock";
import { Tabs } from "../../../shared/components/Tabs";
import type { Machine } from "../../../types/machine";
import { useInstallMethod } from "../hooks/useInstallMethod";
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
  const { manager, select } = useInstallMethod(machine);
  if (!manager) {
    return null;
  }
  return (
    <Tabs
      label={text.install.sections.terminal}
      tabs={PACKAGE_MANAGERS.map(({ id, name }) => ({ id, label: name }))}
      selected={manager.id}
      onSelect={select}
    >
      <p className={styles.scope}>
        {[manager.scope, manager.status === "real" ? undefined : text.common.status[manager.status]]
          .filter(Boolean)
          .join(". ")}
      </p>
      <Step title={text.install.steps.install} value={manager.install} />
      <Step title={text.install.steps.update} value={manager.update} />
      <Step title={text.install.steps.remove} value={manager.remove} />
    </Tabs>
  );
}
