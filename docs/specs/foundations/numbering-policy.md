---
title: 採番管理 SPEC
status: accepted
created: 2026-07-19
updated: 2026-07-20
---

# 採番管理 SPEC

REQ、ADR、IR の識別子採番規則を統一し、欠番の扱いを採番ミスと意図的予約の両面から確定する。AgentDevFlow 配布物が前提する採番の不変条件を宣言し、各所に散在する採番規則を単一の参照先へ集約する（AG-006、AG-007、F-003、F-004）。

## 適用範囲

- **対象**: `docs/requirements/REQ-*.md`、`docs/adr/ADR-*.md`、`docs/specs/integrity/rules/IR-*.md` の識別子採番
- **対象外**: 各 REQ の要件行 ID（`REQ-{NNNN}-{MMM}` 形式）の採番詳細（`agentdev-req-file-manager` SKILL 参照）、`agentdev-req-file-manager/scripts/` の実装詳細

## 識別子形式

| 種別 | 形式 | 桁数 | 接頭辞 |
|------|------|------|--------|
| REQ | `REQ-{NNNN}` | 4桁ゼロ埋め | `REQ-` |
| ADR | `ADR-{NNNN}` | 4桁ゼロ埋め | `ADR-` |
| IR | `IR-{NNN}` | 3桁ゼロ埋め | `IR-` |

要件行 ID（`REQ-{NNNN}-{MMM}`）は REQ 識別子を前置し、REQ 内の要件行連番を付ける。詳細は `agentdev-req-file-manager` SKILL が定める。

## 採番規則

### 新規採番

新規識別子は、当該種別の現行ファイル群（retired/ を含む）の最大番号に 1 を加えた値とする。欠番が存在する場合でも欠番を埋めず、最大番号をもって決定する。

採番の判断は人間または LLM が行わず、`agentdev-req-file-manager/scripts/` が提供する決定的スクリプト（`alloc-req-number.ts`、`alloc-adr-number.ts`、`alloc-composite-id.ts`）が機械的に確定する（AG-002、design-principles.md 第5節）。req-save、spec-save は当該スクリプトを bash 経由で呼び出す。

### 廃止時の扱い

REQ、ADR、IR を廃止した場合、当該識別子は再利用しない。廃止済みファイルは物理削除する、または各 `retired/` ディレクトリへ移動し、履歴参照に限定する。廃止識別子の再利用は、欠番埋めと同じく禁止する。

### 欠番の扱い

過去の採番ミス、意図的予約、廃止由来を問わず、一度生じた欠番は維持する。欠番を埋める新規採番、欠番を再利用する識別子割当てはいずれも禁止する。欠番は各 README、索引類、DOC-MAP で「欠番」として明記し、実体不在と整合する。

#### 既知の欠番

| 種別 | 欠番 | 由来 |
|------|------|------|
| REQ | `REQ-0157` | 純粋な未使用番号（F-003）。採番ミス、廃止移動を含まない。欠番として維持する |
| IR | `IR-045` | docs 日本語表現検査機能の廃止に伴う削除（REQ-0108-255/256/262）。識別子のみ参照用に残し、欠番として維持する |

### 採番ミスの是正

採番ミス（重複、飛び越し、誤桁数）を検出した場合、ファイル名と frontmatter `id` を一致させる方向で是正する。是正によって新たな欠番が生じる場合は欠番として維持し、後続採番で埋めない。

`docs/requirements/README.md`、`docs/adr/README.md`、`docs/specs/integrity/integrity-rule-catalog.md` の各索引は実体と一致するよう、新規採番、廃止、是正の都度更新する。更新忘れを検出するための自動生成機構は `index-auto-generation.md` が定める。

## 正規所有者と参照関係

| 主張 | 正規所有者 | 参照方向 |
|------|-----------|----------|
| REQ/ADR/IR の採番規則 | 本 SPEC | 各 SKILL（`agentdev-req-file-manager`、`agentdev-adr-file-manager`）は本 SPEC を参照 |
| 決定的採番スクリプトの I/O 契約 | `agentdev-req-file-manager` SKILL（Scripts セクション） | 本 SPEC は概要のみ言及、実装詳細は参照しない |
| 索引類の記載と実体の整合 | `index-auto-generation.md` | 本 SPEC は整合の必要性を宣言し、機構は同 SPEC を参照 |

## 関連情報

- 関連 REQ: REQ-0101（文書・REQ 管理基準）、REQ-0102（要件定義・保存）
- 関連 SPEC: `docs/specs/integrity/index-auto-generation.md`（索引類自動生成）、`docs/specs/foundations/patterns.md`（文書フォーマット規約）
- 関連 SKILL: `agentdev-req-file-manager`、`agentdev-adr-file-manager`
- 根拠監査台帳項目: AG-006、AG-007、F-003（REQ-0157）、F-004（IR-045）
