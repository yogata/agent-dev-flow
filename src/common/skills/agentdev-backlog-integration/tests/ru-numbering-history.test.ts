// ---------------------------------------------------------------------------
// RU 採番の git 履歴検査（REQ-039-007）の手続 pin と検証用模擬。
// integration-judgment.md（採番規則の正）と contradiction-ru-and-persistence.md
// （採番実行箇所・進捗記録）の git 履歴検査手続（消費済み・削除済み RU 番号を
// 含む使用済み集合の収集、衝突不採番、履歴検査不能時の fail-closed）が
// 実装されていることを anchor 型 pin で確認し、衝突判定と fail-closed は
// 検証用模擬（決定的シミュレーション）で検査する。模擬は runtime 機構では
// なく検証コードであり、手続表の改訂時は本模擬も追随更新する。
// 対応関係の正は repository top-level の traceability sidecar（本ファイルは
// 配布物のため concrete ID を直書きせず節名参照のみ）。
// ---------------------------------------------------------------------------

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, "src", "common"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(import.meta.dir);
const INTEGRATION = fs.readFileSync(
  path.join(REPO_ROOT, "src", "common", "skills", "agentdev-backlog-integration", "references", "integration-judgment.md"),
  "utf-8",
);
const PERSISTENCE = fs.readFileSync(
  path.join(REPO_ROOT, "src", "common", "skills", "agentdev-workflow-backlog-review", "references", "contradiction-ru-and-persistence.md"),
  "utf-8",
);

describe("RU 採番の git 履歴検査 pin（採番規則・実行箇所・進捗記録）", () => {
  test("integration-judgment.md の採番規則が git 履歴検査を前置させ、使用済み集合に消費済み・削除済み番号を含めることを宣言している", () => {
    expect(INTEGRATION).toContain("**git 履歴検査（採番の前置）**");
    expect(INTEGRATION).toContain("`git log --all` 相当の履歴走査");
    expect(INTEGRATION).toContain("ディレクトリ現状には存在しない消費済み・削除済み番号を含めて使用済み集合とする");
    expect(INTEGRATION).toContain("提案番号が使用済み集合に衝突する場合は採番せず、次の未使用番号へ進む");
  });

  test("integration-judgment.md が履歴検査不能時の fail-closed（採番確定せず理由報告）を宣言している", () => {
    expect(INTEGRATION).toContain("**履歴検査不能時の fail-closed**");
    expect(INTEGRATION).toContain("採番を確定せずに停止し、履歴検査不能の理由（実行した手段と失敗内容）を報告する");
    expect(INTEGRATION).toContain("履歴検査不能を「検査済み（衝突なし）」として扱わない");
  });

  test("contradiction-ru-and-persistence.md の採番実行箇所が履歴検査の前置と実施記録（進捗記録）を組込んでいる", () => {
    expect(PERSISTENCE).toContain("**採番の git 履歴検査（生成の前置・fail-closed）**");
    expect(PERSISTENCE).toContain("履歴検査が実行できない環境では採番を確定せず、履歴検査不能の理由（実行した手段と失敗内容）を報告して停止する");
    expect(PERSISTENCE).toContain("**履歴検査実施記録**");
    expect(PERSISTENCE).toContain("履歴検査の実施（実行手段、収集した使用済み番号の範囲、衝突の有無、確定した提案番号）を進捗記録（Evidence）に残す");
  });

  test("Completion Verification に履歴検査の実施・衝突非検出・不能時の fail-closed を確認する項目がある", () => {
    expect(PERSISTENCE).toContain("採番の git 履歴検査が実行され、提案番号が履歴上の使用済み番号（消費済み・削除済みを含む）と衝突していないこと");
    expect(PERSISTENCE).toContain("履歴検査の実施が進捗記録（Evidence）に残っていること");
    expect(PERSISTENCE).toContain("履歴検査不能の場合は採番が確定されず理由が報告されていること（履歴検査不能が成功扱いになっていないこと）");
  });
});

// ---------------------------------------------------------------------------
// 模擬: 衝突判定（現状最大+1 の候補が履歴使用済み集合と衝突する場合の不採番）
// ---------------------------------------------------------------------------

/** 現状ディレクトリの番号集合と履歴使用済み集合から、次の採番を決定する模擬。 */
function allocateNextRcuNumber(
  currentFiles: readonly string[],
  historyUsedNumbers: readonly string[],
): { ok: true; allocated: string } | { ok: false; reason: string } {
  const currentMax = currentFiles.reduce((max, name) => {
    const m = /^RU-(\d{4})\.md$/.exec(name);
    if (m === null) return max;
    return Math.max(max, Number(m[1]));
  }, 0);
  const historyUsed = new Set(historyUsedNumbers);
  let candidate = currentMax + 1;
  // 衝突する番号を採番せず、次の未使用番号へ進む（履歴使用番号は飛ばす）
  while (historyUsed.has(`RU-${String(candidate).padStart(4, "0")}`)) {
    candidate += 1;
  }
  return { ok: true, allocated: `RU-${String(candidate).padStart(4, "0")}` };
}

describe("採番履歴検査の検証用模擬（衝突不採番・次の未使用番号）", () => {
  test("現状には存在しない消費済み番号（履歴上は消費済み）との衝突で提案番号を採番しない", () => {
    // ディレクトリ現状が空でも、履歴上消費済み（v5.1.4 実行で承認・削除済み）の
    // RU-0001〜0010 は使用済み集合に含まれるため RU-0001 は提案されない
    const historyUsed = ["RU-0001", "RU-0002", "RU-0003", "RU-0004", "RU-0005", "RU-0006", "RU-0007", "RU-0008", "RU-0009", "RU-0010"];
    const result = allocateNextRcuNumber([], historyUsed);
    expect(result).toEqual({ ok: true, allocated: "RU-0011" });
    expect(result.ok && result.allocated).not.toBe("RU-0001");
  });

  test("現状最大番号+1 が履歴使用済みと衝突する場合も、次の未使用番号を採番する", () => {
    const currentFiles = ["RU-0239.md"];
    const historyUsed = ["RU-0240", "RU-0241"];
    const result = allocateNextRcuNumber(currentFiles, historyUsed);
    expect(result).toEqual({ ok: true, allocated: "RU-0242" });
  });

  test("履歴使用番号と衝突しない場合、現状最大+1 をそのまま採番する", () => {
    const result = allocateNextRcuNumber(["RU-0005.md"], ["RU-0001", "RU-0002", "RU-0003", "RU-0004", "RU-0009"]);
    expect(result).toEqual({ ok: true, allocated: "RU-0006" });
  });
});

// ---------------------------------------------------------------------------
// 模擬: 履歴検査不能時の fail-closed（採番確定しない・成功扱いにしない）
// ---------------------------------------------------------------------------

type HistoryCheckOutcome =
  | { readonly kind: "checked"; readonly usedNumbers: readonly string[] }
  | { readonly kind: "unavailable"; readonly means: string; readonly failure: string };

function collectHistoryUsedNumbers(gitLogExitCode: number | null, stdout: string): HistoryCheckOutcome {
  if (gitLogExitCode === null || gitLogExitCode !== 0) {
    return { kind: "unavailable", means: "git log --all 相当の履歴走査", failure: `exit code ${gitLogExitCode}` };
  }
  const used = [...new Set([...stdout.matchAll(/RU-\d{4}/g)].map((m) => m[0]))].sort();
  return { kind: "checked", usedNumbers: used };
}

describe("履歴検査不能時の fail-closed 検証用模擬", () => {
  test("履歴参照が失敗する環境（非 git・コマンド異常）では採番を確定せず理由を報告する", () => {
    const outcome = collectHistoryUsedNumbers(128, "fatal: not a git repository (or any of the parent directories): .git");
    expect(outcome.kind).toBe("unavailable");
    if (outcome.kind === "unavailable") {
      expect(outcome.failure).toContain("128");
      expect(outcome.means).toContain("git log --all");
    }
    // 採番の確定は行われない（履歴検査不能が成功扱いにされない）
    const canFinalize = outcome.kind === "checked";
    expect(canFinalize).toBe(false);
  });

  test("履歴検査が成功した場合のみ採番を確定できる", () => {
    const outcome = collectHistoryUsedNumbers(0, ".agentdev/backlog/req-units/RU-0001.md\n.agentdev/backlog/req-units/RU-0010.md");
    expect(outcome.kind).toBe("checked");
    if (outcome.kind === "checked") {
      expect(outcome.usedNumbers).toContain("RU-0001");
      expect(outcome.usedNumbers).toContain("RU-0010");
    }
  });
});
