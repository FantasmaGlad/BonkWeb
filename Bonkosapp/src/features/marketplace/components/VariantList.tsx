import { useLanguage, useText } from "../../../i18n/I18nProvider";
import { ramLabel, sizeLabel } from "../../../shared/lib/format";
import { editionLabel } from "../lib/selection";
import { editionBeyond, GROUPS, type Variant } from "../lib/variants";
import styles from "./VariantList.module.css";

export function VariantList({
  variants,
  selected,
  familyName,
  onChoose,
}: {
  variants: readonly Variant[];
  selected: string;
  familyName: string;
  onChoose: (key: string) => void;
}) {
  const text = useText().market;
  return (
    <div className={styles.groups}>
      {variants.some((variant) => variant.image.kind === "live") ? (
        <p className={styles.note}>{text.liveNote}</p>
      ) : null}
      {GROUPS.map((group) => {
        const members = variants.filter((variant) => variant.group === group);
        return members.length ? (
          <section key={group} aria-labelledby={`group-${group}`}>
            <h3 id={`group-${group}`}>{text.groups[group]}</h3>
            <ul>
              {members.map((variant) => (
                <li key={variant.key}>
                  <VariantRow
                    variant={variant}
                    familyName={familyName}
                    chosen={variant.key === selected}
                    onChoose={() => onChoose(variant.key)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null;
      })}
    </div>
  );
}

function VariantRow({
  variant,
  familyName,
  chosen,
  onChoose,
}: {
  variant: Variant;
  familyName: string;
  chosen: boolean;
  onChoose: () => void;
}) {
  const text = useText().market;
  const language = useLanguage();
  const { image, memory } = variant;
  const desktop = image.desktop ? text.desktops[image.desktop] : undefined;
  const edition = editionLabel(image, familyName, text.standard);
  const title = desktop ?? edition;
  const details = [
    desktop && image.desktop ? editionBeyond(edition, image.desktop) : undefined,
    image.kind ? text.kinds[image.kind] : undefined,
    memory ? text.specRam(ramLabel(memory.value, language)) : undefined,
    image.size_bytes ? sizeLabel(image.size_bytes, language) : undefined,
  ].filter(Boolean);
  const hint = image.desktop ? text.desktopHints[image.desktop] : undefined;
  return (
    <button type="button" className={styles.row} aria-pressed={chosen} onClick={onChoose}>
      <span className={styles.title}>
        <strong>{title}</strong>
        {hint ? <span>{hint}</span> : null}
      </span>
      <span className={styles.details}>{details.join(" · ")}</span>
    </button>
  );
}
