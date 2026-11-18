// rules/reference-path-core.ts — IR-008 / IR-062 共有のパス参照実在検出コア。
// 検出ロジックは旧 check_integrity.ts checkScriptTemplateReferencePaths を引き継ぎ、
// 正本（src/common/**）を第一解決先とする。ルール内の I/O は IntegrityContext 経由のみ。

import type {
  IntegrityContext,
  ParsedFile,
  RuleViolation,
} from "../engine/types.ts";

const PATH_SEGMENT = "[\\w`{}<>.-]+";
const SKILLS_DIR = "src/common/skills";
const COMMANDS_DIR = "src/common/commands/agentdev";

export const SCRIPT_TEMPLATE_REF_PATTERNS: readonly RegExp[] = [
  new RegExp(
    `\\.opencode\\/skills\\/(agentdev-${PATH_SEGMENT}\\/(?:scripts\\/${PATH_SEGMENT}(?:\\/${PATH_SEGMENT})*\\.ts|templates\\/${PATH_SEGMENT}(?:\\/${PATH_SEGMENT})*\\.md|references\\/${PATH_SEGMENT}(?:\\/${PATH_SEGMENT})*\\.md))`,
    "g",
  ),
  new RegExp(
    `(\\.opencode\\/commands\\/agentdev\\/templates\\/${PATH_SEGMENT}(?:\\/${PATH_SEGMENT})*\\.md)`,
    "g",
  ),
  new RegExp(
    `(?<![.\\w\\/-])(scripts\\/${PATH_SEGMENT}(?:\\/${PATH_SEGMENT})*\\.ts|templates\\/${PATH_SEGMENT}(?:\\/${PATH_SEGMENT})*\\.md|references\\/${PATH_SEGMENT}(?:\\/${PATH_SEGMENT})*\\.md)`,
    "g",
  ),
];

function isInsideCodeBlock(lines: string[], lineIndex: number): boolean {
  let count = 0;
  for (let i = 0; i < lineIndex; i++) {
    if ((lines[i] ?? "").trimStart().startsWith("```")) count++;
  }
  return count % 2 === 1;
}

function isTemplatePlaceholder(refPath: string): boolean {
  if (/\{[^}]*\}/.test(refPath)) return true;
  if (/<[^<>]+>/.test(refPath)) return true;
  return false;
}

/** 参照パスを正本基準で解決し、実在確認すべき repo ルート相対パスを返す。 */
export function resolveReferencePath(
  refPath: string,
  sourceFilePath: string,
  ctx: IntegrityContext,
): string {
  if (refPath.startsWith(".opencode/")) {
    const mapped = refPath
      .replace(/^\.opencode\/plugins\//, "src/opencode/plugins/")
      .replace(/^\.opencode\//, "src/common/");
    if (ctx.pathExists(mapped)) return mapped;
    return refPath;
  }
  if (refPath.startsWith("agentdev-")) {
    return `${SKILLS_DIR}/${refPath}`;
  }
  const skillsPrefix = ".opencode/skills/";
  const srcSkillsPrefix = "src/common/skills/";
  const sourcePrefix = sourceFilePath.startsWith(skillsPrefix)
    ? skillsPrefix
    : sourceFilePath.startsWith(srcSkillsPrefix)
      ? srcSkillsPrefix
      : null;
  if (sourcePrefix) {
    const afterSkills = sourceFilePath.slice(sourcePrefix.length);
    const slashIdx = afterSkills.indexOf("/");
    if (slashIdx >= 0) {
      const skillDir = afterSkills.slice(0, slashIdx);
      return `${SKILLS_DIR}/${skillDir}/${refPath}`;
    }
  }
  return refPath;
}

export interface ReferencePathCoreOptions {
  /** 報告に使用するルール ID（IR-008 / IR-062）。 */
  ruleId: string;
  /** 検査対象ファイル（command md 群、SKILL.md 群、references md 群）。 */
  files: readonly ParsedFile[];
  /** 対象が SKILL.md/references 由来か（IR-008 視点）。cross-skill 検出は SKILL.md のみ。 */
  isSkillScope: boolean;
}

export function checkReferencePaths(
  ctx: IntegrityContext,
  options: ReferencePathCoreOptions,
): RuleViolation[] {
  const violations: RuleViolation[] = [];
  const ruleId = options.ruleId;
  const skillDirs = ctx.listDir(SKILLS_DIR);
  const srcSkillDirCandidates = [
    SKILLS_DIR,
    "src/opencode/skills",
  ].filter((dir) => ctx.pathExists(dir));

  for (const file of options.files) {
    const sourceFilePath = file.path;
    const skillDir = sourceFilePath.startsWith(`${SKILLS_DIR}/`)
      ? (sourceFilePath.split("/")[3] ?? undefined)
      : undefined;
    const isReferenceFile = /\/references\//.test(sourceFilePath);

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i] ?? "";
      if (isInsideCodeBlock(file.lines, i)) continue;

      for (const regex of SCRIPT_TEMPLATE_REF_PATTERNS) {
        regex.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(line)) !== null) {
          const rawRef = match[1]!;
          const normalizedRef = rawRef.replace(/`/g, "");
          if (isTemplatePlaceholder(normalizedRef)) continue;
          if (normalizedRef.includes("*")) continue;

          if (
            normalizedRef.startsWith(".agentdev/") ||
            normalizedRef.startsWith(".sisyphus/")
          ) {
            const resolved = resolveReferencePath(normalizedRef, sourceFilePath, ctx);
            const parentDir = resolved.split("/").slice(0, -1).join("/");
            if (!ctx.pathExists(parentDir)) {
              violations.push({
                ruleId,
                severity: "error",
                filePath: sourceFilePath,
                line: i + 1,
                message: `Parent directory does not exist for runtime-generated path: ${rawRef}`,
                remediationHint: `parent directory must exist at ${parentDir}`,
              });
            }
            continue;
          }

          const resolvedPath = resolveReferencePath(normalizedRef, sourceFilePath, ctx);
          if (ctx.pathExists(resolvedPath)) continue;

          let contextResolved = false;
          const isSkillRelativeBare =
            !normalizedRef.startsWith(".opencode/") &&
            !normalizedRef.startsWith("agentdev-") &&
            /^(scripts|templates|references)\//.test(normalizedRef);
          if ((skillDir === undefined || isReferenceFile) && isSkillRelativeBare) {
            const ctxStart = Math.max(0, i - 5);
            const contextSlice = file.lines.slice(ctxStart, Math.min(file.lines.length, i + 6)).join("\n");
            const candidateSkills: string[] = [];
            const seenSkills = new Set<string>();
            for (const m of contextSlice.matchAll(/\b(agentdev-[a-z][a-z0-9-]*)\b/g)) {
              if (!seenSkills.has(m[1]!)) {
                seenSkills.add(m[1]!);
                candidateSkills.push(m[1]!);
              }
            }
            for (const baseDir of srcSkillDirCandidates) {
              for (const otherSkill of ctx.listDir(baseDir)) {
                if (otherSkill.startsWith("agentdev-") && !seenSkills.has(otherSkill)) {
                  seenSkills.add(otherSkill);
                  candidateSkills.push(otherSkill);
                }
              }
            }
            for (const candidate of candidateSkills) {
              if (ctx.pathExists(`${SKILLS_DIR}/${candidate}/${normalizedRef}`)) {
                contextResolved = true;
                break;
              }
              if (ctx.pathExists(`src/opencode/skills/${candidate}/${normalizedRef}`)) {
                contextResolved = true;
                break;
              }
            }
          }
          if (contextResolved) continue;

          let crossSkillFound = false;
          if (
            options.isSkillScope &&
            skillDir !== undefined &&
            !isReferenceFile &&
            !normalizedRef.startsWith(".opencode/")
          ) {
            for (const otherSkill of skillDirs) {
              if (otherSkill === skillDir) continue;
              if (ctx.pathExists(`${SKILLS_DIR}/${otherSkill}/${normalizedRef}`)) {
                crossSkillFound = true;
                violations.push({
                  ruleId,
                  severity: "error",
                  filePath: sourceFilePath,
                  line: i + 1,
                  message: `Referenced path does not exist in current skill but found in ${otherSkill}: ${rawRef}`,
                  remediationHint: `use explicit path: ${SKILLS_DIR}/${otherSkill}/${normalizedRef} or move file to current skill`,
                });
                break;
              }
            }
          }

          if (!crossSkillFound) {
            violations.push({
              ruleId,
              severity: "error",
              filePath: sourceFilePath,
              line: i + 1,
              message: `Referenced path does not exist: ${rawRef}`,
              remediationHint: `file must exist at ${resolvedPath}`,
            });
          }
        }
      }
    }
  }
  return violations;
}

export function collectSkillScopeFiles(ctx: IntegrityContext): ParsedFile[] {
  const out: ParsedFile[] = [];
  for (const dir of ctx.listDir(SKILLS_DIR)) {
    const skillMd = ctx.readFile(`${SKILLS_DIR}/${dir}/SKILL.md`);
    if (skillMd !== null) out.push(skillMd);
    for (const name of ctx.listDir(`${SKILLS_DIR}/${dir}/references`)) {
      if (!name.endsWith(".md")) continue;
      const refFile = ctx.readFile(`${SKILLS_DIR}/${dir}/references/${name}`);
      if (refFile !== null) out.push(refFile);
    }
  }
  return out;
}

export function collectCommandScopeFiles(ctx: IntegrityContext): ParsedFile[] {
  return ctx
    .getFilesByGlob(`${COMMANDS_DIR}/*.md`)
    .filter((f) => (f.path.split("/").pop() ?? "") !== "README.md");
}
