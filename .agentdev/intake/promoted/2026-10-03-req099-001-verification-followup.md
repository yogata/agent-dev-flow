# 採用済み成果物: REQ-099-001 verification 未帰着の対応候補（REQ-099-020 は帰着済み）

## 観測内容

traceability check（REQ-099-001〜020 スコープ）で baseline 既出として継続していた対応関係の欠落のうち、intake-promote 時点で残存するもの。

元観測は次の 2点だった:

1. **REQ-099-020 missing-implementation**: installer・archive 生成系（package-release-archive、consumer archive install、同梱 README、archive レイアウト規定、trusted-distribution-gate）の implementation 対応未帰着。OU-004（#3334）の RA-004 担当範囲。
2. **REQ-099-001・020 missing-verification**: REQ 行変更を伴わない Case では対応せず baseline 継続。

## 影響

REQ-099（配布・インストーラ系）のトレーサビリティ完全性検査で missing-verification が fail 継続し、検証差分の判読性を下げる。

## 課題（残存範囲の縮小）

**REQ-099-001 の missing-verification のみが残存**。REQ-099-001 の verification 対応宣言を帰着させる対応候補（REQ 行変更を伴う Case での帰着、または verification 宣言の追加）。検証は `bun src/check.ts --root <repo-root> --req REQ-099-001,...,REQ-099-020`（agentdev-traceability scripts）で missing-verification 0 件を確認する。

## 既存要件との関連

- REQ-099-001（マルチホスト正本構造）・REQ-099-020（installer・archive 系）の traceability 対応宣言
- traceability/policy.yaml の検証スコープ

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-03-req099-implementation-verification-traceability-followup.md`（分類採用により削除済み）
- 観測元: PR #3386（Case #3364・OU-003）本文 Findings / Capture候補 セクション
- case-close 再実測（2026-10-03・PR HEAD worktree 3684f85e・bun check.ts）: pass 7 / fail 2 で同一 fail を再現
- captured_at_commit: 511dadd161b8ffeeba5eb17c16a6fdc2de52704f
- 現行源検証（intake-promote・ad6e8341・読取のみ・実測）: traceability check を `--req REQ-099-001〜020` で実行し pass 7 / fail 2、missing-verification は REQ-099-001 のみ（REQ-099-020 の implementation・verification は traceability/agentdev-textlint-guard.yaml・traceability/installer-host-projection.yaml の宣言で帰着済み）を確認
