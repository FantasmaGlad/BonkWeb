import styles from "./CommandBlock.module.css";
import { CopyButton } from "./CopyButton";

export function CommandBlock({ value }: { value: string }) {
  return (
    <div className={styles.command}>
      <pre>{value}</pre>
      <CopyButton value={value} />
    </div>
  );
}
