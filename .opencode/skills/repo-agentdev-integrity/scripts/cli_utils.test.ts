import { describe, it, expect } from "bun:test";
import {
  EXIT_OK,
  EXIT_NG,
  EXIT_ERROR,
  parseArgs,
  printHelp,
  ok,
  ng,
  warn,
  info,
  computeSummary,
  formatJsonReport,
  formatMarkdownReport,
  determineExitCode,
  findRepoRoot,
  VALID_GATE_LEVELS,
} from "./cli_utils.ts";
import type { CheckResult, IntegrityReport } from "./cli_utils.ts";

describe("constants", () => {
  it("EXIT_OK is 0", () => {
    expect(EXIT_OK).toBe(0);
  });
  it("EXIT_NG is 1", () => {
    expect(EXIT_NG).toBe(1);
  });
  it("EXIT_ERROR is 2", () => {
    expect(EXIT_ERROR).toBe(2);
  });
});

describe("parseArgs", () => {
  it("returns defaults for empty args", () => {
    const opts = parseArgs([]);
    expect(opts.help).toBe(false);
    expect(opts.json).toBe(false);
    expect(opts.dryRun).toBe(false);
    expect(opts.paths).toEqual([]);
    expect(opts.gate).toBe("full-audit");
    expect(opts.gatePaths).toEqual([]);
    expect(opts.reqs).toEqual([]);
  });

  it("parses --help", () => {
    expect(parseArgs(["--help"]).help).toBe(true);
  });

  it("parses -h as help", () => {
    expect(parseArgs(["-h"]).help).toBe(true);
  });

  it("parses --json", () => {
    expect(parseArgs(["--json"]).json).toBe(true);
  });

  it("parses --dry-run", () => {
    expect(parseArgs(["--dry-run"]).dryRun).toBe(true);
  });

  it("collects positional paths", () => {
    const opts = parseArgs(["foo", "bar/baz"]);
    expect(opts.paths).toEqual(["foo", "bar/baz"]);
  });

  it("does not treat flags starting with - as paths", () => {
    const opts = parseArgs(["--json", "src", "--unknown"]);
    expect(opts.paths).toEqual(["src"]);
  });

  it("handles a combination of all options", () => {
    const opts = parseArgs([
      "--help",
      "--json",
      "--dry-run",
      "path/a",
      "path/b",
    ]);
    expect(opts).toEqual({
      help: true,
      json: true,
      dryRun: true,
      classification: false,
      paths: ["path/a", "path/b"],
      gate: "full-audit",
      gatePaths: [],
      reqs: [],
    });
  });

  it("defaults gate to full-audit (backward compatibility)", () => {
    expect(parseArgs([]).gate).toBe("full-audit");
  });

  it("parses --gate delta-guard", () => {
    expect(parseArgs(["--gate", "delta-guard"]).gate).toBe("delta-guard");
  });

  it("parses --gate impact-guard", () => {
    expect(parseArgs(["--gate", "impact-guard"]).gate).toBe("impact-guard");
  });

  it("parses --gate=full-audit (equals form)", () => {
    expect(parseArgs(["--gate=full-audit"]).gate).toBe("full-audit");
  });

  it("parses --paths as comma-separated gatePaths", () => {
    const opts = parseArgs(["--paths", "a.md,b.md,c.md"]);
    expect(opts.gatePaths).toEqual(["a.md", "b.md", "c.md"]);
  });

  it("parses --paths= form", () => {
    const opts = parseArgs(["--paths=x.md,y.md"]);
    expect(opts.gatePaths).toEqual(["x.md", "y.md"]);
  });

  it("trims and filters empty --paths entries", () => {
    const opts = parseArgs(["--paths", " a.md , , b.md "]);
    expect(opts.gatePaths).toEqual(["a.md", "b.md"]);
  });

  it("parses --reqs as comma-separated REQ IDs", () => {
    const opts = parseArgs(["--reqs", "REQ-0101,REQ-0108"]);
    expect(opts.reqs).toEqual(["REQ-0101", "REQ-0108"]);
  });

  it("parses --reqs= form", () => {
    const opts = parseArgs(["--reqs=REQ-0103"]);
    expect(opts.reqs).toEqual(["REQ-0103"]);
  });

  it("does not let --paths/--reqs collide with positional paths", () => {
    const opts = parseArgs(["--paths", "a.md", "pos1", "--reqs", "REQ-0101", "pos2"]);
    expect(opts.gatePaths).toEqual(["a.md"]);
    expect(opts.reqs).toEqual(["REQ-0101"]);
    expect(opts.paths).toEqual(["pos1", "pos2"]);
  });

  it("throws on invalid --gate value", () => {
    expect(() => parseArgs(["--gate", "bogus"])).toThrow(/Invalid --gate/);
  });

  it("throws on invalid --gate= value", () => {
    expect(() => parseArgs(["--gate=nope"])).toThrow(/Invalid --gate/);
  });

  it("throws when --gate has no value", () => {
    expect(() => parseArgs(["--gate"])).toThrow(/requires a value/);
  });

  it("throws when --paths has no value", () => {
    expect(() => parseArgs(["--paths"])).toThrow(/requires a value/);
  });

  it("throws when --reqs has no value", () => {
    expect(() => parseArgs(["--reqs"])).toThrow(/requires a value/);
  });

  it("exposes VALID_GATE_LEVELS", () => {
    expect(VALID_GATE_LEVELS).toEqual([
      "full-audit",
      "delta-guard",
      "impact-guard",
    ]);
  });
});

describe("printHelp", () => {
  it("outputs USAGE, OPTIONS, and EXIT CODES sections", () => {
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => logs.push(args.join("\n"));

    try {
      printHelp(
        "my-script",
        "validates stuff",
        "my-script [options] [paths...]",
      );
    } finally {
      console.log = originalLog;
    }

    const output = logs.join("\n");
    expect(output).toContain("USAGE:");
    expect(output).toContain("OPTIONS:");
    expect(output).toContain("EXIT CODES:");
    expect(output).toContain("my-script");
    expect(output).toContain("validates stuff");
    expect(output).toContain("my-script [options] [paths...]");
  });
});

describe("ok", () => {
  it("returns CheckResult with level 'ok'", () => {
    const result = ok("cat", "check-name", "all good");
    expect(result).toEqual({
      category: "cat",
      check: "check-name",
      level: "ok",
      message: "all good",
    });
  });
});

describe("ng", () => {
  it("returns CheckResult with level 'ng' and optional file/line", () => {
    const result = ng("cat", "check", "broken", "file.ts", 42);
    expect(result).toEqual({
      category: "cat",
      check: "check",
      level: "ng",
      message: "broken",
      file: "file.ts",
      line: 42,
    });
  });

  it("omits file and line when not provided", () => {
    const result = ng("cat", "check", "broken");
    expect(result.file).toBeUndefined();
    expect(result.line).toBeUndefined();
  });
});

describe("warn", () => {
  it("returns CheckResult with level 'warning'", () => {
    const result = warn("cat", "check", "be careful", "f.ts");
    expect(result.level).toBe("warning");
    expect(result.file).toBe("f.ts");
    expect(result.line).toBeUndefined();
  });
});

describe("info", () => {
  it("returns CheckResult with level 'info'", () => {
    const result = info("cat", "check", "fyi");
    expect(result.level).toBe("info");
  });
});

describe("computeSummary", () => {
  it("returns zeros for empty array", () => {
    expect(computeSummary([])).toEqual({ ok: 0, ng: 0, warning: 0, info: 0 });
  });

  it("counts each level correctly", () => {
    const results: CheckResult[] = [
      ok("a", "c1", "m1"),
      ok("a", "c2", "m2"),
      ng("a", "c3", "m3"),
      warn("a", "c4", "m4"),
      info("a", "c5", "m5"),
      info("a", "c6", "m6"),
    ];
    expect(computeSummary(results)).toEqual({
      ok: 2,
      ng: 1,
      warning: 1,
      info: 2,
    });
  });

  it("handles single result", () => {
    expect(computeSummary([ng("x", "y", "z")])).toEqual({
      ok: 0,
      ng: 1,
      warning: 0,
      info: 0,
    });
  });
});

describe("formatJsonReport", () => {
  const report: IntegrityReport = {
    timestamp: "2025-01-01T00:00:00Z",
    script: "test-script",
    scanned: { docs: 5, skills: 3 },
    summary: { ok: 3, ng: 1, warning: 1, info: 0 },
    results: [
      ok("cat", "check1", "fine"),
      ng("cat", "check2", "broken", "a.ts", 10),
    ],
  };

  it("produces valid JSON", () => {
    const text = formatJsonReport(report);
    const parsed = JSON.parse(text);
    expect(parsed).toEqual(report);
  });

  it("contains expected fields", () => {
    const text = formatJsonReport(report);
    const parsed = JSON.parse(text);
    expect(parsed.timestamp).toBe("2025-01-01T00:00:00Z");
    expect(parsed.script).toBe("test-script");
    expect(parsed.scanned.docs).toBe(5);
    expect(parsed.summary.ng).toBe(1);
    expect(parsed.results).toHaveLength(2);
  });
});

describe("formatMarkdownReport", () => {
  const report: IntegrityReport = {
    timestamp: "2025-01-01T00:00:00Z",
    script: "integrity-check",
    scanned: { docs: 2 },
    summary: { ok: 1, ng: 1, warning: 0, info: 0 },
    results: [
      ok("docs", "valid", "looks good"),
      ng("docs", "missing", "file not found", "README.md"),
    ],
  };

  it("contains title header with script name", () => {
    const md = formatMarkdownReport(report);
    expect(md).toContain("# integrity-check Report");
  });

  it("contains summary table", () => {
    const md = formatMarkdownReport(report);
    expect(md).toContain("## サマリ");
    expect(md).toContain("| OK | 1 |");
    expect(md).toContain("| NG | 1 |");
    expect(md).toContain("| Warning | 0 |");
    expect(md).toContain("| Info | 0 |");
  });

  it("contains detail section for non-ok results", () => {
    const md = formatMarkdownReport(report);
    expect(md).toContain("## 詳細");
    expect(md).toContain("### docs");
    expect(md).toContain("[NG]");
    expect(md).toContain("missing");
    expect(md).toContain("README.md");
  });

  it("shows all-ok message when no issues", () => {
    const okReport: IntegrityReport = {
      timestamp: "2025-01-01T00:00:00Z",
      script: "test",
      scanned: { all: 1 },
      summary: { ok: 1, ng: 0, warning: 0, info: 0 },
      results: [ok("cat", "check", "fine")],
    };
    const md = formatMarkdownReport(okReport);
    expect(md).toContain("すべての検査項目で問題は検出されませんでした。");
    expect(md).not.toContain("## 詳細");
  });

  it("includes scanned counts in header", () => {
    const md = formatMarkdownReport(report);
    expect(md).toContain("docs 2件");
  });
});

describe("determineExitCode", () => {
  it("returns EXIT_OK when all ok", () => {
    expect(determineExitCode({ ok: 5, ng: 0, warning: 0, info: 3 })).toBe(
      EXIT_OK,
    );
  });

  it("returns EXIT_NG when ng > 0", () => {
    expect(determineExitCode({ ok: 5, ng: 1, warning: 0, info: 0 })).toBe(
      EXIT_NG,
    );
  });

  it("returns EXIT_NG when warning > 0", () => {
    expect(determineExitCode({ ok: 5, ng: 0, warning: 2, info: 0 })).toBe(
      EXIT_NG,
    );
  });

  it("returns EXIT_NG when both ng and warning > 0", () => {
    expect(determineExitCode({ ok: 0, ng: 1, warning: 1, info: 0 })).toBe(
      EXIT_NG,
    );
  });

  it("returns EXIT_OK with only info results", () => {
    expect(determineExitCode({ ok: 0, ng: 0, warning: 0, info: 10 })).toBe(
      EXIT_OK,
    );
  });
});

describe("findRepoRoot", () => {
  it("finds a repo root containing .opencode from cwd", () => {
    const root = findRepoRoot(process.cwd());
    const fs = require("fs");
    const path = require("path");
    expect(fs.existsSync(path.join(root, ".opencode"))).toBe(true);
  });

  it("finds .opencode when starting inside the worktree scripts dir", () => {
    const path = require("path");
    const scriptDir = path.join(
      process.cwd(),
      ".worktrees",
      "328-feature",
      ".opencode",
      "skills",
      "agentdev-integrity",
      "scripts",
    );
    const root = findRepoRoot(scriptDir);
    const fs = require("fs");
    expect(fs.existsSync(path.join(root, ".opencode"))).toBe(true);
  });

  it("returns resolved startPath when no .opencode is found", () => {
    const path = require("path");
    const start = path.resolve("C:\\WINDOWS\\TEMP");
    const result = findRepoRoot(start);
    expect(result).toBe(start);
  });
});
