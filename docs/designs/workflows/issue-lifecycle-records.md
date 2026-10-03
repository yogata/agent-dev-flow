---
title: Case Issue 工程記録モデル（issue-lifecycle-records）
status: accepted
created: 2026-10-03
updated: 2026-10-03
---
<!-- ADF-COVERS(design): REQ-101-001, REQ-101-002, REQ-101-003, REQ-101-004, REQ-101-006, REQ-101-007, REQ-101-008, REQ-101-009, REQ-101-010, REQ-101-011, REQ-101-012, REQ-101-013, REQ-101-014, REQ-101-015, REQ-101-016 -->

# Case Issue 工程記録モデル（issue-lifecycle-records）Design

## 目的

本 Design は Case Issue 本文・コメント・Case Epic の工程記録の物理様式と運用プロトコルの正となる。REQ-101 が定める構成要素の意味要件に対し、次を確定する。

## 確定事項

- Case Issue 本文のセクション構成様式（Standard/Child は目的、対象範囲・対象外、実現方針（再判断してはならない合意がある場合のみ）、完了条件、進行状況、結果（完了・中止確定時のみ）。Epic Root はこれに実行構成を加える）と各セクション名・順序・Markdown 様式。実現方針と結果は非該当時に章を常設しない
- 対象範囲の様式（対象要件、主な変更対象、対象外の記述形式）。対象要件は関連文書一覧とは区別し、REQ ファイルの存在を必須としない。主な変更対象は当該実行単位が所有する機械比較可能な宣言であり、最終変更ファイル一覧（実差分の正は Git 差分）と区別する
- Child Issue の本文冒頭の親 Epic 参照（`親Epic: #N`）の様式
- 完了条件の様式（各項目を条件、検証方法、合格条件、達成状態のチェックボックス形式で保持。必要な品質検証を完了条件へ統合し、テスト戦略・必須品質統制等の別章を設けない。不合格、証拠不足、検証不能、未処理は未達とする）
- 進行状況の様式（Standard Case と Epic Root は Case 全体の正規状態と開始・終了日時のみ。Child は開始・終了日時のみ）。表示用の第二の進行状態、現在工程、担当役割、次の行動、最新記録参照を保存しない。開始日時は初回実着手で上書き禁止、終了日時は完了・中止確定時（Child は completed 確定時）のみ設定
- 結果セクションの様式（完了・中止確定時のみ作成。成果物と必要な残件。終了状態を重複保存しない）
- コメントの記録対象の判定規則（停止・失敗の理由、重要な判断変更、検証のみで完了する Issue の証拠、非自明なレビュー判断に限定。通常の着手、引き渡し、再開を理由としたコメントを生成しない）。review_dispositions を全件転記せず、採用内容は実行契約へ反映し、必要な採否理由だけコメントへ残す
- 同一 Issue/Epic 本文への競合更新の局所直列化の書込み経路横断確認手順（ワークフロー、手動・代替経路、Epic 内処理。DEC-039 と Runtime 実行モデル Design の単位定義を参照し再定義しない）
- 部分成功（コメントのみ成功、本文のみ成功、Epic のみ未反映等）の区別、読み戻し、不足分再試行、重複投稿・重複実行防止のプロトコル
- 合意変更の受領確認経路（記録・受領・実行適用の区別、影響対象特定、最新条件の引き渡し、適用方針報告の確認）
- 更新回復用ローカル記録の境界（未反映内容と識別情報等への限定、第二の作業定義・恒久状態源としない条件）
- 子 Issue の実行結果の確定（completed、blocked、failed）に応じた Epic 実行構成への状態反映と全体条件評価の更新の記録様式、agentdev-epic-tracker Design の書き込み契約（per-Epic 単一書き手の下での取りまとめ書き込みと closing 書き込みの直列化）との接続

## 識別子と写像規則（確定値）

前節の確定事項のうち、機械処理が必要な識別子と写像規則を確定する。

### コメント種別と実装語彙

- コメントの記録対象は、停止・失敗の理由（hold 相当）、重要な判断変更（decision_change 相当）、検証のみで完了する Issue の証拠、非自明なレビュー判断に限定する。着手（start）、引き渡し（handoff）、再開（resume）を契機とするコメントを生成しない
- 検証スクリプト（`agentdev-workflow-case-run/scripts/record-comments.ts`）、Epic 反映エンジン（`agentdev-epic-tracker/scripts/lib/epic-reflect.ts`）、反映計画（`agentdev-workflow-case-auto/scripts/src/records-report.ts`）は、コメント生成契機の縮小に追随して start / handoff / resume 系の生成・反映経路を削除する。残存種別（hold、decision_change、検証証拠）の語彙は現行の英語識別子を維持し、三者で共有する
- 表示用の進行状態4値（not-started / running / waiting / ended）と記録契機からの写像表を廃止する。進行状況は正規状態と開始・終了日時で表現し、進行状態が独立して更新・判断される第二の進行管理を構成しない

### 正規状態と日時

- Standard Case と Epic Root の正規状態は実行継続、完了、中止を識別できる最小構成とし、状態値は v4-lifecycle-state-machine Design が正である。blocked、failed は子 Issue の状態として Epic 実行構成が所有し、Root Case の正規状態として重複保持しない
- 開始日時は初めて実装または検証に実着手した時刻（委譲要求や Issue 作成時刻ではない。Epic は配下の初回実着手）とし、停止・再開で上書きしない。終了日時は Standard Case と Epic Root は完了または中止確定時、Child は completed 確定時にのみ設定する
- 実作業時間、試行ごとの日時管理を別に保存しない。日時から得られるのは停止時間を含む経過時間である

### Epic 反映様式の実体参照点

子 Issue の実行結果確定（completed、blocked、failed）に応じた Epic 実行構成への状態反映の物理ブロック様式、反映手順、closing 書き込みとの直列化手順の実体は `agentdev-epic-tracker` SKILL.md の reference（`references/epic-reflect-coordination.md`）とする。本 Design は記録対象と状態反映の規則の正であり、同 reference は本節の規則に従う Epic 反映の実体手順を所有する。

## 対象外

- execution contract の確定と消費（REQ-017）
- Epic/Wave 実行モデルの実行制御（REQ-035-002/003/005/007/013/016。per-Epic 単一書き手の直列化単位定義は DEC-039 と Runtime 実行モデル Design）
- 追跡Issueの論理スキーマ（REQ-049、agentdev-issue-tracking Design）

## See Also

- REQ-101（Case Issue 工程記録モデル）
- REQ-035-001（Epic Issue 本文の更新書き手契約）
- [workflow-templates Design](../skills/agentdev-workflow-templates.md)（テンプレート投影規約）
- [agentdev-epic-tracker Design](../skills/agentdev-epic-tracker.md)（Epic 反映の書き込み契約）
