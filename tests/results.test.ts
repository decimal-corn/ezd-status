import assert from "node:assert/strict";
import test from "node:test";

import { recordToCheck } from "../src/lib/history.ts";
import { summarizeResults } from "../src/lib/results.ts";
import { record, result } from "./fixtures.ts";

test("groups statuses, highlights newly completed cases, and leaves source order unchanged", () => {
  const completed = { ...result("case-b", "2026-11-02", true), number: 102 };
  const pending = { ...result("case-a", "2026-11-02"), number: 101 };
  const run = {
    ...recordToCheck(record("current", [completed, pending])),
    baseline: { "case-b": { data: pending.data, at: "2026-11-01" } },
  };
  const summary = summarizeResults(run);

  assert.equal(summary.pending, 1);
  assert.equal(summary.groups.length, 2);
  assert.equal(summary.groups[0].items[0].full, "case-a");
  assert.equal(summary.comparable, 1);
  assert.equal(summary.changes.length, 1);
  assert.equal(summary.otherChanges.length, 0);
  assert.deepEqual(run.results, [completed, pending]);
});
