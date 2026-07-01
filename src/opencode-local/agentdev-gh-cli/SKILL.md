---
name: agentdev-gh-cli
description: AgentDevFlow のローカル版 I/O 境界（REQ-0150, ADR-0130）。標準版 agentdev-gh-cli と同一の手続き名で、Issue/PR 相当の読み書きを Case ファイル（`.agentdev/cases/case-{NNNN}.md`）へ読み替える。上位 command/skill は標準版と同じく agentdev-gh-cli のみを参照し、ローカル版であることを意識しない。USE FOR: Case ファイル作成、Case ファイル本文読込、Case ファイル本文更新、作業ログ追記、PR 相当セクション（マージ前確認・SPEC確定候補・Findings）読み書き、マージ結果記録、Case close、書き込み後 VERIFY。DO NOT USE FOR: 本文生成、完了判定、Epic 依存判定、capture 分類（domain skill 担当）、一般 git 操作（agentdev-git-worktree 担当）。
---

# agentdev-gh-cli（ローカル版）

ローカル版 OpenCode における agentdev-gh-cli の原本（REQ-0150, ADR-0130 decision #4, #5）。
標準版（GitHub 版）と同一の手続き名を提供し、Issue/PR 相当の読み書きを Case ファイル（`.agentdev/cases/case-{NNNN}.md`）へ読み替える。
上位 command/skill は本スキルと標準版を区別せず、常に `agentdev-gh-cli` のみを参照する（REQ-0150-003）。
GitHub 非依存の抽象 backend は新設せず、標準版と同じ GitHub 前提の手続き名を保ちつつ、実装を Case ファイル I/O に差し替える（REQ-0150-008）。

## 責務

### 担当

| 区分 | 内容 |
|---|---|
| I/O 手続き | Case ファイル作成、Case ファイル本文読込、Case ファイル本文更新、作業ログ追記、PR 相当セクション読み書き、マージ結果記録、Case close |
| VERIFY | 書き込み後の読み戻し検証（エンコーディング、Markdown 構造、必須セクション、リポジトリ参照リンク正規化） |

### 非担当

| 区分 | 担当 |
|---|---|
| 本文生成 | domain skill（agentdev-issue-management、agentdev-epic-tracker 等） |
| 完了判定 | command（case-close 等） |
| Epic 依存判定 | domain skill（agentdev-epic-tracker） |
| capture 分類 | domain skill（agentdev-intake-pipeline、agentdev-learning-pipeline） |

## 手続き

各手続きの操作契約（引数、戻り値、エラー扱い）は [references/contracts.md](references/contracts.md) 参照。ローカル版（Case ファイル版）の具体的実装手順は [references/local-procedures.md](references/local-procedures.md) 参照。

標準版（GitHub 版）の手続き名と一対一に対応する（REQ-0150-001）。

| 標準版手続き | ローカル版での読み替え先 |
|---|---|
| Issue 作成 | Case ファイル新規作成（YAML 前書き + 本文） |
| Issue 本文読込 | Case ファイル読込 |
| Issue 本文更新 | Case ファイル本文更新（YAML 前書き含む） |
| Issue コメント追加 | `## 作業ログ` へ追記 |
| PR 作成 | Case ファイルの PR 相当セクション追記（`## マージ前確認`、`## SPEC確定候補`、`## Findings / Capture候補`） |
| PR 本文読込 | Case ファイルの PR 相当セクション読込 |
| PR merge | `## マージ結果` へ記録 |
| Issue close | `status: closed` + `closed_at` 更新 |
| VERIFY | Case ファイル読み戻し検証（Markdown 構造、必須セクション） |

PR 関連手続きはスキップせず、Case ファイルの対応セクションで代替する（REQ-0150-002, ADR-0130 decision #5）。
対応表の意味仕様の正本は SPEC [agentdev-gh-cli.md](../../../../../docs/specs/skills/agentdev-gh-cli.md) の「差し替え可能性（ローカル版）」セクション。

## VERIFY

書き込み操作の直後に実施する。観点は標準版と同じ4つ: エンコーディング、Markdown 構造、必須セクション、リポジトリ参照リンク正規化。
実装観点と検査項目は [references/verify.md](references/verify.md) 参照。
失敗時の3段階リトライ（同一内容リトライ、内容再生成、停止）は [references/retry.md](references/retry.md) 参照。

## 適用対象

- ローカル版 OpenCode で Case ファイルを操作するすべての command と skill（REQ-0150-001）
- Case ファイル `.agentdev/cases/case-{NNNN}.md` の読み書き
- 標準版 agentdev-gh-cli と差し替え可能であること（上位 command/skill は変更なしで接続できること）

## 対象外

- GitHub Issue/PR の直接操作（標準版 agentdev-gh-cli の担当）
- 一般的な git 操作（`agentdev-git-worktree` 担当）
- 本文生成、完了判定、Epic 依存判定、capture 分類（domain skill 担当）
- Case ファイルの詳細スキーマ（正本は [docs/specs/local/local-case-file.md](../../../../../docs/specs/local/local-case-file.md)。[case-schema/](case-schema/case-file.md) は操作用定義）

## Case ファイルスキーマ（操作用定義）

Case ファイルの YAML 前書き、status enum、labels 値域、見出し一覧、採番規則は [case-schema/case-file.md](case-schema/case-file.md) 参照。
機械可読定義は [case-schema/rules/](case-schema/rules/) 配下（`frontmatter.yaml`, `status.yaml`, `labels.yaml`, `headings.yaml`）。
これらは操作用定義であり、意味仕様の正本は SPEC [local/local-case-file.md](../../../../../docs/specs/local/local-case-file.md) である（REQ-0150-007）。

## 関連項目

- SPEC [agentdev-gh-cli.md](../../../../../docs/specs/skills/agentdev-gh-cli.md)（手続きと Case ファイルセクションの対応表の正本）
- SPEC [local/local-case-file.md](../../../../../docs/specs/local/local-case-file.md)（Case ファイルスキーマの正本）
- [REQ-0150](../../../../../docs/requirements/REQ-0150.md)（ローカル版 agentdev-gh-cli 実装）
- [ADR-0130](../../../../../docs/adr/ADR-0130.md)（agentdev-gh-cli を差し替え可能な I/O 境界として確立）
- 標準版 [../../skills/agentdev-gh-cli/SKILL.md](../../skills/agentdev-gh-cli/SKILL.md)（GitHub 版の原本。差し替え元）
