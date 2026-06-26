---
title: inspect-docs SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# inspect-docs SPEC

## 目的

docs 全体（REQ/ADR/SPEC/guides/DOC-MAP）の意味整合性を診断し、検出事項を `.agentdev/inspect/inbox/` へ出力する。
検査対象を直接修正しない診断専用コマンド。
REQ structure review（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）に加えて SPEC、ADR、guides、DOC-MAP の意味診断を含む。

## 入力

- なし（コマンド実行時に全対象成果物を自動スキャン）

## 出力

- 診断結果（セッション内テキスト出力 + `.agentdev/inspect/inbox/inspect-docs-finding-{timestamp}.md`）
- 検出事項リスト（観点、対象、根拠、source-of-truth 判定、推奨 route）

## 副作用

- ファイル作成: `.agentdev/inspect/inbox/inspect-docs-finding-*.md` のみ（G01 例外）
- git commit/push: `.agentdev/inspect/` 配下のみ（commit message: `chore(agentdev): capture inspect-docs finding`）
- 実行前同期: `git pull --ff-only`
- 検査対象（docs/, .opencode/）のファイル変更: 禁止（G01）
- GitHub Issue/PR 作成、更新: 禁止（G02）
- worktree/ブランチ作成: 禁止（G03）
- intake/learning/RU 処理: 禁止（G04）

## 現在の動作

- Step 1: スキャン対象の収集（`docs/requirements/`, `docs/adr/`, `docs/specs/`, `docs/guides/`, `docs/DOC-MAP.md`, `README.md`, `.opencode/`）
- Step 2: REQ 参照 ID 整合性確認（`agentdev-req-structure-diagnostics`）
- Step 3: 第一参照導線確認（`agentdev-req-structure-diagnostics`）
- Step 4: 現行/廃止/世代境界確認（`agentdev-req-structure-diagnostics`）
- Step 5: SPEC 意味診断（SPEC が REQ/ADR/guides の代替、将来計画の混入、実行時依存先としての不適切扱いを確認）
- Step 6: ADR 意味診断（承認済み ADR のみを現行判断の根拠として扱っているか確認）
- Step 7: guides 意味診断（guides が navigation layer の範囲を超えていないか確認）。履歴混入検出時は route 追加（REQ-0115-041）
- Step 8: DOC-MAP 意味診断（DOC-MAP が索引の範囲を超えていないか確認）。内容過多検出時は分割誘導（REQ-0115-042）
- Step 9: REQ structure review（6観点）（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT（`agentdev-req-structure-diagnostics`））
- Step 10: 文書分類一貫性検査（`docs/specs/foundations/document-model.md` の classification policy への適合確認）。REQ 要件行への SPEC 分離基準違反残留（schema field、enum 値一覧、判定表、file pattern、テンプレート種別、report format、内部アルゴリズム、作業履歴、実装パラメータ等）自動検出
- Step 11: docs-check route 判定（意味的疑いのうち機械的検査に落とせるものを docs-check ルール／検査データ候補として提示）
- Step 12: 未処理 artifact 確認（`agentdev-req-structure-diagnostics`）
- Step 13: 検出事項出力（`.agentdev/inspect/inbox/inspect-docs-finding-{timestamp}.md`）。source-of-truth priority: 現行 REQ > 承認済み ADR > SPEC > DOC-MAP/guides
- Step 14: 実行前同期（`git pull --ff-only`、失敗時は git-error-messages template で停止）
- Step 15: `.agentdev/inspect/` 変更の commit と push（変更なし時は commit/push せず「変更なし」報告、変更あり時は `.agentdev/inspect/` のみ `git add`、commit、push、push 失敗時は停止）
- Step 16: 完了報告

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（コマンド分類）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（検出事項プロトコル、inspect-promote 自動 promote 連携）

## 対象外

- ファイル変更、作成、削除（G01、`.agentdev/inspect/inbox/inspect-docs-finding-*.md` 生成は例外）
- GitHub Issue/PR 作成、更新（G02）
- worktree/ブランチ作成（G03）
- intake/learning/RU 処理（G04）
- source-of-truth priority 違反（G05、現行 REQ > 承認済み ADR > SPEC > DOC-MAP/guides）

## 検証観点

- source-of-trought priority 遵守（G05）
- 6観点診断の網羅性: SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT
- 文書分類一貫性: classification policy 適合確認
- 検出事項の source-of-truth 判定、推奨 route 明示

## エラー処理

| エラー | 対処 |
|--------|------|
| スキャン対象ディレクトリが存在しない | 該当カテゴリを空として扱い、警告を出力 |
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |
| DOC-MAP が存在しない | 該当 step をスキップし、警告を出力 |

## See Also

- [inspect-skills.md](inspect-skills.md)（Command/Skill 参照妥当性検出）
- [inspect-promote.md](inspect-promote.md)（検出事項分類、昇格）
- `agentdev-req-structure-diagnostics` skill（REQ 構造検査ロジック）
- REQ-0109（inspect-docs / REQ 再構成運用）
- REQ-0124（inspect-* 検出コマンド群）
