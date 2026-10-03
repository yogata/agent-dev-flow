---
title: Issue タイトル記述規則（issue-title-policy）
status: accepted
created: 2026-10-03
updated: 2026-10-03
---
<!-- ADF-COVERS(design): REQ-100-001, REQ-100-002, REQ-100-003, REQ-100-004, REQ-100-005, REQ-100-006, REQ-100-007, REQ-100-008 -->

# Issue タイトル記述規則（issue-title-policy）

ADF が起票する Issue タイトルの具体書式を所有する単一参照点である（対応 REQ は REQ-100）。REQ は必須条件を、本 Design は具体書式・判定表・適用場面を所有し、各コマンド / Workflow Skill・テンプレート・追跡Issue起票経路は本 Design を参照して適用する。規則を固定のタイトル例へ複製しない。

## 所有境界

- 件名を論理スキーマ項目として保持する構造は agentdev-issue-tracking Design（REQ-049-007）が所有する。本 Design は件名（title）文字列の書式を所有する
- Issue 本文の構造は agentdev-workflow-templates Design・各本文テンプレートが所有する。本 Design はタイトル行のみを対象とする
- PR タイトル（Conventional Commits 形式、case-close の PR タイトル事前変更を含む）は本 Design の対象外である
- 実行順序・Wave 構成の正は Epic 本文（REQ-035）。タイトルは表示用の投影であり、実行制御はタイトル解析を行わない

## 役割別書式（判定表）

| Issue の役割 | 書式 | 付与・更新の場面 |
|---|---|---|
| 実行構造確定前の Root Case / Standard Case | `Case: 主題` | case-open が Root Case を起票する時点 |
| Epic として確定した管理 Issue（Root Case） | `Epic: 主題` | case-ready が Epic 構成を確定した時点（`Case:` から更新） |
| Epic 配下の子 Issue | `[Wave N] Task: 主題` | case-ready が子 Issue を作成する時点（N = 所属 Epic 内の確定済み Wave 番号） |
| 追跡Issue（role: tracking） | `Tracking: 主題` | 追跡Issue起票経路（/agentdev/issue、各 workflow の起票） |

- `Task:` は子 Issue の表示上の接頭辞であり、追跡Issueの kind: task ではない
- 実運用に別 Epic が存在する経路もこの表の役割に沿って命名する（Root Case と別 Epic の統合は本 Design の対象外）
- 適用は GitHub・ローカル版（agentdev_gh local）の両起票経路に及ぶ。ローカル版 case file の title フィールドも同一の書式に従う

## 主題の書き方

- 合意済みの開発・修正作業: 対象と達成する変更
- Epic 管理: 作業群で達成する成果
- 問題追跡: 対象と観測された問題
- 案・リスク等の追跡: 検討する案、懸念、判断対象
- 未確定の原因や未合意の解決策を確定事項として書かない
- 日本語を基本とする。固有名詞・コマンド名・ファイル名は対象識別に必要なら残す
- 「整備」「改善」「対応」のみで完結させず、対象と方向を具体化する
- REQ 行追加・APPEND・ファイル更新といった編集操作より、実現する変更を優先する
- 類似 Issue は対象・範囲・期待成果で識別できるようにする。短縮で区別を失わない
- 固定文字数制限・専用の意味採点器は設けない。簡潔にし、詳細は本文へ置く

## Wave 投影

- 子 Issue には確定済みの所属 Wave を先頭に置き `[Wave N] Task: 主題` に統一する
- Wave 番号は所属 Epic 内でのみ有効。同じ Wave 内の順序・並列可否・開始条件は Epic 本文が所有する
- 独立 Case を同じ case-auto 起動という理由だけで Wave 化しない
- 実行枠の都合による一時分割・待機・再開は番号変更の理由にしない
- 正規の構成変更で所属 Wave が変わる場合はタイトルを同期する（Epic 本文の Wave テーブルと子 Issue タイトルの一致）
- Epic 分解テーブル（{child_title} 列）へ転記する子 Issue タイトルも付与時点の書式に従う

## タイトルから除く情報

工程名（case-open / case-ready 等）、現在状態（実行中・再開待ち・完了等）、OU/RA/AG/ACT/TS の羅列、REQ/Decision 番号の羅列、親 Issue 番号、投入識別子（intake/learning 等の投入元識別子）、topic_slug、ファイル一覧、検証件数、実測値。これらは本文の既存の対応欄へ保持する。識別子除去で再開・冪等照合を壊さない（冪等照合は本文の識別情報・安定した検索キーで行う）。ファイル名・コマンド名自体が主題ならその名前は残せる。

## 付与と更新の場面

- case-open: 合意済みの対象・目的から `Case: 主題` を生成する
- case-ready: 確定構造に沿って Root Case の接頭辞を更新し（Epic 確定時 `Epic: 主題` へ）、子 Issue へ `[Wave N] Task: 主題` を付与する。既存の構造契約に従い、タイトル規則のために構造を変更しない
- case-run / case-close: 状態の進行・停止・完了だけではタイトルを変更しない。case-close の PR タイトル事前変更は PR に対する操作であり、Issue タイトル不変と区別する
- 追跡Issue起票・更新: 確認された主題に基づき `Tracking: 主題` を生成する
- 再構成（case-ready / case-revise）: 所属 Wave が変わる正規の構成変更時にのみ子 Issue タイトルを同期する

更新理由は誤記・曖昧さの修正、合意済み対象・目的変更、役割 / Wave 構成確定または変更に限定する。タイトルの書換えで未合意の範囲変更を隠さない。同じ対象の再利用は安定識別情報（Issue 番号・冪等キー）で行い、タイトル修正を理由に新規 Issue を作らない。

## 生成例

規則の適用例である（規則の原本は本節ではなく上記の各節にあり、例が乖離する場合は各節を正とする）:

- `Case: 再開時に既存Issueを再利用し重複作成を防ぐ`
- `Epic: ADFをOpenCodeとSenpiで共通利用できる構成へ移行する`
- `[Wave 2] Task: インストーラーを両ホストの配置に対応させる`
- `Tracking: 再開後に同じ変更のIssueが重複作成される`
- `Tracking: 出力ログの文字化けの原因を調査する`（未確定原因の断定を避ける例）

## 機械検査と推敲の責任分担

- 書込み前推敲（REQ-098）が主題の品質を担う。本 Design の規則は推敲の入力であって推敲の代替ではない
- 機械検査は共通の既存境界に安価な形式検査として置ける場合のみ再利用する（例: 配布物整合性検査・既存テスト形式への書式例追加）。新規 Plugin・意味評価器・Tool 側の形式検証は追加しない。汎用 issue_update の部分更新・互換性・ユーザー自由入力を破壊しない

## 参照接続（適用面）

本 Design への参照接続を維持する配布面（各面の変更は実現面の責務。本 Design は参照先の一覧を所有する）:

- case-open: references/root-case-and-definition-package.md（Root Case 起票）
- case-ready: references/execution-structure.md（Epic 確定・子 Issue 作成）
- workflow-templates: SKILL.md のテンプレート選定ルール（本文テンプレートはタイトルを規定しない旨と参照）
- 追跡Issue起票: agentdev-issue-tracking SKILL.md、agentdev-workflow-issue SKILL.md
- 読取・書込の安全手順: agentdev-issue-management references/issue-operation-safety.md
- ローカル版: docs/designs/local/local-case-file.md、agentdev-gh local case-schema の title 値域
- PR タイトル生成（case-auto Design）: 子 Issue タイトルに依存する生成である旨の整合確認
