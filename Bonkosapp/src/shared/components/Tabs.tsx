import { type KeyboardEvent, type ReactNode, useId } from "react";
import { Logo } from "./Logo";
import styles from "./Tabs.module.css";

type Tab = { id: string; label: string; icon?: string };

/** Tabs of the WAI-ARIA pattern: arrows move between tabs, Tab goes into the panel. */
export function Tabs({
  label,
  tabs,
  selected,
  onSelect,
  children,
}: {
  label: string;
  tabs: readonly Tab[];
  selected: string;
  onSelect: (id: string) => void;
  children: ReactNode;
}) {
  const base = useId();
  const move = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    const index = tabs.findIndex((tab) => tab.id === selected);
    const next = step ? tabs[(index + step + tabs.length) % tabs.length] : undefined;
    if (next) {
      onSelect(next.id);
      document.getElementById(`${base}-${next.id}`)?.focus();
    }
  };
  return (
    <>
      <div className={styles.list} role="tablist" aria-label={label}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`${base}-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={tab.id === selected}
            aria-controls={`${base}-panel`}
            tabIndex={tab.id === selected ? 0 : -1}
            onClick={() => onSelect(tab.id)}
            onKeyDown={move}
          >
            {tab.icon ? <Logo src={tab.icon} size={28} /> : null}
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id={`${base}-panel`}
        className={styles.panel}
        role="tabpanel"
        aria-labelledby={`${base}-${selected}`}
      >
        {children}
      </div>
    </>
  );
}
