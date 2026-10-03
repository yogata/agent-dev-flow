// ADF-COVERS(verification): REQ-101-009
/**
 * Structure verification for the agreement-change acknowledgment path
 * (合意変更の受領確認経路) built into the case-revise and case-auto
 * workflow skills (REQ-101-009).
 *
 * REQ-101-009 requires the three-way distinction between 記録 (record),
 * 受領 (acknowledgment), and 実行への適用 (application to execution), impact
 * scoping with 継続・停止・再実行 decisions, hand-over of the latest
 * conditions to the responsible worker, confirmation of the worker's
 * application-policy report, no blanket stop of unaffected work, and no
 * change of purpose/scope/completion criteria via ordinary progress updates.
 *
 * This test pins the structural presence of those route elements in the
 * distributed skill bodies (src/common/skills/**). TS-003 (RA-006 scope):
 * structure verification of the acknowledgment path; end-to-end scenario
 * execution on the real execution base is #3399 (RA-007).
 */

import { describe, it, expect } from "bun:test";
import * as fs from "fs";
import * as path from "path";

const SCRIPT_DIR = import.meta.dir;
function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, ".opencode"))) return dir;
    if (fs.existsSync(path.join(dir, "src", "common"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}
const REPO_ROOT = findRepoRoot(SCRIPT_DIR);

const CASE_REVISE_SKILL = path.join(
  REPO_ROOT,
  "src",
  "common",
  "skills",
  "agentdev-workflow-case-revise",
  "SKILL.md",
);
const CASE_REVISE_IMPACT = path.join(
  REPO_ROOT,
  "src",
  "common",
  "skills",
  "agentdev-workflow-case-revise",
  "references",
  "impact-reassessment.md",
);
const CASE_REVISE_HANDOFF = path.join(
  REPO_ROOT,
  "src",
  "common",
  "skills",
  "agentdev-workflow-case-revise",
  "references",
  "handoff-and-update.md",
);
const CASE_REVISE_REVISION = path.join(
  REPO_ROOT,
  "src",
  "common",
  "skills",
  "agentdev-workflow-case-revise",
  "references",
  "definition-revision.md",
);
const CASE_AUTO_STOP_DECISION = path.join(
  REPO_ROOT,
  "src",
  "common",
  "skills",
  "agentdev-workflow-case-auto",
  "references",
  "stop-and-decision-resolution.md",
);

function readRepoFile(relParts: string[]): string {
  const abs = path.join(REPO_ROOT, ...relParts);
  return fs.readFileSync(abs, "utf-8");
}

describe("合意変更の受領確認経路（REQ-101-009）case-revise SKILL.md", () => {
  const content = readRepoFile([
    "src",
    "common",
    "skills",
    "agentdev-workflow-case-revise",
    "SKILL.md",
  ]);

  it("共通制約に記録・受領・適用の区別の制約を持つ", () => {
    expect(content).toContain("合意変更の受領確認（記録・受領・適用の区別）");
  });

  it("記録・受領・適用それぞれの担い手を区別して記述する", () => {
    expect(content).toContain("記録は req-define の合意記録と判断変更時の記録コメント");
    expect(content).toContain("受領は STEP-1 の受入確認と STEP-4 の影響対象特定");
    expect(content).toContain("適用は STEP-5 の Case 関連 Issue 本文更新");
  });

  it("STEP-4 に影響対象ごとの継続・停止・再実行の判断を含む", () => {
    expect(content).toContain("影響対象ごとの継続・停止・再実行の判断");
  });

  it("STEP-5 に最新条件の引き渡しと適用方針報告の確認を含む", () => {
    expect(content).toContain("影響対象の作業担当への最新条件引き渡し");
    expect(content).toContain("適用方針報告の確認");
  });

  it("影響しない進行中の作業を停止せず継続する分岐を持つ", () => {
    expect(content).toContain("影響しない進行中の作業は停止せず継続し");
  });

  it("通常の進行状況更新で目的・対象範囲・完了条件を変更しない", () => {
    expect(content).toContain(
      "通常の進行状況更新によって目的・対象範囲・完了条件を変更しない",
    );
  });
});

describe("合意変更の受領確認経路（REQ-101-009）impact-reassessment.md", () => {
  const content = readRepoFile([
    "src",
    "common",
    "skills",
    "agentdev-workflow-case-revise",
    "references",
    "impact-reassessment.md",
  ]);

  it("影響対象ごとの処置判断節を持つ", () => {
    expect(content).toContain("## 影響対象ごとの処置判断（継続・停止・再実行）");
  });

  it("進行状態別の処置判断表を持つ", () => {
    expect(content).toContain("実行結果確定");
    expect(content).toContain("実行中（委譲済み・active）");
    expect(content).toContain("未実行");
  });

  it("影響しない進行中の作業を一律停止しない", () => {
    expect(content).toContain("影響しない進行中の作業は一律停止せず継続する");
  });

  it("判断変更の記録は撤回対象を必須項目とする", () => {
    expect(content).toContain("判断変更記録契機に含まれる");
    expect(content).toContain("撤回対象を必須項目とする記録コメント");
  });
});

describe("合意変更の受領確認経路（REQ-101-009）handoff-and-update.md", () => {
  const content = readRepoFile([
    "src",
    "common",
    "skills",
    "agentdev-workflow-case-revise",
    "references",
    "handoff-and-update.md",
  ]);

  it("最新条件の引き渡しと適用方針報告の確認節を持つ", () => {
    expect(content).toContain("## 最新条件の引き渡しと適用方針報告の確認");
  });

  it("旧条件に基づかず再開できることを引き渡しの基準とする", () => {
    expect(content).toContain("旧条件に基づかず再開できることを基準とする");
  });

  it("適用方針の報告を確認するまで case-ready 引き継ぎへ進まない", () => {
    expect(content).toContain(
      "適用方針の報告が確認できるまで case-ready 引き継ぎへ進まない",
    );
  });

  it("影響しない対象の進行は止めない", () => {
    expect(content).toContain("一律停止はせず、影響のない対象の進行は止めない");
  });

  it("完了報告に判断変更の記録契機（撤回対象必須）を含める", () => {
    expect(content).toContain("判断変更の記録契機として撤回対象を必須項目に含む記録コメント");
  });
});

describe("合意変更の受領確認経路（REQ-101-009）definition-revision.md", () => {
  const content = readRepoFile([
    "src",
    "common",
    "skills",
    "agentdev-workflow-case-revise",
    "references",
    "definition-revision.md",
  ]);

  it("STEP-1 を受領と位置づけ、記録・適用と区別する", () => {
    expect(content).toContain("合意変更の「受領」に該当する");
    expect(content).toContain("「記録」は req-define の合意記録が担い");
    expect(content).toContain("「実行への適用」は STEP-5 の Case 関連 Issue 本文更新");
  });
});

describe("合意変更の受領確認経路（REQ-101-009）case-auto stop-and-decision-resolution.md", () => {
  const content = readRepoFile([
    "src",
    "common",
    "skills",
    "agentdev-workflow-case-auto",
    "references",
    "stop-and-decision-resolution.md",
  ]);

  it("判断変更時の受領確認（記録・受領・適用の区別）小節を持つ", () => {
    expect(content).toContain("#### 判断変更時の受領確認（記録・受領・適用の区別）");
  });

  it("記録区別は撤回対象を必須項目に含む記録コメントである", () => {
    expect(content).toContain("撤回対象（置き換え前の判断）を必須項目に含む記録コメント");
  });

  it("受領区別は影響対象の特定と処置判断、最新条件の引き渡しである", () => {
    expect(content).toContain("影響対象を特定し、継続・停止・再実行の処置を対象ごとに判断し");
    expect(content).toContain("最新条件（回答・根拠・作業仮定）を作業担当へ引き渡す");
  });

  it("適用区別は作業担当の適用方針報告の確認である", () => {
    expect(content).toContain("適用方針の報告を確認し");
  });

  it("影響しない対象を一律停止せず、進行状況更新で目的・対象範囲・完了条件を変更しない", () => {
    expect(content).toContain("影響しない対象を一律停止せず");
    expect(content).toContain("進行状況の更新によって目的・対象範囲・完了条件を変更しない");
  });

  it("Definition 変更の受領確認経路の本体は case-revise が所有すると接続する", () => {
    expect(content).toContain(
      "Definition 変更（再合意済み）の受領確認経路の本体は case-revise workflow が所有する",
    );
  });
});
