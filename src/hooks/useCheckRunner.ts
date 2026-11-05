import { useEffect, useRef, useState } from "react";

import { checkCases } from "../lib/service.ts";
import type {
  ActiveCheck,
  Baseline,
  CheckRun,
  FinishedCheck,
} from "../types/index.ts";

export function useCheckRunner() {
  const [run, setRun] = useState<CheckRun | null>(null);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState<FinishedCheck | null>(null);
  const active = useRef<ActiveCheck | null>(null);

  useEffect(
    () => () => {
      active.current?.controller.abort();
      active.current = null;
    },
    [],
  );

  async function start(
    next: ActiveCheck,
    parallel: number,
    timeout: number,
    onComplete: (run: ActiveCheck, stopped: boolean) => void,
  ) {
    if (active.current) {
      return;
    }

    active.current = next;
    setRun(next);
    setRunning(true);
    setFinished(null);
    await checkCases(next, parallel, timeout, (result) =>
      setRun({ ...next, ...result }),
    );

    if (active.current !== next) {
      return;
    }

    active.current = null;
    const stopped = next.controller.signal.aborted;

    onComplete(next, stopped);
    setRun({ ...next, results: [...next.results], errors: [...next.errors] });
    setRunning(false);
    setFinished({ stopped, at: new Date().toISOString() });
  }

  function view(next: CheckRun, finished: FinishedCheck) {
    if (active.current) {
      return;
    }

    setRun(next);
    setFinished(finished);
  }

  function remove(id: string) {
    setRun((previous) => {
      if (!previous || previous.id === id) {
        return null;
      }

      return { ...previous, baseline: undefined };
    });

    if (run?.id === id) {
      setFinished(null);
    }
  }

  function resetBaseline(baseline?: Baseline) {
    setRun((previous) => (previous ? { ...previous, baseline } : null));
  }

  return {
    run,
    running,
    finished,
    start,
    view,
    remove,
    resetBaseline,
    stop: () => active.current?.controller.abort(),
  };
}
