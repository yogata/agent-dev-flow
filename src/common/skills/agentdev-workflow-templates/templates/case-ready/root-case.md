---
name: Root Case (case-ready)
about: Root Case 本文（case-ready が execution contract 確定と ready 遷移で更新する構造）
labels: enhancement
---

## 概要
<!-- 【必須】 -->

[case-open で確立した合意済み要件の要約を維持する]

## 実行識別情報
<!-- 【必須】 -->

<!-- 実行識別情報: v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節に基づく構造化識別情報セクション。
機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とし、自由文中に偶然出現する ID に依存しない。
case-ready は実行単位を確定した値へ更新する。
識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない -->
- adf_case: #N（Root Case 自身の番号。Epic flow では親 Epic Issue の番号）
- adf_execution_unit: standard / epic（case-ready が確定した実行単位）
- adf_harness_ref: （任意。harness 側識別子。取得可能な場合のみ記載し、省略できる）

## 対象 REQ
<!-- 【必須】 -->

<!-- case-open で埋め込んだ対象 REQ を維持する -->
- REQ-{NNN}: [要件タイトル]

## Definition Package
<!-- 【必須】 -->

<!-- case-open が生成した Definition Package の所在と構成を維持する。
構成は case-open / case-ready Design に従う -->
- 要件行: [REQ 変更後本文または所在]
- Decision: [関連 Decision 一覧と受理状態]
- Design: [関連 Design 一覧]
- Issue 構成案: [operation_units / case_open_hints 由来の構成案]
- 受入条件一式: [合意済み入力の受け入れ条件]
- realization_actions: [実現面の変更方針]
- Definition PR: [merge 済み: PR番号 / 不存在（実変更なし）]

## Execution Contract
<!-- 【必須】 -->

<!-- case-ready が canonical Definition 確定後に確定する。
各要素は合意済み Definition の投影であり、新規作成しない。
runtime-only 判断（worktree 状態、staleness、実 diff、実装結果、test 実行結果）は含めない -->
- 対象範囲: [合意済み対象範囲]
- 変更対象成果物: [成果物パス一覧]
- 関連 REQ / Decision / Design: [識別子一覧]
- 完了条件: [成果状態のチェックボックス]
- テスト戦略: [verification / pass_criteria / on_failure の3要素]
- 必須品質統制: [変更対象成果物の種別から導出した必須検証]
- scope-affecting impact candidate: [変更影響候補]
- review 発動契約: [ユーザー明示指定。指定なしは「該当なし」]
- work_type / scale / Issue structure: [case-ready が確定した値]

## Case 状態と次工程
<!-- 【必須】 -->

<!-- ready 遷移は検証対応要否の最終ゲート合格後に行う。
Epic Issue のステータス追跡テーブルの単一書き手は case-close である -->
- 状態: ready
- 実行構造: [Standard（単一 execution unit）/ Epic（Child Issue 一覧と Wave / 依存構造。Epic Issue 番号）]
- 次工程: `case-run`

## レビュー判断
<!-- 【必須】 -->

<!-- case-open が転記した review_dispositions を維持する。
Epic flow では case-ready が Epic 構成確定後に Epic Issue / 子 Issue 本文へ転記する。
転記対象がない場合は「該当なし」 -->
[review_dispositions の転記内容。該当なしの場合は「該当なし」]

## 現在地
<!-- 【必須】 -->

<!-- 現在地: Case Issue 工程記録モデル（workflows/issue-lifecycle-records Design）に基づく工程記録セクション。
工程、進行状態、次の行動、担当役割、停止・待機理由、最新記録参照を読み取れる内容を保持する。
進行状態は 未着手 / 実行中 / 待機 / 終了 の4値で表示し、待機には理由と次の行動を、終了には完了・中止の区別を付す。
進行状態は正規状態と記録契機から写像される表示であり、独立して更新・判断される第二の進行管理を構成しない。
Root Case では進行状態は「Case 状態と次工程」セクションの状態と記録契機から写像される。
着手以降、記録契機（着手、引き渡し、停止、再開、判断変更、完了）に応じて case-auto 等の進行スキルとコードが更新する。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->

- 工程: case-ready
- 進行状態: 未着手
- 次の行動: [次に実行する行動]
- 担当役割: [実行担当 / 取りまとめ / 判定主体のいずれか]
- 停止・待機理由: 該当なし
- 最新記録参照: 該当なし

## 結果
<!-- 【必須】 -->

<!-- 結果: Case Issue 工程記録モデル（workflows/issue-lifecycle-records Design）に基づく工程記録セクション。
成果物、最終判定とその根拠、残件の扱いを読み取れる内容を保持する。
完了判定は case-close 等の判定主体が完了条件と証拠を照合して確定し、実行の申告だけで完了扱いとしない -->

- 成果物: 該当なし
- 最終判定と根拠: 該当なし
- 残件の扱い: 該当なし

## 補足情報（オプション）
<!-- 【任意】 -->

[その他の情報]
