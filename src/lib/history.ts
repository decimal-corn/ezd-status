import type {
  ActiveCheck,
  Baseline,
  CheckRun,
  HistoryLog,
  HistoryRecord,
} from "../types/index.ts";
import { parseReference } from "./cases.ts";
import { changesFor } from "./comparison.ts";

export const emptyLog = (): HistoryLog => ({ version: 1, last: {}, runs: [] });

export function appendRun(
  log: HistoryLog,
  run: Pick<
    ActiveCheck,
    "case" | "bounds" | "baseline" | "results" | "errors"
  > & { id?: string },
  stopped: boolean,
): HistoryLog {
  const last = { ...log.last };

  for (const item of run.results) {
    last[item.full] = { data: item.data, at: item.at };
  }

  const record: HistoryRecord = {
    id: run.id ?? crypto.randomUUID(),
    at: new Date().toISOString(),
    main: run.case.full,
    start: run.bounds.start,
    end: run.bounds.end,
    stopped,
    results: run.results,
    errors: run.errors,
    changes: changesFor(run),
  };

  return { version: 1, last, runs: [...log.runs, record].slice(-100) };
}

// A selected check contributes only the statuses it actually received.
export function baselineFrom(runs: Pick<HistoryRecord, "results">[]): Baseline {
  const last: Baseline = {};

  for (const run of runs) {
    for (const item of run.results) {
      last[item.full] = { data: item.data, at: item.at };
    }
  }

  return last;
}

export function comparisonBaseline(
  log: Pick<HistoryLog, "last" | "runs">,
  targetId: string | null | undefined,
  baselineId: string,
): Baseline {
  if (baselineId) {
    return baselineFrom(
      log.runs.filter((run) => run.id === baselineId && run.id !== targetId),
    );
  }

  const index = log.runs.findIndex((run) => run.id === targetId);

  return index < 0 ? log.last : baselineFrom(log.runs.slice(0, index));
}

export function deleteRun(log: HistoryLog, id: string): HistoryLog {
  const runs = log.runs.filter((run) => run.id !== id);

  return { ...log, runs, last: baselineFrom(runs) };
}

export function recordToCheck(record: HistoryRecord): CheckRun {
  return {
    id: record.id,
    case: parseReference(record.main),
    bounds: { start: record.start, end: record.end },
    shift: 0,
    results: record.results,
    errors: record.errors,
  };
}
