# IR-055 狭域化により顕在化した baseline-known 33 件の段階解消（OU-0016 前提）

## 観測

IR-055 のトークン近傍狭域化（PR #2265）により、行単位免除で隠れていた violation が顕在化し、strict 6 件・heuristic 26 件の計 33 件（`docs/specs/**` bare glob 参照等を含む）が baseline-known 化された（baselines/ir-055-baseline.json: 66 entries / 147 violations、generated_at 2026-08-18）。triage_action（新規検出時は baseline に追加）に従った対応。

## 今回扱わない理由

配布物プレースホルダ表記の棚卸し・整理は OU-0016（Epic「配布物表記・様式是正」）のスコープであり、OU-0015 の checker 更新完了後に検出を実施する前提（Epic 依存 D1←B）。本 Issue（#2210）は checker 実装の狭域化準拠までをスコープとする。

## 影響

baseline-known 33 件は IR-055 の info（baseline-known, not yet cleaned）として計上され続ける。OU-0016 実施時の解消対象リストの起点情報となる。

## レビューで決めること

- OU-0016 実施時に 33 件（strict 6 + heuristic 26）を一括解消するか、strict 優先の段階解消とするか
- 解消時の baseline エントリ除去基準（解消済み violation の baseline 残置の可否）

## 根拠

- PR 2265 本文「Findings / Capture候補」1件目・「baseline 再生成」節（回収元: https://github.com/yogata/agent-dev-flow/pull/2265）
