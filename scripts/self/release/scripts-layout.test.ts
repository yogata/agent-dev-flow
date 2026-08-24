// Layout and contract tests for the scripts/ public entry boundary
// (REQ-050). Pins the structural contract that case-run TS-001 verifies
// manually, as a permanent regression guard:
//   - scripts/ top level holds exactly the two public entries
//     (install.ps1, self-sync.ps1) plus the internal directories
//     (consumer/, self/) — nothing else (REQ-050-001, REQ-050-007,
//     REQ-050-008, REQ-050-009)
//   - both entries offer the three modes via ValidateSet (REQ-050-002,
//     REQ-050-003)
//   - install.ps1 -Mode check keeps the legacy check-script capabilities
//     (orphan detection, checkout version report, link mode detection)
//     (REQ-050-004)
//   - neither entry performs provisioning or network access (REQ-050-013)
//   - mutual misexecution guidance is present (REQ-050-006)
//   - current user-facing documents no longer reference the three retired
//     entries as the current procedure (REQ-050-014)

// ADF-COVERS(verification): REQ-050-001, REQ-050-002, REQ-050-003, REQ-050-004, REQ-050-007, REQ-050-008, REQ-050-009, REQ-050-013, REQ-050-014
// ADF-COVERS(verification): REQ-052-008

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const SCRIPTS_DIR = path.join(REPO_ROOT, "scripts");

const PUBLIC_ENTRIES = ["install.ps1", "self-sync.ps1"] as const;
const INTERNAL_DIRS = ["consumer", "self"] as const;
const RETIRED_ENTRIES = [
  "install-consumer-opencode.ps1",
  "check-consumer-opencode.ps1",
  "sync-self-opencode.ps1",
  "consumer-opencode-common.ps1",
  "install-from-archive.ps1",
  "package-release-archive.ps1",
  "trusted-distribution-gate.ps1",
  "publish-hard-link.ts",
  "apply-mechanical-replacement.ps1",
] as const;

function read(rel: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
}

function stripCommentLines(text: string): string {
  return text
    .split(/\r?\n/)
    .filter((l) => !/^\s*#/.test(l))
    .join("\n");
}

/**
 * Approximate string-literal stripper for PowerShell. Guidance messages
 * legitimately CONTAIN text like "git clone ..." as display strings; the
 * provisioning-free contract forbids EXECUTING those commands, so literals
 * must be blanked before the pattern check.
 */
function stripStringLiterals(line: string): string {
  return line
    .replace(/"(?:[^"`]|`")*"/g, '""')
    .replace(/'(?:[^']|'')*'/g, "''");
}

function executableLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .filter((l) => !/^\s*#/.test(l))
    .map(stripStringLiterals);
}

describe("scripts layout / public entry boundary (REQ-050-001, REQ-050-007, REQ-050-008, REQ-050-009)", () => {
  test("scripts/ top level contains only the two public entries and the internal dirs", () => {
    const entries = fs.readdirSync(SCRIPTS_DIR, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile()).map((e) => e.name).sort();
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
    expect(files).toEqual([...PUBLIC_ENTRIES]);
    expect(dirs).toEqual([...INTERNAL_DIRS]);
  });

  test("public entry names do not contain 'opencode' (REQ-050-007)", () => {
    for (const name of PUBLIC_ENTRIES) {
      expect(name.includes("opencode")).toBe(false);
    }
  });

  test("retired scripts and compatibility wrappers are absent", () => {
    for (const name of RETIRED_ENTRIES) {
      expect(fs.existsSync(path.join(SCRIPTS_DIR, name))).toBe(false);
    }
  });

  test("internal processing lives under scripts/consumer/ and scripts/self/", () => {
    expect(fs.existsSync(path.join(SCRIPTS_DIR, "consumer", "common.ps1"))).toBe(true);
    expect(fs.existsSync(path.join(SCRIPTS_DIR, "consumer", "archive", "install.ps1"))).toBe(true);
    expect(fs.existsSync(path.join(SCRIPTS_DIR, "self", "release", "package-release-archive.ps1"))).toBe(true);
    expect(fs.existsSync(path.join(SCRIPTS_DIR, "self", "release", "trusted-distribution-gate.ps1"))).toBe(true);
    expect(fs.existsSync(path.join(SCRIPTS_DIR, "self", "release", "publish-hard-link.ts"))).toBe(true);
    expect(fs.existsSync(path.join(SCRIPTS_DIR, "self", "maintenance", "apply-mechanical-replacement.ps1"))).toBe(true);
  });
});

describe("scripts layout / three-mode contract (REQ-050-002, REQ-050-003)", () => {
  test("install.ps1 declares the dry-run/check/apply ValidateSet", () => {
    expect(read("scripts/install.ps1")).toMatch(/\[ValidateSet\('dry-run',\s*'check',\s*'apply'\)\]/);
  });

  test("self-sync.ps1 declares the dry-run/check/apply ValidateSet", () => {
    expect(read("scripts/self-sync.ps1")).toMatch(/\[ValidateSet\('dry-run',\s*'check',\s*'apply'\)\]/);
  });
});

describe("scripts layout / check capability inheritance (REQ-050-004)", () => {
  test("install.ps1 includes orphan detection", () => {
    expect(read("scripts/install.ps1")).toMatch(/Orphan/i);
  });

  test("install.ps1 includes checkout version report (git rev-parse, unknown fallback)", () => {
    const text = read("scripts/install.ps1");
    expect(text).toMatch(/rev-parse --short HEAD/);
    expect(text).toMatch(/Checkout: unknown/);
  });

  test("install.ps1 includes link mode detection (consumer-generated / consumer-with-agentdev)", () => {
    const text = read("scripts/install.ps1");
    expect(text).toMatch(/consumer-generated/);
    expect(text).toMatch(/consumer-with-agentdev/);
  });
});

describe("scripts layout / provisioning-free contract (REQ-050-013)", () => {
  // Command-invocation shapes only. `git rev-parse` (version report in
  // check mode) is allowed; clone/fetch/reset/pull and network cmdlets are
  // forbidden as executable statements.
  const FORBIDDEN_CODE_PATTERNS: Array<[RegExp, string]> = [
    [/^\s*&?\s*git\s+clone\b/m, "git clone"],
    [/^\s*&?\s*git\s+fetch\b/m, "git fetch"],
    [/^\s*&?\s*git\s+reset\b/m, "git reset"],
    [/^\s*&?\s*git\s+pull\b/m, "git pull"],
    [/^\s*&?\s*(Invoke-WebRequest|Invoke-RestMethod|curl|wget)\b/im, "network cmdlet"],
  ];

  for (const entry of PUBLIC_ENTRIES) {
    test(`${entry} executable code performs no provisioning and no network access`, () => {
      const code = executableLines(read(`scripts/${entry}`)).join("\n");
      for (const [pattern, label] of FORBIDDEN_CODE_PATTERNS) {
        expect(code).not.toMatch(pattern);
      }
    });
  }

  test("scripts/consumer/common.ps1 executable code performs no provisioning and no network access", () => {
    const code = executableLines(read("scripts/consumer/common.ps1")).join("\n");
    for (const [pattern] of FORBIDDEN_CODE_PATTERNS) {
      expect(code).not.toMatch(pattern);
    }
  });
});

describe("scripts layout / mutual misexecution guidance (REQ-050-006)", () => {
  test("install.ps1 guides to scripts/self-sync.ps1 on the self-hosting repo", () => {
    const text = read("scripts/install.ps1");
    expect(text).toMatch(/scripts\/self-sync\.ps1 を使ってください/);
    expect(text).toMatch(/src\\opencode/);
  });

  test("self-sync.ps1 guides to scripts/install.ps1 on consumer repos", () => {
    expect(read("scripts/self-sync.ps1")).toMatch(/scripts\/install\.ps1 を使ってください/);
  });
});

describe("scripts layout / current documents reference only the new entries (REQ-050-014)", () => {
  const RETIRED_NAME_RE = /install-consumer-opencode|check-consumer-opencode|sync-self-opencode/;

  function* walk(dir: string): Generator<string> {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === "node_modules" || ent.name === ".git" || ent.name === ".worktrees") continue;
        yield* walk(full);
      } else if (ent.isFile() && ent.name.endsWith(".md")) {
        yield full;
      }
    }
  }

  test("user-facing markdown under README, docs/guides, src/opencode, src/opencode-local has no retired-entry reference", () => {
    const roots = [
      "README.md",
      "README-INSTALL.md",
      "docs/guides",
      "src/opencode",
      "src/opencode-local",
    ];
    const offenders: string[] = [];
    for (const root of roots) {
      const abs = path.join(REPO_ROOT, root);
      if (!fs.existsSync(abs)) continue;
      if (fs.statSync(abs).isFile()) {
        if (RETIRED_NAME_RE.test(fs.readFileSync(abs, "utf-8"))) offenders.push(root);
        continue;
      }
      for (const file of walk(abs)) {
        if (RETIRED_NAME_RE.test(fs.readFileSync(file, "utf-8"))) {
          offenders.push(path.relative(REPO_ROOT, file));
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
