export interface CaseInfo {
  number: number;
  full: string;
}

export interface CaseSelection {
  year: string;
  caseType: string;
}

export interface CaseReference extends CaseInfo, CaseSelection {
  department: string;
}

export interface CaseTypeDefinition {
  code: string;
  label: string;
  description: string;
  originalLabel: string;
}

export interface CaseRange {
  start: number;
  end: number;
}

export interface CaseStatus {
  Response: string | null;
  StatusCode?: string | number | boolean | null;
  StatusEzd?: string | number | boolean | null;
}

export interface CaseResult extends CaseInfo {
  data: CaseStatus;
  at: string;
}

export interface CaseError extends CaseInfo {
  message: string;
}

export interface KnownStatus {
  data: CaseStatus;
  at: string;
}

export type Baseline = Record<string, KnownStatus>;

export interface StatusChange extends CaseInfo {
  at: string;
  before: CaseStatus;
  after: CaseStatus;
  previousAt: string;
}

export interface ComparisonInput {
  results: CaseResult[];
  baseline: Baseline;
}

export interface CheckRun {
  id: string;
  case: CaseReference;
  bounds: CaseRange;
  shift: number;
  results: CaseResult[];
  errors: CaseError[];
  baseline?: Baseline;
}

export interface ActiveCheck extends CheckRun {
  baseline: Baseline;
  controller: AbortController;
}

export interface ComparedCheck extends CheckRun {
  baseline: Baseline;
}

export interface HistoryRecord {
  id: string;
  at: string;
  main: string;
  start: number;
  end: number;
  stopped: boolean;
  results: CaseResult[];
  errors: CaseError[];
  changes: StatusChange[];
}

export interface HistoryLog {
  version: 1;
  last: Baseline;
  runs: HistoryRecord[];
}

export interface FinishedCheck {
  stopped: boolean;
  at: string;
}

export interface CheckSettings extends CaseSelection {
  caseNumber: string;
  parallel: string;
  timeout: string;
  randomize: boolean;
}
