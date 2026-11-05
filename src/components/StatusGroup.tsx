import { codes, inProgress, labelStatus, urlFor } from "../lib/cases.ts";
import { newlyCompleted } from "../lib/comparison.ts";
import type { StatusGroup as Group } from "../lib/results.ts";
import type { StatusChange } from "../types/index.ts";

interface Props {
  group: Group;
  mainNumber?: number;
  changes: Map<string, StatusChange>;
}

export default function StatusGroup({ group, mainNumber, changes }: Props) {
  return (
    <article className="group">
      <div className="group-head">
        <div>
          <h3>{labelStatus(group.data)}</h3>
          <div className="meta">{codes(group.data)}</div>
        </div>
        <span className="count">{group.items.length}</span>
      </div>
      {!inProgress(group.data) && (
        <div className="chips">
          {group.items.map((item) => {
            const change = changes.get(item.full);
            const isNew = change && newlyCompleted(change);

            return (
              <a
                key={item.full}
                className={`chip${item.number === mainNumber ? " main" : ""}${isNew ? " completed-new" : ""}`}
                title={
                  isNew
                    ? `${labelStatus(change.before)} → ${labelStatus(change.after)}`
                    : undefined
                }
                href={urlFor(item.full)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.full}
                {isNew ? " ✓" : ""}
              </a>
            );
          })}
        </div>
      )}
    </article>
  );
}
