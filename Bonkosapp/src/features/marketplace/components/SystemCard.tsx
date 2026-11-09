import { PATHS } from "../../../app/routes";
import { logoOf } from "../../../data/catalogService";
import { useLanguage, useText } from "../../../i18n/I18nProvider";
import type { Params } from "../../../router/address";
import { Link } from "../../../router/Link";
import { Logo } from "../../../shared/components/Logo";
import { ramLabel } from "../../../shared/lib/format";
import type { SystemSummary } from "../../../types/system";
import styles from "./SystemCard.module.css";

export function SystemCard({
  system,
  params,
  onOpen,
}: {
  system: SystemSummary;
  params: Params;
  onOpen: () => void;
}) {
  const text = useText().market;
  const language = useLanguage();
  const { family, latest, architectures, profile, driveGb } = system;
  const specs = [
    ...architectures,
    profile.ramMb ? text.specRam(ramLabel(profile.ramMb, language)) : undefined,
    driveGb ? text.specDrive(driveGb) : undefined,
  ].filter(Boolean);
  return (
    <li>
      <Link
        className={styles.card}
        to={PATHS.marketplace}
        params={{ ...params, system: family.id }}
        onClick={(event) => {
          event.preventDefault();
          onOpen();
        }}
      >
        <Logo src={logoOf(family)} size={56} />
        <span className={styles.text}>
          <span className={styles.title}>
            <strong>{family.name}</strong>
            <span className="muted">
              {[latest.version, latest.channel === "lts" ? text.lts : undefined]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </span>
          {text.systems[family.id] ? (
            <span className={styles.description}>{text.systems[family.id]}</span>
          ) : null}
          <span className={styles.specs}>{specs.join(" · ")}</span>
        </span>
      </Link>
    </li>
  );
}
