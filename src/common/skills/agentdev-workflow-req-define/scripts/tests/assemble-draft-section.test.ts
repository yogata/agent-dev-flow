import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
  ASSEMBLY_CHECKER,
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

  test("detects level-mixed duplicate headings without interpreting order", () => {
    const result = assembleDraftSection({
      operation: "replace", target_file: "doc.md", target_area: "## Target",
      old_text: "old phrase", new_text: "new phrase",
    }, `${original}\n### Target\nmisplaced\n`);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("ambiguous");
      expect(result.match_count).toBe(2);
      expect(result.checks.pre[0]?.detail).toContain("matches: 2");
    }
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

describe("assembly evidence", () => {
  const original = "# Doc\n\n## Target\n\nold phrase\nkeep this\n\n## Other\nuntouched\n";

  test("identifies the checker, version, settings, and result-affecting references", () => {
    const result = assembleDraftSection({
      operation: "replace",
      target_file: "doc.md",
      target_area: "## Target",
      old_text: "old phrase",
      new_text: "new phrase",
    }, original, "2026-01-01T00:00:00.000Z");
    if (!result.ok) throw new Error("expected success");

    expect(result.evidence.checker).toEqual(ASSEMBLY_CHECKER);
    expect(result.evidence.result_affecting_references.heading_match_rule).toContain("search-target-area.ts");
    expect(result.evidence.result_affecting_references.scan_scope).toContain("target section");
  });

  test("records pre/post check summary and compact diff in the evidence", () => {
    const result = assembleDraftSection({
      operation: "append",
      target_file: "doc.md",
      anchor: "Target",
      content: "new item",
    }, original, "2026-01-01T00:00:00.000Z");
    if (!result.ok) throw new Error("expected success");

    expect(result.evidence.checks_summary.pre.all_ok).toBe(true);
    expect(result.evidence.checks_summary.post.all_ok).toBe(true);
    expect(result.evidence.checks_summary.pre.count).toBe(result.checks.pre.length);
    expect(result.evidence.checks_summary.post.count).toBe(result.checks.post.length);
    expect(result.evidence.diff_compact.added).toBe(result.diff_summary.added);
    expect(result.evidence.diff_compact.removed).toBe(result.diff_summary.removed);
    expect(result.evidence.diff_compact.changed_lines_count).toBe(result.diff_summary.changed_lines_count);
  });

  test("keeps the checker version in sync with the package version", () => {
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8")) as { version: string };
    const checkerVersion: string = ASSEMBLY_CHECKER.version;
    expect(checkerVersion).toBe(pkg.version);
  });

  test("does not carry raw assembled content into the evidence", () => {
    const result = assembleDraftSection({
      operation: "replace",
      target_file: "doc.md",
      target_area: "## Target",
      old_text: "old phrase",
      new_text: "new phrase",
    }, original, "2026-01-01T00:00:00.000Z");
    if (!result.ok) throw new Error("expected success");

    expect(JSON.stringify(result.evidence)).not.toContain("old phrase");
    expect(JSON.stringify(result.evidence)).not.toContain("new phrase");
  });
});
