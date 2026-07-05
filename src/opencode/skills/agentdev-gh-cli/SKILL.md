---
name: agentdev-gh-cli
description: AgentDevFlow の GitHub Issue/PR I/O を集約する中央集権的な I/O 境界（REQ, ADR）。command と skill は gh コマンドを直接記述せず、本スキルの手続きへ委譲する。USE FOR: Issue 作成、Issue 本文読込、Issue 本文更新、Issue コメント追加、PR 本文読込、PR merge、Issue close、書き込み後 VERIFY。DO NOT USE FOR: 本文生成、完了判定、Epic 依存判定、capture 分類（domain skill 担当）、一般 git 操作（`agentdev-git-worktree` 担当）。
---

# `agentdev-gh-cli`

GitHub Issue/PR の I/O 手続きと VERIFY を集約する中央集権的な I/O 境界（REQ, ADR）。
command と skill は gh コマンドを直接記述せず、本スキルの手続きへ委譲する（REQ/006/007）。

## 責務

### 担当

| 区分 | 内容 |
|---|---|
| I/O 手続き | Issue 作成、Issue 本文読込、Issue 本文更新、Issue コメント追加、PR 本文読込、PR merge、Issue close |
| WRITE 手続きの Windows encoding 初期化 | Windows 環境での WRITE 手続き（Issue 作成、Issue 本文更新、Issue コメント追加、PR merge、Issue close 等）においてコンソールエンコーディング初期化（standard-procedures Section 2 Step 0）を必須前置すること（REQ） |
| VERIFY | 書き込み後の読み戻し検証（エンコーディング、Markdown 構造、テンプレート必須セクション、リポジトリ参照リンク正規化） |

### 非担当

| 区分 | 担当 |
|---|---|
| 本文生成 | domain skill（`agentdev-issue-management`、`agentdev-epic-tracker` 等） |
| 完了判定 | command（case-close 等） |
| Epic 依存判定 | domain skill（`agentdev-epic-tracker`） |
| capture 分類 | domain skill（`agentdev-intake-pipeline`、`agentdev-learning-pipeline`） |

## 手続き

各手続きの操作契約（引数、戻り値、エラー扱い）は [references/contracts.md](references/contracts.md) 参照。
標準版（GitHub 版）の具体的実装手順は [references/standard-procedures.md](references/standard-procedures.md) 参照。

| 手続き | 入力 | 出力 |
|---|---|---|
| Issue 作成 | タイトル、本文、ラベル | Issue 番号、Issue URL |
| Issue 本文読込 | Issue 番号 | Issue 本文（Markdown） |
| Issue 本文更新 | Issue 番号、本文 | なし（VERIFY で確認） |
| Issue コメント追加 | Issue 番号、コメント本文 | なし（VERIFY で確認） |
| PR 作成 | タイトル、本文、ベースブランチ、ヘッドブランチ | PR 番号、PR URL |
| PR 本文読込 | PR 番号 | PR 本文（Markdown） |
| PR merge | PR 番号、merge 方式 | merge コミットハッシュ |
| Issue close | Issue 番号、close 理由 | なし |

## VERIFY

書き込み操作の直後に実施する。
観点は4つ: エンコーディング、Markdown 構造、テンプレート必須セクション、リポジトリ参照リンク正規化。
実装観点と検査項目は [references/verify.md](references/verify.md) 参照。
失敗時の3段階リトライ（同一内容リトライ、内容再生成、停止）は [references/retry.md](references/retry.md) 参照。

## 差し替え可能性（ローカル版）

ローカル版は本スキルを差し替え、同一手続き名で Case ファイル（`.agentdev/cases/case-{NNNN}.md`）の読み書きへ読み替える（REQ-0150, ADR-0130 decision #4, #5）。
PR 関連手続きはスキップせず、Case ファイルの対応セクションで代替する。
手続きと Case ファイルセクションの対応は SPEC `agentdev-gh-cli`.md 参照。

## WRITE 手続きの Windows encoding 初期化必須化（REQ）

Windows 環境（Windows PowerShell 5.x / pwsh 7）では、全 WRITE 手続き（Issue 作成、Issue 本文更新、Issue コメント追加、PR 作成、PR merge、Issue close 等）の実行前にコンソールエンコーディング初期化を**必須前置**する。

- **対象外**: READ 手続き（読み取りには Node.js `execSync` を使用し、コンソールエンコーディングに依存しない）
- **対象外環境**: Linux/ macOS/ WSL 等（既定で UTF-8 コンソールのため実行不要）
- **理由**: 既定の Shift-JIS コンソール（`chcp 932`）では gh CLI が `--title` の日本語引数やメタデータを Shift-JIS として扱い、UTF-8 BOM なしファイルを `--body-file` で指定しても mojibake が発生する
- **手続き位置**: [references/standard-procedures.md](references/standard-procedures.md) Section 2 Step 0。全 WRITE 手続きは Section 2 の標準手順に従うため、Step 0 を経由して本初期化の恩恵を受ける
- **VERIFY 連携**: encoding 初期化実行確認は [references/verify.md](references/verify.md) の「encoding 初期化実行確認」参照

gh WRITE 操作を行う全 command/ skill は本手続き経由で Step 0 の恩恵を受ける構成とする（委譲基盤 REQ/006/007）。

## 適用対象

- GitHub Issue/PR を操作するすべての command と skill（REQ）
- Windows PowerShell 環境での gh CLI 実行（標準版、[references/standard-procedures.md](references/standard-procedures.md)）
- ローカル版での Case ファイル読み書き（ローカル版）

## 対象外

- 一般的な git 操作（`agentdev-git-worktree` 担当）
- 本文生成、完了判定、Epic 依存判定、capture 分類（domain skill 担当）

## 関連項目

- SPEC `agentdev-gh-cli`.md
- 関連 REQ / ADR 一覧は各インデックス（`docs/requirements/README.md`, `docs/adr/README.md`）を参照
