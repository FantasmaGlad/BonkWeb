import { useText } from "../../i18n/I18nProvider";
import { useClipboard } from "../hooks/useClipboard";
import styles from "./CopyButton.module.css";

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const text = useText();
  const { copied, copy } = useClipboard();
  return (
    <button type="button" className={styles.copy} onClick={() => copy(value)}>
      <span aria-live="polite">{copied ? text.common.copied : (label ?? text.common.copy)}</span>
    </button>
  );
}
