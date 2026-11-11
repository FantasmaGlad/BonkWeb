import { useText } from "../../../i18n/I18nProvider";
import type { useImageSelection } from "../hooks/useImageSelection";
import styles from "./VersionPicker.module.css";

type Selection = NonNullable<ReturnType<typeof useImageSelection>>;

/** Version and processor of the chosen variant; the variant itself is picked in the list beside. */
export function VersionPicker({ selection }: { selection: Selection }) {
  const text = useText().market;
  const { selected, choices } = selection;
  return (
    <div className={styles.picker}>
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
      <label>
        <span>{text.architecture}</span>
        <select value={selected.arch} onChange={(event) => selection.setArch(event.target.value)}>
          {choices.architectures.map((arch) => (
            <option key={arch}>{arch}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
