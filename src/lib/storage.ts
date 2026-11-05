import type {
  CaseError,
  CaseResult,
  HistoryLog,
  KnownStatus,
  StatusChange,
} from "../types/index.ts";
import { parseReference, validData } from "./cases.ts";
import { emptyLog } from "./history.ts";

export const LOG_KEY = "ezd-status-history-v1";

export const storageMessage =
  "History is stored only in this browser: the last 100 checks and the latest status of each case.";

export interface StoredHistory {
  log: HistoryLog;
  notice: string;
}

type HistoryStorage = Pick<Storage, "getItem">;
const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));
const isKnownStatus = (value: unknown): value is KnownStatus =>
  isObject(value) && validData(value.data) && typeof value.at === "string";
const isResult = (value: unknown): value is CaseResult =>
  isObject(value) &&
  typeof value.number === "number" &&
  Number.isSafeInteger(value.number) &&
  typeof value.full === "string" &&
  isKnownStatus(value);
const isError = (value: unknown): value is CaseError =>
  isObject(value) &&
  typeof value.number === "number" &&
  typeof value.full === "string" &&
  typeof value.message === "string";
const isChange = (value: unknown): value is StatusChange =>
  isObject(value) &&
  typeof value.full === "string" &&
  typeof value.number === "number" &&
  typeof value.at === "string" &&
  validData(value.before) &&
  validData(value.after) &&
  typeof value.previousAt === "string";

export function loadLog(storage: HistoryStorage): StoredHistory {
  try {
    const raw = storage.getItem(LOG_KEY);

    if (!raw) {
      return { log: emptyLog(), notice: storageMessage };
    }

    const value: unknown = JSON.parse(raw);

    if (
      !isObject(value) ||
      value.version !== 1 ||
      !isObject(value.last) ||
      !Object.values(value.last).every(isKnownStatus) ||
      !Array.isArray(value.runs)
    ) {
      throw new Error("Invalid history");
    }

    const runs = value.runs.map((run: unknown, index: number) => {
      if (
        !isObject(run) ||
        typeof run.at !== "string" ||
        typeof run.main !== "string" ||
        typeof run.start !== "number" ||
        typeof run.end !== "number" ||
        typeof run.stopped !== "boolean" ||
        !Array.isArray(run.results) ||
        !run.results.every(isResult) ||
        !Array.isArray(run.errors) ||
        !run.errors.every(isError) ||
        !Array.isArray(run.changes) ||
        !run.changes.every(isChange)
      ) {
        throw new Error("Invalid history record");
      }

      parseReference(run.main);

      return {
        id:
          typeof run.id === "string" && run.id
            ? run.id
            : `legacy-${index}-${run.at}`,
        at: run.at,
        main: run.main,
        start: run.start,
        end: run.end,
        stopped: run.stopped,
        results: run.results,
        errors: run.errors,
        changes: run.changes,
      };
    });

    return {
      log: { version: 1, last: value.last as HistoryLog["last"], runs },
      notice: storageMessage,
    };
  } catch {
    return {
      log: emptyLog(),
      notice:
        "Could not read browser storage. History is available in this tab only; export JSON to keep it.",
    };
  }
}

export function saveLog(log: HistoryLog): StoredHistory {
  try {
    window.localStorage.setItem(LOG_KEY, JSON.stringify(log));

    return { log, notice: storageMessage };
  } catch {
    return {
      log,
      notice:
        "Could not save history in this browser. Export JSON to keep the history from this tab.",
    };
  }
}
