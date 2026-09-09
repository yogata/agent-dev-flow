---
title: Artifact Quality Control Routing Design
status: accepted
created: 2026-08-09
updated: 2026-09-10
---
<!-- ADF-COVERS(implementation): REQ-017-004, REQ-017-005, REQ-017-006 -->

# Artifact Quality Control Routing Design

変更予定成果物の種別から必須品質能力を導出する合成規則と、Issue execution contract
（REQ-017）への投影契約を定義する。本 Design は設計記録（document-model.md により
docs/designs/ は実行時依存先ではない）であり、実行時の適用判定と test strategy 投影は
case-open が、QG-2 による充足検証は agentdev-quality-gates が、個別品質基準は各
authoring Skill/Design がそれぞれ担当する。

## 適用範囲

- **対象**: artifact type（document、Skill、Command、references、scripts、templates 等）から
  必須品質能力への対応表、能力キー定義、QG-2 投影契約
- **対象外**:
  - 個別品質基準、適用条件の詳細（各 authoring Skill/Design）
  - artifact type の配置、正規所有者（artifact-responsibilities.md）
  - 文書種別の配置、執筆規則（document-type-responsibilities.md）
  - QG-2 実行時投影の詳細実装（agentdev-quality-gates Design）

## 能力キー定義

品質能力は決定的な文章表層検査と成果物固有の意味および構造の品質を区別する。

| 対象 | 品質能力 | 提供責務 |
|---|---|---|
| 共通基盤の対象 Markdown | 文章表層検査能力 | 共通 textlint 基盤 |
| REQ の作成と要件行 | 要件意味品質能力 | agentdev-req-analysis |
| REQ の事後構造診断 | REQ 構造診断能力 | agentdev-req-structure-diagnostics |
| docs 横断の意味と文書境界 | 文書意味診断能力 | agentdev-doc-diagnostics |
| Decision の成立と根拠 | Decision 品質判断能力 | agentdev-decision-guidelines と既存 Decision 関連責務 |
| Command の作成 | Command 品質能力 | agentdev-command-authoring |
| Skill の作成 | Skill 品質能力 | agentdev-skill-authoring |
| Command と Skill の事後診断 | 配布物意味構造診断能力 | agentdev-inspect-skills |
| template と references | 内容の成果物種別に応じた意味構造品質能力 | 当該成果物の既存所有能力 |
| 構造と参照および履歴の機械検査 | 整合性検査能力 | 既存の決定的検査器 |

能力キーは具体的な Skill の呼出順を固定しない。
対象判定は共通 textlint 基盤が所有し、doc-diagnostics は src/opencode の対象化を所有しない。
標準対象外の template 等に文章表層検査を適用する場合はプロジェクトの追加対象設定を利用する。
同じ成果物に複数の能力が必要なら全てを test strategy に投影する。
既存の QG と変更誘発境界リスクに基づく品質要求を維持する。

## 入力源

品質能力の投影入力源は、artifact type に加えて case-specific risk（変更誘発境界リスク）を含む。

- **artifact type**: 変更予定成果物の種別から必須品質能力を導出する（本 Design の合成規則、変更なし）
- **case-specific risk（変更誘発境界リスク）**: REQ-054 の変更誘発境界リスク分析が導出した case-specific risk を投影入力源に追加する。投影先は test strategy、投影完全性の検査は QG-1（リスク→test strategy 投影完全性）が担う

既存の合成規則（artifact type → 必須品質能力）を変更せず、入力源の追加として拡張する。

## 合成規則

1. case-open は合意済み要件doc の artifact_actions から変更予定成果物を抽出する
2. 各成果物の artifact type を判定する
3. 上記対応表から必須品質能力キーを導出する
4. 各能力キーについて、test strategy 項目を生成する
   （verification: 当該能力によるレビュー、pass_criteria: 対象基準に未解決違反がない、
    on_failure: fix-and-reverify）
5. 生成した test strategy 項目を Issue 本文の test strategy セクションへ投影する
6. QG-2 は Issue 作成前に test strategy 上の必須品質能力の充足を検証する

## QG-2 投影契約

QG-2（agentdev-quality-gates）は次を検証する。
(a) 変更予定成果物から導出される全ての必須品質能力が test strategy へ反映されていること
(b) 各 test strategy 項目が3要素（verification、pass_criteria、on_failure）を持つこと
    （REQ-008-048）
(c) 完了条件が成果状態であり、必須能力の呼出自体が完了状態とされていないこと

## 他 Design との関係

- artifact-responsibilities.md は成果物責任表を所有する。
- document-type-responsibilities.md は文書種別責務を所有し、本 Design は文書以外の成果物も対象にする。
- textlint-quality-runtime は文章表層検査の共通基盤を所有し、本 Design は必要な品質能力の投影を所有する。
- 成果物固有の意味と構造の品質は能力キー定義に示した既存責務が所有する。
- agentdev-skill-authoring は Skill の品質基準を所有する。
- agentdev-command-authoring は Command の品質基準を所有する。
- agentdev-quality-gates の QG-2 は実行時の投影先として本 Design の規則に従って検証する。

## 拡張契約

新たな artifact type または品質能力キーを追加する場合、本 Design の対応表を更新する。
新規能力キーの提供 skill は対応する authoring Skill/Design が定義する。本 Design は
能力キーと artifact type の対応関係のみを更新する。
