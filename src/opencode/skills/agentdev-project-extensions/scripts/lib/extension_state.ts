/**
 * Shared Project Extensions load-time state machine (distribution side).
 *
 * Canonical contract: docs/designs/foundations/project-extensions.md
 * "YAML 解析と構造検証の実装契約" (REQ-044, DEC-019).
 *
 * - YAML syntax parsing is delegated to Bun.YAML.parse. Parse exceptions
 *   are converted into ADF states (malformed); they never crash runtime
 *   processing directly.
 * - Structural validation is delegated to Zod (structure only): version,
 *   kind, id, context, rules, checks, acceptance_gates, must_not and the
 *   array element shapes. Zod owns no state semantics.
 * - State classification (missing / malformed / migration-required /
 *   schema-violation / valid) and the old-kind / unknown-kind judgment
 *   stay on the ADF side (this module). The official kind enum is owned
 *   by the Project Extensions Design ("Extension kind enum（公式）").
 * - Guaranteed YAML feature scope: mappings, arrays, strings, numbers,
 *   booleans, null, nesting, plain quoted strings. Anchors, aliases,
 *   custom tags and multiple documents are NOT guaranteed.
 *
 * This module is the distribution-side base implementation shared by the
 * runtime resolver contract and the repo-local deterministic checker
 * (check_extensions.ts). It must not depend on repo-local artifacts.
 */

import { z } from "zod";

export type ExtensionKind =
  | "workflow-extension"
  | "internal-workflow-extension"
  | "capability-skill-extension";

export const NEW_EXTENSION_KINDS: readonly ExtensionKind[] = [
  "workflow-extension",
  "internal-workflow-extension",
  "capability-skill-extension",
];

export const LEGACY_EXTENSION_KINDS: readonly string[] = [
  "command-extension",
  "skill-extension",
];

export type ExtensionResolution =
  | { state: "missing" }
  | { state: "malformed"; reasons: string[] }
  | { state: "migration-required"; kind: string }
  | { state: "schema-violation"; kind: string }
  | { state: "valid"; kind: ExtensionKind };

// ---------------------------------------------------------------------------
// YAML syntax parsing (Bun.YAML delegation)
// ---------------------------------------------------------------------------

export type ExtensionYamlResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

/**
 * Delegates YAML syntax parsing to Bun.YAML.parse and converts exceptions
 * into a value so callers classify them as malformed instead of crashing.
 */
export function parseExtensionYaml(text: string): ExtensionYamlResult {
  try {
    return { ok: true, data: Bun.YAML.parse(text) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message.split("\n")[0] ?? message };
  }
}

// ---------------------------------------------------------------------------
// Zod structural schemas (structure only; no state semantics)
// ---------------------------------------------------------------------------

const ExtensionDocumentSchema = z.object({
  // Legacy acceptance: both the YAML number 1 and the quoted string "1"
  // pass, mirroring the pre-migration String(version) === "1" check.
  version: z.union([z.literal(1), z.literal("1")]),
  // kind is validated as a non-empty string here; the legacy / unknown /
  // official-3-value judgment is ADF-side state semantics.
  kind: z.string().min(1),
  id: z.string().min(1),
  context: z.array(z.unknown()),
  rules: z.array(z.unknown()),
  checks: z.array(z.unknown()),
  acceptance_gates: z.array(z.unknown()),
  must_not: z.array(z.unknown()),
});

const ContextEntrySchema = z.object({
  id: z.string(),
  when: z.string().optional(),
  paths: z.array(z.string()).optional(),
  purpose: z.string().optional(),
});

const DelegatedEntrySchema = z.object({
  id: z.string(),
  when: z.string().optional(),
  skill: z.string().optional(),
});

const ExtensionEntriesSchema = z.object({
  context: z.array(ContextEntrySchema),
  rules: z.array(DelegatedEntrySchema),
  checks: z.array(DelegatedEntrySchema),
  acceptance_gates: z.array(z.string()),
  must_not: z.array(z.string()),
});

const REQUIRED_KEYS = [
  "version",
  "kind",
  "id",
  "context",
  "rules",
  "checks",
  "acceptance_gates",
  "must_not",
] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Rebuilds the pre-migration malformed reason wording from a failed key so
 * existing checker failure messages (and their baseline keys) stay stable.
 */
function malformedReasonFor(key: string, value: unknown): string {
  if (key === "version") {
    return `required field 'version' must be 1 (got: ${value})`;
  }
  if (key === "kind" || key === "id") {
    return `required field '${key}' is missing or not a string`;
  }
  if (value === undefined || value === null) {
    return `required section '${key}' is missing (use an empty array if no entries)`;
  }
  return `required section '${key}' must be an array`;
}

function buildMalformedReasons(data: unknown, failedKeys: Set<string>): string[] {
  const record = isPlainObject(data) ? data : {};
  const targets =
    failedKeys.size > 0
      ? REQUIRED_KEYS.filter((key) => failedKeys.has(key))
      : [...REQUIRED_KEYS];
  return targets.map((key) => malformedReasonFor(key, record[key]));
}

// ---------------------------------------------------------------------------
// Load-time state machine (ADF-side semantics; shared implementation)
// ---------------------------------------------------------------------------

/**
 * Load-time state classification shared by the runtime resolver contract
 * and the deterministic checker (UC-001 case 1). Judgment order matters:
 * required field problems (malformed, fail-open at runtime) are judged
 * before the kind value; legacy and unknown kinds are only classified
 * once every required field is structurally present. Bun.YAML.parse
 * exceptions and structural violations are converted into malformed
 * instead of crashing the caller.
 */
export function resolveExtensionState(rawText: string | null): ExtensionResolution {
  if (rawText === null) return { state: "missing" };
  const parsed = parseExtensionYaml(rawText);
  if (!parsed.ok) {
    return { state: "malformed", reasons: [`YAML syntax error: ${parsed.error}`] };
  }
  const result = ExtensionDocumentSchema.safeParse(parsed.data);
  if (!result.success) {
    const failedKeys = new Set<string>();
    for (const issue of result.error.issues) {
      const head = issue.path[0];
      if (typeof head === "string") failedKeys.add(head);
    }
    return {
      state: "malformed",
      reasons: buildMalformedReasons(parsed.data, failedKeys),
    };
  }
  const kind = result.data.kind;
  if (LEGACY_EXTENSION_KINDS.includes(kind)) {
    return { state: "migration-required", kind };
  }
  if (!NEW_EXTENSION_KINDS.includes(kind as ExtensionKind)) {
    return { state: "schema-violation", kind };
  }
  return { state: "valid", kind: kind as ExtensionKind };
}

// ---------------------------------------------------------------------------
// Entry structure validation (deterministic checker support, check #11)
// ---------------------------------------------------------------------------

function entryFieldShape(field: string): string {
  if (field === "paths") return "an array of strings";
  return "a string";
}

/**
 * Structural validation of the five section entries (the deterministic
 * checker's extension-structure check). Returns violation messages in the
 * legacy checker wording. Which failure classification these map to
 * (malformed) stays with the checker: Zod owns structure only.
 */
export function validateExtensionEntries(data: unknown): string[] {
  const result = ExtensionEntriesSchema.safeParse(data);
  if (result.success) return [];
  const messages: string[] = [];
  for (const issue of result.error.issues) {
    const [head, index, field] = issue.path;
    if (typeof head === "string" && typeof index === "number") {
      if (field === undefined) {
        if (head === "acceptance_gates" || head === "must_not") {
          messages.push(`${head}[${index}] must be a string`);
        } else {
          messages.push(`${head}[${index}] must be an object`);
        }
      } else if (field === "id") {
        messages.push(`${head}[${index}] missing 'id' string`);
      } else {
        messages.push(
          `${head}[${index}] field '${String(field)}' must be ${entryFieldShape(String(field))}`,
        );
      }
    } else if (typeof head === "string") {
      messages.push(`section '${head}' has invalid structure (${issue.message})`);
    } else {
      messages.push(`extension entries have invalid structure (${issue.message})`);
    }
  }
  return messages;
}
