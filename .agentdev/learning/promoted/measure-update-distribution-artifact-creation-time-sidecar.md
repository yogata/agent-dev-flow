# measure-update-distribution-artifact-creation-time-sidecar

## 背景

Case #3056（REQ-090 Jev 先行評価 Stage 1）の case-run 実装（PR #3058 merge 済み）で、6系統 Workflow reference と新規 .ts / README に具体 REQ 番号（REQ-090-004 等）と ADF-COVERS 宣言を直接記載した結果、配布依存境界 source profile で 69 failures を検出した。検知機構（check_distribution_boundary.ts --profile source、case-run STEP-S3-5 事前 gate と case-close 最終 gate）は機能し、case-run 内で自律修正（配布物から concrete-id と ADF-COVERS 宣言を除去し、traceability/agentdev-jev.yaml 等 sidecar 7件へ対応宣言を登録し直し）で failures 0 に解消された。本変更は、この再発を検知頼みではなく作成時予防で回避するための既存対策の更新候補である。

## 問題

配布物は `REQ-{NNNN}` プレースホルダ形式が慣行で、対応宣言は producer / project 側の traceability sidecar に置くのが正（配布依存境界 Design「配布物本文の記述規則」節、DEC-014・REQ-029）という既存規約が存在するにもかかわらず、新規配布物（tools / plugins / skills 配下）を作成する実装工程でこの規約が前置観点として適用されず、concrete-id と inline ADF-COVERS 宣言が配布物へ混入した。現状の case-run 規約（SKILL.md L120 の対応宣言作成先ルール）は STEP-S2 coverage 確認（既存対応関係の確認）文脈に付随して記述され、「新規配布物の作成時」の作成時確認観点として独立明示されていない。検知 gate は事後・事前委譲検知であり、委譲内実装時の作成時予防観点は未整備である。

## 望ましい変更

「新規配布物（tools / plugins / skills 配下）へは concrete-id と ADF-COVERS を書かず、sidecar へ対応宣言を登録する」を実装系 Skill 実行時・case-run の作成時確認観点として明示する。既存の検知 gate（STEP-S3-5 / STEP-S5 / case-close 最終 gate）は変更せず、作成時の前置観点を既存規約の補遺として追加する。

## 対象範囲

### 対象

- case-run 実行系（agentdev-workflow-case-run）の委譲内実装確認観点（作成時観点の前置）
- 配布依存境界 Design（docs/designs/integrity/distribution-boundary.md）「配布物本文の記述規則」節の運用側補強の検討材料

### 対象外

- 配布依存境界 checker（check_distribution_boundary.ts）の検知ロジック変更
- traceability sidecar の schema・正規配置契約の変更（REQ-057 系・DEC-037 は不変）
- REQ / Decision / spec の新規改廃（既存の DEC-014・REQ-029 と sidecar 正規配置の再適用で足りる）
- PR #3058 で解消済みの個別混入分の再是正

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/opencode/skills/agentdev-workflow-case-run/SKILL.md（L120 対応宣言作成先ルール周辺）または references/single.md（STEP-S4 実装観点） | 新規配布物作成時の作成時確認観点（concrete-id・inline ADF-COVERS 禁止、sidecar 登録）の前置追記 |
| Design | docs/designs/integrity/distribution-boundary.md「配布物本文の記述規則」節 | 作成時観点の運用側補強の検討（正典側の補遺要否は req-define が判断） |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: docs/designs/integrity/distribution-boundary.md（L40-50「配布物本文の記述規則」節）、src/opencode/skills/agentdev-workflow-case-run/SKILL.md（L120 対応宣言作成先ルール）、同 references/single.md（STEP-S3-5 事前 gate、L165-170 cleanup 判定）、同 references/delegation-and-result.md（STEP-S5 最終 gate）
- **ギャップ分類**: application miss（主）+ guardrail insufficiency（副）
- **ギャップ詳細**: 規約（Design 記述規則・case-run 作成先ルール）は存在したが新規配布物作成時の実装工程で適用されなかった（application miss）。case-run L120 の作成先ルールは STEP-S2 coverage 確認文脈に付随し、「新規配布物の作成時」の前置観点として独立明示されておらず、検知 gate も事後・事前委譲検知で作成時（委譲内実装時）の予防観点が未整備（guardrail insufficiency）

## 制約

- 既存の配布依存境界 Design（DEC-014・REQ-029）と traceability sidecar 正規配置契約（DEC-037・REQ-057 系）は不変。本変更は再適用の徹底であり、契約変更を含まない
- 検知 gate（fail-closed）は既存どおり維持し、前置観点の追加で gate を弱めない
- 実現先の選択は req-define の変更影響分析が確定する責務であり、本成果物は既存事実の整備状況と情報候補のみを保持する

## 受け入れ条件

- [ ] case-run 実行系（または req-define が確定する実現先）に「新規配布物（tools / plugins / skills 配下）へは concrete-id と ADF-COVERS を書かず、sidecar へ対応宣言を登録する」作成時確認観点が明示されていること
- [ ] 既存の配布依存境界検知 gate（STEP-S3-5 事前 gate / STEP-S5 最終 gate / case-close 最終 gate）の契約が変更されていないこと
- [ ] REQ / Decision / spec に新規改廃が発生していないこと（既存 DEC-014・REQ-029 の範囲内で完結すること）

## 元learning item / 根拠

- **要約**: 新規配布物作成時の concrete-id・inline ADF-COVERS 宣言混入を配布依存境界検査が検出。作成時予防観点の前置欠落を既存対策の更新（区分5）として昇華
- **根拠**: Case #3056（REQ-090 Jev 先行評価 Stage 1）の case-run 実装（DEL-3056-1）で、6系統 Workflow reference と新規 .ts / README へ具体 REQ 番号（REQ-090-004 等）と ADF-COVERS 宣言を直接記載し、check_distribution_boundary.ts --profile source（case-run STEP-S5 と case-close 最終 gate）で 69 failures を検出。配布物から concrete-id と ADF-COVERS 宣言を除去し、sidecar（traceability/agentdev-jev.yaml 等 7件）へ対応宣言を登録し直し、failures 0 に解消（PR #3058 merge 済み）。ユーザー確認なし（case-run 内で自律修正・検証差分に記録）。Decision/REQ/spec影響なし（既存の配布依存境界 Design〔DEC-014・REQ-029〕と traceability sidecar 正規配置の再適用）。8軸評価 25/40（反映先明確度 4・費用対効果 4・再発可能性 4）
- **再発条件**: 新規配布物の作成時に concrete-id または ADF-COVERS 宣言を本文へ直接記述した場合
- **横展開可能性**: tools / plugins / skills 配下の新規配布物を作成する全 Case で再発し得る

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: enhancement
- **関連Issue**: #3056
