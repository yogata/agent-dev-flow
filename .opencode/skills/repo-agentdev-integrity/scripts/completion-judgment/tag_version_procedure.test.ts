// ADF-COVERS(verification): REQ-110-007
// タグ・版運用手順の検証（bun test 分割①で恒久発火）。
// 検査基準の正は正規原本（REQ-110-007、v5-completion-judgment Design「タグ・版運用手順」節、
// v4-migration-and-release Design「v3 baseline と rollback anchor」節・「RC tag 運用と cutover
// sequence」節）であり、実行結果から生成しない。実環境照合は読取専用（git rev-parse）であり、
// タグの作成・移動・削除・push は行わない。

import { describe, expect, test } from "bun:test";
import {
  checkNewVersionGrantProcedure,
  checkTagPinnedCommit,
  GRANT_BOUNDARIES,
  V5_TAG,
  V5_TAG_PINNED_COMMIT,
  verifyTagImmutability,
  type NewVersionGrantProcedure,
} from "./tag_version_procedure.ts";

// テスト実行 cwd は repo root（REQ-060 bun test 実行形態）。
// git worktree は同一リポジトリ（同一 .git・同一タグ空間）を参照するため、
// worktree root / main root のいずれから実行してもタグ照合は同一対象を参照する。
const REPO_ROOT = process.cwd();

const PINNED_FULL_COMMIT = "025b25474fd6143da6627c5e80c4b17f09a4e11c";

// 正規新版付与手順: v5-completion-judgment Design「タグ・版運用手順」節と
// v4-migration-and-release Design の境界の正投影（test 側で独立して記述する。
// GRANT_BOUNDARIES の import 値から構築しない。恒真検査を避けるため）。
const CANONICAL_GRANT_PROCEDURE: NewVersionGrantProcedure = {
  targetCommitRule: "separate-from-pinned",
  tagType: "annotated",
  existingTagImmutability: "no-move",
  executionTiming: "after-case-close-acceptance",
  authPath: "non-interactive-req102",
  steps: [
    "完遂が判定された完成コミット識別（v5.0.0 固定点 025b2547 とは別のコミットを exact candidate commit として識別する）",
    "完成コミットに annotated tag として新しい版を付与する",
    "新しい版の tag push を REQ-102 非対話認証経路で実施する（既存 tag は一切移動しない）",
  ],
};

describe("タグ→コミット対応の前後照合（REQ-110-007・実環境読取専用）", () => {
  test("実環境の v5.0.0 タグは固定点 025b2547 を指し、前後照合で不変である", () => {
    const report = verifyTagImmutability(REPO_ROOT, V5_TAG);
    expect(report.before.verdict).toBe("pass");
    expect(report.before.commit).toStartWith(V5_TAG_PINNED_COMMIT);
    expect(report.before.commit).toBe(PINNED_FULL_COMMIT);
    expect(report.after.verdict).toBe("pass");
    expect(report.after.commit).toBe(report.before.commit);
    expect(report.unchanged).toBe(true);
    expect(report.ok).toBe(true);
  });

  test("固定点不一致の照合結果は fail（pinned-commit-mismatch）として識別される", () => {
    const result = checkTagPinnedCommit(V5_TAG, PINNED_FULL_COMMIT.replace("025b2547", "deadbee"));
    expect(result.verdict).toBe("fail");
    expect(result.reason).toBe("pinned-commit-mismatch");
  });

  test("タグ不存在（解決不能）の照合結果は fail（tag-missing）として識別される", () => {
    const result = checkTagPinnedCommit(V5_TAG, null);
    expect(result.verdict).toBe("fail");
    expect(result.reason).toBe("tag-missing");
  });
});

describe("新版付与手順の版付与標準境界検査（REQ-110-007・v4-migration-and-release Design）", () => {
  test("正規手順（Design 正投影）は境界検査に合格する", () => {
    const check = checkNewVersionGrantProcedure(CANONICAL_GRANT_PROCEDURE);
    expect(check.ok).toBe(true);
    expect(check.violations).toEqual([]);
  });

  test("既存 tag 非移動境界を欠く手順は不合格になる（既存 tag 移動は禁止）", () => {
    const violating: NewVersionGrantProcedure = {
      ...CANONICAL_GRANT_PROCEDURE,
      existingTagImmutability: "move-existing",
    };
    const check = checkNewVersionGrantProcedure(violating);
    expect(check.ok).toBe(false);
    expect(check.violations).toContain("boundary:existingTagImmutability");
  });

  test("固定点を再利用する手順（完成コミットの別途識別なし）は不合格になる", () => {
    const violating: NewVersionGrantProcedure = {
      ...CANONICAL_GRANT_PROCEDURE,
      targetCommitRule: "reuse-pinned-commit",
    };
    const check = checkNewVersionGrantProcedure(violating);
    expect(check.ok).toBe(false);
    expect(check.violations).toContain("boundary:targetCommitRule");
  });

  test("lightweight tag 手順は不合格になる（annotated tag 境界）", () => {
    const violating: NewVersionGrantProcedure = {
      ...CANONICAL_GRANT_PROCEDURE,
      tagType: "lightweight",
    };
    const check = checkNewVersionGrantProcedure(violating);
    expect(check.ok).toBe(false);
    expect(check.violations).toContain("boundary:tagType");
  });

  test("case-close 完了前実行・対話認証の手順は不合格になる（実行時点・認証経路境界）", () => {
    const timingViolating: NewVersionGrantProcedure = {
      ...CANONICAL_GRANT_PROCEDURE,
      executionTiming: "before-case-close-acceptance",
    };
    const authViolating: NewVersionGrantProcedure = {
      ...CANONICAL_GRANT_PROCEDURE,
      authPath: "interactive-manual",
    };
    expect(checkNewVersionGrantProcedure(timingViolating).violations).toContain(
      "boundary:executionTiming",
    );
    expect(checkNewVersionGrantProcedure(authViolating).violations).toContain(
      "boundary:authPath",
    );
  });

  test("手順ステップの欠落・順序崩れは不合格になる（識別 → annotated tag 作成 → tag push）", () => {
    const missingPush: NewVersionGrantProcedure = {
      ...CANONICAL_GRANT_PROCEDURE,
      steps: CANONICAL_GRANT_PROCEDURE.steps.slice(0, 2),
    };
    const check = checkNewVersionGrantProcedure(missingPush);
    expect(check.ok).toBe(false);
    expect(check.violations).toContain("steps:tag-push");

    const reordered: NewVersionGrantProcedure = {
      ...CANONICAL_GRANT_PROCEDURE,
      steps: [...CANONICAL_GRANT_PROCEDURE.steps].reverse(),
    };
    const check2 = checkNewVersionGrantProcedure(reordered);
    expect(check2.ok).toBe(false);
    expect(check2.violations).toContain("steps:order");
  });
});

describe("検査基準定数の正規原本整合（実装由来生成でないことの構造確認）", () => {
  test("固定点・境界値は正規原本の規定値と一致する", () => {
    // 固定点: REQ-110-007（025b2547）
    expect(V5_TAG_PINNED_COMMIT).toBe("025b2547");
    // 境界値: v4-migration-and-release Design・REQ-102・委譲契約 RA-005
    expect(GRANT_BOUNDARIES.tagType).toBe("annotated");
    expect(GRANT_BOUNDARIES.existingTagImmutability).toBe("no-move");
    expect(GRANT_BOUNDARIES.targetCommitRule).toBe("separate-from-pinned");
    expect(GRANT_BOUNDARIES.executionTiming).toBe("after-case-close-acceptance");
    expect(GRANT_BOUNDARIES.authPath).toBe("non-interactive-req102");
    // test 側正規手順と境界定数の一致は Design 正投影の一致であり、
    // 不一致が生じた場合は本テストが fail して逸脱を検出する
    expect({
      targetCommitRule: CANONICAL_GRANT_PROCEDURE.targetCommitRule,
      tagType: CANONICAL_GRANT_PROCEDURE.tagType,
      existingTagImmutability: CANONICAL_GRANT_PROCEDURE.existingTagImmutability,
      executionTiming: CANONICAL_GRANT_PROCEDURE.executionTiming,
      authPath: CANONICAL_GRANT_PROCEDURE.authPath,
    }).toEqual({ ...GRANT_BOUNDARIES });
  });
});
