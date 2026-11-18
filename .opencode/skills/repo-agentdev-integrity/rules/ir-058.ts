// rules/ir-058.ts — distribution-untracked-skill-reference。
// ルール詳細: docs/designs/integrity/rules/IR-058-distribution-untracked-skill-reference.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";
import { loadDeclaredThirdPartySkillNames } from "./ir-007.ts";

/** 配布物として参照スキャンの対象となるルート。 */
const DISTRIBUTION_SCAN_GLOBS = [
  "src/common/commands/agentdev/**/*.md",
  "src/common/skills/**/SKILL.md",
  "src/common/skills/**/*.md",
] as const;

const EXEMPT_PATH_PATTERNS: RegExp[] = [
  /\/integrity-rule-catalog\.md$/,
  /\/rules\/IR-058[-/]/,
  /\/runtime-package-boundary\.md$/,
  /\/vocabulary-registry\.md$/,
];

function isExemptPath(relPath: string): boolean {
  return EXEMPT_PATH_PATTERNS.some((re) => re.test(relPath));
}

function buildReferencePattern(skillName: string): RegExp {
  const escaped = skillName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    "(" +
      "\\.opencode/skills/" + escaped + "(?=[/\\s\"'`]|$)" +
      "|" +
      "src/common/skills/" + escaped + "(?=[/\\s\"'`]|$)" +
      "|" +
      "`" + escaped + "`" +
      "|" +
      "\\b" + escaped + "\\s*スキル" +
      "|" +
      "\\b" + escaped + "スキル" +
      "|" +
      'load_skills\\s*[=:].*?"[^"]*\\b' + escaped + '\\b[^"]*"' +
      ")",
    "g",
  );
}

function isMarkdownRelPath(name: string): boolean {
  return name.endsWith(".md");
}

export const ir058: IntegrityRule = {
  id: "IR-058",
  slug: "distribution-untracked-skill-reference",
  title: "distribution-untracked-skill-reference",
  description:
    "投影限定の未宣言 skill 名が配布物から参照されていないことを 3 分岐判断で検証する（repo-local 除外・宣言済み third-party 除外・未宣言参照は違反）。",
  relatedReqs: ["REQ-002-001", "REQ-002-002", "REQ-002-003"],
  targetGlobs: [
    "src/common/commands/agentdev/**/*.md",
    "src/common/skills/**/*.md",
    "src/third-party/skills.yaml",
    ".opencode/skills/**",
  ],
  globalScan: true,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const sourceSkillDirs = new Set(ctx.listDir("src/common/skills"));
    const projectionSkillDirs = ctx.listDir(".opencode/skills");

    const projectionOnlySkills = projectionSkillDirs.filter(
      (d) => !sourceSkillDirs.has(d) && !d.startsWith("repo-"),
    );
    if (projectionOnlySkills.length === 0) {
      return violations;
    }

    const declaredSkillNames = loadDeclaredThirdPartySkillNames(ctx);
    const undeclaredProjectionOnly = projectionOnlySkills.filter(
      (d) => !declaredSkillNames.has(d),
    );
    if (undeclaredProjectionOnly.length === 0) {
      return violations;
    }

    const seen = new Set<string>();
    const targets: string[] = [];
    for (const glob of DISTRIBUTION_SCAN_GLOBS) {
      for (const file of ctx.getFilesByGlob(glob)) {
        if (seen.has(file.path)) continue;
        seen.add(file.path);
        if (isMarkdownRelPath(file.path)) targets.push(file.path);
      }
    }

    for (const skillName of undeclaredProjectionOnly) {
      const refPattern = buildReferencePattern(skillName);
      let evidence: { file: string; line: number; text: string } | null = null;
      for (const targetPath of targets) {
        if (isExemptPath(targetPath)) continue;
        const file = ctx.readFile(targetPath);
        if (file === null) continue;
        for (let i = 0; i < file.lines.length; i++) {
          refPattern.lastIndex = 0;
          if (refPattern.test(file.lines[i] ?? "")) {
            evidence = {
              file: targetPath,
              line: i + 1,
              text: (file.lines[i] ?? "").trim(),
            };
            break;
          }
        }
        if (evidence !== null) break;
      }
      if (evidence !== null) {
        violations.push({
          ruleId: "IR-058",
          severity: "error",
          filePath: evidence.file,
          line: evidence.line,
          message:
            `Skill '${skillName}' is referenced by distribution (${evidence.file}:${evidence.line}) ` +
            "but exists only in .opencode/skills/ and is not declared in src/third-party/skills.yaml. " +
            "Promote to src/common/skills/ or register it in src/third-party/skills.yaml (v2:ADR-0134/v2:REQ-0159-001).",
          remediationHint: `src/common/skills/${skillName}/ or src/third-party/skills.yaml declaration of '${skillName}'`,
        });
      }
    }
    return violations;
  },
};
