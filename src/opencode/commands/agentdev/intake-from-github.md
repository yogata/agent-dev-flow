---
description: クローズ済み GitHub Issue/PR から未回収の変更候補を intake item として保存する
---

# Intake（GitHub 抽出）

クローズ済みの GitHub Issue/ PR の本文、コメントから未回収の変更候補を抽出し、intake item として `.agentdev/intake/inbox/` に保存する。

旧 `issue-backlog` の抽出機能を intake ワークフローに再定義したコマンド。

**このコマンドは保存専用である。
** GitHub Issue の作成、採用可否の判断は行わない。

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-intake-from-github`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-intake-from-github.yaml`、kind: workflow-extension）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- ユーザーの自然言語による期間指定（「直近1週間」「今月」「2026-05-02から」等）
- または特定の Issue/PR 番号の指定

## 出力

- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md` に保存された intake item（候補ごとに1ファイル）
- 抽出サマリーレポート（ユーザー確認用）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-intake-from-github` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。同スキルが保存専用 workflow の実装（期間解釈から抽出、保存、git 永続化、サマリーレポート、完了報告まで）を所有する。

本 workflow は capture-only型であり、STEP model の対象外である（REQ-{NNNN}-{NNN}）。resume point / export / import を持たない。工程は逐次実行し、中断時は最初から再実行する。

- **工程-1** 期間解釈 — 期間指定または Issue/PR 番号指定の解釈（`agentdev-intake-pipeline`）
- **工程-2** データ取得 — クローズ済み Issue/PR のデータ取得（gh CLI、`agentdev-gh-cli` 読取手続き）
- **工程-3** 構造的検出 — 抽出ルールによる残課題候補の検出（`agentdev-intake-pipeline`）
- **工程-4** LLM 全文解析 — キーワードリスト、コンテキスト付与ルール（`agentdev-intake-pipeline`）
- **工程-5** intake item 生成・実行前同期 — item 生成ルール、ファイル名規則（`agentdev-intake-pipeline`）、`git pull --ff-only`
- **工程-6** 保存・永続化 — `.agentdev/intake/inbox/` へ保存、`.agentdev/intake/` 変更の commit/push
- **工程-7** サマリーレポート提示 — 抽出結果のサマリーのユーザーへの提示
- **工程-8** 完了報告 — 完了報告 template 出力、git 永続化結果を含める

工程の詳細（intake item 形式、サマリーレポート形式、エラー処理、関連 Capability Skill 連携）は `agentdev-workflow-intake-from-github` スキルを参照。本コマンドは同スキルを名レベルで参照し、内部構造へ直接依存しない（REQ-{NNNN}-{NNN}）。

## ガードレール

### 責務境界
- G01: GitHub Issue の作成を行わない（`case-open` が担当）
- G02: 採用可否の判断を行わない（`intake-promote` が担当）
- G03: review、整形、分類の判断を行わない（後続コマンドの責務）
- G04: Issue/PR へのコメント投稿、マーカー付与は行わない（`backlog-review` が担当）

### 形式制約
- G05: workflow 管理成果物として扱わない
- G06: frontmatter、状態値、重複排除キー、後続成果物参照を必須にしない
- G07: 特定セクションを必須セクションとして扱わない
- G08: review 結果を item に書き込まない

### 実行制約
- G09: GitHub Issue/PR のデータ取得は `gh` CLI のみ使用（GitHub API 直接呼び出し不可）
- G10: 対象はクローズ済み Issue/PR のみ（オープン中は対象外）
- G11: `agentdev-gh-cli` に従って読み取り操作を実行する
- G12: 保存先は `.agentdev/intake/inbox/` のみ
- G13: 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）はverbatimで返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す


