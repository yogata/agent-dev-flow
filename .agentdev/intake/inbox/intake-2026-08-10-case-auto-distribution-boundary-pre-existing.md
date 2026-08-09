# intake: 配布物 case-auto.md の distribution-boundary 違反是正（pre-existing ベースライン18件）

## 発生日

2026-08-10

## 発生元

- Epic: #2021（adversarial-review 強化・原則適用・case-auto 自走統合、RU-0014）
- Issue: #2025（OU-004: case-auto bounded parent decision resolution）
- PR: #2028
- 取得元: PR #2028 本文「## Findings / Capture候補」セクション distribution-boundary (pre-existing) サブセクション

## 問題事象

`src/opencode/commands/agentdev/case-auto.md`（配布 command 定義）が `check_distribution_boundary.ts` で18件の違反を抱えている（pre-existing ベースライン）。本 PR #2028 は bounded parent decision resolution の整合性を保つため既存スタイル（REQ-ID 参照を含む記述）に従い記述した。配布物全体の distribution-boundary 是正は本 PR の対象外。

## 影響

- 配布 command 定義に具体 ID（`ADR-NNNN`, `REQ-NNNN`）や具体パス（`docs/(adr|requirements|specs)/<file>.md`）、固定 URL が残留し、project extensions 機構（配布物参照境界）への持続的検査で検出され続ける。
- consumer プロジェクトへの配布時に、プロジェクト固有参照が配布物に残留するリスク。

## 発生局面

実装（OU-004 case-auto SPEC 詳細化、配布 command case-auto.md の bounded parent decision resolution セクション追加時）

## 検知方法

PR #2028 実装者が check_distribution_boundary.ts を実行し、pre-existing の18件違反を確認。本 PR は既存スタイルに従い追加したため、新規違反は0件。

## 想定される対応方向

- 配布 command 定義（`src/opencode/commands/agentdev/*.md`）全体の distribution-boundary 是正を別 Issue として起票し、具体 ID 参照を project extension 経由へ分離する。
- `check_distribution_boundary.ts` のベースライン18件を段階的に解消する。

## 関連

- Epic: #2021
- Issue: #2025
- PR: #2028
- 検査スクリプト: `.opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts`
- 配布物: `src/opencode/commands/agentdev/case-auto.md`

## 出典引用

PR #2028 本文「## Findings / Capture候補」distribution-boundary (pre-existing) サブセクションより:

> src/opencode/commands/agentdev/case-auto.md の check_distribution_boundary.ts 違反は pre-existing（ベースライン18件）。本 PR は bounded parent decision resolution の整合性を保つため既存スタイル（REQ-ID 参照を含む）に従い記述。check_distribution_boundary.ts は case-run の検査ツールセット（check_changed_docs.ts, check_extensions.ts, test_strategy）には含まれない。配布物全体の distribution-boundary 是正は別 Issue の対象。

## タグ

#intake #distribution-boundary #pre-existing #case-auto #配布物参照境界 #project-extensions
