---
title: ADF v4 ライフサイクル状態機械（二層状態モデル・階層合成・内部 lifecycle 対応）
status: draft
created: 2026-09-19
updated: 2026-09-19
---

# ADF v4 ライフサイクル状態機械（二層状態モデル・階層合成・内部 lifecycle 対応）

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。

## 二層状態モデル

v4 ライフサイクル状態は、durable state enum（永続状態）と runtime 実行状態（case 実行内の一時状態、Runtime lifetime）の 2 層で構成する。

- durable state enum: Case/子Issue 状態、Definition lifecycle、Design status、Decision status、RU/採用済み成果物/draft lifecycle 等の永続状態。遷移は成立条件 (predicate) と遷移後状態の権威記録先を持つ
- runtime 実行状態: case 実行内の一時状態（ready/running 等）。永続状態に書き込まず、実行終了時に消滅する。v3 の非永続化契約（子Issue の ready/running は永続状態に書き込まない）を継承する
- 2 層の写像: runtime 実行状態は durable state enum の遷移中の位置として解釈され、独立した状態空間を持たない

単一の巨大状態機械ではなく、Case 実行に関わる状態機械族と射影の構成として記述する（DEC-015/REQ-005-026 の状態機械選択適用原則の継承）。

## 階層合成（子 = 実状態、上位 = 導出投影）

- 子 Issue 状態（pending/completed/blocked/failed/delegation-unavailable の永続系）を実状態とする
- Wave 状態は保存せず、Wave 内子Issue 状態から導出する
- Epic 状態・Root Case の実行状況は、子Issue 群・Wave 群からの進捗集約関数による導出投影とする
- 並列 Wave で子状態が混在する Case（一部 Wave 完了・他 Wave 未着手等）は、Root 状態を単一 enum 値でなく合成状態（子状態群の組）として表現する

## 状態と遷移の定義体系

各 durable 状態遷移は次の要素で定義する。

- 遷移 predicate は deterministic gate（機械検証可能。本 Design が所有）と semantic gate（Skill の意味判断。Quality/Verification/Evidence/Gate モデル（v4-quality-gate-model Design）が所有）に分離する
- deterministic gate predicate を Gate モデルの唯一の接続点として宣言する（Quality 段階での Gate 再導出はこの接続点に接続する）
- 遷移後状態の権威記録先を 1 つ定め、他の記録は投影とする（DEC-038 の 1 権威原則）
- 遷移の合法性（禁止遷移を含む）は backend 抽象の論理規則として定義し、物理表現（GitHub の Issue 本文・ラベル・close reason、ローカル版の Issue ファイル）への写像は backend 別の物理写像表で与える

## 完了経路と result 状態の一般化

完了状態は完了経路 (route) attribute（pr: PR 作成による完了、verify: verify-only closure による完了）を持つ。これにより case-run result 4 状態（completed-pr/blocked/failed/delegation-unavailable）の v3 契約を一般化形で被覆する。v3 result 契約の置換・改名は後続段階が所有する。

## 異常・例外状態と回復経路

- Definition PR の isDraft 異常: 正規 lifecycle 外の例外状態として扱い、検出時に blocked へ遷移する
- delegation-unavailable の後方遷移: 実行未試行として子Issue を pending へ戻す後方遷移とする。試行の有無は runtime 制御ループ側の属性で区別する
- blocked の resume: resume は状態遷移ではなく入口関数とし、resume_command 属性（req-define/case-revise/case-ready/case-run/case-close）を持つ。blocked から closed への直接遷移は禁止する（v3 local 契約の継承）
- user-decision-required: case-run result enum の状態ではなく、既存結果に付随する停止理由分類として維持する（REQ-014-012 準拠）
- 再試行カウンタ（コンフリクト解消 Level 2/3 の試行回数）と外部状態ポーリング（mergeable UNKNOWN 等）は状態機械の遷移 predicate ではなく runtime 制御ループとして区別し、ADF v4 Runtime 実行モデル Design 側に位置づける

## v3 command と内部状態遷移の対応表

| v3 command | v4 内部状態遷移（写像） |
|---|---|
| case-open | Case established/defining（Root Case 確立、Definition Package 生成、Definition PR 作成） |
| case-ready | defining -> ready（Definition 受入・merge、execution contract 確定、ready 遷移、draft 削除） |
| case-run | ready -> running（実行委譲、result 受領） |
| case-close | running -> closing -> closed（QG-4、PR マージ、チェックボックス確定、クローズ） |
| case-revise | 定義変更ループの再入口（Amendment PR -> case-ready 相当への復帰） |

本表は写像であり、v3 command 定義の置換・廃止を実行するものではない。公開 UX は 2 中心フロー（req-define -> case-auto、backlog-auto -> req-define -> case-auto）のままである（DEC-033）。

## 部分ライフサイクルの位置づけ（v3 現行状態の記述に限定）

次の v3 現行状態を全体像の部分ビューとして位置づける。記述は v3 現行状態に限定し、後続 Sequence 段階での再定義を先取りしない。

- Definition PR lifecycle（通常 PR、isDraft 確認、merge、Amendment PR）
- Design status（draft/accepted、frontmatter 欠落時の暗黙 accepted 扱い）
- Decision status（proposed/accepted/superseded/deprecated）
- RU/採用済み成果物/draft lifecycle（draft -> Definition Package -> 削除/保持）
- 子Issue 実行状態（永続系 5 状態）と case-run result 4 状態、verify-only closure

統合対象外の関連状態空間として、追跡Issue 6 状態（created/in-discussion/on-hold/ready/resolved/closed）を挙げる。追跡Issue lifecycle は Case 実行ライフサイクルの外の独立状態空間であり、本機械の部分ビューに含めない。

## v3 状態関連 Design の処遇（planned supersede 記録）

v3 状態関連 Design 9 件の処遇（planned supersede・実行段階）の正本は foundations/v3-v4-crosswalk.md の references/crosswalk-inventory.md（Design 表の supersede 行）が所有する。本 Design は各 v3 Design を一般化契約として被覆する関係のみを所有する。
## enum 整合の機械検査可能性

状態 enum とその記録表現（Epic 本文ステータス表、Issue 本文状態記載、テンプレート）の間に不整合が生じないよう、enum 値の定義表を正とし、記録側表現は enum 値の写像であることを宣言する（v3 運用で観測された表現ドリフトの再発防止）。
