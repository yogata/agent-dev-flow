# intake: case-open 完了報告テンプレート（templates/case-open/*.md）が配布物に存在せず参照のみ残存

## 発生日

2026-08-14

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: case-open 実行（Stage 1、draft req-draft-command-workflow-capability-remediation の Issue 化）における実観測

## 問題事象

`src/opencode/skills/agentdev-workflow-case-open/references/termination-and-cleanup.md` Step 15（完了報告）が `templates/case-open/standard.md`、`templates/case-open/epic.md`、`templates/case-open/multi-req-epic.md` の3ファイルを完了報告テンプレートとして参照しているが、`agentdev-workflow-templates` 配布物（`src/opencode/skills/agentdev-workflow-templates/templates/`）に `case-open/` ディレクトリは存在しない（ templates 直下は pr_desc / issue_desc_* / issue_comment_* の11ファイルのみ）。参照のみが存在し実ファイルが存在しない状態。Epic #2060 由来の false-positive completion と同種の「定義と配布の不整合」パターン。

## 影響

- case-open Step 15 でテンプレートを読み込めず、完了報告の構造が実行時解釈に委ねられる（今回の実行は case-auto stage1_result 出力契約が代替したため実害なし）
- Workflow Skill reference から配布テンプレートへの参照整合性検査（inspect-skills / check_templates 系）の検出対象になりうる

## 発生局面

運用（case-open 実行時の terminal STEP）

## 検知方法

`src/opencode/skills/agentdev-workflow-templates/templates/` の glob 一覧（11ファイル）と `termination-and-cleanup.md` Step 15 の参照パス突合。

## 想定される対応方向

- (a) `agentdev-workflow-templates` に `templates/case-open/{standard,epic,multi-req-epic}.md` を新規作成する
- (b) 参照側（termination-and-cleanup.md）を実態（テンプレート不存在、完了報告は command 出力契約で規定）へ合わせて修正する
- (a)/(b) の選定は backlog-review で判断する。本 remediation Epic #2099（OU-002 の case-open Workflow Skill 完全化、OU-005 の SPEC 同期）の実装時に重複しないよう依存関係に注意する

## 関連

- Epic: #2099
- 参照元: `src/opencode/skills/agentdev-workflow-case-open/references/termination-and-cleanup.md` Step 15
- 配布物: `src/opencode/skills/agentdev-workflow-templates/templates/`（case-open/ ディレクトリ不存在）
- 類似パターン: 閉鎖済み Epic #2060 の false-positive completion（本 remediation の対象）

## 出典引用

termination-and-cleanup.md Step 15 より:

> テンプレート種別:
> - Standard → `templates/case-open/standard.md`
> - 単一REQ Epic → `templates/case-open/epic.md`
> - マルチREQ Epic → `templates/case-open/multi-req-epic.md`

## タグ

#intake #missing-template #workflow-case-open #workflow-templates #false-positive-completion #epic-2099
