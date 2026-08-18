/**
 * Project Extensions integrity checker (IR-056), new-kind era.
 *
 * Validates project extensions against docs/specs/foundations/project-extensions.md
 * (DEC-012 migration: 3-kind enum, id binding, placement, classification) and the
 * REQ-002-030/031 load-time contract (fail-open applies to malformed only).
 *
 * Extension schema:
 *   frontmatter: version: 1,
 *                kind: workflow-extension | internal-workflow-extension | capability-skill-extension,
 *                id: <target skill name (see id binding)>
 *   5 sections (each an array):
 *     context[{id, when?, paths?, purpose?}]  — additive context entries
 *     rules[{id, when?, skill?}]              — additive rules, optional project-local skill delegation
 *     checks[{id, when?, skill?}]             — additive checks, optional project-local skill delegation
 *     acceptance_gates[string]                 — additive pre-completion gates
 *     must_not[string]                         — additive prohibitions
 *
 * Load-time state machine (mirrored by resolveExtensionState, UC-001 case 1):
 *   missing        -> standard continue (normal state)
 *   malformed      -> fail-open: error display + ignore this extension + standard continue
 *   legacy kind    -> migration-required + stop (silent ignore forbidden)
 *   unknown kind   -> schema violation + stop (fail-open forbidden)
 *   valid new kind -> normal processing
 *
 * 10 primary inspection items:
 *   1. new-kind-validation                 kind must be one of the 3 official values;
 *                                          syntactically valid unknown kinds are reported with
 *                                          classification "schema-violation"
 *   2. kind-path-consistency               flat {name}.yaml for workflow-extension /
 *                                          capability-skill-extension, {workflow-skill-name}/internal.yaml
 *                                          for internal-workflow-extension
 *   3. id-target-consistency               id matches the path-derived target name and the
 *                                          target skill directory exists
 *   4. internal-parent-workflow-consistency internal.yaml parent directory is a Workflow Skill
 *   5. capability-workflow-classification   workflow kinds target Workflow Skills, capability
 *                                          kind targets Capability Skills (no implicit propagation)
 *   6. old-kind-residual                   kind: command-extension|skill-extension anywhere under
 *                                          .agentdev/extensions/**, classification "migration-required"
 *   7. extensions-commands-dir-residual    .agentdev/extensions/commands/** must be absent/empty
 *   8. migration-required-classification   old-kind and commands-dir failures carry an explicit
 *                                          "migration-required" classification label and dedicated
 *                                          stats counters; the --scenario mode verifies the label
 *   9. context-paths-existence             context[].paths entries exist
 *  10. delegated-skill-existence           rules/checks skill: targets exist (warning)
 *
 * Auxiliary checks:
 *  11. extension-structure                 version/id/5-section shape (classification "malformed")
 *  12. legacy-doc-inputs-residual          .agentdev/doc-inputs/** residual (warning)
 *  13. override-intent                     heuristic override-phrase scan (warning)
 *
 * Workflow Skill classification (deterministic):
 *   Workflow Skill  = agentdev-workflow-{X} for each existing command
 *                     src/opencode/commands/agentdev/{X}.md.
 *   Capability Skill = every other agentdev-* skill directory under src/opencode/skills,
 *                     including cross-cutting agentdev-workflow-* skills that have no
 *                     corresponding command (workflow-skill-model SPEC exception table).
 *
 * Scenario mode (--scenario) executes the TS-006 extension scenarios (absent / valid x3 /
 * legacy x2 / malformed / no-implicit-propagation, plus unknown-kind) against disposable
 * fixtures and exits non-zero on any failure.
 *
 * Distribution reference boundary (direct refs in src/opencode/commands|skills)
 * is handled by check_distribution_boundary.ts.
 */

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");
const os = require("os") as typeof import("os");

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

export type FailureClassification =
  | "malformed"
  | "migration-required"
  | "schema-violation"
  | "consistency"
  | "existence"
  | "heuristic";

export interface CheckFailure {
  check: number;
  check_name: string;
  severity: "strict" | "warning";
  classification: FailureClassification;
  file?: string;
  message: string;
}

export interface CheckReport {
  ok: boolean;
  failures: CheckFailure[];
  stats: {
    workflow_extensions: number;
    internal_workflow_extensions: number;
    capability_extensions: number;
    legacy_kind_files: number;
    commands_dir_files: number;
    public_commands: number;
    public_skills: number;
    workflow_skills: number;
    capability_skills: number;
    migration_required_entries: number;
    schema_violation_entries: number;
    malformed_entries: number;
    doc_inputs_residual_files: number;
  };
}

const PUBLIC_COMMAND_DIR = "src/opencode/commands/agentdev";
const SKILLS_DIR = "src/opencode/skills";
const REPO_LOCAL_SKILLS_DIR = ".opencode/skills";
const EXTENSIONS_COMMANDS_DIR = ".agentdev/extensions/commands";
const EXTENSIONS_SKILLS_DIR = ".agentdev/extensions/skills";
const LEGACY_DOC_INPUTS_DIR = ".agentdev/doc-inputs";

// REQ-0161-005: baseline-aware strict pass. Mirrors check_integrity.ts NG
// baseline: baseline-known strict failures are demoted to warning (report-only),
// only strict failures exceeding the baseline cause ok=false. The baseline is
// regenerated explicitly via --update-ng-baseline.
const NG_BASELINE_PATH = path.join(
  ".opencode",
  "skills",
  "repo-agentdev-integrity",
  "baselines",
  "check-extensions-baseline.json",
);

interface ExtensionsNgBaselineEntry {
  check: number;
  check_name: string;
  file: string | null;
  message: string | null;
  count: number;
}

interface ExtensionsNgBaseline {
  version: number;
  rule_id: "CHECK-EXTENSIONS-NG-BASELINE";
  generated_at: string;
  entries: ExtensionsNgBaselineEntry[];
}

function extBaselineKey(
  check: number,
  checkName: string,
  file: string | null,
  message: string | null,
): string {
  return `${check}\t${checkName}\t${file ?? ""}\t${message ?? ""}`;
}

function loadExtensionsNgBaseline(
  repoRoot: string,
): ExtensionsNgBaseline | null {
  const baselineAbs = path.join(repoRoot, NG_BASELINE_PATH);
  const content = readText(baselineAbs);
  if (!content) return null;
  try {
    return JSON.parse(content) as ExtensionsNgBaseline;
  } catch {
    return null;
  }
}

function writeExtensionsNgBaseline(
  repoRoot: string,
  baseline: ExtensionsNgBaseline,
): void {
  const baselineAbs = path.join(repoRoot, NG_BASELINE_PATH);
  const dir = path.dirname(baselineAbs);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    baselineAbs,
    JSON.stringify(baseline, null, 2) + "\n",
    "utf-8",
  );
}

// Heuristic override-intent phrases (check #8). Extension is additive-only.
const OVERRIDE_PHRASES = [
  "置き換える",
  "default を変更",
  "defaultを変更",
  "標準動作を置き換え",
  "override standard",
  "replace default",
];

function fileExists(p: string): boolean {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

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

function listMarkdownFiles(dirPath: string, recursive: boolean): string[] {
  const result: string[] = [];
  if (!dirExists(dirPath)) return result;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true }) as any[];
  for (const ent of entries) {
    const full = path.join(dirPath, ent.name);
    if (ent.isDirectory() && recursive) {
      result.push(...listMarkdownFiles(full, true));
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      result.push(full.replace(/\\/g, "/"));
    }
  }
  return result;
}

function listYamlFilesRecursive(dirPath: string): string[] {
  const result: string[] = [];
  if (!dirExists(dirPath)) return result;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true }) as any[];
  for (const ent of entries) {
    const full = path.join(dirPath, ent.name);
    if (ent.isDirectory()) {
      result.push(...listYamlFilesRecursive(full));
    } else if (ent.isFile() && (ent.name.endsWith(".yaml") || ent.name.endsWith(".yml"))) {
      result.push(full.replace(/\\/g, "/"));
    }
  }
  return result;
}

function listFilesRecursive(dirPath: string): string[] {
  const result: string[] = [];
  if (!dirExists(dirPath)) return result;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true }) as any[];
  for (const ent of entries) {
    const full = path.join(dirPath, ent.name);
    if (ent.isDirectory()) {
      result.push(...listFilesRecursive(full));
    } else if (ent.isFile()) {
      result.push(full.replace(/\\/g, "/"));
    }
  }
  return result;
}

/**
 * Minimal YAML parser tailored to extension files (same constraints as the
 * earlier doc-input parser: top-level key: value, nested mapping by indent,
 * list of scalars, list of mappings with deeper-indent continuation,
 * inline arrays [a, b], inline empty mapping {}).
 */
function parseSimpleYaml(text: string): any {
  const lines = text.split(/\r?\n/);
  const root: any = {};
  const stack: { indent: number; node: any }[] = [{ indent: -1, node: root }];

  function currentParent(indent: number): any {
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    return stack[stack.length - 1].node;
  }

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    i++;
    if (!rawLine.trim()) continue;
    if (rawLine.trim().startsWith("#")) continue;
    const indent = rawLine.length - rawLine.trimStart().length;
    const line = rawLine.trim();

    if (line.startsWith("- ")) {
      const holder = currentParent(indent);
      const owner = holder.__list_owner;
      const key = holder.__list_key;
      if (owner && key) {
        if (!Array.isArray(owner[key])) owner[key] = [];
        const rest = line.slice(2).trim();
        const colonIdx = rest.indexOf(":");
        if (
          colonIdx !== -1 &&
          !rest.startsWith("[") &&
          !rest.startsWith('"') &&
          !rest.startsWith("'")
        ) {
          const innerKey = rest.slice(0, colonIdx).trim().replace(/^["']|["']$/g, "");
          const innerRaw = rest.slice(colonIdx + 1).trim();
          const elem: any = {};
          if (innerRaw === "") {
            elem[innerKey] = null;
          } else if (innerRaw.startsWith("[") && innerRaw.endsWith("]")) {
            elem[innerKey] = innerRaw
              .slice(1, -1)
              .split(",")
              .map((s) => s.trim().replace(/^["']|["']$/g, ""))
              .filter((s) => s.length > 0);
          } else {
            elem[innerKey] = innerRaw.replace(/^["']|["']$/g, "");
          }
          owner[key].push(elem);
          stack.push({ indent, node: elem });
        } else {
          owner[key].push(rest.replace(/^["']|["']$/g, ""));
        }
      }
      continue;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim().replace(/^["']|["']$/g, "");
    const rawValue = line.slice(colonIdx + 1).trim();

    let parent = currentParent(indent);

    if (parent && parent.__list_owner !== undefined) {
      const owner = parent.__list_owner;
      const ownerKey = parent.__list_key;
      const realNode: any = {};
      owner[ownerKey] = realNode;
      if (stack.length > 0 && stack[stack.length - 1].node === parent) {
        stack[stack.length - 1].node = realNode;
      }
      parent = realNode;
    }

    if (rawValue === "") {
      const holder: any = {
        __list_owner: parent,
        __list_key: key,
      };
      parent[key] = holder;
      stack.push({ indent, node: holder });
    } else if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      parent[key] = rawValue
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter((s) => s.length > 0);
    } else if (rawValue === "{}") {
      parent[key] = {};
    } else {
      parent[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }

  (function normalize(node: any): void {
    if (node && typeof node === "object") {
      for (const k of Object.keys(node)) {
        const v = node[k];
        if (v && typeof v === "object" && v.__list_owner !== undefined) {
          node[k] = [];
        } else if (Array.isArray(v)) {
          for (const e of v) normalize(e);
        } else if (v && typeof v === "object") {
          normalize(v);
        }
      }
    }
  })(root);
  return root;
}

/**
 * Known project-local skill locations for check #10 existence confirmation.
 * Returns true if a directory matching the skill name exists in any known
 * skills location. Paths are resolved against repoRoot (cwd-independent).
 */
function projectLocalSkillExists(skillName: string, repoRoot: string): boolean {
  // Distributed skills
  const distPath = path.join(repoRoot, SKILLS_DIR, skillName);
  if (dirExists(distPath)) return true;
  // Repo-local skills
  const repoLocalPath = path.join(repoRoot, REPO_LOCAL_SKILLS_DIR, skillName);
  if (dirExists(repoLocalPath)) return true;
  return false;
}

export interface SkillClassification {
  workflowSkills: Set<string>;
  capabilitySkills: Set<string>;
}

/**
 * Deterministic Workflow/Capability classification.
 * Workflow Skill  = agentdev-workflow-{X} where src/opencode/commands/agentdev/{X}.md exists.
 * Capability Skill = every other agentdev-* skill directory under src/opencode/skills
 * (including cross-cutting agentdev-workflow-* skills without a corresponding command).
 * Paths are resolved against repoRoot when given, process.cwd() otherwise
 * (cwd-independent: REQ-018 worktree test fallback).
 */
export function deriveSkillClassification(repoRoot?: string): SkillClassification {
  const root = repoRoot ?? process.cwd();
  const workflowSkills = new Set<string>();
  const commandFiles = listMarkdownFiles(path.join(root, PUBLIC_COMMAND_DIR), false).filter(
    (f) => path.basename(f) !== "README.md",
  );
  for (const cf of commandFiles) {
    const base = path.basename(cf).replace(/\.md$/, "");
    workflowSkills.add(`agentdev-workflow-${base}`);
  }
  const capabilitySkills = new Set<string>();
  const skillsAbs = path.join(root, SKILLS_DIR);
  if (dirExists(skillsAbs)) {
    const dirs = fs.readdirSync(skillsAbs, { withFileTypes: true }) as any[];
    for (const d of dirs) {
      if (!d.isDirectory() || !d.name.startsWith("agentdev-")) continue;
      if (!workflowSkills.has(d.name)) capabilitySkills.add(d.name);
    }
  }
  return { workflowSkills, capabilitySkills };
}

export type ExtensionResolution =
  | { state: "missing" }
  | { state: "malformed"; reasons: string[] }
  | { state: "migration-required"; kind: string }
  | { state: "schema-violation"; kind: string }
  | { state: "valid"; kind: ExtensionKind };

/**
 * Load-time state classification shared by the runtime resolver contract and
 * the deterministic checks (UC-001 case 1). Judgment order matters: required
 * field problems (malformed, fail-open at runtime) are judged before the kind
 * value; legacy and unknown kinds are only classified once every required
 * field is syntactically present. parseSimpleYaml never throws, so YAML
 * syntax errors degrade into missing required fields (malformed).
 */
export function resolveExtensionState(rawText: string | null): ExtensionResolution {
  if (rawText === null) return { state: "missing" };
  const parsed = parseSimpleYaml(rawText);
  const reasons: string[] = [];
  if (parsed.version === undefined || String(parsed.version) !== "1") {
    reasons.push(`required field 'version' must be 1 (got: ${parsed.version})`);
  }
  if (typeof parsed.kind !== "string" || parsed.kind.length === 0) {
    reasons.push("required field 'kind' is missing or not a string");
  }
  if (typeof parsed.id !== "string" || parsed.id.length === 0) {
    reasons.push("required field 'id' is missing or not a string");
  }
  for (const sec of ["context", "rules", "checks", "acceptance_gates", "must_not"]) {
    if (parsed[sec] === undefined || parsed[sec] === null) {
      reasons.push(`required section '${sec}' is missing (use an empty array if no entries)`);
    } else if (!Array.isArray(parsed[sec])) {
      reasons.push(`required section '${sec}' must be an array`);
    }
  }
  if (reasons.length > 0) return { state: "malformed", reasons };
  const kind = parsed.kind as string;
  if (LEGACY_EXTENSION_KINDS.includes(kind)) {
    return { state: "migration-required", kind };
  }
  if (!NEW_EXTENSION_KINDS.includes(kind as ExtensionKind)) {
    return { state: "schema-violation", kind };
  }
  return { state: "valid", kind: kind as ExtensionKind };
}

interface ExtensionWalkResult {
  pathsReferenced: string[];
  skillsReferenced: string[];
  rawText: string;
  failures: CheckFailure[];
}

/**
 * Walk context/rules/checks sections to collect path strings, skill names,
 * and detect override-intent phrases (check #13 heuristic). Called only for
 * extensions whose load-time state is "valid".
 */
function walkExtension(parsed: any, rawText: string, rcFile: string): ExtensionWalkResult {
  const pathsReferenced: string[] = [];
  const skillsReferenced: string[] = [];
  const failures: CheckFailure[] = [];

  // context: array of {id, when?, paths?, purpose?}
  if (Array.isArray(parsed.context)) {
    for (let idx = 0; idx < parsed.context.length; idx++) {
      const e = parsed.context[idx];
      if (!e || typeof e !== "object") {
        failures.push({
          check: 11,
          check_name: "extension-structure",
          severity: "strict",
          classification: "malformed",
          file: rcFile,
          message: `context[${idx}] must be an object`,
        });
        continue;
      }
      if (typeof e.id !== "string") {
        failures.push({
          check: 11,
          check_name: "extension-structure",
          severity: "strict",
          classification: "malformed",
          file: rcFile,
          message: `context[${idx}] missing 'id' string`,
        });
      }
      if (Array.isArray(e.paths)) {
        for (const p of e.paths) {
          if (typeof p === "string") pathsReferenced.push(p);
        }
      }
    }
  }

  // rules / checks: array of {id, when?, skill?}
  for (const sec of ["rules", "checks"] as const) {
    if (Array.isArray(parsed[sec])) {
      for (let idx = 0; idx < parsed[sec].length; idx++) {
        const e = parsed[sec][idx];
        if (!e || typeof e !== "object") {
          failures.push({
            check: 11,
            check_name: "extension-structure",
            severity: "strict",
            classification: "malformed",
            file: rcFile,
            message: `${sec}[${idx}] must be an object`,
          });
          continue;
        }
        if (typeof e.id !== "string") {
          failures.push({
            check: 11,
            check_name: "extension-structure",
            severity: "strict",
            classification: "malformed",
            file: rcFile,
            message: `${sec}[${idx}] missing 'id' string`,
          });
        }
        if (typeof e.skill === "string" && e.skill.length > 0) {
          skillsReferenced.push(e.skill);
        }
      }
    }
  }

  // Check #13: override-intent phrase detection (heuristic, warning)
  for (const phrase of OVERRIDE_PHRASES) {
    if (rawText.includes(phrase)) {
      failures.push({
        check: 13,
        check_name: "override-intent",
        severity: "warning",
        classification: "heuristic",
        file: rcFile,
        message: `extension contains override-intent phrase '${phrase}' (extension must be additive-only)`,
      });
    }
  }

  return { pathsReferenced, skillsReferenced, rawText, failures };
}

export function checkExtensions(repoRoot: string): CheckReport {
  const failures: CheckFailure[] = [];
  // cwd-independent (REQ-018): resolve every scan target against repoRoot.
  // No process.chdir() mutation — immune to (and no source of) order-dependent
  // cwd pollution in the shared test process.
  const toRepoRel = (p: string): string => path.relative(repoRoot, p).replace(/\\/g, "/");
  const extensionsSkillsAbs = path.join(repoRoot, EXTENSIONS_SKILLS_DIR);
  {
    const classification = deriveSkillClassification(repoRoot);
    const stats = {
      workflow_extensions: 0,
      internal_workflow_extensions: 0,
      capability_extensions: 0,
      legacy_kind_files: 0,
      commands_dir_files: 0,
      public_commands: 0,
      public_skills: 0,
      workflow_skills: classification.workflowSkills.size,
      capability_skills: classification.capabilitySkills.size,
      migration_required_entries: 0,
      schema_violation_entries: 0,
      malformed_entries: 0,
      doc_inputs_residual_files: 0,
    };

    // Check #7: .agentdev/extensions/commands/** residual (classification: migration-required)
    const commandsDirFiles = listFilesRecursive(path.join(repoRoot, EXTENSIONS_COMMANDS_DIR));
    stats.commands_dir_files = commandsDirFiles.length;
    if (commandsDirFiles.length > 0) {
      failures.push({
        check: 7,
        check_name: "extensions-commands-dir-residual",
        severity: "strict",
        classification: "migration-required",
        file: EXTENSIONS_COMMANDS_DIR,
        message: `${EXTENSIONS_COMMANDS_DIR}/** still contains ${commandsDirFiles.length} file(s); the commands extension directory is abolished — migrate every file to ${EXTENSIONS_SKILLS_DIR} with a new kind`,
      });
    }

    // Checks 1, 2-6, 9-11, 13: per-extension validation
    for (const rcAbs of listYamlFilesRecursive(extensionsSkillsAbs)) {
      const rc = toRepoRel(rcAbs);
      const rcText = readText(rcAbs) ?? "";
      const resolution = resolveExtensionState(rcText);

      if (resolution.state === "malformed") {
        for (const reason of resolution.reasons) {
          failures.push({
            check: 11,
            check_name: "extension-structure",
            severity: "strict",
            classification: "malformed",
            file: rc,
            message: `malformed extension (${reason}); runtime contract is fail-open but the file must be fixed`,
          });
        }
        continue;
      }

      if (resolution.state === "migration-required") {
        stats.legacy_kind_files++;
        failures.push({
          check: 6,
          check_name: "old-kind-residual",
          severity: "strict",
          classification: "migration-required",
          file: rc,
          message: `legacy kind '${resolution.kind}' detected; migrate to one of ${NEW_EXTENSION_KINDS.join(" / ")} (runtime stops with migration-required, silent ignore is forbidden)`,
        });
        continue;
      }

      if (resolution.state === "schema-violation") {
        failures.push({
          check: 1,
          check_name: "new-kind-validation",
          severity: "strict",
          classification: "schema-violation",
          file: rc,
          message: `unknown kind '${resolution.kind}'; kind must be one of ${NEW_EXTENSION_KINDS.join(" / ")} (runtime stops with schema violation, fail-open does not apply)`,
        });
        continue;
      }

      // resolution.state === "valid": placement / id / classification checks
      if (resolution.state !== "valid") continue;
      const kind = resolution.kind;
      if (kind === "workflow-extension") stats.workflow_extensions++;
      else if (kind === "internal-workflow-extension") stats.internal_workflow_extensions++;
      else stats.capability_extensions++;

      const relPath = path.relative(extensionsSkillsAbs, rcAbs).replace(/\\/g, "/");
      const segments = relPath.split("/");

      // Check #2: kind-path consistency
      if (kind === "internal-workflow-extension") {
        if (segments.length !== 2 || !/^internal\.ya?ml$/.test(segments[1] ?? "")) {
          failures.push({
            check: 2,
            check_name: "kind-path-consistency",
            severity: "strict",
            classification: "consistency",
            file: rc,
            message: `internal-workflow-extension must be placed at ${EXTENSIONS_SKILLS_DIR}/{workflow-skill-name}/internal.yaml (got: ${relPath})`,
          });
        }
      } else {
        if (segments.length !== 1) {
          failures.push({
            check: 2,
            check_name: "kind-path-consistency",
            severity: "strict",
            classification: "consistency",
            file: rc,
            message: `${kind} must be placed flat at ${EXTENSIONS_SKILLS_DIR}/{target-skill-name}.yaml (got: ${relPath})`,
          });
        }
      }

      const parsed = parseSimpleYaml(rcText);
      const id = typeof parsed.id === "string" ? parsed.id : "";

      // Check #3: id-target consistency
      const fileBase = segments[segments.length - 1]?.replace(/\.ya?ml$/, "") ?? "";
      if (kind === "internal-workflow-extension") {
        const parent = segments[0] ?? "";
        if (id !== parent) {
          failures.push({
            check: 3,
            check_name: "id-target-consistency",
            severity: "strict",
            classification: "consistency",
            file: rc,
            message: `internal-workflow-extension 'id' (${id || "<missing>"}) must match the parent directory Workflow Skill name (${parent})`,
          });
        }
        if (id && !projectLocalSkillExists(id, repoRoot)) {
          failures.push({
            check: 3,
            check_name: "id-target-consistency",
            severity: "strict",
            classification: "existence",
            file: rc,
            message: `extension target skill '${id}' does not exist in ${SKILLS_DIR} or ${REPO_LOCAL_SKILLS_DIR}`,
          });
        }
      } else {
        if (id !== fileBase) {
          failures.push({
            check: 3,
            check_name: "id-target-consistency",
            severity: "strict",
            classification: "consistency",
            file: rc,
            message: `extension 'id' (${id || "<missing>"}) must match the target skill name derived from the filename (${fileBase})`,
          });
        }
        if (id && !projectLocalSkillExists(id, repoRoot)) {
          failures.push({
            check: 3,
            check_name: "id-target-consistency",
            severity: "strict",
            classification: "existence",
            file: rc,
            message: `extension target skill '${id}' does not exist in ${SKILLS_DIR} or ${REPO_LOCAL_SKILLS_DIR}`,
          });
        }
      }

      // Check #4: internal extension parent Workflow consistency
      if (kind === "internal-workflow-extension" && id) {
        if (!classification.workflowSkills.has(id)) {
          failures.push({
            check: 4,
            check_name: "internal-parent-workflow-consistency",
            severity: "strict",
            classification: "consistency",
            file: rc,
            message: `internal-workflow-extension parent '${id}' is not a Workflow Skill (Workflow Skill = agentdev-workflow-{command-name} with an existing command)`,
          });
        }
      }

      // Check #5: Capability/Workflow classification consistency (no implicit propagation)
      if (kind === "workflow-extension" && id) {
        if (!classification.workflowSkills.has(id)) {
          failures.push({
            check: 5,
            check_name: "capability-workflow-classification",
            severity: "strict",
            classification: "consistency",
            file: rc,
            message: `workflow-extension target '${id}' is not a Workflow Skill; a public Workflow Extension must not be applied to a Capability Skill (no implicit propagation)`,
          });
        }
      }
      if (kind === "capability-skill-extension" && id) {
        if (!classification.capabilitySkills.has(id)) {
          failures.push({
            check: 5,
            check_name: "capability-workflow-classification",
            severity: "strict",
            classification: "consistency",
            file: rc,
            message: `capability-skill-extension target '${id}' is not a Capability Skill (Capability Skill = an agentdev-* skill directory without a corresponding command)`,
          });
        }
      }

      // Walk sections: collect paths/skills, check structure, override phrases
      const walk = walkExtension(parsed, rcText, rc);
      failures.push(...walk.failures);

      // Check #9: context.paths existence
      for (const p of walk.pathsReferenced) {
        const pAbs = path.resolve(repoRoot, p);
        if (!fileExists(pAbs) && !dirExists(pAbs)) {
          failures.push({
            check: 9,
            check_name: "context-paths-existence",
            severity: "strict",
            classification: "existence",
            file: p,
            message: `extension '${rc}' context.paths '${p}' does not exist`,
          });
        }
      }

      // Check #10: rules.skill / checks.skill project-local skill existence (warning)
      for (const skillName of walk.skillsReferenced) {
        if (!projectLocalSkillExists(skillName, repoRoot)) {
          failures.push({
            check: 10,
            check_name: "delegated-skill-existence",
            severity: "warning",
            classification: "existence",
            file: rc,
            message: `extension '${rc}' references project-local skill '${skillName}' which is not found in known skill locations`,
          });
        }
      }
    }

    // Check #12: legacy .agentdev/doc-inputs/** residual detection (warning)
    const docInputsAbs = path.join(repoRoot, LEGACY_DOC_INPUTS_DIR);
    if (dirExists(docInputsAbs)) {
      const legacyFiles = listFilesRecursive(docInputsAbs);
      stats.doc_inputs_residual_files = legacyFiles.length;
      if (legacyFiles.length > 0) {
        failures.push({
          check: 12,
          check_name: "legacy-doc-inputs-residual",
          severity: "warning",
          classification: "heuristic",
          file: LEGACY_DOC_INPUTS_DIR,
          message: `legacy .agentdev/doc-inputs/** still contains ${legacyFiles.length} file(s); migration to extensions should remove them`,
        });
      }
    }

    // Check #8: migration-required classification (explicit labels + stats counters)
    stats.migration_required_entries = failures.filter(
      (f) => f.classification === "migration-required",
    ).length;
    stats.schema_violation_entries = failures.filter(
      (f) => f.classification === "schema-violation",
    ).length;
    stats.malformed_entries = failures.filter(
      (f) => f.classification === "malformed",
    ).length;

    // Stats: public commands/skills counts (informational)
    const commandFiles = listMarkdownFiles(path.join(repoRoot, PUBLIC_COMMAND_DIR), false).filter((f) => {
      const base = path.basename(f);
      return base !== "README.md";
    });
    stats.public_commands = commandFiles.length;
    const publicSkillsAbs = path.join(repoRoot, SKILLS_DIR);
    if (dirExists(publicSkillsAbs)) {
      const skillDirs = (fs.readdirSync(publicSkillsAbs, { withFileTypes: true }) as any[])
        .filter((d) => d.isDirectory() && d.name.startsWith("agentdev-"));
      stats.public_skills = skillDirs.length;
    }

    const strictFailures = failures.filter((f) => f.severity === "strict");
    // REQ-0161-005: baseline-aware pass. Demote baseline-known strict failures
    // to warning so only new (delta) strict failures cause ok=false.
    const baseline = loadExtensionsNgBaseline(repoRoot);
    let newStrictCount = strictFailures.length;
    if (baseline) {
      const baselineIndex = new Map<string, number>();
      for (const entry of baseline.entries) {
        const key = extBaselineKey(
          entry.check,
          entry.check_name,
          entry.file,
          entry.message,
        );
        baselineIndex.set(key, entry.count);
      }
      const emitted = new Map<string, number>();
      for (const f of failures) {
        if (f.severity !== "strict") continue;
        const key = extBaselineKey(
          f.check,
          f.check_name,
          f.file ?? null,
          f.message ?? null,
        );
        const baselineCount = baselineIndex.get(key) ?? 0;
        const n = emitted.get(key) ?? 0;
        emitted.set(key, n + 1);
        if (n < baselineCount) {
          f.severity = "warning";
          f.message = `[baseline-known] ${f.message} (check-extensions baseline, not yet cleaned)`;
        }
      }
      newStrictCount = failures.filter((f) => f.severity === "strict").length;
    }
    return {
      ok: newStrictCount === 0,
      failures,
      stats,
    };
  }
}

function updateExtensionsNgBaseline(
  repoRoot: string,
  failures: CheckFailure[],
): void {
  const summary = new Map<string, ExtensionsNgBaselineEntry>();
  for (const f of failures) {
    const key = extBaselineKey(
      f.check,
      f.check_name,
      f.file ?? null,
      f.message ?? null,
    );
    const existing = summary.get(key);
    if (existing) {
      existing.count++;
    } else {
      summary.set(key, {
        check: f.check,
        check_name: f.check_name,
        file: f.file ?? null,
        message: f.message ?? null,
        count: 1,
      });
    }
  }
  const baseline: ExtensionsNgBaseline = {
    version: 1,
    rule_id: "CHECK-EXTENSIONS-NG-BASELINE",
    generated_at: new Date().toISOString().slice(0, 10),
    entries: [...summary.values()].sort((a, b) => a.check - b.check),
  };
  writeExtensionsNgBaseline(repoRoot, baseline);
  console.error(
    `[check_extensions] NG baseline regenerated: ${baseline.entries.length} entries (${failures.length} total failures).`,
  );
}

export interface ScenarioResult {
  id: string;
  name: string;
  expected: string;
  actual: string;
  pass: boolean;
  detail?: string;
}

interface FixtureSpec {
  flatExtensions: Array<{ name: string; kind: string; id: string }>;
  internalExtensions: Array<{ parent: string; id: string }>;
  rawFiles?: Array<{ name: string; content: string }>;
}

function writeMinimalSkill(dir: string, name: string): void {
  const skillDir = path.join(dir, SKILLS_DIR, name);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(
    path.join(skillDir, "SKILL.md"),
    `---\nname: ${name}\ndescription: fixture skill for extension scenario validation\n---\n`,
    "utf-8",
  );
}

function buildScenarioFixture(baseDir: string, spec: FixtureSpec): string {
  const root = fs.mkdtempSync(path.join(baseDir, "ext-scenario-"));
  const commandDir = path.join(root, PUBLIC_COMMAND_DIR);
  fs.mkdirSync(commandDir, { recursive: true });
  fs.writeFileSync(
    path.join(commandDir, "demo.md"),
    "---\ndescription: fixture command\n---\n# demo\n",
    "utf-8",
  );
  writeMinimalSkill(root, "agentdev-workflow-demo");
  writeMinimalSkill(root, "agentdev-cap-demo");
  writeMinimalSkill(root, "agentdev-workflow-cross");
  const extDir = path.join(root, EXTENSIONS_SKILLS_DIR);
  fs.mkdirSync(extDir, { recursive: true });
  for (const flat of spec.flatExtensions) {
    fs.writeFileSync(
      path.join(extDir, `${flat.name}.yaml`),
      `version: 1\nkind: ${flat.kind}\nid: ${flat.id}\n\ncontext: []\nrules: []\nchecks: []\nacceptance_gates: []\nmust_not: []\n`,
      "utf-8",
    );
  }
  for (const internal of spec.internalExtensions) {
    const internalDir = path.join(extDir, internal.parent);
    fs.mkdirSync(internalDir, { recursive: true });
    fs.writeFileSync(
      path.join(internalDir, "internal.yaml"),
      `version: 1\nkind: internal-workflow-extension\nid: ${internal.id}\n\ncontext: []\nrules: []\nchecks: []\nacceptance_gates: []\nmust_not: []\n`,
      "utf-8",
    );
  }
  for (const raw of spec.rawFiles ?? []) {
    fs.writeFileSync(path.join(extDir, raw.name), raw.content, "utf-8");
  }
  return root;
}

function readFixtureExtension(root: string, relPath: string): string | null {
  const abs = path.join(root, EXTENSIONS_SKILLS_DIR, relPath);
  try {
    return fs.readFileSync(abs, "utf-8") as string;
  } catch {
    return null;
  }
}

function scenario(
  id: string,
  name: string,
  expected: string,
  actual: string,
  pass: boolean,
  detail?: string,
): ScenarioResult {
  return { id, name, expected, actual, pass, detail };
}

/**
 * TS-006 extension scenarios, executed against disposable fixtures.
 * Each scenario exercises a load-time state branch of resolveExtensionState
 * plus the matching deterministic check classification.
 */
export function runExtensionScenarios(baseDir?: string): ScenarioResult[] {
  const tmpBase = baseDir ?? fs.mkdtempSync(path.join(os.tmpdir(), "agentdev-ext-scenarios-"));
  const createdRoots: string[] = [];
  const results: ScenarioResult[] = [];
  try {
    // S1: absent -> missing / standard continue
    {
      const root = buildScenarioFixture(tmpBase, { flatExtensions: [], internalExtensions: [] });
      createdRoots.push(root);
      const resolution = resolveExtensionState(
        readFixtureExtension(root, "agentdev-workflow-demo.yaml"),
      );
      const report = checkExtensions(root);
      results.push(
        scenario(
          "S1",
          "extension absent -> missing / standard continue",
          "state=missing, checker ok=true",
          `state=${resolution.state}, checker ok=${report.ok}`,
          resolution.state === "missing" && report.ok,
        ),
      );
    }

    // S2: valid workflow-extension
    {
      const root = buildScenarioFixture(tmpBase, {
        flatExtensions: [{ name: "agentdev-workflow-demo", kind: "workflow-extension", id: "agentdev-workflow-demo" }],
        internalExtensions: [],
      });
      createdRoots.push(root);
      const resolution = resolveExtensionState(
        readFixtureExtension(root, "agentdev-workflow-demo.yaml"),
      );
      const report = checkExtensions(root);
      results.push(
        scenario(
          "S2",
          "valid workflow-extension -> normal processing",
          "state=valid(workflow-extension), checker ok=true",
          `state=${resolution.state}(${(resolution as any).kind ?? "-"}), checker ok=${report.ok}`,
          resolution.state === "valid" && report.ok,
        ),
      );
    }

    // S3: valid internal-workflow-extension
    {
      const root = buildScenarioFixture(tmpBase, {
        flatExtensions: [],
        internalExtensions: [{ parent: "agentdev-workflow-demo", id: "agentdev-workflow-demo" }],
      });
      createdRoots.push(root);
      const resolution = resolveExtensionState(
        readFixtureExtension(root, "agentdev-workflow-demo/internal.yaml"),
      );
      const report = checkExtensions(root);
      results.push(
        scenario(
          "S3",
          "valid internal-workflow-extension -> normal processing",
          "state=valid(internal-workflow-extension), checker ok=true",
          `state=${resolution.state}(${(resolution as any).kind ?? "-"}), checker ok=${report.ok}`,
          resolution.state === "valid" && report.ok,
        ),
      );
    }

    // S4: valid capability-skill-extension (incl. cross-cutting agentdev-workflow-* name without a command)
    {
      const root = buildScenarioFixture(tmpBase, {
        flatExtensions: [
          { name: "agentdev-cap-demo", kind: "capability-skill-extension", id: "agentdev-cap-demo" },
          { name: "agentdev-workflow-cross", kind: "capability-skill-extension", id: "agentdev-workflow-cross" },
        ],
        internalExtensions: [],
      });
      createdRoots.push(root);
      const resolution = resolveExtensionState(
        readFixtureExtension(root, "agentdev-cap-demo.yaml"),
      );
      const report = checkExtensions(root);
      results.push(
        scenario(
          "S4",
          "valid capability-skill-extension -> normal processing",
          "state=valid(capability-skill-extension), checker ok=true",
          `state=${resolution.state}(${(resolution as any).kind ?? "-"}), checker ok=${report.ok}`,
          resolution.state === "valid" && report.ok,
        ),
      );
    }

    // S5: legacy command-extension -> migration-required stop
    {
      const root = buildScenarioFixture(tmpBase, {
        flatExtensions: [{ name: "agentdev-workflow-demo", kind: "command-extension", id: "/agentdev/demo" }],
        internalExtensions: [],
      });
      createdRoots.push(root);
      const resolution = resolveExtensionState(
        readFixtureExtension(root, "agentdev-workflow-demo.yaml"),
      );
      const report = checkExtensions(root);
      const mrFailures = report.failures.filter((f) => f.classification === "migration-required");
      results.push(
        scenario(
          "S5",
          "legacy command-extension -> migration-required + stop",
          "state=migration-required, checker classification=migration-required, ok=false",
          `state=${resolution.state}, classification entries=${mrFailures.length}, ok=${report.ok}`,
          resolution.state === "migration-required" && mrFailures.length > 0 && !report.ok,
        ),
      );
    }

    // S6: legacy skill-extension -> migration-required stop
    {
      const root = buildScenarioFixture(tmpBase, {
        flatExtensions: [{ name: "agentdev-cap-demo", kind: "skill-extension", id: "agentdev-cap-demo" }],
        internalExtensions: [],
      });
      createdRoots.push(root);
      const resolution = resolveExtensionState(
        readFixtureExtension(root, "agentdev-cap-demo.yaml"),
      );
      const report = checkExtensions(root);
      const mrFailures = report.failures.filter((f) => f.classification === "migration-required");
      results.push(
        scenario(
          "S6",
          "legacy skill-extension -> migration-required + stop",
          "state=migration-required, checker classification=migration-required, ok=false",
          `state=${resolution.state}, classification entries=${mrFailures.length}, ok=${report.ok}`,
          resolution.state === "migration-required" && mrFailures.length > 0 && !report.ok,
        ),
      );
    }

    // S7: malformed (YAML syntax error / missing required fields) -> fail-open at runtime
    {
      const root = buildScenarioFixture(tmpBase, {
        flatExtensions: [],
        internalExtensions: [],
        rawFiles: [
          {
            name: "agentdev-workflow-demo.yaml",
            content: ":\n\t- ][{ ::\n\tversion: [[[\n",
          },
          {
            name: "agentdev-cap-demo.yaml",
            content: "version: 1\nkind: workflow-extension\n",
          },
        ],
      });
      createdRoots.push(root);
      const r1 = resolveExtensionState(readFixtureExtension(root, "agentdev-workflow-demo.yaml"));
      const r2 = resolveExtensionState(readFixtureExtension(root, "agentdev-cap-demo.yaml"));
      const report = checkExtensions(root);
      const malformedEntries = report.failures.filter((f) => f.classification === "malformed");
      results.push(
        scenario(
          "S7",
          "malformed extension -> fail-open (error display + ignore + standard continue)",
          "state=malformed for both files, checker classification=malformed, ok=false",
          `syntax=${r1.state}, missing-fields=${r2.state}, malformed entries=${malformedEntries.length}, ok=${report.ok}`,
          r1.state === "malformed" && r2.state === "malformed" && malformedEntries.length > 0 && !report.ok,
        ),
      );
    }

    // S8: Workflow Extension must not implicitly propagate to a Capability Skill
    {
      const root = buildScenarioFixture(tmpBase, {
        flatExtensions: [
          { name: "agentdev-workflow-demo", kind: "workflow-extension", id: "agentdev-workflow-demo" },
          { name: "agentdev-cap-demo", kind: "workflow-extension", id: "agentdev-cap-demo" },
        ],
        internalExtensions: [],
      });
      createdRoots.push(root);
      const report = checkExtensions(root);
      const propagation = report.failures.filter(
        (f) =>
          f.check_name === "capability-workflow-classification" &&
          f.message.includes("agentdev-cap-demo"),
      );
      const wfDemoFailures = report.failures.filter((f) =>
        (f.file ?? "").endsWith("agentdev-workflow-demo.yaml"),
      );
      results.push(
        scenario(
          "S8",
          "workflow-extension on a Capability Skill placement is rejected (no implicit propagation)",
          "classification-consistency failure mentions agentdev-cap-demo; the valid workflow-extension file itself yields 0 failures",
          `violations=${propagation.length}, wf-demo failures=${wfDemoFailures.length}, ok=${report.ok}`,
          propagation.length > 0 && wfDemoFailures.length === 0 && !report.ok,
        ),
      );
    }

    // S9 (extra, TS-004 subcheck evidence): unknown kind -> schema violation stop
    {
      const root = buildScenarioFixture(tmpBase, {
        flatExtensions: [{ name: "agentdev-workflow-demo", kind: "solar-extension", id: "agentdev-workflow-demo" }],
        internalExtensions: [],
      });
      createdRoots.push(root);
      const resolution = resolveExtensionState(
        readFixtureExtension(root, "agentdev-workflow-demo.yaml"),
      );
      const report = checkExtensions(root);
      const svFailures = report.failures.filter((f) => f.classification === "schema-violation");
      results.push(
        scenario(
          "S9",
          "unknown kind -> schema violation + stop (no fail-open)",
          "state=schema-violation, checker classification=schema-violation, ok=false",
          `state=${resolution.state}, classification entries=${svFailures.length}, ok=${report.ok}`,
          resolution.state === "schema-violation" && svFailures.length > 0 && !report.ok,
        ),
      );
    }

    return results;
  } finally {
    for (const root of createdRoots) {
      fs.rmSync(root, { recursive: true, force: true });
    }
    if (baseDir === undefined) {
      fs.rmSync(tmpBase, { recursive: true, force: true });
    }
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const updateBaseline = args.includes("--update-ng-baseline");
  const scenarioMode = args.includes("--scenario");
  const positional = args.filter((a) => !a.startsWith("--"));
  const repoRoot = positional[0] || process.cwd();
  if (scenarioMode) {
    const results = runExtensionScenarios();
    const failed = results.filter((r) => !r.pass);
    if (json) {
      process.stdout.write(JSON.stringify({ ok: failed.length === 0, results }, null, 2) + "\n");
    } else {
      process.stdout.write(`check_extensions.ts --scenario (TS-006 extension scenarios)\n`);
      process.stdout.write(`============================================================\n`);
      for (const r of results) {
        process.stdout.write(
          `[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.name}\n  expected: ${r.expected}\n  actual:   ${r.actual}\n`,
        );
      }
      process.stdout.write(
        `\n${results.length - failed.length}/${results.length} scenarios passed\n`,
      );
    }
    process.exit(failed.length === 0 ? 0 : 1);
  }
  const report = checkExtensions(repoRoot);
  if (updateBaseline) {
    updateExtensionsNgBaseline(repoRoot, report.failures);
    process.exit(0);
  }
  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stdout.write(`check_extensions.ts - IR-056 validation (new-kind era)\n`);
    process.stdout.write(`=====================================================\n`);
    process.stdout.write(`repoRoot: ${repoRoot}\n`);
    process.stdout.write(`ok: ${report.ok}\n`);
    process.stdout.write(`stats: ${JSON.stringify(report.stats, null, 2)}\n`);
    process.stdout.write(`failures (${report.failures.length}):\n`);
    for (const f of report.failures) {
      process.stdout.write(
        `  [${f.severity}/${f.classification}] check #${f.check} ${f.check_name}${f.file ? ` (${f.file})` : ""}: ${f.message}\n`,
      );
    }
  }
  process.exit(report.ok ? 0 : 1);
}
