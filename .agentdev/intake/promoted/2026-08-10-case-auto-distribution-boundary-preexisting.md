# 配布物 case-auto.md の distribution-boundary 違反是正（pre-existing 18件）

## 観測内容

配布 command 定義 `src/opencode/commands/agentdev/case-auto.md` が、検査スクリプト `check_distribution_boundary.ts` で18件の違反を抱えている（pre-existing ベースライン）。PR #2028（Epic #2021 adversarial-review 強化、RU-0014）では bounded parent decision resolution の整合性を保つため既存スタイル（REQ-ID 参照を含む記述）に従い記述した。配布物全体の distribution-boundary 是正は本 PR の対象外とした。

## 影響

- 配布 command 定義に具体 ID（ADR-NNNN, REQ-NNNN）や具体パス（`docs/(adr|requirements|specs)/<file>.md`）、固定 URL が残留する。
- project extensions 機構への持続的検査で検出され続ける。
- consumer プロジェクトへの配布時にプロジェクト固有参照が配布物に残留するリスクがある。

## 課題

配布 command 定義全体の distribution-boundary 違反（18件）が未解消であり、具体 ID 参照の project extension 経由への分離が必要。

## 既存要件との関連

- Epic: #2021（adversarial-review 強化、RU-0014）
- Issue: #2025（OU-004）
- PR: #2028
- 検査スクリプト: `check_distribution_boundary.ts`
- 配布物: `src/opencode/commands/agentdev/case-auto.md`

## 対応方向

- 配布 command 定義全体の distribution-boundary 是正を別 Issue として起票する。
- 具体 ID 参照を project extension 経由へ分離する。
- `check_distribution_boundary.ts` のベースライン18件を段階的に解消する。

## 出典

- PR #2028（pre-existing ベースライン維持の判断）
- Issue #2025（OU-004）
