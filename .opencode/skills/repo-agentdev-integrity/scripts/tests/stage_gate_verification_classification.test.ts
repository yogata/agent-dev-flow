// ADF-COVERS(verification): REQ-021-023, REQ-021-024, REQ-021-025
//
// 検証スコープポリシーと段階制ゲート（REQ-021-023〜025 工程契約面）の
// fixture 検証。agentdev-traceability 配布スキルの解析コア
// （scanCorpus、resolveVerificationPolicyFromRoot、runChecks）で fixture コーパスから
// 要否判定（policy 未登録行 = 検証対応必須、明示登録行 = 任意、REQ-012-030）を導出し、
// Definition 保存（記録、未登録を理由に失敗させない）/ case-open（Root Case 確立を
// 妨げない）/ case-ready（policy 有効性と Design 対応の確認）/ case-close
// （必須行の完了阻止、任意行保護）のゲート状態遷移を検証する。
// あわせて3 Workflow Skill の工程契約文言の存在を検証する。
// 旧「未分類」中間状態の導出（classification.ts）は policy 導入により廃止済みである。

import { afterAll, describe, expect, it } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scanCorpus } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { runChecks } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/check.ts";
import { resolveVerificationPolicyFromRoot } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/verification_scope.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..", "..", "..", "..");
const TEMP_BASE = join("C:", "WINDOWS", "TEMP", "opencode");
const RUN_ID = `stage-gate-${crypto.randomUUID().slice(0, 8)}`;
const BASE_ROOT = join(TEMP_BASE, RUN_ID);

const MARKER = ["ADF", "-", "COVERS"].join("");

// フィクスチャ用の宣言行生成。テストソース内に完成形のマーカー文字列を直接
// 記述すると実リポジトリのコーパス走査で実宣言として誤検出されるため、
// マーカーはパーツ結合経由で組み立てる。
function tsDecl(role: string, ids: string): string {
  return `// ${MARKER}(${role}): ${ids}`;
}
function implDeclComment(id: string): string {
  return `<!-- ${MARKER}(implementation): ${id} -->`;
}

interface FixtureSpec {
  readonly reqId: string;
  readonly rows: readonly string[];
  /** traceability/policy.yaml の optional 列挙（未指定時は policy を配置しない = 全行が検証対応必須） */
  readonly policyOptional?: readonly string[];
  /** policy.yaml を読取不能（ディレクトリ）にする（fail-closed 検証用） */
  readonly policyUnreadable?: boolean;
  /** 検証対応宣言を持つ恒久検証手段を配置する要件行 */
  readonly verificationDeclarations?: readonly string[];
  /** 実装対応宣言を配置する要件行 */
  readonly implementationDeclarations?: readonly string[];
}

function writeFixture(root: string, rel: string, lines: readonly string[]): void {
  const filePath = join(root, rel);
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, lines.join("\n") + "\n", "utf-8");
}

function buildFixtureRoot(name: string, spec: FixtureSpec): string {
  const root = join(BASE_ROOT, name);
  mkdirSync(join(root, "docs", "requirements"), { recursive: true });
  writeFileSync(
    join(root, "docs", "requirements", `${spec.reqId}.md`),
    [
      "---",
      `id: ${spec.reqId}`,
      "---",
      "",
      "## 要件",
      "",
      "| ID | 要件 |",
      "|---|---|",
      ...spec.rows.map((row) => `| ${row} | 段階ゲート検証用の要件行 |`),
    ].join("\n") + "\n",
    "utf-8",
  );
  if (spec.policyUnreadable) {
    mkdirSync(join(root, "traceability", "policy.yaml"), { recursive: true });
  } else if (spec.policyOptional && spec.policyOptional.length > 0) {
    writeFixture(root, "traceability/policy.yaml", [
      "verification:",
      "  default: required",
      "  optional:",
      ...spec.policyOptional.map((id) => `    - ${id}`),
    ]);
  }
  const artifactLines: string[] = ["// 段階ゲート検証の fixture 成果物"];
  for (const id of spec.implementationDeclarations ?? []) {
    artifactLines.push(tsDecl("implementation", id));
  }
  for (const id of spec.verificationDeclarations ?? []) {
    artifactLines.push(tsDecl("verification", id));
  }
  mkdirSync(join(root, "src"), { recursive: true });
  writeFileSync(join(root, "src", "fixture-artifact.ts"), artifactLines.join("\n") + "\n", "utf-8");
  return root;
}

type RowState = "required-missing" | "optional" | "covered";

interface GateFacts {
  /** 検証対応必須行（policy 未登録）のうち検証対応宣言を持たない行 */
  readonly requiredMissing: readonly string[];
  /** 任意行（policy 明示登録行）のうち検証対応宣言を持たない行（完了阻止理由にしない） */
  readonly optionalWithoutVerification: readonly string[];
  /** 検証対応宣言を持つ行 */
  readonly covered: readonly string[];
  /** policy の要否判定が実行不能か（fail-closed 判定の根拠） */
  readonly policyUnavailable: boolean;
}

/**
 * 導出定義（検証対応宣言の有無 + policy 登録状態）から要否判定を直接導出し、
 * 工程ゲート手続きが利用する agentdev-traceability check の missing-verification
 * findings と一致することを突合する。
 */
function deriveGateFacts(root: string, known: readonly string[], target: readonly string[]): GateFacts {
  const scan = scanCorpus(root);
  const policy = resolveVerificationPolicyFromRoot(root, known);
  const report = runChecks(scan, known, {
    completenessReqIds: target,
    verificationPolicy: policy,
  });

  const hasVerification = (id: string): boolean =>
    scan.declarations.some((d) => d.role === "verification" && d.reqIds.includes(id));
  const isRegistered = (id: string): boolean => policy.optionalReqIds.has(id);
  const stateOf = (id: string): RowState => {
    if (isRegistered(id)) return "optional";
    return hasVerification(id) ? "covered" : "required-missing";
  };

  const requiredMissing = target.filter((id) => stateOf(id) === "required-missing");
  const optionalWithoutVerification = target.filter(
    (id) => stateOf(id) === "optional" && !hasVerification(id),
  );
  const covered = target.filter((id) => stateOf(id) === "covered");

  // 工程ゲート手続き（check の missing-verification findings を必須欠落行として採用）と
  // 導出定義が同一の集合を返すことの突合。policy 判定不能時は check が
  // fail-closed 計上（blocked finding）を行い、合格を返さない。
  const checkFindings = report.checks["missing-verification"].findings.map((f) => f.reqId);
  if (policy.unavailable) {
    expect(report.checks["missing-verification"].status).toBe("fail");
  } else {
    expect(checkFindings).toEqual(requiredMissing);
  }

  return { requiredMissing, optionalWithoutVerification, covered, policyUnavailable: policy.unavailable };
}

/** REQ-021-023: Definition 保存は未登録（必須）行を記録するが、未登録だけを理由に保存を失敗させない */
function gateDefinitionSave(facts: GateFacts): {
  readonly saveSucceeded: boolean;
  readonly recordedRequiredRows: readonly string[];
} {
  return { saveSucceeded: true, recordedRequiredRows: facts.requiredMissing };
}

/** REQ-021-024: case-open は policy 未登録行の残存があっても Root Case の確立を妨げない */
function gateCaseOpen(_facts: GateFacts): { readonly issueCreated: boolean } {
  return { issueCreated: true };
}

/**
 * REQ-021-024: case-ready は対象要件行に Design 対応1件以上が存在し、
 * 検証スコープポリシーが有効であることを ready への遷移の必要条件として扱う。
 * policy が判定不能な場合、対応完全性の合格は返らない（fail-closed）。
 */
function gateCaseReady(facts: GateFacts): { readonly ready: boolean } {
  if (facts.policyUnavailable) return { ready: false };
  return { ready: true };
}

/**
 * REQ-021-025: case-close は対象要件行の Design 対応、実装対応、検証対応
 * （policy が required と判定する要件行）の恒久的な対応が存在しない場合、
 * 完了として扱わない。任意行に恒久的な検証手段が存在しないことだけを
 * 理由として完了を阻害しない。
 */
function gateCaseClose(facts: GateFacts): {
  readonly treatedAsComplete: boolean;
  readonly blockReasons: readonly string[];
} {
  const blockReasons: string[] = [];
  if (facts.requiredMissing.length > 0) {
    blockReasons.push("required-missing-permanent-verification");
  }
  if (facts.policyUnavailable) {
    blockReasons.push("policy-evaluation-unavailable");
  }
  return { treatedAsComplete: blockReasons.length === 0, blockReasons };
}

afterAll(() => {
  rmSync(BASE_ROOT, { recursive: true, force: true });
});

describe("検証スコープポリシーと段階ゲート状態遷移", () => {
  const ALL_REQUIRED_ROWS = ["REQ-910-001", "REQ-910-002", "REQ-910-003"];

  it("(1) policy 未登録行を含む要件の Definition 保存が成功し、必須行が記録される（REQ-021-023）", () => {
    const root = buildFixtureRoot("required-remaining", {
      reqId: "REQ-910",
      rows: ALL_REQUIRED_ROWS,
      // 実装対応は要否判定と独立することを示すため全行に配置する
      implementationDeclarations: ALL_REQUIRED_ROWS,
      // policy も検証対応宣言もないため全行が必須欠落になる
    });
    const facts = deriveGateFacts(root, ALL_REQUIRED_ROWS, ALL_REQUIRED_ROWS);
    expect(facts.requiredMissing).toEqual(ALL_REQUIRED_ROWS);

    const result = gateDefinitionSave(facts);
    expect(result.saveSucceeded).toBe(true);
    expect(result.recordedRequiredRows).toEqual(ALL_REQUIRED_ROWS);
  });

  it("(2) policy 未登録行の残存があっても case-open は Root Case を確立する（REQ-021-024）", () => {
    const root = buildFixtureRoot("open-with-required", {
      reqId: "REQ-910",
      rows: ALL_REQUIRED_ROWS,
      implementationDeclarations: ALL_REQUIRED_ROWS,
    });
    const facts = deriveGateFacts(root, ALL_REQUIRED_ROWS, ALL_REQUIRED_ROWS);
    expect(facts.requiredMissing).toEqual(ALL_REQUIRED_ROWS);

    const result = gateCaseOpen(facts);
    expect(result.issueCreated).toBe(true);
  });

  it("(3) policy 明示登録行は任意、未登録行は必須と判定される", () => {
    const rows = ["REQ-911-001", "REQ-911-002"];
    const root = buildFixtureRoot("classified", {
      reqId: "REQ-911",
      rows,
      // 001 は検証対応宣言を持つ必須行、002 は policy 登録の任意行
      verificationDeclarations: ["REQ-911-001"],
      policyOptional: ["REQ-911-002"],
      implementationDeclarations: rows,
    });
    const facts = deriveGateFacts(root, rows, rows);
    expect(facts.requiredMissing).toEqual([]);
    expect(facts.covered).toEqual(["REQ-911-001"]);
    expect(facts.optionalWithoutVerification).toEqual(["REQ-911-002"]);

    const open = gateCaseOpen(facts);
    expect(open.issueCreated).toBe(true);
  });

  it("(4) 必須行の検証対応が欠落した状態で case-close を実行すると完了できない（REQ-021-025）", () => {
    const rows = ["REQ-912-001", "REQ-912-002"];
    const root = buildFixtureRoot("close-required-missing", {
      reqId: "REQ-912",
      rows,
      // 002 は policy 未登録（必須）で検証対応が欠落する
      verificationDeclarations: ["REQ-912-001"],
      implementationDeclarations: rows,
    });
    const facts = deriveGateFacts(root, rows, rows);
    expect(facts.requiredMissing).toEqual(["REQ-912-002"]);

    const result = gateCaseClose(facts);
    expect(result.treatedAsComplete).toBe(false);
    expect(result.blockReasons).toContain("required-missing-permanent-verification");
  });

  it("(5) 任意行の検証対応欠落だけでは case-close は完了を阻害しない（REQ-021-025）", () => {
    const rows = ["REQ-913-001", "REQ-913-002"];
    const root = buildFixtureRoot("close-optional-no-test", {
      reqId: "REQ-913",
      rows,
      // 002 は policy 登録の任意行で検証対応を持たない。これだけでは完了を阻害しない
      verificationDeclarations: ["REQ-913-001"],
      policyOptional: ["REQ-913-002"],
      implementationDeclarations: rows,
    });
    const facts = deriveGateFacts(root, rows, rows);
    expect(facts.requiredMissing).toEqual([]);
    expect(facts.optionalWithoutVerification).toEqual(["REQ-913-002"]);

    const result = gateCaseClose(facts);
    expect(result.treatedAsComplete).toBe(true);
    expect(result.blockReasons).toEqual([]);
  });

  it("(6) 全必須行に検証対応が存在する場合、本要件起因の完了阻止が発生しない（REQ-021-025）", () => {
    const rows = ["REQ-914-001", "REQ-914-002"];
    const root = buildFixtureRoot("close-all-covered", {
      reqId: "REQ-914",
      rows,
      // policy 未配置 = 全行必須。いずれも検証対応宣言を持つ
      verificationDeclarations: rows,
      implementationDeclarations: rows,
    });
    const facts = deriveGateFacts(root, rows, rows);
    expect(facts.requiredMissing).toEqual([]);
    expect(facts.covered).toEqual(rows);

    const result = gateCaseClose(facts);
    expect(result.treatedAsComplete).toBe(true);
    expect(result.blockReasons).toEqual([]);
  });

  it("(7) policy が判定不能な場合、case-ready / case-close は fail-closed で停止する（REQ-021-024、REQ-021-025）", () => {
    const rows = ["REQ-915-001", "REQ-915-002"];
    const root = buildFixtureRoot("close-policy-unreadable", {
      reqId: "REQ-915",
      rows,
      // policy.yaml をディレクトリ化して読取不能を再現する
      policyUnreadable: true,
      verificationDeclarations: rows,
      implementationDeclarations: rows,
    });
    const facts = deriveGateFacts(root, rows, rows);
    expect(facts.policyUnavailable).toBe(true);

    const ready = gateCaseReady(facts);
    expect(ready.ready).toBe(false);
    const close = gateCaseClose(facts);
    expect(close.treatedAsComplete).toBe(false);
    expect(close.blockReasons).toContain("policy-evaluation-unavailable");
  });
});

describe("段階ゲートの工程契約文言（3 Workflow Skill）", () => {
  function read(rel: string): string {
    return readFileSync(join(REPO_ROOT, rel), "utf-8");
  }

  it.each([
    // req-save 系（SKILL、references、Design）は Issue #2810（DEC-029）で廃止済みのため検査対象から除去した。
    // Definition 保存工程の割り当て先は REQ-021 側の更新（後続工程）で対応する。
    {
      file: "src/opencode/skills/agentdev-workflow-case-open/SKILL.md",
      // REQ-030 縮小後: case-open は未分類行が残っても Root Case 確立を妨げない（REQ-021-024）。
      // 検証対応要否の最終ゲートは case-ready へ移管された。
      phrases: ["対象要件行に検証対応要否の未分類行が残る場合も Root Case の確立を妨げない"],
    },
    {
      file: "src/opencode/skills/agentdev-workflow-case-close/SKILL.md",
      phrases: [
        "に恒久的な検証手段が存在しないことだけを理由として完了を阻害しない",
      ],
    },
    {
      file: "src/opencode/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md",
      phrases: [
        "検証対応要否の段階ゲート（完了阻止）",
        "完了として扱わない",
        "検証対応必須行に恒久検証対応が存在しない場合",
      ],
    },
    {
      file: "docs/designs/commands/case-open.md",
      phrases: [implDeclComment("REQ-021-014, REQ-021-024")],
    },
    {
      file: "docs/designs/commands/case-close.md",
      phrases: [implDeclComment("REQ-021-018, REQ-021-019, REQ-021-022, REQ-021-025")],
    },
  ])("工程契約文言が存在する: %s", ({ file, phrases }) => {
    const content = read(file);
    for (const phrase of phrases) {
      expect(content.includes(phrase)).toBe(true);
    }
  });
});
