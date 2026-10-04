# intake: textlint-guard ADR 本体設定テスト 2 件の既知欠陥

## 内容

integrity suite 分割①の agentdev-textlint-guard ADR 本体設定テスト 2 件が baseline（a544dae0）で失敗する（plugin 設定 loader の対象解決と実在列挙）。本 Case（#3420）対象外の既知欠陥として分離記録済み。

1. 「Plugin の実際の設定 loader で ADR 本体設定が解釈され、追加対象は正規5 glob のみ」: 設定の additionalTargets に `src/opencode-local/**/*.md` が含まれる（期待から 1 件多い）
2. 「追加対象の実在ファイルが対象解決で列挙される（同一 Plugin が扱う）」: `src/opencode-local/README.md` の実在列挙が期待に含まれるが実環境では解決されない

textlint-guard plugin 設定（追加対象 glob）と検査期待値の整合是正候補。plugin 設定側の `src/opencode-local` 参照が正規配置（src/common/tools/agentdev-gh/local/）へ追随できていない可能性は issue_tracking_list.test.ts 参照パス更新候補（同日 intake）と同根。

## 根拠

- 観測元: PR #3422（Case #3420・DEL-3420-1）本文 Findings / Capture候補 セクション
- 元テキスト: 「textlint-guard ADR 本体設定テスト 2 件が baseline で失敗（plugin 設定 loader の対象解決と実在列挙）。本 Case 対象外の既知欠陥として分離記録。」
- case-close 追加観測（2026-10-04・マージ後 main root a15f55df）: 分割① で同一 2 fail を再現（fail 明細の期待値差分は baseline 再現と同一内容）
- captured_at_commit: a15f55df
