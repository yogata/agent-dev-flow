---
title: learning-promote SPEC
status: accepted
created: 2026-06-21
updated: 2026-08-19
---

# learning-promote SPEC

## 目的

inbox.md から正規化、分類、8軸評価、廃棄判定、既存対策確認、HITL 承認を経て採用済み成果物を生成する。
`.opencode/` 直接反映は禁止。
backlog-review 経由で RU 化する。

**昇華可能性評価、無条件自動REQ化禁止（v2:REQ-0155-005）**: 各問題クラスについて恒久契約（REQ/Decision/SPEC）への昇華可能性を評価し、昇華可能な知見のみ `promoted/` へ出力する。
無条件の自動REQ化は禁止し、学びは backlog-review → req-define → req-save の昇華経路を経て初めて REQ 化される。
昇華不能な知見は `deferred.md` の living pool で維持する。
`deferred.md` は deferred カテゴリ（11廃棄判定カテゴリの1つ）のエントリだけでなく、未処理・保留中・再評価対象のエントリも保持する多状態の living pool である。

## 変更種別分類

learning 成果物から RU へ引き継ぐ変更種別を定義する（REQ-001-033、REQ-001）。
learning-promote は採用済み成果物を生成する際、各問題クラスに基づき次の8変更種別のいずれかを付与する。
変更種別は分類根拠フィールド `change_nature` として RU へ伝播され、req-define が REQ 拡張可否を判定する入力となる。

### 変更種別と REQ 拡張可否

| 変更種別 | 内容 | REQ 拡張候補 |
|---|---|---|
| new_user_requirement（新しい利用者要求） | 既存REQ が要求を保持していない新しいステークホルダー要求 | ○（REQ 作成または拡張） |
| external_contract_change（外部契約変更） | 利用者から見える外部契約の変更 | ○（REQ 作成または拡張） |
| variation_addition（バリエーション追加） | 既存要求を満たすバリエーション追加 | ×（SPEC 拡張） |
| edge_case（エッジケース） | エッジケース対応 | ×（SPEC 拡張） |
| parameter_adjustment（パラメータ調整） | retry 回数、timeout、閾値、重み等の調整 | ×（パラメータSPEC 拡張） |
| nonconformance_fix（不適合修正） | 既存REQ/SPEC への不適合修正 | ×（SPEC 修正） |
| internal_restructuring（内部再構成） | 外部挙動を変えない内部再構成 | ×（SPEC 再構成） |
| document_correction（文書訂正） | 文書記述の訂正 | ×（文書修正） |

REQ 拡張を候補とするのは `new_user_requirement` または `external_contract_change` のみ。
それ以外は既存 REQ が要求を既に保持している限り REQ を拡張しない（REQ-001-033）。
判定の最終確定は req-define が行う（REQ-004-087）。

### 分類根拠の引き継ぎ

learning-promote は change_nature と併せて、observed_evidence（根拠となる観測事実）、target_stakeholder、user_visible_change 等の分類根拠（`../responsibilities/artifact-contracts.md`「分類根拠伝播契約」参照）を RU へ伝播させる。
分類根拠は soft-contract（DEC-003）とし、欠落時は unknown 既定値で警告する。

## HITL 境界、自動実行ルール（REQ-003-003/004/005/006/007）

- **HITL は「判断の確定」に限定**（REQ-003-003）: 判定結果の提示でのユーザー承認のみが HITL 対象。承認後の保存、移動、prune、commit/push は自動実行する。
- **判断確定後の自動実行**（REQ-003-004）: ユーザー承認後、git pull / 採用済み成果物生成 / deferred 移動 / prune / commit-push は追加確認なしで自動実行する。
- **破壊的変更の明示承認維持**（REQ-003-005）: inbox.md 全体の強制クリア、大量エントリの一括削除等の破壊的操作は、判定結果承認とは別に明示的な承認を求める。
- **prune 自動実行条件**（REQ-003-006）: staged（採用済み成果物に根拠保存済み）/ rejected / duplicate のエントリは、ユーザー承認と同時に prune 承認済みとみなし追加確認なしで削除する。
- **prune 非対象**（REQ-003-007）: deferred / 未処理のエントリは必ず残す。誤削除防止のため auto-prune 対象から除外する。

## 入力

- `.agentdev/learning/inbox.md`（必須、未処理学びエントリ）
- `.agentdev/learning/deferred.md`（任意、過去エントリ参照）

## 出力

- `.agentdev/learning/evaluation-report.md`（8軸評価レポート）
- `.agentdev/learning/promoted/{category}-{name}.md`（採用済み成果物、フラット構造）
- `.agentdev/learning/deferred.md`（inbox 移動分追記）
- `.agentdev/learning/inbox.md`（ヘッダーのみクリア）

## 副作用

- git commit/push: `.agentdev/learning/` 配下のみ（明示パスステージング、v2:REQ-0137-002/005）
- 実行前同期: `git pull --ff-only`
- 昇華時 prune: 自動実行（REQ-003-006、staged/rejected/duplicate のみ。deferred/未処理は非対象 REQ-003-007）
- `.opencode/` 直接反映: 禁止（G01）

## 現在の動作

6 フェーズ構成。
各フェーズの詳細手順は Workflow Skill（`agentdev-workflow-learning-promote`）が正規情報源である。

- フェーズ1 inbox スキャン: inbox.md 読込、deferred.md 読込
- フェーズ2-5 Normalize→Classify→Evaluate→Dispose→HITL:
  - 正規化
  - 問題クラス分類
  - 8軸評価
  - evaluation-report 生成
  - 廃棄判定（11カテゴリ + duplicate）+ 昇華可能性評価（v2:REQ-0155-005）。無条件の自動REQ化を禁止し、昇華不能な知見は `deferred.md` の living pool で維持する
  - 既存対策確認（G05: 既存対策優先、新規 X 化より既存 X へ反映）
  - 結果提示
  - ユーザー承認（G06: 判定、prune にユーザー承認必須）
- フェーズ6 実行 git 操作:
  - git pull
  - 採用済み成果物生成
  - deferred 移動（原子的）
  - 昇華時 prune
  - commit/push
  - 完了報告

## 所有関係と委譲

- public contract（公開目的、入力、出力、副作用、安全境界、承認・HITL 境界、停止状態、外部から意味のある順序）の正規文書は本 SPEC であり、command 定義（`src/opencode/commands/agentdev/learning-promote.md`）はその実行時投影である（DEC-010）。
- workflow 実装本体（フェーズ構成、内部手順、reference 構成）は Workflow Skill（`agentdev-workflow-learning-promote`）が所有し、本 SPEC はこれらを複製しない。
- Workflow Skill の単独起動防止（soft guard）は Workflow Skill description の DO NOT USE FOR トリガーにより実効する（command 定義本文に soft guard 宣言節を持たない構成である）。
- Capability Skill は See Also 記載のとおり名レベルで参照し、その内部構造へ依存しない。

## 参照する横断 SPEC

- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（Capture 境界）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（採用済み成果物 lifecycle）

## 自律確定の判定位置とHITLフォールバック（新規セクション）

本節は learning-promote における自律確定の判定位置とHITLフォールバックの実行詳細を所有する。判断確定の境界は REQ-003-055 の共通原則に従い、詳細判定表は横断契約SPEC（workflows/workflow-contracts.md「promote系判断確定とHITL境界」節）が集約所有する（本 SPEC と Workflow Skill は同一内容を重複保持しない）。

### 8軸評価・廃棄判定・昇華可能性・既存対策確認後の自律確定判定の挿入位置

問題クラス分類、8軸評価、廃棄判定、昇華可能性、既存対策との関係の評価を経て、取得可能な根拠で処置を一意に確定できる学習項目はユーザー承認なしで確定する（REQ-038-002）。最終確定は、ユーザー判断が必要な項目についてのみユーザーの判断を挟む確定ステップを経る（REQ-038-003）。

### 部分自律確定の実行手順

同一実行内に自律確定可能項目とユーザー判断必要項目が混在する場合、未決項目に依存しない項目を先行確定し、ユーザー判断必要項目のみ HITL 対象とする（REQ-003-056）。

### deferred・未処理自動削除禁止の安全境界維持

deferred・未処理項目を自動削除しない既存の安全境界は維持する（REQ-003-024）。自律確定は当該安全境界を迂回しない。

### 自律確定項目の報告形式

判定結果、主要根拠、HITL不要と判断した理由は evaluation-report 等の既存成果物を優先利用して報告し、新規永続成果物を必須としない。

## 対象外

- `.opencode/` 直接反映（G01）
- case-run への直接受け渡し（G03、backlog-review 経由のみ）
- raw learning item の再分類（G04）
- 管理用ファイル（elevation-ledger.md 等）の生成（G07）

## 検証観点

- evaluation-report.md は本コマンドが生成、管理（G02）
- 既存対策優先（G05）: 新規 X 化より既存 X へ反映
- ユーザー承認必須（G06）: 判定、prune

## 停止状態

- ユーザー承認（判定、prune）を得るまで実行フェーズへ進まない（G06）。
- adversarial-review 審議で unresolved な本質的争点が残る場合（ユーザー承認、deferred 移動、prune 等の不可逆処理へ進まず停止する、REQ-014-009）。
- 実行前同期（`git pull --ff-only`）失敗時、push 失敗時（エラーを報告して停止する）。

## See Also

- [backlog-review.md](backlog-review.md)（後続コマンド（RU 生成））
- `agentdev-workflow-learning-promote` skill（workflow 実装本体）
- `agentdev-learning-pipeline` skill（全判定基準、スコアリングルール、提示形式、承認フロー）
- `agentdev-learning-capture` skill（capture 層（独立スキル））
- REQ-038（学習パイプライン（learning））

## adversarial-review 挿入境界（経路D）

本節は learning-promote 経路D の review 挿入境界を正典として所有する（REQ-015-007）。
共通 caller integration 契約（任意性、副作用禁止、accepted finding 反映、再 review 条件と停止条件、呼出失敗時取扱い）は `agentdev-adversarial-review` SPEC「adversarial-review caller integration 共通契約」節（REQ-014）が正規所有し、本節は再定義しない。
本節は経路D 固有の発動条件、挿入位置、戻り先、evaluation-report 更新戻しループのみを所有する。

### 発動条件判定 Step と review 呼出 Step の分離（REQ-015-001/002/003）

経路D は発動条件判定と review 呼出を分離する。
分離することで、skip 条件該当時は review 呼出を迂回して従来フロー（既存対策確認 → 判定結果提示）を維持する（REQ-015-003）。

#### 発動条件判定 Step

発動条件は既存対策確認の完了直後、ユーザーへの判定結果提示の前に判定する（REQ-015-007）。
この位置は deferred 移動、prune、commit/push 等の不可逆処理に先立つ。

learning-promote は adversarial-review を原則実行する（default-on、REQ-015-002）。
発動条件は次のいずれも満たすこととする。

- 判定対象（正規化済エントリ、問題クラス分類、8軸評価、廃棄判定、既存対策照合結果）が evaluation-report.md へ反映済みであること
- skip 条件（後述）に該当しないこと

#### skip 条件とユーザー明示指定（REQ-015-002、REQ-015-003）

- **skip 条件**: 次のいずれかに該当する場合、adversarial-review を省略して従来フローを継続できる（REQ-015-003）。skip 判断のためだけの新規 HITL、承認点は追加しない。
  - inbox.md エントリが1件のみで既存対策との重複が確実（新規性なし、廃棄判定確定）の場合
  - inbox.md 空（処理対象なし、inbox スキャンで終了）の場合
- **ユーザー明示指定時の必須実行**: ユーザーが review を明示的に要求した場合、skip 条件の該当にかかわらず必ず発動する（REQ-015-002）。ただし判定対象が evaluation-report.md へ反映済みであることは引き続き必須とする。

adversarial-review を新規必須工程、QG、承認ゲートとして扱わない。
skip 条件該当時は従来フローを維持する（REQ-015-003）。

#### review 呼出 Step

発動条件が成立した場合のみ、既存対策確認と判定結果提示の間に review 呼出を実行する。
review 呼出は evaluation-report.md の判定結果（正規化、問題クラス分類、8軸評価、廃棄判定、既存対策照合）を review 対象として渡す。
呼出失敗時（スキル不在、起動異常、timeout 等）は silent skip を禁止し、利用不能を報告した上で従来フローと既存 QG/HITL を維持する（REQ-014-010）。

### review 反映時の evaluation-report 更新戻しと関連 Step 再実行（REQ-015-007）

review で accepted finding が提示され、呼出元が判定対象へ反映した場合、意味内容が変更されたときは evaluation-report.md の更新へ戻し、関連 Step を再実行する。
手続きは次のとおり。

1. accepted finding を判定対象（正規化結果、問題クラス分類、8軸評価、廃棄判定、既存対策照合）へ反映する（REQ-014-006）。反映は呼出元の責務であり、adversarial-review 自身は行わない
2. 反映結果で evaluation-report.md を更新するため evaluation-report 生成へ戻る
3. evaluation-report 生成（更新）→ 廃棄判定 → 既存対策確認 → 発動条件判定 → review 呼出の順に再実行する

再 review の発動は、反映により review 対象の意味内容が変更され、新たな本質的争点が生じ得る場合にのみ許容する（REQ-014-007）。
新証拠、新前提、異なる failure condition、未評価範囲のいずれも伴わない同一 finding の再起票を禁止する。
再 review の停止条件（REQ-014-008）を満たした時点でループを離脱し、判定結果提示へ進む。

unresolved な本質的争点またはユーザー判断事項が残る場合、判定結果提示、ユーザー承認、deferred 移動、prune、commit/push 等の不可逆処理へ進まない（REQ-014-009）。
ただし adversarial-review 自体を恒久的な統制ゲートとしない。
unresolved は既存の HITL（ユーザー承認）または blocker 扱いへ振り向ける。

### 挿入位置の一意特定（REQ-015-007）

経路D の review 挿入位置は既存対策確認完了直後、ユーザーへの判定結果提示前である。
最初の不可逆副作用は git pull 以降（deferred 移動、prune、commit/push）であり、review 挿入位置は全不可逆処理に先立つ。
handoff.md、promoted/ 等の成果物は review より後の工程で生成されるため、review 時点では存在せず、review 対象は evaluation-report.md のみとなる。

### 正規所有者と参照関係

| 意味 | 正規所有者 |
|---|---|
| 経路D の発動条件、挿入位置、戻り先、evaluation-report 更新戻しループ | 本 SPEC（learning-promote command SPEC） |
| 候補判断基準、内部手続き（候補確定位置、呼出タイミング、evaluation-report 反映、evaluation-report 更新戻しループの実装詳細） | `agentdev-learning-pipeline` domain skill SPEC（ACT-SPEC-013） |
| 共通 caller integration 契約（任意性、副作用禁止、accepted finding 反映、再 review 条件、停止条件、呼出失敗時取扱い） | `agentdev-adversarial-review` SPEC（REQ-014） |

