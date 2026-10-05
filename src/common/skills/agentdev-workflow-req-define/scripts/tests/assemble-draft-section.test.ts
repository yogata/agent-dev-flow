import { describe, expect, test } from "bun:test";
import {
  assembleDraftSection,
  findTargetAreaHeadings,
  headingMatchesTarget,
} from "../src/assemble-draft-section.ts";

describe("heading matching", () => {
  test("uses exact heading text only", () => {
    expect(headingMatchesTarget("目的", "目的")).toBe(true);
    expect(headingMatchesTarget("目的と背景", "目的")).toBe(false);
    expect(findTargetAreaHeadings("## 目的", "## 目的\n\n### 目的と背景\n")).toHaveLength(1);
  });
});

describe("assembleDraftSection replace", () => {
  const original = "# Doc\n\n## Target\n\nold phrase\nkeep this\n\n## Other\nuntouched\n";

  test("replaces only the expected text in the exact target section", () => {
    const result = assembleDraftSection({
      operation: "replace",
      target_file: "doc.md",
      target_area: "## Target",
      old_text: "old phrase",
      new_text: "new phrase",
    }, original, "2026-01-01T00:00:00.000Z");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.assembled_content).toBe(original.replace("old phrase", "new phrase"));
    expect(result.replaced_count).toBe(1);
    expect(result.diff_summary.hunks[0]?.before).toEqual(["old phrase"]);
    expect(result.evidence.target_content_sha256).toHaveLength(64);
    expect(result.checks.pre.every((check) => check.ok)).toBe(true);
    expect(result.checks.post.every((check) => check.ok)).toBe(true);
  });

  test("rejects a missing target heading", () => {
    const result = assembleDraftSection({
      operation: "replace", target_file: "doc.md", target_area: "Missing",
      old_text: "old phrase", new_text: "new phrase",
    }, original);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("not found");
  });

  test("rejects ambiguous headings", () => {
    const result = assembleDraftSection({
      operation: "replace", target_file: "doc.md", target_area: "Target",
      old_text: "old phrase", new_text: "new phrase",
    }, `${original}\n## Target\nsecond\n`);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("ambiguous");
  });

  test("rejects an unexpected old-text count", () => {
    const result = assembleDraftSection({
      operation: "replace", target_file: "doc.md", target_area: "Target",
      old_text: "keep", new_text: "changed", expected_old_count: 2,
    }, original);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("count");
  });
});

describe("assembleDraftSection append", () => {
  test("appends to the exact anchor section without altering other content", () => {
    const original = "# Doc\n\n## Target\n\nbody\n\n## Other\nother body\n";
    const result = assembleDraftSection({
      operation: "append", target_file: "doc.md", anchor: "Target", content: "new item",
    }, original);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.assembled_content).toBe("# Doc\n\n## Target\n\nbody\n\nnew item\n\n## Other\nother body\n");
    expect(result.replaced_count).toBe(1);
    expect(result.checks.post.every((check) => check.ok)).toBe(true);
  });

  test("rejects an incorrect append anchor", () => {
    const result = assembleDraftSection({
      operation: "append", target_file: "doc.md", anchor: "Missing", content: "new item",
    }, "## Target\nbody\n");

    expect(result.ok).toBe(false);
  });
});
