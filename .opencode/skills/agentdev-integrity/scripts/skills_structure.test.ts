import { describe, it, expect } from "bun:test";
import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = import.meta.dir;

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, ".opencode"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(SCRIPT_DIR);
const SKILLS_DIR = path.join(REPO_ROOT, ".opencode", "skills");

function getSkillDirs(): string[] {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
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
  const pattern = new RegExp(`^## .*${escaped}\\s*\\n([\\s\\S]*?)(?=^## |$)`, "m");
  const match = content.match(pattern);
  return match ? match[1].trim() : "";
}

const skillDirs = getSkillDirs();
const skillDirSet = new Set(skillDirs);

describe("REQ-0030-003: Skill frontmatter required fields", () => {
  it("skill directories exist under .opencode/skills/", () => {
    expect(skillDirs.length).toBeGreaterThan(0);
  });

  for (const dirName of skillDirs) {
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
  for (const dirName of skillDirs) {
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
        const inDescription = fm?.["description"]?.includes("DO NOT USE FOR") ?? false;
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
