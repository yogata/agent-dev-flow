---
description: クローズ済み GitHub Issue/PR から未回収の変更候補を intake item として保存する
---

# Intake（GitHub 抽出）

クローズ済みの GitHub Issue/ PR の本文、コメントから未回収の変更候補を抽出し、intake item として `.agentdev/intake/inbox/` に保存する。

旧 `issue-backlog` の抽出機能を intake ワークフローに再定義したコマンド。

**このコマンドは保存専用である。
** GitHub Issue の作成、採用可否の判断は行わない。

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-intake-from-github`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-intake-from-github.yaml`、kind: workflow-extension）を読み込む。

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

本コマンドは workflow 実装本体を `agentdev-workflow-intake-from-github` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
同スキルが保存専用 workflow の実装（期間解釈から抽出、保存、git 永続化、サマリーレポート、完了報告まで）を所有する。

本 workflow は capture-only型であり、STEP model の対象外である（REQ-{NNNN}-{NNN}）。
resume point / export / import を持たない。
工程は逐次実行し、中断時は最初から再実行する。
各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 期間解釈（`agentdev-intake-pipeline`） | 期間指定または番号指定あり | 解析済み期間・対象範囲 | 期間表現が機械可読な範囲に解釈されていること |
| STEP-2 データ取得（gh CLI、`agentdev-gh-cli` 読取手続き） | 期間確定 | クローズ済み Issue/PR データ | 対象がクローズ済み Issue/PR のみであること（オープン中は対象外） |
| STEP-3 構造的検出（`agentdev-intake-pipeline`） | データ取得済み | 構造的検出結果（完了条件未対応等） | 検出規則が `agentdev-intake-pipeline` 準拠であること |
| STEP-4 LLM 全文解析（`agentdev-intake-pipeline`） | 構造的検出済み | 本文・コメント由来の変更候補 | 未回収の変更候補が網羅的に抽出されていること |
| STEP-5 intake item 生成・実行前同期 | 候補確定 | `YYYY-MM-DD-{topic-slug}.md`（候補ごとに1ファイル） | 同名ファイル存在時は連番付与であること |
| STEP-6 保存・永続化 | item 生成済み | `.agentdev/intake/inbox/` への保存・git 永続化 | 保存先が `.agentdev/intake/inbox/` のみであること |
| STEP-7 サマリーレポート提示 | 保存済み | 抽出サマリーレポート（ユーザー確認用） | 抽出件数と保存パスが対応していること |
| STEP-8 完了報告 | レポート提示済み | 完了報告（次アクション） | 次コマンド（`/agentdev/intake-promote`）が報告されていること |

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 保存専用のコマンドであり、採用可否の判断は `intake-promote` が、review・整形・分類は後続コマンドが、Issue/PR へのコメント投稿・マーカー付与は `backlog-review` が担う
- 対象はクローズ済み Issue/PR のみとする。読み取り操作は `agentdev-gh-cli` に従って実行する
- intake item は軽量な手書きメモとして扱う（workflow 管理成果物として扱わない）。frontmatter、状態値、重複排除キー、後続成果物参照、特定セクションを必須とせず、review 結果は item に書き込まない
- 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）は verbatim で返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- G01: GitHub Issue の作成は行わない（`case-open` が担当）
- G04: Issue/PR へのコメント投稿、マーカー付与は行わない（`backlog-review` が担当）
- G09: GitHub Issue/PR のデータ取得は `gh` CLI のみ使用する（GitHub API 直接呼び出しは不可）
- G12: 保存先は `.agentdev/intake/inbox/` のみ（他ディレクトリへの保存は禁止）


