/**
 * Regression tests for AUTOGEN marker detection (Issue #1771, RU-0002).
 *
 * Verifies that the whole-line matching strategy correctly:
 *   - detects real AUTOGEN marker lines (positive cases)
 *   - ignores backtick-wrapped marker strings in prose (negative cases)
 *   - handles boundary cases where backticks are adjacent to marker lines
 *
 * Design: docs/designs/integrity/index-auto-generation.md「AUTOGEN marker 検出契約」
 * Background: PR #1718 workaround (HTML comment syntax abstraction) addressed
 * a symptom where backtick-wrapped marker strings in spec-health-metrics.md L26
 * were misrecognized as real markers, causing generate_indexes.ts to stop.
 * This test locks the root-cause fix (whole-line matching).
 */
import { describe, it, expect, afterAll } from "bun:test";
import { execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  isAutogenBeginLine,
  isAutogenEndLine,
  extractAutogenBeginId,
  findAutogenBlocks,
  replaceAutogenBlock,
  countDesignBodyLines,
  deriveMeasureDateFromLastCommit,
  deriveReqMetricsMeasureDate,
} from "./generate_indexes.ts";
import { findRepoRoot } from "./cli_utils.ts";

describe("isAutogenBeginLine", () => {
  it("returns true for a canonical marker line", () => {
    expect(isAutogenBeginLine("<!-- AUTOGEN:BEGIN:id=catalog-ir-entries-pre-045 -->")).toBe(true);
  });

  it("returns true with leading whitespace", () => {
    expect(isAutogenBeginLine("  <!-- AUTOGEN:BEGIN:id=xxx -->")).toBe(true);
  });

  it("returns true with trailing whitespace", () => {
    expect(isAutogenBeginLine("<!-- AUTOGEN:BEGIN:id=xxx -->  ")).toBe(true);
  });

  it("returns false for a backtick-wrapped marker (negative)", () => {
    expect(isAutogenBeginLine("`<!-- AUTOGEN:BEGIN:id=xxx -->`")).toBe(false);
  });

  it("returns false for a prefix-backtick boundary", () => {
    expect(isAutogenBeginLine("`<!-- AUTOGEN:BEGIN:id=xxx -->")).toBe(false);
  });

  it("returns false for a suffix-backtick boundary", () => {
    expect(isAutogenBeginLine("<!-- AUTOGEN:BEGIN:id=xxx -->`")).toBe(false);
  });

  it("returns false for a prose line containing the marker inline", () => {
    const line = "AUTOGENブロックは`<!-- AUTOGEN:BEGIN:id=... -->`から対応する`<!-- AUTOGEN:END -->`までを除外する。";
    expect(isAutogenBeginLine(line)).toBe(false);
  });

  it("returns false for a plain text line", () => {
    expect(isAutogenBeginLine("This is a normal paragraph.")).toBe(false);
  });
});

describe("isAutogenEndLine", () => {
  it("returns true for a canonical end marker line", () => {
    expect(isAutogenEndLine("<!-- AUTOGEN:END -->")).toBe(true);
  });

  it("returns true with leading whitespace", () => {
    expect(isAutogenEndLine("  <!-- AUTOGEN:END -->")).toBe(true);
  });

  it("returns false for a backtick-wrapped end marker (negative)", () => {
    expect(isAutogenEndLine("`<!-- AUTOGEN:END -->`")).toBe(false);
  });

  it("returns false for a prose line containing end marker inline", () => {
    const line = "対応する`<!-- AUTOGEN:END -->`までを除外する。";
    expect(isAutogenEndLine(line)).toBe(false);
  });
});

describe("extractAutogenBeginId", () => {
  it("extracts the id from a canonical marker line", () => {
    expect(extractAutogenBeginId("<!-- AUTOGEN:BEGIN:id=catalog-ir-entries-pre-045 -->")).toBe("catalog-ir-entries-pre-045");
  });

  it("extracts id with leading whitespace", () => {
    expect(extractAutogenBeginId("  <!-- AUTOGEN:BEGIN:id=spec-metrics-measurement-example -->")).toBe("spec-metrics-measurement-example");
  });

  it("returns null for a backtick-wrapped marker (negative)", () => {
    expect(extractAutogenBeginId("`<!-- AUTOGEN:BEGIN:id=xxx -->`")).toBe(null);
  });

  it("returns null for a non-marker line", () => {
    expect(extractAutogenBeginId("normal text")).toBe(null);
  });
});

describe("findAutogenBlocks", () => {
  it("detects a real AUTOGEN block (positive)", () => {
    const content = [
      "# Title",
      "",
      "<!-- AUTOGEN:BEGIN:id=test-block -->",
      "line A",
      "line B",
      "<!-- AUTOGEN:END -->",
      "",
      "After block.",
    ].join("\n");

    const blocks = findAutogenBlocks(content);
    expect(blocks.length).toBe(1);
    expect(blocks[0].id).toBe("test-block");
    expect(blocks[0].startLine).toBe(2);
    expect(blocks[0].endLine).toBe(5);
    expect(blocks[0].currentBody).toEqual(["line A", "line B"]);
  });

  it("ignores backtick-wrapped marker strings in prose (negative)", () => {
    const content = [
      "# Title",
      "",
      "AUTOGENブロックは`<!-- AUTOGEN:BEGIN:id=... -->`から対応する`<!-- AUTOGEN:END -->`までを除外する。",
      "",
      "No real markers here.",
    ].join("\n");

    const blocks = findAutogenBlocks(content);
    expect(blocks.length).toBe(0);
  });

  it("detects only the real block when prose has backtick-wrapped markers (mixed)", () => {
    const content = [
      "# Design",
      "",
      "AUTOGENブロックは`<!-- AUTOGEN:BEGIN:id=... -->`から対応する`<!-- AUTOGEN:END -->`までを除外する。",
      "",
      "## Section",
      "",
      "<!-- AUTOGEN:BEGIN:id=real-block -->",
      "data",
      "<!-- AUTOGEN:END -->",
    ].join("\n");

    const blocks = findAutogenBlocks(content);
    expect(blocks.length).toBe(1);
    expect(blocks[0].id).toBe("real-block");
  });

  it("ignores a marker line with an adjacent backtick (boundary)", () => {
    const content = [
      "<!-- AUTOGEN:BEGIN:id=boundary -->",
      "content",
      "<!-- AUTOGEN:END -->`",
    ].join("\n");

    const blocks = findAutogenBlocks(content);
    expect(blocks.length).toBe(0);
  });

  it("detects multiple distinct real blocks", () => {
    const content = [
      "<!-- AUTOGEN:BEGIN:id=block-1 -->",
      "a",
      "<!-- AUTOGEN:END -->",
      "gap",
      "<!-- AUTOGEN:BEGIN:id=block-2 -->",
      "b",
      "<!-- AUTOGEN:END -->",
    ].join("\n");

    const blocks = findAutogenBlocks(content);
    expect(blocks.length).toBe(2);
    expect(blocks[0].id).toBe("block-1");
    expect(blocks[1].id).toBe("block-2");
  });
});

describe("replaceAutogenBlock", () => {
  it("replaces the body of a matching real block", () => {
    const content = [
      "<!-- AUTOGEN:BEGIN:id=target -->",
      "old line",
      "<!-- AUTOGEN:END -->",
    ].join("\n");

    const result = replaceAutogenBlock(content, "target", ["new line"]);
    expect(result).toContain("new line");
    expect(result).not.toContain("old line");
  });

  it("does not match a backtick-wrapped marker (negative)", () => {
    const content = [
      "Prose: `<!-- AUTOGEN:BEGIN:id=target -->` text.",
      "<!-- AUTOGEN:BEGIN:id=target -->",
      "old",
      "<!-- AUTOGEN:END -->",
    ].join("\n");

    const result = replaceAutogenBlock(content, "target", ["new"]);
    expect(result).toContain("new");
    expect(result).not.toContain("old");
    expect(result).toContain("Prose: `<!-- AUTOGEN:BEGIN:id=target -->` text.");
  });

  it("leaves content unchanged when no matching block exists", () => {
    const content = "no markers here";
    const result = replaceAutogenBlock(content, "absent", ["new"]);
    expect(result).toBe(content);
  });
});

describe("countDesignBodyLines", () => {
  it("excludes a real AUTOGEN block from the body count", () => {
    const content = [
      "---",
      "title: Test",
      "---",
      "# Heading",
      "",
      "<!-- AUTOGEN:BEGIN:id=metrics -->",
      "| col | val |",
      "|---|---|",
      "| a | b |",
      "<!-- AUTOGEN:END -->",
      "",
      "After.",
    ].join("\n");

    const count = countDesignBodyLines(content);
    expect(count).toBe(4);
  });

  it("counts a backtick-wrapped marker in prose as a body line (negative)", () => {
    const content = [
      "---",
      "title: Test",
      "---",
      "# Heading",
      "",
      "AUTOGENブロックは`<!-- AUTOGEN:BEGIN:id=... -->`から対応する`<!-- AUTOGEN:END -->`までを除外する。",
    ].join("\n");

    const count = countDesignBodyLines(content);
    expect(count).toBe(3);
  });

  it("handles mixed prose with backtick markers and a real AUTOGEN block", () => {
    const content = [
      "---",
      "title: Test",
      "---",
      "# Design",
      "",
      "AUTOGENブロックは`<!-- AUTOGEN:BEGIN:id=... -->`から除外する。",
      "",
      "## Metrics",
      "",
      "<!-- AUTOGEN:BEGIN:id=spec-metrics -->",
      "| Design | 行数 |",
      "|---|---|",
      "<!-- AUTOGEN:END -->",
      "",
      "Footer.",
    ].join("\n");

    const count = countDesignBodyLines(content);
    expect(count).toBe(8);
  });
});

// ─── 計測日導出（SC-002「計測日導出」、Issue #2211）───────────────────────
// 対象ドキュメント群の最終コミット日付導出（実行時日付非依存）とメトリクス
// ファイル自体の導出対象除外を固定する回帰テスト（IR-061 日次再検出の解消）。

const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "genidx-measure-date-"));

function commitAllWithDate(root: string, message: string, date: string): void {
  execSync("git add -A", { cwd: root });
  execSync(`git commit -q -m "${message}" --no-verify`, {
    cwd: root,
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: date,
      GIT_COMMITTER_DATE: date,
      GIT_AUTHOR_NAME: "test",
      GIT_AUTHOR_EMAIL: "t@t",
      GIT_COMMITTER_NAME: "test",
      GIT_COMMITTER_EMAIL: "t@t",
    },
  });
}

describe("deriveMeasureDateFromLastCommit", () => {
  it("returns YYYY-MM-DD for a tracked file with commit history", () => {
    const root = findRepoRoot(import.meta.dir);
    const date = deriveMeasureDateFromLastCommit(root, [
      path.join(root, "docs", "README.md"),
    ]);
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a stable value across repeated calls", () => {
    const root = findRepoRoot(import.meta.dir);
    const p = path.join(root, "docs", "README.md");
    expect(deriveMeasureDateFromLastCommit(root, [p])).toBe(
      deriveMeasureDateFromLastCommit(root, [p]),
    );
  });

  it("returns null for paths without commit history", () => {
    const root = findRepoRoot(import.meta.dir);
    expect(
      deriveMeasureDateFromLastCommit(root, [
        path.join(root, "docs", "__no_such_file__.md"),
      ]),
    ).toBe(null);
  });

  it("returns null for an empty path list", () => {
    const root = findRepoRoot(import.meta.dir);
    expect(deriveMeasureDateFromLastCommit(root, [])).toBe(null);
  });
});

describe("deriveReqMetricsMeasureDate", () => {
  const root = path.join(TMP_ROOT, "repo");
  if (!fs.existsSync(root)) {
    fs.mkdirSync(path.join(root, "docs", "requirements"), {
      recursive: true,
    });
    execSync("git init -q -b main", { cwd: root });
    execSync('git config user.email "t@t"', { cwd: root });
    execSync('git config user.name "t"', { cwd: root });

    fs.writeFileSync(
      path.join(root, "docs", "requirements", "REQ-001.md"),
      "# req\n",
    );
    commitAllWithDate(root, "add REQ-001", "2026-03-03T12:00:00+09:00");
  }

  it("derives req measure date from the REQ file group last commit", () => {
    expect(
      deriveReqMetricsMeasureDate(
        root,
        path.join(root, "docs", "requirements"),
        [{ id: "REQ-001", num: 1, lineCount: 1, signal: "+0", note: "" }],
      ),
    ).toBe("2026-03-03");
  });
});

afterAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
});
