/**
 * Workflow preventive checker (AG-008, OU-007 / Issue #2107).
 *
 * 7 machine-checkable preventive items guarding the thin Command model
 * (DEC-010) and the 3-kind extension era (DEC-012):
 *
 *   1. workflow-dispatch-presence       every public command references its
 *                                       dedicated Workflow Skill by name
 *   2. dispatch-target-existence        the dedicated Workflow Skill exists
 *   3. workflow-soft-guard              each command-bound Workflow Skill
 *                                       description declares the AG-004
 *                                       concise trigger item (単独起動)
 *   4. legacy-extension-residual        legacy kinds and the legacy runtime
 *                                       path must not remain (extension tree
 *                                       + distribution bodies under src/)
 *   5. internal-reference-direct-dep    command bodies must not reference
 *                                       specific skill-internal reference files
 *   6. classification-kind-consistency  extension kinds align with the
 *                                       deterministic Workflow/Capability
 *                                       classification
 *   7. command-format-thin-consistency  command-format rules must not mandate
 *                                       procedure sections or forbid the
 *                                       workflow dispatch structure
 *
 * Semantic duplication detection stays with /agentdev/inspect-skills and the
 * command-file-format Design "thin Command モデル検査" scope note: this checker
 * only enforces structurally decidable invariants (AG-008).
 *
 * Structured exemptions (AG-008 false-positive records, kept here so future
 * checker false positives are self-documenting):
 *   - check 4: *.test.ts fixtures that intentionally build the legacy path to
 *     validate containment detection (agentdev-artifact-graph containment
 *     tests)
 *   - check 4: abolition-declaration lines (lines mentioning the legacy path
 *     together with 廃止 / 後方互換で読まない / migration-required declare the
 *     abolition itself; agentdev-project-extensions SKILL.md)
 *   - check 5: generic "`references/` 配下を参照" declarations that name no
 *     specific file (they assert name-level non-dependence, REQ-002-017)
 *   - scan scope: docs/** historical records (superseded Designs, DEC-005,
 *     IR-056 detection-scope declarations) are intentionally not scanned;
 *     docs semantics stay with inspect-docs / inspect-skills
 */

import * as fs from "fs";
import * as path from "path";
import { deriveSkillClassification } from "./check_extensions.ts";

export interface PreventiveFailure {
  check: number;
  check_name: string;
  severity: "strict" | "warning";
  classification: "existence" | "consistency" | "residual" | "format";
  file?: string;
  line?: number;
  message: string;
}

export interface PreventiveCheckSummary {
  item: number;
  name: string;
  pass: boolean;
}

export interface PreventiveExemption {
  area: string;
  description: string;
}

export interface PreventiveReport {
  ok: boolean;
  checks: PreventiveCheckSummary[];
  failures: PreventiveFailure[];
  exemptions: PreventiveExemption[];
  stats: {
    public_commands: number;
    workflow_skills: number;
    capability_skills: number;
    extensions_checked: number;
    legacy_kind_files: number;
    legacy_commands_dir_files: number;
    legacy_path_scanned_files: number;
    legacy_path_exempted_lines: number;
  };
}

const PUBLIC_COMMAND_DIR = "src/opencode/commands/agentdev";
const DISTRIBUTION_SCAN_DIRS = ["src/opencode", "src/opencode-local"];
const SKILLS_DIR = "src/opencode/skills";
const EXTENSIONS_SKILLS_DIR = ".agentdev/extensions/skills";
const EXTENSIONS_COMMANDS_DIR = ".agentdev/extensions/commands";
const COMMAND_FORMAT_RULES_PATH = path.join(
  ".opencode",
  "skills",
  "repo-agentdev-integrity",
  "data",
  "command-format-rules.yaml",
);

const LEGACY_EXTENSION_KINDS = ["command-extension", "skill-extension"];
const LEGACY_EXTENSIONS_PATH = ".agentdev/extensions/commands";
// AG-004 concise trigger item detection word (the Design-authoritative soft
// guard form: the description's DO NOT USE FOR entry "単独起動（対応する
// /agentdev/* コマンド経由で利用すること）"). Must stay identical to
// WORKFLOW_TRIGGER_ITEM in lint_skills.ts (the AG-004 implementation) so both
// checkers assert the same form. lint_skills.ts runs main() at module top
// level and cannot be imported here, hence the duplicated constant.
const WORKFLOW_TRIGGER_ITEM = "単独起動";

// check 5: a specific internal reference file (references/<file>.md|.ts).
// The generic "`references/` 配下を参照" declaration names no file and is the
// documented non-dependence statement, so it does not match.
const INTERNAL_REFERENCE_FILE = /references\/[A-Za-z0-9_-]+\.(?:md|ts)\b/;

// check 4 exemptions:
//  - detection fixtures (*.test.ts) legitimately build the legacy path
//  - abolition declarations mention the legacy path only to forbid reading it
const ABOLITION_DECLARATION = /廃止|後方互換で読まない|migration-required/;

export const PREVENTIVE_EXEMPTIONS: PreventiveExemption[] = [
  {
    area: "check-4 legacy-path detection fixtures",
    description:
      "*.test.ts files may build .agentdev/extensions/commands fixtures to validate containment detection",
  },
  {
    area: "check-4 abolition declarations",
    description:
      "lines mentioning the legacy path together with 廃止 / 後方互換で読まない / migration-required declare the abolition itself",
  },
  {
    area: "check-5 generic directory declarations",
    description:
      "`references/` 配下を参照 lines that name no specific file assert name-level non-dependence (REQ-002-017)",
  },
  {
    area: "scan scope",
    description:
      "docs/** historical records (superseded Designs, DEC-005, IR-056 detection-scope declarations) are not scanned; docs semantics stay with inspect-docs / inspect-skills",
  },
];

const CHECK_NAMES: Record<number, string> = {
  1: "workflow-dispatch-presence",
  2: "dispatch-target-existence",
  3: "workflow-soft-guard",
  4: "legacy-extension-residual",
  5: "internal-reference-direct-dep",
  6: "classification-kind-consistency",
  7: "command-format-thin-consistency",
};

function dirExists(p: string): boolean {
  try {
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function readText(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf-8") as string;
  } catch {
    return null;
  }
}

function listMarkdownFiles(dirPath: string): string[] {
  const result: string[] = [];
  if (!dirExists(dirPath)) return result;
  for (const ent of fs.readdirSync(dirPath, { withFileTypes: true }) as any[]) {
    if (ent.isFile() && ent.name.endsWith(".md") && ent.name !== "README.md") {
      result.push(path.join(dirPath, ent.name).replace(/\\/g, "/"));
    }
  }
  return result.sort();
}

function listFilesRecursive(dirPath: string, extensions?: string[]): string[] {
  const result: string[] = [];
  if (!dirExists(dirPath)) return result;
  for (const ent of fs.readdirSync(dirPath, { withFileTypes: true }) as any[]) {
    const full = path.join(dirPath, ent.name);
    if (ent.isDirectory()) {
      result.push(...listFilesRecursive(full, extensions));
    } else if (ent.isFile()) {
      if (!extensions || extensions.some((e) => ent.name.endsWith(e))) {
        result.push(full.replace(/\\/g, "/"));
      }
    }
  }
  return result.sort();
}

function extractYamlField(text: string, field: string): string | null {
  const m = text.match(new RegExp(`^${field}:\\s*(\\S+)\\s*$`, "m"));
  return m ? m[1] : null;
}

// Frontmatter description extraction with the same single-line semantics as
// lint_skills.ts parseFrontMatter (all distribution SKILL.md files keep the
// description as one quoted line).
function extractFrontMatterDescription(text: string): string {
  const parts = text.split("---");
  if (parts.length < 3) return "";
  for (const line of parts[1].split(/\r?\n/)) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    if (line.slice(0, colonIndex).trim() === "description") {
      return line.slice(colonIndex + 1).trim();
    }
  }
  return "";
}

/**
 * Collect `forbidden*` regex values from the command-format rules YAML.
 * Double-quoted YAML scalars use JSON-compatible escapes; both the
 * `forbidden_key: "pattern"` and `forbidden_key:` + `- "pattern"` list forms
 * are handled.
 */
export function collectForbiddenRegexes(yamlText: string): { key: string; value: string }[] {
  const result: { key: string; value: string }[] = [];
  const lines = yamlText.split(/\r?\n/);
  let currentListKey: string | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      currentListKey = null;
      continue;
    }
    if (/^#/.test(line)) {
      // Comments inside a list block (between the key and its items) must not
      // end the list; only a blank line or the next key does.
      continue;
    }
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*"(.*)"\s*$/);
    if (kv) {
      currentListKey = kv[1].startsWith("forbidden") ? kv[1] : null;
      if (currentListKey) {
        try {
          result.push({ key: currentListKey, value: JSON.parse(`"${kv[2]}"`) });
        } catch {
          // malformed scalar: reported by the caller via compile failure
          result.push({ key: currentListKey, value: kv[2] });
        }
      }
      continue;
    }
    const bareKey = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*$/);
    if (bareKey) {
      currentListKey = bareKey[1].startsWith("forbidden") ? bareKey[1] : null;
      continue;
    }
    const item = line.match(/^-\s*"(.*)"\s*$/);
    if (item && currentListKey) {
      try {
        result.push({ key: currentListKey, value: JSON.parse(`"${item[1]}"`) });
      } catch {
        result.push({ key: currentListKey, value: item[1] });
      }
    }
  }
  return result;
}

// Key names that would intrinsically mandate content presence in the scanned
// command files. `required_primary_heading` (IR-031, PR-body heading shape)
// is intentionally NOT in this set: it constrains PR bodies, not command
// files, so it does not contradict the thin Command model.
const MANDATORY_CONTENT_KEYS = new Set([
  "required_sections",
  "required_headings",
  "mandatory_sections",
  "must_contain",
  "must_contain_sections",
]);

export function checkWorkflowPreventive(repoRoot: string): PreventiveReport {
  const failures: PreventiveFailure[] = [];
  const origCwd = process.cwd();
  process.chdir(repoRoot);
  try {
    const classification = deriveSkillClassification();
    const commandFiles = listMarkdownFiles(PUBLIC_COMMAND_DIR);

    const stats = {
      public_commands: commandFiles.length,
      workflow_skills: classification.workflowSkills.size,
      capability_skills: classification.capabilitySkills.size,
      extensions_checked: 0,
      legacy_kind_files: 0,
      legacy_commands_dir_files: 0,
      legacy_path_scanned_files: 0,
      legacy_path_exempted_lines: 0,
    };

    if (commandFiles.length === 0) {
      failures.push({
        check: 1,
        check_name: CHECK_NAMES[1],
        severity: "strict",
        classification: "existence",
        file: PUBLIC_COMMAND_DIR,
        message: `public command directory has no command files (${PUBLIC_COMMAND_DIR})`,
      });
    }

    // Checks 1-3 + 5: per-command structural invariants
    for (const cf of commandFiles) {
      const base = path.basename(cf).replace(/\.md$/, "");
      const workflowSkill = `agentdev-workflow-${base}`;
      const text = readText(cf) ?? "";

      // Check 1: dispatch presence (name-level reference to the dedicated Workflow Skill)
      if (!new RegExp(`\\b${workflowSkill}\\b`).test(text)) {
        failures.push({
          check: 1,
          check_name: CHECK_NAMES[1],
          severity: "strict",
          classification: "consistency",
          file: cf,
          message: `command does not reference its dedicated Workflow Skill '${workflowSkill}' (thin Command model requires a name-level dispatch)`,
        });
      }

      // Check 2: dispatch target existence
      const skillMd = path.join(SKILLS_DIR, workflowSkill, "SKILL.md");
      if (!readText(skillMd)) {
        failures.push({
          check: 2,
          check_name: CHECK_NAMES[2],
          severity: "strict",
          classification: "existence",
          file: skillMd,
          message: `dispatch target Workflow Skill '${workflowSkill}' does not exist (expected ${skillMd})`,
        });
      } else {
        // Check 3: AG-004 concise trigger item in the Workflow Skill description
        const skillText = readText(skillMd) ?? "";
        const skillDescription = extractFrontMatterDescription(skillText);
        if (!skillDescription.includes(WORKFLOW_TRIGGER_ITEM)) {
          failures.push({
            check: 3,
            check_name: CHECK_NAMES[3],
            severity: "strict",
            classification: "consistency",
            file: skillMd,
            message: `Workflow Skill '${workflowSkill}' description lacks the concise trigger item "単独起動（対応する /agentdev/* コマンド経由で利用すること）" in DO NOT USE FOR (AG-004, detection word unified with lint_skills.ts)`,
          });
        }
      }

      // Check 5: no direct dependency on skill-internal reference files
      const lines = text.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(INTERNAL_REFERENCE_FILE);
        if (m) {
          failures.push({
            check: 5,
            check_name: CHECK_NAMES[5],
            severity: "strict",
            classification: "residual",
            file: cf,
            line: i + 1,
            message: `command references a skill-internal reference file '${m[0]}' (workflow references must stay Workflow-Skill name level, REQ-002-017)`,
          });
        }
      }
    }

    // Check 4a: legacy kinds under the extension tree
    const extensionFiles = listFilesRecursive(EXTENSIONS_SKILLS_DIR, [".yaml", ".yml"]);
    stats.extensions_checked = extensionFiles.length;
    for (const ef of extensionFiles) {
      const text = readText(ef) ?? "";
      const kind = extractYamlField(text, "kind");
      if (kind && LEGACY_EXTENSION_KINDS.includes(kind)) {
        stats.legacy_kind_files++;
        failures.push({
          check: 4,
          check_name: CHECK_NAMES[4],
          severity: "strict",
          classification: "residual",
          file: ef,
          message: `legacy extension kind '${kind}' detected (fully abolished; migrate to workflow-extension / internal-workflow-extension / capability-skill-extension)`,
        });
      }
    }

    // Check 4b: legacy commands extension directory residual
    const commandsDirFiles = listFilesRecursive(EXTENSIONS_COMMANDS_DIR);
    stats.legacy_commands_dir_files = commandsDirFiles.length;
    if (commandsDirFiles.length > 0) {
      failures.push({
        check: 4,
        check_name: CHECK_NAMES[4],
        severity: "strict",
        classification: "residual",
        file: EXTENSIONS_COMMANDS_DIR,
        message: `${EXTENSIONS_COMMANDS_DIR}/** still contains ${commandsDirFiles.length} file(s); the directory is abolished`,
      });
    }

    // Check 4c: legacy runtime path references in distribution bodies
    for (const scanDir of DISTRIBUTION_SCAN_DIRS) {
      const textFiles = listFilesRecursive(scanDir, [".md", ".ts"]);
      for (const tf of textFiles) {
        const text = readText(tf);
        if (!text || !text.includes(LEGACY_EXTENSIONS_PATH)) continue;
        stats.legacy_path_scanned_files++;
        const lines = text.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          if (!lines[i].includes(LEGACY_EXTENSIONS_PATH)) continue;
          const relPath = tf.replace(/\\/g, "/");
          const isFixture = /\.test\.ts$/.test(relPath);
          const isAbolitionDeclaration = ABOLITION_DECLARATION.test(lines[i]);
          if (isFixture || isAbolitionDeclaration) {
            stats.legacy_path_exempted_lines++;
            continue;
          }
          failures.push({
            check: 4,
            check_name: CHECK_NAMES[4],
            severity: "strict",
            classification: "residual",
            file: relPath,
            line: i + 1,
            message: `distribution body references the abolished extension runtime path '${LEGACY_EXTENSIONS_PATH}' (extensions live under ${EXTENSIONS_SKILLS_DIR}/)`,
          });
        }
      }
    }

    // Check 6: extension kind vs deterministic Workflow/Capability classification
    for (const ef of extensionFiles) {
      const text = readText(ef) ?? "";
      const kind = extractYamlField(text, "kind");
      const id = extractYamlField(text, "id");
      if (!kind || LEGACY_EXTENSION_KINDS.includes(kind)) continue; // legacy handled by check 4
      const relPath = path.relative(EXTENSIONS_SKILLS_DIR, ef).replace(/\\/g, "/");
      const segments = relPath.split("/");
      const fileBase = (segments[segments.length - 1] ?? "").replace(/\.ya?ml$/, "");

      if (kind === "workflow-extension") {
        if (segments.length !== 1) {
          failures.push({
            check: 6,
            check_name: CHECK_NAMES[6],
            severity: "strict",
            classification: "consistency",
            file: ef,
            message: `workflow-extension must be placed flat at ${EXTENSIONS_SKILLS_DIR}/{workflow-skill-name}.yaml (got: ${relPath})`,
          });
        }
        if (id && !classification.workflowSkills.has(id)) {
          failures.push({
            check: 6,
            check_name: CHECK_NAMES[6],
            severity: "strict",
            classification: "consistency",
            file: ef,
            message: `workflow-extension target '${id}' is not a Workflow Skill (Workflow Skill = agentdev-workflow-{command} with an existing command)`,
          });
        }
        if (id && id !== fileBase) {
          failures.push({
            check: 6,
            check_name: CHECK_NAMES[6],
            severity: "strict",
            classification: "consistency",
            file: ef,
            message: `workflow-extension 'id' (${id}) must match the target skill name derived from the filename (${fileBase})`,
          });
        }
      } else if (kind === "capability-skill-extension") {
        if (segments.length !== 1) {
          failures.push({
            check: 6,
            check_name: CHECK_NAMES[6],
            severity: "strict",
            classification: "consistency",
            file: ef,
            message: `capability-skill-extension must be placed flat at ${EXTENSIONS_SKILLS_DIR}/{capability-skill-name}.yaml (got: ${relPath})`,
          });
        }
        if (id && !classification.capabilitySkills.has(id)) {
          failures.push({
            check: 6,
            check_name: CHECK_NAMES[6],
            severity: "strict",
            classification: "consistency",
            file: ef,
            message: `capability-skill-extension target '${id}' is not a Capability Skill (Capability Skill = an agentdev-* skill directory without a corresponding command)`,
          });
        }
        if (id && id !== fileBase) {
          failures.push({
            check: 6,
            check_name: CHECK_NAMES[6],
            severity: "strict",
            classification: "consistency",
            file: ef,
            message: `capability-skill-extension 'id' (${id}) must match the target skill name derived from the filename (${fileBase})`,
          });
        }
      } else if (kind === "internal-workflow-extension") {
        const parent = segments[0] ?? "";
        if (segments.length !== 2 || !/^internal\.ya?ml$/.test(segments[1] ?? "")) {
          failures.push({
            check: 6,
            check_name: CHECK_NAMES[6],
            severity: "strict",
            classification: "consistency",
            file: ef,
            message: `internal-workflow-extension must be placed at ${EXTENSIONS_SKILLS_DIR}/{workflow-skill-name}/internal.yaml (got: ${relPath})`,
          });
        }
        if (id && id !== parent) {
          failures.push({
            check: 6,
            check_name: CHECK_NAMES[6],
            severity: "strict",
            classification: "consistency",
            file: ef,
            message: `internal-workflow-extension 'id' (${id}) must match the parent directory Workflow Skill name (${parent})`,
          });
        }
        if (id && !classification.workflowSkills.has(id)) {
          failures.push({
            check: 6,
            check_name: CHECK_NAMES[6],
            severity: "strict",
            classification: "consistency",
            file: ef,
            message: `internal-workflow-extension parent '${id}' is not a Workflow Skill`,
          });
        }
      }
    }

    // Check 7: command-format rules must not contradict the thin Command model
    const rulesText = readText(COMMAND_FORMAT_RULES_PATH);
    if (!rulesText) {
      failures.push({
        check: 7,
        check_name: CHECK_NAMES[7],
        severity: "strict",
        classification: "existence",
        file: COMMAND_FORMAT_RULES_PATH,
        message: `command-format rules file is missing (${COMMAND_FORMAT_RULES_PATH})`,
      });
    } else {
      // (i) no mandatory-content directives (e.g. a required ## 手順 section)
      const ruleLines = rulesText.split(/\r?\n/);
      for (let i = 0; i < ruleLines.length; i++) {
        const keyMatch = ruleLines[i].match(/^\s*([A-Za-z_][A-Za-z0-9_]*):\s*/);
        if (keyMatch && MANDATORY_CONTENT_KEYS.has(keyMatch[1].toLowerCase())) {
          failures.push({
            check: 7,
            check_name: CHECK_NAMES[7],
            severity: "strict",
            classification: "format",
            file: COMMAND_FORMAT_RULES_PATH,
            line: i + 1,
            message: `command-format rules define a mandatory-content directive ('${ruleLines[i].trim()}'); the thin Command model must not require a procedure section in public commands`,
          });
        }
      }
      // (ii) forbidden patterns must not reject the thin dispatch structure
      const thinSamples = [
        "## workflow",
        "本コマンドは workflow 実装本体を `agentdev-workflow-demo` スキルへ委譲する（DEC-010、REQ-002-016）。",
        "### Step 1: 入力解決",
      ];
      for (const { key, value } of collectForbiddenRegexes(rulesText)) {
        let re: RegExp | null = null;
        try {
          re = new RegExp(value);
        } catch {
          failures.push({
            check: 7,
            check_name: CHECK_NAMES[7],
            severity: "strict",
            classification: "format",
            file: COMMAND_FORMAT_RULES_PATH,
            message: `command-format rule '${key}' holds an invalid regex: ${value}`,
          });
          continue;
        }
        for (const sample of thinSamples) {
          if (re!.test(sample)) {
            failures.push({
              check: 7,
              check_name: CHECK_NAMES[7],
              severity: "strict",
              classification: "format",
              file: COMMAND_FORMAT_RULES_PATH,
              message: `command-format rule '${key}' (${value}) matches the thin Command dispatch structure sample '${sample}'; format rules must not forbid the thin model`,
            });
          }
        }
      }
    }

    const checks: PreventiveCheckSummary[] = [];
    for (let item = 1; item <= 7; item++) {
      checks.push({
        item,
        name: CHECK_NAMES[item],
        pass: !failures.some((f) => f.check === item && f.severity === "strict"),
      });
    }
    const strictFailures = failures.filter((f) => f.severity === "strict");
    return {
      ok: strictFailures.length === 0,
      checks,
      failures,
      exemptions: PREVENTIVE_EXEMPTIONS,
      stats,
    };
  } finally {
    process.chdir(origCwd);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const positional = args.filter((a) => !a.startsWith("--"));
  const repoRoot = positional[0] || process.cwd();
  const report = checkWorkflowPreventive(repoRoot);
  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stdout.write(`check_workflow_preventive.ts - AG-008 preventive checks (7 items)\n`);
    process.stdout.write(`===============================================================\n`);
    process.stdout.write(`repoRoot: ${repoRoot}\n`);
    process.stdout.write(`ok: ${report.ok}\n`);
    process.stdout.write(`checks:\n`);
    for (const c of report.checks) {
      process.stdout.write(`  [${c.pass ? "PASS" : "FAIL"}] #${c.item} ${c.name}\n`);
    }
    process.stdout.write(`stats: ${JSON.stringify(report.stats, null, 2)}\n`);
    process.stdout.write(`failures (${report.failures.length}):\n`);
    for (const f of report.failures) {
      process.stdout.write(
        `  [${f.severity}/${f.classification}] check #${f.check} ${f.check_name}${f.file ? ` (${f.file}${f.line ? `:${f.line}` : ""})` : ""}: ${f.message}\n`,
      );
    }
  }
  process.exit(report.ok ? 0 : 1);
}
