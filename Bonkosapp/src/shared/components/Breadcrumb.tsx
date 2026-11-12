import type { MouseEvent } from "react";
import { useText } from "../../i18n/I18nProvider";
import type { Params } from "../../router/address";
import { Link } from "../../router/Link";
import styles from "./Breadcrumb.module.css";

export type Crumb = {
  label: string;
  to?: string;
  params?: Params;
  onFollow?: (event: MouseEvent) => void;
};

/** Where the page sits; the last step is the page itself, not a link. */
export function Breadcrumb({ trail }: { trail: readonly Crumb[] }) {
  const text = useText();
  return (
    <nav className={styles.trail} aria-label={text.breadcrumb}>
      <ol>
        {trail.map((crumb, index) => (
          <li key={crumb.label}>
            {crumb.to && index < trail.length - 1 ? (
              <Link
                to={crumb.to}
                {...(crumb.params ? { params: crumb.params } : {})}
                onClick={crumb.onFollow}
              >
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
