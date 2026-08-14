---
title: inspect-promote SPEC
status: accepted
created: 2026-06-21
updated: 2026-08-14
---

# inspect-promote SPEC

## 目的

`.agentdev/inspect/inbox/` の検出事項を分類、採用し、採用済み成果物として `.agentdev/inspect/promoted/` へ出力する。
`--auto` オプションで高確信度検出事項の自動 promote を有効化する。

## 入力

- `.agentdev/inspect/inbox/*.md`（検出事項ファイル群）
- `--auto`（省略可能）（高確信度検出事項の自動 promote を有効化）

## 出力

- `.agentdev/inspect/promoted/*.md`（手動 promote 採用済み、RU 化対象）
- reject 検出事項は即時削除（`archive/rejected/` 廃止）。reject 時の commit message に却下理由を含める（監査証跠の補強）
- `.agentdev/intake/promoted/inspect-auto-*.md`（`--auto` 時の自動 promote 成果物）
- `.agentdev/inspect/promoted/auto-promote-log.md`（`--auto` 実行ログ、append-only）
- セッション内完了報告

## 副作用

- ファイル移動、作成、削除: `.agentdev/inspect/` および `.agentdev/intake/` 配下
- git commit/push: `.agentdev/inspect/` および `.agentdev/intake/` 配下
- 実行前同期: `git pull --ff-only`

## 現在の動作

- 実行前同期（`git pull --ff-only`）
- inbox スキャン
- 検出事項分類（promote / defer / reject）
- 自動 promote（`--auto` opt-in 時のみ）:
 - 自動 promote 対象: SPEC分離基準違反（high-specificity）、構造的即時是正
 - 自動 promote 対象外: 命名、分類の意味判断、ADR 要否判断（手動分類へ回す）
 - 投入先: `.agentdev/intake/promoted/inspect-auto-{timestamp}-{slug}.md`
 - 実行ログ: `.agentdev/inspect/promoted/auto-promote-log.md` に投入対象記録
- HITL 確定（手動分類対象）
- promote 処理: `.agentdev/inspect/promoted/` へ保存
- reject 処理: 即時削除（`archive/rejected/` 廃止）
- defer 処理: `.agentdev/inspect/inbox/` に残す
- 完了報告
- `.agentdev/` 変更の commit と push

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（コマンド分類）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（検出事項プロトコル、inspect-promote 自動 promote 対象カテゴリ、投入先、実行ログ、誤検知 revoke 手順）

## 対象外

- ユーザーの明示的な承認なしの採用済み成果物生成（G01、`--auto` による自動 promote 対象を除く）
- promote 検出事項以外の `.agentdev/inspect/promoted/` 保存（G02）
- reject 検出事項の即時削除以外の取扱（G03）
- defer 検出事項の `.agentdev/inspect/inbox/` からの移動（G04）
- docs-check ルール、検査データ追加候補の独立 route 化（G05、要件化方向または受け入れ条件に含める）
- `--auto` の明示 opt-in なしの有効化（G06）
- `--auto` による意味判断、曖昧分類、ADR 要否判断の自動投入（G07、手動分類へ回す）
- `--auto` 実行ログの省略（G08、`auto-promote-log.md` に投入対象、根拠を記録）

## 検証観点

- ユーザー明示承認の確保（G01、`--auto` 対象除く）
- 分類の正確性: promote / defer / reject
- 投入先、形式の正確性: `.agentdev/intake/promoted/inspect-auto-{timestamp}-{slug}.md`（`--auto` 時）
- 自動 promote 対象カテゴリの遵守: SPEC分離基準違反（high-specificity）、構造的即時是正のみ
- 自動 promote 対象外の手動分類回し: 命名、分類の意味判断、ADR 要否判断
- 実行ログ記録の完備（G08）

## See Also

- [inspect-docs.md](inspect-docs.md), [inspect-skills.md](inspect-skills.md)（前段コマンド（検出事項生成））
- [backlog-review.md](backlog-review.md)（後続コマンド（RU 生成））
- REQ-010（inspect-promote / 検出事項分類、昇格）
- REQ-001（inspect-promote 自動 promote（REQ-001-016））

## adversarial-review 挿入境界（経路B）

本節は inspect-promote からの adversarial-review 呼出統合（REQ-015 経路B）を正典として所有する。共通契約（任意性、副作用禁止、QG/HITL 非代替、呼出失敗時取扱い、再 review 条件、停止条件4点、accepted finding 反映責務、正規所有者マトリックス）は adversarial-review SPEC「adversarial-review caller integration 共通契約」節を正とし、本節は再定義しない（REQ-014-011）。本節は経路B 固有の挿入位置、発動条件判定 Step、review 呼出 Step、--auto fast path を所有する。

### review 挿入位置（REQ-015-005）

review 挿入位置は「暫定分類後・HITL 前」へ一意に特定する。自動 promote（`--auto` opt-in 時のみ）の完了時点から HITL 確定（手動分類対象）の開始前までを指す。

| 境界 | 直前処理 | 直後処理 |
|---|---|---|
| 暫定分類後・HITL 前 | 自動 promote（`--auto` opt-in 時のみ） | HITL 確定 |

- 「暫定分類後」: 検出事項分類の暫定分類結果を前提とし、`--auto` による自動 promote 対象の抽出、投入が完了した時点
- 「HITL 前」: HITL 確定によるユーザー承認を得る前の時点
- review 対象: 自動 promote 対象外で HITL 確定へ進む手動分類対象の検出事項。当該検出事項の暫定分類結果（promote/ defer/ reject 判定と根拠）を入力コンテキストとする

### --auto 経路の review 挿入迂回（fast path）（REQ-015-005）

`--auto` opt-in により自動 promote された検出事項は HITL を経由しない fast path となり、review 挿入境界を迂回する。当該検出事項は `.agentdev/intake/promoted/inspect-auto-*.md` へ直接投入され、adversarial-review の対象外となる。

- fast path 対象: 自動 promote された検出事項（高確信度、自動 promote 対象カテゴリ合致）
- review 対象（fast path 外）: 自動 promote 対象外で手動分類へ回された検出事項

`--auto` opt-in の有無と review 挿入境界の発動関係は次のとおり。

| `--auto` opt-in | 自動 promote 対象 | 手動分類対象 | review 挿入境界 |
|---|---|---|---|
| あり | あり | あり | 手動分類対象について default-on で発動（fast path 対象は迂回） |
| あり | あり | なし | skip（review 対象なし、全件 fast path 完了） |
| あり | なし | あり | 手動分類対象について default-on で発動 |
| なし | — | あり | 手動分類対象について default-on で発動 |
| なし | — | なし | skip（inbox 空、inbox スキャンで終了） |

### 発動条件判定 Step（REQ-015-001、REQ-015-002、REQ-015-003）

発動条件判定 Step と review 呼出 Step は分離する（REQ-015-001）。inspect-promote は adversarial-review を原則実行する（default-on、REQ-015-002）。発動条件判定は review 挿入位置（暫定分類後・HITL 前）で review 対象の存在を確認し、skip 条件を評価する。

- **default-on（原則実行）**: 手動分類対象の検出事項（review 対象）が1件以上存在する場合、発動する（REQ-015-002）。ユーザー明示指定は通常発動の必須条件ではない。
- **skip 条件**: 次のいずれかに該当する場合、adversarial-review を省略して従来フロー（HITL 確定）を継続できる（REQ-015-003）。skip 判断のためだけの新規 HITL、承認点は追加しない。
  - `--auto` 経路（fast path、REQ-015-005 既存の迂回条件）の場合
  - 手動分類対象の検出事項が0件（inbox 空、全件 fast path 完了）の場合
- **ユーザー明示指定時の必須実行**: ユーザーが本コマンド起動時に adversarial-review を明示的に要求した場合、skip 条件の該当にかかわらず必ず発動する（REQ-015-002）。ただし review 対象（手動分類対象）が存在しない場合は発動しない。

### review 呼出 Step（REQ-015-001）

review 呼出 Step は review 対象（手動分類対象の検出事項、暫定分類結果）を入力コンテキストとして adversarial-review を呼び出す。入力コンテキスト、返却契約、呼出失敗時取扱い、再 review 停止条件は adversarial-review SPEC を正とする。

呼出結果の取扱い:

- accepted finding は本コマンドの責務で暫定分類結果へ反映する（REQ-014-006）。adversarial-review 自身は反映を行わない（REQ-014-004）
- finding 反映で暫定分類の意味内容が変更された場合、検出事項分類へ戻し再分類する。再 review 条件と停止条件4点は adversarial-review SPEC に従う（REQ-014-007/008）
- unresolved な本質的争点が残る場合、HITL 確定へ進まず、ユーザー判断事項として停止する（REQ-014-009）。ただし adversarial-review 自体を恒久的な統制ゲートとしない
- 呼出失敗時は silent skip を禁止し、利用不能を報告した上で HITL 確定の従来フローを維持する（REQ-014-010）

### ユーザー明示指定時の必須実行（REQ-015-002）

ユーザーが inspect-promote 起動時に adversarial-review を明示的に要求した場合、skip 条件（`--auto` 経路、review 対象なし）の該当にかかわらず必ず発動する。明示要求はコマンド起動時の引数、対話中の指示、または Workflow Skill extension（`.agentdev/extensions/skills/agentdev-workflow-inspect-promote.yaml`）の `rules` により表明される。review 対象（手動分類対象の検出事項）が存在しない場合は発動しない。

### 条件非該当時の従来フロー維持（REQ-015-003）

skip 条件該当時、呼出失敗時（REQ-014-010）のいずれの場合も、review 呼出を実行せず HITL 確定へ従来フローを維持する（REQ-015-003）。従来フロー（HITL 確定以降の promote / reject / defer 処理と commit/push）は変更せず、adversarial-review 由来の新規統制ゲートを作らない（REQ-014-009）。

### 正規所有者宣言

review 挿入境界（経路B の発動条件、挿入位置、戻り先、--auto fast path）は本 SPEC が正規所有する（REQ-014-011、REQ-015-005）。共通 caller integration 契約は adversarial-review SPEC を正とし、本節は再定義しない。user-decision-required の停止理由分類は workflow-contracts SPEC、review 経路での parent_decision_required / decision_context 適用は delegation-contracts SPEC をそれぞれ正とする。

