import type { CaseError } from "../types/index.ts";

export default function RequestErrors({ errors }: { errors: CaseError[] }) {
  if (!errors.length) {
    return null;
  }

  return (
    <details>
      <summary>Request errors · {errors.length}</summary>
      <div className="errors">
        {[...errors]
          .sort((a, b) => a.number - b.number)
          .map((item) => (
            <p key={item.full}>
              {item.full} — {item.message}
            </p>
          ))}
      </div>
    </details>
  );
}
