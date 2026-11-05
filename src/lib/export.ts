import type { HistoryLog } from "../types/index.ts";

export function exportLog(log: HistoryLog): void {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(log, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");

  a.href = url;
  a.download = `ezd-log-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
