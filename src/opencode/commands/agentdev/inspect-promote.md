---
description: inspect finding を分類・採用し、promoted artifact として .agentdev/inspect/promoted/ へ出力する
agent: sisyphus
---

# inspect-promote

`.agentdev/inspect/inbox/` の inspect finding を分類（promote / defer / reject）し、採用した finding を `.agentdev/inspect/promoted/` へ、却下した finding を `.agentdev/inspect/archive/rejected/` へ移動する。

## Input

- `.agentdev/inspect/inbox/*.md`（inspect finding files）

## Output

- `.agentdev/inspect/promoted/*.md`（採用済み・RU 化対象）
- `.agentdev/inspect/archive/rejected/*.md`（却下済み）
- セッション内完了報告

## Steps

1. **実行前同期（git pull --ff-only）**:
    - `git pull --ff-only` を実行
    - **失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の該当形式で表示して停止する（自動解消しない）
2. **inbox スキャン**: `.agentdev/inspect/inbox/*.md` を読み込む。空の場合は「対象なし」と報告して終了
3. **finding 分類**: 各 finding について以下を評価し、promote / defer / reject を判定する:
   - 明確な不整合 → promote（RU 化対象）
   - 不整合かどうか・採否・範囲・優先度・正とする情報源が未確定 → defer（intake 送付候補）
   - 誤検知・対応不要 → reject
   - 具体的修正対象を持たない再発防止知見 → defer（learning 送付候補）
4. **HITL 確定**: ユーザーの明示的な承認なしに promoted artifact を生成しない。分類結果を提示し、承認を得る
5. **promote 処理**: 承認された promote finding を `.agentdev/inspect/promoted/` へ保存。元の inbox file は削除
6. **reject 処理**: 承認された reject finding を `.agentdev/inspect/archive/rejected/` へ移動
7. **defer 処理**: defer finding は `.agentdev/inspect/inbox/` に残置。intake / learning 送付の推奨を報告
8. **完了報告**: promote / defer / reject の判定結果と後続 route を提示
9. **.agentdev/inspect/ 変更の commit と push**:
    - `git diff --name-only` で `.agentdev/inspect/` 配下の変更を確認（promoted/rejected への移動・inbox からの削除を含む）
    - **変更なし時**: commit/push せず「変更なし」と報告
    - **変更あり時**:
       1. `git add` は `.agentdev/inspect/` のみ対象
       2. commit message: `chore(agentdev): promote inspect findings`
       3. `git push` 実行
       4. **push 失敗時**: 共通 template (`.opencode/commands/agentdev/templates/common/git-error-messages.md`) の該当形式で表示して停止する（完了扱いにしない）

## Guardrails

- G01: ユーザーの明示的な承認なしに promoted artifact を生成しない
- G02: promote された finding のみを `.agentdev/inspect/promoted/` へ保存する
- G03: reject された finding は `.agentdev/inspect/archive/rejected/` へ移動する
- G04: defer された finding は `.agentdev/inspect/inbox/` に残す
- G05: docs-check rule / fixture 追加候補は独立 route とせず、promoted artifact の要件化方向または受け入れ条件に含める

## Error Handling

| エラー | 対処 |
|--------|------|
| inbox が空 | 「対象なし」と報告して終了 |
| finding file 読込失敗 | 該当 file をスキップし、警告を出力 |
| ユーザーが全件 defer | inbox に全件残置し、報告 |
