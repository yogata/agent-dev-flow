---
description: issue コマンドセットの使用ガイド
---

# issue コマンド使用ガイド

機能追加とバグ修正を統一された `issue` コマンドセットでサポートします。

> **注意**: req/case パイプラインコマンド（`issue-req`, `issue-save-req`, `issue-create`, `issue-work`, `issue-update`, `issue-close`）は `/agentdev/*` に移行しました。
> 詳細は [agentdev コマンドガイド](../agentdev/README.md) を参照。

## 3マクロフェーズ

| フェーズ | 内容 | コマンド |
|---|---|---|
| 壁打ち | 要件定義・技術判断を壁打ちで決定 | `/agentdev/req-define` → `/agentdev/req-save` → `/agentdev/case-open` |
| 構造的実行 | TDD・コーディング・デバッグを実行 | `/agentdev/case-run` |
| レビュー完了 | PR・マージ・決定事項クローズ | `/agentdev/case-close` |

**イメージ違ったら**: 要件定義に立ち戻り壁打ちからやり直し（`/agentdev/req-define`）

**ショートカット経路**: `/issue/issue-backlog` — 壁打ちから直接バックログ抽出を実行

> **補足**: `/agentdev/case-open` は壁打ち(①)と構造的実行(②)の境界に位置するコマンド（①→②境界）。要件docを入力としてGitHub Issueを出力する。

## 主要スキル

※ 各コマンドの load_skills が SSoT（Single Source of Truth）。以下は主要スキルの抜粋。

ロジックと知識ベースを提供するスキル群。コマンドはこれらの薄いdispatcher。

| スキル | 役割 |
|---|---|
| `agentdev-workflow-lifecycle` | フェーズ定義・SSoT遷移・パターン判定・コマンド関連・docs構造 |
| `agentdev-workflow-reporting` | 完了報告フォーマット・チェックボックス更新・サブエージェント出力ポリシー |
| `agentdev-workflow-routing` | レビューNG対応フロー・issue-next推論ルール |
| `agentdev-req-analysis` | 要件分析手法（機能・非機能の分析・品質基準） |
| `agentdev-req-file-manager` | REQファイル管理（作成・追記・更新・バリデーション） |
| `agentdev-spec-compliance` | 乖離検出（要件とのズレ検知・ループバック判定） |
| `agentdev-adr-guidelines` | ADR閾値判定（アーキテクチャ級の決定） |
| `agentdev-adr-file-manager` | ADRファイル管理（作成・追記・更新・バリデーション） |

## コマンド一覧

### agentdev コマンド（メインパイプライン）

| コマンド | 役割 | スキル参照 |
|---|---|---|
| `/agentdev/req-define` | 要件定義（壁打ち） | agentdev-req-analysis, agentdev-req-file-manager, agentdev-adr-guidelines, agentdev-workflow-lifecycle, agentdev-workflow-reporting |
| `/agentdev/req-save` | REQ/ADR保存 | agentdev-req-file-manager, agentdev-adr-file-manager, agentdev-adr-guidelines, agentdev-workflow-lifecycle, agentdev-workflow-reporting, agentdev-conventional-commits |
| `/agentdev/case-open` | Case登録 | agentdev-workflow-lifecycle, agentdev-workflow-reporting, agentdev-gh-cli, agentdev-req-file-manager, agentdev-req-analysis, agentdev-adr-file-manager, agentdev-workflow-templates |
| `/agentdev/case-run` | 実装パイプライン（3フェーズ構成: 準備→実装→提出）。複数Issueの並列実行に対応 | agentdev-req-analysis, agentdev-spec-compliance, agentdev-workflow-lifecycle, agentdev-workflow-reporting, agentdev-workflow-routing, agentdev-workflow-orchestration, agentdev-git-worktree, agentdev-gh-cli, agentdev-req-file-manager, agentdev-adr-file-manager, agentdev-conventional-commits, agentdev-epic-tracker, agentdev-workflow-templates |
| `/agentdev/case-update` | Case更新 | agentdev-workflow-lifecycle, agentdev-workflow-reporting, agentdev-workflow-routing, agentdev-gh-cli, agentdev-req-file-manager, agentdev-req-analysis, agentdev-spec-compliance, agentdev-workflow-templates |
| `/agentdev/case-close` | 完了処理 | agentdev-workflow-lifecycle, agentdev-workflow-reporting, agentdev-learning-capture, agentdev-archive-plan, agentdev-gh-cli, agentdev-git-worktree, agentdev-req-file-manager, agentdev-epic-tracker, agentdev-workflow-templates |

### issue コマンド（補助）

| コマンド | 役割 | スキル参照 |
|---|---|---|
| `/issue/issue-next` | 次コマンド推論（セッションコンテキストのみ参照） | agentdev-workflow-lifecycle, agentdev-workflow-routing, agentdev-spec-compliance, agentdev-req-analysis |
| `/issue/issue-backlog` | バックログ抽出（ショートカット経路） | agentdev-workflow-lifecycle, agentdev-workflow-reporting, agentdev-gh-cli |
| `/agentdev/intake-open` | Intake Issue作成（intake-promote 生成 artifact から GitHub Issue 作成） | agentdev-agentdev-gh-cli, agentdev-agentdev-epic-tracker, agentdev-case-templates |

## 基本フロー

```
/agentdev/req-define → /agentdev/req-save → /agentdev/case-open → /agentdev/case-run → /agentdev/case-close
```

ループバック: `/issue/issue-next` が乖離検出時に `/agentdev/req-define` へ戻すことを提案。

## 各コマンドの詳細

- `/agentdev/req-define` — [req-define.md](../agentdev/req-define.md)
- `/agentdev/req-save` — [req-save.md](../agentdev/req-save.md)
- `/agentdev/case-open` — [case-open.md](../agentdev/case-open.md)
- `/agentdev/case-run` — [case-run.md](../agentdev/case-run.md)
- `/agentdev/case-update` — [case-update.md](../agentdev/case-update.md)
- `/agentdev/case-close` — [case-close.md](../agentdev/case-close.md)
- `/issue/issue-next` — [issue-next.md](./issue-next.md)
- `/issue/issue-backlog` — [issue-backlog.md](./issue-backlog.md)

## テンプレート

- **Issue/PR description テンプレート**: `.opencode/skills/agentdev-workflow-templates/templates/` に配置（PR本文テンプレート含む）。詳細は `agentdev-workflow-templates` スキルを参照。

| テンプレート | 用途 | ラベル |
|---|---|---|
| `issue_desc_feature.md` | 機能追加 | `enhancement`, `feature` |
| `issue_desc_bug.md` | バグ修正 | `bug` |
| `issue_desc_epic.md` | Epic Issue本文テンプレート | case-open (Epic flow) |
| `issue_desc_child.md` | 子Issue本文テンプレート | case-open (Epic flow) |

## 使用例

### Epic（大規模機能追加）の例

複数モジュールにまたがる大規模機能追加の場合:

1. `/agentdev/req-define` — 要件壁打ち（規模判定: Epic）
2. `/agentdev/req-save` — REQ保存
3. `/agentdev/case-open` — Epic + 子Issue一括作成
4. `/agentdev/case-run 101 102 103` — 子Issue並列実行（最大5件）
5. 各子Issueの `/agentdev/case-close` 完了後、Epic自動クローズ
