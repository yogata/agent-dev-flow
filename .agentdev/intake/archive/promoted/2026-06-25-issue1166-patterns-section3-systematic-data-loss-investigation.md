# llm-expression-patterns.md 第3節の体系的データ欠損の原因調査候補

## 発生源

- Issue: #1166
- PR: #1168 (merged, squash 7f3bc191)
- 発生日: 2026-06-25

## 内容

`src/opencode/skills/agentdev-doc-writing/references/llm-expression-patterns.md` 第3節「空虚な形容・副詞」テーブル（lines 52-67 周辺）で、検出パターン列の backtick 内 head word と解説列の「」括弧内引用語が lines 54-60 に限定して同時に欠損していた。第1/2/4節は無傷。

PR #1168 は欠損セルの補充または N/A 明示までを完了したが、根本原因（regex/script 事故による部分削除が疑われる）は未調査。同様の体系的欠損が他の skill reference ドキュメントで発生していないか、また本ファイル内で他の節に潜在していないかの調査は未実施。

## 推奨対応先

別 Issue として切り出すことを推奨。作業候補:

- 当該ファイルの git blame で lines 54-60 周辺の削除経緯を特定（commit log、PR 履歴）
- 同ディレクトリ他 reference ファイル（`mechanical-replacement-rules.md`、`backticks-identifier-threshold.md` 等）で同種の体系的欠損がないか検査
- 調査結果に基づき、検出辞書ドキュメントの完全性確認プロセスを `agentdev-doc-writing` skill に明文化するか検討

## 現在の追跡状態

- PR #1168 `## Findings / Capture候補` No.1 に記録済み
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
