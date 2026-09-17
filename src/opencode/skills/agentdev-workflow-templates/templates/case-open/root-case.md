---
name: Root Case
about: Case の Root Issue（case-open が作成する）
labels: enhancement
---

<!-- Tracking 行配置正規形: 追跡Issueから要件化された Case Issue は、本文冒頭ブロックに `Tracking: #N` を1行で記載する（複数の元追跡Issueがある場合は `Tracking: #N, #M` 形式。case-open Design「Case Issue 本文の元追跡Issue参照形式」節参照）。追跡Issueを起源としない通常の Case Issue には Tracking 行を記載しない（元追跡Issueが判明している場合のみ case-open が記載する） -->

## 概要
<!-- 【必須】 -->

[合意済み要件の要約。機能要件、非機能要件、制約、対象外、受け入れ条件は新規に作成せず合意済み入力を反映する]

## 実行識別情報
<!-- 【必須】 -->

<!-- 実行識別情報: workflow-contracts Design「ADF 実行識別情報の記録契約」に基づく構造化識別情報セクション。
機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とし、自由文中に偶然出現する ID に依存しない。
harness 側識別子は取得可能な場合の付加情報に限定し、必須契約としない。
識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->
- adf_case: （本 Issue 自身の番号。#N 形式。Root Case 自身）
- adf_execution_unit: N/A（実行構成未確定。case-ready が execution contract 確定後に確定する）
- adf_harness_ref: （任意。harness 側識別子（OpenCode session ID 等）。取得可能な場合のみ記載し、省略できる）

## 対象 REQ
<!-- 【必須】 -->

<!-- case-open は Root Case を確立する際に対象 REQ 番号を埋め込む -->
- REQ-{NNN}: [要件タイトル]

## Definition Package
<!-- 【必須】 -->

<!-- Definition Package: case-open が壁打ち済み内容から生成し Root Case に関連付ける。
構成は definition-readiness Design に従う（要件行、Decision、Design、Issue 構成案、受入条件一式）。
realization_actions は構成要素として保持する（構造化ハンドオフ）。case-open は execution contract を確定しない -->
- 要件行: [REQ 変更後本文または所在]
- Decision: [関連 Decision 一覧（新規 Decision は proposed のまま維持）]
- Design: [関連 Design 一覧]
- Issue 構成案: [operation_units / case_open_hints 由来の構成案]
- 受入条件一式: [合意済み入力の受け入れ条件]
- realization_actions: [実現面の変更方針]

## Case 状態と次工程
<!-- 【必須】 -->

<!-- Root Case 確立後の状態は open とし、実装開始を許可しない。
execution contract 確定、Standard / Epic 最終確定、Child Issue / Wave 作成は case-ready が実行する。
Definition PR は canonical Definition に実変更がある場合のみ作成する -->
- 状態: open
- Definition PR: [作成済み: PR番号 / 不作成（実変更なし）]
- 次工程: `case-ready`

## レビュー判断
<!-- 【必須】 -->

<!-- レビュー判断: case-open が draft-data の review_dispositions を読み取り、採否判断（covered / rejected 等）を恒久証跡として転記する。転記対象がない場合は「該当なし」と記載する -->
[review_dispositions の転記内容。
各 disposition は id、disposition、reason_code、reason、evidence（path、section、checked_at_commit）を記載する。
該当なしの場合は「該当なし」]

## 補足情報（オプション）
<!-- 【任意】 -->

[その他の情報]
