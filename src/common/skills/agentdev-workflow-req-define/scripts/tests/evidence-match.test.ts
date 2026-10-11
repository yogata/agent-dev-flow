import { describe, expect, test } from "bun:test";
import { ASSEMBLY_CHECKER, assembleDraftSection, type AssemblyEvidence } from "../src/assemble-draft-section.ts";
import { matchAssemblyEvidence } from "../src/evidence-match.ts";

const original = "# Doc\n\n## Target\n\nold phrase\nkeep this\n\n## Other\nuntouched\n";

function runReplace(): AssemblyEvidence {
  const result = assembleDraftSection({
    operation: "replace",
    target_file: "doc.md",
    target_area: "## Target",
    old_text: "old phrase",
    new_text: "new phrase",
  }, original, "2026-01-01T00:00:00.000Z");
  if (!result.ok) throw new Error("expected success");
  return result.evidence;
}

describe("matchAssemblyEvidence", () => {
  test("reuses a fully matching evidence without invalidating anything", () => {
    const evidence = runReplace();
    const match = matchAssemblyEvidence(structuredClone(evidence), evidence);

    expect(match.reusable).toBe(true);
    expect(match.mismatch_reasons).toEqual([]);
    expect(match.invalidates.assembly).toBe(false);
    expect(match.invalidates.inspection).toBe(false);
  });

  test("treats missing evidence as not verified", () => {
    for (const stored of [null, undefined, {}, "string"]) {
      const match = matchAssemblyEvidence(stored, runReplace());
      expect(match.reusable).toBe(false);
      expect(match.mismatch_reasons).toContain("evidence-missing");
      expect(match.invalidates.assembly).toBe(true);
      expect(match.invalidates.inspection).toBe(true);
    }
  });

  test("treats changed source content as invalidating assembly and inspection", () => {
    const evidence = runReplace();
    const changed = { ...evidence, target_content_sha256: "0".repeat(64) };
    const match = matchAssemblyEvidence(changed, evidence);

    expect(match.reusable).toBe(false);
    expect(match.mismatch_reasons).toContain("target_content_sha256");
    expect(match.invalidates.assembly).toBe(true);
    expect(match.invalidates.inspection).toBe(true);
  });

  test("treats changed edit conditions as invalidating assembly", () => {
    const evidence = runReplace();
    const changed = {
      ...evidence,
      execution_conditions: { ...evidence.execution_conditions, expected_old_count: 2 },
    };
    const match = matchAssemblyEvidence(changed, evidence);

    expect(match.reusable).toBe(false);
    expect(match.mismatch_reasons).toContain("execution_conditions");
    expect(match.invalidates.assembly).toBe(true);
  });

  test("treats a checker version change as invalidating inspection only", () => {
    const evidence = runReplace();
    const changed = { ...evidence, checker: { ...evidence.checker, version: "9.9.9" } };
    const match = matchAssemblyEvidence(changed, evidence);

    expect(match.reusable).toBe(false);
    expect(match.mismatch_reasons).toContain("checker");
    expect(match.invalidates.assembly).toBe(false);
    expect(match.invalidates.inspection).toBe(true);
  });

  test("treats changed result-affecting references as invalidating inspection only", () => {
    const evidence = runReplace();
    const changed = {
      ...evidence,
      result_affecting_references: { ...evidence.result_affecting_references, scan_scope: "whole document" },
    };
    const match = matchAssemblyEvidence(changed, evidence);

    expect(match.reusable).toBe(false);
    expect(match.mismatch_reasons).toContain("result_affecting_references");
    expect(match.invalidates.assembly).toBe(false);
    expect(match.invalidates.inspection).toBe(true);
  });

  test("treats changed check scope as invalidating assembly and inspection", () => {
    const evidence = runReplace();
    const changed = { ...evidence, check_scope: { ...evidence.check_scope, end_line: evidence.check_scope.end_line + 5 } };
    const match = matchAssemblyEvidence(changed, evidence);

    expect(match.reusable).toBe(false);
    expect(match.mismatch_reasons).toContain("check_scope");
    expect(match.invalidates.assembly).toBe(true);
    expect(match.invalidates.inspection).toBe(true);
  });

  test("ignores result-only fields such as timestamps and summaries", () => {
    const evidence = runReplace();
    const stale = { ...evidence, executed_at: "1999-01-01T00:00:00.000Z" };
    const match = matchAssemblyEvidence(stale, evidence);

    expect(match.reusable).toBe(true);
  });

  test("matches the shipped checker identity", () => {
    expect(ASSEMBLY_CHECKER.settings.heading_match).toBe("exact-after-normalization");
  });
});
