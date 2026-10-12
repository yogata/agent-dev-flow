/**
 * Successor resolution: deterministic 0/1/many discrimination over known successor
 * candidates taken from adopted phase relations. Never invents a phase: an empty
 * candidate list resolves to terminal, many candidates stay ambiguous for user choice.
 */
export type SuccessorResolution =
  | { kind: "terminal" }
  | { kind: "unique"; successor: string }
  | { kind: "ambiguous"; candidates: readonly string[] };

export type SuccessorParseResult =
  | { ok: true; candidates: readonly string[] }
  | { ok: false; reason: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/** Parse the CLI input carrying successor candidates. Fail-closed on malformed input. */
export function parseSuccessorInput(value: unknown): SuccessorParseResult {
  if (typeof value !== "object" || value === null) {
    return { ok: false, reason: "input must be a JSON object with a candidates array" };
  }
  const raw = value as Record<string, unknown>;
  if (!Array.isArray(raw["candidates"])) {
    return { ok: false, reason: "candidates is required (array of non-empty strings)" };
  }
  for (const candidate of raw["candidates"]) {
    if (!isNonEmptyString(candidate)) {
      return { ok: false, reason: "candidates must contain only non-empty strings" };
    }
  }
  return { ok: true, candidates: [...new Set(raw["candidates"])] };
}

/**
 * Resolve successor candidates. 0 -> terminal, 1 -> unique, 2+ -> ambiguous.
 * No candidate is ever synthesized; the resolution only reflects the input.
 */
export function resolveSuccessor(candidates: readonly string[]): SuccessorResolution {
  if (candidates.length === 0) return { kind: "terminal" };
  if (candidates.length === 1) return { kind: "unique", successor: candidates[0] as string };
  return { kind: "ambiguous", candidates };
}
