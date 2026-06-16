# Retired Requirements

このディレクトリは retired REQ の履歴アーカイブである。ここにある REQ は削除されていないが、現行要件判断には使用しない。

active REQ は `docs/requirements/REQ-{NNNN}.md` 直下の25件である。旧REQから新REQへの移行有無は `docs/requirements/mapping-table.md` を参照する。

## Retired REQ

REQ-0001〜REQ-0050 は、2026-05-30 のREQ体系再構成により retired となった。

- 移行済みの内容は REQ-0101〜REQ-0133 に再構成されている。
- 移行しない内容は `retired-no-successor` または `historical-only` として migration table に記録する。
- REQ-0006 は `.sisyphus/` 非関与方針により `retired-no-successor` とする。
- REQ-0111 は REQ-0119-025 により retired となった（2026-06-14）。条項は他REQへの吸収なしで廃止。
- REQ-0122 は RFC2119 完全廃止の目的達成（PR #743, commit 90064c2）により retired となった（2026-06-15）。条項は他REQへの吸収なしで廃止。
- REQ-0116 は文書分類ポリシー定義の恒久内容を REQ-0101 に吸収（REQ-0101-057/058）し retired となった（2026-06-16、OU-04）。`migrated` 扱い。
- REQ-0118 は Subagent edit safety 制約を REQ-0119 に吸収（REQ-0119-027）し retired となった（2026-06-16、OU-04）。`migrated` 扱い。
- REQ-0120 は Runtime Command 非必須参照除去を REQ-0103 に吸収（REQ-0103-152）し retired となった（2026-06-16、OU-04）。`migrated` 扱い。
- REQ-0121 は Runtime Command 規範語を REQ-0103（REQ-0103-152）、Integrity 検査を REQ-0108（REQ-0108-242/243）に吸収し retired となった（2026-06-16、OU-04）。`migrated` 扱い。
- REQ-0115 は docs-* command suite の恒久要件を REQ-0108（docs-check 検査責務）、REQ-0109（inspect-docs）、REQ-0124（inspect 命名恒久制約）へ移行し retired となった（2026-06-16、OU-05）。`migrated` 扱い。
- REQ-0117 は Git worktree junction cleanup フォールバック手順を REQ-0110 に統合（REQ-0110-008）し retired となった（2026-06-16、OU-06）。`migrated` 扱い。
