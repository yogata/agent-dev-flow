# status: proposed の DEC-023 への引用 2 箇所（accepted-adr-only-citation）

## 観測内容

2026-09-03 の docs-check（check_integrity）で、status: proposed の Decision DEC-023 が次の 2 文書から引用されていることが accepted-adr-only-citation [WARNING] として検出された:

- docs/requirements/REQ-057.md
- docs/designs/local/runtime-package-boundary.md

原因分類: 引用の実在は確認済（checker 出力 + ファイル実在確認）/ DEC-023 が proposed のまま滞留している経緯は不明（昇格予定 Case の有無までは追跡していない）。

2026-09-03 現行確認: DEC-023.md の status は proposed のまま（frontmatter 確認済み）で観測は現行 main で再現する。

## 影響

accepted でない Decision を正規参照として引用している状態が続き、REQ/Design の根拠参照の健全性規範（accepted-adr-only）と不整合が残る。

## 課題（レビューで決めること）

- DEC-023 を accepted へ昇格する（対応 Case の実施）か、引用側を accepted 済みの別 Decision へ付け替えるかの判断
- 昇格する場合の対応 Case（req-define 起点または promote 経路）の指定

## 既存要件・契約との関連

- DEC-023（third-party Skill の分離管理と取得機構の導入、proposed）、accepted-adr-only-citation 検査（check_integrity）、third-party Skill 管理 Design（docs/designs/local/third-party-skill-management.md）が DEC-023 を参照する構造。

## 根拠

- check_integrity レポート `.agentdev/integrity/reports/2026-09-03-integrity-report.md`（WARNING accepted-adr-only-citation ×2）
- docs/decisions/DEC-023.md（status: proposed、2026-09-03 再確認済み）
