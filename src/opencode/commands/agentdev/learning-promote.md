---
description: inbox.mdから正規化、分類、8軸評価、HITL確定を経て採用済み成果物を生成する
---

# 学びの正規化、評価、昇華判定と採用済み成果物生成

`.agentdev/learning/inbox.md` の学びエントリを読み込み、正規化、問題クラス分類、8軸評価、廃棄判定、既存対策確認、HITL承認を経て採用済み成果物を生成する。

**重要**: `.opencode/` への直接配置、直接反映は行わない。
反映ルート: promoted → `/agentdev/backlog-review`（RU 生成）→ `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` → `/agentdev/case-run`。
旧 `learning-refine` の全機能を吸収済み（事前実行不要）。

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-learning-promote`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-learning-promote.yaml`、kind: workflow-extension）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- `.agentdev/learning/inbox.md`（必須）— 未処理の学びエントリ
- `.agentdev/learning/deferred.md`（任意）— 過去エントリ参照用

## 出力

- `.agentdev/learning/evaluation-report.md`（8軸評価レポート、評価根拠中間成果物）
- `.agentdev/learning/promoted/{category}-{name}.md`（採用済み成果物）
- `.agentdev/learning/deferred.md`（inbox からの移動分を追記）
- `.agentdev/learning/inbox.md`（ヘッダーのみにクリア）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-learning-promote` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。同スキルが7 STEP の control plane として制御構造を所有する。各 STEP は resume point を持ち、durable state（inbox.md / deferred.md / evaluation-report.md / promoted/ の実ファイル状態、分類確定状態）から再開点を再構成する（DEC-{N}）。

- **STEP-1** 入力読込・正規化 — inbox.md 読込（不在時はエラー終了、0件時は終了）、deferred.md 読込、旧フォーマット正規化
- **STEP-2** 評価 — 問題クラス分類、8軸評価スコアリング、禁止条件フィルタリングゲート、evaluation-report.md 生成・更新
- **STEP-3** 判定 — 廃棄判定（11カテゴリ + duplicate）、既存対策確認、昇華可能性評価（無条件の自動REQ化禁止、living pool 維持）
- **STEP-4** review（経路D） — adversarial-review 発動条件判定・review 呼出・accepted finding 反映（evaluation-report 戻しループ、skip 条件該当時は省略）
- **STEP-5** HITL — 判定結果提示・ユーザー承認（判断の確定、REQ）
- **STEP-6** 永続化 — `git pull --ff-only`、採用済み成果物生成（staging 領域のみ）、deferred 移動（原子的操作）、prune、commit/push
- **STEP-7** 完了報告 — 8軸評価サマリ、判定結果、後続ルート、git 永続化結果の報告

各 STEP の詳細（開始条件・結果・手順・resume point・関連 Capability Skill 連携）は `agentdev-workflow-learning-promote` スキルの `references/` 配下を参照。本コマンドは同スキルを名レベルで参照し、内部構造（STEP ID、reference パス）へ直接依存しない（REQ-{NNNN}-{NNN}）。

## ガードレール

- G01: `.opencode/` 直接反映禁止: 採用済み成果物は `.agentdev/learning/promoted/` のみに生成
- G02: `evaluation-report.md` は本コマンドが生成、管理: 外部コマンドの事前生成に依存しない
- G03: `case-run` への直接受け渡し禁止: `/agentdev/backlog-review` 経由のみ
- G04: 主入力は `inbox.md`: raw learning item の再分類は禁止
- G05: 既存対策を優先: 「新規X化」より「既存Xへ反映」を優先
- G06: ユーザー承認必須: 判定、prune ともに承認なしに実行しない
- G07: 管理用ファイル（`elevation-ledger.md` 等）は生成しない
- G08: `learning-refine` への依存禁止: 本コマンドは旧機能を内包し事前実行を前提としない
- G09: 破壊的変更（inbox.md 全体強制クリア、大量エントリ一括削除等）は STEP-5（HITL）承認とは別に明示承認を維持する（REQ）
- G10: 無条件の自動REQ化禁止（REQ）: 学びを直接 REQ 化しない。恒久契約（REQ/Decision/SPEC）への昇華可能性を STEP-3 で評価し、昇華可能なもののみ `promoted/` へ出力する。昇華不能な知見は living pool（`deferred.md`）で維持する
- G11: adversarial-review は default-on（経路D、REQ-{NNNN}-{NNN}）: workflow の review STEP（発動条件判定 → review 呼出）を経て原則発動する。skip 条件（inbox.md 1件で重複確実、inbox.md 空）該当時は HITL へ従来フローを維持する（REQ-{NNNN}-{NNN}）。ユーザー明示要求時は skip 条件にかかわらず必ず発動する。review 反映時は evaluation-report 生成 STEP へ戻し関連 STEP を再実行する（REQ-{NNNN}-{NNN}）。共通契約（任意性、副作用禁止、再 review 条件、停止条件、呼出失敗時取扱い）は `agentdev-adversarial-review` SPEC（REQ-{NNNN}）が正規所有する

## ユーザー確認ポイント、エラー処理

ユーザー確認ポイント、エラー処理表、各成果物のライフサイクル詳細は `agentdev-learning-pipeline` を参照。主要項目のみ本節に抜粋する:

- **HITL（workflow STEP-5）**: 廃棄判定結果、8軸評価スコアの確認、修正、承認（判断の確定、REQ）
- **prune（workflow 永続化 STEP）**: prune は HITL 承認と同時に承認済みとみなし自動実行（REQ）。staged/rejected/duplicate の追加確認は不要
- **inbox.md 不在**: エラー終了。「先に `agentdev-learning-capture` skill で学びを追加してください」
- **git pull/push 失敗**: 構造化エラー表示して停止（push 失敗時は完了扱いにしない）
- **learning-promote の責務**: normalize → classify → 8-axis eval → evaluation-report → disposal judgment → HITL → 採用済み成果物生成 → archive move → prune。採用済み成果物は `/agentdev/backlog-review` 経由で RU 化後に `/agentdev/req-define` に合流する


