---
id: REQ-0002
title: "全14スキルのSkill Authoring Best Practices準拠改善"
classification: NFR
category: maintainability
status: created
adr: null
created: "2026-05-06"
updated: "2026-05-06"
tags: [skills, best-practices, refactoring]
related_to: []
depends_on: []
---

> このドキュメントは①バイブス壁打ちフェーズで作成されます。

# 全14スキルのSkill Authoring Best Practices準拠改善

## 背景・課題

既存14個のSKILL.mdの多くが、LLMが既に知っている概念を過剰に説明し、コンテキストウィンドウを浪費している。特に`conventional-commits`（205行+551行参照ファイル）と`commands-creator`（188行）はチュートリアル化している。また、`archive-completed-plan`のスクリプトパスが誤っている（存在しないパスを指している）。

## 目標

全14スキルをSkill Authoring Best Practicesのチェックリストに準拠させ、コンテキスト消費を最適化する。

## 方向性

1. LLM既知の説明を削除し、プロジェクト固有ルールのみ残す（Concise原則）
2. description を3人称＋トリガーキーワード形式に統一
3. バックスラッシュパスをフォワードスラッシュに統一
4. 重複セクション・タイポを修正

## 機能要件

### P1: 重大な改善（4スキル）

- [ ] conventional-commits: SKILL.mdをプロジェクト固有ルールのみに削減（205行→~30行）
  - **Given**: SKILL.mdが205行+551行参照ファイルで構成されている
  - **When**: LLM既知のCC仕様説明を削除し、プロジェクト固有ルールのみ残す
  - **Then**: SKILL.mdが~30行に削減され、references/types.mdが削除される

- [ ] conventional-commits: descriptionを3人称＋トリガーに変更
  - **Given**: descriptionが「コミットメッセージをConventional Commits v1.0.0仕様に従って生成したい時」（2人称）
  - **When**: 3人称＋トリガーキーワード形式に変更する
  - **Then**: 「Generates commit messages following Conventional Commits v1.0.0 spec. Use when creating commits, writing commit messages, or formatting commit history.」相当になる

- [ ] commands-creator: SKILL.mdをプロジェクト固有ルールのみに削減（188行→~30行）
  - **Given**: SKILL.mdが188行のOpenCodeコマンド仕様チュートリアル
  - **When**: LLM既知の仕様説明を削除し、プロジェクト固有の配置場所・命名規約のみ残す
  - **Then**: SKILL.mdが~30行に削減される

- [ ] commands-creator: descriptionを3人称＋トリガーに変更
  - **Given**: descriptionが2人称形式
  - **When**: 3人称＋トリガーキーワード形式に変更する
  - **Then**: 「Creates and configures OpenCode custom commands for automating recurring tasks. Use when creating commands, setting up command templates, or configuring agent/model bindings.」相当になる

- [ ] adr-guidelines: SKILL.mdをプロジェクト固有ルールのみに削減（67行→~20行）
  - **Given**: SKILL.mdが一般的なADR評価基準を過剰に説明している
  - **When**: LLM既知のADR概念説明を削除し、プロジェクト固有の保存先・命名・ステータスのみ残す
  - **Then**: SKILL.mdが~20行に削減される

- [ ] archive-completed-plan: スクリプトパスを修正
  - **Given**: スクリプトパスが`C:/Users/ogatay/.config/opencode/skills/archive-completed-plan/archive_plan.py`を指しているが、実際は`.opencode/skills/archive-completed-plan/archive_plan.py`にある
  - **When**: プロジェクト相対パスに修正する
  - **Then**: 正しいパス`.opencode/skills/archive-completed-plan/archive_plan.py`に修正される

### P2: 中程度の改善（5スキル）

- [ ] git-worktree: バックスラッシュパスを修正（L120）
  - **Given**: L120に`C:\path\to\repo\.worktrees\516-fix`がある
  - **When**: フォワードスラッシュに修正する
  - **Then**: `C:/path/to/repo/.worktrees/516-fix`に修正される

- [ ] tips-capture: Example Workflowを参照ファイルに分割（126行→~60行）
  - **Given**: Example Workflow（L72-108）が~37行を占めている
  - **When**: references/example.mdに分割する
  - **Then**: SKILL.mdが~60行に削減される

- [ ] issue-guide: 重複概要セクションを統合
  - **Given**: L8とL14-15に重複する概要説明がある
  - **When**: 1つの概要セクションに統合する
  - **Then**: 重複が解消される

- [ ] req-analysis: 重複概要セクションを統合
  - **Given**: L8-11とL15-19に重複する概要説明がある
  - **When**: 1つの概要セクションに統合する
  - **Then**: 重複が解消される

- [ ] req-file-manager: タイポ修正（L27）
  - **Given**: L27に「空き番号があても」がある
  - **When**: 修正する
  - **Then**: 「空き番号があっても」に修正される

### P3: 軽微な改善 — description改善（7スキル）

- [ ] git-worktree: descriptionにトリガーキーワード追加
  - **Given**: descriptionにトリガーキーワードが不足
  - **When**: 3人称＋トリガーキーワード形式に変更する
  - **Then**: 「Manages git worktree creation, switching, and cleanup based on Issue numbers. Use when creating worktrees, switching between branches, or cleaning up completed worktrees.」相当になる

- [ ] tips-capture: descriptionにトリガーキーワード追加
  - **Given**: descriptionにトリガーキーワードが不足
  - **When**: 3人称＋トリガーキーワード形式に変更する
  - **Then**: トリガーが明確になる

- [ ] req-analysis: descriptionにトリガーキーワード追加
  - **Given**: descriptionにトリガーキーワードが不足
  - **When**: 3人称＋トリガーキーワード形式に変更する
  - **Then**: トリガーが明確になる

- [ ] req-file-manager: descriptionにトリガーキーワード追加
  - **Given**: descriptionにトリガーキーワードが不足
  - **When**: 3人称＋トリガーキーワード形式に変更する
  - **Then**: トリガーが明確になる

- [ ] deviation-check: descriptionにトリガーキーワード追加
  - **Given**: descriptionにトリガーキーワードが不足
  - **When**: 3人称＋トリガーキーワード形式に変更する
  - **Then**: トリガーが明確になる

- [ ] obsidian-vault-review: descriptionにトリガーキーワード追加
  - **Given**: descriptionにトリガーキーワードが不足
  - **When**: 3人称＋トリガーキーワード形式に変更する
  - **Then**: トリガーが明確になる

- [ ] obsidian-note-workflow: descriptionにトリガーキーワード追加
  - **Given**: descriptionにトリガーキーワードが不足
  - **When**: 3人称＋トリガーキーワード形式に変更する
  - **Then**: トリガーが明確になる

### 変更なし（2スキル）

- `gh-cli-best-practices`: 既に良好
- `obsidian-skill-maintainer`: 既に良好

**品質基準**: 各要件は 測定可能・一意・実装可能 であること。

## 非機能要件

- 各SKILL.mdは500行以内（現在すべてクリア、改善後も維持）
- description は「何をするか + いつ使うか + トリガーキーワード」の3要素を含む
- すべてのパスでフォワードスラッシュ（`/`）を使用

## スコープ

### 対象

- `.opencode/skills/` 配下の全14スキルのSKILL.md
- `conventional-commits/references/types.md`（削除対象）
- `tips-capture/references/example.md`（新規作成）

### 対象外

- `.opencode/commands/` 配下のコマンドファイル
- `docs/` 配下のドキュメント（REQ・ADR等）
- obsidian-*系スキルのreferences/内ファイル（内容変更なし）

## 関連情報

- **ベストプラクティス参照**: `.opencode/skills/skill-authoring-best-practices/SKILL.md`
