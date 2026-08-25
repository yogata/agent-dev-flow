---
description: クローズ済み Case Issue/PR から未回収の変更候補を intake item として保存する
---

# Intake（GitHub 抽出）

クローズ済みの Case Issue / PR の本文、コメントから未回収の変更候補を抽出し、intake item として `.agentdev/intake/inbox/` に保存する。

旧 `issue-backlog` の抽出機能を intake ワークフローに再定義したコマンド。

**このコマンドは保存専用である。
** GitHub Issue の作成、採用可否の判断は行わない。

## 入力

- ユーザーの自然言語による期間指定（「直近1週間」「今月」「2026-05-02から」等）
- または特定の Issue/PR 番号の指定

## 出力

- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md` に保存された intake item（候補ごとに1ファイル）
- 抽出サマリーレポート（ユーザー確認用）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-intake-from-github` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、再開、停止などの高水準の実行構造は同スキルの control plane が所有する。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 保存専用のコマンドであり、採用可否の判断は `intake-promote` が、review・整形・分類は後続コマンドが、Issue/PR へのコメント投稿・マーカー付与は `backlog-review` が担う
- 対象はクローズ済み Case Issue/PR のみとする（role: tracking の追跡Issueは抽出対象外）。読み取り操作は Custom Tool `agentdev_gh` 経由で実行する
- intake item は軽量な手書きメモとして扱う（workflow 管理成果物として扱わない）。frontmatter、状態値、重複排除キー、後続成果物参照、特定セクションを必須とせず、review 結果は item に書き込まない
- 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）は verbatim で返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- GitHub Issue の作成は行わない（`case-open` が担当）
- Issue/PR へのコメント投稿、マーカー付与は行わない（`backlog-review` が担当）
- GitHub Issue/PR のデータ取得は `gh` CLI のみ使用する（GitHub API 直接呼び出しは不可）（`POL-gh-io-delegation`）
- 保存先は `.agentdev/intake/inbox/` のみ（他ディレクトリへの保存は禁止）


