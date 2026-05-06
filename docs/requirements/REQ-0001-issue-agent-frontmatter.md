---
id: REQ-0001
title: "issue-*コマンドのfrontmatterにエージェント型指定を追加"
classification: FR
category: maintainability
status: implemented
adr: null
created: "2026-05-06"
updated: "2026-05-06"
tags: [commands, agent, frontmatter]
related_to: []
depends_on: []
---

> このドキュメントは①バイブス壁打ちフェーズで作成されます。

# issue-\*コマンドのfrontmatterにエージェント型指定を追加

## 背景・課題

6つのissue-\*コマンドのfrontmatterにエージェント指定がないため、ハーネスのデフォルトエージェントが使用される。OpenCodeではPlan（Prometheus）がデフォルトとなり、Planエージェント特有の「計画作成指向」システムプロンプトが干渉する問題があった。

## 目標

全6コマンドのfrontmatterに `agent: build` を明記し、デフォルトエージェントの誤用を防止する。

## 方向性

frontmatterに `agent: build` を1行追加する最小変更で対応。

## 機能要件

- [x] 6コマンドのfrontmatterに `agent: build` が追加されている
  - **Given**: 6つのissue-\*コマンドファイルが存在する
  - **When**: 各コマンドのfrontmatterを確認する
  - **Then**: 全てに `agent: build` が含まれている

- [x] issue-req 実行時にPlan（Prometheus）ではなくBuild（Sisyphus）が起動することを確認
  - **Given**: issue-reqコマンドに `agent: build` が設定されている
  - **When**: issue-reqを実行する
  - **Then**: Buildエージェントが起動し、ファイル書込操作が成功する

- [x] issue-req 完了時の「次のステップ」が `/issue/issue-create` を推奨することを確認
  - **Given**: issue-reqがBuildエージェントで正常完了する
  - **When**: 完了報告を確認する
  - **Then**: 次のステップとして `/issue/issue-create` が推奨される

**品質基準**: 各要件は 測定可能・一意・実装可能 であること。

## 非機能要件（オプション）

- 8つの主要ハーネス間での移植性を確保するため、汎用的な `build` エージェント型を使用

## スコープ

### 対象

- `.opencode/commands/issue/issue-req.md`
- `.opencode/commands/issue/issue-create.md`
- `.opencode/commands/issue/issue-work.md`
- `.opencode/commands/issue/issue-update.md`
- `.opencode/commands/issue/issue-close.md`
- `.opencode/commands/issue/issue-next.md`

### 対象外

- エージェント定義の新規作成
- load_skillsの変更
- コマンド本文の変更

## 関連情報（オプション）

- **Issue**: #30
- **PR**: #31
