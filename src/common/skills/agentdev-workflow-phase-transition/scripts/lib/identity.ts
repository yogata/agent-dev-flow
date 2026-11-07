/**
 * Identity (現在工程の識別状態, .agentdev/phase/identity.yaml) parsing and
 * consistency check against a recorded transition. The identity file is a
 * read-side check target for consistency verification: this module never writes it.
 */
import { readFile } from "node:fs/promises";

export interface PhaseIdentity {
  readonly undertaking: string;
  readonly currentPhase: string;
}

export type IdentityCheckResult =
  | { ok: true; undertaking: "match"; currentPhase: "match-toPhase" | "match-fromPhase" }
  | { ok: false; reasons: string[] };

/** Parse the flat `key: value` identity YAML. Unknown keys are ignored; quoted values are unquoted. */
export function parseIdentity(text: string): PhaseIdentity {
  let undertaking = "";
  let currentPhase = "";
  for (const rawLine of text.split(/\r?\n/)) {
    const match = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(rawLine.trim());
    if (match === null) {
      continue;
    }
    const value = unquote((match[2] ?? "").trim());
    if (match[1] === "undertaking") {
      undertaking = value;
    } else if (match[1] === "current_phase") {
      currentPhase = value;
    }
  }
  return { undertaking, currentPhase };
}

function unquote(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"') && value.length >= 2) || (value.startsWith("'") && value.endsWith("'") && value.length >= 2)) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Compare the identity against a recorded transition. Exact string equality
 * only: no normalization, no prefix/label matching, no auto-resolution — a
 * mismatch is a hold, and resolving the conflict is the user's judgment.
 * - undertaking must equal the recorded scope (an empty undertaking cannot
 *   confirm the same undertaking and is reported, never treated as a match).
 * - current_phase legitimately equals toPhase right after a transition, or
 *   fromPhase while the next phase is not yet finalized; a terminal record
 *   (toPhase null) can only match fromPhase. Anything else is a mismatch.
 */
export function checkIdentityAgainstRecord(identity: PhaseIdentity, record: { scope: string; fromPhase: string; toPhase: string | null }): IdentityCheckResult {
  const reasons: string[] = [];
  if (identity.undertaking.length === 0) {
    reasons.push("identity undertaking is empty; the same undertaking as the recorded scope cannot be confirmed");
  } else if (identity.undertaking !== record.scope) {
    reasons.push(`identity undertaking (${identity.undertaking}) differs from the recorded transition scope (${record.scope}); resolving the difference is the user's judgment, not an automatic resolution`);
  }
  const phaseCandidates = record.toPhase === null ? [record.fromPhase] : [record.fromPhase, record.toPhase];
  if (!phaseCandidates.includes(identity.currentPhase)) {
    reasons.push(`identity current_phase (${identity.currentPhase}) matches neither the recorded fromPhase (${record.fromPhase}) nor toPhase (${record.toPhase === null ? "null (terminal)" : record.toPhase})`);
  }
  if (reasons.length > 0) {
    return { ok: false, reasons };
  }
  return {
    ok: true,
    undertaking: "match",
    currentPhase: identity.currentPhase === record.toPhase ? "match-toPhase" : "match-fromPhase",
  };
}

/** Read and parse the identity file. Read failures propagate to the caller (unverifiable state, never a pass). */
export async function readIdentity(path: string): Promise<PhaseIdentity> {
  const text = await readFile(path, "utf8");
  return parseIdentity(text);
}
