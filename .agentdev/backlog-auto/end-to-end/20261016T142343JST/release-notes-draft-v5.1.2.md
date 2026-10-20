# リリースノート草稿 — v5.1.2（準備物・公開は所定経路）

- リリース: v5.1.2（ターゲット fbfddce8、2026-10-16、backlog-auto 一気通貫 run 20261016T142343JST 由来）
- 基準: v5.1.1 からのパッチ増分（混入コミット検知 2 件〔前 Case #3725 由来の未リリース分 ffa59eac / 5c78cbf1〕は 2026-10-16 利用者承認で包含）

## 主な変更

### 前リリース残存（Case #3725 由来・v5.1.1 タグ後 merge）
- backlog-auto 一気通貫実行の接続手順（stage 4〜7 の req-define / case-auto 接続）と検証用模擬・e2e 契約テストを追加（#3725 / PR #3727）

### 追加（本 run・規律と手順の整備）
- 同一 worktree 複数委譲の中断→回収時に、PR 本文への両委譲記録併記と diff 空の機械確認前置を委譲契約 Design・case-run 手順へ条項化（#3760 / PR #3769）
- 既存 fail 前提子 Issue の着手時現行 main 再計測前置を委譲契約 Design へ追加し、learning-capture に採番時点 baseline 明記（commit hash・計測日時・計測範囲）を追加（#3763 / PR #3771）
- agentdev_gh 起動障害の 2 段分離試験（bash 直叩き gh → bun CliRunner）と判定基準を診断手順へ追記（#3766 / PR #3772・fix PR #3775）
- case-close GitHub 版 STEP-4 へ merge 後重複行実検査（STEP-4-6）を追加。CLEAN 判定単独受理を禁止（#3768 / PR #3774）
- cleanup-and-capture STEP-5-2 へ applySection 適用前のセクション後コンテンツ保全確認を明記（#3767 / PR #3773）

### 修正（本 run・実装と整合性）
- record-comments.ts applySection の末尾セクション境界を改善（文書末尾置換時に後続 HTML コメント群を消費しない）し回帰テスト 2 件を追加（#3767 / PR #3773）
- REQ-010-007 / REQ-010-008 / REQ-009-029 の design covers 宣言を追加し到達性を回復（#3761 / PR #3770）

### 文書（本 run・Definition PR #3759）
- REQ-114 全 15 行の implementation / verification 対応を解消し、backlog-auto Design に一気通貫実行の実行構造実体節を追加（DS17 / DS19 解消）（#3762）
- REQ-114-014 の括弧内要約を REQ-039-001 原文準拠へ是正（RQ17 解消）（#3762）
- DEC-059 の「case-close のリリース手順」文言を後続工程（backlog-auto stage 7 リリース）の総称として明確化（決定内容は不変・2026-10-16 HITL Q1=B 明示承認）（#3764）
- agentdev-issue-tracking Design の重複「16.」連番を解消（17. へ再採番）（#3765）

## 検証
- bun test 4318 pass / 0 fail（正規 3 分割）・check_integrity exit 0（NG 0）・traceability check pass 11 / fail 0（missing-design / implementation / verification すべて解消）・textlint exit 0（615 対象）・配布依存境界 failures 0
- 証跡: `.agentdev/backlog-auto/end-to-end/20261016T142343JST/evidence/`

## 環境情報
- テスト: bun（正規 3 分割）、Windows 環境
- 実行主体メモ: 本 run の case-auto は実行委譲サブエージェント起動 API 不在のためインライン自己適用（4 状態 result・3 点ゲート・worktree 隔離・PR 証跡は準用）。直列実行の事実は learning inbox へ Capture 済み

## 既知の未解決
- なし（前リリースの「REQ-114 全行対応」は本リリースで解消済み。Capture 由来の learning 2 件・intake 1 件は次回 backlog サイクルの処理対象）
