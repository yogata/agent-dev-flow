// ADF-COVERS(implementation): REQ-047-009
// Loader for the canonical command format detection rules
// (data/command-format-rules.yaml).
//
// Per REQ-047-009 and the declarative data loading principle
// (checker-execution-contracts.md, ACT-DESIGN-007) the YAML is the single
// source of truth for detection signals; the checker must not duplicate
// rule constants in code. Missing or malformed YAML is fail-closed:
// loading throws and the checker stops without running the scan.
//
// Output-facing strings (rule names, descriptions, severities) stay in
// check_command_format.ts; only the detection signals (regex/pattern
// sources, scan dirs, exemption hints) are loaded from the YAML so the
// docs-check output contract is unchanged (REQ-047-005).

import * as path from "path";
import * as fs from "fs";

export const COMMAND_FORMAT_RULES_REL_PATH = path.join(
  ".opencode",
  "skills",
  "repo-agentdev-integrity",
  "data",
  "command-format-rules.yaml",
);

export interface CommandFormatRules {
  /** Command directories scanned by the checker (repoRoot-relative, slash-separated). */
  readonly scanDirs: readonly string[];
  /** IR-028 forbidden top-level Step heading regex. */
  readonly ir028ForbiddenHeading: RegExp;
  /** IR-029 forbidden alphabet substep regex. */
  readonly ir029ForbiddenSubstep: RegExp;
  /** IR-030 forbidden unconditional verbatim patterns. */
  readonly ir030ForbiddenPatterns: readonly RegExp[];
  /** IR-030 exemption hints; a line containing any hint is skipped. */
  readonly ir030ExemptionHints: readonly string[];
  /** IR-031 forbidden primary Findings heading regexes. */
  readonly ir031ForbiddenPrimaryHeadings: readonly RegExp[];
}

function findRepoRoot(startDir: string): string {
  let current = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(current, ".git"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return current;
    current = parent;
  }
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(
      `fail-closed: ${COMMAND_FORMAT_RULES_REL_PATH}: '${label}' must be a non-empty string`,
    );
  }
  return value;
}

function requireObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(
      `fail-closed: ${COMMAND_FORMAT_RULES_REL_PATH}: '${label}' must be a mapping`,
    );
  }
  return value as Record<string, unknown>;
}

function requireStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(
      `fail-closed: ${COMMAND_FORMAT_RULES_REL_PATH}: '${label}' must be a non-empty array`,
    );
  }
  return value.map((v) => {
    if (typeof v !== "string" || v.length === 0) {
      throw new Error(
        `fail-closed: ${COMMAND_FORMAT_RULES_REL_PATH}: '${label}' must hold non-empty strings`,
      );
    }
    return v;
  });
}

function compileRegex(source: string, label: string): RegExp {
  try {
    return new RegExp(source);
  } catch {
    throw new Error(
      `fail-closed: ${COMMAND_FORMAT_RULES_REL_PATH}: '${label}' does not compile as a regex: ${source}`,
    );
  }
}

export function loadCommandFormatRules(explicitRoot?: string): CommandFormatRules {
  const repoRoot = findRepoRoot(explicitRoot ?? process.cwd());
  const yamlPath = path.join(repoRoot, COMMAND_FORMAT_RULES_REL_PATH);
  let text: string;
  try {
    text = fs.readFileSync(yamlPath, "utf-8");
  } catch {
    throw new Error(
      `fail-closed: command format rules file is missing (${COMMAND_FORMAT_RULES_REL_PATH})`,
    );
  }
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(text);
  } catch {
    throw new Error(
      `fail-closed: command format rules file is not valid YAML (${COMMAND_FORMAT_RULES_REL_PATH})`,
    );
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(
      `fail-closed: command format rules file has an unexpected structure (${COMMAND_FORMAT_RULES_REL_PATH})`,
    );
  }
  const root = parsed as Record<string, unknown>;

  const topLevel = requireObject(
    root.top_level_step_rules,
    "top_level_step_rules",
  );
  const scanDirs = requireStringArray(topLevel.scan_dirs, "top_level_step_rules.scan_dirs");
  const ir028Source = requireString(
    topLevel.forbidden_heading_regex,
    "top_level_step_rules.forbidden_heading_regex",
  );

  const alphabet = requireObject(
    root.alphabet_substep_rules,
    "alphabet_substep_rules",
  );
  const ir029Source = requireString(
    alphabet.forbidden_substep_regex,
    "alphabet_substep_rules.forbidden_substep_regex",
  );

  const verbatim = requireObject(
    root.subagent_verbatim_rules,
    "subagent_verbatim_rules",
  );
  const ir030Patterns = requireStringArray(
    verbatim.forbidden_unconditional_patterns,
    "subagent_verbatim_rules.forbidden_unconditional_patterns",
  ).map((p) => compileRegex(p, "subagent_verbatim_rules.forbidden_unconditional_patterns"));
  const ir030Hints = requireStringArray(
    verbatim.exemption_hints,
    "subagent_verbatim_rules.exemption_hints",
  );

  const findings = requireObject(
    root.findings_capture_heading_rules,
    "findings_capture_heading_rules",
  );
  const ir031Headings = requireStringArray(
    findings.forbidden_primary_headings,
    "findings_capture_heading_rules.forbidden_primary_headings",
  ).map((p) => compileRegex(p, "findings_capture_heading_rules.forbidden_primary_headings"));

  return {
    scanDirs,
    ir028ForbiddenHeading: compileRegex(
      ir028Source,
      "top_level_step_rules.forbidden_heading_regex",
    ),
    ir029ForbiddenSubstep: compileRegex(
      ir029Source,
      "alphabet_substep_rules.forbidden_substep_regex",
    ),
    ir030ForbiddenPatterns: ir030Patterns,
    ir030ExemptionHints: ir030Hints,
    ir031ForbiddenPrimaryHeadings: ir031Headings,
  };
}
