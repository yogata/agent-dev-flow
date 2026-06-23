---
title: agentdev-gh-cli SPEC
status: draft
created: 2026-06-21
updated: 2026-06-23
---

# agentdev-gh-cli SPEC

## 目的

agentdev-gh-cli は AgentDevFlow の GitHub I/O を一箇所に集約する中央集権的な I/O 境界である（REQ-0149, ADR-0130）。
command と skill は GitHub CLI（gh）コマンドを直接記述せず、agentdev-gh-cli の手続きへ委譲する。
ローカル版は agentdev-gh-cli を差し替えることで GitHub 非依存の運用を実現する（REQ-0150, ADR-0130）。

## 責務定義

agentdev-gh-cli は GitHub Issue / PR に対する I/O 手続きと VERIFY を担当する（REQ-0149, ADR-0130 decision #2）。
本文生成、完了判定、Epic 依存判定、capture 分類は担当しない。
これらは domain skill の責務である。

### 担当

| 区分 | 内容 |
|---|---|
| I/O 手続き | Issue 作成、Issue 本文読込、Issue 本文更新、Issue コメント追加、PR 本文読込、PR merge、Issue close |
| VERIFY | 書き込み後の読み戻し検証（エンコーディング、Markdown 構造、テンプレート必須セクション、リポジトリ参照リンク正規化） |

### 非担当

| 区分 | 担当 |
|---|---|
| 本文生成 | domain skill（agentdev-issue-management、agentdev-epic-tracker 等） |
| 完了判定 | command（case-close 等） |
| Epic 依存判定 | domain skill（agentdev-epic-tracker） |
| capture 分類 | domain skill（agentdev-intake-pipeline、agentdev-learning-pipeline） |

## 操作契約

agentdev-gh-cli は以下の手続きを提供する（REQ-0149, ADR-0130 decision #3）。
各手続きの引数、戻り値、エラー扱いの詳細は references を参照。

| 手続き | 入力 | 出力 |
|---|---|---|
| Issue 作成 | タイトル、本文、ラベル | Issue 番号、Issue URL |
| Issue 本文読込 | Issue 番号 | Issue 本文（Markdown） |
| Issue 本文更新 | Issue 番号、本文 | なし（VERIFY で確認） |
| Issue コメント追加 | Issue 番号、コメント本文 | なし（VERIFY で確認） |
| PR 本文読込 | PR 番号 | PR 本文（Markdown） |
| PR merge | PR 番号、merge 方式 | merge コミットハッシュ |
| Issue close | Issue 番号 | なし |
| VERIFY | 操作対象の識別子 | 検証結果（PASS / FAIL、検証観点別結果） |

### VERIFY の観点

VERIFY は以下の 4 観点で実施する。

- エンコーディング（UTF-8 BOM なし、LF）
- Markdown 構造
- テンプレート必須セクション
- リポジトリ参照リンク正規化

リポジトリ参照リンク正規化は裸パス、相対パスを検出する。

## 薄いルーティング入口と references 分離

agentdev-gh-cli の SKILL.md は薄いルーティング入口とする（REQ-0149, ADR-0130 decision #3）。
操作契約の詳細、標準版（GitHub 版）の具体的実装手順、VERIFY 観点、リトライロジックは references 配下に分離する。

### references 構成

| ファイル | 内容 |
|---|---|
| references/contracts.md | 操作契約（手続き名、引数、戻り値、エラー扱い） |
| references/standard-procedures.md | 標準版の具体的実装手順（gh CLI のフラグ、`--body-file`、`chcp 65001` 等） |
| references/verify.md | VERIFY の実装観点と検査項目 |
| references/retry.md | 3 段階リトライロジック（同一内容リトライ、内容再生成、停止、ユーザー報告） |

### SKILL.md の役割

SKILL.md は各手続きのルーティングのみを記述する。
具体的な gh CLI フラグ、一時ファイル扱い、エンコーディング初期化は SKILL.md に直接記述しない。

## 差し替え可能性（ローカル版）

ローカル版は agentdev-gh-cli を差し替え、同一手続き名で Case ファイル（`.agentdev/cases/case-{NNNN}.md`）の読み書きへ読み替える（REQ-0150, ADR-0130 decision #4, #5）。
PR 関連手続きはスキップせず、Case ファイルの対応セクションで代替する（ADR-0130 decision #5）。

### 手続きと Case ファイルセクションの対応

| 標準版手続き | ローカル版での読み替え先 |
|---|---|
| Issue 作成 | Case ファイル新規作成（`## 入力`、`## 背景` 等） |
| Issue 本文読込 | Case ファイル読込 |
| Issue 本文更新 | Case ファイル本文更新 |
| Issue コメント追加 | `## 作業ログ` へ追記 |
| PR 本文読込 | Case ファイル読込（`## マージ前確認`、`## SPEC確定候補`、`## Findings / Capture候補`） |
| PR merge | `## マージ結果` へ記録 |
| Issue close | `status: closed` + `closed_at` 更新 |
| VERIFY | Case ファイル読み戻し検証（Markdown 構造、必須セクション） |

詳細は [ローカル Case ファイル](../local-case-file.md) 参照。

## 適用対象

- GitHub Issue / PR を操作するすべての command と skill（REQ-0149）
- Windows PowerShell 環境での gh CLI 実行（標準版）
- ローカル版での Case ファイル読み書き（ローカル版）

## 対象外

- 一般的な git 操作（`agentdev-git-worktree` 担当）
- 本文生成、完了判定、Epic 依存判定、capture 分類（domain skill 担当）

## 関連項目

- [agentdev-issue-management.md](agentdev-issue-management.md)
- [ローカル Case ファイル](../local-case-file.md)
- [REQ-0149](../../requirements/REQ-0149.md)（agentdev-gh-cli 手続き委譲基盤）
- [REQ-0150](../../requirements/REQ-0150.md)（ローカル版 agentdev-gh-cli 実装）
- [ADR-0130](../../adr/ADR-0130.md)（agentdev-gh-cli を差し替え可能な I/O 境界として確立）
