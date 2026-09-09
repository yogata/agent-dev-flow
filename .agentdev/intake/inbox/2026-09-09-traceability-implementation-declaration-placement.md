# intake: traceability 実装対応宣言（ADF-COVERS implementation）の docs 側正規配置先整理

- **発生源**: PR #2744（Issue #2741 / Epic #2740 W1）の Findings を回収
- **capture 元**: case-close Epic Wave 1（Epic #2740、delegation DEL-CC-2741-1）
- **captured_at**: 2026-09-09

## 内容

traceability check の missing-implementation（REQ-031-025、REQ-031-026、REQ-032-023、REQ-010-076）: 対応宣言（ADF-COVERS implementation）の正規配置先は docs 配下の正規成果物（Skill Design・command Design 等）であり、配布物本体には対応宣言を書かない（agentdev-traceability 規範）。Issue #2741 の変更対象成果物（配布 reference 4件 + repo-local SKILL.md）では対応宣言を付与できず、対象範囲拡大（docs/** 変更）は同 Issue で禁止されていたため、宣言不在のまま case-close QG-4 で許容判断（完了阻害しない）が記録された。

## 補足

- 実現した実装内容と対応関係は PR #2744 本文の実装内容セクション・検証差分セクションに記録済み。missing-verification は 0（対象 7 行すべて verification-scope-catalog 登録済み・検証対応任意行）
- 後続の Skill Design 更新時に各 REQ 行への ADF-COVERS(implementation) 宣言を付与するか、対応宣言配置方針自体を整理するかは intake-promote の review で判定すること
