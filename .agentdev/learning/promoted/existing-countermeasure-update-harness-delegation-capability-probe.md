# harness 制約下の case-run 実行担当接合に能力検出を導入する

## 背景

inbox 1件 + deferred L-004/L-010 の3系統。起動手段がない場合にプロセス内直接実装と契約 self-apply で完遂。

## 問題

実行担当サブエージェント型の起動手段が制限されたハーネスでは adapter 委譲契約の実行担当接合がそのまま起動できず、起動手段の能力検出に基づく接合形態の選択とその記録が必要になる

## 望ましい変更

能力検出結果に基づく接合判定（プロセス内直接実装 + result 4状態・3点ゲート契約の self-apply）とその記録の経路を harness 固有委譲ノートへ明記

## 対象範囲

### 対象

- agentdev-case-run-execution-adapter references/harness-delegation.md

### 対象外

- learning-promote による実現先の確定・直接反映

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 候補 | agentdev-case-run-execution-adapter references/harness-delegation.md | 起動不能の事前判定から接合形態決定・記録までの経路が未記載。 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: agentdev-case-run-execution-adapter references/harness-delegation.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 起動不能の事前判定から接合形態決定・記録までの経路が未記載。

## 制約

実現先の最終選択は req-define の変更影響分析が行う。恒久契約候補は backlog-review → req-define 経由で確定する。

## 受け入れ条件

- [ ] 問題クラスの根拠と再発条件を保持する
- [ ] 推奨反映先候補を下流で再調査できる
- [ ] 元 learning item の証拠が本成果物内に保存されている

## 元learning item / 根拠

- **要約**: harness 制約下の case-run 実行担当接合に能力検出を導入する
- **根拠**: inbox 1件 + deferred L-004/L-010 の3系統。起動手段がない場合にプロセス内直接実装と契約 self-apply で完遂。
- **再発条件**: evaluation-report の問題クラス9および原エントリを参照
- **横展開可能性**: harness 固有

### 原エントリ（証跡）

### Inbox 原文 1

## harness 制約下の case-run 委譲では実行担当接合を委譲実行者のプロセス内直接実装として履行し能力検出に基づく接合判定の記録が必要

- **問題事象**: 実行担当サブエージェント型の起動手段が研究系 agent に限定されたハーネスでは、adapter 委譲契約（agentdev-case-run-execution-adapter）の実行担当接合がそのままでは起動できない。即 delegation-unavailable と判断すると契約を満たせない
- **発生局面**: 実装（case-run STEP-S4 委譲起動時の能力検出。Case #3086 / PR #3093 Findings learning 候補から回収）
- **検知方法**: STEP-S4 委譲起動時の能力検出（実行担当サブエージェント型の起動手段が研究系 agent に限定されていることの確認）
- **根本原因**: ハーネスの能力差。委譲起動手段が制限された環境では委譲契約の接合形態をその前提に合わせて選択する必要がある
- **自律対応内容**: adapter 委譲契約の実行担当接合を委譲実行者のプロセス内直接実装として履行。result 4状態契約・3点ゲート・PR 本文 SSoT 契約は同一契約で self-applied して遵守した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（委譲契約自体の変更は不要。harness 差異の運用知見）
- **横展開観点**: 委譲起動手段が制限されたハーネスでの case-run 実行時は、即 delegation-unavailable と判断せず、harness の能力検出結果に基づく接合判定とその記録が必要
- **再発条件**: 実行担当サブエージェント型の起動手段が制限された harness で case-run の委譲を実行する場合
- **予防策候補**: agentdev-case-run-execution-adapter の reference に harness 能力検出結果に基づく接合判定（起動手段不在時のプロセス内直接実装 + 契約 self-apply の記録）の経路を明記
- **想定反映先**: .opencode/skills/agentdev-case-run-execution-adapter/references/（委譲実行手順の harness 差異節）
- **関連**: Case #3086、PR #3093（Findings learning 候補から回収）
- **タグ**: `#case-run` `#委譲` `#harness制約` `#adapter`

---

### Deferred 吸収元 1

### L-004: docs 系 Issue で case-run task() 委譲不可時に adapter skill フォールバックパスが有効

- **問題事象**: docs 系（REQ/ADR ファイル検証・カタログ参照追加）の Issue で、case-run の Sisyphus-Junior への task() 委譲がハーネス制約で利用不可になる場合がある
- **発生局面**: 実装（case-run で docs 系 Issue を扱い task() 委譲が利用不可の場合）
- **検知方法**: task() 起動失敗のハーネス応答
- **根本原因**: ハーネスのツール制約で task() による別サブエージェント起動が不可
- **自律対応内容**: `agentdev-case-run-execution-adapter` スキルの「task() 起動失敗時事後処理（Item 5）」パス（手動修正または PR 化）に従い、検証とカタログ更新を直接実施して PR 化
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（adapter skill のフォールバックパス適用範囲内）
- **横展開観点**: task() 委譲がハーネス制約で不可な環境では adapter skill フォールバックパスで完結できる
- **再発条件**: task() ツールを提供しないハーネス環境で case-run を実行する場合
- **予防策候補**: adapter skill のフォールバック判断基準の運用実証
- **想定反映先**: agentdev-case-run-execution-adapter
- **関連**: PR #1068 (#1061 / REQ-0148 + ADR-0129)
- **タグ**: `#case-run` `#task-delegation` `#adapter-skill` `#fallback` `#docs-issue`
- **移動日**: 2026-06-25
- **処分判定**: deferred（adapter skill L131-148 が task() 起動失敗時フォールバックを完全カバー。L-010 とともに既存設計の妥当性実証記録。事前 probe 強化のみ未成熟）

### Deferred 吸収元 2

### L-010: ハーネス制約で task() 委譲不可時に同一エージェント統合実行が有効（adapter protocol 準拠）

- **問題事象**: case-run orchestration（worktree 準備・Step 1-5 相当）と Sisyphus-Junior 実装実行を別エージェントへ task() 委譲しようとしたが、ハーネスのツール制約で task() による別 Sisyphus-Junior 起動が不可だった
- **発生局面**: 実装（case-run の実行担当サブエージェント起動ステップ）
- **検知方法**: task() 起動失敗のハーネス応答
- **根本原因**: 当該ハーネス実行環境では task() ツールが提供されておらず、別サブエージェント起動経路が存在しない
- **自律対応内容**: case-run orchestration と実装実行を同一エージェント（case-run 起動元の Sisyphus-Junior）が統合実施。adapter protocol（証拠ベース実装・品質ゲート・PR 作成・worktree 隔離・Findings 配置）には従い、委譲先が不在でもプロトコル要件を満たす形で完結
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。adapter protocol（agentdev-case-run-execution-adapter）のフォールバックパス適用範囲内。L-004 と同根の知見だが本件は docs 系に限らず task() 不可時の汎用パターンとして再実証
- **横展開観点**: task() 委譲がハーネス制約で不可な環境では、起動元エージェントが orchestration + 実装を統合実行する経路を標準的に取る
- **再発条件**: task() ツールを提供しないハーネス環境（またはツール権限で task() が無効化された環境）で case-run を実行する場合
- **予防策候補**: case-run の driver 起動ステップで task() 可否を事前 probe し、不可の場合は起動元統合実行へ自動切替するプロトコル記述を adapter skill に明記
- **想定反映先**: agentdev-case-run-execution-adapter（task() 起動失敗時事後処理セクションの拡充）、agentdev-workflow-orchestration references（委譲可否 probe 手順）
- **関連**: PR #1103 (#1102)、L-004 (PR #1068)、agentdev-case-run-execution-adapter SKILL.md
- **タグ**: `#case-run` `#task-delegation` `#adapter-protocol` `#harness-constraint`
- **移動日**: 2026-06-25
- **処分判定**: deferred（adapter skill L131-148 が task() 起動失敗時フォールバックを完全カバー。L-004 とともに既存設計の妥当性実証記録。事前 probe 強化のみ未成熟）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: 原エントリおよび evaluation-report の記載に従う

## 評価スコア（evaluation-report 2026-09-24 抄録）

- **問題クラス**: 9
- **確定処分**: 既存対策の更新 (category 5)
- **加重合計**: 23/40

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 1件 + deferred 同種2件 |
| 影響度 | 2/5 | 契約どおり self-apply で完遂 |
| 横展開性 | 2/5 | harness 固有 |
| 反映先明確度 | 4/5 | adapter SKILL L213〜218 が配置先を指定 |
| 自動化適性 | 3/5 | 事前 probe の手続化可能 |
| プロジェクト固有知識再利用性 | 3/5 |  |
| 再発可能性 | 3/5 | harness 制約は継続 |
| 費用対効果 | 3/5 | ノート追記のみ |

### 判定基礎（evaluation-report verbatim）

### 問題クラス9: harness 制約下の実行担当接合（能力検出とプロセス内直接実装）
- **根本原因**: 実行担当サブエージェント型の起動手段が制限されたハーネスでは adapter 委譲契約の実行担当接合がそのまま起動できず、起動手段の能力検出に基づく接合形態の選択とその記録が必要になる
- **再発条件**: 起動手段が制限された harness で case-run の委譲を実行する場合
- **予防策**: 能力検出結果に基づく接合判定（プロセス内直接実装 + result 4状態・3点ゲート契約の self-apply）とその記録の経路を harness 固有委譲ノートへ明記

#### 8軸評価スコア
| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 1件 + deferred 同種2件（L-004・L-010。L-010 は L-004 と同根の知見と自己記載） |
| 影響度 | 2/5 | 契約どおり self-apply で完遂、委譲不能停止は回避 |
| 横展開性 | 2/5 | harness 固有 |
| 反映先明確度 | 4/5 | case-run-execution-adapter SKILL L213〜218 が「委譲起動手段・能力検出・インライン代替の有無は references/harness-delegation.md に配置」と指定 |
| 自動化適性 | 3/5 | 事前 probe の手続化可能 |
| プロジェクト固有知識再利用性 | 3/5 | |
| 再発可能性 | 3/5 | harness 制約は継続 |
| 費用対効果 | 3/5 | ノート追記のみ |
| **加重合計** | **23/40** | |

- **推奨処分案**: 既存対策の更新（category 5）— harness-delegation.md「委譲起動失敗、異常終了時事後処理」は委譲起動後の事後処理のみを扱い、起動不能の事前判定から接合形態決定（プロセス内直接実装 + 契約 self-apply）とその記録までの経路が未記載（fix gap）。deferred L-004/L-010 の再評価条件（事前 probe 強化）が3回目の発生で成立。Jev は deferred (0.53) を示唆したが、出現3系統かつ配置先が配布契約で指定済みである点を根拠に category 5 と判定。注記: インライン代替の有無を harness 責務とする配布契約（adapter SKILL L215〜216）との整合を保ち、配布 SKILL の委譲契約自体は変更しない
- **エントリ一覧**: harness 制約下の case-run 委譲では実行担当接合を委譲実行者のプロセス内直接実装として履行 [inbox] / L-010 ハーネス制約で task() 委譲不可時に同一エージェント統合実行 [deferred] / L-004（L-010 と同根） [deferred]

