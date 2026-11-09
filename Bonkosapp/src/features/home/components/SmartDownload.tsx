import { PATHS } from "../../../app/routes";
import { ARCH_LABELS, OS_GROUPS } from "../../../data/platforms";
import { useLanguage, useText } from "../../../i18n/I18nProvider";
import { Link } from "../../../router/Link";
import { buttonClass } from "../../../shared/components/button";
import { sizeLabel } from "../../../shared/lib/format";
import { isOtherDevice } from "../../../shared/lib/machine";
import { type DownloadChoice, useSmartDownload } from "../hooks/useSmartDownload";
import styles from "./SmartDownload.module.css";

const groupOf = (choice: DownloadChoice) =>
  OS_GROUPS.find((group) => group.os === choice.platform.os);

export function SmartDownload() {
  const text = useText();
  const language = useLanguage();
  const { machine, suggestion, choices, choose } = useSmartDownload();
  const group = suggestion && groupOf(suggestion);
  const detected = OS_GROUPS.find((candidate) => candidate.os === machine.os);
  const label = (choice: DownloadChoice) =>
    [
      choice.platform.name ?? (choice.platform.distros ? text.install.anyDistribution : undefined),
      choice.build.format,
      ARCH_LABELS[choice.build.arch],
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <div className={styles.smart}>
      <p className={styles.actions}>
        {suggestion && group ? (
          <a className={buttonClass("primary", true)} href={suggestion.build.url}>
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
      <p className={styles.detail}>
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
        <label className={styles.other}>
          <span>{text.home.otherSystem}</span>
          <select value={suggestion?.id ?? ""} onChange={(event) => choose(event.target.value)}>
            {suggestion ? null : <option value="" />}
            {OS_GROUPS.map((candidate) => (
              <optgroup key={candidate.os} label={candidate.name}>
                {choices
                  .filter((choice) => choice.platform.os === candidate.os)
                  .map((choice) => (
                    <option key={choice.id} value={choice.id}>
                      {label(choice)}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
      </p>
    </div>
  );
}
