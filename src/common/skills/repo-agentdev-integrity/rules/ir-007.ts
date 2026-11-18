// rules/ir-007.ts — Skill frontmatter name ↔ dir。
// ルール詳細: docs/designs/integrity/rules/IR-007-skill-name-dir-match.md

import type {
  IntegrityContext,
  IntegrityRule,
  RuleViolation,
} from "../engine/types.ts";

const SKILLS_DIR = "src/common/skills";

/** Design checker-execution-contracts が名指しする third-party Skills。 */
const NAMED_THIRD_PARTY_SKILLS = ["explainer", "explainer-book", "first-reader", "yomiyasu"] as const;

/**
 * src/third-party/skills.yaml に宣言された third-party skill 名集合。
 * 宣言読込は fail-closed（読めない場合は空集合 = 未宣言扱い）。
 */
export function loadDeclaredThirdPartySkillNames(ctx: IntegrityContext): Set<string> {
  const names = new Set<string>();
  const decl = ctx.readFile("src/third-party/skills.yaml");
  if (decl === null || decl.frontmatter !== null) return names;
  let parsed: unknown;
  try {
    parsed = Bun.YAML.parse(decl.rawContent);
  } catch {
    return names;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return names;
  }
  const skills = (parsed as { skills?: unknown }).skills;
  if (!Array.isArray(skills)) return names;
  for (const entry of skills) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) continue;
    const name = (entry as { name?: unknown }).name;
    if (typeof name === "string" && name.length > 0) names.add(name);
  }
  return names;
}

export const ir007: IntegrityRule = {
  id: "IR-007",
  slug: "skill-name-dir-match",
  title: "Skill frontmatter name ↔ dir",
  description:
    "SKILL.md の frontmatter name がディレクトリ名と一致し、USE FOR 境界と reference/ 現行構造を維持する。",
  relatedReqs: ["REQ-010"],
  targetGlobs: ["src/common/skills/**/SKILL.md"],
  globalScan: false,
  severity: "strict",
  check(ctx: IntegrityContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const declaredThirdParty = loadDeclaredThirdPartySkillNames(ctx);
    for (const named of NAMED_THIRD_PARTY_SKILLS) {
      declaredThirdParty.add(named);
    }

    for (const dir of ctx.listDir(SKILLS_DIR)) {
      const skillMdPath = `${SKILLS_DIR}/${dir}/SKILL.md`;
      const file = ctx.readFile(skillMdPath);
      if (file === null) continue;
      if (file.frontmatter === null) continue;

      const fmName = file.frontmatter["name"];
      if (typeof fmName === "string" && fmName !== dir) {
        violations.push({
          ruleId: "IR-007",
          severity: "error",
          filePath: skillMdPath,
          message: `SKILL.md name '${fmName}' does not match directory '${dir}'`,
          remediationHint: "name must match directory name",
        });
      }

      const isDeclaredThirdParty = declaredThirdParty.has(dir);
      if (
        !isDeclaredThirdParty &&
        !file.rawContent.includes("USE FOR") &&
        !file.rawContent.includes("use for")
      ) {
        violations.push({
          ruleId: "IR-007",
          severity: "warning",
          filePath: skillMdPath,
          message: `Skill '${dir}' has no USE FOR section — boundary unclear`,
          remediationHint: "USE FOR section should exist",
        });
      }

      const hasObsoleteReferenceDir =
        ctx.pathExists(`${SKILLS_DIR}/${dir}/reference`);
      if (hasObsoleteReferenceDir) {
        violations.push({
          ruleId: "IR-007",
          severity: "error",
          filePath: `${SKILLS_DIR}/${dir}/reference`,
          message: `Skill '${dir}' has obsolete 'reference/' directory (should be 'references/')`,
          remediationHint: "references/",
        });
      }
    }
    return violations;
  },
};
