---
description: issue コマンドセットの使用ガイド
---

# issue コマンド使用ガイド

機能追加とバグ修正を統一された `issue` コマンドセットでサポートします。

## 3マクロフェーズ

| フェーズ | 内容 | コマンド |
|---|---|---|
| ①バイブス壁打ち | 要件定義・技術判断を壁打ちで決定 | `/issue/issue-req` → `/issue/issue-save-req` → `/issue/issue-create` |
| ②構造的実行 | TDD・コーディング・デバッグを実行 | `/issue/issue-work` |
| ③レビュー完了 | PR・マージ・決定事項クローズ | `/issue/issue-close` |

**イメージ違ったら**: 要件定義に立ち戻り①からやり直し（`/issue/issue-req`）

**ショートカット経路**: `/issue/issue-backlog` — ①バイブス壁打ちから直接バックログ抽出を実行

## 主要スキル

※ 各コマンドの load_skills が SSoT（Single Source of Truth）。以下は主要スキルの抜粋。

ロジックと知識ベースを提供するスキル群。コマンドはこれらの薄いdispatcher。

| スキル | 役割 |
|---|---|
| `issue-lifecycle` | フェーズ定義・SSoT遷移・パターン判定・コマンド関連・docs構造 |
| `issue-reporting` | 完了報告フォーマット・チェックボックス更新・サブエージェント出力ポリシー |
| `issue-review-routing` | レビューNG対応フロー・issue-next推論ルール |
| `req-analysis` | 要件分析手法（機能・非機能の分析・品質基準） |
| `req-file-manager` | REQファイル管理（作成・追記・更新・バリデーション） |
| `spec-compliance` | 乖離検出（要件とのズレ検知・ループバック判定） |
| `adr-guidelines` | ADR閾値判定（アーキテクチャ級の決定） |
| `adr-file-manager` | ADRファイル管理（作成・追記・更新・バリデーション） |

## コマンド一覧

L2薄化形式（Input/Output/Steps+スキル参照/Guardrails）。詳細は各コマンドファイルを参照。

| コマンド | 役割 | スキル参照 |
|---|---|---|
| `/issue/issue-req` | 要件定義（壁打ち） | req-analysis, req-file-manager, adr-guidelines, issue-lifecycle, issue-reporting |
| `/issue/issue-save-req` | REQ/ADR保存 | req-file-manager, adr-file-manager, adr-guidelines, issue-lifecycle, issue-reporting, conventional-commits |
| `/issue/issue-create` | Issue登録 | issue-lifecycle, issue-reporting, gh-cli-best-practices, req-file-manager, req-analysis, adr-file-manager |
| `/issue/issue-work` | 実装パイプライン（3フェーズ構成: 準備→実装→提出）。複数Issueの並列実行に対応 | req-analysis, spec-compliance, issue-lifecycle, issue-reporting, issue-review-routing, git-worktree, gh-cli-best-practices, req-file-manager, adr-file-manager, conventional-commits, epic-status-tracker |
| `/issue/issue-update` | Issue更新 | issue-lifecycle, issue-reporting, issue-review-routing, gh-cli-best-practices, req-file-manager, req-analysis, spec-compliance |
| `/issue/issue-close` | 完了処理 | issue-lifecycle, issue-reporting, tips-capture, archive-completed-plan, gh-cli-best-practices, git-worktree, req-file-manager, epic-status-tracker |
| `/issue/issue-next` | 次コマンド推論（セッションコンテキストのみ参照） | issue-lifecycle, issue-review-routing |
| `/issue/issue-backlog` | バックログ抽出（ショートカット経路） | issue-lifecycle, issue-reporting, gh-cli-best-practices |

## 基本フロー

```
/issue/issue-req → /issue/issue-save-req → /issue/issue-create → /issue/issue-work → /issue/issue-close
```

ループバック: `/issue/issue-next` が乖離検出時に `/issue/issue-req` へ戻すことを提案。

## 各コマンドの詳細

- `/issue/issue-req` — [issue-req.md](./issue-req.md)
- `/issue/issue-save-req` — [issue-save-req.md](./issue-save-req.md)
- `/issue/issue-create` — [issue-create.md](./issue-create.md)
- `/issue/issue-work` — [issue-work.md](./issue-work.md)
- `/issue/issue-update` — [issue-update.md](./issue-update.md)
- `/issue/issue-close` — [issue-close.md](./issue-close.md)
- `/issue/issue-next` — [issue-next.md](./issue-next.md)
- `/issue/issue-backlog` — [issue-backlog.md](./issue-backlog.md)

## テンプレート

`templates/` ディレクトリに配置。詳細は `issue-lifecycle` スキルを参照。

| テンプレート | 用途 | ラベル |
|---|---|---|
| `issue_desc_feature.md` | 機能追加 | `enhancement`, `feature` |
| `issue_desc_bug.md` | バグ修正 | `bug` |
| `issue_desc_epic.md` | Epic Issue本文テンプレート | issue-create (Epic flow) |
| `issue_desc_child.md` | 子Issue本文テンプレート | issue-create (Epic flow) |

## 使用例

### Epic（大規模機能追加）の例

複数モジュールにまたがる大規模機能追加の場合:

1. `/issue/issue-req` — 要件壁打ち（規模判定: Epic）
2. `/issue/issue-save-req` — REQ保存
3. `/issue/issue-create` — Epic + 子Issue一括作成
4. `/issue/issue-work 101 102 103` — 子Issue並列実行（最大5件）
5. 各子Issueの `/issue/issue-close` 完了後、Epic自動クローズ
