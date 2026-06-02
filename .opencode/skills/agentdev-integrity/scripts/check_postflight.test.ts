import { describe, it, expect } from "bun:test";
import {
  globToRegex,
  matchesGlob,
  matchesAnyGlob,
  computeDiff,
  verifyDiffs,
  READ_ONLY_COMMANDS,
  ALLOWED_CHANGES_PROFILES,
} from "./check_postflight.ts";
import type { Snapshot, FileEntry } from "./check_postflight";

describe("globToRegex", () => {
  it("matches exact file name", () => {
    expect(globToRegex("README.md").test("README.md")).toBe(true);
    expect(globToRegex("README.md").test("OTHER.md")).toBe(false);
  });

  it("matches single wildcard", () => {
    const re = globToRegex("*.md");
    expect(re.test("README.md")).toBe(true);
    expect(re.test("docs/REQ.md")).toBe(false);
  });

  it("matches globstar (**)", () => {
    const re = globToRegex("docs/**");
    expect(re.test("docs/README.md")).toBe(true);
    expect(re.test("docs/sub/deep.md")).toBe(true);
    expect(re.test("other/file.md")).toBe(false);
  });

  it("matches globstar mid-pattern", () => {
    const re = globToRegex(".agentdev/intake/inbox/**");
    expect(re.test(".agentdev/intake/inbox/item-001.md")).toBe(true);
    expect(re.test(".agentdev/intake/inbox/sub/item.md")).toBe(true);
    expect(re.test(".agentdev/intake/archive/item.md")).toBe(false);
  });

  it("escapes special regex characters in path", () => {
    const re = globToRegex("docs/DOC-MAP.md");
    expect(re.test("docs/DOC-MAP.md")).toBe(true);
    expect(re.test("docs/DOC+MAP.md")).toBe(false);
  });
});

describe("matchesGlob", () => {
  it("handles backslash paths on windows-style input", () => {
    expect(matchesGlob("docs\\requirements\\REQ-0101.md", "docs/**")).toBe(true);
  });

  it("matches exact file with globstar", () => {
    expect(matchesGlob("docs/DOC-MAP.md", "docs/DOC-MAP.md")).toBe(true);
  });
});

describe("matchesAnyGlob", () => {
  it("returns true when any pattern matches", () => {
    expect(matchesAnyGlob("docs/requirements/REQ-0101.md", [
      "docs/adr/**",
      "docs/requirements/**",
    ])).toBe(true);
  });

  it("returns false when no pattern matches", () => {
    expect(matchesAnyGlob(".agentdev/inbox/item.md", [
      "docs/**",
      ".opencode/**",
    ])).toBe(false);
  });

  it("returns false for empty patterns", () => {
    expect(matchesAnyGlob("any/file.txt", [])).toBe(false);
  });
});

describe("computeDiff", () => {
  function makeSnapshot(files: [string, string][]): Snapshot {
    return {
      timestamp: "2026-01-01T00:00:00Z",
      command: "test",
      rootDir: "/test",
      files: files.map(([relPath, hash]) => ({
        relPath,
        hash,
        size: 100,
        mtimeMs: 0,
      })),
    };
  }

  it("detects no changes for identical snapshots", () => {
    const snap = makeSnapshot([["a.md", "abc123"], ["b.md", "def456"]]);
    const diffs = computeDiff(snap, snap);
    expect(diffs).toHaveLength(0);
  });

  it("detects added files", () => {
    const before = makeSnapshot([["a.md", "abc123"]]);
    const after = makeSnapshot([["a.md", "abc123"], ["b.md", "def456"]]);
    const diffs = computeDiff(before, after);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].change).toBe("added");
    expect(diffs[0].relPath).toBe("b.md");
  });

  it("detects removed files", () => {
    const before = makeSnapshot([["a.md", "abc123"], ["b.md", "def456"]]);
    const after = makeSnapshot([["a.md", "abc123"]]);
    const diffs = computeDiff(before, after);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].change).toBe("removed");
    expect(diffs[0].relPath).toBe("b.md");
  });

  it("detects modified files", () => {
    const before = makeSnapshot([["a.md", "abc123"]]);
    const after = makeSnapshot([["a.md", "changed"]]);
    const diffs = computeDiff(before, after);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].change).toBe("modified");
    expect(diffs[0].relPath).toBe("a.md");
  });

  it("sorts results by path", () => {
    const before = makeSnapshot([["z.md", "z1"]]);
    const after = makeSnapshot([["a.md", "a1"], ["z.md", "z2"]]);
    const diffs = computeDiff(before, after);
    expect(diffs[0].relPath).toBe("a.md");
    expect(diffs[1].relPath).toBe("z.md");
  });
});

describe("verifyDiffs", () => {
  it("reports ok for read-only command with no diffs", () => {
    const result = verifyDiffs("req-define", [], []);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].level).toBe("ok");
  });

  it("warns on read-only command modifying a file", () => {
    const result = verifyDiffs("req-define", [
      { relPath: "docs/README.md", change: "modified" },
    ], []);
    const violations = result.violations.filter((v) => v.level === "warning");
    expect(violations.length).toBeGreaterThanOrEqual(1);
    expect(violations[0].check).toBe("read-only-violation");
  });

  it("warns on read-only command adding a file", () => {
    const result = verifyDiffs("backlog-review", [
      { relPath: "new-file.md", change: "added" },
    ], []);
    const violations = result.violations.filter((v) => v.level === "warning");
    expect(violations.length).toBeGreaterThanOrEqual(1);
  });

  it("allows removals in read-only command without violation", () => {
    const result = verifyDiffs("req-restructure-review", [
      { relPath: "old-file.md", change: "removed" },
    ], []);
    const readOnlyViolations = result.violations.filter(
      (v) => v.check === "read-only-violation",
    );
    expect(readOnlyViolations).toHaveLength(0);
  });

  it("warns on forbidden path change", () => {
    const result = verifyDiffs("req-save", [
      { relPath: ".agentdev/config.json", change: "modified" },
    ], []);
    const violations = result.violations.filter((v) => v.level === "warning");
    expect(violations.length).toBeGreaterThanOrEqual(1);
    expect(violations[0].check).toBe("forbidden-change");
  });

  it("allows changes within allowed paths", () => {
    const result = verifyDiffs("req-save", [
      { relPath: "docs/requirements/REQ-0101.md", change: "modified" },
    ], []);
    const nonOk = result.violations.filter((v) => v.level !== "ok");
    expect(nonOk).toHaveLength(0);
  });

  it("warns on unknown command", () => {
    const result = verifyDiffs("unknown-cmd", [], []);
    const warnings = result.violations.filter((v) => v.level === "warning");
    expect(warnings).toHaveLength(1);
    expect(warnings[0].check).toBe("profile-lookup");
  });

  it("respects extra allowed patterns", () => {
    const result = verifyDiffs("req-save", [
      { relPath: "extra/file.txt", change: "modified" },
    ], ["extra/**"]);
    const nonOk = result.violations.filter((v) => v.level !== "ok" && v.level !== "info");
    expect(nonOk).toHaveLength(0);
  });
});

describe("READ_ONLY_COMMANDS", () => {
  it("includes integrity-check", () => {
    expect(READ_ONLY_COMMANDS).toContain("integrity-check");
  });

  it("includes req-restructure-review", () => {
    expect(READ_ONLY_COMMANDS).toContain("req-restructure-review");
  });

  it("includes backlog-review", () => {
    expect(READ_ONLY_COMMANDS).toContain("backlog-review");
  });

  it("includes req-define", () => {
    expect(READ_ONLY_COMMANDS).toContain("req-define");
  });
});

describe("ALLOWED_CHANGES_PROFILES", () => {
  it("has a profile for every command mentioned in the SPEC", () => {
    const commands = [
      "req-define", "req-save", "case-open", "case-run", "case-close",
      "case-update", "integrity-check", "intake-capture", "intake-from-github",
      "intake-review", "intake-promote", "learning-refine", "learning-promote",
      "backlog-review", "backlog-save", "req-restructure-review",
    ];
    const profiledCommands = ALLOWED_CHANGES_PROFILES.map((p) => p.command);
    for (const cmd of commands) {
      expect(profiledCommands).toContain(cmd);
    }
  });

  it("read-only commands have minimal allowed lists", () => {
    for (const cmd of READ_ONLY_COMMANDS) {
      const profile = ALLOWED_CHANGES_PROFILES.find((p) => p.command === cmd);
      expect(profile).toBeDefined();
      if (cmd === "integrity-check") {
        expect(profile!.allowed).toEqual([".agentdev/integrity/reports/**"]);
      } else {
        expect(profile!.allowed).toEqual([]);
      }
    }
  });
});
