// 既存REQ照合と保存手順の構造照合（REQ-004-069〜075）。
//
// REQ-004-069〜075（req-define の正規情報取得・照合基準の主軸化・採用根拠照合と
// 保存対象の拘束・保存後の再取得・整合確認・中断・部分失敗後の再実行・工程駆動系と
// の原則一致）の実現面を anchor 型で照合する。恒常的な構造検証であり、REQ-004-075
// の公開入口から正規保存と保存結果の確認までの実経路確認（REQ-107-007 の局所試験
// だけでの完了判定の禁止）を代替しない。対応関係の正は repository top-level
// traceability/ sidecar が保持する。
//
// 各 test は次の要件行の構造要素を pin する:
// - REQ-004-069 正規情報の実ファイル取得、見落とし・取得失敗の該当なし扱い禁止（fail-closed）
// - REQ-004-070 照合と操作分類の基準（目的・関心と所有範囲の対応を主軸、作業種別・
//   実装部品・入力体裁だけでの統合判断禁止、変更不要と保留の分類）
// - REQ-004-071 判断とその根拠の追跡可能性、初期判断と異なる所有先の再判断根拠記録
// - REQ-004-072 採用された対象・内容・範囲だけを保存対象、書込み権限だけを根拠にした
//   未承認の意味的変更確定の禁止
// - REQ-004-073 保存後の再取得・整合確認（README 整合確認と書込み時引用識別子実在検証は
//   構成要素、保存操作の成功だけを完了根拠としない）
// - REQ-004-074 中断・部分失敗後の再実行（正規状態からの成立済み・未成立・保留の再構成、
//   未成立部分のみ継続）
// - REQ-004-075 工程駆動系（phase-artifacts-update）との原則一致（所有先判断の共有基準）

import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// repoRoot 解決は main root と worktree の両方で動作する階層数非固定の探索とする
// （important-change-notification-pins.test.ts と同一の探索手順）。
function resolveRepoRoot(fromDir: string): string {
  let current = fromDir;
  for (;;) {
    if (existsSync(join(current, "AGENTS.md")) && existsSync(join(current, "src", "common"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error(`repoRoot not found from ${fromDir} (AGENTS.md + src/common traversal exhausted)`);
    }
    current = parent;
  }
}

const repoRoot = resolveRepoRoot(import.meta.dir);

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, ...rel.split("/")), "utf8");
}

// 見出しから次の同レベル見出しまでの節本文を抽出する。
function sectionBetween(text: string, heading: string): string {
  const start = text.indexOf(heading);
  if (start === -1) return "";
  const rest = text.slice(start + heading.length);
  const next = rest.indexOf("\n## ");
  return next === -1 ? rest : rest.slice(0, next);
}

// sidecar YAML の指定キー（implementation / verification）のセクション本文を抽出する。
function sidecarSection(text: string, key: string): string {
  const marker = `\n${key}:`;
  const start = text.indexOf(marker);
  if (start === -1) return "";
  const rest = text.slice(start + marker.length);
  const next = rest.search(/\n[a-z-]+:/);
  return next === -1 ? rest : rest.slice(0, next);
}

// sidecar セクション内の指定パスエントリの本文（path 直下の REQ 行列挙）を抽出する。
function sidecarEntry(section: string, pathKey: string): string {
  const start = section.indexOf(pathKey);
  if (start === -1) return "";
  const rest = section.slice(start);
  const next = rest.indexOf("\n  src/");
  return next === -1 ? rest : rest.slice(0, next);
}

function expectEntryRows(section: string, pathKey: string, rows: string[]): void {
  const entry = sidecarEntry(section, pathKey);
  expect(entry.length, `${pathKey} のエントリが存在すること`).toBeGreaterThan(0);
  for (const row of rows) {
    expect(entry).toContain(`- ${row}`);
  }
}

const PIN_TEST_REL = "src/common/skills/agentdev-req-file-manager/scripts/tests/req-matching-save-pins.test.ts";

describe("既存REQ照合と保存手順（REQ-004-069〜075）の組込み pin", () => {
  test("matching-and-merge.md は照合基準の主軸化と分類追加、fail-closed 取得失敗扱いを規定する（REQ-004-069、070）", () => {
    const doc = readRepo("src/common/skills/agentdev-req-file-manager/references/matching-and-merge.md");
    // REQ-004-069 正規情報の取得と取り扱い（fail-closed）
    const acquisition = sectionBetween(doc, "### 正規情報の取得と取り扱い");
    expect(acquisition.length).toBeGreaterThan(0);
    expect(acquisition).toContain("REQ・Decision・Design の実ファイルから必要な範囲を取得する");
    expect(acquisition).toContain("現行と廃止済みの情報、採用済みと未採用・未決の内容を区別なく判断材料へ混入させない");
    expect(acquisition).toContain("該当なしとして扱わず");
    expect(acquisition).toContain("fail-closed");
    // REQ-004-070 照合結果の分類（変更不要と保留の追加）
    const classification = sectionBetween(doc, "### 照合結果の分類");
    expect(classification).toContain("変更不要（REQ操作なし）");
    expect(classification).toContain("重複する要件行を追加しない");
    expect(classification).toContain("保留");
    expect(classification).toContain("候補と不足している判断材料を報告する");
    // REQ-004-070 操作分類の判定軸（主軸と補助材料）
    const axes = sectionBetween(doc, "### 操作分類の判定軸");
    expect(axes).toContain("主軸として評価する");
    expect(axes).toContain("補助材料");
    expect(axes).toContain("変更不要（REQ操作なし）");
    expect(axes).toContain("保留");
    // REQ-004-070 判定の禁止事項（作業種別・実装部品・入力体裁）
    expect(axes).toContain("作業種別を理由に、独立した目的を持つ要求を既存REQへ統合しない");
    expect(axes).toContain("実装部品の一致");
    expect(axes).toContain("入力の体裁だけを根拠に");
  });

  test("save-procedure.md は保存後の再取得・整合確認と中断・部分失敗後の再実行を規定する（REQ-004-073、074）", () => {
    const doc = readRepo("src/common/skills/agentdev-req-file-manager/references/save-procedure.md");
    // REQ-004-073 保存後の再取得・整合確認
    const recheck = sectionBetween(doc, "## 保存後の再取得・整合確認");
    expect(recheck.length, "保存後の再取得・整合確認の節が存在すること").toBeGreaterThan(0);
    expect(recheck).toContain("正規ファイルから再取得し");
    expect(recheck).toContain("採用内容、既存の有効内容、識別子、必要な参照関係、索引、状態規則");
    expect(recheck).toContain("構成要素");
    expect(recheck).toContain("README 整合確認と「書込み時引用識別子実在検証」節の引用識別子実在検証は、この照合の構成要素である");
    expect(recheck).toContain("保存操作の成功だけを保存の完了根拠としない");
    expect(recheck).toContain("確認できて初めて保存を完了とする");
    // REQ-004-074 中断・部分失敗後の再実行
    const resume = sectionBetween(doc, "## 中断・部分失敗後の再実行");
    expect(resume.length, "中断・部分失敗後の再実行の節が存在すること").toBeGreaterThan(0);
    expect(resume).toContain("書込み前、一部書込み後、保存後・検証前の各段階での中断");
    expect(resume).toContain("実際の正規状態から成立済み・未成立・保留を再構成し、未成立部分のみを継続する");
    expect(resume).toContain("成立済みの変更を重複適用しない");
    expect(resume).toContain("採用済み内容を消失させず");
    expect(resume).toContain("誤った採番");
    expect(resume).toContain("未検証のまま保存を完了扱いにしない");
    expect(resume).toContain("「リモート同期と hash 検証」節の手順から再開");
  });

  test("req-define references は採用根拠照合と保存対象の拘束、照合基準の共有を規定する（REQ-004-070、071、072、075）", () => {
    // REQ-004-071、072 採用根拠照合の結果と保存対象の拘束
    const dialogue = readRepo("src/common/skills/agentdev-workflow-req-define/references/input-and-dialogue.md");
    const constraint = sectionBetween(dialogue, "**採用根拠照合の結果と保存対象の拘束**");
    expect(constraint.length, "採用根拠照合の結果と保存対象の拘束の節が存在すること").toBeGreaterThan(0);
    expect(constraint).toContain("採用された対象・内容・範囲だけが保存対象");
    expect(constraint).toContain("書込み権限や許可された編集範囲の存在だけを根拠に、採用されていない意味的変更を確定しない");
    expect(constraint).toContain("初期判断と異なる所有先へ保存する場合は再判断の根拠を記録する");
    expect(constraint).toContain("無断で解決済みに扱わない");
    // REQ-004-070 STEP-3 の照合基準ポインタ
    const development = readRepo("src/common/skills/agentdev-workflow-req-define/references/requirement-development.md");
    const step3 = sectionBetween(development, "## STEP-3: 既存REQ照合");
    expect(step3).toContain("主軸");
    expect(step3).toContain("変更不要（REQ操作なし）");
    expect(step3).toContain("保留して候補と不足を報告する");
    // REQ-004-075 工程駆動系との原則一致（共有基準の明示）
    const artifactsUpdate = readRepo("src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md");
    expect(artifactsUpdate).toContain(
      "所有先判断（既存REQ照合の判定基準を含む）も委譲先の共有の成果物管理スキルの基準に従い、本経路独自の照合基準を導入しない",
    );
  });

  test("sidecar は REQ-004-069〜075 の implementation と verification を登録する（REQ-004-069〜075）", () => {
    const reqIds = ["REQ-004-069", "REQ-004-070", "REQ-004-071", "REQ-004-072", "REQ-004-073", "REQ-004-074", "REQ-004-075"];
    const fileManagerSidecar = readRepo("traceability/agentdev-req-file-manager.yaml");
    const reqDefineSidecar = readRepo("traceability/agentdev-workflow-req-define.yaml");
    // req-file-manager sidecar: implementation（069/070 → matching-and-merge.md、
    // 073/074 + 構成要素の引用識別子実在検証 → save-procedure.md）
    const fmImpl = sidecarSection(fileManagerSidecar, "implementation");
    expectEntryRows(fmImpl, "src/common/skills/agentdev-req-file-manager/references/matching-and-merge.md", [
      "REQ-004-069",
      "REQ-004-070",
    ]);
    expectEntryRows(fmImpl, "src/common/skills/agentdev-req-file-manager/references/save-procedure.md", [
      "REQ-107-009",
      "REQ-004-073",
      "REQ-004-074",
    ]);
    // req-file-manager sidecar: verification（全7行 → pin test）
    const fmVerif = sidecarSection(fileManagerSidecar, "verification");
    expectEntryRows(fmVerif, PIN_TEST_REL, reqIds);
    // req-define sidecar: implementation（071/072 → input-and-dialogue.md、070 → requirement-development.md）
    const rdImpl = sidecarSection(reqDefineSidecar, "implementation");
    expectEntryRows(rdImpl, "src/common/skills/agentdev-workflow-req-define/references/input-and-dialogue.md", [
      "REQ-004-071",
      "REQ-004-072",
    ]);
    expectEntryRows(rdImpl, "src/common/skills/agentdev-workflow-req-define/references/requirement-development.md", [
      "REQ-004-070",
    ]);
    // req-define sidecar: verification（全7行 → pin test）
    const rdVerif = sidecarSection(reqDefineSidecar, "verification");
    expectEntryRows(rdVerif, PIN_TEST_REL, reqIds);
    // REQ-004-075（工程駆動系との原則一致）の実現面は既存情報源の phase-artifacts-update sidecar に集約する
    const artifactsUpdateSidecar = readRepo("traceability/agentdev-workflow-phase-artifacts-update.yaml");
    const puImpl = sidecarSection(artifactsUpdateSidecar, "implementation");
    expectEntryRows(puImpl, "src/common/skills/agentdev-workflow-phase-artifacts-update/SKILL.md", ["REQ-004-075"]);
    // 全7行がいずれかの sidecar の implementation / verification の双方に計上されていること
    for (const reqId of reqIds) {
      expect(fmImpl.concat(rdImpl, puImpl)).toContain(reqId);
      expect(fmVerif.concat(rdVerif)).toContain(reqId);
    }
  });
});
