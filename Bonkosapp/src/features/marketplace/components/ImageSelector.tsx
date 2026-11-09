import { useText } from "../../../i18n/I18nProvider";
import type { useImageSelection } from "../hooks/useImageSelection";
import { editionKey, editionLabel } from "../lib/selection";
import styles from "./ImageSelector.module.css";

type Selection = NonNullable<ReturnType<typeof useImageSelection>>;

export function ImageSelector({
  selection,
  familyName,
}: {
  selection: Selection;
  familyName: string;
}) {
  const text = useText().market;
  const { selected, choices } = selection;
  return (
    <div className={styles.cascade}>
      <label>
        <span>{text.edition}</span>
        <select
          value={editionKey(selected)}
          onChange={(event) => selection.setEdition(event.target.value)}
        >
          {choices.editions.map((image) => (
            <option key={editionKey(image)} value={editionKey(image)}>
              {editionLabel(image, familyName, text.standard)}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{text.architecture}</span>
        <select value={selected.arch} onChange={(event) => selection.setArch(event.target.value)}>
          {choices.architectures.map((arch) => (
            <option key={arch}>{arch}</option>
          ))}
        </select>
      </label>
      <label>
        <span>{text.version}</span>
        <select value={selected.id} onChange={(event) => selection.setVersion(event.target.value)}>
          {choices.versions.map((image) => (
            <option key={image.id} value={image.id}>
              {[
                image.version,
                image.channel === "lts" ? text.lts : undefined,
                image.channel === "end_of_life" ? text.endOfLife : undefined,
              ]
                .filter(Boolean)
                .join(" · ")}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
