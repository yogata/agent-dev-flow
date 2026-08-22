# distribution-targets.yaml が現行 checker に読まれていない（読込統合か廃止かの設計判断）

## 観測

REQ-047 規則所有権の一方向化（PR #2377、Issue #2373）の所有権整理で、`.opencode/skills/repo-agentdev-integrity/data/distribution-targets.yaml` が現行の配布境界 checker（lib/distribution-boundary.ts 実装）に読み込まれていない（検出用ビューの死蔵）ことを確認した。ヘッダーの「Consumed by: check_distribution_boundary.ts」宣言は誤りであり、本 PR で実態（lib 実装に埋め込まれ yaml は未読）へ訂正し、同期条件を文書化した。

## 今回扱わない理由

読込統合（yaml 単独の真にする）または廃止（lib 実装を唯一の定義にする）は配布境界 checker の内部構成変更を伴う設計判断であり、一方向化の要件行（REQ-047-001〜008）の対象外。case-close の capture 責務は回収・保存のみである。

## 影響

yaml が死蔵したままの場合、配布対象の実態変更が lib 実装と yaml の二箇所で乖離し得る（同期条件の文書化のみで、機械検証なしの状態が続く）。

## レビューで決めること

- 読込統合（checker が yaml を読む）か廃止（yaml を検出用ビューとして撤去）か
- 統合する場合は既存 checker の外部契約不変更（REQ-047-005）との両立方法

## 根拠

- PR #2377 本文「Findings / Capture候補」intake 1、「検査定義と checker の独立所有の解消・明示（REQ-047-003）」節
- .opencode/skills/repo-agentdev-integrity/data/distribution-targets.yaml ヘッダー
