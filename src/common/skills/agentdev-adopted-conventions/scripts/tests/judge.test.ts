// 判定規則の検査: 誤判定禁止（未採用参照例を欠落としない）、省略合格禁止
// （採用済み必須成果物の不在をファイル不在だけで合格させない）、
// 根拠確認（採用規約上の省略明示・実行契約由来の除外宣言）の機械的部分。

import { describe, expect, test } from "bun:test";
import { resolveBasis } from "../lib/resolve.ts";
import { evaluateCriteria, evaluateArtifactPath, type EvaluateOutcome } from "../lib/judge.ts";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function makeProjectWith(declarationYaml: string, files: readonly string[]): { root: string; cleanup: () => void } {
  const root = mkdtempSync(join(tmpdir(), "adopted-conventions-judge-"));
  const declPath = ".agentdev/adopted-conventions.yaml";
  mkdirSync(join(root, declPath, ".."), { recursive: true });
  writeFileSync(join(root, declPath), declarationYaml, "utf8");
  for (const file of files) {
    mkdirSync(join(root, file, ".."), { recursive: true });
    writeFileSync(join(root, file), "", "utf8");
  }
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

const declaration = [
  "version: adopted-conventions-v1",
  'adoptedAt: "2026-10-10"',
  "processes:",
  "  - id: detail-design",
  "    requires: []",
  "requiredArtifacts:",
  "  - process: detail-design",
  "    path: docs/designs/detail-design.md",
  "exclusions: []",
].join("\n");

function outcomeAsJudged(outcome: EvaluateOutcome): Extract<EvaluateOutcome, { outcome: "judged" }> {
  if (outcome.outcome !== "judged") throw new Error(`期待する判定結果ではない: ${outcome.outcome}`);
  return outcome;
}

describe("判定規則 2 条（誤判定禁止・省略合格禁止）", () => {
  test("基準に含まれる必須成果物が存在する場合は pass", () => {
    const { root, cleanup } = makeProjectWith(declaration, ["docs/designs/detail-design.md"]);
    try {
      const result = outcomeAsJudged(evaluateCriteria(root, resolveBasis(root)));
      expect(result.accepted).toBe(true);
      expect(result.summary).toEqual({ total: 1, pass: 1, excluded: 0, missing: 0, notInCriteria: 0 });
    } finally {
      cleanup();
    }
  });

  test("採用済み必須成果物の不在は missing（合格禁止）。採用規約上の省略明示がある場合のみ excluded-with-basis", () => {
    // exclusions に path ではなく process:artifact の期待で書いた宣言は schema 検証で除外対象不存在になるため、
    // このテストでは省略明示なしの不在を検査する
    const yaml = declaration
      .split("\n")
      .filter((line) => !line.startsWith("exclusions") && !line.includes("optional-explained"))
      .join("\n");
    const { root, cleanup } = makeProjectWith(yaml, []);
    try {
      const result = outcomeAsJudged(evaluateCriteria(root, resolveBasis(root)));
      expect(result.accepted).toBe(false);
      expect(result.summary.missing).toBe(1);
      const verdict = result.verdicts[0];
      expect(verdict?.status).toBe("missing");
      expect(verdict?.status === "missing" && verdict.confirmationRequired).toBe(true);
    } finally {
      cleanup();
    }
  });

  test("基準に含まれない成果物（未採用参照例）の不在を問い合わせると not-in-criteria となり欠落として計上しない", () => {
    const yaml = declaration
      .split("\n")
      .filter((line) => !line.startsWith("exclusions") && !line.includes("optional-explained"))
      .join("\n");
    const { root, cleanup } = makeProjectWith(yaml, []);
    try {
      // 参照例（基本設計等・未採用）の成果物不在を問い合わせる
      const result = outcomeAsJudged(evaluateCriteria(root, resolveBasis(root), { checkPaths: ["docs/designs/basic-design-ref-example.md"] }));
      expect(result.accepted).toBe(true);
      expect(result.summary.notInCriteria).toBe(1);
      expect(result.summary.missing).toBe(0);
      expect(result.verdicts[0]?.status).toBe("not-in-criteria");
    } finally {
      cleanup();
    }
  });

  test("採用規約上の採用外・省略の明示がある必須成果物の不在は excluded-with-basis", () => {
    const yaml = [
      "version: adopted-conventions-v1",
      'adoptedAt: "2026-10-10"',
      "processes:",
      "  - id: detail-design",
      "    requires: []",
      "requiredArtifacts:",
      "  - process: detail-design",
      "    path: docs/designs/detail-design.md",
      "  - process: detail-design",
      "    path: docs/designs/optional-explained.md",
      "exclusions:",
      "  - process: detail-design",
      "    artifact: docs/designs/optional-explained.md",
      "    reason: 本プロジェクトでは省略を明示（採用規約上の省略宣言）",
      "",
    ].join("\n");
    const { root, cleanup } = makeProjectWith(yaml, ["docs/designs/detail-design.md"]);
    try {
      const result = outcomeAsJudged(evaluateCriteria(root, resolveBasis(root)));
      expect(result.accepted).toBe(true);
      expect(result.summary.excluded).toBe(1);
      const verdict = result.verdicts.find((v) => v.status === "excluded-with-basis");
      expect(verdict?.status === "excluded-with-basis" && verdict.reason.length > 0).toBe(true);
    } finally {
      cleanup();
    }
  });

  test("実行契約由来の根拠ある除外宣言（executionExclusions）も省略合格の第二経路として成立する", () => {
    const yaml = declaration
      .split("\n")
      .filter((line) => !line.startsWith("exclusions") && !line.includes("optional-explained"))
      .join("\n");
    const { root, cleanup } = makeProjectWith(yaml, []);
    try {
      const result = outcomeAsJudged(evaluateCriteria(root, resolveBasis(root), {
        executionExclusions: [{ process: "detail-design", artifact: "docs/designs/detail-design.md", reason: "対象作業の実行契約における根拠ある除外" }],
      }));
      expect(result.accepted).toBe(true);
      expect(result.summary.excluded).toBe(1);
      expect(result.summary.missing).toBe(0);
    } finally {
      cleanup();
    }
  });

  test("実行契約由来の除外は空の根拠では成立しない", () => {
    const yaml = declaration
      .split("\n")
      .filter((line) => !line.startsWith("exclusions") && !line.includes("optional-explained"))
      .join("\n");
    const { root, cleanup } = makeProjectWith(yaml, []);
    try {
      const result = outcomeAsJudged(evaluateCriteria(root, resolveBasis(root), {
        executionExclusions: [{ process: "detail-design", artifact: "docs/designs/detail-design.md", reason: "" }],
      }));
      // 空の根拠は判定に使われないため、不在は missing のまま（合格禁止）
      expect(result.accepted).toBe(false);
      expect(result.summary.missing).toBe(1);
    } finally {
      cleanup();
    }
  });
});

describe("移行期デフォルト時の判定", () => {
  test("採用宣言が存在しない場合は判定を下さず判断留保を返す", () => {
    const root = mkdtempSync(join(tmpdir(), "adopted-conventions-deferred-"));
    try {
      const outcome = evaluateCriteria(root, resolveBasis(root));
      expect(outcome.outcome).toBe("judgment-deferred");
      if (outcome.outcome !== "judgment-deferred") return;
      expect(outcome.reference).toContain("移行期デフォルト");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("解決が実行不能な場合は判断留保（unresolvable）を返し全要件不存在として解釈しない", () => {
    const root = mkdtempSync(join(tmpdir(), "adopted-conventions-unresolvable-"));
    try {
      mkdirSync(join(root, ".agentdev"), { recursive: true });
      writeFileSync(join(root, ".agentdev", "adopted-conventions.yaml"), "version: nope\n", "utf8");
      const outcome = evaluateCriteria(root, resolveBasis(root));
      expect(outcome.outcome).toBe("unresolvable");
      if (outcome.outcome !== "unresolvable") return;
      expect(outcome.reason).toContain("schema");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("単独パス判定（evaluateArtifactPath）", () => {
  test("基準内パスの不在は missing、基準外パスは not-in-criteria", () => {
    const yaml = declaration
      .split("\n")
      .filter((line) => !line.startsWith("exclusions") && !line.includes("optional-explained"))
      .join("\n");
    const { root, cleanup } = makeProjectWith(yaml, []);
    try {
      const basis = resolveBasis(root);
      expect(evaluateArtifactPath(root, basis, "docs/designs/detail-design.md").status).toBe("missing");
      expect(evaluateArtifactPath(root, basis, "docs/designs/unreferenced-example.md").status).toBe("not-in-criteria");
    } finally {
      cleanup();
    }
  });
});
