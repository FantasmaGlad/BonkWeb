import { useEffect } from "react";
import { logoOf } from "../../../data/catalogService";
import { useLanguage, useText } from "../../../i18n/I18nProvider";
import { Logo } from "../../../shared/components/Logo";
import { ramLabel } from "../../../shared/lib/format";
import type { SystemSummary, UseId } from "../../../types/system";
import { useImageSelection } from "../hooks/useImageSelection";
import { editionKey } from "../lib/selection";
import { firstVariant, variantsOf } from "../lib/variants";
import { ImageActions } from "./ImageActions";
import styles from "./SystemPage.module.css";
import { VariantList } from "./VariantList";
import { VersionPicker } from "./VersionPicker";

export function SystemPage({
  system,
  imageId,
  preferredArch,
  onSelect,
  onBack,
}: {
  system: SystemSummary;
  imageId: string;
  preferredArch: string | undefined;
  onSelect: (image: string) => void;
  onBack: () => void;
}) {
  const text = useText().market;
  const { family } = system;
  const start = imageId || firstVariant(family, system.images, preferredArch)?.id || "";
  const selection = useImageSelection(system.images, start, preferredArch, onSelect);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <article className={styles.page}>
      <button type="button" className={styles.back} onClick={onBack}>
        {text.back}
      </button>
      <SystemHead system={system} />
      {selection ? (
        <div className={styles.columns}>
          <section aria-labelledby="variants-title">
            <h2 id="variants-title">{text.variants}</h2>
            <VariantList
              variants={variantsOf(family, system.images, selection.selected)}
              selected={editionKey(selection.selected)}
              familyName={family.name}
              onChoose={selection.setEdition}
            />
          </section>
          <section aria-labelledby="chosen-title">
            <h2 id="chosen-title">{text.chosen}</h2>
            <VersionPicker selection={selection} />
            <ImageActions image={selection.selected} />
          </section>
        </div>
      ) : null}
    </article>
  );
}

function SystemHead({ system }: { system: SystemSummary }) {
  const text = useText().market;
  const language = useLanguage();
  const { family, memory } = system;
  const uses = (family.uses ?? []).flatMap((use) => text.categories[use as UseId] ?? []);
  return (
    <header className={styles.head}>
      <Logo src={logoOf(family)} size={56} eager />
      <div>
        <h1>{family.name}</h1>
        {text.systems[family.id] ? <p>{text.systems[family.id]}</p> : null}
        <p className={styles.meta}>
          {uses.length ? `${uses.join(" · ")} · ` : null}
          <a href={system.latest.homepage}>{text.site}</a>
          {memory ? (
            <>
              {" · "}
              {text.ramSource} <a href={memory.source}>{ramLabel(memory.value, language)}</a>
            </>
          ) : null}
        </p>
      </div>
    </header>
  );
}
