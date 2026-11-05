import type { SubmitEvent } from "react";

import CheckSettings from "./components/CheckSettings.tsx";
import History from "./components/History.tsx";
import MainCase from "./components/MainCase.tsx";
import Results from "./components/Results.tsx";
import { useCheckForm } from "./hooks/useCheckForm.ts";
import { useCheckRunner } from "./hooks/useCheckRunner.ts";
import { useComparison } from "./hooks/useComparison.ts";
import { useHistory } from "./hooks/useHistory.ts";
import { bounds, formatDate } from "./lib/cases.ts";
import { appendRun, comparisonBaseline, recordToCheck } from "./lib/history.ts";
import type { HistoryRecord } from "./types/index.ts";

export default function App() {
  const form = useCheckForm();
  const checks = useCheckRunner();
  const history = useHistory();
  const comparison = useComparison(history.log, checks.run);
  const { displayed } = comparison;
  const range = checks.running
    ? (checks.run?.bounds ?? null)
    : form.selected
      ? bounds(form.selected)
      : null;
  const mainRun =
    checks.running || displayed?.case.full === form.selected?.full
      ? displayed
      : null;

  function start(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (checks.running) {
      return;
    }

    const prepared = form.prepare(history.log.last);

    if (!prepared) {
      return;
    }

    history.discardUndo();
    void checks.start(
      prepared.run,
      prepared.parallel,
      prepared.timeout,
      (run, stopped) => {
        history.persist(
          appendRun(
            history.log,
            {
              ...run,
              baseline: comparisonBaseline(
                history.log,
                null,
                comparison.baselineId,
              ),
            },
            stopped,
          ),
        );
      },
    );
  }

  function view(record: HistoryRecord) {
    if (checks.running) {
      return;
    }

    const check = recordToCheck(record);

    checks.view(check, { stopped: record.stopped, at: record.at });
    form.update("caseNumber", String(check.case.number));

    if (comparison.baselineId === record.id) {
      comparison.select("");
    }
  }

  function remove(id: string) {
    if (checks.running) {
      return;
    }

    history.remove(id);
    checks.remove(id);

    if (comparison.baselineId === id) {
      comparison.select("");
    }
  }

  function clear() {
    if (checks.running || !history.clear()) {
      return;
    }

    comparison.select("");
    checks.resetBaseline({});
  }

  return (
    <main>
      <header>
        <div className="eyebrow">Małopolska Voivodeship Office · EZD</div>
        <h1>Case status</h1>
        <p className="muted">
          Your case and a snapshot of 100 nearby case numbers.
        </p>
      </header>
      <div className="workspace">
        <CheckSettings
          settings={form.settings}
          inputError={form.inputError}
          validation={form.validation}
          running={checks.running}
          range={range}
          shift={checks.run?.shift ?? 0}
          done={
            (displayed?.results.length ?? 0) + (displayed?.errors.length ?? 0)
          }
          errorCount={displayed?.errors.length ?? 0}
          finished={checks.finished}
          onStart={start}
          onStop={checks.stop}
          onChange={form.update}
        />
        <MainCase
          selected={form.selected}
          run={mainRun}
          running={checks.running}
        />
      </div>
      <Results
        run={comparison.compared}
        running={checks.running}
        comparisonLabel={comparison.label}
      />
      {checks.finished && displayed && (
        <p className="footnote">
          {checks.finished.stopped ? "Stopped" : "Checked"}:{" "}
          {formatDate(checks.finished.at)} · Received {displayed.results.length}{" "}
          of 100 statuses. Main case included in totals.
        </p>
      )}
      <History
        log={history.log}
        notice={history.notice}
        running={checks.running}
        onClear={clear}
        baselineId={comparison.baselineId}
        targetId={displayed?.id}
        onCompare={comparison.select}
        onView={view}
        onDelete={remove}
        canUndo={history.canUndo}
        onUndo={history.undo}
      />
      <p className="footnote">
        Statuses are shown in the service’s original language. For “w trakcie
        realizacji / 200 / 2”, only the count is displayed; other statuses also
        list case numbers. Checks are started manually.
      </p>
    </main>
  );
}
