import {
  CASE_DEPARTMENT,
  CASE_TYPES,
  CASE_YEARS,
  DEFAULT_CASE_SELECTION,
} from "../constants/cases.ts";
import type {
  CaseInfo,
  CaseRange,
  CaseReference,
  CaseSelection,
  CaseStatus,
} from "../types/index.ts";

export const ENDPOINT = "https://app.malopolska.uw.gov.pl/ws/ezd/checkstatus";

export function parseCase(
  value: string,
  selection: CaseSelection = DEFAULT_CASE_SELECTION,
): CaseReference {
  if (!/^[0-9]+$/.test(value.trim())) {
    throw new Error(
      "Enter a positive whole case number, without letters, dots or symbols.",
    );
  }

  const number = Number(value);

  if (
    !Number.isSafeInteger(number) ||
    number < 1 ||
    number > Number.MAX_SAFE_INTEGER - 105
  ) {
    throw new Error("The case number is outside the supported range.");
  }

  if (!CASE_YEARS.some((year) => year === selection.year)) {
    throw new Error("Choose a supported case year.");
  }

  if (!CASE_TYPES.some((type) => type.code === selection.caseType)) {
    throw new Error("Choose a supported case type.");
  }

  const reference = { department: CASE_DEPARTMENT, ...selection };

  return { ...reference, number, full: caseAt(number, reference) };
}

export function caseAt(
  number: number,
  reference: Pick<CaseReference, "department" | "caseType" | "year">,
): string {
  return `${reference.department}.${reference.caseType}.${number}.${reference.year}`;
}

export function parseReference(full: string): CaseReference {
  const match = /^([A-Za-z0-9-]+)\.([0-9]+)\.([0-9]+)\.([0-9]{4})$/.exec(full);

  if (!match) {
    throw new Error("Invalid saved case reference.");
  }

  const [, department, caseType, value, year] = match;
  const number = Number(value);

  if (!Number.isSafeInteger(number) || number < 1) {
    throw new Error("Invalid saved case number.");
  }

  return { department, caseType, year, number, full };
}

export function bounds(c: CaseInfo, shift = 0): CaseRange {
  const start = Math.max(1, c.number - 49 + shift);

  return { start, end: start + 99 };
}

export function numbersFor(c: CaseInfo, range: CaseRange): number[] {
  return [
    c.number,
    ...Array.from({ length: 100 }, (_, i) => range.start + i).filter(
      (n) => n !== c.number,
    ),
  ];
}

export function urlFor(full: string, callback = "jsonp_callback") {
  const url = new URL(ENDPOINT);

  url.searchParams.set("callback", callback);
  url.searchParams.set("numer", full);

  return url.href;
}

export const inProgress = (data: CaseStatus) =>
  data.Response === "w trakcie realizacji" &&
  data.StatusCode === 200 &&
  data.StatusEzd === 2;

export const statusKey = (data: CaseStatus) =>
  JSON.stringify(
    (["Response", "StatusCode", "StatusEzd"] as const).map((k) => [
      Object.hasOwn(data, k),
      data[k],
    ]),
  );

export function validData(value: unknown): value is CaseStatus {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const data = value as Record<string, unknown>;

  if (typeof data.Response !== "string" && data.Response !== null) {
    return false;
  }

  return ["StatusCode", "StatusEzd"].every(
    (key) =>
      !(key in data) ||
      data[key] === null ||
      ["string", "number", "boolean"].includes(typeof data[key]),
  );
}

export const labelStatus = (data: CaseStatus) =>
  data.Response ??
  (data.StatusCode === 404 ? "Case not found" : "No status provided");

export const codes = (data: CaseStatus) =>
  `StatusCode: ${data.StatusCode ?? "—"} · StatusEzd: ${data.StatusEzd ?? "—"}`;

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleString("en-GB");
