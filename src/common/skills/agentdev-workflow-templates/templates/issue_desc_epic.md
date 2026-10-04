---
name: Epic Issue Description
about: Epic（複数子 Issue を実行構成表で束ねる Root Case）本文テンプレート
labels: enhancement, epic
---

## 目的
<!-- 【必須】 -->

[作業群で達成する成果]

## 対象範囲・対象外
<!-- 【必須】 -->

### 対象要件
<!-- 合意済みの要件とその範囲。REQ ファイルの存在を必須としない -->

- [対象要件を記述]

### 対象外
- [対象外の事項。該当がない場合は「該当なし」]

## 実行構成
<!-- 【必須】 -->

<!-- 実行構成表正規形（agentdev-epic-tracker と整合）: 本文に一つだけ存在する。
Wave = 所属 Wave 番号、Issue = #N のみ（OU ID 等の付記は前提列または子 Issue 本文へ）、
前提 = 意味的依存（依存先 Issue。なしは -）、状態 = 子状態4値（pending / completed / blocked / failed）。
初期値は pending。更新は取りまとめ（case-close と工程記録の取りまとめ）が per-Epic の単一書き手として行う。
ready / running / Wave 状態 / 状態別件数は本文へ保存しない。PR 番号・URL は状態列に付記せず、
子 Issue の結果・PR 自体から取得する。子 Issue タイトルは Epic 実行構成と同期し、
タイトル書式は workflows/issue-title-policy Design（Issue タイトル記述規則）を参照する（テンプレートは書式を複製しない） -->
| Wave | Issue | 前提 | 状態 |
|------|-------|------|------|
| 1 | #{child_issue} | - | pending |

## 完了条件
<!-- 【必須】 -->

<!-- Epic の完了判定は配下子 Issue の結果と本表の状態確定に基づき、
case-close が完了条件と証拠を照合して確定する。子 Issue 個別の検証項目は各子 Issue 本文の完了条件が所有する -->
- [ ] [Epic 全体の完了判定条件（検証方法: ...、合格条件: ...）]

## 進行状況
<!-- 【必須】 -->

<!-- 進行状況: Case Issue 工程記録モデル（workflows/issue-lifecycle-records Design）に基づく工程記録セクション。
正規状態（open、ready、running、blocked、review、closed、cancelled の7値域。値の正は workflows/v4-lifecycle-state-machine Design）と開始・終了日時のみを保持する。表示用の進行状態4値、現在工程、担当役割、次の行動、最新記録参照は保存しない。
開始日時は初めて実装または検証に実着手した時刻であり、停止・再開で上書きしない。
終了日時は完了または中止確定時のみ設定する。 -->

- 正規状態: open
- 開始日時: N/A（case-run での初回実装・検証着手時に設定）
- 終了日時: N/A
