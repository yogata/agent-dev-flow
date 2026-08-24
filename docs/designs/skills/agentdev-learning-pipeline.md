---
title: `agentdev-learning-pipeline` Design
status: accepted
created: 2026-06-21
updated: 2026-08-15
---
<!-- ADF-COVERS(implementation): REQ-003-024, REQ-038-001, REQ-038-002, REQ-038-005 -->

# `agentdev-learning-pipeline` Design

## 目的

Learning pipeline（capture → promote）の共通知識。
schema、分類基準、評価ディメンション、prune 方針を定義する。

## 適用対象

- learning-promote の実行時参照
- pipeline の拡張、変更時の基準確認

## 提供する判断、操作

- inbox entry schema（13フィールド）
- 問題クラス分類基準
- 8軸評価ディメンション
- evaluation-report schema
- prune 方針（昇華時必須）
- 処分区分（11処分区分 + duplicate）
- artifact lifecycle（inbox → deferred → promoted）。`deferred.md` は deferred カテゴリ（11廃棄判定カテゴリの1つ）のエントリだけでなく、未処理・保留中・再評価対象のエントリも保持する多状態の living pool である
- 構造改善先分類（学びの反映先評価。REQ-038-005）

## 構造改善先分類

learning pipeline は学びを保存するだけでなく、再発防止のためにどこへ反映すべきかを評価して分類する（REQ-038-005）。
構造改善先の評価候補は次の7分類とする。

1. 既存 REQ / Decision / Design への反映
2. Skill の改善
3. 決定論的な検査・ガードレールへの移管
4. 既存処理手順の改善
5. 通常の Issue による修正
6. 重複・陳腐化した知識の削除
7. 現時点では反映不能なものの保留

learning-promote はこれらの反映先を直接変更しない。
learning-promote → backlog-review → RU → req-define の承認・要件化経路を維持し、構造改善先の分類結果を後続工程へ渡す。

## 参照する references

- なし（SKILL.md 本文に集約）

## 現在の動作

- capture と promote の責務分界を明確化（capture は独立スキル `agentdev-learning-capture`）
- promote が本スキルを参照して schema、基準を取得
- 既存対策優先（新規 X 化より既存 X へ反映）

## 対象外

- `agentdev-learning-capture`（独立スキル）
- req-define（参照のみ）
- 一般的なコマンド作成

## 検証観点

- 分類の整合性
- 8軸スコアの精度
- schema 遵守
- prune ポリシーの適用（昇華時必須）

## See Also

- [agentdev-learning-capture.md](agentdev-learning-capture.md)
- [agentdev-backlog-integration.md](agentdev-backlog-integration.md)
- [commands/learning-promote.md](../commands/learning-promote.md)
- REQ-038（学習パイプライン（learning））

## adversarial-review 候補判断と内部挿入

本節は learning-promote における review 候補判断基準と内部手続きを正典として所有する（ACT-SPEC-013、REQ-015-007）。
learning-promote の発動条件、挿入位置、戻り先、Step 6 戻しループは learning-promote command Design「adversarial-review 挿入境界（learning-promote）」節が正規所有し、本節は再定義しない。
共通 caller integration 契約（任意性、副作用禁止、accepted finding 反映、再 review 条件と停止条件、呼出失敗時取扱い）は `agentdev-adversarial-review` Design（REQ-014）が正規所有する。
本節は learning-promote が参照する本 skill 内部の候補判断、呼出タイミング、evaluation-report 反映、Step 6 戻しループの実装詳細を所有する。

### 候補判断基準

review 候補は learning-promote command Design「発動条件判定 Step」が定める条件を満たす場合に確定する。
本 skill は候補確定に必要な入力（正規化結果、問題クラス分類、8軸評価スコア、廃棄判定、既存対策照合結果）を evaluation-report.md へ集約し、候補判断が evaluation-report.md のみを参照して完結するよう保証する。
候補判断基準は次のとおり。

- ユーザーが review を明示要求していること（REQ-015-002）。明示要求がない場合は候補を確定しない
- evaluation-report.md が Step 6 で生成・更新済みであり、Step 7（廃棄判定）と Step 8（既存対策確認）の結果が反映されていること
- review 対象が未確定の判定要素を含まないこと。inbox → deferred 移動、prune、promoted 成果物生成等の不可逆処理が実行されていないこと

### 内部手続き

#### 候補確定位置

候補は Step 8（既存対策確認）完了直後、Step 9（ユーザーへの判定結果提示）前に確定する。
候補確定位置は learning-promote command Design「発動条件判定 Step」と同一位置である。
候補確定後、review 呼出 Step へ進む。

#### 呼出タイミング

呼出タイミングは候補確定直後であり、Step 9 へ進む前である。
review 対象は evaluation-report.md のみとし、handoff.md、promoted/、deferred.md への反映前とする。
この順序により、accepted finding の反映結果が evaluation-report.md へ集約され、後続の不可逆処理（Step 13 deferred 移動、Step 14 prune、Step 15 commit/push）へ混入しない。

呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止する（REQ-014-010）。
learning-promote は利用不能を報告し、従来フロー（Step 9 ユーザーへの判定結果提示以降）と既存 HITL（Step 10 ユーザー承認）を維持する。

#### evaluation-report 反映

accepted finding は learning-promote が責任を持って判定対象（正規化結果、問題クラス分類、8軸評価スコア、廃棄判定、既存対策照合結果）へ反映する（REQ-014-006）。
adversarial-review 自身は反映を行わない。
反映結果は evaluation-report.md へ集約し、Step 9 の提示内容、Step 13 の deferred 移動、Step 14 の prune、promoted 成果物が反映後の evaluation-report.md と整合するよう維持する。

#### Step 6 戻しループ

accepted finding を反映し、review 対象の意味内容が変更された場合は Step 6 へ戻し、関連 Step を再実行する（REQ-015-007）。
ループの実行手続きは次のとおり。

1. accepted finding を判定対象へ反映する（REQ-014-006）
2. Step 6（evaluation-report 生成、更新）へ戻り、反映結果を evaluation-report.md へ集約する
3. Step 7（廃棄判定、11カテゴリ + duplicate）を再実行する
4. Step 8（既存対策確認）を再実行する
5. 発動条件判定 Step を再実行し、review 呼出 Step を再実行する（REQ-014-007）。再 review の発動は反映により review 対象の意味内容が変更され、新たな本質的争点が生じ得る場合にのみ許容する
6. 再 review 停止条件（REQ-014-008）を満たした時点でループを離脱し、Step 9 へ進む

ループ中に unresolved な本質的争点またはユーザー判断事項が残る場合、Step 9（判定結果提示）、Step 10（ユーザー承認）、Step 13（deferred 移動）、Step 14（prune）、Step 15（commit/push）等の不可逆処理へ進まない（REQ-014-009）。
unresolved は既存の HITL（Step 10 ユーザー承認）または blocker 扱いへ振り向ける。
adversarial-review 自体を恒久的な統制ゲートとしない。

### 正規所有者と参照関係

| 意味 | 正規所有者 |
|---|---|
| learning-promote の発動条件、挿入位置、戻り先、Step 6 戻しループ（command 視点） | learning-promote command Design（ACT-SPEC-009） |
| 候補判断基準、内部手続き（候補確定位置、呼出タイミング、evaluation-report 反映、Step 6 戻しループの実装詳細） | 本 Design（agentdev-learning-pipeline domain skill Design、ACT-SPEC-013） |
| 共通 caller integration 契約 | `agentdev-adversarial-review` Design（REQ-014） |

