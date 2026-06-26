---
title: ローカル版 OpenCode 生成
status: draft
created: 2026-06-20
updated: 2026-06-23
---

# ローカル版 OpenCode 生成

> **Scope**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である（ADR-0103）。
> ローカル版 OpenCode の link mode 導入フロー、link target 確認、更新運用、ガードレールを定義する。
> 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（ADR-0104）。
> REQ-0141 と ADR-0131 の詳細仕様を原本とする。

## 目的

GitHub Issue / PR を使わない個人利用環境（ローカル版 OpenCode）向けに、AgentDevFlow の command / skill / ひな形を link mode で導入する方式を定義する（REQ-0141, ADR-0131）。
直接生成方式（generate-and-place）は廃止し、agentdev-gh-cli の link 先だけを差し替える構成とする（ADR-0131 decision #1, #3）。

## リポジトリ分離

ローカル版 link mode 導入は以下の 2 リポジトリ構成を前提とする（REQ-0141-002, 006）。

| リポジトリ | 役割 | 主な対象パス |
|---|---|---|
| 仕様管理リポジトリ（AgentDevFlow 本体） | link 先の原本を保持 | `src/opencode/`, `src/opencode-local/agentdev-gh-cli/` |
| 導入先リポジトリ | ローカル版を導入する利用側リポジトリ。`.opencode/` に link を張る | `.opencode/commands/`, `.opencode/skills/`, `.agentdev/cases/` |

ローカル版導入の実体は AgentDevFlow 本体リポジトリでは行わない（REQ-0141-006）。
AgentDevFlow 本体リポジトリの `src/opencode/` と `src/opencode-local/agentdev-gh-cli/` を link 先として参照する。

## src/opencode-local/ ディレクトリ構成

`src/opencode-local/` はローカル版固有の原本のみを保持する（REQ-0141-004, AG-007, AG-008）。
ローカル版の command / skill / ひな形は配置しない。
link mode では `src/opencode/` の原本をそのまま接続するため、ローカル版専用の生成物は不要である。

```text
src/opencode-local/
  README.md              ← ローカル版 link 設定手順
  agentdev-gh-cli/       ← ローカル版 agentdev-gh-cli の原本（case-schema を吸収）
    SKILL.md             ← ローカル版 agentdev-gh-cli のルーティング入口
    references/          ← 操作契約・Case ファイル対応手続き・VERIFY 観点
    case-schema/         ← Case ファイルの操作用定義（正本は docs/specs/local/local-case-file.md）
      case-file.md
      rules/
        frontmatter.yaml
        status.yaml
        labels.yaml
        headings.yaml
```

### 廃止対象

`src/opencode-local/transform/` と `src/opencode-local/generation-flow.md` は link mode では不要となるため廃止候補とする（AG-011, ADR-0131 decision #4）。

### 作成しないディレクトリ

以下は作成しない（REQ-0141-005, AG-007）。

- `src/opencode-local/_conv/`
- `src/opencode-local/commands/`
- `src/opencode-local/skills/`
- `src/opencode-local/requirements/`
- `src/opencode-local/specs/`
- `src/opencode-local/transform/`（廃止候補）
- `src/opencode-local/generation-flow.md`（廃止候補）

`requirements/` と `specs/` は `docs/` 配下の同名ディレクトリと概念衝突するため不採用である。
要件は `docs/requirements/` で一元管理し、`src/opencode-local/` には配置しない。

## link mode 接続フロー

ローカル版導入の全体フローを定義する（REQ-0141-007, ADR-0131 decision #1, #2, #3）。

1. **実行環境の特定**: 導入先リポジトリが AgentDevFlow 本体リポジトリでないことを確認する
2. **link target の確認**: 後述の link target 確認を実施する
3. **通常版 link の設定**: `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/`（agentdev-gh-cli を除く）を `src/opencode/` 配下へ接続する
4. **agentdev-gh-cli の差し替え**: `.opencode/skills/agentdev-gh-cli/` だけを `src/opencode-local/agentdev-gh-cli/` へ接続する
5. **link 設定の検証**: 各 link が意図した target へ解決されることを確認する

link mode では原本がそのまま接続されるため、変換プロンプトの実行やひな形の意味変換は不要である（ADR-0131 decision #4）。

## link target 確認

link 設定前に `.opencode/` 配下の各 path が意図した link target へ解決されることを確認する（REQ-0141-010, AG-012, ADR-0131 decision #6）。
ジャンクションやシンボリックリンク環境での誤接続を防止するためである。

### 確認項目

| 対象 | 期待される link target |
|---|---|
| `.opencode/commands/agentdev/` | `src/opencode/commands/agentdev/` |
| `.opencode/skills/agentdev-*`（agentdev-gh-cli 以外） | `src/opencode/skills/agentdev-*/` |
| `.opencode/skills/agentdev-gh-cli/` | `src/opencode-local/agentdev-gh-cli/` |

### 実装方式

link target 確認は決定的な検査として実装する（ADR-0107, ADR-0131 decision #6）。
AI エージェントの解釈に依存せず、ファイルシステムの実パス解決により機械的に判定する。

### 停止時の扱い

意図した link target 以外へ解決される場合、link 設定を開始せずに停止する。
ユーザーに link 構成の修正を促すメッセージを出す。
link mode 全体を一律停止するのではなく、link target が意図したものであれば許可する（AG-012）。

## 更新運用（unlink / relink）

ローカル版の高頻度更新は想定しない。
更新時は `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を unlink してから relink する（REQ-0141-033, ADR-0131 decision #4）。
差分更新は想定しない。

全削除による再生成は行わない。
link の張り直しで済むため、`generated_by` 識別子による上書き保護は廃止する（ADR-0131 decision #5）。
link による接続であるため、上書き問題が発生しない。

## link 設定レポート出力フォーマット

link 設定後にレポートを出力する。
レポートの必須項目を定義する（REQ-0141-028, AG-009）。

| 項目 | 内容 |
|---|---|
| 仕様管理リポジトリ | AgentDevFlow 本体リポジトリの識別情報 |
| 導入先リポジトリ | ローカル版導入先リポジトリの識別情報 |
| 設定した link 一覧 | 設定した link のリスト（path、link target、種別） |
| link target 確認結果 | 各 link の target 確認結果 |
| 残存する GitHub 固有参照 | 残存する GitHub Issue / PR 参照のリストと違反 / 非違反の判定 |
| 手動確認事項 | 利用者の手動確認が必要な事項 |
| 結果 | `PASS` / `FAIL` |

### 残存 GitHub 固有参照の違反判定基準

| 区分 | 違反 / 非違反 |
|---|---|
| 必須操作として残る GitHub Issue / PR 参照 | 違反 |
| 必須入力として残る GitHub Issue / PR 参照 | 違反 |
| 必須出力として残る GitHub Issue / PR 参照 | 違反 |
| 背景説明の GitHub Issue / PR 参照 | 非違反 |
| GitHub 版との置換表の GitHub Issue / PR 参照 | 非違反 |
| 対象外の説明の GitHub Issue / PR 参照 | 非違反 |
| 用語上の参照 | 非違反 |

## ガードレール一覧

ローカル版 link mode 導入が遵守するガードレールを定義する（REQ-0141-014, AG-009, AG-010, ADR-0131）。

- `src/opencode/` を変更しないこと（REQ-0141-014）
- `src/opencode-local/` を変更しないこと
- link 設定の結果を `src/opencode-local/` 配下へ出力しないこと
- AgentDevFlow 本体リポジトリでローカル版 link 設定を実行しないこと（REQ-0141-006）
- link target が意図した target 以外へ解決される場合は link 設定を停止すること（REQ-0141-010, AG-012）
- `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/`（agentdev-gh-cli 以外）を `src/opencode/` 配下へ接続すること（ADR-0131 decision #2）
- `.opencode/skills/agentdev-gh-cli/` だけを `src/opencode-local/agentdev-gh-cli/` へ接続すること（ADR-0131 decision #3）
- `runtime-overrides/` を設けないこと
- バックエンド抽象化を導入しないこと（REQ-0141-027）
- GitHub 互換ローカルサーバを前提にしないこと（REQ-0141-027）
- GitHub Issue 作成、PR 作成、PR 取り込み、Issue クローズおよび `gh issue` / `gh pr` をローカル版の必須操作にしないこと（REQ-0141-026）
- PR 本文が担っていた `SPEC確定候補` と `Findings / Capture候補` を Case ファイルに移すこと（REQ-0141-020）
- `rules/labels.yaml` に存在しないラベルを追加しないこと

## 実行エントリポイント

ローカル版 link 設定の実行手順は `src/opencode-local/README.md` に記載する（REQ-0141-031）。
手順は link 設定スクリプトの実行、または link 設定プロンプトの入力により実行する内容とする。

## link 設定結果とリポジトリ管理

link による接続であるため、`.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` は導入先リポジトリの git 管理対象外とする（REQ-0141-008, ADR-0131 decision #1）。
`.opencode/skills/agentdev-gh-cli/` も同様に git 管理対象外とする。

`.agentdev/cases/` 配下の Case ファイルはリポジトリ管理対象とする（REQ-0141-016、詳細は [ローカル Case ファイル](local-case-file.md) 参照）。

## 同名規則と同居制限

ローカル版は GitHub 版 `/agentdev/*` および `agentdev-*` と同じ名前で link 設定する前提とする（REQ-0141-015）。
GitHub 版とローカル版を同じ `.opencode/` に同居させる利用環境は対象外とする。

## 関連項目

- [ローカル Case ファイル](local-case-file.md)（Case ファイルのスキーマ、状態遷移、見出し）
- [ローカル版 OpenCode 変換プロンプト](local-transform.md)（変換プロンプト要件の廃止、整理）
- [実行時パッケージ境界](runtime-package-boundary.md)（`consumer-generated` リポジトリ種別）
- [agentdev-gh-cli SPEC](../skills/agentdev-gh-cli.md)（I/O hub と差し替え可能性）
- [ワークフロー契約](../foundations/workflow-contracts.md)（Local backend 差分契約）
- REQ-0141（ローカル版 OpenCode 生成方式とローカル Case ファイル運用）
- REQ-0134（配布基盤: link mode 導入の宣言）
- ADR-0131（ローカル版導入方式を link mode へ統一し生成方式を廃止）
- ADR-0105（source / projection 分離）
