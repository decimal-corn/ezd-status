import assert from "node:assert/strict";
import test from "node:test";

import { bounds, parseCase } from "../src/lib/cases.ts";
import { appendRun, emptyLog } from "../src/lib/history.ts";
import { checkCases } from "../src/lib/service.ts";
import { loadLog, LOG_KEY } from "../src/lib/storage.ts";
import type { HistoryLog } from "../src/types/index.ts";
import { record, result } from "./fixtures.ts";

const data = {
  Response: "w trakcie realizacji",
  StatusCode: 200,
  StatusEzd: 2,
};

test("loads original history format and recovers from corrupt or inaccessible storage", () => {
  const log = emptyLog();

  log.last["WO-I.6121.1.2026"] = { data, at: "2026-11-04" };
  assert.deepEqual(
    loadLog({
      getItem: (key) => {
        assert.equal(key, LOG_KEY);

        return JSON.stringify(log);
      },
    }).log,
    log,
  );
  assert.deepEqual(loadLog({ getItem: () => "{" }).log, emptyLog());
  assert.match(
    loadLog({
      getItem: () => {
        throw new Error("Denied");
      },
    }).notice,
    /Could not read/,
  );
});
test("retains last 100 runs and preserves successful statuses when a later check fails", () => {
  const c = parseCase("100");
  const run = {
    case: c,
    bounds: bounds(c),
    baseline: {},
    results: [{ full: c.full, number: 100, data, at: "2026-11-05" }],
    errors: [],
  };
  const original = emptyLog();
  let log = appendRun(original, run, false);

  assert.deepEqual(original, emptyLog());

  for (let i = 0; i < 105; i++) {
    log = appendRun(
      log,
      {
        ...run,
        results: [],
        errors: [{ full: c.full, number: 100, message: "Timeout" }],
      },
      true,
    );
  }

  assert.equal(log.runs.length, 100);
  assert.deepEqual(log.last[c.full].data, data);
  assert.equal(log.runs.at(-1)?.stopped, true);
});
test("sends main case first, limits concurrency, and stops without scheduling further requests", async () => {
  const c = parseCase("100");
  const run = {
    case: c,
    bounds: bounds(c),
    baseline: {},
    results: [],
    errors: [],
    controller: new AbortController(),
  };
  const requested: string[] = [];
  let concurrent = 0;
  let peak = 0;

  const request = async (full: string) => {
    requested.push(full);
    peak = Math.max(peak, ++concurrent);
    await new Promise((resolve) => setTimeout(resolve, 5));
    concurrent--;

    return data;
  };

  await checkCases(
    run,
    3,
    1000,
    () => {
      if (run.results.length === 3) {
        run.controller.abort();
      }
    },
    request,
  );
  assert.equal(requested[0], c.full);
  assert.equal(requested.length, 3);
  assert.equal(peak, 3);
  assert.equal(run.results.length, 3);
});

test("compares against only successful results from the selected check", async () => {
  const { baselineFrom, comparisonBaseline } =
    await import("../src/lib/history.ts");
  const first = record("first", [result("case-a", "2026-11-01")]);
  const second = record("second", [result("case-b", "2026-11-02")]);
  const target = record("target", [result("case-a", "2026-11-03", true)]);
  const log: HistoryLog = { ...emptyLog(), runs: [first, second, target] };

  assert.deepEqual(
    comparisonBaseline(log, target.id, second.id),
    baselineFrom([second]),
  );
  assert.deepEqual(
    comparisonBaseline(log, target.id, ""),
    baselineFrom([first, second]),
  );
  assert.deepEqual(comparisonBaseline(log, first.id, ""), {});
});
test("deletes exactly one record and rebuilds latest statuses without deleted results", async () => {
  const { deleteRun, baselineFrom } = await import("../src/lib/history.ts");
  const first = record("first", [result("case-a", "2026-11-01")]);
  const second = record("second", [
    result("case-a", "2026-11-02", true),
    result("case-b", "2026-11-02"),
  ]);
  const log: HistoryLog = {
    version: 1,
    runs: [first, second],
    last: baselineFrom([first, second]),
  };
  const updated = deleteRun(log, "second");

  assert.deepEqual(updated.runs, [first]);
  assert.deepEqual(updated.last, baselineFrom([first]));
  assert.equal(log.runs.length, 2);
});

test("assigns stable selection IDs to original history records without losing their results", () => {
  const c = parseCase("100");
  const legacy = {
    start: 51,
    end: 150,
    stopped: false,
    at: "2026-11-01",
    main: c.full,
    results: [{ full: c.full, number: 100, data, at: "2026-11-01" }],
    errors: [],
    changes: [],
  };
  const storage = {
    getItem: () => JSON.stringify({ ...emptyLog(), runs: [legacy, legacy] }),
  };
  const loaded = loadLog(storage).log;

  assert.ok(loaded.runs[0].id);
  assert.notEqual(loaded.runs[0].id, loaded.runs[1].id);
  assert.deepEqual(loaded.runs[0].results, legacy.results);
  assert.equal(loadLog(storage).log.runs[0].id, loaded.runs[0].id);
});

test("loads legacy status changes without requiring a duplicated data property", () => {
  const old = record("old", [result("WO-I.6121.100.2026", "2026-11-01")]);
  const serialized = {
    ...old,
    changes: [
      {
        full: old.main,
        number: 100,
        at: old.at,
        before: data,
        after: { ...data, Response: "zakończona" },
        previousAt: "2026-10-31",
      },
    ],
  };
  const loaded = loadLog({
    getItem: () => JSON.stringify({ ...emptyLog(), runs: [serialized] }),
  });

  assert.equal(loaded.log.runs.length, 1);
  assert.equal(loaded.log.runs[0].changes.length, 1);
});
