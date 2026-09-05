// ADF-COVERS(verification): REQ-002-005
// ADF-COVERS(verification): REQ-007-002, REQ-007-003, REQ-007-005
// ADF-COVERS(implementation): REQ-018-001
// ADF-COVERS(verification): REQ-018-001, REQ-018-002
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
const PROJECTION_TEMPLATES_DIR = path.join(
  REPO_ROOT,
  ".opencode",
  "skills",
  "agentdev-workflow-templates",
  "templates",
);
const SOURCE_TEMPLATES_DIR = path.join(
  REPO_ROOT,
  "src",
  "opencode",
  "skills",
  "agentdev-workflow-templates",
  "templates",
);
// worktree junction 未設定環境では projection に agentdev-workflow-templates が存在しないため src/opencode/ へ fallback する（REQ-018-001）。
const TEMPLATES_DIR = fs.existsSync(PROJECTION_TEMPLATES_DIR)
  ? PROJECTION_TEMPLATES_DIR
  : SOURCE_TEMPLATES_DIR;
const TEMPLATES_WITH_FRONTMATTER = [
  "issue_desc_feature.md",
  "issue_desc_bug.md",
  "issue_desc_epic.md",
  "issue_desc_child.md",
  "issue_desc_backlog_child.md",
  "issue_desc_backlog_epic.md",
];
const TEMPLATES_WITHOUT_FRONTMATTER = [
  "issue_comment_bug_analysis.md",
  "issue_comment_bug_record.md",
  "issue_comment_feature_implementation.md",
  "issue_comment_feature_technical.md",
  "issue_comment_review_ng.md",
  "issue_comment_update.md",
  "pr_desc.md",
];
function getTemplateFiles(): string[] {
  if (!fs.existsSync(TEMPLATES_DIR)) return [];
  return fs
    .readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();
}
function extractFrontmatterKeys(content: string): Set<string> | null {
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/);
  if (!match) return null;
  const body = match[1];
  const keys = new Set<string>();
  for (const line of body.split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+)\s*:/);
    if (kv) keys.add(kv[1]);
  }
  return keys;
}
function countRequiredMarkers(content: string): number {
  const markerRe = /<!--\s*【必須】\s*-->/g;
  return (content.match(markerRe) || []).length;
}
const templateFiles = getTemplateFiles();
describe("REQ-0030-005: Template frontmatter required fields and required sections", () => {
  it("template files exist in agentdev-workflow-templates/templates/", () => {
    expect(templateFiles.length).toBeGreaterThan(0);
  });
  for (const file of templateFiles) {
    describe(`template: ${file}`, () => {
      const content = fs.readFileSync(path.join(TEMPLATES_DIR, file), "utf-8");
      if (TEMPLATES_WITH_FRONTMATTER.includes(file)) {
        const keys = extractFrontmatterKeys(content);
        it("has frontmatter", () => {
          expect(keys).not.toBeNull();
        });
        if (keys) {
          it("has 'name' field in frontmatter", () => {
            expect(keys.has("name")).toBe(true);
          });
          it("has 'about' field in frontmatter", () => {
            expect(keys.has("about")).toBe(true);
          });
        }
      } else {
        it("has content (non-frontmatter template)", () => {
          expect(content.trim().length).toBeGreaterThan(0);
        });
      }
      it("has at least one <!-- 縲仙ｿ・医・--> marker", () => {
        const count = countRequiredMarkers(content);
        expect(count).toBeGreaterThan(0);
      });
    });
  }
});
