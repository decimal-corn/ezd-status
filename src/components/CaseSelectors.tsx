import {
  CASE_TYPES,
  CASE_TYPES_SOURCE,
  CASE_YEARS,
} from "../constants/cases.ts";
import type { CheckSettings } from "../types/index.ts";

interface Props {
  settings: CheckSettings;
  disabled: boolean;
  onChange: <K extends keyof CheckSettings>(
    key: K,
    value: CheckSettings[K],
  ) => void;
}

export default function CaseSelectors({ settings, disabled, onChange }: Props) {
  const selectedType = CASE_TYPES.find(
    (type) => type.code === settings.caseType,
  );
  const knownYear = CASE_YEARS.some((year) => year === settings.year);

  return (
    <div className="case-selectors">
      <div>
        <label htmlFor="caseYear">Year</label>
        <select
          id="caseYear"
          value={settings.year}
          disabled={disabled}
          onChange={(event) => onChange("year", event.target.value)}
        >
          {!knownYear && (
            <option value={settings.year}>{settings.year} (saved check)</option>
          )}
          {CASE_YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="caseType">Case type</label>
        <select
          id="caseType"
          aria-describedby="caseTypeDescription"
          value={settings.caseType}
          disabled={disabled}
          onChange={(event) => onChange("caseType", event.target.value)}
        >
          {!selectedType && (
            <option value={settings.caseType}>
              {settings.caseType} — Saved case type
            </option>
          )}
          {CASE_TYPES.map((type) => (
            <option
              key={type.code}
              value={type.code}
              title={type.originalLabel}
            >
              {type.code} — {type.label}
            </option>
          ))}
        </select>
        <p id="caseTypeDescription" className="meta">
          {selectedType?.description ??
            "This saved case type is not in the current catalog."}
        </p>
        <small>
          <a
            href={CASE_TYPES_SOURCE.url}
            title={CASE_TYPES_SOURCE.title}
            target="_blank"
            rel="noopener noreferrer"
          >
            Classification source
          </a>{" "}
          · Citizenship cases (WO-I). Use the code shown on your letter.
        </small>
      </div>
    </div>
  );
}
