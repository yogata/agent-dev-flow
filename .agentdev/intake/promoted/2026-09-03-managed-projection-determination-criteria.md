# runtime-package-boundary Design への管理投影物の機械的確定基準の明文化

## 観測内容

runtime-package-boundary Design「stale 管理投影物の削除境界」の「ADF が管理する投影物として配置したもの」に対し、実装（PR #2541）では「リンク先が当該 junction の相対パスに対応する正本パス（install.ps1 は `src/opencode-local/agentdev-gh-cli` リダイレクト先も含む）に一致する junction」を機械的確定基準として実装した。正本から削除された管理対象 junction は broken でもリンク先文字列が reparse data に残るため判定可能であり、正本以外を向く junction やリンク先を確定できないものは管理物判定不能として自動削除しない非破壊境界とした。この確定基準自体は Design 本文には明文化されていない。

本 Case（Issue #2540）は実装 Case であり、Design 本文への追記は実装完了後の設計確定作業として別途行うべきとされた。

## 影響

将来の実装者が「ADF が管理する投影物として配置したもの」の判定を Design 本文のみから導出する場合、実装と異なる解釈（例: junction 名の prefix 判定のみ）を採用するリスク。

## 課題（レビューで決めること）

- runtime-package-boundary Design「stale 管理投影物の削除境界」への機械的確定基準（正本相対ターゲット一致、LocalMode リダイレクト先包含、broken junction の reparse data 参照）の明文化
- 管理物判定不能 junction の非破壊境界の Design 記載

## 既存要件・契約との関連

- runtime-package-boundary Design（docs/designs/local/runtime-package-boundary.md「stale 管理投影物の削除境界」節）、install.ps1 の junction 管理実装（PR #2541）。
- 関連 item: stale shim の dry-run 予測表示の明文化（2026-09-03）、管理物判定不能 junction の check 扱い追記（2026-09-03）。3 item は同一 PR #2541 由来の Design確定候補であり、backlog-review での束ね判定候補。

## 根拠

- PR #2541 本文「Design確定候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2541 ）
