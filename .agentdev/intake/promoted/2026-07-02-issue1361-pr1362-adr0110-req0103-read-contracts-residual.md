# ADR-0110 と REQ-0103-162 に旧 `.agentdev/read-contracts/**` 表記が残存（doc-inputs 移行漏れ）

## 観測内容

case-close Issue #1361 / PR #1362 (Project Doc Inputs Migration, REQ-0157 / ADR-0133) の Step 3 docs 検証中に観察。PR #1362 は read-contracts から doc-inputs への全面移行を実施したが、REQ/ADR ファイルの編集は req-save の責務であるため本 PR の対象外とした。移行後も以下の2箇所に旧 `.agentdev/read-contracts/**` 表記が残存する。

- `docs/adr/ADR-0110.md` line 68: 「コマンド・スキル別の実行時参照契約は .agentdev/read-contracts/** に置く。」
- `docs/requirements/REQ-0103.md` line 104 (REQ-0103-162): 「実行時 docs 参照はプロジェクト別の .agentdev/read-contracts/** 経由で解決すること（REQ-0157, ADR-0133 参照）」

両者とも ADR-0133 および REQ-0157 を参照しているが、これらは既に doc-inputs 命名へ移行済みである。参照先が更新され、参照元のみ旧表記が残った状態。

## 影響

- 実動作への影響なし（doc-inputs 機構は移行済みで稼働中）。ドキュメント整合性の問題。
- ADR-0110 と REQ-0103-162 が ADR-0133（現行）と用語不整合を起こす
- read-contracts という旧命名への誘導が残り、読者が新旧どちらの命名が正しいか判断しづらい

## 課題

- ADR-0110 line 68 の `.agentdev/read-contracts/**` を `.agentdev/doc-inputs/**` に更新
- REQ-0103-162 の `.agentdev/read-contracts/**` を `.agentdev/doc-inputs/**` に更新
- 両者の「read contract」表記も「doc-input」に読み替える必要があるか文脈確認（ADR-0110 line 70 にも「read contract 機構（ADR-0133）」とある）

## 既存要件との関連

- ADR-0110: line 68 に旧表記が残存
- REQ-0103-162: 旧表記が残存
- ADR-0133（Doc Inputs Architecture）: 既に doc-inputs 命名へ移行済み。参照先として言及されているが、参照元が旧表記
- REQ-0157: Project Doc Inputs Migration。参照先として言及されているが、参照元が旧表記

## 観測元

- PR #1362 (Issue #1361 / REQ-0157 Project Doc Inputs Migration)
- case-close Step 10 capture 回収
