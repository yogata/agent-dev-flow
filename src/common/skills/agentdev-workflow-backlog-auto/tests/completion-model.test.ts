import { describe, expect, test } from "bun:test";
import { judgeCompletion } from "./completion-model.ts";
import type { CompletionInput, MappingEntry, VerificationResult } from "./completion-model.ts";

// 期待値は「全体完了突合手続」の対応確認・必要検証全件成立から導く。実経路の証明ではない。
const complete: CompletionInput = {
  obligations: [
    { id: "ob-1", mandatory: true, requirementRows: ["R1"], requiredChecks: ["quality-gate", "acceptance"] },
    { id: "ob-2", mandatory: true, requirementRows: ["R2"], requiredChecks: ["quality-gate"] },
  ],
  mapping: [
    { obligationId: "ob-1", reqRow: "R1", execUnit: "issue-a" },
    { obligationId: "ob-2", reqRow: "R2", execUnit: "issue-b" },
  ],
  verifications: [
    { obligationId: "ob-1", reqRow: "R1", execUnit: "issue-a", kind: "quality-gate", passed: true },
    { obligationId: "ob-1", reqRow: "R1", execUnit: "issue-a", kind: "acceptance", passed: true },
    { obligationId: "ob-2", reqRow: "R2", execUnit: "issue-b", kind: "quality-gate", passed: true },
  ],
};

describe("全体完了突合手続の検証用模擬", () => {
  test("必須義務の各対応先で必要検証がすべて成立した場合に完遂とする", () => {
    expect(judgeCompletion(complete).completed).toBe(true);
  });

  test("同一実行単位の別検証が成功しても失敗結果を隠さない", () => {
    const input = { ...complete, verifications: complete.verifications.map((result) =>
      result.kind === "acceptance" ? { ...result, passed: false } : result) };
    const result = judgeCompletion(input);
    expect(result.completed).toBe(false);
    expect(result.missingVerifications).toEqual(["ob-1"]);
  });

  test("同一必要検証の成功結果と失敗結果が混在しても完遂としない", () => {
    const input = { ...complete, verifications: [...complete.verifications,
      { obligationId: "ob-1", reqRow: "R1", execUnit: "issue-a", kind: "acceptance", passed: false }] };
    expect(judgeCompletion(input).completed).toBe(false);
  });

  test("必要検証が欠落すれば別検証の成功だけでは完遂としない", () => {
    const input = { ...complete, verifications: complete.verifications.filter((result) => result.kind !== "acceptance") };
    expect(judgeCompletion(input).missingVerifications).toEqual(["ob-1"]);
  });

  test("必須義務の必要検証が未宣言なら空集合の成功にしない", () => {
    const input = { ...complete, obligations: complete.obligations.map((item) =>
      item.id === "ob-1" ? { ...item, requiredChecks: [] } : item) };
    expect(judgeCompletion(input).completed).toBe(false);
  });

  test("定義側の必要行が対応表から欠けていれば過不足なしとはしない", () => {
    const input = { ...complete, obligations: complete.obligations.map((item) =>
      item.id === "ob-1" ? { ...item, requirementRows: ["R1", "R1-missing"] } : item) };
    expect(judgeCompletion(input).missingObligations).toEqual(["ob-1"]);
  });

  test.each(["obligationId", "reqRow", "execUnit", "kind"] as const)("証拠の %s が異なれば不足を充足しない", (field) => {
    const input = { ...complete, verifications: complete.verifications.map((result) =>
      result.kind === "acceptance" ? { ...result, [field]: "unrelated" } : result) };
    expect(judgeCompletion(input).completed).toBe(false);
  });

  test("全 Issue が終了しても義務の対応先がなければ完遂としない", () => {
    const input = { ...complete, mapping: complete.mapping.filter((entry) => entry.obligationId !== "ob-2") };
    expect(judgeCompletion(input).missingObligations).toEqual(["ob-2"]);
  });

  const invalidTargets: readonly MappingEntry[] = [
    { obligationId: "ob-2", reqRow: "R2", execUnit: null },
    { obligationId: "ob-2", reqRow: "", execUnit: "issue-b" },
    { obligationId: "ob-2", reqRow: "unrelated-row", execUnit: "issue-b" },
  ];
  test.each([...invalidTargets])("対応先の欠落や未採用の定義行を拒否する: %j", (entry) => {
    const input = { ...complete, mapping: [complete.mapping[0], entry].filter((item): item is MappingEntry => item !== undefined) };
    expect(judgeCompletion(input).completed).toBe(false);
  });

  test("未知の義務への余分な対応は Issue 数が一致しても拒否する", () => {
    const input = { ...complete, mapping: [...complete.mapping,
      { obligationId: "unrelated-obligation", reqRow: "R1", execUnit: "issue-c" }] };
    expect(judgeCompletion(input).invalidMappings).toHaveLength(1);
  });

  test("完全に同じ対応の重複は拒否する", () => {
    const input = { ...complete, mapping: [...complete.mapping, ...complete.mapping] };
    expect(judgeCompletion(input).completed).toBe(false);
    expect(judgeCompletion(input).invalidMappings).toHaveLength(2);
  });

  test("正当な分割では複数実行単位の全必要検証が成立すれば完遂とする", () => {
    const splitEvidence: readonly VerificationResult[] = [
      { obligationId: "ob-1", reqRow: "R1", execUnit: "issue-c", kind: "quality-gate", passed: true },
      { obligationId: "ob-1", reqRow: "R1", execUnit: "issue-c", kind: "acceptance", passed: true },
    ];
    const input = { ...complete,
      mapping: [...complete.mapping, { obligationId: "ob-1", reqRow: "R1", execUnit: "issue-c" }],
      verifications: [...complete.verifications, ...splitEvidence] };
    expect(judgeCompletion(input).completed).toBe(true);
    expect(judgeCompletion({ ...input, verifications: complete.verifications }).completed).toBe(false);
  });

  test("統合した実行単位でも別義務の検証を流用して不足を隠さない", () => {
    const input = { ...complete,
      mapping: complete.mapping.map((entry) => ({ ...entry, execUnit: "shared-issue" })),
      verifications: complete.verifications.map((result) => ({ ...result, execUnit: "shared-issue" })) };
    expect(judgeCompletion(input).completed).toBe(true);
    const missing = { ...input, verifications: input.verifications.filter((result) => result.obligationId !== "ob-2") };
    expect(judgeCompletion(missing).missingVerifications).toEqual(["ob-2"]);
  });

  test("同じ実行単位の別定義行は独立した定義入力に存在する場合だけ許容する", () => {
    const mapping = [...complete.mapping, { obligationId: "ob-1", reqRow: "R1-split", execUnit: "issue-a" }];
    expect(judgeCompletion({ ...complete, mapping }).completed).toBe(false);
    const input = { ...complete, mapping,
      obligations: complete.obligations.map((item) => item.id === "ob-1" ? { ...item, requirementRows: ["R1", "R1-split"] } : item),
      verifications: [...complete.verifications,
        { obligationId: "ob-1", reqRow: "R1-split", execUnit: "issue-a", kind: "quality-gate", passed: true },
        { obligationId: "ob-1", reqRow: "R1-split", execUnit: "issue-a", kind: "acceptance", passed: true }] };
    expect(judgeCompletion(input).completed).toBe(true);
  });

  test("後継一式の突合には旧新対応履歴を現在の義務対応として混入させない", () => {
    const successor = { predecessor: { id: "old-set", mapping: [{ obligationId: "old-obligation", reqRow: "old-row", execUnit: "old-issue" }] }, current: complete };
    expect(judgeCompletion(successor.current).completed).toBe(true);
    const contaminated = { ...complete, mapping: [...complete.mapping, ...successor.predecessor.mapping] };
    expect(judgeCompletion(contaminated).completed).toBe(false);
  });

  test("元 RU と要件doc を保持せず保存済み snapshot と対応表から突合できる", () => {
    const saved: CompletionInput = structuredClone(complete);
    expect(judgeCompletion(saved).completed).toBe(true);
    expect(judgeCompletion({ ...saved, verifications: [] }).completed).toBe(false);
  });
});
