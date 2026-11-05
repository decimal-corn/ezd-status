import { newlyCompleted } from "../lib/comparison.ts";
import { summarizeResults } from "../lib/results.ts";
import type { ComparedCheck } from "../types/index.ts";
import RequestErrors from "./RequestErrors.tsx";
import StatusChanges from "./StatusChanges.tsx";
import StatusGroup from "./StatusGroup.tsx";

interface Props {
  run: ComparedCheck | null;
  running: boolean;
  comparisonLabel: string;
}

export default function Results({ run, running, comparisonLabel }: Props) {
  const summary = summarizeResults(run);
  const stats = [
    { count: summary.pending, label: "In progress" },
    {
      count: summary.results.length - summary.pending,
      label: "Other statuses",
    },
    { count: summary.errors.length, label: "Request errors" },
  ];
  const emptyMessage = !run
    ? "Start a check to see the status breakdown."
    : running
      ? "Waiting for responses…"
      : "No statuses received.";

  return (
    <>
      <div className="stats" aria-label="Statistics">
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <strong>{stat.count}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
      <div className="section-title">
        <h2>By status</h2>
        <small>Main case included in totals</small>
      </div>
      {run && (
        <p className="meta" role="status">
          {comparisonLabel} {summary.comparable} comparable cases ·{" "}
          {summary.changes.length} changes.
        </p>
      )}
      {summary.changes.some(newlyCompleted) && (
        <p className="footnote completion-legend">
          Green cases marked ✓ have changed to zakończona from a different
          status.
        </p>
      )}
      <div className="groups">
        {!summary.groups.length && <div className="empty">{emptyMessage}</div>}
        {summary.groups.map((group) => (
          <StatusGroup
            key={group.key}
            group={group}
            mainNumber={run?.case.number}
            changes={summary.changeMap}
          />
        ))}
      </div>
      <StatusChanges
        changes={summary.otherChanges}
        comparisonLabel={comparisonLabel}
      />
      <RequestErrors errors={summary.errors} />
    </>
  );
}
