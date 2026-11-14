import {
  DRIVE_CHOICES_GB,
  MEDIA_CHOICES,
  RAM_CHOICES_MB,
  termLabel,
} from "../../../data/categories";
import { useLanguage, useText } from "../../../i18n/I18nProvider";
import { ramLabel } from "../../../shared/lib/format";
import type { Term } from "../../../types/catalog";
import type { CatalogFilter } from "../../../types/system";
import styles from "./SpecFilters.module.css";

type Choice = { value: string; label: string };

function FilterSelect({
  label,
  value,
  choices,
  onPick,
}: {
  label: string;
  value: string;
  choices: readonly Choice[];
  onPick: (value: string) => void;
}) {
  const any = useText().market.any;
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onPick(event.target.value)}>
        <option value="">{any}</option>
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SpecFilters({
  bases,
  architectures,
  desktops,
  filter,
  onChange,
}: {
  bases: readonly Term[];
  architectures: readonly string[];
  desktops: readonly string[];
  filter: CatalogFilter;
  onChange: (filter: CatalogFilter) => void;
}) {
  const text = useText().market;
  const language = useLanguage();
  const number = (value: string) => Number(value) || 0;
  return (
    <fieldset className={styles.filters}>
      <legend className="visually-hidden">{text.filtersLabel}</legend>
      <FilterSelect
        label={text.base}
        value={filter.base}
        choices={bases.map(({ id }) => ({ value: id, label: termLabel(bases, id, language) }))}
        onPick={(base) => onChange({ ...filter, base })}
      />
      <FilterSelect
        label={text.desktop}
        value={filter.desktop}
        choices={desktops.map((id) => ({ value: id, label: text.desktops[id] ?? id }))}
        onPick={(desktop) => onChange({ ...filter, desktop })}
      />
      <FilterSelect
        label={text.arch}
        value={filter.arch}
        choices={architectures.map((arch) => ({ value: arch, label: arch }))}
        onPick={(arch) => onChange({ ...filter, arch })}
      />
      <FilterSelect
        label={text.ram}
        value={filter.ramMb ? String(filter.ramMb) : ""}
        choices={RAM_CHOICES_MB.map((size) => ({
          value: String(size),
          label: ramLabel(size, language),
        }))}
        onPick={(value) => onChange({ ...filter, ramMb: number(value) })}
      />
      <FilterSelect
        label={text.mediaLabel}
        value={filter.media}
        choices={MEDIA_CHOICES.map((media) => ({ value: media, label: text.media[media] }))}
        onPick={(media) => onChange({ ...filter, media })}
      />
      <FilterSelect
        label={text.drive}
        value={filter.driveGb ? String(filter.driveGb) : ""}
        choices={DRIVE_CHOICES_GB.map((size) => ({
          value: String(size),
          label: text.driveChoice(size),
        }))}
        onPick={(value) => onChange({ ...filter, driveGb: number(value) })}
      />
    </fieldset>
  );
}
