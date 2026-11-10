import type { ReactNode } from "react";
import styles from "./FirstScreen.module.css";

/** Fills the screen under the header, so the next section starts below the fold; the arrow leads to it. */
export function FirstScreen({
  labelledBy,
  next,
  nextLabel,
  children,
}: {
  labelledBy: string;
  next: string;
  nextLabel: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.screen} aria-labelledby={labelledBy}>
      <div className={styles.body}>{children}</div>
      <a className={styles.scroll} href={`#${next}`}>
        <span className="visually-hidden">{nextLabel}</span>
      </a>
    </section>
  );
}
