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

本 workflow は capture-only型であり、STEP model の対象外である（REQ-{NNNN}-{NNN}）。resume point / export / import を持たない。工程は逐次実行し、中断時は最初から再実行する。

- **工程-1** 入力の受領
- **工程-2** intake item の生成
- **工程-3** ファイル名の生成・実行前同期
- **工程-4** 保存・永続化
- **工程-5** 完了報告

## ガードレール

### 責務境界
- G01: GitHub Issue の作成を行わない（`case-open` が担当）
- G02: 採用可否の判断を行わない（`intake-promote` が担当）
- G03: intake item の変更、更新を行わない（保存のみ）
- G04: review、整形、分類を行わない（後続コマンドの責務）
- G05: 対象は「未分類の作業候補、不整合、規約違反、未回収課題」に限定する。作業知見だけの内容（再発防止知見のみで具体的修正対象がないもの）は対象外
- G06: learning item の保存、分類、昇華を担当しない。再発防止知見のみの観測は `agentdev-learning-capture` skill に委ねる

### 形式制約
- G07: workflow 管理成果物として扱わない
- G08: frontmatter、状態値、重複排除キー、後続成果物参照を必須にしない
- G09: 特定セクションを必須セクションとして扱わない
- G10: review 結果を item に書き込まない

### 実行制約
- G11: ユーザーの入力内容を過度に解釈、変形しない（元の意図を保ったまま整理する）
- G12: 保存先は `.agentdev/intake/inbox/` のみ（他ディレクトリへの保存は禁止）
- G13: 推測不能なセクションは省略し、過度な補完を禁止する（ユーザーが明示的に提供した内容のみを整理する）

