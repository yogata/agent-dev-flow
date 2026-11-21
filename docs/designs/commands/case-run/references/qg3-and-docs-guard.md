---
title: QG-3 前置 staleness check と targeted docs guard
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-run.md から参照される詳細仕様（遅延読み込み）。 -->

# QG-3 前置 staleness check と targeted docs guard

## QG-3 前置 staleness check 手順

case-run は実装作業開始前に QG-3 本体とは独立した前置検査として staleness check を実行する（REQ-031-009〜034）。
本検査は QG-3 deviation 分類（spec-bug 等）運用を変更せず、deviation 発生前の予防層として位置づける。

### 検証項目

- **ファイルパス現行存在確認**: Issue 本文が参照するファイルパス（command 定義、Design、template 等）が現行リポジトリに存在するか確認する。Issue 作成時点から移動、改名、削除されたパスを検出対象とする
- **検査結果件数再計測**: Issue 本文の事前状態セクションが列挙する検査結果件数（NG 件数、IR 違反件数等）を再計測し、Issue 本文記載値と比較する。件数は変動しやすい実測値スナップショットであるため、差異の有無のみを判定材料とする

### 差異検出時のアクション

差異を検出した場合、case-run は以下を実施する:

1. PR 本文の `## Findings / Capture候補` セクションに `### stale-reference` 小見出しで差異内容（対象パス、Issue 本文記載値、現行値）を記録する
2. blocked として報告し、Root Case 指定による正規再開経路に従う（REQ-031-010）。Issue 本文の参照パス・件数の更新が必要な場合は case-ready / case-revise 経由で実施する
3. case-run 単独では Issue 本文を書き換えない（Issue 本文更新は case-ready / case-revise の責務）

### QG-3 本体との関係

staleness check は QG-3 本体（PR 作成直前の実装充足・乖離ゲート）とは独立した前置検査である。
QG-3 が実装結果に対するゲートであるのに対し、staleness check は実装開始前の入力妥当性検査である。
両者は順序依存を持たず、staleness check で差異を検出しても QG-3 本体の実施要否には影響しない。

## docs/** 変更時の targeted docs guard（REQ-031-011）

case-run は PR 対象ファイルに docs/** 変更を含む場合、実行担当サブエージェント起動の委譲前に targeted docs guard を実行する（REQ-031-011）。
本検査は QG-3 本体・QG-3 前置 staleness check とは独立した前置 docs 整合性検査であり、3つの検査は順序依存を持たず、それぞれの実施要否に影響しない（REQ-031-012 準拠）。

changed-path routing と配布依存境界の検出経路は共有境界 adapter へ接続する（DEC-014）。
最終 gate 基底は REQ-010-012 を再利用し、検査エラー（検査対象欠落、読込不能、未分類エントリ、adapter 起動失敗）は gate-not-passed として扱い、clean として通過させない（DEC-014 決定5、`integrity/distribution-boundary.md`「検査エラーの意味」）。

### 実行条件

- PR 対象ファイルに docs/** 変更を含む場合に実行する。docs/** 変更を含まない PR（コードのみ、SCRIPT のみ等）ではスキップする（REQ-031-005 の QG-3 限定原則を維持、docs全体grep ではなく変更ファイル限定の targeted 検査）

### 実行コマンド

```
bun run .opencode/skills/repo-agentdev-integrity/scripts/cli.ts \
  --workflow case-run --base-ref origin/main --json
```

変更ファイルは worktree 内の git diff から取得する（`--base-ref origin/main` または `--files <changed-paths>`）。
targeted docs guard は検証エンジン cli.ts の `--workflow` モード（明示対象指定）であり、`files_checked`・`unchecked_reasons`（not-found / out-of-profile）・更新要否フラグを報告する。files_checked と検査対象変更ファイルの一致確認を workflow 側で行い、engine の終了コード単独で受入を判定しない。
case-run プロファイル固有の追加ルールとして full_docs_check_recommended 判定は持たない（case-close の責務）。

### 検出結果の記録と連携

- 検出結果（failures の strict severity）は PR 本文の `## Findings / Capture候補` セクションに `### docs-integrity` 小見出しで記録する
- blocked として報告し、Root Case 指定による正規再開経路に従う（case-run 単独では Issue 本文を書き換えない、REQ-031-010 準拠）
