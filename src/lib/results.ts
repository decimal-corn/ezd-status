import type { CaseResult, CaseStatus, ComparedCheck } from "../types/index.ts";
import { inProgress, labelStatus, statusKey } from "./cases.ts";
import { changesFor, newlyCompleted } from "./comparison.ts";

export interface StatusGroup {
  key: string;
  data: CaseStatus;
  items: CaseResult[];
}

export function summarizeResults(run: ComparedCheck | null) {
  const results = run?.results ?? [];
  const errors = run?.errors ?? [];
  const changes = run ? changesFor(run) : [];
  const changeMap = new Map(changes.map((change) => [change.full, change]));
  const otherChanges = changes
    .filter((change) => !newlyCompleted(change))
    .sort((a, b) => a.number - b.number);
  const grouped = new Map<string, StatusGroup>();

  for (const item of results) {
    const key = statusKey(item.data);
    const group = grouped.get(key) ?? { key, data: item.data, items: [] };

    group.items.push(item);
    grouped.set(key, group);
  }

  const groups = [...grouped.values()].sort(
    (a, b) =>
      Number(inProgress(b.data)) - Number(inProgress(a.data)) ||
      b.items.length - a.items.length ||
      labelStatus(a.data).localeCompare(labelStatus(b.data)),
  );

  for (const group of groups) {
    group.items.sort((a, b) => a.number - b.number);
  }

  return {
    results,
    errors,
    changes,
    changeMap,
    otherChanges,
    groups,
    pending: results.filter((item) => inProgress(item.data)).length,
    comparable: run
      ? results.filter((item) => run.baseline[item.full]).length
      : 0,
  };
}
