/**
 * Transition record schema: type and parse (fail-closed).
 * A record captures the minimal committed information of one phase transition.
 * No progress ledger fields (rate, completion, backlog) are allowed.
 */
export interface TransitionRecord {
  /** Idempotency key. The same request re-run detects this key and never re-records. */
  readonly key: string;
  /** Work scope identifier. Guards against writing into a different scope. */
  readonly scope: string;
  /** Phase recorded as completed (becomes a past phase). */
  readonly fromPhase: string;
  /** Resolved successor phase chosen by the user. */
  readonly toPhase: string;
  /** ISO8601 timestamp of the recording. */
  readonly recordedAt: string;
}

export type ParseResult =
  | { ok: true; record: TransitionRecord }
  | { ok: false; reason: string };

const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/** Parse an unknown value into a TransitionRecord. Fail-closed: invalid input never becomes a record. */
export function parseTransitionRecord(value: unknown): ParseResult {
  if (typeof value !== "object" || value === null) {
    return { ok: false, reason: "record must be a JSON object" };
  }
  const raw = value as Record<string, unknown>;
  if (!isNonEmptyString(raw["key"])) return { ok: false, reason: "key is required (non-empty string)" };
  if (!isNonEmptyString(raw["scope"])) return { ok: false, reason: "scope is required (non-empty string)" };
  if (!isNonEmptyString(raw["fromPhase"])) return { ok: false, reason: "fromPhase is required (non-empty string)" };
  if (!isNonEmptyString(raw["toPhase"])) return { ok: false, reason: "toPhase is required (non-empty string)" };
  if (!isNonEmptyString(raw["recordedAt"]) || !iso8601Pattern.test(raw["recordedAt"])) {
    return { ok: false, reason: "recordedAt is required (ISO8601 string)" };
  }
  const extraKeys = Object.keys(raw).filter(
    (k) => k !== "key" && k !== "scope" && k !== "fromPhase" && k !== "toPhase" && k !== "recordedAt",
  );
  if (extraKeys.length > 0) {
    return { ok: false, reason: `unknown fields are not allowed: ${extraKeys.join(", ")}` };
  }
  return {
    ok: true,
    record: {
      key: raw["key"],
      scope: raw["scope"],
      fromPhase: raw["fromPhase"],
      toPhase: raw["toPhase"],
      recordedAt: raw["recordedAt"],
    },
  };
}
