// ADF-COVERS(verification): REQ-110-007
// タグ・版運用手順（v5-completion-judgment Design「タグ・版運用手順」節の実装側構造）:
//   1. 既存 v5.0.0 タグ（025b2547 固定点）の付け替え・削除を行わず、前後照合でタグ→コミット対応を確認する
//   2. 完遂判定後に完成コミットを別途識別し、新しい版（タグ）を付与する。版付与は v4-migration-and-release
//      Design の移行・release 標準境界に従う（annotated tag・exact candidate commit・既存 tag 非移動・
//      REQ-102 非対話認証。実行時点は case-close 最終受入判定合格後）
// 本モジュールは読取照合（git rev-parse の読取専用・非対話・リモート操作なし実行）と手順宣言の
// 構造検査のみを行い、タグの作成・移動・削除・push は一切行わない。実際の新版付与の実行は
// case-close が最終受入判定合格後に実施する（REQ-110-007、委譲契約 RA-005）。

import { spawnSync } from "node:child_process";

export const V5_TAG = "v5.0.0";

// 固定点は REQ-110-007 の要件行が規定する 8 桁 short hash（025b2547）。
export const V5_TAG_PINNED_COMMIT = "025b2547";

export interface TagCommitCheck {
  readonly verdict: "pass" | "fail";
  readonly tag: string;
  readonly commit: string | null;
  readonly reason: "pinned-commit-match" | "tag-missing" | "pinned-commit-mismatch";
}

// 判定純関数: タグ→コミット対応の照合。合格条件は「v5.0.0 → 025b2547 が不変」
// （Issue #3579 完了条件1）。固定点の正は REQ-110-007 であり、実行結果から生成しない。
export function checkTagPinnedCommit(tag: string, commit: string | null): TagCommitCheck {
  if (commit === null) {
    return { verdict: "fail", tag, commit, reason: "tag-missing" };
  }
  if (!commit.startsWith(V5_TAG_PINNED_COMMIT)) {
    return { verdict: "fail", tag, commit, reason: "pinned-commit-mismatch" };
  }
  return { verdict: "pass", tag, commit, reason: "pinned-commit-match" };
}

// 実環境読取: git rev-parse <tag>^{commit}（読取専用・非対話・リモート操作なし）。
// タグが存在しない・参照解決不能な場合は null を返す。
export function readTagCommit(root: string, tag: string): string | null {
  const result = spawnSync("git", ["-C", root, "rev-parse", `${tag}^{commit}`], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return null;
  }
  const out = (result.stdout ?? "").trim();
  return out.length > 0 ? out : null;
}

// 前後照合: 同一検証実行内でタグ→コミット対応を2回読取し、
// 固定点一致と読取間不変の双方を確認する（v5-completion-judgment Design
// 「タグ・版運用手順」節「前後照合でタグ→コミット対応を確認する」）。
export interface TagBeforeAfterReport {
  readonly before: TagCommitCheck;
  readonly after: TagCommitCheck;
  readonly unchanged: boolean;
  readonly ok: boolean;
}

export function verifyTagImmutability(root: string, tag: string): TagBeforeAfterReport {
  const before = checkTagPinnedCommit(tag, readTagCommit(root, tag));
  const after = checkTagPinnedCommit(tag, readTagCommit(root, tag));
  const unchanged = before.commit !== null && before.commit === after.commit;
  return {
    before,
    after,
    unchanged,
    ok: before.verdict === "pass" && after.verdict === "pass" && unchanged,
  };
}

// 新版付与手順が従うべき版付与標準境界。検査基準（期待値）の正は正規原本であり、
// 実行結果から生成しない:
//   - targetCommitRule: 完遂が判定されたコミットを別途識別する（REQ-110-007。v5.0.0 固定点を再利用しない）
//   - tagType: annotated tag・exact candidate commit（v4-migration-and-release Design「RC tag 運用と
//     cutover sequence」節の tag 作成境界）
//   - existingTagImmutability: 既存 tag は一切移動しない（同 Design「v3 baseline と rollback anchor」節）
//   - executionTiming: タグ対象は case-close 完了後（委譲契約 RA-005。完遂判定後の新版付与）
//   - authPath: タグ操作は REQ-102 非対話認証経路
export const GRANT_BOUNDARIES = {
  targetCommitRule: "separate-from-pinned",
  tagType: "annotated",
  existingTagImmutability: "no-move",
  executionTiming: "after-case-close-acceptance",
  authPath: "non-interactive-req102",
} as const;

export type GrantBoundaryKey = keyof typeof GRANT_BOUNDARIES;

export interface NewVersionGrantProcedure {
  readonly targetCommitRule: string;
  readonly tagType: string;
  readonly existingTagImmutability: string;
  readonly executionTiming: string;
  readonly authPath: string;
  // 実行手順ステップ（順序保持）: 完成コミット識別 → annotated tag 作成 → tag push。
  // v4-migration-and-release Design の cutover sequence 工程 3〜4 に対応する。
  readonly steps: readonly string[];
}

export interface GrantProcedureCheck {
  readonly ok: boolean;
  readonly violations: readonly string[];
}

// 手順宣言が版付与標準境界に従うことの構造検査
// （Issue #3579 完了条件1「版付与手順が v4-migration-and-release Design の標準境界に従うことを確認する」）。
// 検査基準は GRANT_BOUNDARIES（正規原本から導出した定数）であり、手順の実行成否から生成しない。
export function checkNewVersionGrantProcedure(p: NewVersionGrantProcedure): GrantProcedureCheck {
  const violations: string[] = [];
  for (const key of Object.keys(GRANT_BOUNDARIES) as GrantBoundaryKey[]) {
    if (p[key] !== GRANT_BOUNDARIES[key]) {
      violations.push(`boundary:${key}`);
    }
  }
  // 手順ステップは 3 工程をこの順で含むこと（別途識別 → annotated tag 作成 → tag push）。
  const completionIdx = p.steps.findIndex(
    (s) => s.includes("完成コミット識別") || s.includes("完成コミットを別途識別"),
  );
  const createIdx = p.steps.findIndex((s) => s.includes("annotated tag"));
  const pushIdx = p.steps.findIndex((s) => s.includes("tag push"));
  if (completionIdx < 0) violations.push("steps:completion-commit-identification");
  if (createIdx < 0) violations.push("steps:annotated-tag-create");
  if (pushIdx < 0) violations.push("steps:tag-push");
  if (
    completionIdx >= 0 && createIdx >= 0 && pushIdx >= 0 &&
    !(completionIdx < createIdx && createIdx < pushIdx)
  ) {
    violations.push("steps:order");
  }
  return { ok: violations.length === 0, violations };
}
