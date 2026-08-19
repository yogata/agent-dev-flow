# ACT-SPEC バッチ保存由来の dangling 参照先用語の横断確認が未実施

## 観測

ACT-SPEC バッチ保存コミット 3b8a42ff（ACT-SPEC-001〜026 一括反映）で、workflow-templates SPEC が参照先成果物（agentdev-epic-tracker SKILL.md・references）に実在しない用語「V4形式」を整合先として引用したまま SPEC 化されていた（Issue #2228・PR #2273 で dangling と判定し「新4列形式」へ是正済み）。

「V4形式」に限れば docs/ + src/ 全 .md で残存 0件を確認済みだが、同バッチ由来の他 SPEC に同種の dangling 参照先用語（参照先成果物に実在しない用語の引用）が残存する可能性は横断未確認のまま残っている。

## 今回扱わない理由

Issue #2228 の対象範囲は workflow-templates SPEC の整合是正のみ。他 SPEC への横断確認は PR 本文 Findings で「本 Issue スコープ外」と明記され、後続候補とされている。

## 影響

dangling 参照先用語が残存する SPEC は、読み手を存在しない定義へ誘導する。将来の SPEC 統合・再編時の突合でも偽陽性・取りこぼしの原因になる。

## レビューで決めること

- ACT-SPEC バッチ保存（3b8a42ff）適用 SPEC 22件（ACT-SPEC-001〜026 の適用分）に対し、inspect-docs 等での参照先用語実在確認を横断実施するか
- 実施する場合の対象範囲（バッチ適用 SPEC 全数か、SPEC 本文が外部成果物を整合先として挙げる箇所に限るか）

## 根拠

- PR 2273 本文「Findings・Capture候補」2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2273）
