---
title: Artifact Quality Control Routing Design
status: draft
created: 2026-08-09
updated: 2026-08-31
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

artifact type から必須品質能力への対応表。ルーティング先は能力キーで表現し、
現在の提供 skill を参照情報として扱う（DEC-001 憲章：ADF core は具体的 skill 名や
呼出順を固定しない）。

| artifact type | 必須品質能力キー | 現在の提供 skill（参照） |
|---|---|---|
| document（docs/**/*.md） | 文書品質査読能力 | agentdev-doc-writing |
| Skill（src/opencode/skills/agentdev-*/SKILL.md） | Skill 品質査読能力 | agentdev-skill-authoring |
| Command（src/opencode/commands/**/*.md） | Command 品質査読能力 | agentdev-command-authoring |
| template（templates/**/*.md） | 文書品質査読能力（自然言語部分） | agentdev-doc-writing |
| references、scripts | 該当する能力キーが定義されている場合はそれに従う | 個別定義による |

同一成果物が複数能力を必要とする場合（例: Skill の自然言語部分は文書品質査読能力も
対象）、全ての適用能力を test strategy へ展開する。
多対多関係を許容する。

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

- **artifact-responsibilities.md**: 成果物責任表を維持。本 Design への一方向参照のみ追加
- **document-type-responsibilities.md**: 文書種別責務を維持。本 Design は document 以外も対象
- **agentdev-doc-writing**: 文書品質基準を所有。本 Design は適用対象の指定のみ
- **agentdev-skill-authoring**: Skill 品質基準を所有。本 Design は適用対象の指定のみ
- **agentdev-command-authoring**: Command 品質基準を所有。本 Design は適用対象の指定のみ
- **agentdev-quality-gates（QG-2）**: 実行時投影先。本 Design の規則に従い検証

## 拡張契約

新たな artifact type または品質能力キーを追加する場合、本 Design の対応表を更新する。
新規能力キーの提供 skill は対応する authoring Skill/Design が定義する。本 Design は
能力キーと artifact type の対応関係のみを更新する。
