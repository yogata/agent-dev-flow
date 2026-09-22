# 評価レポート

## メタデータ
- **実行日時**: 2026-09-22 14:34
- **対象エントリ数**: 1件（inbox: 1件, deferred: 134件〔候補突合対象〕）
- **問題クラス数**: 1（未分類のみ。単独エントリ）
- **実行特性**: backlog-auto stage 2 learning 系統（run2: Jev-enabled 再実行）。Jev 先行評価を実施（score form の gateway スキーマ不適合により 8軸を choice 形式で再構成し成功。詳細は Jev 観測記録節）

## 問題クラス一覧

### 未分類エントリ1: 配布物への concrete-id・producer metadata の混入（配布依存境界原則の適用漏れの予防確認観点が未整備）

- **根本原因**: 配布物は `REQ-{NNNN}` プレースホルダ形式が慣行で、対応宣言は traceability sidecar（`traceability/*.yaml`）に置くのが正という既存原則（DEC-014・REQ-029 配布依存境界）について、新規配布物作成時の確認観点が実装系 Skill・case-run 実行系のいずれにも明示されていないため、大量 reference 追記時に concrete-id（REQ-090-004 等）と ADF-COVERS 宣言の直接記載が発生した。
- **再発条件**: tools/plugins/skills 配下の新規配布物（特に6系統 Workflow reference のような大量追記）を作成する Case で、作成者が sidecar 正規配置原則を作業記憶から適用するしかない状態にある場合。
- **予防策**: 「新規配布物（tools/plugins/skills 配下）へは concrete-id と ADF-COVERS を書かず、sidecar へ対応宣言を登録する」を、実装系 Skill 実行時・case-run の確認観点として明示する。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単発（Case #3056・PR #3058。過去に L1579/L1607 の類似適用事例あり） |
| 影響度 | 3/5 | 69 failures 検出と修正を要したが gate が機能し merge 阻止・データ破壊なし。修正コスト中程度 |
| 横展開性 | 4/5 | tools/plugins/skills 配下の新規配布物を作成する全 Case で再発し得る（大量 reference 追記時に特に） |
| 反映先明確度 | 4/5 | 予防策候補・想定反映先が具体的（配布依存境界 Design 運用ガイド or case-run 実行系の確認観点）。inbox エントリの13フィールドが自足的に整備済み |
| 自動化適性 | 2/5 | 検知は既存 checker（check_distribution_boundary.ts --profile source）で自動化済みだが、予防策（確認観点の明示）の自動化は困難で明文化が主体 |
| プロジェクト固有知識再利用性 | 4/5 | 配布依存境界・traceability sidecar 正規配置の固有手順知見 |
| 再発可能性 | 4/5 | 大量 reference 追記を伴う新規配布物作成時は高確率で同種の書き間違いが発生し得る |
| 費用対効果 | 5/5 | 確認観点の明示追記（数行）で全 Case 横断の予防が可能 |
| **加重合計** | **27/40** | |

- **推奨処分案**: 処分区分5（既存対策の更新: fix gap / guardrail insufficiency）→ 採用。検知機構（check_distribution_boundary.ts --profile source、case-run STEP-S5 / case-close 最終 gate）は機能したが、予防側の確認観点の明示は配布 skill reference・case-run 実行系のいずれにも未整備。

### 重複判定（deferred.md 候補との突合）

- L1579「REQ-057-005 確定後は ADF-COVERS 宣言を docs 配下正規成果物へ配置する」（2026-09-03、PR #2528 適用済み）: 正規配置方針の確定と適用記録。本エントリはその後の新規混入事象であり、原則自体は既存。本エントリの本質（予防確認観点の未整備）はカバーしない。
- L1607「配布物の不在ID参照残骸は概念名参照へ置換する」（2026-09-03、S-08/S-09 で機械検出済み）: concrete-id 禁止境界の別適用事例。事象が異なる。
- L2310「BASELINE_CATEGORIES に producer-metadata が含まれず baseline 全体を null 化し得る」（2026-09-18）: checker 実装側の別問題。
- 結論: 同一根本原因＋同一再発条件＋同一予防策の既存エントリなし。**duplicate なし**。

### 既存対策照合

- **確認結果**: 既存対策あり（検知側のみ機能、予防側未整備）
- **該当ファイル**: `src/opencode/skills/agentdev-workflow-case-run/`（STEP-S5 gate）、check_distribution_boundary.ts（--profile source）、docs/designs/ の配布依存境界 Design（DEC-014・REQ-029）
- **ギャップ分類**: fix gap / guardrail insufficiency
- **ギャップ詳細**: 配布物作成時の「concrete-id・ADF-COVERS を書かない、sidecar へ登録する」確認観点が、実装系 Skill・case-run の確認手順に明示されていない。検知 gate は事後捕捉のみ。

## Jev 先行評価の観測記録（run2: Jev-enabled 再実行）

- **実行**: agentdev_jev evaluate（判断単位12問: 問題クラス分類1 + 8軸8 + 廃棄判定1 + 昇華可能性1 + review 発動条件1）
- **provider**: vercel-ai-gateway / model: typesafe-ai/jev / inputTokens: 3714 / confidence: 0.836
- **llm_treatment**: 全12判断単位 unchanged（Jev 結果を従来材料と突合し LLM 最終判断として採用）
- **失敗記録**: 初回呼出は score form 質問（axis-* 8問）が gateway 側スキーマ（`questions[].score.criteria` 要求）に不適合として GatewayInternalServerError で失敗。失敗は score form 質問のみで choice/boolean 質問は検証通過。同一判断内容を choice 形式（5水準選択肢）へ再構成し成功。同一リクエストの自動 retry ではなく呼び出し側の構成修正として実施（契約の自動 retry 禁止に抵触しない判断の記録）。
- **adversarial-review 限定合意（F-B1）**: 本構成修正再呼出は契約文言「自動 retry せず即座に fallback」の解釈余地を残すため、観測 JSON への経緯詳細記録と完了報告への明示を条件に Jev 結果を採用。score form の gateway スキーマ不適合は agentdev_jev Tool 側の修正課題として残す。
- **観測 JSON**: `.agentdev/jev-observations/` に本 workflow 実行分として保存（1実行1 JSON）

## 自律確定記録（STEP-5）

- **確定日時**: 2026-09-22 14:34（backlog-auto run2 stage 2）
- **判定結果**: 未分類エントリ1件（配布物 concrete-id・producer metadata 混入）→ **promote（処分区分5: 既存対策の更新）**
- **主要根拠**: (1) deferred.md 候補突合（L1579/L1607/L2310）で同一根本原因＋同一再発条件＋同一予防策の既存エントリなし（duplicate なし機械確認）、 処分区分5の判定基準に合致（検知機構は機能、予防側の確認観点明示が未整備 = fix gap / guardrail insufficiency）、(3) 8軸 27/40 で横展開性・再発可能性・費用対効果が高く昇華価値あり、(4) 前回（9/21）の同種事例2件（処分区分5）との判定一貫性
- **HITL 不要理由**: 処置が取得可能な根拠から一意に確定でき、判定の修正を要する曖昧さ、複数の妥当な解釈の対立、破壊的変更のいずれも存在しない。adversarial-review（STEP-4）で unresolved なし確認済み
- **adversarial-review 反映**: F-A1 撤回（発生件数軸の定義どおり）、F-B1 限定合意（Jev 構成修正再呼出の観測詳細記録と報告明示を条件に採用）、F-B3 部分合意（本記録の追記により確定表現を明確化）

## promote 時prune結果

- **対象エントリ数**: 1件（inbox 由来）
- **prune実施**: あり（staged 1件。deferred.md 追記・検証後に除去。証拠は採用済み成果物「元learning item / 根拠」セクションへ全文保存）
- **prune候補**: 1件
- **prune却下**: 0件

## 全体傾向

- 既存原則（DEC-014・REQ-029）の適用漏れを検知機構が捕捉した事例。検知側（--profile source gate）は機能、予防側（確認観点の明示）が未整備という典型的な fix gap パターン。
- 前回（9/21）の2エントリと同様、正典化された原則とその実践の間の「適用境界の穴」を埋める性格。8軸スコア 27/40 は中程度だが、横展開性・再発可能性・費用対効果が高く、数行の確認観点追記で解消する。

## Decision候補除外記録

- **対象item**: 本エントリ（配布物 concrete-id・producer metadata 混入の予防確認観点）
- **除外理由**: 運用ルール（確認観点・手順の明文化。技術判断不在）
- **根拠事実**: 予防策が実装系 Skill・case-run の確認観点への追記であり、アーキテクチャ上の決定・技術選定を含まない。原則自体（配布依存境界、sidecar 正規配置）は DEC-014・REQ-029 で既存。
- **代替反映先候補**: 配布skill reference（case-run 実行系の確認観点）、Design（配布依存境界の運用ガイド）
