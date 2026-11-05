import { codes, formatDate, labelStatus } from "../lib/cases.ts";
import type { HistoryRecord as Record } from "../types/index.ts";

interface Props {
  record: Record;
  viewing: boolean;
  baseline: boolean;
  running: boolean;
  onView: (record: Record) => void;
  onCompare: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function HistoryRecord({
  record,
  viewing,
  baseline,
  running,
  onView,
  onCompare,
  onDelete,
}: Props) {
  return (
    <article className={`history-record${viewing ? " selected-record" : ""}`}>
      <details className="history-row">
        <summary>
          {formatDate(record.at)} · {record.main} ·{" "}
          {record.stopped ? "stopped · " : ""}
          {record.results.length} statuses · {record.changes.length} changes
          {viewing ? " · Viewing" : ""}
          {baseline ? " · Comparison baseline" : ""}
        </summary>
        <div>
          {[...record.results]
            .sort((a, b) => a.number - b.number)
            .map((item) => (
              <p key={item.full}>
                {item.full}: {labelStatus(item.data)} ({codes(item.data)})
              </p>
            ))}
          {record.errors.map((item) => (
            <p key={item.full}>
              {item.full}: error — {item.message}
            </p>
          ))}
        </div>
      </details>
      <div className="actions record-actions">
        <button
          type="button"
          disabled={running || viewing}
          onClick={() => onView(record)}
        >
          View results
        </button>
        <button
          type="button"
          disabled={running || viewing || baseline}
          onClick={() => onCompare(record.id)}
        >
          Compare against this check
        </button>
        <button
          className="delete-record"
          type="button"
          disabled={running}
          onClick={() => onDelete(record.id)}
          aria-label={`Delete check from ${formatDate(record.at)} for ${record.main}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
