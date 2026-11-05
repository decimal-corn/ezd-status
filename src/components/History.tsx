import { formatDate } from "../lib/cases.ts";
import { exportLog } from "../lib/export.ts";
import type { HistoryLog, HistoryRecord } from "../types/index.ts";
import HistoryRecordItem from "./HistoryRecord.tsx";

interface Props {
  log: HistoryLog;
  notice: string;
  running: boolean;
  onClear: () => void;
  baselineId: string;
  targetId?: string;
  onCompare: (id: string) => void;
  onView: (record: HistoryRecord) => void;
  onDelete: (id: string) => void;
  canUndo: boolean;
  onUndo: () => void;
}

export default function History({
  log,
  notice,
  running,
  onClear,
  baselineId,
  targetId,
  onCompare,
  onView,
  onDelete,
  canUndo,
  onUndo,
}: Props) {
  const records = [...log.runs].reverse();

  return (
    <section className="panel history-panel" aria-label="Check history">
      <h2>Check history</h2>
      <p className="footnote" role="status">
        {notice}
      </p>
      <div className="comparison-controls">
        <label htmlFor="compareAgainst">Compare against</label>
        <select
          id="compareAgainst"
          value={baselineId}
          disabled={running || !records.length}
          onChange={(event) => onCompare(event.target.value)}
        >
          <option value="">
            Automatic — latest known statuses before this check
          </option>
          {records
            .filter((record) => record.id !== targetId)
            .map((record) => (
              <option value={record.id} key={record.id}>
                {formatDate(record.at)} · {record.main} ·{" "}
                {record.results.length} statuses
              </option>
            ))}
        </select>
        <p className="meta">
          Choose a saved check as the baseline. Use “View results” to compare an
          earlier check. Only cases with successful responses in both checks are
          compared.
        </p>
      </div>
      {canUndo && (
        <div className="undo-notice" role="status">
          Check deleted.{" "}
          <button type="button" disabled={running} onClick={onUndo}>
            Undo deletion
          </button>
        </div>
      )}
      <details>
        <summary className="history-summary">
          {records.length
            ? `${records.length} checks in history`
            : "No checks yet"}
        </summary>
        <div>
          {records.map((record) => (
            <HistoryRecordItem
              key={record.id}
              record={record}
              viewing={targetId === record.id}
              baseline={baselineId === record.id}
              running={running}
              onView={onView}
              onCompare={onCompare}
              onDelete={onDelete}
            />
          ))}
        </div>
      </details>
      <div className="actions">
        <button
          type="button"
          disabled={!records.length}
          onClick={() => exportLog(log)}
        >
          Export JSON log
        </button>
        <button
          type="button"
          disabled={!records.length || running}
          onClick={onClear}
        >
          Clear history
        </button>
      </div>
    </section>
  );
}
