// ---------------------------------------------------------------------------
// 環境制約時の親オーケストレータ直接書込みフォールバックの実現面 pin。
// case-auto Design「環境制約時の親オーケストレータ直接書込みフォールバック」
// 節と SKILL.md 共通制約のフォールバック条項が、発動条件の環境制約限定、
// 発動時の委譲記録義務、Custom Tool 境界と git ガードレール非代替の3要素を
// 含んで本文に実装されていることを pin する anchor 型結合テスト。
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

function readSkillFile(): string {
  return fs.readFileSync(
    path.join(
      REPO_ROOT,
      "src",
      "common",
      "skills",
      "agentdev-workflow-case-auto",
      "SKILL.md",
    ),
    "utf-8",
  );
}

function readCaseAutoDesign(): string {
  return fs.readFileSync(
    path.join(REPO_ROOT, "docs", "designs", "commands", "case-auto.md"),
    "utf-8",
  );
}

describe("環境制約時の直接書込みフォールバックの実現面 pin", () => {
  test("case-auto Design にフォールバック節が3要素を含んで存在する", () => {
    const design = readCaseAutoDesign();
    expect(design).toContain(
      "### 環境制約時の親オーケストレータ直接書込みフォールバック",
    );
    expect(design).toContain(
      "親オーケストレータ（case-auto）が当該書込みを直接実行するフォールバックを標準動作として許容する",
    );
    expect(design).toContain("発動条件は環境制約（恒常的な書込み不能）に限定する");
    expect(design).toContain(
      "フォールバック発動時は委譲記録に発動理由（環境制約の内容）と親実施の事実を記録する",
    );
    expect(design).toContain(
      "Custom Tool 境界と git 操作ガードレールを置き換えるものではない",
    );
    expect(design).toContain(
      "環境制約時の親オーケストレータ直接書込みフォールバック（REQ-003-031）」節",
    );
  });

  test("SKILL.md 共通制約にフォールバック条項が3要素と節名参照を含んで存在する", () => {
    const skill = readSkillFile();
    expect(skill).toContain("環境制約時の直接書込みフォールバック");
    expect(skill).toContain(
      "親オーケストレータ（本 workflow）が当該書込みを直接実行するフォールバックを標準動作として許容する",
    );
    expect(skill).toContain("発動条件は環境制約に限定し、一時障害は既存の再試行・回復経路で扱う");
    expect(skill).toContain(
      "発動時は委譲記録に発動理由（環境制約の内容）と親実施の事実を記録する",
    );
    expect(skill).toContain(
      "Custom Tool 境界と git 操作ガードレールを置き換えるものではなく、書込み経路の追加選択肢として機能する",
    );
    expect(skill).toContain(
      "case-auto Design「環境制約時の親オーケストレータ直接書込みフォールバック」節",
    );
  });
});
