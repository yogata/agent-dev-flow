---
title: adversarial-review 挿入境界（req-define）
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/req-define.md から参照される詳細仕様（遅延読み込み）。 -->

# adversarial-review 挿入境界（req-define）

## adversarial-review 挿入境界（req-define）

本節は req-define への adversarial-review caller integration（REQ-015-004）の挿入境界を正典として所有する。
共通 caller integration 契約（任意性、QG/HITL 非代替、副作用禁止、accepted finding 反映責務、再 review 条件と停止条件、呼出失敗時取扱い）は [adversarial-review Design](../skills/agentdev-adversarial-review.md)「adversarial-review caller integration 共通契約」節が正であり、本節は req-define 固有の発動条件、review 対象確定位置、採用後戻り先、最初の副作用との順序のみを規定する（REQ-014-011）。

### 挿入位置（REQ-015-004）

review 挿入位置は「Scale 判断後・Decision判断前・要件doc生成前」と一意に特定可能である。
処理段階への対応付けを次に示す。

| 条件 | feature の場合 | feature 以外（bugfix, maintenance, docs_chore）の場合 |
|---|---|---|
| Scale 判断後 | Scale判断完了後 | work_type 判定完了後。Scale判断 は feature のみ実行するため、work_type 判定完了をもって意味的完成とする |
| Decision判断前 | Decision判断の判断結果がドラフト保存で永続化される前 | 同左 |
| 要件doc生成前 | 要件doc生成の成果物がドラフト保存で永続化される前 | 同左 |

review は Scale判断（feature 以外は work_type 判定）完了後、ドラフト保存の前に挿入する。
Decision判断および要件doc生成は当該時点で実行済みであるが、その成果物はドラフト保存で永続化されるまで確定扱いとならない。
review の finding は Decision判断、要件doc生成の成果物へ反映可能であり、Decision finding は Decision判断へ戻す。

### 発動条件判定 Step（REQ-015-001、REQ-015-002、REQ-015-003）

発動条件判定と review 呼出を分離する（REQ-015-001）。
発動条件判定 Step は default-on 原則（REQ-015-002、REQ-014-013）と skip 条件（REQ-015-003）を評価する。

- **default-on（原則実行）**: req-define は adversarial-review を原則実行する。要件候補に意味的決定（Scale 判断、Decision 判断、要件doc の意味内容確定）が存在する場合に発動する。
- **skip 条件**: Scale が L0 で Decision 対象がなく、意味的決定を含まない場合、adversarial-review を省略してドラフト保存へ進める（REQ-015-003）。skip 判断のためだけの新規 HITL、承認点は追加しない。
- **明示指定時の取扱い**: ユーザーが review の実施を明示的に指示した場合は、通常のユーザー指示としてその場で実行する。専用の検出、専用フラグ、draft・Issue 本文への専用保存、後工程への専用伝播、skip 条件の専用上書き処理を持たない（REQ-015-002）。

### review 呼出 Step（REQ-015-001）

発動条件判定 Step で発動と判定された場合、review 呼出 Step で adversarial-review を呼び出す（REQ-015-001）。

- **委譲契約**: adversarial-review は `semantic_review`（書き込み禁止型）として適用する（[delegation-contracts Design](../workflows/delegation-contracts.md)「adversarial-review との委譲契約接続」節）。adversarial-review 自身は対象ファイル、Issue、PR、git 操作を行わない（REQ-014-004）。
- **review 対象**: 当該 req-define で生成した要件候補（draft-data、`agreed_items`、`artifact_actions`、Decision判断結果、Scale判断結果）。
- **採用後戻り先**: accepted finding のうち Decision 関連の finding は Decision判断へ戻し再評価する。要件展開に関わる finding は該当段階（要件展開以降）へ戻す。accepted finding の対象候補への反映は req-define（呼出元）の責務である（REQ-014-006）。
- **unresolved 時の取扱い**: 未解決のユーザー判断事項が残る場合、ドラフト保存へ進まない（REQ-014-009）。工程委譲起源であるため、既存 status（pass/warn/fail/partial）に unresolved 判断事項を付加し、case-auto 経由時は user-decision-required 停止理由分類として伝播する（REQ-014-012、[lifecycle-state-machine Design](../workflows/lifecycle-state-machine.md)「adversarial-review 由来の停止信号」節）。
- **呼出失敗時**: adversarial-review の呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し、利用不能を報告した上で従来フローと既存 QG/HITL を維持する（REQ-014-010）。

### 最初の副作用（要件doc保存）との順序

review はドラフト保存より前に実行する。
ドラフト保存が req-define の最初の副作用（`.agentdev/drafts/req-draft-{topic-slug}.md` のファイル作成）であるため、review は最初の副作用の前に挿入される。
review の結果、要件候補が変更された場合は、ドラフト保存で保存されるドラフトへ反映する。
