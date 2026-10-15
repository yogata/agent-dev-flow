// 検証専用。必要検証と定義行は独立した入力で与え、配布契約の schema にはしない。
export interface Obligation {
  readonly id: string;
  readonly mandatory: boolean;
  readonly requirementRows: readonly string[];
  readonly requiredChecks: readonly string[];
}

export interface MappingEntry {
  readonly obligationId: string;
  readonly reqRow: string;
  readonly execUnit: string | null;
}

export interface VerificationResult {
  readonly obligationId: string;
  readonly reqRow: string;
  readonly execUnit: string;
  readonly kind: string;
  readonly passed: boolean;
}

export interface CompletionInput {
  readonly obligations: readonly Obligation[];
  readonly mapping: readonly MappingEntry[];
  readonly verifications: readonly VerificationResult[];
}

export function judgeCompletion(input: CompletionInput) {
  const missingObligations = new Set<string>();
  const missingVerifications = new Set<string>();
  const invalidMappings: MappingEntry[] = [];
  const seen = new Set<string>();
  for (const entry of input.mapping) {
    const obligation = input.obligations.find((item) => item.id === entry.obligationId);
    const key = JSON.stringify([entry.obligationId, entry.reqRow, entry.execUnit]);
    if (!obligation || !obligation.requirementRows.includes(entry.reqRow) || seen.has(key)) {
      invalidMappings.push(entry);
    }
    seen.add(key);
  }
  for (const obligation of input.obligations) {
    if (!obligation.mandatory) continue;
    const entries = input.mapping.filter((entry) => entry.obligationId === obligation.id);
    if (entries.length === 0 || obligation.requirementRows.length === 0 ||
        entries.some((entry) => !entry.reqRow || entry.execUnit === null) ||
        obligation.requirementRows.some((row) => !entries.some((entry) => entry.reqRow === row))) {
      missingObligations.add(obligation.id);
    }
    if (obligation.requiredChecks.length === 0) missingVerifications.add(obligation.id);
    for (const entry of entries) {
      for (const kind of obligation.requiredChecks) {
        const evidence = input.verifications.filter((result) =>
          result.obligationId === obligation.id && result.reqRow === entry.reqRow &&
          result.execUnit === entry.execUnit && result.kind === kind);
        if (evidence.length === 0 || evidence.some((result) => !result.passed)) {
          missingVerifications.add(obligation.id);
        }
      }
    }
  }
  return {
    completed: missingObligations.size === 0 && missingVerifications.size === 0 && invalidMappings.length === 0,
    missingObligations: [...missingObligations],
    missingVerifications: [...missingVerifications],
    invalidMappings,
  };
}
