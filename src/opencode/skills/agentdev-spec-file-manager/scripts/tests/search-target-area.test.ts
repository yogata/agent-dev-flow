import { test, expect, describe } from "bun:test";
import {
  headingMatchesTarget,
  findTargetAreaHeadings,
  searchTargetArea,
  normalizeTargetArea,
} from "../src/search-target-area.ts";

describe("headingMatchesTarget", () => {
  test("exact match", () => {
    expect(headingMatchesTarget("目的", "目的")).toBe(true);
  });

  test("no prefix match (exact match only per SPEC)", () => {
    expect(headingMatchesTarget("目的と背景", "目的")).toBe(false);
  });

  test("no match when heading does not start with target", () => {
    expect(headingMatchesTarget("別の見出し", "目的")).toBe(false);
  });
});

describe("findTargetAreaHeadings", () => {
  test("finds only exact-matching heading lines", () => {
    const content = `# Title

## 目的

本文

### 目的 - 詳細

more text`;
    const matches = findTargetAreaHeadings("目的", content, "spec.md");
    expect(matches).toHaveLength(1);
    expect(matches[0]!.line).toBe(3);
  });

  test("returns empty when no headings match", () => {
    const content = "# Title\n\nbody without target";
    const matches = findTargetAreaHeadings("目的", content, "spec.md");
    expect(matches).toEqual([]);
  });

  test("does not match non-heading lines", () => {
    const content = `本文中に 目的 という単語があっても`;
    const matches = findTargetAreaHeadings("目的", content, "spec.md");
    expect(matches).toEqual([]);
  });

  test("normalizes ## prefix in target_area before matching", () => {
    const content = "## 目的\n\nbody";
    const matches = findTargetAreaHeadings("## 目的", content, "spec.md");
    expect(matches).toHaveLength(1);
    expect(matches[0]!.line).toBe(1);
  });

  test("normalizes ### prefix in target_area before matching", () => {
    const content = "### IR-{NNN}\n\nbody";
    const matches = findTargetAreaHeadings("### IR-{NNN}", content, "spec.md");
    expect(matches).toHaveLength(1);
  });

  test("prefix-less target_area still works (backward compat)", () => {
    const content = "## 目的\n\nbody";
    const matches = findTargetAreaHeadings("目的", content, "spec.md");
    expect(matches).toHaveLength(1);
  });
});

describe("normalizeTargetArea", () => {
  test("strips ## prefix", () => {
    expect(normalizeTargetArea("## 目的")).toBe("目的");
  });

  test("strips ### prefix", () => {
    expect(normalizeTargetArea("### IR-{NNN}")).toBe("IR-{NNN}");
  });

  test("strips # prefix", () => {
    expect(normalizeTargetArea("# Title")).toBe("Title");
  });

  test("passes through text without prefix", () => {
    expect(normalizeTargetArea("目的")).toBe("目的");
  });

  test("trims whitespace", () => {
    expect(normalizeTargetArea("  目的  ")).toBe("目的");
  });
});

describe("searchTargetArea", () => {
  test("aggregates matches across multiple files (exact match only)", () => {
    const files = [
      { path: "a.md", content: "## 目的\nbody" },
      { path: "b.md", content: "# 目的と概要\nbody" },
      { path: "c.md", content: "## 別のセクション\nbody" },
    ];
    const result = searchTargetArea("目的", files);
    expect(result.ok).toBe(true);
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]!.file).toBe("a.md");
  });

  test("returns empty matches when nothing found (not an error)", () => {
    const files = [{ path: "a.md", content: "## 別\nbody" }];
    const result = searchTargetArea("目的", files);
    expect(result.ok).toBe(true);
    expect(result.matches).toEqual([]);
  });
});
