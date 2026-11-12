import { type RefObject, useEffect, useId, useRef, useState } from "react";
import { localLogo } from "../../../data/catalogService";
import { ARCH_LABELS, OS_GROUPS } from "../../../data/platforms";
import { useText } from "../../../i18n/I18nProvider";
import { Logo } from "../../../shared/components/Logo";
import { Tabs } from "../../../shared/components/Tabs";
import type { Os } from "../../../types/machine";
import type { DownloadChoice } from "../hooks/useSmartDownload";
import styles from "./SystemMenu.module.css";

/** Every installer, one operating system at a time, each row with the logos of what it serves. */
export function SystemMenu({
  choices,
  selected,
  onChoose,
}: {
  choices: readonly DownloadChoice[];
  selected: DownloadChoice | undefined;
  onChoose: (id: string) => void;
}) {
  const text = useText();
  const panel = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [os, setOs] = useState<Os | null>(null);
  const shown = os ?? selected?.platform.os ?? "linux";

  useDismiss(open, root, setOpen);

  return (
    <div ref={root} className={styles.menu}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panel}
        onClick={() => setOpen(!open)}
      >
        {text.home.otherSystem}
      </button>
      {open ? (
        <div id={panel} className={styles.panel}>
          <Tabs
            label={text.home.chooseSystem}
            tabs={OS_GROUPS.map((group) => ({
              id: group.os,
              label: group.name,
              icon: localLogo(group.logo),
            }))}
            selected={shown}
            onSelect={(id) => setOs(id as Os)}
          >
            <ul className={styles.list}>
              {choices
                .filter((choice) => choice.platform.os === shown)
                .map((choice) => (
                  <ChoiceRow
                    key={choice.id}
                    choice={choice}
                    os={shown}
                    pressed={choice.id === selected?.id}
                    onChoose={() => {
                      onChoose(choice.id);
                      setOpen(false);
                    }}
                  />
                ))}
            </ul>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}

/** Closes on a pointer press outside `root` or on Escape. */
function useDismiss(
  open: boolean,
  root: RefObject<HTMLDivElement | null>,
  setOpen: (open: boolean) => void,
) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    addEventListener("pointerdown", outside);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("pointerdown", outside);
      removeEventListener("keydown", onKey);
    };
  }, [open, root, setOpen]);
}

function ChoiceRow({
  choice,
  os,
  pressed,
  onChoose,
}: {
  choice: DownloadChoice;
  os: Os;
  pressed: boolean;
  onChoose: () => void;
}) {
  const text = useText();
  return (
    <li>
      <button type="button" aria-pressed={pressed} onClick={onChoose}>
        <span className={styles.logos}>
          {choice.platform.logos.map((logo) => (
            <Logo key={logo} src={localLogo(logo)} size={28} />
          ))}
        </span>
        <span className={styles.name}>
          {choice.platform.name ??
            (choice.platform.distros
              ? text.install.anyDistribution
              : OS_GROUPS.find((group) => group.os === os)?.name)}
        </span>
        <span className={styles.format}>{choice.build.format}</span>
        <span className={styles.arch}>{ARCH_LABELS[choice.build.arch]}</span>
      </button>
    </li>
  );
}
