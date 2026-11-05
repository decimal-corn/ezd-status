import type {
  CaseStatus,
  ComparisonInput,
  StatusChange,
} from "../types/index.ts";
import { statusKey } from "./cases.ts";

const completed = (data: CaseStatus) =>
  data.StatusCode === 200 &&
  typeof data.Response === "string" &&
  data.Response.trim().toLocaleLowerCase("pl-PL") === "zakończona";

export const newlyCompleted = (change: StatusChange) =>
  completed(change.after) && !completed(change.before);

export function changesFor(run: ComparisonInput): StatusChange[] {
  return run.results.flatMap((item) => {
    const before = run.baseline[item.full];

    return before && statusKey(before.data) !== statusKey(item.data)
      ? [
          {
            ...item,
            before: before.data,
            after: item.data,
            previousAt: before.at,
          },
        ]
      : [];
  });
}
