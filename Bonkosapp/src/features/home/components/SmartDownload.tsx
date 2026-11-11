import { PATHS } from "../../../app/routes";
import { localLogo } from "../../../data/catalogService";
import { ARCH_LABELS, OS_GROUPS } from "../../../data/platforms";
import { useLanguage, useText } from "../../../i18n/I18nProvider";
import { Link } from "../../../router/Link";
import { buttonClass } from "../../../shared/components/button";
import { Logo } from "../../../shared/components/Logo";
import { sizeLabel } from "../../../shared/lib/format";
import { isOtherDevice } from "../../../shared/lib/machine";
import { useSmartDownload } from "../hooks/useSmartDownload";
import styles from "./SmartDownload.module.css";
import { SystemMenu } from "./SystemMenu";

export function SmartDownload() {
  const text = useText();
  const language = useLanguage();
  const { machine, suggestion, choices, choose } = useSmartDownload();
  const group =
    suggestion && OS_GROUPS.find((candidate) => candidate.os === suggestion.platform.os);
  const detected = OS_GROUPS.find((candidate) => candidate.os === machine.os);

  return (
    <div className={styles.smart}>
      <p className={styles.actions}>
        {suggestion && group ? (
          <a className={buttonClass("primary", true)} href={suggestion.build.url}>
            <Logo src={localLogo(group.logo)} size={28} />
            {text.home.downloadFor(group.name)}
            <small>{suggestion.build.format}</small>
          </a>
        ) : (
          <Link className={buttonClass("primary", true)} to={`${PATHS.download}#apps`}>
            {text.home.download}
          </Link>
        )}
        <Link className={buttonClass("secondary", true)} to={PATHS.marketplace}>
          {text.home.explore}
        </Link>
      </p>
      <div className={styles.detail}>
        {suggestion && group ? (
          <span>
            {[
              ARCH_LABELS[suggestion.build.arch],
              sizeLabel(suggestion.build.size, language),
              group.status === "real" ? undefined : text.common.status[group.status],
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        ) : detected ? (
          <span>{`${text.home.detected} ${detected.name}`}</span>
        ) : (
          <span>
            {isOtherDevice(navigator.userAgent) ? text.home.otherDevice : text.home.unknown}
          </span>
        )}
        <SystemMenu choices={choices} selected={suggestion} onChoose={choose} />
      </div>
    </div>
  );
}
