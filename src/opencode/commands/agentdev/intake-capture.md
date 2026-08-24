---
description: 未分類の変更候補を手動入力から intake item として保存する
---

# Intake 取り込み（手動入力）

ユーザーの手動入力から、未分類の作業候補、不整合、規約違反、未回収課題を intake item として作成し、`.agentdev/intake/inbox/` に保存する。

**このコマンドは保存専用である。
** GitHub Issue の作成、採用可否の判断は行わない。
作業知見だけの内容は対象外である（`agentdev-workflow-orchestration` の capture 振り分け基準を参照）。

## 入力

- ユーザーの自然言語による変更候補の記述
- 任意で観測元、影響、判断保留事項の指定

## 出力

- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md` に保存された intake item

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-intake-capture` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、再開、停止などの高水準の実行構造は同スキルの control plane が所有する。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 保存専用のコマンドであり、採用可否の判断は `intake-promote` が、review・整形・分類は後続コマンドが担う
- 対象は「未分類の作業候補、不整合、規約違反、未回収課題」に限定する。作業知見だけの内容（再発防止知見のみで具体的修正対象がないもの）は `agentdev-learning-capture` skill 経由とする（learning item の保存・分類・昇華は本コマンドの対象外）
- intake item は軽量な手書きメモとして扱う（workflow 管理成果物として扱わない）。frontmatter、状態値、重複排除キー、後続成果物参照、特定セクションを必須とせず、review 結果は item に書き込まない
- ユーザーの入力内容は元の意図を保ったまま整理する（過度な解釈・変形、過度な補完は行わない。ユーザーが明示的に提供した内容のみを整理する）

## ガードレール

硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:

- GitHub Issue の作成は行わない（`case-open` が担当）
- 保存済み intake item の変更・更新は行わない（保存のみ。review 結果の書き込みも行わない）
- 保存先は `.agentdev/intake/inbox/` のみ（他ディレクトリへの保存は禁止）

