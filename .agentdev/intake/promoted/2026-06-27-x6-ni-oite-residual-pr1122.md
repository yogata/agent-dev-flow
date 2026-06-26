# PR #1122 X-6「において」残存5件（宣言不一致、AG-010 機械置換対象）

## 発生源

- Issue: #1162
- PR: #1163 (merged, squash e3486488)
- 発生日: 2026-06-25

## 観測内容

PR #1122 は X-6（「において」）について「7 ディレクトリ完全対応、残存 0 件」と宣言してマージされたが、PR #1163 の inspect-docs 再実行カタログで 5 件の残存を検出した。

コミットログ照合の結果:
- 4 件（PR #1122 以前から存在、見逃し）: `docs/requirements/REQ-0102.md` L83、`src/opencode/skills/agentdev-req-analysis/spec-save.md` SPEC L81、`docs/specs/commands/spec-save.md` L50、`src/opencode/commands/agentdev/spec-save.md` L169
- 1 件（PR #1122 merge 後に新規発生）: `docs/specs/backticks-identifier-threshold.md` L12（commit 465d9047）

PR #1122 の完了宣言は再 grep 0 件確認（mechanical-replacement-rules.md Step 3-4、REQ-0153 で必須化）を実行していなかった可能性が高い。

## 影響

- X-6「において」が 5 箇所に残存し、宣言と実態が不一致
- 再 grep 0 件確認の運用漏れが示唆される

## 課題

- 上記 5 箇所の「において」を文脈に応じて「で」「では」「においては」（正当使用の場合）へ機械置換する
- 置換後に再度再 grep 0 件確認を実施し、PR 本文 Findings に 0 件確認結果を記録する

## 既存要件との関連

- `mechanical-replacement-rules.md`「再現性の担保」節 Step 3-4（再 grep 0 件確認、REQ-0153 で必須化）
- learning L-012（再 grep 0 件確認の重要性）、learning L-1（宣言不一致の追加事例）
- 関連: docs/specs 配下 X-6 残存2件（メタ記述判定）の別 intake あり

## 対応方針候補

- AG-010（優先度順是正）で機械置換により 5 箇所を是正し、再 grep 0 件確認を実施する
