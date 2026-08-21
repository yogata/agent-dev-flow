// ADF-COVERS(verification): REQ-002-001, REQ-002-002
/**
 * Structure validation tests for command definition files.
 *
 * REQ-0030-001: Command frontmatter required fields existence
 * REQ-0030-002: Steps section structure
 *
 * Tests the ACTUAL command files in .opencode/commands/agentdev/*.md (not fixtures).
 * Gap analysis: existing check_integrity.test.ts tests the script via subprocess
 * with temp fixtures, but does NOT directly assert on real repo files.
 *
 * frontmatter 契約は description 単一（移行計画 §5.2）。
 */
import {
  describe,
  it,
  expect,
} from "bun:test";
import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = import.meta.dir;

// Walk up to repo root (contains .opencode/)
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
// 配布時 (.opencode/commands/agentdev) を優先。worktree 環境で junction が無い場合は
// ソースパス (src/opencode/commands/agentdev) へフォールバックして実コマンドを検査する。
const RUNTIME_CMD_DIR = path.join(REPO_ROOT, ".opencode", "commands", "agentdev");
const SOURCE_CMD_DIR = path.join(
  REPO_ROOT,
  "src",
  "opencode",
  "commands",
  "agentdev",
);
const CMD_DIR = fs.existsSync(RUNTIME_CMD_DIR) &&
  fs.readdirSync(RUNTIME_CMD_DIR).some((f) => f.endsWith(".md"))
  ? RUNTIME_CMD_DIR
  : SOURCE_CMD_DIR;
const SKILLS_DIR = path.join(REPO_ROOT, ".opencode", "skills");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFrontmatter(
  content: string,
): Record<string, string | string[]> | null {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const yaml = parts[1].trim();
  const result: Record<string, string | string[]> = {};
  const lines = yaml.split("\n");
  let currentKey: string | null = null;
  const currentArray: string[] = [];
  function flushArray() {
    if (currentKey !== null && currentArray.length > 0) {
      result[currentKey] = [...currentArray];
    }
    currentKey = null;
    currentArray.length = 0;
  }
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("- ") && currentKey !== null) {
      currentArray.push(trimmed.slice(2).trim());
      continue;
    }
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;
    flushArray();
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    if (value === "") {
      currentKey = key;
      currentArray.length = 0;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else {
      result[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  flushArray();
  return result;
}

function getCommandFiles(): string[] {
  if (!fs.existsSync(CMD_DIR)) return [];
  return fs
    .readdirSync(CMD_DIR)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort();
}

function getSkillDirs(): Set<string> {
  if (!fs.existsSync(SKILLS_DIR)) return new Set();
  return new Set(
    fs
      .readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name),
  );
}

// ─── REQ-0030-001: Command frontmatter required fields ───────────────────────

describe("REQ-0030-001: Command frontmatter required fields", () => {
  const cmdFiles = getCommandFiles();
  // frontmatter 契約は description 単一（移行計画 §5.2）。
  const REQUIRED_FIELDS = ["description"];

  it("command files exist under .opencode/commands/agentdev/", () => {
    expect(cmdFiles.length).toBeGreaterThan(0);
  });

  for (const file of cmdFiles) {
    describe(`command file: ${file}`, () => {
      const content = fs.readFileSync(path.join(CMD_DIR, file), "utf-8");
      const fm = parseFrontmatter(content);

      it("has valid frontmatter", () => {
        expect(fm).not.toBeNull();
      });

      if (fm) {
        for (const field of REQUIRED_FIELDS) {
          it(`has required field "${field}"`, () => {
            expect(fm[field]).toBeDefined();
            if (Array.isArray(fm[field])) {
              expect((fm[field] as string[]).length).toBeGreaterThan(0);
            } else {
              expect(fm[field]).not.toBe("");
            }
          });
        }
      }
    });
  }
});

// ─── REQ-0030-002: Steps section structure ───────────────────────────────────

describe("REQ-0030-002: Steps section structure", () => {
  const cmdFiles = getCommandFiles();

  for (const file of cmdFiles) {
    describe(`command file: ${file}`, () => {
      const content = fs.readFileSync(path.join(CMD_DIR, file), "utf-8");

      it("has Step, Phase, or Input section heading", () => {
        // 実コマンドの一般的なセクション見出し: ## Step, ## Phase, ## Input,
        // ## 入力, ## 手順, ## フェーズ。これらのいずれかが存在すること。
        const hasStructure =
          /(^##\s+(Step|Phase|Input|入力|手順|フェーズ))/m.test(content);
        expect(hasStructure).toBe(true);
      });
    });
  }
});
