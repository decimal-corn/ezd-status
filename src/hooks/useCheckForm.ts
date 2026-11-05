import { useState } from "react";

import { DEFAULT_CASE_SELECTION } from "../constants/cases.ts";
import { bounds, parseCase } from "../lib/cases.ts";
import { errorMessage } from "../lib/errors.ts";
import type {
  ActiveCheck,
  Baseline,
  CaseReference,
  CheckSettings,
} from "../types/index.ts";

export function useCheckForm() {
  const [settings, setSettings] = useState<CheckSettings>({
    ...DEFAULT_CASE_SELECTION,
    caseNumber: "",
    parallel: "3",
    timeout: "20",
    randomize: false,
  });
  const [validation, setValidation] = useState("");
  let selected: CaseReference | null = null;
  let inputError = "";

  try {
    selected = parseCase(settings.caseNumber, settings);
  } catch (error) {
    if (settings.caseNumber) {
      inputError = errorMessage(error);
    }
  }

  function update<K extends keyof CheckSettings>(
    key: K,
    value: CheckSettings[K],
  ) {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setValidation("");
  }

  function prepare(
    baseline: Baseline,
  ): { run: ActiveCheck; parallel: number; timeout: number } | null {
    try {
      const c = parseCase(settings.caseNumber, settings);
      const parallel = Number(settings.parallel);
      const seconds = Number(settings.timeout);

      if (
        !Number.isInteger(parallel) ||
        parallel < 1 ||
        parallel > 10 ||
        !Number.isInteger(seconds) ||
        seconds < 5 ||
        seconds > 60
      ) {
        throw new Error(
          "Concurrent requests must be 1–10. Timeout must be 5–60 seconds.",
        );
      }

      const shift = settings.randomize ? Math.floor(Math.random() * 11) - 5 : 0;
      const run: ActiveCheck = {
        id: crypto.randomUUID(),
        case: c,
        bounds: bounds(c, shift),
        shift,
        results: [],
        errors: [],
        baseline,
        controller: new AbortController(),
      };

      setValidation("");

      return { run, parallel, timeout: seconds * 1000 };
    } catch (error) {
      setValidation(errorMessage(error));

      return null;
    }
  }

  function restore(reference: CaseReference) {
    setSettings((previous) => ({
      ...previous,
      year: reference.year,
      caseType: reference.caseType,
      caseNumber: String(reference.number),
    }));
    setValidation("");
  }

  return {
    settings,
    selected,
    inputError,
    validation,
    update,
    prepare,
    restore,
  };
}
