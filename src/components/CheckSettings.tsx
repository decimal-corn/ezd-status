import type { SubmitEvent } from "react";

import { caseAt } from "../lib/cases.ts";
import type {
  CaseRange,
  CheckSettings as Settings,
  FinishedCheck,
} from "../types/index.ts";

interface Props {
  settings: Settings;
  inputError: string;
  validation: string;
  running: boolean;
  range: CaseRange | null;
  shift: number;
  done: number;
  errorCount: number;
  finished: FinishedCheck | null;
  onStart: (event: SubmitEvent<HTMLFormElement>) => void;
  onStop: () => void;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export default function CheckSettings({
  settings,
  inputError,
  validation,
  running,
  range,
  shift,
  done,
  errorCount,
  finished,
  onStart,
  onStop,
  onChange,
}: Props) {
  let stateLabel = "Ready to check";

  if (running) {
    stateLabel = "Checking cases…";
  } else if (finished?.stopped) {
    stateLabel = "Stopped · partial results";
  } else if (finished) {
    stateLabel = errorCount ? "Done · some requests failed" : "Done";
  }

  let rangeLabel = "";

  if (range) {
    rangeLabel = `${caseAt(range.start)} — ${caseAt(range.end)} · 100 cases`;

    if (running) {
      rangeLabel += ` · shift ${shift > 0 ? "+" : ""}${shift}`;
    } else if (settings.randomize) {
      rangeLabel += " · random shift: −5…+5";
    }
  }

  return (
    <section className="panel settings" aria-label="Check settings">
      <form onSubmit={onStart} noValidate>
        <div className="fields">
          <div className="casefield">
            <label htmlFor="caseNumber">Case number</label>
            <input
              id="caseNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9]+"
              placeholder="Enter case number"
              required
              autoComplete="off"
              spellCheck={false}
              aria-describedby="caseHint validation"
              aria-invalid={!!inputError}
              disabled={running}
              value={settings.caseNumber}
              onChange={(e) => onChange("caseNumber", e.target.value)}
            />
            <small id="caseHint">
              WO-I.6121.<b>number</b>.2026
            </small>
          </div>
          <div>
            <label htmlFor="parallel">Concurrent requests</label>
            <input
              id="parallel"
              type="number"
              min="1"
              max="10"
              step="1"
              required
              inputMode="numeric"
              disabled={running}
              value={settings.parallel}
              onChange={(e) => onChange("parallel", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="timeout">Timeout, seconds</label>
            <input
              id="timeout"
              type="number"
              min="5"
              max="60"
              step="1"
              required
              inputMode="numeric"
              disabled={running}
              value={settings.timeout}
              onChange={(e) => onChange("timeout", e.target.value)}
            />
          </div>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.randomize}
            disabled={running}
            onChange={(e) => onChange("randomize", e.target.checked)}
          />
          Randomly shift the range by up to ±5 cases
        </label>
        <p className="range">{rangeLabel}</p>
        <p className="errorText" id="validation" role="alert">
          {validation || inputError}
        </p>
        <div className="actions">
          <button className="primary" type="submit" disabled={running}>
            Check cases
          </button>
          <button type="button" disabled={!running} onClick={onStop}>
            Stop
          </button>
        </div>
      </form>
      <div>
        <div className="progressline">
          <span role="status">{stateLabel}</span>
          <span>{done} / 100</span>
        </div>
        <progress value={done} max="100" aria-label="Check progress" />
      </div>
    </section>
  );
}
