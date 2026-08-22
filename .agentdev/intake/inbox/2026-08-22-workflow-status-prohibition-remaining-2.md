# workflow-status-prohibition 残り2件（design-save.md:93・artifact-contracts.md:124）

## 観測

check_integrity の workflow-status-prohibition 違反が2件残存する: docs/designs/commands/design-save.md:93・docs/designs/responsibilities/artifact-contracts.md:124（6マイクロフェーズ語と状態語の同一行出力）。PR #2396 (a) で system.md:172（同種の誤検出）は frontmatter フィールド名の backtick 囲みで解消済み。

## 今回扱わない理由

Issue #2385 の対象範囲外のファイルであり、解消手法（backtick 化または文言変更）の判断を要するため（PR #2396 Findings 記録のとおり）。

## 影響

check_integrity の unmanaged NG 7件の内2件として残存する。

## レビューで決めること

- 各違反行の解消手法（frontmatter フィールド名の backtick 囲みか、文言の言い換えか）の判定

## 根拠

- PR #2396 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2396 ）
