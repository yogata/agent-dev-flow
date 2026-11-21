---
title: 採番管理 Design
status: accepted
created: 2026-07-19
updated: 2026-10-27
---
<!-- ADF-COVERS(implementation): REQ-001-008, REQ-001-009, REQ-001-013, REQ-001-042 -->
<!-- ADF-COVERS(implementation): REQ-004-003 -->
<!-- ADF-COVERS(implementation): REQ-001-070 -->
<!-- ADF-COVERS(design): REQ-001-070 -->

# 採番管理 Design

REQ、Decision、IR の識別子採番規則を統一する。
AgentDevFlow 配布物が前提する採番の不変条件を宣言し、各所に散在する採番規則を単一の参照先へ集約する（F-003、F-004）。

## 適用範囲

- **対象**: `docs/requirements/REQ-*.md`、`docs/decisions/DEC-*.md`、`docs/designs/integrity/rules/IR-*.md` の識別子採番
- **対象外**: 各 REQ の要件行 ID（`REQ-{NNN}-{MMM}` 形式）の採番詳細（`agentdev-req-file-manager` SKILL 参照）、`agentdev-req-file-manager/scripts/` の実装詳細

## 識別子形式

| 種別 | 形式 | 表示 | 接頭辞 |
|------|------|------|--------|
| REQ | `REQ-{NNN}` | 3桁ゼロ埋め（最小幅。切詰めしない） | `REQ-` |
| Decision | `DEC-{NNN}` | 3桁ゼロ埋め（最小幅。切詰めしない） | `DEC-` |
| IR | `IR-{NNN}` | 3桁ゼロ埋め（最小幅。切詰めしない） | `IR-` |

表示のゼロ埋めは最小幅の表示規則であり、受理検査の桁数上限として機能させない。識別子の受理検査は、
接頭辞、区切り、数値セグメント、各セグメント最小1桁という形式妥当性のみを要求し、桁数上限を設けない
（Decision `DEC-062` 参照）。

要件行 ID（`REQ-{NNN}-{MMM}`）は REQ 識別子を前置し、REQ 内の要件行連番を付ける。
詳細は `agentdev-req-file-manager` SKILL が定める。

## 採番規則

### 新規採番

新規識別子は、当該種別の現行ファイル群の最大番号に 1 を加えた値とする。

採番の判断は人間または LLM が行わず、`agentdev-req-file-manager/scripts/`（REQ、複合 ID）と `agentdev-decision-file-manager/scripts/`（Decision）が提供する決定的スクリプト（`alloc-req-number.ts`、`alloc-decision-number.ts`、`alloc-composite-id.ts`）が機械的に確定する（design-principles.md 第5節）。
Definition 系保存工程（case-open の Definition Package 編成時における proposed Decision の採番・作成、case-ready / case-revise における Definition 保存・Design 保存）は当該スクリプトを bash 経由で呼び出す。case-ready の Decision 受理評価（accepted 遷移）は採番・作成と区別される。

分割・付け替えに伴う採番のみの付け替えでは、ユーザー裁定による番号指定を例外として許容する。例外採番は REQ 本文の該当行にユーザー裁定の記録を伴う。決定的採番スクリプトによる新規採番は既定経路であり続ける。

### 廃止時の扱い

REQ、Decision、IR を廃止した場合、当該識別子は再利用しない。
廃止済みファイルは物理削除する（履歴参照は Git ログが正本である）。

### 採番ミスの是正

採番ミス（重複、飛び越し、誤桁数）を検出した場合、ファイル名と frontmatter `id` を一致させる方向で是正する。

`docs/requirements/README.md`、`docs/decisions/README.md`、`docs/designs/integrity/integrity-rule-catalog.md` の各索引は実体と一致するよう、新規採番、廃止、是正の都度更新する。
更新忘れを検出するための自動生成機構は `index-auto-generation.md` が定める。

### 改番時の扱い

既存識別子の改番（ユーザー裁定による例外採番、採番ミス是正に伴う付け替え）を行う場合は、次のスイープ対象を判定表に従って確認し、旧 ID 参照の残存を残さないこと。

| スイープ対象 | 判定 | 検証方法 |
|---|---|---|
| 要件行 ID（REQ-{NNN}-{MMM}） | 改番対象の REQ が持つ全要件行 | 新 ID 付与後に旧 ID で docs/ 全体を検索 |
| 本文散文中の行参照 | 他 REQ / Decision / Design / 運用文書の本文から旧 ID への言及 | 旧 ID の全文 grep（docs/reports/ は履歴記録として除外） |
| クロス参照・索引 | README 索引、traceability sidecar、inline ADF-COVERS 宣言、.agentdev/extensions/skills/*.yaml | 各参照源の旧 ID 検索と新 ID 反映 |

改番完了の判定は、旧 ID による全文検索（docs/ 全体 + traceability sidecar + .agentdev/extensions/skills/*.yaml、docs/reports/ は履歴記録として除外）が 0 件であることによる。

## 正規所有者と参照関係

| 主張 | 正規所有者 | 参照方向 |
|------|-----------|----------|
| REQ/Decision/IR の採番規則 | 本 Design | 各 SKILL（`agentdev-req-file-manager`、`agentdev-decision-file-manager`）は本 Design を参照 |
| 決定的採番スクリプトの I/O 契約 | `agentdev-req-file-manager` SKILL（Scripts セクション） | 本 Design は概要のみ言及、実装詳細は参照しない |
| 索引類の記載と実体の整合 | `index-auto-generation.md` | 本 Design は整合の必要性を宣言し、機構は同 Design を参照 |

## 関連情報

- 関連 REQ: REQ-001（文書・REQ 管理基準）、REQ-004（要件定義・保存）
- 関連 Design: `docs/designs/integrity/index-auto-generation.md`（索引類自動生成）、`docs/designs/foundations/patterns.md`（文書フォーマット規約）
- 関連 SKILL: `agentdev-req-file-manager`、`agentdev-decision-file-manager`
- 根拠監査台帳項目: F-003（v2:REQ-0157）、F-004（IR-045）

## 現行 Decision の識別子と配置（AG-007、AG-008）

現行の Decision は `DEC-NNN` 識別子を使用し、`docs/decisions/` に配置する。旧 `ADR-NNN` から移行した Decision は、旧識別子と番号部が1対1で対応する（DEC-009）。
Decision の採番には `alloc-decision-number.ts` を使用する。スクリプト名が変わる場合は本 Design の参照も更新する。
過去の `v2:ADR-*` 番号帯は AG-010 により維持し、`v2:DEC-*` は生成しない。
