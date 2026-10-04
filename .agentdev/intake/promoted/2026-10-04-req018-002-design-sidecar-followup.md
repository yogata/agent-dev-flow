# 採用済み成果物: REQ-018-002 missing-design 未帰着の対応候補（REQ-095-003 は帰着済み）

## 観測内容

traceability sidecar 宣言の未帰着として観測された 2点のうち、intake-promote 時点で残存するもの。

元観測は次の 2点だった:

1. **REQ-095-003 missing-implementation**: traceability sidecar 宣言が未登録（Definition PR #3428 の新行被覆に伴う sidecar 追随候補）
2. **REQ-018-002 missing-design**: design 対応が未登録（同上）

## 影響

traceability check の missing-design が fail 継続し、REQ-018-002（worktree 検証時の退避運用）の design 対応の見える化が不完全。

## 課題（残存範囲の縮小）

**REQ-018-002 の missing-design（design role 宣言の未登録）のみが残存**。REQ-018-002 の design 対応宣言を帰着させる対応候補。既存の `docs/designs/skills/agentdev-git-worktree.md`・`agentdev-git-worktree-test-fallback.md` の ADF-COVERS 宣言は implementation role であり、design role の対応宣言（sidecar または design 宣言）の追加が必要。検証は `bun src/check.ts --root <repo-root> --req REQ-018-002` で missing-design 0 件を確認する。

## 既存要件との関連

- REQ-018-002（worktree 検証時の退避運用）の design・implementation 対応
- REQ-095-003（issue 操作の安全性）の implementation 対応（帰着済み）
- traceability sidecar（traceability/agentdev-issue-management.yaml 等）

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-04-req095-003-req018-002-sidecar-followup.md`（分類採用により削除済み）
- 観測元: PR #3436（Case #3429・Epic #3425 Wave 1）本文 Findings / Capture候補 intake セクション
- case-close 再検証（2026-10-04・E4-3 棚卸し）: REQ-018 を implementation 宣言する Design 2件は status accepted 済みで冪等除外。draft Design 候補なし
- captured_at_commit: 71e3a3f7a91457c6be3012e31068f3cd0512d3c4
- 現行源検証（intake-promote・ad6e8341・読取のみ・実測）: traceability check を `--req REQ-018-002,REQ-095-003` で実行し、missing-design は REQ-018-002 のみ（REQ-095-003 は traceability/agentdev-issue-management.yaml への登録で解消）を確認
