// lib/extensions-integrity.ts — IR-056（project-extensions-integrity）の検出本体。
// 移植元: 旧 check_extensions.ts checkExtensions（check #1〜#13）。
// I/O は IntegrityContext 経由のみ（ルール内直接 fs/glob 呼出禁止の契約に準拠）。

import type { IntegrityContext } from "../engine/types.ts";
import {
  NEW_EXTENSION_KINDS,
  parseExtensionYaml,
  resolveExtensionState,
  validateExtensionEntries,
} from "../../agentdev-project-extensions/scripts/lib/extension_state.ts";

export { NEW_EXTENSION_KINDS, resolveExtensionState };
export type { ExtensionKind, ExtensionResolution } from "../../agentdev-project-extensions/scripts/lib/extension_state.ts";

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
}

const PUBLIC_COMMAND_DIR = "src/common/commands/agentdev";
const SKILLS_DIR = "src/common/skills";
const REPO_LOCAL_SKILLS_DIR = ".opencode/skills";
const EXTENSIONS_COMMANDS_DIR = ".agentdev/extensions/commands";
const EXTENSIONS_SKILLS_DIR = ".agentdev/extensions/skills";
const LEGACY_DOC_INPUTS_DIR = ".agentdev/doc-inputs";

const OVERRIDE_PHRASES = [
  "置き換える",
  "default を変更",
  "defaultを変更",
  "標準動作を置き換え",
  "override standard",
  "replace default",
];

const INTERNAL_LIFECYCLE_COMMANDS = [
  "case-open",
  "case-ready",
  "case-run",
  "case-close",
  "case-revise",
] as const;

export interface SkillClassification {
  workflowSkills: Set<string>;
  capabilitySkills: Set<string>;
}

/** Workflow/Capability の決定的分類（Workflow Skill = agentdev-workflow-{X} に command 実在）。 */
export function deriveSkillClassification(ctx: IntegrityContext): SkillClassification {
  const workflowSkills = new Set<string>();
  for (const file of ctx.getFilesByGlob(`${PUBLIC_COMMAND_DIR}/*.md`)) {
    const base = (file.path.split("/").pop() ?? "").replace(/\.md$/, "");
    if (base === "README") continue;
    workflowSkills.add(`agentdev-workflow-${base}`);
  }
  for (const base of INTERNAL_LIFECYCLE_COMMANDS) {
    workflowSkills.add(`agentdev-workflow-${base}`);
  }
  const capabilitySkills = new Set<string>();
  for (const d of ctx.listDir(SKILLS_DIR)) {
    if (!d.startsWith("agentdev-")) continue;
    if (!ctx.pathExists(`${SKILLS_DIR}/${d}/SKILL.md`) && !ctx.pathExists(`${SKILLS_DIR}/${d}`)) continue;
    if (!workflowSkills.has(d)) capabilitySkills.add(d);
  }
  return { workflowSkills, capabilitySkills };
}

interface ExtensionWalkResult {
  pathsReferenced: string[];
  skillsReferenced: string[];
  failures: CheckFailure[];
}

function walkExtension(
  parsedDoc: unknown,
  rcText: string,
  rcFile: string,
): ExtensionWalkResult {
  const pathsReferenced: string[] = [];
  const skillsReferenced: string[] = [];
  const failures: CheckFailure[] = [];

  for (const message of validateExtensionEntries(parsedDoc)) {
    failures.push({
      check: 11,
      check_name: "extension-structure",
      severity: "strict",
      classification: "malformed",
      file: rcFile,
      message,
    });
  }

  const doc =
    parsedDoc !== null && typeof parsedDoc === "object" && !Array.isArray(parsedDoc)
      ? (parsedDoc as Record<string, unknown>)
      : null;
  if (doc) {
    if (Array.isArray(doc.context)) {
      for (const e of doc.context) {
        if (!e || typeof e !== "object" || Array.isArray(e)) continue;
        const entry = e as Record<string, unknown>;
        if (Array.isArray(entry.paths)) {
          for (const p of entry.paths) {
            if (typeof p === "string") pathsReferenced.push(p);
          }
        }
      }
    }
    for (const sec of ["rules", "checks"] as const) {
      if (Array.isArray(doc[sec])) {
        for (const e of doc[sec]) {
          if (!e || typeof e !== "object" || Array.isArray(e)) continue;
          const entry = e as Record<string, unknown>;
          if (typeof entry.skill === "string" && entry.skill.length > 0) {
            skillsReferenced.push(entry.skill);
          }
        }
      }
    }
  }

  for (const phrase of OVERRIDE_PHRASES) {
    if (rcText.includes(phrase)) {
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

  return { pathsReferenced, skillsReferenced, failures };
}

function projectLocalSkillExists(ctx: IntegrityContext, skillName: string): boolean {
  if (ctx.pathExists(`${SKILLS_DIR}/${skillName}`)) return true;
  if (ctx.pathExists(`${REPO_LOCAL_SKILLS_DIR}/${skillName}`)) return true;
  // src/third-party/skills.yaml に宣言済みの third-party skill（yomiyasu 等の
  // .opencode/skills 投影物）も既知配置として許容する。worktree（junction・
  // third-party 投影未伝播、REQ-018）では宣言で判定しないと環境差の誤検出になる。
  return isDeclaredThirdPartySkill(ctx, skillName);
}

function isDeclaredThirdPartySkill(ctx: IntegrityContext, skillName: string): boolean {
  const decl = ctx.readFile("src/third-party/skills.yaml");
  if (decl === null || decl.frontmatter !== null) return false;
  try {
    const parsed = Bun.YAML.parse(decl.rawContent);
    const skills = parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as { skills?: unknown }).skills
      : null;
    if (!Array.isArray(skills)) return false;
    return skills.some(
      (entry) =>
        typeof entry === "object" && entry !== null && !Array.isArray(entry) &&
        (entry as { name?: unknown }).name === skillName,
    );
  } catch {
    return false;
  }
}

/** ctx.files に含まれない拡張子を含む残存検出用の再帰列挙（ctx.listDir 経由のみ）。 */
function listEntriesRecursive(ctx: IntegrityContext, relDir: string): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const name of ctx.listDir(dir)) {
      const child = `${dir}/${name}`;
      if (ctx.pathExists(child) && ctx.readFile(child) === null && !child.endsWith(".md") && !child.endsWith(".yaml")) {
        walk(child);
        out.push(child);
        continue;
      }
      out.push(child);
    }
  };
  walk(relDir);
  return out;
}

export function checkExtensions(ctx: IntegrityContext): CheckReport {
  const failures: CheckFailure[] = [];
  const classification = deriveSkillClassification(ctx);

  const commandsDirEntries = ctx.listDir(EXTENSIONS_COMMANDS_DIR).length > 0;
  if (commandsDirEntries) {
    const count = listEntriesRecursive(ctx, EXTENSIONS_COMMANDS_DIR).length;
    if (count > 0) {
      failures.push({
        check: 7,
        check_name: "extensions-commands-dir-residual",
        severity: "strict",
        classification: "migration-required",
        file: EXTENSIONS_COMMANDS_DIR,
        message: `${EXTENSIONS_COMMANDS_DIR}/** still contains ${count} file(s); the commands extension directory is abolished — migrate every file to ${EXTENSIONS_SKILLS_DIR} with a new kind`,
      });
    }
  }

  const extensionYamls = ctx.getFilesByGlob(`${EXTENSIONS_SKILLS_DIR}/**/*.yaml`);
  const extensionYmls = ctx.getFilesByGlob(`${EXTENSIONS_SKILLS_DIR}/**/*.yml`);

  for (const file of [...extensionYamls, ...extensionYmls]) {
    const rc = file.path;
    const rcText = file.rawContent;
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

    if (resolution.state !== "valid") continue;
    const kind = resolution.kind;
    const relPath = rc.startsWith(`${EXTENSIONS_SKILLS_DIR}/`)
      ? rc.slice(EXTENSIONS_SKILLS_DIR.length + 1)
      : rc;
    const segments = relPath.split("/");

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

    const reparsed = parseExtensionYaml(rcText);
    const parsedDoc = reparsed.ok ? reparsed.data : null;
    const id =
      parsedDoc !== null &&
      typeof parsedDoc === "object" &&
      typeof (parsedDoc as Record<string, unknown>).id === "string"
        ? ((parsedDoc as Record<string, unknown>).id as string)
        : "";

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
      if (id && !projectLocalSkillExists(ctx, id)) {
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
      if (id && !projectLocalSkillExists(ctx, id)) {
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

    const walk = walkExtension(parsedDoc, rcText, rc);
    failures.push(...walk.failures);

    for (const p of walk.pathsReferenced) {
      if (!ctx.pathExists(p)) {
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

    for (const skillName of walk.skillsReferenced) {
      if (!projectLocalSkillExists(ctx, skillName)) {
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

  if (ctx.pathExists(LEGACY_DOC_INPUTS_DIR)) {
    const legacyCount = listEntriesRecursive(ctx, LEGACY_DOC_INPUTS_DIR).length;
    if (legacyCount > 0) {
      failures.push({
        check: 12,
        check_name: "legacy-doc-inputs-residual",
        severity: "warning",
        classification: "heuristic",
        file: LEGACY_DOC_INPUTS_DIR,
        message: `legacy .agentdev/doc-inputs/** still contains ${legacyCount} file(s); migration to extensions should remove them`,
      });
    }
  }

  return {
    ok: failures.filter((f) => f.severity === "strict").length === 0,
    failures,
  };
}
