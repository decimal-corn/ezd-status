import type { CaseSelection, CaseTypeDefinition } from "../types/index.ts";

export const CASE_YEARS = ["2026", "2027"] as const;

export const CASE_DEPARTMENT = "WO-I";

export const DEFAULT_CASE_SELECTION = {
  year: "2026",
  caseType: "6121",
} as const satisfies CaseSelection;

// JRWA citizenship section. These are classification codes, not a list returned
// by the Małopolska status endpoint. Availability of individual cases can vary.
export const CASE_TYPES = [
  {
    code: "6120",
    label: "Citizenship grants and changes",
    description:
      "Proceedings concerning the granting or change of Polish citizenship.",
    originalLabel: "Nadawanie i zmiana obywatelstwa",
  },
  {
    code: "6121",
    label: "Citizenship proceedings before the Voivode",
    description:
      "Acquisition or loss of Polish citizenship in proceedings before the Voivode, including recognition as a Polish citizen.",
    originalLabel:
      "Nabycie lub utrata obywatelstwa polskiego w drodze postępowania przed Wojewodą",
  },
  {
    code: "6122",
    label: "Confirmation of citizenship",
    description: "Confirmation of possession or loss of Polish citizenship.",
    originalLabel: "Stwierdzanie posiadania lub utraty obywatelstwa polskiego",
  },
  {
    code: "6123",
    label: "Renunciation of citizenship",
    description: "Proceedings concerning renunciation of Polish citizenship.",
    originalLabel: "Zrzeczenie się obywatelstwa polskiego",
  },
] as const satisfies readonly CaseTypeDefinition[];

// Published classification table, section 612, p. 26. This is a national JRWA
// cross-reference, not confirmation that Małopolska exposes every class online.
export const CASE_TYPES_SOURCE = {
  url: "https://www.gov.pl/attachment/128ef27f-878d-4897-be78-78856e7a76f3#page=26",
  title: "JRWA citizenship classification (2026, section 612)",
};
