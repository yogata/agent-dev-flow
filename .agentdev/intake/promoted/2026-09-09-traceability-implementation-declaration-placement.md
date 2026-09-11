# traceability 実装対応宣言（ADF-COVERS implementation）の docs 側正規配置先整理

## 観測内容

- 発生源: PR 2744（Issue 2741 / Epic 2740 W1）の Findings を回収
- capture 元: case-close Epic Wave 1（Epic 2740、delegation DEL-CC-2741-1）
- captured_at: 2026-09-09

traceability check の missing-implementation が REQ-031-025、REQ-031-026、REQ-032-023、REQ-010-076 の4行で継続している。対応宣言（ADF-COVERS implementation）の正規配置先は docs 配下の正規成果物（Skill Design・command Design 等）であり、配布物本体には対応宣言を書かない（agentdev-traceability 規範）。Issue 2741 の変更対象成果物（配布 reference 4件 + repo-local SKILL.md）では対応宣言を付与できず、対象範囲拡大（docs/** 変更）は同 Issue で禁止されていたため、宣言不在のまま case-close QG-4 で許容判断（完了阻害しない）が記録された。

2026-09-11 時点の現行突合: docs 配下に当該4行をカバーする ADF-COVERS(implementation) 宣言は未付与（検索 0件）。missing-implementation は現存する。

## 影響・課題

- 実現した実装内容と対応関係は PR 2744 本文（実装内容セクション・検証差分セクション）に記録済みだが、traceability 宣言としては未接続
- missing-verification は 0（対象 7 行すべて verification-scope-catalog 登録済み・検証対応任意行）

## 後続判断に残る選択肢

- 各 REQ 行に対応する Skill Design / command Design へ ADF-COVERS(implementation) 宣言を付与する
- または対応宣言配置方針自体を整理する（配布物のみの変更で実現された実装の宣言取り扱い）

## 既存要件・契約との関連

- REQ-012（成果物トレーサビリティ）
- docs/designs/foundations/traceability-model.md（TIM、covers の3役割）
