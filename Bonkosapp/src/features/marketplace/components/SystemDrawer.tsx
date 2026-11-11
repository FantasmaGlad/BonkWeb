import { useRef } from "react";
import { logoOf } from "../../../data/catalogService";
import { useLanguage, useText } from "../../../i18n/I18nProvider";
import { Logo } from "../../../shared/components/Logo";
import { useModal } from "../../../shared/hooks/useModal";
import { ramLabel } from "../../../shared/lib/format";
import type { SystemSummary } from "../../../types/system";
import { useImageSelection } from "../hooks/useImageSelection";
import { ImageActions } from "./ImageActions";
import { ImageSelector } from "./ImageSelector";
import styles from "./SystemDrawer.module.css";

export function SystemDrawer({
  system,
  imageId,
  preferredArch,
  onSelect,
  onClose,
}: {
  system: SystemSummary;
  imageId: string;
  preferredArch: string | undefined;
  onSelect: (image: string) => void;
  onClose: () => void;
}) {
  const text = useText().market;
  const language = useLanguage();
  const panel = useRef<HTMLDivElement>(null);
  const selection = useImageSelection(system.images, imageId, preferredArch, onSelect);
  const { family, memory } = system;

  useModal(panel, onClose);

  return (
    <div className={styles.layer}>
      <button type="button" className={styles.backdrop} tabIndex={-1} onClick={onClose}>
        <span className="visually-hidden">{text.close}</span>
      </button>
      <div
        ref={panel}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <header className={styles.head}>
          <Logo src={logoOf(family)} size={56} eager />
          <div>
            <h2 id="drawer-title">{family.name}</h2>
            <a href={system.latest.homepage}>{text.site}</a>
          </div>
          <button type="button" className={styles.close} onClick={onClose}>
            {text.close}
          </button>
        </header>
        {text.systems[family.id] ? <p>{text.systems[family.id]}</p> : null}
        {memory ? (
          <p className={styles.spec}>
            {text.ramSource} <a href={memory.source}>{ramLabel(memory.value, language)}</a>
          </p>
        ) : null}
        {selection ? (
          <>
            <ImageSelector selection={selection} familyName={family.name} />
            <ImageActions image={selection.selected} />
          </>
        ) : null}
      </div>
    </div>
  );
}
