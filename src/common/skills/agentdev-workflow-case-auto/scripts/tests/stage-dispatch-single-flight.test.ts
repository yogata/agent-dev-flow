// ---------------------------------------------------------------------------
// 段階派遣の single-flight 保護の手順 pin。case-auto Design「段階派遣の
// single-flight 保護」節の stage 3 実行手順が SKILL.md と orchestration
// reference に実装されていることを、本文文言で pin する anchor 型結合テスト。
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

function readReference(fileName: string): string {
  return fs.readFileSync(
    path.join(
      REPO_ROOT,
      "src",
      "common",
      "skills",
      "agentdev-workflow-case-auto",
      "references",
      fileName,
    ),
    "utf-8",
  );
}

describe("段階派遣の single-flight 保護の手順 pin", () => {
  test("SKILL.md の stage 3 手順に single-flight 保護の4要素と非導入規律が明文化されている", () => {
    const skill = readSkillFile();
    expect(skill).toContain("段階派遣の single-flight 保護");
    expect(skill).toContain("既存派遣の再利用");
    expect(skill).toContain("冪等前置");
    expect(skill).toContain("先行結果の自動破棄を行わない");
    expect(skill).toContain("lock / queue / scheduler");
  });

  test("orchestration reference の stage 3 runtime 制御契約に single-flight 手順の4要素と非導入規律が明文化されている", () => {
    const orchestration = readReference("input-resolution-and-orchestration.md");
    expect(orchestration).toContain("段階派遣の single-flight 保護");
    expect(orchestration).toContain("進行中派遣の検出");
    expect(orchestration).toContain("新規派遣のブロックと既存派遣の再利用");
    expect(orchestration).toContain("子 Issue 起票の冪等前置");
    expect(orchestration).toContain("二重派遣検知時の是正フロー");
    expect(orchestration).toContain("既存オープン Issue の検索（重複検知）");
    expect(orchestration).toContain("自動破棄しない");
    expect(orchestration).toContain("lock / queue / scheduler");
  });
});
