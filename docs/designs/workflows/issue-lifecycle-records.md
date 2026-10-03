---
title: Case Issue 工程記録モデル（issue-lifecycle-records）
status: accepted
created: 2026-10-03
updated: 2026-10-03
---
<!-- ADF-COVERS(design): REQ-101-001, REQ-101-002, REQ-101-003, REQ-101-004, REQ-101-005, REQ-101-006, REQ-101-007, REQ-101-008, REQ-101-009, REQ-101-010, REQ-101-011, REQ-101-012, REQ-101-013, REQ-101-014 -->

# Case Issue 工程記録モデル（issue-lifecycle-records）Design

## 目的

本 Design は Case Issue 本文・コメント・Case Epic の工程記録の物理様式と運用プロトコルの正となる。REQ-101 が定める構成要素の意味要件に対し、次を確定する。

## 確定事項

- Case Issue 本文のセクション構成様式（目的、対象・対象外、完了条件、適用する合意・規律への参照、現在地、結果の各セクション名・順序・Markdown 様式）と execution contract セクション（workflow-templates Design）との共存構造
- 現在地セクションの項目様式（工程、進行状態、次の行動、担当役割、停止・待機理由、最新記録参照の記述形式）
- 結果セクションの項目様式（成果物、最終判定と根拠、残件の扱いの記述形式）
- 工程×進行状態×完了判定の記録モデルと識別子（英語識別子を含む。進行状態4値（未着手/実行中/待機/終了）の英語識別子、待機理由・完了/中止の内部区分）
- 進行状態4値と Root Case ライフサイクル状態（REQ-006-112、7値）等の正規状態・記録契機からの写像（導出）規則。進行状態が独立して更新・判断される第二の進行管理を構成しないことを保証する規則
- 工程の ADF 工程への結び付け（内部 lifecycle 段階等）と必要な内部区分の定義
- 記録契機（着手、引き渡し、停止、再開、判断変更、完了）の判定規則（委譲要求と実着手の区別、工程終了を待たない途中報告の判定、短い複数変化の統約条件、停止通知の即時性）
- 記録コメントの記録種別スキーマと必須項目（停止=再開条件、判断変更=撤回対象、引き渡し=残作業・受取役割、完了=判定根拠）、省略可能項目の判定
- 同一 Issue/Epic 本文への競合更新の局所直列化の書込み経路横断確認手順（ワークフロー、手動・代替経路、Epic 内処理。DEC-039 と Runtime 実行モデル Design の単位定義を参照し再定義しない）
- 部分成功（コメントのみ成功、本文のみ成功、Epic のみ未反映等）の区別、読み戻し、不足分再試行、重複投稿・重複実行防止のプロトコル
- 合意変更の受領確認経路（記録・受領・実行適用の区別、影響対象特定、最新条件の引き渡し、適用方針報告の確認）
- 更新回復用ローカル記録の境界（未反映内容と識別情報等への限定、第二の作業定義・恒久状態源としない条件）
- 追跡Issue側の同型原則（REQ-049-012、agentdev-issue-tracking Design）との並行関係（本文=現在状態・コメント=時系列の共通原則、role 分離に基づく別スキーマ）
- 取りまとめによる記録契機ごとの Epic 反映の記録様式（子状態集約・全体条件評価の更新形式）と、agentdev-epic-tracker Design 更新後の書き込み契約（per-Epic 単一書き手の下での取りまとめ書き込みと closing 書き込みの直列化）との接続。Epic 反映の完了までの間の子 Issue 本文現在地の読み取り規律（読み取り優先は Epic 反映責務の代替でない旨を含む）

## 識別子と写像規則（確定値）

前節の確定事項のうち、REQ-101-005 が本 Design への確定を委ねる識別子と写像規則、および REQ-101-006 の記録契機6種に対応する英語識別子を確定する。

### 記録契機の英語識別子

記録契機6種の英語識別子は次のとおりとし、報告受領から反映までの全経路で同一語彙を用いる。

| 記録契機 | 英語識別子 | 記録コメントテンプレート実体 |
|---|---|---|
| 着手 | `start` | `issue_comment_record_start.md` |
| 引き渡し | `handoff` | `issue_comment_record_handoff.md` |
| 停止 | `hold` | `issue_comment_record_hold.md` |
| 再開 | `resume` | `issue_comment_record_resume.md` |
| 判断変更 | `decision_change` | `issue_comment_record_decision_change.md` |
| 完了 | `completion` | `issue_comment_record_completion.md` |

検証スクリプト（`agentdev-workflow-case-run/scripts/record-comments.ts` の `RECORD_KINDS`）、Epic 反映エンジン（`agentdev-epic-tracker/scripts/lib/epic-reflect.ts` の `RECORD_TRIGGERS`）、case-auto の反映計画（`agentdev-workflow-case-auto/scripts/src/records-report.ts` の `RecordOccasion`）はこの語彙を共有する。いずれかが語彙から外れると反映経路上で値が解釈できなくなるため、識別子の変更は3者を同一の変更で行う。

### 進行状態4値の英語識別子と写像規則

表示上の進行状態4値（REQ-101-005）の英語識別子は `not-started`（未着手）、`running`（実行中）、`waiting`（待機）、`ended`（終了）とする。終了の内部区分は `completed`（完了）と `aborted`（中止）とする。

記録契機から進行状態への写像は次のとおりとする。

| 記録契機 | 写像後の進行状態 |
|---|---|
| `start`、`resume` | `running` |
| `handoff`、`decision_change` | `running`（Case Issue 本文の現在地。Epic 集約エントリでは進行状態の変化を伴わない反映として既存値を維持する） |
| `hold` | `waiting` |
| `completion` | `ended`（内部区分 `completed` または `aborted` を併記） |

実装上の写像の正は `record-comments.ts` の `mapRecordKindToProgressState`（Case Issue 本文の現在地表示用）と `epic-reflect-coordination.md` の記録契機別反映内容表（Epic 集約エントリ用）であり、本表に矛盾しない。Case Issue 本文の現在地は常に4値を記載するため、進行状態の変化を伴わない契機でも `running` を維持して更新する。

進行状態は Root Case ライフサイクル状態（REQ-006-112）等の正規状態と記録契機から写像（導出）される表示であり、独立して更新・判断される第二の進行管理を構成しない（REQ-101-005）。

### Epic 反映様式の実体参照点

取りまとめによる記録契機ごとの Epic 反映（子状態集約セクション `agentdev:epic-reflect`、全体条件評価セクション `agentdev:epic-overall`）の物理ブロック様式、反映手順、closing 書き込みとの直列化手順の実体は `agentdev-epic-tracker` SKILL.md の reference（`references/epic-reflect-coordination.md`）とする。本 Design は識別子と写像規則の正であり、同 reference は本節の識別子に従う Epic 反映の実体手順を所有する。

## 対象外

- execution contract の確定と消費（REQ-017）
- Epic/Wave 実行モデルの実行制御（REQ-035-002/003/005/007/013/016。per-Epic 単一書き手の直列化単位定義は DEC-039 と Runtime 実行モデル Design）
- 追跡Issueの論理スキーマ（REQ-049、agentdev-issue-tracking Design）

## See Also

- REQ-101（Case Issue 工程記録モデル）
- REQ-035-001（Epic Issue 本文の更新書き手契約）
- [workflow-templates Design](../skills/agentdev-workflow-templates.md)（テンプレート投影規約）
- [agentdev-epic-tracker Design](../skills/agentdev-epic-tracker.md)（Epic 反映の書き込み契約）
