# case-open 完了報告テンプレート（templates/case-open/*.md）の実ファイル欠落

## 観測内容

case-open の終了処理参照（termination-and-cleanup.md）が `templates/case-open/standard.md`、`templates/case-open/epic.md`、`templates/case-open/multi-req-epic.md` の3ファイルを完了報告テンプレートとして参照しているが、agentdev-workflow-templates 配布物に `case-open/` ディレクトリは存在せず、参照のみが存在し実ファイルが存在しない（経路C review が実ファイル不存在を検証済み）。

## 影響

- case-open 完了報告時にテンプレートを読み込めず、報告の構造が実行時解釈に委ねられる
- 参照整合性の検出対象になる

## 課題

agentdev-workflow-templates 配布物に `templates/case-open/` 3テンプレートを新規作成するか、参照側（termination-and-cleanup.md）を実態に合わせて修正する。

## 既存要件・成果物との関連

- 対象: agentdev-workflow-templates 配布物、termination-and-cleanup.md（参照側）
- 検証: templates/case-open/ 不存在（2026-08-15 時点、経路C review 実測）

## 出典

- 発生日: 2026-08-14
- 取得元: case-open 実行過程の観測
- 元 item: intake-2026-08-14-case-open-completion-report-templates-missing.md
