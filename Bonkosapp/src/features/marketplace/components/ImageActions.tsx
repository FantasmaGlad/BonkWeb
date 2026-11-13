import { PATHS } from "../../../app/routes";
import { DISK_PLACEHOLDER, ESSENTIAL_FLOW } from "../../../data/commands";
import { useLanguage, useText } from "../../../i18n/I18nProvider";
import { Link } from "../../../router/Link";
import { buttonClass } from "../../../shared/components/button";
import { CommandBlock } from "../../../shared/components/CommandBlock";
import { CopyButton } from "../../../shared/components/CopyButton";
import { writable } from "../../../shared/lib/catalog";
import { exactBytes, sizeLabel } from "../../../shared/lib/format";
import type { CatalogImage } from "../../../types/catalog";
import { useBonkLink } from "../hooks/useBonkLink";
import { useCommandBuilder } from "../hooks/useCommandBuilder";
import styles from "./ImageActions.module.css";

const LIST_COMMAND = ESSENTIAL_FLOW[0]?.line ?? "";

export function ImageActions({ image }: { image: CatalogImage }) {
  const text = useText().market;
  const language = useLanguage();
  const link = useBonkLink(image);
  const command = useCommandBuilder(image);
  const size = image.size_bytes ? sizeLabel(image.size_bytes, language) : undefined;
  return (
    <>
      <p className={styles.actions}>
        {link ? (
          <a className={buttonClass("primary")} href={link}>
            {text.openInBonk}
          </a>
        ) : null}
        {image.url ? (
          <a className={buttonClass(link ? "secondary" : "primary")} href={image.url}>
            {text.downloadImage}
            {size ? <small>{size}</small> : null}
          </a>
        ) : (
          <a className={buttonClass("secondary")} href={image.official_page ?? image.homepage}>
            {text.publisherPage}
          </a>
        )}
        {writable(image) ? (
          <Link to={`${PATHS.download}#apps`}>{link ? text.getBonk : text.needsBonk}</Link>
        ) : null}
      </p>
      {link ? <p className={styles.note}>{text.linkUntested}</p> : null}
      {image.usb_boot === false ? <p className="notice">{text.dvdOnly}</p> : null}
      {image.note && image.usb_boot !== false ? (
        <p className={styles.note}>{text.notes[image.note] ?? image.note}</p>
      ) : null}
      {image.sha256 ? (
        <details className={styles.block}>
          <summary>{text.verification}</summary>
          <dl className={styles.facts}>
            {image.size_bytes ? (
              <div>
                <dt>{text.size}</dt>
                <dd>{`${text.bytes(exactBytes(image.size_bytes, language))} (${size})`}</dd>
              </div>
            ) : null}
            <div>
              <dt>SHA-256</dt>
              <dd>
                <code>{image.sha256}</code> <CopyButton value={image.sha256} />
              </dd>
            </div>
          </dl>
        </details>
      ) : null}
      {command ? (
        <section className={styles.block} aria-labelledby="command-title">
          <h3 id="command-title">{text.command}</h3>
          <CommandBlock value={command} />
          <p className={styles.note}>{text.commandHint(DISK_PLACEHOLDER, LIST_COMMAND)}</p>
        </section>
      ) : null}
    </>
  );
}
