---
id: REQ-0003
title: "①→②フェーズ境界でのdocsコミット義務化"
classification: FR
category: maintainability
status: deprecated
adr: null
created: "2026-05-06"
updated: "2026-05-06"
tags: [workflow, guardrail, phase-boundary]
related_to: []
depends_on: []
---

> このドキュメントは①バイブス壁打ちフェーズで作成されます。

# ①→②フェーズ境界でのdocsコミット義務化

## 背景・課題

Issue #32の実装で、①壁打ちフェーズ（issue-req）で作成したdocs変更（REQファイル、READMEインデックス更新）がコミットされず、②実行フェーズ（issue-work）のworktreeに継承されなかった。結果としてdocs変更が事後的にmainに直コミットされた。

原因はフェーズ境界（①→②）でdocs変更のコミットが規定されていないことである。

## 目標

①壁打ちフェーズ完了時にdocs変更を必ずコミットし、②実行フェーズのworktreeがdocs変更を継承できるようにする。

## 方向性

1. issue-reqコマンドのStepsにdocsコミット・プッシュを追加
2. issue-guideスキルにフェーズ境界ルールを明記

## 機能要件

- [ ] issue-req: docsコミット・プッシュステップを追加
  - **Given**: issue-reqがREQファイル作成/更新およびREADMEインデックス更新を完了した状態
  - **When**: docs変更（REQファイル、README、ADR等）をコミット・プッシュする
  - **Then**: mainブランチにdocs変更が反映され、後続のworktreeが変更を継承する
  - **補足**: コミット前にREQ番号の連続性・frontmatter整合性（idとファイル名の一致）を検証する

- [ ] issue-guide: フェーズ境界ルールを追記
  - **Given**: issue-guideのフェーズ体系・SSoT遷移セクションがフェーズ境界のコミット要件を定義していない
  - **When**: 「フェーズ境界ルール」セクションを追加し、①→②境界でのdocsコミット義務を明記する
  - **Then**: 全issue-*コマンドがフェーズ境界でのコミット要件を参照できる

**品質基準**: 各要件は 測定可能・一意・実装可能 であること。

## 非機能要件

- 既存のissue-*ワークフローに破壊的変更を加えない（ステップ追加のみ）
- conventional-commitsスキルに従ってコミットメッセージを生成

## スコープ

### 対象

- `.opencode/commands/issue/issue-req.md`（ステップ追加）
- `.opencode/skills/issue-guide/SKILL.md`（セクション追加）

### 対象外

- `.opencode/commands/issue/issue-create.md`（変更なし）
- `.opencode/commands/issue/issue-work.md`（変更なし）
- その他コマンド・スキルファイル
