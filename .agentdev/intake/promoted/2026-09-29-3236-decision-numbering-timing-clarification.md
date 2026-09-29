# Decision 採番時点の draft 表記と実行契約前例の不整合明確化（proposed Decision の Definition PR 内採番）

- 元 item: .agentdev/intake/inbox/2026-09-29-3236-decision-numbering-timing-wording.md
- 観測元: case-open（Case #3236、Definition PR #3237 実行中の実観測 deviation）
- 種別: 不整合（具体的修正対象あり）

## 課題

draft-data（req-draft-textlint-dependency-local-resolution.md）の ACT-DEC-001 は「採番は case-ready の保存時」と表記する一方、実行契約上は proposed Decision ファイルを Definition PR 内で採番・作成する構成が正となる。根拠（実測照合済み）:

- REQ-061-020（docs/requirements/REQ-061.md:39）: case-ready の受理評価は「Decision frontmatter の関連REQ宣言（related_reqs）に含まれ、かつ status が proposed の Decision」を評価対象として特定する。評価対象特定が canonical Definition（merge 済み docs/decisions/）の frontmatter を前提とするため、proposed Decision ファイルは Definition PR merge 時点で存在する必要がある
- REQ-061-039（docs/requirements/REQ-061.md:58）: draft の artifact_actions 宣言ファイル集合（new Decision を含む）と pr_changed_files 実報告の差分検査（overlap 突合）があり、Decision ファイルが PR に含まれないと宣言・実報告が乖離する
- 直近前例 2例: Case #3183 / Definition PR #3184（commit ee1e36f7 実在確認済み）が DEC-046 を、Case #3236 が DEC-047 を、いずれも Definition PR 内で採番・作成（status: proposed、受理評価は case-ready へ明記）
- decision-file-manager（docs/designs/skills/agentdev-decision-file-manager.md・numbering-policy.md）: 採番は決定的採番スクリプト（alloc-decision-number.ts）による確定であり、case-open 実行時のスクリプト呼出は「番号推測」に該当しない

## 修正候補

- req-define 側の Decision 定義（artifact: decision, operation: create）の標準表記を「採番は case-ready の保存時」から「採番は決定的採番スクリプトによる確定。proposed Decision ファイルは Definition PR で作成し、受理評価（accepted 遷移）は case-ready が実行する」へ明確化する
- 対象候補: req-define 関連 command/skill 定義、case-open/case-ready Design の Decision 構成節、REQ-061-020 との整合確認

## 制約（review A-2）

- draft 表記「採番は case-ready の保存時」の由来（意図された契約変更の有無・旧体制名残）を req-define 側で確認してから表記確定すること

## route 提示（backlog-review 判断用）

- req-define 変更影響分析による表記明確化（draft 生成側の標準表記更新 + Design の Decision 構成節整合）。REQ-061 側の行追加・修正の要否は req-define で確定
