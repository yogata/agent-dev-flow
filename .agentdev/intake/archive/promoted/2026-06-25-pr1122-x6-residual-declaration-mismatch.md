# PR #1122 の X-6 = 0 件宣言に対し 5 件の残存を検出（宣言不一致）

## 発生源

- Issue: #1162
- PR: #1163 (merged, squash e3486488)
- 発生日: 2026-06-25

## 内容

PR #1122 は X-6（「において」）について「7 ディレクトリ完全対応、残存 0 件」と宣言してマージされたが、PR #1163 の inspect-docs 再実行カタログで 5 件の残存を検出した。

コミットログ照合の結果:

- 4 件（PR #1122 以前から存在、見逃し）:
  - `docs/requirements/REQ-0102.md` L83
  - `src/opencode/skills/agentdev-req-analysis/spec-save.md` SPEC L81（参照先 SPEC 内）
  - `docs/specs/commands/spec-save.md` L50
  - `src/opencode/commands/agentdev/spec-save.md` L169
- 1 件（PR #1122 merge 後に新規発生）:
  - `docs/specs/backticks-identifier-threshold.md` L12（spec-save commit 465d9047、2026-06-25）

PR #1122 の完了宣言は `mechanical-replacement-rules.md`「再現性の担保」節 Step 3-4（再 grep 0 件確認、REQ-0153 で必須化済み）を実行していなかった可能性が高い。

## 推奨対応先

AG-010（優先度順是正）での機械置換対応を推奨。作業候補:

- 上記 5 箇所の「において」を文脈に応じて「で」「では」「においては」（正当使用の場合）へ機械置換
- 置換後に再度 `mechanical-replacement-rules.md` Step 3-4 の再 grep 0 件確認を実施し、PR 本文 Findings に 0 件確認結果を記録する
- 既知 learning L-012（再 grep 0 件確認の重要性）および本 PR に紐付く learning L-1（宣言不一致の追加事例）を併せて参照

## 現在の追跡状態

- PR #1163 Findings セクション F-1 に記録済み
- 別 Issue 化: 未実施（本 intake が作業候補の起点。AG-010 で一括是正する想定）
