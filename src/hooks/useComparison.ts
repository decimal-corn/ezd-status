import { useState } from "react";

import { formatDate } from "../lib/cases.ts";
import { comparisonBaseline, recordToCheck } from "../lib/history.ts";
import type { CheckRun, ComparedCheck, HistoryLog } from "../types/index.ts";

export function useComparison(log: HistoryLog, run: CheckRun | null) {
  const [selectedId, setSelectedId] = useState("");
  const latest = log.runs.at(-1);
  const displayed = run ?? (latest ? recordToCheck(latest) : null);
  // A removed or evicted record can never remain the active baseline.
  const baselineId = log.runs.some(
    (record) => record.id === selectedId && record.id !== displayed?.id,
  )
    ? selectedId
    : "";
  const record = log.runs.find((item) => item.id === baselineId);
  const compared: ComparedCheck | null = displayed
    ? {
        ...displayed,
        baseline: baselineId
          ? comparisonBaseline(log, displayed.id, baselineId)
          : (displayed.baseline ?? comparisonBaseline(log, displayed.id, "")),
      }
    : null;
  const label = record
    ? `Comparing with ${formatDate(record.at)} · ${record.main}. Only cases with successful responses in both checks are compared.`
    : "Compared with the last successful status received before this check for each case.";

  return { displayed, compared, baselineId, label, select: setSelectedId };
}
