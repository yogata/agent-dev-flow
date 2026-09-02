# REQ-057-017 の実装対応宣言の正規配置先判断（残 draft Design 昇格判断時）

## 観測

REQ-057-017（draft Design の昇格判断は検証対応評価を含む正規工程で実行・記録）自体が全体 traceability check の missing-implementation に計上される（main HEAD ベースラインの既出 63件の1つ）。OU-012（Issue #2515・PR #2530）は REQ-057-017 が要求する draft Design のうち2件のみを昇格判断したため、PR #2530 では REQ-057-017 への ADF-COVERS(implementation) 宣言を付与しない判断をした（部分実現での宣言はトレーサビリティの趣旨と合わない）。

残 draft Design（decision-lifecycle.md、artifact-quality-control-routing.md、autogen-freshness-gate.md、test-impact-detection-gate.md、install-script-usability.md、dependency-version-compatibility.md 等）の昇格判断が完了した時点で、REQ-057-017 の実装対応宣言の正規配置先判断（判断記録の恒久配置先として）が必要。

## 今回扱わない理由

Wave 1 の境界クローズでは2件の昇格判断のみが完了しており、REQ-057-017 を fully cover する時点が到来していない。後続 Wave 以降の昇格判断完了時の判断候補。

## 影響

REQ-057-017 の missing-implementation が全体 traceability check に計上され続ける（既出分・fail には計上されるが検証対応必須行ではないため完了阻止には影響しない）。

## レビューで決めること

- 残 draft Design の昇格判断完了後に REQ-057-017 への ADF-COVERS(implementation) 宣言を付与するか、付与する場合の恒久配置先（判断記録の正規配置先）
- 昇格判断単位での部分実現の扱い（宣言の分割方法）

## 根拠

- PR #2530 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2530）
