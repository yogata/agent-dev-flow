# intake: case-open #3236 Decision 採番時点の draft 表記と実行契約前例の不整合（明確化候補）

- 観測日: 2026-09-29
- 観測元: case-open（Case #3236、Definition PR #3237 実行中の実観測 deviation）
- 種別: 不整合（具体的修正対象あり → intake）

## 観測内容

- draft-data（req-draft-textlint-dependency-local-resolution.md）の ACT-DEC-001 が「採番は case-ready の保存時」と表記する一方、実行契約上は proposed Decision ファイルを Definition PR 内で採番・作成する構成が正となる状況がある
- 根拠（実行契約側）:
  - REQ-061-020: case-ready の受理評価は「Decision frontmatter の関連REQ宣言（related_reqs）に含まれ、かつ status が proposed の Decision を評価対象として特定」する。評価対象特定が canonical Definition（merge 済み docs/decisions/）の frontmatter を前提とするため、proposed Decision ファイルは Definition PR merge 時点で存在する必要がある
  - REQ-061-039 overlap 突合: draft の artifact_actions 宣言ファイル集合（new Decision を含む）と pr_changed_files 実報告の差分検査があり、Decision ファイルが PR に含まれないと宣言・実報告が乖離する
  - 直近前例: Case #3183 / Definition PR #3184（commit ee1e36f7）が Definition PR 内で DEC-046 を採番・作成（status: proposed、承認記録に「受理評価は case-ready が実行する」を明記）
  - decision-file-manager SKILL: 「req-define 側で番号推測を行わず、Definition 保存内部責務と本スキルの連携で確定」— 採番は決定的採番スクリプト（alloc-decision-number.ts）による確定であり、case-open 実行時のスクリプト呼出は「番号推測」に該当しない
- 本 Case での処理: 前例どおり Definition PR 内で採番（DEC-047）・作成し、受理評価（accepted 遷移）を case-ready へ残した。意味判断の新設はない

## 修正候補

- req-define 側の Decision 定義（artifact: decision, operation: create）の標準表記を、「採番は case-ready の保存時」から「採番は決定的採番スクリプトによる確定。proposed Decision ファイルは Definition PR で作成し、受理評価（accepted 遷移）は case-ready が実行する」へ明確化する
- 対象候補: req-define 関連 command/skill 定義、case-open/case-ready Design の Decision 構成節、REQ-061-020 との整合確認
