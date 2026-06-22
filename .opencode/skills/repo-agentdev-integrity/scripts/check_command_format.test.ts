/**
 * Regression test for command file format violations (IR-049).
 *
 * Validates that all command files in scope comply with
 * docs/specs/command-file-format.md:
 * - No Step 0 headings or references
 * - No zero-based substeps (Step N-0)
 * - No numbered list main steps directly under ## 手順
 * - No non-sequential Step numbers
 * - No non-G01 guardrail numbers
 */

import { test, expect } from "bun:test";
import { checkCommandFile } from "./check_command_format.ts";
import * as fs from "fs";
import * as path from "path";

const COMMAND_DIRS = [
  "src/opencode/commands/agentdev",
  ".opencode/commands/repo",
];

function globMarkdown(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => path.join(dir, f));
}

test("command files: no Step 0 violations", () => {
  const allViolations: { file: string; violations: ReturnType<typeof checkCommandFile> }[] = [];

  for (const dir of COMMAND_DIRS) {
    const files = globMarkdown(dir);
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const violations = checkCommandFile(file, content);
      if (violations.length > 0) {
        allViolations.push({ file, violations });
      }
    }
  }

  if (allViolations.length > 0) {
    const msg = allViolations
      .map(({ file, violations }) =>
        violations.map((v) => `${v.file}:${v.line} ${v.rule}: ${v.description}`).join("\n"),
      )
      .join("\n");
    console.error(`Command format violations found:\n${msg}`);
  }

  expect(allViolations).toHaveLength(0);
});

// Unit tests for the checker itself

test("checkCommandFile detects Step 0 heading", () => {
  const content = `## 手順

### Step 0: 前判定

text
`;
  const violations = checkCommandFile("test.md", content);
  expect(violations.some((v) => v.rule === "command-format-step-zero")).toBe(true);
});

test("checkCommandFile detects zero-based substep", () => {
  const content = `## 手順

### Step 1: test

**Step 1-0**: substep text
`;
  const violations = checkCommandFile("test.md", content);
  expect(violations.some((v) => v.rule === "command-format-zero-substep")).toBe(true);
});

test("checkCommandFile detects non-sequential steps", () => {
  const content = `## 手順

### Step 1: first

### Step 3: third
`;
  const violations = checkCommandFile("test.md", content);
  expect(violations.some((v) => v.rule === "command-format-non-sequential-step")).toBe(true);
});

test("checkCommandFile detects numbered list main steps", () => {
  const content = `## 手順

1. First step
2. Second step
`;
  const violations = checkCommandFile("test.md", content);
  expect(violations.some((v) => v.rule === "command-format-numbered-list-main")).toBe(true);
});

test("checkCommandFile detects non-G01 guardrail numbers", () => {
  const content = `## ガードレール

- G1: invalid format
- G001: too many digits
`;
  const violations = checkCommandFile("test.md", content);
  expect(violations.some((v) => v.rule === "command-format-guardrail-number")).toBe(true);
});

test("checkCommandFile passes compliant file", () => {
  const content = `## 手順

### Step 1: first

description

### Step 2: second

description

## ガードレール

- G01: valid
`;
  const violations = checkCommandFile("test.md", content);
  expect(violations).toHaveLength(0);
});
