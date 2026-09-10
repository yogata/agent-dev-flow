---
title: agentdev-doc-diagnostics Design
status: accepted
created: 2026-07-22
updated: 2026-09-10
---

<!-- ADF-COVERS(implementation): REQ-021-021 -->
<!-- ADF-COVERS(verification): REQ-001-020 -->
<!-- ADF-COVERS(implementation): REQ-036-003, REQ-036-005, REQ-036-011, REQ-036-023, REQ-036-024 -->
<!-- ADF-COVERS(implementation): REQ-036-025 -->

# agentdev-doc-diagnostics Design

docs 横断の診断カテゴリ、共通証拠構造、共通 finding 出力契約、文書種別別診断へのルーティングを担う診断判断 skill の仕様を定める。

> **リポジトリ内部設計文書**: 本 Design は agent-dev-flow リポジトリのリポジトリ内部設計文書である。
> 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（REQ-001）。

## 目的

`inspect-docs` command の実行時に docs 横断診断の実行を担う診断判断 skill の責務、対象外、境界を定義する。
REQ 固有診断（`agentdev-req-structure-diagnostics`）、Command/Skill 診断（`agentdev-inspect-skills`）、文章表層検査（`agentdev-textlint-guard`）との責務重複を防ぎ、docs 横断診断の正規所有者を一つに定める。
探索・導線（索引からの到達性）は README 索引（`docs/designs/README.md` 等の入口表）と独立探索手段（正規成果物の直接読取、`rg` 等）が担い、本 skill の診断対象外とする。
名称は REQ-036-013 の diagnostics 許容例外境界に基づき `agentdev-doc-diagnostics` を維持する（CR-001）。

## 適用対象

**USE FOR**:

- inspect-docs command の診断カテゴリ定義
- docs 横断の診断判定規則
- 共通証拠構造（finding schema、severity、信頼度）
- 診断結果（finding）の出力契約
- 診断に必要な reference または script の選択
- 文書種別別診断（REQ 固有、Command/Skill、文章表層、探索順）へのルーティング

**DO NOT USE FOR**:

- 診断対象の修正（読み取り専用、intake/inspect pipeline 経由でのみ修正）
- promote 判断（`inspect-promote` の責務）
- REQ、Design、RU の保存（各保存 command の責務）
- commit、push（command の責務）
- Issue、PR 操作（case-* command の責務）
- REQ 固有の SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT 診断（`agentdev-req-structure-diagnostics` の責務）
- 文章表層検査（`agentdev-textlint-guard` の責務）
- 探索・導線（README 索引と独立探索手段（正規成果物の直接読取、`rg` 等）の責務）

## 提供する判断、操作

- docs 横断診断カテゴリの定義（廃止 REQ/Design 由来記述残置、REQ/Design 境界違反、REQ 粒度過小 等）
- 診断判定規則と証拠構造
- 共通 finding 出力契約（`.agentdev/inspect/inbox/*.md`、severity 分類、信頼度）
- 文書種別別診断へのルーティング表
- inspect-docs command への診断カテゴリ、証拠、finding 形式の提供

### 観点レジストリ

inspect-docs の診断観点は正規の観点レジストリが所有する（retired REQ-028-014 由来、現在は本 Design の references 配下レジストリが所有）。

- **配置先**: `docs/designs/skills/agentdev-doc-diagnostics/references/perspective-registry.md`（本 Design の references 配下）
- **schema**: 各観点エントリは観点ID（一意）、診断カテゴリ（SPLIT、MERGE、MOVE、DUPLICATE、RETIRE、DRIFT、残余参照、境界違反等）、適用文書種別、正規所有者 skill、詳細参照の項目を持つ
- 移管対応表（integrity-rule-catalog.md の inspect-docs 移管記録）で名指しされた観点は当該レジストリへ登録する
- レジストリの追加、変更は本 schema に従い、本 Design が schema の正規所有者となる

## 参照する references

- inspect-docs.md（command 手順）の診断実行 Step
- artifact-responsibilities.md「操作 skill 正規所有者台帳」
- artifact-contracts.md「サブエージェント委譲契約」（finding 出力契約）

## 現在の動作

- inspect-docs command は診断の実行と finding 出力を担い、診断カテゴリ、証拠構造、出力契約、ルーティングは本 skill が一次所有する（REQ-039-004）
- REQ 固有診断（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）は `agentdev-req-structure-diagnostics`、Command/Skill 診断は `agentdev-inspect-skills`、文章表層検査は `agentdev-textlint-guard` が担う。探索・導線は README 索引と独立探索手段（正規成果物の直接読取、`rg` 等）が担う（廃止済み探索順スキルの後継構成）
- 本 skill は横断編成と結果統合のみを所有し、専門診断の再定義を行わない
- 診断対象は読み取り専用とし、許可される副作用は `.agentdev/inspect/inbox/*.md` の生成と `.agentdev/inspect/` 配下の git 永続化（commit / push）のみ（REQ-002-140-151、inspect lifecycle 準拠）

## 境界

`agentdev-req-structure-diagnostics`（REQ 固有診断）、`agentdev-inspect-skills`（Command/Skill 診断）、`agentdev-textlint-guard`（文章表層検査）、README 索引と独立探索手段（正規成果物の直接読取、`rg` 等、探索・導線）との責務重複がないこと。
docs 横断診断は本 skill が正規の所有者となる（REQ-036-013 の diagnostics 許容例外境界、CR-001）。

## 対象外

- 診断対象の修正（読み取り専用、intake/inspect pipeline 経由でのみ修正）
- promote 判断（`inspect-promote` の責務）
- REQ、Design、RU の保存（各保存 command の責務）
- commit、push、Issue/PR 操作（command の責務）
- REQ 固有診断、文意品質、探索順（各専門 skill の責務）

## 検証観点

- 診断カテゴリ定義の完全性（廃止 REQ/Design 由来記述残置、REQ/Design 境界違反 等）
- 共通証拠構造と finding 出力契約の適合性
- 文書種別別診断へのルーティング精度
- 読み取り専用制約の遵守（許可副作用は `.agentdev/inspect/inbox/*.md` 生成と git 永続化のみ）
- 既存専門診断 skill との責務重複なし

## Design 状態乖離 DRIFT 診断観点

### 判定基準

- 対象要件: draft Design の ADF-COVERS(implementation) 宣言がカバーする REQ
  （Case 特定の粒度は REQ ファイル単位の近似を含む。行レベルの正規記録先が確定した場合は
  行レベル判定へ昇格する。REQ ファイル単位近似は、同一 REQ ファイルの別行実装完了による
  誤報告性格を含むため、finding に近似判定である旨を明示する）（adversarial-review F7）
- 評価可能段階の到達: 当該 REQ を実装・検証した Case が完了済み（Issue クローズ済みまたは
  PR マージ済み）であること。Case 完了状態の取得源は、ローカル版では .agentdev/issues/ の
  永続ファイル、GitHub 版では Custom Tool 操作契約経由の読み取りとする（診断は読み取りと
  報告のみ）（adversarial-review F7）
- 乖離条件: 評価可能段階に達しているにもかかわらず当該 Design の frontmatter status が
  draft ままであること。ただし対応記録コメント等に見送り記録（見送り理由・再評価契機）が
  存在する場合は乖離と判定せず、該当記録の文脈（再評価契機を含む）を finding へ添付する
  （adversarial-review F7。この文脈提示が再評価契機の消費者契約となる）
- 単なる draft の存在は指摘しない。経過時間（frontmatter updated からの日数）を判定根拠に使わない
  （IR-054 の時間ベース放置検出と判定基準を分離する）
- 適用起点は本診断の実装以降に完了した Case を対象とし、実装前の歴史的完了 Case に遡って
  適用しない（baseline 注記、adversarial-review F7(d) 推奨）

### 出力と副作用

- 検出は DRIFT カテゴリの finding として報告し、推奨アクションは case-close の Design 状態評価
  （棚卸し制）への差し戻しを提示する
- 診断は読み取りと報告のみとし、Design の status・frontmatter を直接変更しない
- 本観点は観点レジストリ（REQ-036-024 の正規実体）へ登録する
- Decision の状態乖離（proposed Decision の受理評価漏れ）は本観点の対象外とし、
  Decision と REQ の関係を正規情報から一意に取得できる情報源の確定後に別要件として追加する

## See Also

- [agentdev-req-structure-diagnostics.md](agentdev-req-structure-diagnostics.md)（REQ 固有診断 skill）
- REQ-036-013（diagnostics 命名許容例外境界）
- REQ-039-004（inspect-docs と diagnostics skill の責務分離）
