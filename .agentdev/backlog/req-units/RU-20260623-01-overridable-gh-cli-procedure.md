---
source_type: chat
generated_by: session
generated_at: 2026-06-23T13:26:09+09:00
status: draft
sources:
  - type: chat
    path: session:2026-06-23-overridable-gh-cli-procedure
---

# gh-cli手続き委譲によるGitHub操作責務分離とローカル版上書き対応

## 背景

AgentDevFlow の既存 command / skill には、GitHub Issue / PR に対する `gh` 操作が直接記述されている。

一方で、ローカル版では GitHub Issue / PR を使わず、Case をローカルファイルとして扱う方針がある。GitHub版とローカル版で command / skill を大きく分岐させると、同じ workflow の責務が二重化し、保守範囲が拡散する。

本セッションでは、GitHub操作を中立的な backend に抽象化するのではなく、標準版は `gh` 操作を前提にしたまま、`agentdev-gh-cli` の手続きへ委譲し、ローカル版では同一手続き名を持つ `agentdev-gh-cli` を上書きする方針で合意した。

## 問題

既存 command / skill が `gh issue create`、`gh issue view`、`gh issue edit`、`gh issue comment`、`gh pr view`、`gh pr merge`、`gh issue close` などを直接記述している場合、以下の問題が発生する。

1. GitHub CLI の具体的なフラグ、本文ファイル指定、一時ファイル、エンコーディング対策、再読込 VERIFY の責務が各 command / skill に混在する。
2. ローカル版で GitHub Issue / PR 相当の読み書きを `.agentdev/cases/case-{NNNN}.md` に読み替えられない。
3. PR が存在しないローカル版で、PR本文、PR状態、merge結果、capture 入力源の扱いが command 側に漏れる。
4. GitHub版とローカル版の差分が command / skill 全体に拡散する。

## Source Summary

本セッションで合意した内容は以下である。

- `agentdev-gh-cli` は GitHub操作の既定実装として残す。
- 各 command / skill は `gh` コマンドを直接書かず、`agentdev-gh-cli` の手続きへ委譲する。
- ローカル版では `agentdev-gh-cli` を上書きし、同じ手続き名を `.agentdev/cases/case-{NNNN}.md` の読み書きへ読み替える。
- これは GitHub非依存の抽象 backend 新設ではなく、GitHub前提の `gh-cli` 手続き化と上書き可能化である。
- PR がないローカル版では、PR関連操作を単純にスキップしない。
- PR本文、PR作成済み状態、merge結果に相当する情報は、ローカルCaseファイル内の対応セクションへ読み替える。
- `agentdev-gh-cli` は I/O 手続きと VERIFY を担当し、本文生成、完了判定、Epic 依存判定、capture 分類は担当しない。

## 統合理由

この RU は、ローカル版対応だけを目的とするものではない。

既存 GitHub版でも、`gh` 操作の具体手順を command / skill から分離することで、以下の保守性改善が得られる。

- GitHub CLI の実行手順を一箇所に集約できる。
- Windows / PowerShell / 文字化け / 一時ファイル / `--body-file` / VERIFY の扱いを各 command から排除できる。
- command は workflow の順序、停止条件、完了判定に集中できる。
- domain skill は本文生成、完了条件評価、Epic表解析、capture分類などの意味処理に集中できる。
- ローカル版は command を大きく分岐せず、`agentdev-gh-cli` の上書きで対応しやすくなる。

## 要件化の方向

GitHub操作を直接記述している command / skill を修正し、GitHub操作を `agentdev-gh-cli` の手続きへ委譲する。

標準版の `agentdev-gh-cli` は、既定実装として `gh` コマンドを実行する。

ローカル版の `agentdev-gh-cli` は、標準版と同一の手続き名を提供し、Issue / PR 相当の読み書きを `.agentdev/cases/case-{NNNN}.md` に読み替える。

各 command / skill は GitHub版・ローカル版の分岐を直接持たず、`agentdev-gh-cli` の手続き結果を扱う。

## 主対象REQまたは変更対象候補

主対象REQまたは変更対象候補は以下。

- case-open に関する既存REQ
- case-run に関する既存REQ
- case-close に関する既存REQ
- ローカル版 Case ファイル運用に関する既存REQ
- `agentdev-gh-cli` の責務を定義する SPEC / skill
- GitHub Issue / PR 操作を直接記述している command / skill

具体的な REQ 番号、SPEC 名、対象ファイルの確定は後続の `req-define` で行う。

## 対象外

以下はこの RU の対象外とする。

- GitHub非依存の新規 backend 抽象層の設計
- GitHub版 command とローカル版 command の丸ごと分岐
- Issue本文生成ルールの変更
- 完了条件の達成判定ルールの変更
- Epic Wave の依存判定ルールの変更
- capture の採否判断ルールの変更
- req / spec / adr の整合判断ルールの変更
- 実装手順、コード差分、ファイル単位の修正計画
- 未確認の command / skill 一覧の確定

## 受け入れ条件

- GitHub Issue / PR 操作を行う command / skill は、`gh` コマンドを直接記述せず、`agentdev-gh-cli` の手続きへ委譲している。
- `agentdev-gh-cli` は、Issue作成、Issue本文読込、Issue本文更新、Issueコメント追加、PR本文読込、PR merge、Issue close、VERIFY に相当する手続きを提供している。
- 標準版の `agentdev-gh-cli` は、各手続きの既定実装として `gh` コマンドを実行する。
- ローカル版の `agentdev-gh-cli` は、標準版と同一の手続き名を提供し、Issue / PR 相当の読み書きを `.agentdev/cases/case-{NNNN}.md` に読み替えられる。
- ローカル版では、PR関連手続きを単純にスキップせず、PR本文、PR作成済み状態、merge結果に相当する情報を Case ファイル上の対応セクションから読み書きできる。
- command は workflow 順序、停止条件、完了判定を担当し、GitHub CLI の具体的なフラグ、一時ファイル、エンコーディング対策、再読込 VERIFY を直接記述しない。
- domain skill は本文生成、完了条件評価、Epic表解析、capture分類などの意味処理を担当し、GitHub CLI の具体操作を直接記述しない。
- `agentdev-gh-cli` は I/O 手続きと VERIFY を担当し、本文生成、完了判定、Epic 依存判定、capture 分類を担当しない。
- GitHub版の既存 workflow は、`agentdev-gh-cli` 委譲後も従来と同等の Issue / PR 操作結果を維持する。
