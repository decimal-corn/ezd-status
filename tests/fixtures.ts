import type { CaseResult, HistoryRecord } from "../src/types/index.ts";

export const pendingStatus = {
  Response: "w trakcie realizacji",
  StatusCode: 200,
  StatusEzd: 2,
};

export function result(
  full: string,
  at: string,
  completed = false,
): CaseResult {
  return {
    full,
    number: 100,
    at,
    data: completed
      ? { ...pendingStatus, Response: "zakończona" }
      : pendingStatus,
  };
}

export function record(id: string, results: CaseResult[]): HistoryRecord {
  return {
    id,
    at: "2026-11-01",
    main: "WO-I.6121.100.2026",
    start: 51,
    end: 150,
    stopped: false,
    results,
    errors: [],
    changes: [],
  };
}
