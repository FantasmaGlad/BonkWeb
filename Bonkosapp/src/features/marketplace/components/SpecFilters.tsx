import { DRIVE_CHOICES_GB, RAM_CHOICES_MB } from "../../../data/categories";
import { useLanguage, useText } from "../../../i18n/I18nProvider";
import { ramLabel } from "../../../shared/lib/format";
import type { CatalogFilter } from "../../../types/system";
import styles from "./SpecFilters.module.css";

export function SpecFilters({
  architectures,
  filter,
  onChange,
}: {
  architectures: readonly string[];
  filter: CatalogFilter;
  onChange: (filter: CatalogFilter) => void;
}) {
  const text = useText().market;
  const language = useLanguage();
  return (
    <fieldset className={styles.filters}>
      <legend className="visually-hidden">{text.filtersLabel}</legend>
      <label>
        <span>{text.arch}</span>
        <select
          value={filter.arch}
          onChange={(event) => onChange({ ...filter, arch: event.target.value })}
        >
          <option value="">{text.any}</option>
          {architectures.map((arch) => (
            <option key={arch}>{arch}</option>
          ))}
        </select>
      </label>
      <label>
        <span>{text.ram}</span>
        <select
          value={filter.ramMb}
          onChange={(event) => onChange({ ...filter, ramMb: Number(event.target.value) })}
        >
          <option value={0}>{text.any}</option>
          {RAM_CHOICES_MB.map((size) => (
            <option key={size} value={size}>
              {ramLabel(size, language)}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{text.drive}</span>
        <select
          value={filter.driveGb}
          onChange={(event) => onChange({ ...filter, driveGb: Number(event.target.value) })}
        >
          <option value={0}>{text.any}</option>
          {DRIVE_CHOICES_GB.map((size) => (
            <option key={size} value={size}>
              {text.driveChoice(size)}
            </option>
          ))}
        </select>
      </label>
    </fieldset>
  );
}
