import assert from "node:assert/strict";
import test from "node:test";

import {
  bounds,
  inProgress,
  numbersFor,
  parseCase,
  validData,
} from "../src/lib/cases.ts";
import { changesFor, newlyCompleted } from "../src/lib/comparison.ts";

test("rejects invalid case numbers without accepting partial input", () => {
  for (const value of [
    "",
    "0",
    "-1",
    "2.5",
    "1e3",
    "WO-I.6121.1.2026",
    "9007199254740991",
  ]) {
    assert.throws(() => parseCase(value));
  }

  assert.equal(parseCase(" 00100 ").full, "WO-I.6121.100.2026");
});
test("checks exactly 100 distinct cases with the main case first, including lower boundary and shifted windows", () => {
  for (const n of [1, 2, 49, 50, 1000]) {
    for (const shift of [-5, 0, 5]) {
      const c = parseCase(String(n));
      const list = numbersFor(c, bounds(c, shift));

      assert.equal(list.length, 100);
      assert.equal(new Set(list).size, 100);
      assert.equal(list[0], n);
      assert.ok(list.every((x) => x >= 1));
    }
  }
});
test("detects transitions against the last successful status and distinguishes new completions", () => {
  const before = {
    Response: "w trakcie realizacji",
    StatusCode: 200,
    StatusEzd: 2,
  };
  const after = { Response: "zakończona", StatusCode: 200, StatusEzd: 3 };
  const item = {
    full: "WO-I.6121.100.2026",
    number: 100,
    data: after,
    at: "2026-11-05",
  };
  const run = {
    results: [item],
    baseline: { [item.full]: { data: before, at: "2026-11-04" } },
  };

  assert.equal(changesFor(run).length, 1);
  assert.ok(newlyCompleted(changesFor(run)[0]));
  assert.deepEqual(changesFor({ ...run, baseline: {} }), []);
  assert.deepEqual(
    changesFor({
      ...run,
      baseline: { [item.full]: { data: after, at: "2026-11-05" } },
    }),
    [],
  );
  assert.ok(inProgress(before));
  assert.equal(inProgress({ ...before, StatusEzd: "2" }), false);
});
test("rejects malformed service responses", () => {
  for (const value of [
    null,
    [],
    {},
    { Response: {} },
    { Response: "ok", StatusCode: {} },
  ]) {
    assert.equal(Boolean(validData(value)), false);
  }

  assert.ok(validData({ Response: null, StatusCode: 404 }));
});
