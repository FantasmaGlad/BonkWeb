import styles from "./Logo.module.css";

/** Official logos sit on a white tile so a dark one and a light one read alike. */
export function Logo({ src, size = 40 }: { src: string; size?: 28 | 40 | 56 }) {
  return (
    <span className={styles.tile} data-size={size}>
      <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" />
    </span>
  );
}
