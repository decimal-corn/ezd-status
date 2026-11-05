import { useState } from "react";

import { deleteRun, emptyLog } from "../lib/history.ts";
import { loadLog, LOG_KEY, saveLog } from "../lib/storage.ts";
import type { HistoryLog } from "../types/index.ts";

export function useHistory() {
  const [stored, setStored] = useState(() =>
    loadLog({ getItem: (key) => window.localStorage.getItem(key) }),
  );
  const [deleted, setDeleted] = useState<HistoryLog | null>(null);

  function persist(log: HistoryLog) {
    setStored(saveLog(log));
  }

  function remove(id: string) {
    setDeleted(stored.log);
    const log = deleteRun(stored.log, id);

    persist(log);

    return log;
  }

  function undo() {
    if (!deleted) {
      return;
    }

    persist(deleted);
    setDeleted(null);
  }

  function clear(): boolean {
    if (!window.confirm("Delete all check history from this browser?")) {
      return false;
    }

    try {
      window.localStorage.removeItem(LOG_KEY);
    } catch {
      setStored((previous) => ({
        ...previous,
        notice: "Could not clear browser storage.",
      }));

      return false;
    }

    setDeleted(null);
    setStored({
      log: emptyLog(),
      notice: "History cleared. The next check will establish a new baseline.",
    });

    return true;
  }

  return {
    ...stored,
    persist,
    remove,
    undo,
    clear,
    canUndo: deleted !== null,
    discardUndo: () => setDeleted(null),
  };
}
