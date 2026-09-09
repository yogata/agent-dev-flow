# intake: integrity suite 既存 warning 6件の後続処置候補（Epic #2734 W5 集約観察）

- **発生源**: PR #2751（Issue #2739 / Epic #2734 W5）の Findings/intake 記録を回収
- **capture 元**: case-close Epic Wave 5 最終 Wave 境界（Epic #2734、delegation DEL-2734-close-w5）
- **captured_at**: 2026-09-10

## 内容

integrity suite（source profile）で継続検出されている既存 warning 6件。いずれも main 627def84 既出で、Epic #2734 ケースの変更由来ではない。後続 backlog・inspect 経路での処置候補として集約する。

| # | 対象 | 検出 check | 概要 |
|---|---|---|---|
| 1 | docs/designs/foundations/design-principles.md | accepted-adr-only-citation | DEC-022（proposed）の権威引用（REQ-057-015 関連） |
| 2 | docs/designs/integrity/verification-scope-catalog.md | accepted-adr-only-citation | DEC-027（proposed）の権威引用（同上） |
| 3 | src/opencode/skills/agentdev-workflow-case-run/references/single.md | gh-direct-invocation | gh CLI 直接呼出記述（既存 item 2026-09-09-docs-raw-gh-cli-notation-normalization-candidates と同一対象。回収時は同 item の「IR-053 除外候補」判断を参照） |
| 4 | docs/designs/authoring/dependency-version-compatibility.md | draft-spec-staleness | draft Design の鮮度超過（32日、W5 実測時点） |
| 5 | docs/designs/foundations/decision-lifecycle.md | draft-spec-staleness | draft Design の鮮度超過（31日、同上） |
| 6 | src/opencode/skills/agentdev-artifact-validation/SKILL.md | obsolete-vocabulary-current-use | obsolete 語彙（REQ/ADR/ 形式）の使用 |

## 補足

- 処置の要否・優先度は intake-promote の review で判定すること。#1/#2 は当該 Decision の昇格または参照方法の変更、#4/#5 は draft Design の更新または accepted 昇格判断、#6 は語彙の現行形式への置換候補
- W5 実行時点（2026-09-10）の検出であり、Epic #2734 の完了判定（拒否対象違反ゼロ）には影響しない（いずれも warning 区分）
