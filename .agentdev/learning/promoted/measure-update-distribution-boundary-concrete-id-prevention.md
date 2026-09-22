# measure-update-distribution-boundary-concrete-id-prevention

## 背景

Case #3056（REQ-090 Jev 先行評価 Stage 1）の case-run 実装（DEL-3056-1）で、6系統 Workflow reference と新規 .ts / README へ具体 REQ 番号（REQ-090-004 等）と ADF-COVERS 宣言を直接記載したところ、配布依存境界検査（check_distribution_boundary.ts --profile source、case-run STEP-S5 と case-close 最終 gate）が 69 failures を検出した。混入物を除去し、対応宣言を traceability sidecar（traceability/*.yaml 等 7 件）へ登録し直して failures 0 に解消した（PR #3058 merge 済み）。

検知機構は機能したが、混入そのものは「新規配布物を作成する場面で concrete-id と ADF-COVERS 宣言を書かない」という予防側の確認観点が実装系 Skill・case-run 実行系に明示されていないために発生した。

## 問題

- 配布物（tools/plugins/skills 配下）への concrete-id（REQ-090-004 等）と ADF-COVERS 宣言の直接記載を防ぐ確認観点が、実装系 Skill 実行時・case-run の確認手順のどこにも明示されていない。
- 作成者が配布物は `REQ-{NNNN}` プレースホルダ形式・対応宣言は traceability sidecar 正規配置という既存原則（DEC-014・REQ-029 配布依存境界）を作業記憶から適用するしかない状態にあり、大量 reference 追記時に混入が再発し得る。

## 望ましい変更

「新規配布物（tools/plugins/skills 配下）へは concrete-id と ADF-COVERS を書かず、sidecar へ対応宣言を登録する」ことを、実装系 Skill 実行時・case-run の確認観点として明示する。検知 gate は既存（--profile source、case-run STEP-S5 / case-close 最終 gate）であり、予防側の確認観点のみを追加する。

## 対象範囲

### 対象

- case-run 実行系の確認観点（配布物を作成・編集する際の確認手順が明示される場所）
- 配布依存境界の運用ガイド（該当 Design の運用節。存在する場合）

### 対象外

- check_distribution_boundary.ts 等の検知機構本体（機能済みのため変更不要）
- traceability sidecar 机制（正規配置先として機能済み）
- DEC-014・REQ-029 の原則自体（既存・不変）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-workflow-case-run/references/ 配下（配布物作成の確認観点を明示する箇所） | 「新規配布物へ concrete-id・ADF-COVERS を書かず sidecar へ登録」の確認観点を追記 |
| Design | docs/designs/（配布依存境界関連 Design の運用ガイド節） | 予防側確認観点の運用記述を追記（検知 gate の説明と対になる予防観点） |

## 既存対策確認

- **確認結果**: 既存対策あり（検知側のみ機能、予防側未整備）
- **該当ファイル**: src/opencode/skills/agentdev-workflow-case-run/（STEP-S5 gate）、check_distribution_boundary.ts（--profile source）、docs/designs/ の配布依存境界 Design（DEC-014・REQ-029）
- **ギャップ分類**: fix gap / guardrail insufficiency
- **ギャップ詳細**: 配布物作成時の「concrete-id・ADF-COVERS を書かない、sidecar へ登録する」確認観点が、実装系 Skill・case-run の確認手順に明示されていない。検知 gate は事後捕捉のみ。

## 制約

- 配布物の責務境界（一般規則のみ保持、技術固有知識非保持）を維持する。確認観点の明示は「手続きの確認」として一般規則の適用支援であり、技術固有知識の配布物混入ではない。
- 既存 gate（case-run STEP-S5 / case-close）の契約は変更しない（予防観点の追加のみ）。
- traceability sidecar の正規配置契約（REQ-090-006 隣接、配布依存境界 Design）に従う。

## 受け入れ条件

- [ ] 実装系 Skill（case-run 実行系）の確認観点に「新規配布物へ concrete-id と ADF-COVERS を書かず、sidecar へ対応宣言を登録する」旨が明示されていること
- [ ] 大量 reference 追記を伴う配布物作成 Case で確認観点が参照可能であること（検索可能な配置・語彙）
- [ ] 既存の検知 gate 契約・sidecar 正規配置契約に変更がないこと

## 元learning item / 根拠

- **要約**: 配布物への concrete-id・producer metadata 混入が配布依存境界検査で検出された事象と、その予防確認観点の未整備
- **根拠**: Case #3056（DEL-3056-1）で6系統 Workflow reference と新規 .ts / README に REQ-090-004 等と ADF-COVERS 宣言を直接記載し、--profile source で 69 failures。PR #3058 で sidecar 7 件へ登録し直して解消。8軸評価 27/40（横展開性 4、再発可能性 4、費用対効果 5）。処分区分5（fix gap / guardrail insufficiency）。
- **再発条件**: tools/plugins/skills 配下の新規配布物（特に大量 reference 追記）を作成する Case で、sidecar 正規配置原則の確認観点が明示されないまま作成が行われる場合
- **横展開可能性**: 新規配布物を作成する全 Case で発生し得る（プロジェクト横断ではなく本プロジェクトの配布構造固有）

### 元エントリ全文（2026-09-22: 配布物への concrete-id・producer metadata の混入を配布依存境界検査が検出）

- **問題事象**: Case #3056（REQ-090 Jev 先行評価 Stage 1）の case-run 実装で、6系統 Workflow reference と新規 .ts / README へ具体 REQ 番号（REQ-090-004 等）と ADF-COVERS 宣言を直接記載したところ、配布依存境界 source profile で 69 failures を検出した。
- **発生局面**: case-run（DEL-3056-1）。Jev 先行評価 Tool 新設と6系統 Workflow reference 追記時。
- **検知方法**: check_distribution_boundary.ts --profile source（case-run STEP-S5 と case-close 最終 gate）。
- **根本原因**: 配布物は `REQ-{NNNN}` プレースホルダ形式が慣行であり、対応宣言は traceability sidecar（`traceability/*.yaml`）に置くのが正。inline declaration は producer 側成果物（docs 配下・producer 専用スクリプト）限定。
- **自律対応内容**: 配布物から concrete-id と ADF-COVERS 宣言を除去し、sidecar（traceability/agentdev-jev.yaml 等 7 件）へ対応宣言を登録し直し、failures 0 に解消（PR #3058 merge 済み）。
- **ユーザー確認の有無**: なし（case-run 内で自律修正・検証差分に記録）。
- **Decision/REQ/spec影響**: なし（既存の配布依存境界 Design〔DEC-014・REQ-029〕と traceability sidecar 正規配置の再適用）。
- **横展開観点**: tools / plugins / skills 配下の新規配布物を作成する全 Case で再発し得る。
- **再発条件**: 新規配布物の作成時に concrete-id または ADF-COVERS 宣言を本文へ直接記述した場合。
- **予防策候補**: 「新規配布物（tools/plugins/skills 配下）へは concrete-id と ADF-COVERS を書かず、sidecar へ対応宣言を登録する」を実装系 Skill 実行時・case-run の確認観点として明示する。
- **想定反映先**: 配布依存境界 Design の運用ガイド、または case-run 実行系の確認観点（REQ 化は learning-promote で判断）。
- **関連**: Case #3056、PR #3058、traceability/agentdev-jev.yaml、配布依存境界（DEC-014・REQ-029）。
- **タグ**: #distribution-boundary #concrete-id #traceability-sidecar

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, guardrail
- **関連Issue**: なし（Case #3056・PR #3058 は関連実績）
