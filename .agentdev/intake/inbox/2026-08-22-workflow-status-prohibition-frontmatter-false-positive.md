# workflow-status-prohibition NG 3件の frontmatter 4キー列挙に対する誤検出疑い

## 観測

check_integrity の workflow-status-prohibition で NG 3件が検出されている。

- docs/designs/commands/design-save.md:93
- docs/designs/foundations/system.md:172
- docs/designs/responsibilities/artifact-contracts.md:124

検出行はいずれも frontmatter 4キー（title/status/created/updated）の列挙であり、旧 Step 構造の記述ではない。新規検出クラス（commit 833fd666）の誤検出の可能性がある。

## 今回扱わない理由

5111aac3/a36589d9 起因の pre-existing 検出で、Issue #2380（OU-002）の検証対象外。担当は OU-007（Issue #2385）の範囲だが、検出器側の精度確認を要するため case-close では判断しない。

## 影響

誤検出のままだと docs-check の NG baseline が実態と乖離し、本来の旧 Step 構造残存検出の信頼性を下げる。

## レビューで決めること

- 検出器（workflow-status-prohibition）に frontmatter 4キー列挙行を除外する規則を追加するか、当該3件を baseline 登録するか

## 根拠

- PR #2390 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2390 ）
- git blame で 5111aac3/a36589d9 起因であることを PR #2390 が確認
