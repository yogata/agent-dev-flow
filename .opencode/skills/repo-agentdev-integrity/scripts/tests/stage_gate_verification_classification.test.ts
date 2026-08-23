// ADF-COVERS(verification): REQ-021-023, REQ-021-024, REQ-021-025
//
// 検証対応要否分類の段階制ゲート（OU-2、Issue #2418、REQ-021-023〜025 工程契約面）の
// fixture 検証（TS-004）。agentdev-traceability 配布スキルの解析コア
// （scanCorpus、resolveVerificationScopeFromRoot、runChecks）で fixture コーパスから
// 分類状態（未分類 = 検証対応宣言なし かつ 検証対応要否カタログ未登録、REQ-012-051）を導出し、
// req-save（検出・記録、保存は失敗させない）/ case-open（Issue 作成停止）/
// case-close（完了阻止、任意行保護）の3ゲート判定の状態遷移 (1)〜(7) を検証する。
// あわせて3 Workflow Skill の工程契約文言の存在を検証する。

import { afterAll, describe, expect, it } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scanCorpus } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/corpus.ts";
import { runChecks } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/check.ts";
import { resolveVerificationScopeFromRoot } from "../../../../../src/opencode/skills/agentdev-traceability/scripts/lib/verification_scope.ts";

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
  /** 検証対応要否カタログの任意行エントリ（未指定時はカタログを配置しない = 全行が検証対応必須） */
  readonly catalogEntries?: readonly string[];
  /** 検証対応宣言を持つ恒久検証手段を配置する要件行 */
  readonly verificationDeclarations?: readonly string[];
  /** 実装対応宣言を配置する要件行（検証対応要否の分類状態とは独立させる） */
  readonly implementationDeclarations?: readonly string[];
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
  if (spec.catalogEntries && spec.catalogEntries.length > 0) {
    mkdirSync(join(root, "docs", "designs", "foundations", "references"), { recursive: true });
    writeFileSync(
      join(
        root,
        "docs",
        "designs",
        "foundations",
        "references",
        "verification-scope-catalog.md",
      ),
      [
        "# 検証対応要否カタログ",
        "",
        "## 任意行エントリ",
        "",
        ...spec.catalogEntries.map((entry) => `- ${entry}`),
      ].join("\n") + "\n",
      "utf-8",
    );
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

type RowState = "unclassified" | "optional" | "mandatory-covered";

interface GateFacts {
  /** 未分類 = 検証対応宣言なし かつ 検証対応要否カタログ未登録（REQ-012-051） */
  readonly unclassified: readonly string[];
  /** 任意行（カタログ登録行）のうち検証対応宣言を持たない行（完了阻止理由にしない） */
  readonly optionalWithoutVerification: readonly string[];
  /** 必須行（カタログ未登録）のうち検証対応宣言を持つ行 */
  readonly mandatoryCovered: readonly string[];
}

/**
 * 導出定義（検証対応宣言の有無 + カタログ登録状態）から分類状態を直接導出し、
 * 工程ゲート手続きが利用する agentdev-traceability check の missing-verification
 * findings と一致することを突合する。
 */
function deriveGateFacts(root: string, known: readonly string[], target: readonly string[]): GateFacts {
  const scan = scanCorpus(root);
  const scope = resolveVerificationScopeFromRoot(root, known);
  const report = runChecks(scan, known, {
    completenessReqIds: target,
    verificationScope: scope,
  });

  const hasVerification = (id: string): boolean =>
    scan.declarations.some((d) => d.role === "verification" && d.reqIds.includes(id));
  const isRegistered = (id: string): boolean => scope.optionalReqIds.has(id);
  const stateOf = (id: string): RowState => {
    if (isRegistered(id)) return "optional";
    return hasVerification(id) ? "mandatory-covered" : "unclassified";
  };

  const unclassified = target.filter((id) => stateOf(id) === "unclassified");
  const optionalWithoutVerification = target.filter(
    (id) => stateOf(id) === "optional" && !hasVerification(id),
  );
  const mandatoryCovered = target.filter((id) => stateOf(id) === "mandatory-covered");

  // 工程ゲート手続き（check の missing-verification findings を未分類行として採用）と
  // 導出定義が同一の集合を返すことの突合
  const checkFindings = report.checks["missing-verification"].findings.map((f) => f.reqId);
  expect(checkFindings).toEqual(unclassified);

  return { unclassified, optionalWithoutVerification, mandatoryCovered };
}

/** REQ-021-023: req-save は未分類行を検出・記録するが、未分類だけを理由に保存を失敗させない */
function gateReqSave(facts: GateFacts): {
  readonly saveSucceeded: boolean;
  readonly recordedUnclassifiedRows: readonly string[];
} {
  return { saveSucceeded: true, recordedUnclassifiedRows: facts.unclassified };
}

/** REQ-021-024: case-open は未分類行の残存を停止条件とする（Issue を作成しない） */
function gateCaseOpen(facts: GateFacts): { readonly issueCreated: boolean } {
  return { issueCreated: facts.unclassified.length === 0 };
}

/**
 * REQ-021-025: case-close は未分類行の残存、および検証対応必須行への恒久検証対応の
 * 欠落を完了として扱わない。検証対応任意行に恒久的な検証手段が存在しないことだけを
 * 理由として完了を阻害しない。
 */
function gateCaseClose(facts: GateFacts): {
  readonly treatedAsComplete: boolean;
  readonly blockReasons: readonly string[];
} {
  const missingMandatoryPermanentVerification = facts.unclassified.filter(
    (id) => !facts.optionalWithoutVerification.includes(id),
  );
  const blockReasons: string[] = [];
  if (facts.unclassified.length > 0) blockReasons.push("unclassified-remaining");
  if (missingMandatoryPermanentVerification.length > 0) {
    blockReasons.push("mandatory-missing-permanent-verification");
  }
  return { treatedAsComplete: blockReasons.length === 0, blockReasons };
}

afterAll(() => {
  rmSync(BASE_ROOT, { recursive: true, force: true });
});

describe("TS-004: 検証対応要否分類の段階ゲート状態遷移", () => {
  const UNCLASSIFIED_ROWS = ["REQ-910-001", "REQ-910-002", "REQ-910-003"];

  it("(1) 未分類要件行を含む要件の req-save が成功し、未分類行が記録される", () => {
    const root = buildFixtureRoot("unclassified-remaining", {
      reqId: "REQ-910",
      rows: UNCLASSIFIED_ROWS,
      // 実装対応は検証対応要否の分類状態と独立することを示すため全行に配置する
      implementationDeclarations: UNCLASSIFIED_ROWS,
      // 検証対応宣言もカタログ登録もないため全行が未分類になる
    });
    const facts = deriveGateFacts(root, UNCLASSIFIED_ROWS, UNCLASSIFIED_ROWS);
    expect(facts.unclassified).toEqual(UNCLASSIFIED_ROWS);

    const result = gateReqSave(facts);
    expect(result.saveSucceeded).toBe(true);
    expect(result.recordedUnclassifiedRows).toEqual(UNCLASSIFIED_ROWS);
  });

  it("(2) 未分類行が残るまま case-open を実行すると停止する（Issue を作成しない）", () => {
    const root = buildFixtureRoot("unclassified-remaining", {
      reqId: "REQ-910",
      rows: UNCLASSIFIED_ROWS,
      implementationDeclarations: UNCLASSIFIED_ROWS,
    });
    const facts = deriveGateFacts(root, UNCLASSIFIED_ROWS, UNCLASSIFIED_ROWS);

    const result = gateCaseOpen(facts);
    expect(result.issueCreated).toBe(false);
  });

  it("(3) 全行を検証対応必須または任意へ分類すると停止が解除される", () => {
    const rows = ["REQ-911-001", "REQ-911-002"];
    const root = buildFixtureRoot("classified", {
      reqId: "REQ-911",
      rows,
      // 001 は検証対応宣言を持つ恒久検証手段で必須分類、002 はカタログ登録で任意分類
      verificationDeclarations: ["REQ-911-001"],
      catalogEntries: ["REQ-911-002: 実行時振る舞いを規定する要件行"],
    });
    const facts = deriveGateFacts(root, rows, rows);
    expect(facts.unclassified).toEqual([]);
    expect(facts.mandatoryCovered).toEqual(["REQ-911-001"]);
    expect(facts.optionalWithoutVerification).toEqual(["REQ-911-002"]);

    const result = gateCaseOpen(facts);
    expect(result.issueCreated).toBe(true);
  });

  it("(4) 未分類行が残る状態で case-close を実行すると完了できない", () => {
    const rows = ["REQ-912-001", "REQ-912-002"];
    const root = buildFixtureRoot("close-unclassified", {
      reqId: "REQ-912",
      rows,
      // 002 は宣言もカタログ登録もない未分類行として残存させる
      verificationDeclarations: ["REQ-912-001"],
      implementationDeclarations: rows,
    });
    const facts = deriveGateFacts(root, rows, rows);
    expect(facts.unclassified).toEqual(["REQ-912-002"]);

    const result = gateCaseClose(facts);
    expect(result.treatedAsComplete).toBe(false);
    expect(result.blockReasons).toContain("unclassified-remaining");
  });

  it("(5) 検証対応必須行の恒久検証対応が欠落した状態で case-close を実行すると完了できない", () => {
    const rows = ["REQ-913-001", "REQ-913-002"];
    const root = buildFixtureRoot("close-mandatory-missing", {
      reqId: "REQ-913",
      rows,
      // 002 は必須行（カタログ未登録）であり、実装対応宣言はあるが恒久検証対応（検証対応宣言）が欠落する
      verificationDeclarations: ["REQ-913-001"],
      implementationDeclarations: rows,
    });
    const facts = deriveGateFacts(root, rows, rows);
    expect(facts.unclassified).toEqual(["REQ-913-002"]);

    const result = gateCaseClose(facts);
    expect(result.treatedAsComplete).toBe(false);
    expect(result.blockReasons).toContain("mandatory-missing-permanent-verification");
  });

  it("(6) 全行分類済みかつ必須行に恒久検証対応が存在する場合、本要件起因の完了阻止が発生しない", () => {
    const rows = ["REQ-914-001", "REQ-914-002"];
    const root = buildFixtureRoot("close-all-covered", {
      reqId: "REQ-914",
      rows,
      // 全行が必須行として分類済みで、いずれも検証対応宣言を持つ
      verificationDeclarations: rows,
      implementationDeclarations: rows,
    });
    const facts = deriveGateFacts(root, rows, rows);
    expect(facts.unclassified).toEqual([]);
    expect(facts.mandatoryCovered).toEqual(rows);

    const result = gateCaseClose(facts);
    expect(result.treatedAsComplete).toBe(true);
    expect(result.blockReasons).toEqual([]);
  });

  it("(7) 任意行に恒久テストが存在しないことだけを理由として case-close が失敗しない", () => {
    const rows = ["REQ-915-001", "REQ-915-002"];
    const root = buildFixtureRoot("close-optional-no-test", {
      reqId: "REQ-915",
      rows,
      // 002 は任意行（カタログ登録）で検証対応宣言を持たない。これだけでは完了を阻害しない
      verificationDeclarations: ["REQ-915-001"],
      catalogEntries: ["REQ-915-002: 実行時振る舞いを規定する要件行"],
      implementationDeclarations: rows,
    });
    const facts = deriveGateFacts(root, rows, rows);
    expect(facts.unclassified).toEqual([]);
    expect(facts.optionalWithoutVerification).toEqual(["REQ-915-002"]);

    const result = gateCaseClose(facts);
    expect(result.treatedAsComplete).toBe(true);
    expect(result.blockReasons).toEqual([]);
  });
});

describe("段階ゲートの工程契約文言（3 Workflow Skill）", () => {
  function read(rel: string): string {
    return readFileSync(join(REPO_ROOT, rel), "utf-8");
  }

  it.each([
    {
      file: "src/opencode/skills/agentdev-workflow-req-save/SKILL.md",
      phrases: [
        "未分類（検証対応宣言が存在せず、検証対応要否カタログにも未登録）",
        "未分類行の存在だけを理由として保存を失敗させない",
      ],
    },
    {
      file: "src/opencode/skills/agentdev-workflow-req-save/references/precheck-and-req-ops.md",
      phrases: [
        "検証対応要否の未分類検出・記録（段階ゲート）",
        "の findings を未分類行として採用",
      ],
    },
    {
      file: "src/opencode/skills/agentdev-workflow-req-save/references/indexes-and-persistence.md",
      phrases: ["未分類行の記録（段階ゲート）"],
    },
    {
      file: "src/opencode/skills/agentdev-workflow-case-open/SKILL.md",
      phrases: ["対象要件行の検証対応要否未分類残存を含む"],
    },
    {
      file: "src/opencode/skills/agentdev-workflow-case-open/references/execution-unit-and-preflight.md",
      phrases: [
        "対象要件行に検証対応要否が未分類の行が残っていないこと",
        "分類完了を case-open または実装着手前までの必須条件として扱う",
        "未分類行が残る場合は Issue を作成せずに停止する",
      ],
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
      file: "docs/designs/commands/req-save.md",
      phrases: [implDeclComment("REQ-021-012, REQ-021-023")],
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
