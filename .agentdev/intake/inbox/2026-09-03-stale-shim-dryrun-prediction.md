# install-script-usability Design「dry-run/check/apply の技術的差」節への stale shim の dry-run 予測表示の明文化

## 観測

両入口（install.ps1、self-sync.ps1）の dry-run は従来 stale plugin loader shim の削除予測を表示していなかったが、TS-003 が「dry-run が予測表示」を要求するため、実装（PR #2541）で stale shim に対する `WOULD REMOVE` 予測表示を追加した。この予測対象範囲（stale junction に加えて stale shim を含む）は install-script-usability Design「dry-run/check/apply の技術的差」節には明文化されていない。

## 今回扱わない理由

本 Case（Issue #2540）は実装 Case であり、Design 本文への追記は設計確定作業として別途行うべき。

## 影響

dry-run の予測対象が Design 上 stale junction のみと読める場合、shim 予測の有無を実装差異と誤認するリスク。TS-003 相当の将来検証で予測対象の期待値を取り違えるリスク。

## レビューで決めること

- install-script-usability Design「dry-run/check/apply の技術的差」節への dry-run 予測対象（stale junction + stale plugin loader shim）の明文化
- 予測表示形式（`WOULD REMOVE`）の規約記載要否

## 根拠

- PR #2541 本文「Design確定候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2541 ）
