---
id: REQ-0004
title: "issue-*コマンドのagent変更と壁打ち結論ハイライト追加"
classification: FR
category: maintainability
status: planned
adr: null
created: "2026-05-06"
updated: "2026-05-06"
tags: [workflow, agent, visibility]
related_to: [REQ-0001]
depends_on: []
---

> このドキュメントは①バイブス壁打ちフェーズで作成されます。

# issue-*コマンドのagent変更と壁打ち結論ハイライト追加

## 背景・課題

issue-req実行時にbuildエージェントに委譲され、壁打ちの結論がユーザーのメインセッションに通知されない。推論はエージェント側で行ってよいが、結論はメインに通知してほしい。

また、OpenCodeコマンド定義の制約上フォールバック機構（sisyphus主軸+buildフォールバック）は不可能であり、本プロジェクトはoh-my-opencode前提であるため、`agent: sisyphus` 指定で合意した。

## 目標

1. 全6issue-*コマンドのagent指定を `sisyphus` に変更し、壁打ち結論がメインセッションに可視化されるようにする
2. issue-reqの完了報告フォーマットに壁打ち結論ハイライトセクションを追加する

## 方向性

1. 6コマンドファイルの frontmatter `agent: build` → `agent: sisyphus` 変更
2. issue-guide SKILL.md の issue-req完了報告フォーマットに壁打ち結論ハイライト追加
3. issue-req.md の Step 8 に結論出力の明記

## 機能要件

- [ ] 6コマンドファイルのagent指定変更
  - **Given**: 全6コマンド（issue-req, issue-create, issue-work, issue-update, issue-close, issue-next）の frontmatter 3行目が `agent: build` である
  - **When**: 各ファイルの `agent: build` を `agent: sisyphus` に変更する
  - **Then**: `Select-String -Pattern "agent: sisyphus" .opencode\commands\issue\issue-*.md | Measure-Object` が Count=6 を返す
  - **補足**: load_skills、steps、guardrailsは一切変更しない

- [ ] issue-guide SKILL.md の完了報告フォーマット更新
  - **Given**: SKILL.md の issue-req完了時フォーマット（147-154行目）に4行テンプレートが存在する
  - **When**: 既存テンプレートの直後に壁打ち結論ハイライトセクションを追加する
  - **Then**: 「壁打ち結論ハイライト」「背景」「目標」「要件数」「主要な判断」の各項目がSKILL.mdに存在する
  - **補足**: 既存テンプレート行はそのまま保持（追加のみ、置換しない）

- [ ] issue-req.md Step 8 の更新
  - **Given**: issue-req.md の Step 8（38行目）が `完了報告 → issue-guide の完了報告フォーマットに従って出力` である
  - **When**: Step 8 に壁打ち結論ハイライト出力の義務を明記する
  - **Then**: Step 8 が「壁打ち結論ハイライト」を含むテキストに更新される

**品質基準**: 各要件は 測定可能・一意・実装可能 であること。

## 非機能要件

- 既存のissue-*ワークフローに破壊的変更を加えない（frontmatterのagent行のみ変更）
- YAML frontmatter の整合性を維持する（パース可能であること）
- 他のコマンドの完了報告フォーマット（issue-create, issue-work等）は変更しない

## スコープ

### 対象

- `.opencode/commands/issue/issue-req.md`（agent変更 + Step 8 更新）
- `.opencode/commands/issue/issue-create.md`（agent変更のみ）
- `.opencode/commands/issue/issue-work.md`（agent変更のみ）
- `.opencode/commands/issue/issue-update.md`（agent変更のみ）
- `.opencode/commands/issue/issue-close.md`（agent変更のみ）
- `.opencode/commands/issue/issue-next.md`（agent変更のみ）
- `.opencode/skills/issue-guide/SKILL.md`（完了報告フォーマット更新）

### 対象外

- `.opencode/commands/issue/templates/` ディレクトリ（変更なし）
- 他のコマンドの完了報告フォーマット（issue-create, issue-work, issue-update, issue-close）
- README.md
