/**
 * Structure validation tests for command definition files.
 * REQ-0030-001: Command frontmatter required fields existence
 * REQ-0030-002: Steps section structure and load_skills reference existence
 *
 * Tests the ACTUAL command files in .opencode/commands/agentdev/*.md (not fixtures).
 * Gap analysis: existing check_integrity.test.ts tests the script via subprocess
 * with temp fixtures, but does NOT directly assert on real repo files.
 */

import { describe, it, expect } from "bun:test";
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
const CMD_DIR = path.join(REPO_ROOT, ".opencode", "commands", "agentdev");
const SKILLS_DIR = path.join(REPO_ROOT, ".opencode", "skills");

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseFrontmatter(content: string): Record<string, string | string[]> | null {
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
  return fs.readdirSync(CMD_DIR)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort();
}

function getSkillDirs(): Set<string> {
  if (!fs.existsSync(SKILLS_DIR)) return new Set();
  return new Set(
    fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  );
}

// ─── REQ-0030-001: Command frontmatter required fields ──────────────────────

describe("REQ-0030-001: Command frontmatter required fields", () => {
  const cmdFiles = getCommandFiles();
  const REQUIRED_FIELDS = ["description", "agent", "load_skills"];

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

// ─── REQ-0030-002: Steps section structure and load_skills references ───────

describe("REQ-0030-002: Steps section structure and load_skills references", () => {
  const cmdFiles = getCommandFiles();
  const skillDirs = getSkillDirs();

  for (const file of cmdFiles) {
    describe(`command file: ${file}`, () => {
      const content = fs.readFileSync(path.join(CMD_DIR, file), "utf-8");

      it("has Step or Phase sections (## Step, ## Phase, or ## Input)", () => {
        const hasStructure = /(^##\s+(Step|Phase|Input|準備|実装|提出))/m.test(content);
        expect(hasStructure).toBe(true);
      });

      // load_skills references must point to existing skill directories
      const fm = parseFrontmatter(content);
      const loadSkills = fm
        ? (Array.isArray(fm["load_skills"]) ? fm["load_skills"] as string[] : [])
        : [];

      for (const skill of loadSkills) {
        it(`load_skills "${skill}" references an existing skill directory`, () => {
          expect(skillDirs.has(skill)).toBe(true);
        });
      }
    });
  }
});
