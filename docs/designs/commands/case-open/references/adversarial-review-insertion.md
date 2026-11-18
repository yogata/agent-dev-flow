---
title: adversarial-review 挿入境界（case-open）
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-open.md から参照される詳細仕様（遅延読み込み）。 -->

# adversarial-review 挿入境界（case-open）

## adversarial-review 挿入境界（case-open）

本節は case-open への adversarial-review caller integration（REQ-015-009）の挿入境界を case-open 固有の側面で所有する。
共通 caller integration 契約（任意性、QG/HITL 非代替、副作用禁止、accepted finding 反映責務、再 review 条件と停止条件、呼出失敗時取扱い）は [adversarial-review Design](../skills/agentdev-adversarial-review.md)「adversarial-review caller integration 共通契約」節が正であり、本節は case-open 固有の挿入位置、発動条件、変更影響別再実行ルール、最初の副作用との順序のみを規定する（REQ-014-011）。

### 挿入位置（REQ-015-009）

review 挿入位置は「Root Case 本文候補と Definition Package 構成案確定後・最初の GitHub Issue 作成（Root Case 作成）前」である。
REQ-030 への縮小に伴い、かつて case-open が構成していた execution structure（Epic / Wave / Issue 構成）と完了条件（QG-2 検証）の配置は case-ready に確定している（QG-2 の配置の正は quality-gate-model Design と agentdev-quality-gates の QG-2 reference の配置の表。2026-11-17 の利用者判断）。そのため review 対象は case-open が現に構成する2者である。

### 発動条件判定 Step（REQ-015-001、REQ-015-002、REQ-015-003）

発動条件判定と review 呼出を分離する（REQ-015-001）。
発動条件判定 Step は default-on 原則（REQ-015-002、REQ-014-013）と skip 条件（REQ-015-003）を評価する。

- **default-on（原則実行）**: case-open は adversarial-review を原則実行する。Root Case 本文候補、Definition Package 構成案のいずれかに意味的決定が存在する場合に発動する。
- **skip 条件**: Root Case 本文候補が合意済み入力（draft-data）の機械的投影のみで新しい意味的決定を含まない場合、adversarial-review を省略して Root Case 作成へ進める（REQ-015-003）。skip 判断のためだけの新規 HITL、承認点は追加しない。
- **明示指定時の取扱い**: ユーザーが review の実施を明示的に指示した場合は、通常のユーザー指示としてその場で実行する。専用の検出、専用フラグ、Issue 本文への専用保存、後工程への専用伝播、skip 条件の専用上書き処理を持たない（REQ-015-002）。

### review 呼出 Step（REQ-015-001）

発動条件判定 Step で発動と判定された場合、review 呼出 Step で adversarial-review を呼び出す（REQ-015-001）。

- **委譲契約**: adversarial-review は `semantic_review`（書き込み禁止型）として適用する（[delegation-contracts Design](../workflows/delegation-contracts.md)「adversarial-review との委譲契約接続」節）。adversarial-review 自身は対象ファイル、Issue、PR、git 操作を行わない（REQ-014-004）。
- **review 対象**: Root Case 本文候補、Definition Package 構成案の2者。
- **採用後戻り先**: Root Case 本文候補に関わる finding は本文候補生成へ戻し再評価する。Definition Package 構成案に関わる finding は構成案評価へ戻す。accepted finding の対象候補への反映は case-open（呼出元）の責務である（REQ-014-006）。
- **unresolved 時の取扱い**: 未解決のユーザー判断事項が残る場合、Root Case 作成へ進まない（REQ-014-009）。工程委譲起源であるため、既存 status（pass/warn/fail/partial）に unresolved 判断事項を付加し、case-auto 経由時は user-decision-required 停止理由分類として伝播する（REQ-014-012、[lifecycle-state-machine Design](../workflows/lifecycle-state-machine.md)「adversarial-review 由来の停止信号」節）。
- **呼出失敗時**: adversarial-review の呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し、利用不能を報告した上で従来フローと既存 QG/HITL を維持する（REQ-014-010）。

### 変更影響別の再実行ルール（REQ-014-007）

review の結果反映で review 対象の意味内容が変更された場合（REQ-014-007）、変更影響範囲に応じて次の4パターンのいずれかを実行する。

| 変更影響 | 再実行対象 | 根拠 |
|---|---|---|
| Root Case 本文候補のみ変更 | 本文候補の再生成 | 本文候補の意味内容を最新化する |
| Definition Package 構成案のみ変更 | 構成案の再評価 | 構成案の意味内容を最新化する |
| 両方が変更 | 本文候補の再生成と構成案の再評価 | 両方を再実行する |
| 意味内容変更なし | 再実行不要 | review 対象の意味内容に変更がないため、Root Case 作成へ進む |

4パターンのいずれかを完了した後、意味内容変更から新たな本質的争点が生じ得る場合のみ再 review を発動できる（REQ-014-007）。
同一 finding を新証拠・新前提・異なる failure condition・未評価範囲なしに再起票しない。
再 review の停止条件（REQ-014-008）を満たした場合、Root Case 作成へ進む。

### 最初の副作用（Root Case 作成）との順序

review は最初の GitHub Issue 作成呼び出し（Root Case 作成）より前に実行する。
Root Case 作成が case-open の最初の副作用（GitHub API 呼び出しによる Issue レコード生成）であるため、review は最初の副作用の前に挿入される。
review の結果、Root Case 本文候補、Definition Package 構成案のいずれかが変更された場合は、変更影響別の再実行ルールに従い、Root Case 作成前に反映を完了する。

### 正規所有者マトリックス参照

本節と adversarial-review Design「adversarial-review caller integration 共通契約」節（REQ-014-011）、delegation-contracts Design「adversarial-review との委譲契約接続」節、lifecycle-state-machine Design との間で意味の重複、矛盾を生じない。
case-open command 固有の挿入境界（発動条件、挿入構造、変更影響別再実行ルール、順序）のみを本節が所有し、共通 caller integration 契約、adversarial-review 自身の振る舞い契約、再 review 条件と停止条件の詳細は各正規所有者 Design を正とする。
