import { codes, formatDate, labelStatus } from "../lib/cases.ts";
import type { StatusChange } from "../types/index.ts";

interface Props {
  changes: StatusChange[];
  comparisonLabel: string;
}

export default function StatusChanges({ changes, comparisonLabel }: Props) {
  if (!changes.length) {
    return null;
  }

  return (
    <section>
      <div className="section-title">
        <h2>Other changes</h2>
      </div>
      <p className="muted">{comparisonLabel}</p>
      <div className="groups">
        {changes.map((change) => (
          <article className="group change-card" key={change.full}>
            <h3>{change.full}</h3>
            <p>
              {labelStatus(change.before)} → {labelStatus(change.after)}
            </p>
            <div className="meta">
              {codes(change.before)} → {codes(change.after)}
            </div>
            <div className="meta">
              Previous response: {formatDate(change.previousAt)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
