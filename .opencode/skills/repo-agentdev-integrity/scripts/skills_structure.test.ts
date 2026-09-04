// ADF-COVERS(verification): REQ-002-013, REQ-002-014, REQ-002-015
// ADF-COVERS(implementation): REQ-018-001
// ADF-COVERS(verification): REQ-018-001, REQ-018-002
// ADF-COVERS(verification): REQ-018-003, REQ-018-004
import { describe, it, expect } from "bun:test";
import * as fs from "fs";
import * as path from "path";
const SCRIPT_DIR = import.meta.dir;
function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, ".opencode"))) return dir;
    if (fs.existsSync(path.join(dir, "src", "opencode"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}
const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
const PROJECTION_SKILLS_DIR = path.join(REPO_ROOT, ".opencode", "skills");
const SOURCE_SKILLS_DIR = path.join(REPO_ROOT, "src", "opencode", "skills");
const SKILL_PROJECTION_MANIFEST_PATH = path.join(
  REPO_ROOT,
  ".opencode",
  "skills",
  "repo-agentdev-integrity",
  "data",
  "skill-projection-manifest.yaml",
);
// worktree junction 未設定環境では projection に配布スキルが存在しないため src/opencode/ へ fallback する（REQ-018-001）。
const SKILLS_DIR = fs.existsSync(path.join(PROJECTION_SKILLS_DIR, "agentdev-workflow-templates"))
  ? PROJECTION_SKILLS_DIR
  : SOURCE_SKILLS_DIR;
// third-party 取得機構経由で配置された投影物のうち、skill-projection-manifest の
// third_party_skills 宣言（third-party 由来であることの宣言）に登録済みのものは
// 検査許容（INSPECTION-TOLERATED、IR-068 exemption、DEC-023 accepted、REQ-018-003）とする。
// 許容は検出ノイズ抑制であり走査除外ではない。未宣言の third-party 起源配置は引き続き検査対象となる。
function loadToleratedThirdPartySkills(): string[] {
  if (!fs.existsSync(SKILL_PROJECTION_MANIFEST_PATH)) return [];
  const content = fs.readFileSync(SKILL_PROJECTION_MANIFEST_PATH, "utf-8");
  const names: string[] = [];
  let inSection = false;
  for (const raw of content.split("\n")) {
    const line = raw.replace(/\r$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (/^third_party_skills:\s*$/.test(line)) {
      inSection = true;
      continue;
    }
    if (/^[A-Za-z_][\w]*:/.test(line)) {
      inSection = false;
      continue;
    }
    if (!inSection) continue;
    const m = line.match(/^\s*-\s+(.+)$/);
    if (m) names.push(m[1].trim().replace(/^["']|["']$/g, ""));
  }
  return names;
}
const toleratedThirdPartySkills = new Set(loadToleratedThirdPartySkills());
function getSkillDirs(): string[] {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => {
      if (d.isDirectory()) return true;
      // Windows junctions report isDirectory()=false; follow the link.
      try {
        return fs.statSync(path.join(SKILLS_DIR, d.name)).isDirectory();
      } catch {
        return false;
      }
    })
    .map((d) => d.name)
    .sort();
}
function parseSkillFrontmatter(content: string): Record<string, string> | null {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const body = parts[1].trim();
  const fields: Record<string, string> = {};
  for (const line of body.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    fields[key] = value;
  }
  return Object.keys(fields).length > 0 ? fields : null;
}
function extractSeeAlsoRefs(content: string): string[] {
  const refs: string[] = [];
  const seeAlsoMatch = content.match(/## See Also([\s\S]*?)$/);
  if (!seeAlsoMatch) return refs;
  const section = seeAlsoMatch[1];
  const boldPattern = /\*\*(agentdev-[a-z0-9-]+)\*\*/g;
  let match: RegExpExecArray | null;
  while ((match = boldPattern.exec(section)) !== null) {
    refs.push(match[1]);
  }
  const linkPattern = /\[(agentdev-[a-z0-9-]+)\]\([^)]*\)/g;
  while ((match = linkPattern.exec(section)) !== null) {
    refs.push(match[1]);
  }
  return [...new Set(refs)];
}
function hasSection(content: string, heading: string): boolean {
  const pattern = new RegExp(`^## .*${escapeRegex(heading)}`, "m");
  return pattern.test(content);
}
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function getSectionContent(content: string, heading: string): string {
  const escaped = escapeRegex(heading);
  const pattern = new RegExp(
    `^## .*${escaped}\\s*\\n([\\s\\S]*?)(?=^## |$)`,
    "m",
  );
  const match = content.match(pattern);
  return match ? match[1].trim() : "";
}
const skillDirs = getSkillDirs();
const skillDirSet = new Set(skillDirs);
// ADF 配布スキルの構造契約検査対象。third-party 管理登録済み配置は許容として除外される。
const adfSkillDirs = skillDirs.filter((name) => !toleratedThirdPartySkills.has(name));
describe("REQ-0030-003: Skill frontmatter required fields", () => {
  it("skill directories exist under .opencode/skills/", () => {
    expect(skillDirs.length).toBeGreaterThan(0);
  });
  for (const dirName of adfSkillDirs) {
    describe(`skill: ${dirName}`, () => {
      const skillMdPath = path.join(SKILLS_DIR, dirName, "SKILL.md");
      it("has SKILL.md", () => {
        expect(fs.existsSync(skillMdPath)).toBe(true);
      });
      if (fs.existsSync(skillMdPath)) {
        const content = fs.readFileSync(skillMdPath, "utf-8");
        const fm = parseSkillFrontmatter(content);
        it("has valid frontmatter", () => {
          expect(fm).not.toBeNull();
        });
        if (fm) {
          it("has 'name' field", () => {
            expect(fm["name"]).toBeDefined();
            expect(fm["name"]).not.toBe("");
          });
          it("has 'description' field", () => {
            expect(fm["description"]).toBeDefined();
            expect(fm["description"]).not.toBe("");
          });
        }
      }
    });
  }
});
describe("REQ-0030-004: Skill USE FOR / DO NOT USE FOR sections and See Also references", () => {
  for (const dirName of adfSkillDirs) {
    describe(`skill: ${dirName}`, () => {
      const skillMdPath = path.join(SKILLS_DIR, dirName, "SKILL.md");
      if (!fs.existsSync(skillMdPath)) return;
      const content = fs.readFileSync(skillMdPath, "utf-8");
      it("has 'USE FOR' content (section heading or in description)", () => {
        const hasHeading = hasSection(content, "USE FOR");
        const fm = parseSkillFrontmatter(content);
        const inDescription = fm?.["description"]?.includes("USE FOR") ?? false;
        expect(hasHeading || inDescription).toBe(true);
      });
      it("'USE FOR' content is non-empty", () => {
        const headingBody = getSectionContent(content, "USE FOR");
        if (headingBody.length > 0) {
          expect(headingBody.length).toBeGreaterThan(0);
        } else {
          const fm = parseSkillFrontmatter(content);
          const desc = fm?.["description"] ?? "";
          const useForMatch = desc.match(/USE FOR:\s*(.+?)(?:\. DO NOT|\.?$)/);
          expect(useForMatch).not.toBeNull();
          expect(useForMatch![1].trim().length).toBeGreaterThan(0);
        }
      });
      it("has 'DO NOT USE FOR' content (section heading or in description)", () => {
        const hasHeading = hasSection(content, "DO NOT USE FOR");
        const fm = parseSkillFrontmatter(content);
        const inDescription =
          fm?.["description"]?.includes("DO NOT USE FOR") ?? false;
        expect(hasHeading || inDescription).toBe(true);
      });
      it("'DO NOT USE FOR' content is non-empty", () => {
        const headingBody = getSectionContent(content, "DO NOT USE FOR");
        if (headingBody.length > 0) {
          expect(headingBody.length).toBeGreaterThan(0);
        } else {
          const fm = parseSkillFrontmatter(content);
          const desc = fm?.["description"] ?? "";
          const dontMatch = desc.match(/DO NOT USE FOR:\s*(.+?)$/);
          expect(dontMatch).not.toBeNull();
          expect(dontMatch![1].trim().length).toBeGreaterThan(0);
        }
      });
      const seeAlsoRefs = extractSeeAlsoRefs(content);
      for (const ref of seeAlsoRefs) {
        it(`See Also reference "${ref}" points to existing skill directory`, () => {
          expect(skillDirSet.has(ref)).toBe(true);
        });
      }
    });
  }
});
describe("REQ-018-003 / REQ-018-004: third-party tolerated placements (INSPECTION-TOLERATED)", () => {
  it("third-party declared placements are tolerated out of ADF skill structure contract checks", () => {
    for (const name of toleratedThirdPartySkills) {
      expect(adfSkillDirs.includes(name)).toBe(false);
    }
  });
  it("third-party declared placements are never promoted into src/opencode/skills", () => {
    // third-party Skill は src/opencode/skills/ 配下へ昇格配置されない
    // （docs/designs/local/third-party-skill-management.md）。この配置構造により、
    // worktree fallback 環境（junction 未伝播）でも third-party 起源の検出差分が
    // fail に計上されない（REQ-018-004 の環境差扱いの基盤）。
    for (const name of toleratedThirdPartySkills) {
      expect(fs.existsSync(path.join(SOURCE_SKILLS_DIR, name))).toBe(false);
    }
  });
  it("projection-only placements without third-party declaration remain inspected", () => {
    // projection 走査環境（junction 実在）でのみ projection-only エントリが現れる。
    // worktree fallback 環境では走査対象が src 由来のみのため検証対象が空になり pass する（fail-open）。
    for (const name of skillDirs) {
      if (fs.existsSync(path.join(SOURCE_SKILLS_DIR, name))) continue;
      expect(toleratedThirdPartySkills.has(name)).toBe(false);
    }
  });
});
