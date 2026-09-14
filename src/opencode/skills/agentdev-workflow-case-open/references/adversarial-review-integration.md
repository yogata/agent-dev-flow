# adversarial-review 統合（case-open、adversarial-review-integration）

> 本 reference は `agentdev-workflow-case-open` SKILL.md の adversarial-review 挿入境界の実行詳細である。
> case-open の caller integration 挿入境界の正典は case-open Design「adversarial-review 挿入境界（case-open）」節であり、本 reference はその実行時手順を提供する。

## Purpose

Root Case 本文候補と Definition Package 構成案を対象に adversarial-review を default-on 原則で実行し、Root Case 作成（最初の GitHub Issue 作成）前の本質的争点を解消する。

## Input Resolution

1. SSoT 再構成: Root Case 本文候補、Definition Package 構成案（作成前のため durable state は draft-data）
2. identifier 保持: 対象 REQ 番号
3. 最小 scalar: なし
4. runtime artifact: review 対象の草案

## Preconditions

- STEP-1 の引き継ぎ判定が通過している
- Root Case 本文候補と Definition Package 構成案が生成されている

## Procedure

### 挿入境界

Root Case 本文候補と Definition Package 構成案を確定した後、**最初の GitHub Issue 作成（Root Case 作成）の前**に挿入する。

### 発動条件判定

発動条件判定と review 呼出を分離する。
case-open は adversarial-review を**原則実行する**（default-on）。

- **skip 条件**: Root Case 本文候補が合意済み入力（draft-data）の機械的投影のみで、新しい意味的決定を含まない場合、省略して STEP-2 の Root Case 作成へ進む
- **ユーザー明示指定時**: skip 条件にかかわらず必ず発動する
- **skip 判断のためだけの新規 HITL、承認点は追加しない**

### review 呼出

発動条件判定で発動と判定された場合、次の2者を対象に adversarial-review を呼び出す。

1. Root Case 本文候補
2. Definition Package 構成案

委譲契約は delegation-contracts Design「adversarial-review との委譲契約接続」節に従い、`semantic_review`（書き込み禁止型）として適用する。
adversarial-review 自身はファイル、Issue、PR、git 操作を行わない。

### 結果反映

- Root Case 本文候補に関わる finding は本文候補生成へ戻し再評価する
- Definition Package 構成案に関わる finding は構成案評価へ戻す
- accepted finding の対象候補への反映は呼出元の責務である

### 変更影響別の再実行ルール

review の結果反映で review 対象の意味内容が変更された場合、変更影響範囲に応じて次のいずれかを実行する。

| 変更影響 | 再実行対象 |
|---|---|
| Root Case 本文候補のみ変更 | 本文候補の再生成 |
| Definition Package 構成案のみ変更 | 構成案の再評価 |
| 両方が変更 | 本文候補の再生成と構成案の再評価 |
| 意味内容変更なし | 再実行不要、STEP-2 の Root Case 作成へ進む |

意味内容変更から新たな本質的争点が生じ得る場合のみ再 review を発動できる。
同一 finding を新証拠・新前提・異なる failure condition・未評価範囲なしに再起票しない。

### unresolved 判断事項

未解決のユーザー判断事項が残る場合、Root Case 作成へ進まない。
工程委譲起源であるため、既存 status（pass/warn/fail/partial）に unresolved 判断事項を付加する。

### 呼出失敗時の扱い

呼出失敗時は silent skip を禁止し、利用不能を報告した上で従来フローを維持する。

## Result

- review 結果反映（発動時: accepted finding 反映、再実行ルール適用 / skip 時: 従来フロー継続）

## Evidence

- 発動条件判定結果、review 呼出記録、findings と反映結果、再実行の実行状態

## Completion Verification

- 発動時: unresolved なユーザー判断事項が残っていないこと（残る場合は Root Case 作成へ進まない）。skip 時: skip 条件該当の根拠が記録されていること

## Resume-Idempotency

- review 実行は read-only（書き込み禁止型）であり副作用を持たない

## resume point

- 発動条件判定結果（発動 / skip）
- review 呼出結果（findings、accepted/rejected）
- 再実行ルールの実行状態
- unresolved 判断事項の有無

## 関連 Capability Skill

- `agentdev-adversarial-review`: case-open の review 呼出、3論理役割、動的レビュー戦略
