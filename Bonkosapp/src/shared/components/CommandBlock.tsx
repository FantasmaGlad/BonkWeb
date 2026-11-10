import styles from "./CommandBlock.module.css";
import { CopyButton } from "./CopyButton";

type Row = { start: number; line: string };

/** Each line keyed by where it starts in the command. */
const rowsOf = (value: string): Row[] => {
  const rows: Row[] = [];
  let start = 0;
  for (const line of value.split("\n")) {
    rows.push({ start, line });
    start += line.length + 1;
  }
  return rows;
};

/** Long lines wrap with a hanging indent, so a command is read whole without scrolling sideways. */
export function CommandBlock({ value }: { value: string }) {
  return (
    <div className={styles.command}>
      <pre>
        {rowsOf(value).map(({ start, line }) => (
          <span key={start} className={styles.line}>
            {line}
          </span>
        ))}
      </pre>
      <CopyButton value={value} />
    </div>
  );
}
