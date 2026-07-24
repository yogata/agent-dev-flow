/**
 * Regression tests for AUTOGEN marker detection (Issue #1771, RU-0002).
 *
 * Verifies that the whole-line matching strategy correctly:
 *   - detects real AUTOGEN marker lines (positive cases)
 *   - ignores backtick-wrapped marker strings in prose (negative cases)
 *   - handles boundary cases where backticks are adjacent to marker lines
 *
 * SPEC: docs/specs/integrity/index-auto-generation.md「AUTOGEN marker 検出契約」
 * Background: PR #1718 workaround (HTML comment syntax abstraction) addressed
 * a symptom where backtick-wrapped marker strings in spec-health-metrics.md L26
 * were misrecognized as real markers, causing generate_indexes.ts to stop.
 * This test locks the root-cause fix (whole-line matching).
 */
import { describe, it, expect } from "bun:test";
import {
  isAutogenBeginLine,
  isAutogenEndLine,
  extractAutogenBeginId,
  findAutogenBlocks,
  replaceAutogenBlock,
  countSpecBodyLines,
} from "./generate_indexes.ts";

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
      "# SPEC",
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

describe("countSpecBodyLines", () => {
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

    const count = countSpecBodyLines(content);
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

    const count = countSpecBodyLines(content);
    expect(count).toBe(3);
  });

  it("handles mixed prose with backtick markers and a real AUTOGEN block", () => {
    const content = [
      "---",
      "title: Test",
      "---",
      "# SPEC",
      "",
      "AUTOGENブロックは`<!-- AUTOGEN:BEGIN:id=... -->`から除外する。",
      "",
      "## Metrics",
      "",
      "<!-- AUTOGEN:BEGIN:id=spec-metrics -->",
      "| SPEC | 行数 |",
      "|---|---|",
      "<!-- AUTOGEN:END -->",
      "",
      "Footer.",
    ].join("\n");

    const count = countSpecBodyLines(content);
    expect(count).toBe(8);
  });
});
