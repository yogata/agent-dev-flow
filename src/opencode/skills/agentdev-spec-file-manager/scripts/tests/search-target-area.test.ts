import { test, expect, describe } from "bun:test";
import {
  headingMatchesTarget,
  findTargetAreaHeadings,
  searchTargetArea,
} from "../src/search-target-area.ts";

describe("headingMatchesTarget", () => {
  test("exact match", () => {
    expect(headingMatchesTarget("目的", "目的")).toBe(true);
  });

  test("prefix match (heading starts with target)", () => {
    expect(headingMatchesTarget("目的と背景", "目的")).toBe(true);
  });

  test("no match when heading does not start with target", () => {
    expect(headingMatchesTarget("別の見出し", "目的")).toBe(false);
  });
});

describe("findTargetAreaHeadings", () => {
  test("finds matching heading lines", () => {
    const content = `# Title

## 目的

本文

### 目的 - 詳細

more text`;
    const matches = findTargetAreaHeadings("目的", content, "spec.md");
    expect(matches).toHaveLength(2);
    expect(matches[0]!.line).toBe(3);
    expect(matches[1]!.line).toBe(7);
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
});

describe("searchTargetArea", () => {
  test("aggregates matches across multiple files", () => {
    const files = [
      { path: "a.md", content: "## 目的\nbody" },
      { path: "b.md", content: "# 目的と概要\nbody" },
      { path: "c.md", content: "## 別のセクション\nbody" },
    ];
    const result = searchTargetArea("目的", files);
    expect(result.ok).toBe(true);
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0]!.file).toBe("a.md");
    expect(result.matches[1]!.file).toBe("b.md");
  });

  test("returns empty matches when nothing found (not an error)", () => {
    const files = [{ path: "a.md", content: "## 別\nbody" }];
    const result = searchTargetArea("目的", files);
    expect(result.ok).toBe(true);
    expect(result.matches).toEqual([]);
  });
});
