---
description: 未分類の変更候補を手動入力から intake item として保存する
---

# Intake 取り込み（手動入力）

ユーザーの手動入力から、未分類の作業候補、不整合、規約違反、未回収課題を intake item として作成し、`.agentdev/intake/inbox/` に保存する。

**このコマンドは保存専用である。
** GitHub Issue の作成、採用可否の判断は行わない。
作業知見だけの内容は対象外である（`agentdev-workflow-orchestration` の capture 振り分け基準を参照）。

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-intake-capture`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-intake-capture.yaml`、kind: workflow-extension）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- ユーザーの自然言語による変更候補の記述
- 任意で観測元、影響、判断保留事項の指定

## 出力

- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md` に保存された intake item

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-intake-capture` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。同スキルが保存専用 workflow の実装（入力の受領から intake item 生成、保存、git 永続化、完了報告まで）を所有する。

本 workflow は capture-only型であり、STEP model の対象外である（REQ-{NNNN}-{NNN}）。resume point / export / import を持たない。工程は逐次実行し、中断時は最初から再実行する。各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| 工程-1 入力の受領 | ユーザーの手動入力あり | 受領済み変更候補の記述 | 入力が「未分類の作業候補、不整合、規約違反、未回収課題」のいずれかに該当すること（作業知見のみは対象外） |
| 工程-2 intake item の生成 | 入力受領済み | item 本文 | 元の意図を保った整理にとどまっていること（推測不能なセクションは省略） |
| 工程-3 ファイル名の生成・実行前同期 | item 生成済み | `YYYY-MM-DD-{topic-slug}.md` ファイル名 | 同名ファイル存在時は連番付与（`{topic-slug}-2` 等）であること |
| 工程-4 保存・永続化 | ファイル名確定 | `.agentdev/intake/inbox/` への保存・git 永続化 | 保存先が `.agentdev/intake/inbox/` のみであること |
| 工程-5 完了報告 | 保存済み | 完了報告（パス・次アクション） | 保存パスと次コマンド（`/agentdev/intake-promote`）が報告されていること |

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 保存専用のコマンドであり、採用可否の判断は `intake-promote` が、review・整形・分類は後続コマンドが担う
- 対象は「未分類の作業候補、不整合、規約違反、未回収課題」に限定する。作業知見だけの内容（再発防止知見のみで具体的修正対象がないもの）は `agentdev-learning-capture` skill 経由とする（learning item の保存・分類・昇華は本コマンドの対象外）
- intake item は軽量な手書きメモとして扱う（workflow 管理成果物として扱わない）。frontmatter、状態値、重複排除キー、後続成果物参照、特定セクションを必須とせず、review 結果は item に書き込まない
- ユーザーの入力内容は元の意図を保ったまま整理する（過度な解釈・変形、過度な補完は行わない。ユーザーが明示的に提供した内容のみを整理する）

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- G01: GitHub Issue の作成は行わない（`case-open` が担当）
- G03: 保存済み intake item の変更・更新は行わない（保存のみ。review 結果の書き込みも行わない）
- G12: 保存先は `.agentdev/intake/inbox/` のみ（他ディレクトリへの保存は禁止）

