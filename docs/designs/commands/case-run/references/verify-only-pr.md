---
title: verification-only PR（実装差分なし、検証のみ）
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-run.md から参照される詳細仕様（遅延読み込み）。 -->

# verification-only PR（実装差分なし、検証のみ）

## verification-only PR（実装差分なし、検証のみ）

case-run は実行担当サブエージェント委譲の結果、実装差分0件・検証のみで完了する PR（**verification-only PR**）を生成する場合がある。
本節は verification-only PR の判定条件、PR 本文の根拠欄記入規則、GitHub の空 PR 取り扱い、case-close への引継ぎ注意事項を定める。
要件の SSoT は REQ-010-012（保存工程と完了工程での変更ファイル限定検査と工程停止）。

PR テンプレート（pr_desc.md）と Issue 本文構造は workflow-templates（[agentdev-workflow-templates.md](../skills/agentdev-workflow-templates.md)）の責務である。
pr_desc.md への verify-only 根拠欄追加は workflow-templates Design の変更として位置付ける。

### 定義

verification-only PR は以下を全て満たす PR とする（REQ-010-012）。

- PR の変更ファイル数が0件（pr_changed_files の変更ファイル一覧が空と確認される）
- Issue の受け入れ基準が検証のみで充足された（既存実装・既存文書が要件を満たしており、追加実装を要しなかった）
- 検証結果が PR 本文の verify-only 根拠欄に evidence として記録されている

実行担当サブエージェントは verification-only で完了した場合も `completed-pr` を返し、PR URL を委譲 result に含める（`blocked` / `failed` にはしない）。

### verify-only 根拠欄の記入規則

case-run は verify-only PR 作成時に pr_desc.md の verify-only 根拠欄へ、実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果を記入する。
根拠は姉妹実装PRだけでなく、実装PR、先行 commit、main 反映済み commit、既存成果物、検証のみで完結する理由を許容する。
「実装内容」欄は空欄にせず、「実装差分なし」と理由を記録する。

### GitHub の空 PR 許容

GitHub は空 PR（変更ファイル0件）の squash merge を許可し、空 commit を生成する（commit 2b34f8b0 で実証）。
case-run は空 PR の作成・マージを GitHub の挙動に依存して実行する。
squash merge で生成された空 commit は履歴に残り、pr_merge（squash merge）の通常フローに従う。

### case-close 引継ぎ注意事項

verification-only PR は case-close の targeted docs guard で files_checked が空になるため、次の注意事項を case-close へ引き継ぐ。

- PR 本文の verify-only 根拠欄に「実装差分を含まない理由」「根拠成果物または commit」「検証対象」「検証結果」が記録されていること（[case-close.md](case-close.md)「targeted docs guard」節の files_checked 空確認〔REQ-032-023 実装宣言〕参照）
- case-close は files_checked 空を検出した場合、REQ-010-012 に基づき verification-only 判定ステップを経て PASS 処理する（false-clean 3層防御との相互作用は case-close Design 参照）
- case-run 側は PR 作成までを責務とし、verification-only 判定自体は case-close が行う（単一書き手: case-close、REQ-011 完了条件チェックボックス専任責務）
