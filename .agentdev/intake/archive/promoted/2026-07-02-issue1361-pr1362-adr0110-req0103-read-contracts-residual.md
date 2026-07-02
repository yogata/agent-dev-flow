# ADR-0110 と REQ-0103-162 に旧 `.agentdev/read-contracts/**` 表記が残存（doc-inputs 移行漏れ）

## 観察

case-close Issue #1361 / PR #1362 (Project Doc Inputs Migration, REQ-0157 / ADR-0133) の Step 3 docs 検証中に観察。PR #1362 は read-contracts から doc-inputs への全面移行を実施したが、REQ/ADR ファイルの編集は req-save の責務であるため本 PR の対象外とした。移行後も以下の2箇所に旧 `.agentdev/read-contracts/**` 表記が残存する。

対象ファイルと行:
- `docs/adr/ADR-0110.md` line 68: 「コマンド・スキル別の実行時参照契約は .agentdev/read-contracts/** に置く。」
- `docs/requirements/REQ-0103.md` line 104 (REQ-0103-162): 「実行時 docs 参照はプロジェクト別の .agentdev/read-contracts/** 経由で解決すること（REQ-0157, ADR-0133 参照）」

両者とも ADR-0133（Doc Inputs Architecture）および REQ-0157 を参照しているが、これらは既に doc-inputs 命名へ移行済みである。参照先が更新され、参照元（ADR-0110, REQ-0103）のみ旧表記が残った状態。

## 影響

- ADR-0110 と REQ-0103-162 が ADR-0133（現行）と用語不整合を起こす
- read-contracts という旧命名への誘導が残り、読者が新旧どちらの命名が正しいか判断しづらい
- 実動作への影響はない（doc-inputs 機構は移行済みで稼働中）。ドキュメント整合性の問題

## 修正されなかった理由

PR #1362 の完了条件は配布コード本文（`src/opencode/**`）と `.agentdev/doc-inputs/**` の移行。REQ/ADR ファイル（`docs/requirements/**`, `docs/adr/**`）の編集は req-save の責務境界（REQ-0103）に属するため本 PR では対象外。case-run が finding-001 として PR 本文に記録し、case-close が capture 回収した。

## 課題

- ADR-0110 line 68 の `.agentdev/read-contracts/**` を `.agentdev/doc-inputs/**` に更新
- REQ-0103-162 の `.agentdev/read-contracts/**` を `.agentdev/doc-inputs/**` に更新
- 両者の「read contract」表記も「doc-input」に読み替える必要があるか文脈確認（ADR-0110 line 70 にも「read contract 機構（ADR-0133）」とある）

## 想定対応 Issue

- 保守系（maintenance）— ドキュメント語彙の更新。優先度は高くない（実動作への影響なし）
- req-save または次回 ADR-0110/REQ-0103 改訂時に doc-inputs 表記へ更新することを推奨

## 根拠

PR #1362 本文「## Findings / Capture候補 > finding-001 (intake)」より:

> `docs/adr/ADR-0110.md` line 68 と `docs/requirements/REQ-0103.md` REQ-0103-162 が旧 `.agentdev/read-contracts/**` 表記のまま残存。REQ/ADR の編集は req-save の責務のため本 PR では対象外。req-save または次回 ADR-0110/REQ-0103 改訂時に doc-inputs 表記へ更新することを推奨。

## 観測元

- PR #1362 (Issue #1361 / REQ-0157 Project Doc Inputs Migration)
- case-close Step 10 capture 回収
- 観測日時: 2026-07-02 (case-close 実行中)
