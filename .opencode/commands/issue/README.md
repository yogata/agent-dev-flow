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

## スキル一覧

ロジックと知識ベースを提供するスキル群。コマンドはこれらの薄いdispatcher。

| スキル | 役割 |
|---|---|
| `issue-guide-phases` | フェーズ定義・SSoT遷移・パターン判定・コマンド関連・docs構造 |
| `issue-guide-reports` | 完了報告フォーマット・チェックボックス更新・サブエージェント出力ポリシー |
| `issue-guide-review` | レビューNG対応フロー・issue-next推論ルール |
| `req-analysis` | 要件分析手法（機能・非機能の分析・品質基準） |
| `req-file-manager` | REQファイル管理（作成・追記・更新・バリデーション） |
| `spec-compliance` | 乖離検出（要件とのズレ検知・ループバック判定） |
| `adr-guidelines` | ADR閾値判定（アーキテクチャ級の決定） |
| `adr-file-manager` | ADRファイル管理（作成・追記・更新・バリデーション） |

## コマンド一覧

L2薄化形式（Input/Output/Steps+スキル参照/Guardrails）。詳細は各コマンドファイルを参照。

| コマンド | 役割 | スキル参照 |
|---|---|---|
| `/issue/issue-req` | 要件定義（壁打ち） | req-analysis, adr-guidelines, issue-guide-phases, issue-guide-reports |
| `/issue/issue-save-req` | REQ/ADR保存 | req-file-manager, adr-file-manager, adr-guidelines, issue-guide-phases, issue-guide-reports, conventional-commits |
| `/issue/issue-create` | Issue登録 | issue-guide-phases, issue-guide-reports, gh-cli-best-practices, req-file-manager, req-analysis, adr-file-manager |
| `/issue/issue-work` | 実装パイプライン（3フェーズ構成: 準備→実装→提出）。複数Issueの並列実行に対応 | req-analysis, spec-compliance, issue-guide-phases, issue-guide-reports, issue-guide-review, git-worktree, req-file-manager, adr-file-manager, conventional-commits |
| `/issue/issue-update` | Issue更新 | issue-guide-phases, issue-guide-reports, issue-guide-review, gh-cli-best-practices, req-file-manager, req-analysis, spec-compliance |
| `/issue/issue-close` | 完了処理 | issue-guide-phases, issue-guide-reports, tips-capture, archive-completed-plan, gh-cli-best-practices, git-worktree, req-file-manager |
| `/issue/issue-next` | 次コマンド推論 | issue-guide-phases, issue-guide-review, spec-compliance, req-analysis |
| `/issue/issue-backlog` | バックログ抽出（ショートカット経路） | issue-guide-phases, issue-guide-reports, gh-cli-best-practices |

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

`templates/` ディレクトリに配置。詳細は `issue-guide-phases` スキルを参照。

| テンプレート | 用途 | ラベル |
|---|---|---|
| `issue_desc_feature.md` | 機能追加 | `enhancement`, `feature` |
| `issue_desc_bug.md` | バグ修正 | `bug` |
