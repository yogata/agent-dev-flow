---
title: inspect-docs Design
status: accepted
created: 2026-06-21
updated: 2026-08-21
---

<!-- ADF-COVERS(implementation): REQ-021-021 -->
<!-- ADF-COVERS(implementation): REQ-036-001, REQ-036-002, REQ-036-006, REQ-036-007, REQ-036-008, REQ-036-009, REQ-036-010, REQ-036-011, REQ-036-024 -->
<!-- ADF-COVERS(implementation): REQ-036-001, REQ-036-004, REQ-036-006, REQ-036-008, REQ-036-009, REQ-036-010 -->

# inspect-docs Design

## 目的

docs 全体（REQ/Decision/Design/guides）の意味整合性を診断し、検出事項を `.agentdev/inspect/inbox/` へ出力する。
検査対象を直接修正しない診断専用コマンド。
REQ structure review（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）に加えて Design、Decision、guides、README の意味診断を含む。

## 承認・HITL 境界

- 承認点を持たない（診断と検出事項出力のみ。採用、分類の判断は `/agentdev/inspect-promote` が担う）。

## 入力

- なし（コマンド実行時に全対象成果物を自動スキャン）

## 出力

- 診断結果（セッション内テキスト出力 + `.agentdev/inspect/inbox/inspect-docs-finding-{timestamp}.md`）
- 検出事項リスト（観点、対象、根拠、source-of-truth 判定、推奨 route）

## 副作用

- ファイル作成: `.agentdev/inspect/inbox/inspect-docs-finding-*.md` のみ（診断専用の例外許可）
- git commit/push: `.agentdev/inspect/` 配下のみ（commit message: `chore(agentdev): capture inspect-docs finding`）
- 実行前同期: `git pull --ff-only`
- 検査対象（docs/, .opencode/）のファイル変更: 禁止
- GitHub Issue/PR 作成、更新: 禁止
- worktree/ブランチ作成: 禁止
- intake/learning/RU 処理: 禁止

## 現在の動作

処理段階（外部から意味のある順序）。
各段階の詳細手順は Workflow Skill（`agentdev-workflow-inspect-docs`）が正規情報源である（read-only-diagnostic 型、REQ-027-003 により STEP model 対象外）。

- スキャン対象の収集（`docs/requirements/`, `docs/decisions/`, `docs/designs/`, `docs/guides/`, `README.md`, `.opencode/`）
- REQ 参照 ID 整合性確認（`agentdev-req-structure-diagnostics`）
- 第一参照導線確認（`agentdev-req-structure-diagnostics`）
- 現行/廃止/世代境界確認（`agentdev-req-structure-diagnostics`）
- Design 意味診断（Design が REQ/Decision/guides の代替、将来計画の混入、実行時依存先としての不適切扱いを確認）
- ADR 意味診断（承認済み Decision のみを現行判断の根拠として扱っているか確認）
- guides 意味診断（guides が navigation layer の範囲を超えていないか確認）。履歴混入検出時は route 追加（v2:REQ-0115-041）
- README 索引診断（README 索引が導線の範囲を超えていないか確認）。内容過多検出時は分割誘導
- REQ structure review（6観点）（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT（`agentdev-req-structure-diagnostics`））
- 文書分類一貫性検査（`docs/designs/foundations/document-model.md` の classification policy への適合確認）。REQ 要件行への Design 分離基準違反残留（schema field、enum 値一覧、判定表、file pattern、テンプレート種別、report format、内部アルゴリズム、作業履歴、実装パラメータ等）自動検出
- 配布物整合性検査。配布物（`src/opencode/commands/agentdev/`、`src/opencode/skills/agentdev-*/`）について、`docs/designs/integrity/docs-spec-rebuild-integrity.md` が定義する検査パターンに従い、構文健全性（frontmatter 重複、見出し重複、Markdown 構文破損）、文意保持（壊れた括号、壊れた参照表現、主語/目的語欠落文）、責務整合（command 本体と Design 間の責務説明照合、case-open/run/close/auto の責務境界一致）を診断する（`agentdev-req-structure-diagnostics` 参照）
- docs-check route 判定（意味的疑いのうち機械的検査に落とせるものを docs-check ルール／検査データ候補として提示）
- 未処理 artifact 確認（`agentdev-req-structure-diagnostics`）
- 検出事項出力（`.agentdev/inspect/inbox/inspect-docs-finding-{timestamp}.md`）。source-of-truth priority: 現行 REQ > 承認済み Decision > Design > guides
- 実行前同期（`git pull --ff-only`、失敗時は git-error-messages template で停止）
- `.agentdev/inspect/` 変更の commit と push（変更なし時は commit/push せず「変更なし」報告、変更あり時は `.agentdev/inspect/` のみ `git add`、commit、push、push 失敗時は停止）
- 完了報告

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 Design であり、command 定義（`src/opencode/commands/agentdev/inspect-docs.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（工程構成、各診断観点の実行手順、reference 構成）は Workflow Skill（`agentdev-workflow-inspect-docs`）が所有し、本 Design はこれらを複製しない。本 workflow は read-only-diagnostic 型であり、STEP model の対象外である（REQ-027-003）。resume point、export、import を持たず、工程一覧のラベルは順序ラベルである。中断時は先頭から再実行する。
- Workflow Skill の単独起動防止（soft guard）は、command 定義本文の soft guard 宣言節と Workflow Skill description の DO NOT USE FOR トリガーの二層により実効する。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 候補探索（独立探索手段）

inspect-docs の構造診断候補の探索は、README 索引、正規成果物の直接読取、`rg` 等の独立探索手段で行う（REQ-021-021）。
agentdev-traceability の coverage, impact, check を一般文書探索、構造診断、依存関係探索の用途に利用しない。

- 候補には未解決参照、superseded 成果物への現行参照、参照先が取得できない記述、正規所有者のいない成果物、構造的重複候補を含める
- 決定的検査（参照実在, 委譲先 skill 実在, YAML 構文, 必須 field）は docs-check, 整合性ルール群が所有する。inspect-docs は REQ-036-006〜011 が定める意味診断を担当し、探索で得た候補を未検証 evidence として意味診断の入力に利用する
- 構造診断と意味診断を区別し、SPLIT, MERGE, MOVE, DUPLICATE, RETIRE, DRIFT 等の意味判断を候補の構造情報だけから確定しない

## 参照する横断 Design

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（コマンド分類）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（検出事項プロトコル、inspect-promote 自動 promote 連携）

## 対象外

- ファイル変更、作成、削除（`.agentdev/inspect/inbox/inspect-docs-finding-*.md` 生成は例外）
- GitHub Issue/PR 作成、更新
- worktree/ブランチ作成
- intake/learning/RU 処理
- source-of-truth priority 違反（現行 REQ > 承認済み Decision > Design > guides）

## 検証観点

- source-of-trought priority 遵守
- 6観点診断の網羅性: SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT
- 文書分類一貫性: classification policy 適合確認
- 検出事項の source-of-truth 判定、推奨 route 明示

## エラー処理

| エラー | 対処 |
|--------|------|
| スキャン対象ディレクトリが存在しない | 該当カテゴリを空として扱い、警告を出力 |
| ファイル読込失敗 | 該当ファイルをスキップし、警告を出力 |

## 停止状態

- 実行前同期（`git pull --ff-only`）失敗時（エラーを報告して停止する）。
- `.agentdev/inspect/` 変更の push 失敗時（停止して報告する）。
- スキャン対象ディレクトリ不存在、ファイル読込失敗は停止条件としない（「エラー処理」のとおり空扱い、スキップ継続）。

## See Also

- [inspect-skills.md](inspect-skills.md)（Command/Skill 参照妥当性検出）
- [inspect-promote.md](inspect-promote.md)（検出事項分類、昇格）
- `agentdev-workflow-inspect-docs` skill（workflow 実装本体（工程構成、冪等性、終了条件））
- `agentdev-req-structure-diagnostics` skill（REQ 構造検査ロジック）
- REQ-036（inspect-docs / REQ 再構成運用）
- REQ-036（inspect-* 検出コマンド群）

