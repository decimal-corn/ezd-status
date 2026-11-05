import { codes, formatDate, labelStatus, urlFor } from "../lib/cases.ts";
import type {
  CaseError,
  CaseInfo,
  CaseResult,
  CheckRun,
} from "../types/index.ts";

interface Props {
  selected: CaseInfo | null;
  run: CheckRun | null;
  running: boolean;
}

export default function MainCase({ selected, run, running }: Props) {
  const full = run?.case.full ?? selected?.full;
  const item = run?.results.find((x) => x.full === full);
  const error = run?.errors.find((x) => x.full === full);
  const { status, meta } = describeStatus(item, error, running, run !== null);

  return (
    <section className="panel hero" aria-label="Main case status">
      <div className="hero-top">
        <div>
          <div className="eyebrow">Main case</div>
          <h2>{full ?? "No case number entered"}</h2>
        </div>
        <span className="badge">IN FOCUS</span>
      </div>
      <div className="status" aria-live="polite">
        {status}
      </div>
      <div className="meta">{meta}</div>
      {full && (
        <div className="meta">
          <a href={urlFor(full)} target="_blank" rel="noopener noreferrer">
            Open service response ↗
          </a>
        </div>
      )}
    </section>
  );
}

function describeStatus(
  item: CaseResult | undefined,
  error: CaseError | undefined,
  running: boolean,
  hasRun: boolean,
) {
  if (item) {
    return {
      status: labelStatus(item.data),
      meta: `${codes(item.data)} · ${formatDate(item.at)}`,
    };
  }

  if (error) {
    return { status: "Unable to check", meta: error.message };
  }

  if (running) {
    return { status: "Checking…", meta: "Your main case is requested first." };
  }

  if (hasRun) {
    return {
      status: "Check stopped",
      meta: "No response was received for your main case.",
    };
  }

  return {
    status: "Not checked yet",
    meta: "The status will appear as soon as the service responds.",
  };
}
