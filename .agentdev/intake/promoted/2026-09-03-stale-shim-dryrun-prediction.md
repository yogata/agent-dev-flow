# install-script-usability Design「dry-run/check/apply の技術的差」節への stale shim の dry-run 予測表示の明文化

## 観測内容

両入口（install.ps1、self-sync.ps1）の dry-run は従来 stale plugin loader shim の削除予測を表示していなかったが、TS-003 が「dry-run が予測表示」を要求するため、実装（PR #2541）で stale shim に対する `WOULD REMOVE` 予測表示を追加した。この予測対象範囲（stale junction に加えて stale shim を含む）は install-script-usability Design「dry-run/check/apply の技術的差」節には明文化されていない。

本 Case（Issue #2540）は実装 Case であり、Design 本文への追記は設計確定作業として別途行うべきとされた。

## 影響

dry-run の予測対象が Design 上 stale junction のみと読める場合、shim 予測の有無を実装差異と誤認するリスク。TS-003 相当の将来検証で予測対象の期待値を取り違えるリスク。

## 課題（レビューで決めること）

- install-script-usability Design「dry-run/check/apply の技術的差」節への dry-run 予測対象（stale junction + stale plugin loader shim）の明文化
- 予測表示形式（`WOULD REMOVE`）の規約記載要否

## 既存要件・契約との関連

- install-script-usability Design（docs/designs/local/install-script-usability.md「dry-run/check/apply の技術的差」節）、TS-003（dry-run 予測表示の検証行）。
- 関連 item: runtime-package-boundary Design への管理投影物の機械的確定基準の明文化（2026-09-03）、管理物判定不能 junction の check 扱い追記（2026-09-03）。3 item は同一 PR #2541 由来の Design確定候補であり、backlog-review での束ね判定候補。

## 根拠

- PR #2541 本文「Design確定候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2541 ）
