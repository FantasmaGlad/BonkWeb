import { cx } from "../lib/classes";
import styles from "./button.module.css";

export const buttonClass = (variant: "primary" | "secondary", large = false): string =>
  cx(styles.button, styles[variant], large && styles.large);
