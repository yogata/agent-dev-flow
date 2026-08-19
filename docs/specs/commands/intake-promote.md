---
title: intake-promote SPEC
status: accepted
spec_logical_division: behavior
canonical_owner: intake-promote
created: 2026-06-21
updated: 2026-08-19
---

# intake-promote SPEC

## 目的

inbox 内の intake item をレビュー、分類し、採用 item を backlog-review 向け採用済み成果物に整形する。
review、分類、整形を担う。
GitHub Issue 作成は行わない。

## 変更種別分類

intake 成果物から RU へ引き継ぐ変更種別を定義する（REQ-001-033、REQ-001）。
intake-promote は採用 item を採用済み成果物（promoted artifact）へ整形する際、各 item に基づき次の8変更種別のいずれかを付与する。
変更種別は分類根拠フィールド `change_nature` として RU へ伝播され、req-define が REQ 拡張可否を判定する入力となる。
learning-promote.md「変更種別分類」と整合する。

### 変更種別と REQ 拡張可否

| 変更種別 | 内容 | REQ 拡張候補 |
|---|---|---|
| new_user_requirement（新しい利用者要求） | 既存REQ が要求を保持していない新しいステークホルダー要求 | ○（REQ 作成または拡張） |
| external_contract_change（外部契約変更） | 利用者から見える外部契約の変更 | ○（REQ 作成または拡張） |
| variation_addition（バリエーション追加） | 既存要求を満たすバリエーション追加 | ×（SPEC 拡張） |
| edge_case（エッジケース） | エッジケース対応 | ×（SPEC 拡張） |
| parameter_adjustment（パラメータ調整） | retry 回数、timeout、閾値、重み等の調整 | ×（パラメータSPEC 拡張） |
| nonconformance_fix（不適合修正） | 既存REQ/SPEC への不適合修正 | ×（SPEC 修正） |
| internal_restructuring（内部再構成） | 外部挙動を変えない内部再構成 | ×（SPEC 再構成） |
| document_correction（文書訂正） | 文書記述の訂正 | ×（文書修正） |

REQ 拡張を候補とするのは `new_user_requirement` または `external_contract_change` のみ。
それ以外は既存 REQ が要求を既に保持している限り REQ を拡張しない（REQ-001-033）。
判定の最終確定は req-define が行う（REQ-004-087）。

### 分類根拠の引き継ぎ

intake-promote は change_nature と併せて、observed_evidence（根拠となる観測事実）、target_stakeholder、user_visible_change 等の分類根拠（`../responsibilities/artifact-contracts.md`「分類根拠伝播契約」参照）を RU へ伝播させる。
分類根拠は soft-contract（DEC-003）とし、欠落時は unknown 既定値で警告する。

## HITL 境界、自動実行ルール（REQ-003-003/004/005/008）

- **HITL は「判断の確定」に限定**（REQ-003-003）: 分類承認（採用/保留/却下の確定）のみが HITL 対象。
- **分類承認後の自動実行**（REQ-003-004/008）: 分類が確定した場合、採用 item 整形 / promoted 保存 / 振り分け / inbox 削除 / git pull / commit-push は追加確認なしで自動実行する。分類未確定、修正中の場合は進まない。
- **破壊的変更の明示承認維持**（REQ-003-005）: inbox の大量削除、重要 item の誤分類是正等の破壊的操作は、分類承認とは別に明示的な承認を求める。

## 入力

- intake item 群（`.agentdev/intake/inbox/` 内 Markdown）
- ユーザーによる追加コンテキスト、分類修正指示（対話的）

## 出力

- 採用 item の採用済み成果物（backlog-review 用）
- `.agentdev/intake/promoted/*.md`（整形済み item、フラット構造、frontmatter なし）
- 分類結果レポート（採用/保留/却下）

## 副作用

- git commit/push: `.agentdev/intake/` 配下のみ（commit message: `chore: promote intake items`）
- 採用 item の inbox 元ファイルを削除（`archive/promoted/` への移動を廃止）
- reject item の inbox 元ファイルを削除（`archive/rejected/` への移動を廃止）。reject 時の commit message に却下理由を含める（監査証跠の補強）
- 実行前同期: `git pull --ff-only`
- GitHub Issue 作成: 行わない（G01）

## 現在の動作

5 フェーズ構成。
各フェーズの詳細手順は Workflow Skill（`agentdev-workflow-intake-promote`）が正規情報源である。

- フェーズ1 inbox スキャン: inbox 確認、item 読込
- フェーズ2 内部レビュー: レビュー評価、暫定分類の生成と提示
- フェーズ3 HITL 確定（判断の確定、REQ-003-003）: ユーザー確認（G06: ユーザー明示的承認必須、G07: 分類結果の提示と確認修正機会提供）
- フェーズ4 振り分け（分類承認後の自動実行、REQ-003-008）: 採用 item 整形、保存（`.agentdev/intake/promoted/`、フラット構造、frontmatter なし）、振り分け（inbox 削除含む）
- フェーズ5 git 操作完了報告（自動実行）: git pull、commit/push、完了報告

**自動実行の前提**（REQ-003-008）: フェーズ3 で分類が確定（採用/保留/却下のいずれか）している場合のみ、フェーズ4、5 を自動実行する。
分類未確定、修正中は進まない。

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 SPEC であり、command 定義（`src/opencode/commands/agentdev/intake-promote.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（フェーズ構成、内部手順、reference 構成）は Workflow Skill（`agentdev-workflow-intake-promote`）が所有し、本 SPEC はこれらを複製しない。
- Workflow Skill の単独起動防止（soft guard）は Workflow Skill description の DO NOT USE FOR トリガーにより実効する（command 定義本文に soft guard 宣言節を持たない構成である）。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 参照する横断 SPEC

- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Capture 境界、Split Rule）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（採用済み成果物 lifecycle）

## 自律確定の判定位置とHITLフォールバック（新規セクション）

本節は intake-promote における自律確定の判定位置とHITLフォールバックの実行詳細を所有する。判断確定の境界は REQ-003-055 の共通原則に従い、詳細判定表は横断契約SPEC（workflows/workflow-contracts.md「promote系判断確定とHITL境界」節）が集約所有する（本 SPEC と Workflow Skill は同一内容を重複保持しない）。

### classification〜review〜HITL〜persistence の各 STEP における自律確定判定の挿入位置

- classification（フェーズ1、2）: 取得可能な根拠から採用・保留・却下を一意に確定できる item は自律確定候補とする
- review（フェーズ2）: 自律確定候補のうち対論型レビューが必要な item は review を経た後に確定する
- HITL（フェーズ3）: ユーザー判断が必要な item のみを HITL 対象とする（REQ-037-003）
- persistence（フェーズ4、5）: 確定済み分類に従い自動実行する

### 部分自律確定の実行手順

同一実行内に自律確定可能 item とユーザー判断必要 item が混在する場合、未決項目に依存しない item を先行確定し、ユーザー判断必要 item のみ HITL 対象とする（REQ-003-056）。

### 自律確定項目の結果・主要根拠・HITL不要理由の報告形式

判定結果、主要根拠、HITL不要と判断した理由は既存の分類結果、実行報告を優先利用して報告し、新規永続成果物を必須としない。

### ユーザー判断必要 item のみの HITL 提示形式

HITL 確定フェーズではユーザー判断が必要な item のみを提示し、自律確定済み item は確定内容の報告にとどめる。

## 対象外

- GitHub Issue 作成（G01）
- intake item 元内容の改変（G02）
- backlog-review の自動起動（G03）
- learning pipeline 入力生成（G04）
- learning item 保存、分類、昇華（G05）
- ユーザー明示的承認なしの採用済み成果物生成（G06）
- 分類結果の非提示（G07、必ず提示、確認修正機会提供）
- 分類未確定のままの自動確定、自動進行（G08、REQ-003-003。確定後の自動進行は REQ-003-008 で許容）
- workflow 管理成果物の扱い（G09）
- 整形結果への frontmatter 含有（G10）
- 整形結果への重複排除キー、後続成果物参照含有（G11）
- 元 item 本文への整形結果書込（G12）
- `.agentdev/intake/accepted/` の参照使用（G13）
- 保存先 `.agentdev/intake/promoted/` 直下以外（G16）

## 検証観点

- HITL 承認の確実性（G06, G07, G08）
- 整形結果の frontmatter / 重複排除キー / 後続成果物参照を含まないこと（G10, G11）
- 保存先が `.agentdev/intake/promoted/` 直下のみであること（G16）
- 採用 item 元ファイルの inbox 削除（`archive/promoted/` への移動を廃止）（G17）

## 停止状態

- 分類未確定、修正中のまま自動進行しない（REQ-003-003。フェーズ3 の HITL 確定を待つ）。
- adversarial-review 審議で unresolved な本質的争点が残る場合（HITL 確定へ進まず、ユーザー判断事項として停止する）。
- 実行前同期（`git pull --ff-only`）失敗時、push 失敗時（エラーを報告して停止する）。

## See Also

- [intake-capture.md](intake-capture.md), [intake-from-github.md](intake-from-github.md)（前段コマンド）
- [backlog-review.md](backlog-review.md)（後続コマンド（RU 生成））
- `agentdev-workflow-intake-promote` skill（workflow 実装本体）
- `agentdev-intake-pipeline` skill（inbox スキャン、レビュー評価、分類提示、整形保存）
- REQ-037（Intake command群）

## adversarial-review 挿入境界（経路C）

本節は intake-promote における経路C の review 挿入境界を正典として所有する（REQ-015-006）。
共通契約（任意性、副作用禁止、accepted finding 反映責務、再 review 条件、停止条件、呼出失敗時取扱い）は adversarial-review SPEC「adversarial-review caller integration 共通契約」節（REQ-014）が正規所有し、本節は経路C 固有の挿入位置、発動条件、戻り先のみを所有する。

### 挿入位置（REQ-015-006）

review 挿入位置は「暫定分類の生成完了後・ユーザー確認の開始前」へ一意に特定可能である。
生成された暫定分類を review 対象とし、ユーザーへ提示する前に review を経た分類を提示する。
候補判断基準と内部手続きの詳細は `agentdev-intake-pipeline` SPEC「adversarial-review 候補判断と内部挿入」節を参照する。

### 発動条件判定 Step と review 呼出 Step の分離（REQ-015-001）

経路C の review 挿入境界は次の2 Step を分離して構成する。

| Step | 役割 |
|---|---|
| 発動条件判定 Step | default-on 原則、暫定分類の意味的完成度、review 対象の存在、skip 条件を判定する |
| review 呼出 Step | 発動条件を満たす場合に限り adversarial-review を呼び出す |

発動条件判定を満たさない場合は review 呼出を実行しない。
Workflow Skill は発動条件判定と review 呼出を独立した手順として保持する。

### default-on と skip 条件（REQ-015-002、REQ-015-003）

intake-promote は adversarial-review を原則実行する（default-on、REQ-015-002）。
ユーザー明示指定は通常発動の必須条件ではなく、暫定分類の意味的決定が存在する場合に発動する。
明示指定はコマンド起動時の引数、対話中の指示、または Workflow Skill extension（`.agentdev/extensions/skills/agentdev-workflow-intake-promote.yaml`）の `rules` により表明される。

- **skip 条件**: 次のいずれかに該当する場合、adversarial-review を省略して従来フローを継続できる（REQ-015-003）。skip 判断のためだけの新規 HITL、承認点は追加しない。
  - inbox 項目が1件のみで暫定分類が自明（単一区分確定、意味的決定なし）の場合
  - inbox 空（inbox スキャンで終了）の場合
- **ユーザー明示指定時の必須実行**: ユーザーが明示的に review を指定した場合、発動条件判定 Step は skip 条件の該当にかかわらず必ず「発動」と判定し、review 呼出 Step を実行する（REQ-015-002）。ただし review 対象（暫定分類）が存在しない場合は発動しない。

### 条件非該当時の従来フロー維持（REQ-015-003）

skip 条件該当時、呼出失敗時（REQ-014-010）のいずれの場合も、review 呼出をスキップし、生成済みの暫定分類をそのままユーザー確認へ渡す従来フローを維持する（REQ-015-003）。
既存の HITL（G06, G07, G08）、自動実行ルール（REQ-003-008）、破壊的変更制約（G18）は変更しない。

### accepted finding の反映と戻り先

review 呼出で accepted finding が得られた場合、呼出元（intake-promote 本体）が暫定分類へ finding を反映し、反映後の分類をユーザー確認へ渡す（REQ-014-006）。
adversarial-review 自身は反映を行わない。
unresolved な本質的争点が残る場合、ユーザー確認の既存 HITL 経由で扱い、後続の保存、inbox 削除等の不可逆処理へは進まない（REQ-014-009）。
呼出失敗時は silent skip を禁止し、利用不能を報告した上で従来フローを維持する（REQ-014-010）。

