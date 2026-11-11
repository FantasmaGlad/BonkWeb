import styles from "./Logo.module.css";

/** Official logos sit on a white tile so a dark one and a light one read alike. */
export function Logo({
  src,
  size = 40,
  eager = false,
}: {
  src: string;
  size?: 28 | 40 | 56;
  /** Shown at once (a panel that opens), not when scrolled into view. */
  eager?: boolean;
}) {
  return (
    <span className={styles.tile} data-size={size}>
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </span>
  );
}
