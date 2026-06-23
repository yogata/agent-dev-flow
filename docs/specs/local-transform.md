---
title: ローカル版 OpenCode 変換プロンプト
status: draft
created: 2026-06-20
updated: 2026-06-20
---

# ローカル版 OpenCode 変換プロンプト

> **Scope**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である（ADR-0103）。ローカル版 OpenCode を生成するための変換用プロンプト（`transform/generate.md`）・レビュー用プロンプト（`transform/review.md`）・変換仕様（`transform/spec.md`）の要件を定義する。実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（ADR-0104）。REQ-0141 と ADR-0126 の詳細仕様を原本とする。

## 目的

`src/opencode-local/transform/` 配下の 3 ファイルが満たすべき要件を定義する（REQ-0141-028, 029）。各ファイルは AI エージェントがローカル版生成・検証を実行する際の指示書となる。

## transform/generate.md（変換用プロンプト）の要件

`transform/generate.md` は AI エージェントがローカル版コマンド / スキル / ひな形を生成先リポジトリの `.opencode/commands/` および `.opencode/skills/` に生成するためのプロンプトである。

### 必須セクション

`transform/generate.md` は以下のセクションを含むこと（REQ-0141-028, AG-009）。

| セクション | 内容 |
|---|---|
| 目的 | 本プロンプトの目的（ローカル版生成） |
| 入力 | 入力元（`src/opencode/` / `src/opencode-local/`）と読込対象 |
| 変換対象 | 変換対象となるコマンド / スキル / ひな形の範囲 |
| 必須変換 | case-open / case-run / case-close の意味変換、ひな形の意味変換（詳細後述） |
| ガードレール | 生成時の制約一覧（詳細後述） |
| レポート出力 | 変換後に生成レポートを出力する要件と必須項目（詳細後述） |

### 必須変換の詳細

`transform/generate.md` は以下の意味変換を要求する（REQ-0141-021〜023, AG-006, AG-008）。

| 変換対象 | 変換内容 |
|---|---|
| ローカル版 `case-open` | GitHub Issue 作成を `.agentdev/cases/case-{NNNN}.md` 作成へ意味変換する |
| ローカル版 `case-run` | GitHub PR 作成を行わず、PR 相当の内容を Case ファイルの該当セクションへ追記する形へ意味変換する |
| ローカル版 `case-close` | GitHub PR 取り込み / Issue クローズを行わず、ローカル Git の取り込み結果と完了処理を Case ファイルに記録する形へ意味変換する |
| ひな形（GitHub Issue 本文向け） | Case ファイル本文向けに意味変換する |
| ひな形（GitHub PR 本文向け） | `## マージ前確認` / `## SPEC確定候補` / `## Findings / Capture候補` 向けに意味変換する |
| ひな形（Issue コメント向け） | `## 作業ログ` 向けに意味変換する |
| ひな形（完了報告向け） | ローカル版完了報告または `## 完了判定` 向けに意味変換する |

### ガードレール一覧

`transform/generate.md` は以下のガードレールをすべて含むこと（REQ-0141-014, AG-009, AG-010）。

- `src/opencode/` を変更しないこと
- `src/opencode-local/` を変更しないこと
- 生成物を `src/opencode-local/` 配下に出力しないこと
- AgentDevFlow 本体リポジトリで生成を実行しないこと
- 生成先リポジトリの `.opencode/` が `src/opencode/` 配下へ解決される場合は生成を停止すること
- 同名ファイルに `generated_by: local-opencode-transform` の識別情報がある場合のみ再生成・上書きを許可すること
- 同名ファイルに識別情報がない場合、または異なる識別情報がある場合は生成を停止すること
- ローカル版コマンドは `.opencode/commands/` に配置すること
- ローカル版スキルは `.opencode/skills/` に配置すること
- ローカル版ひな形は既存の相対参照構造を維持して配置すること
- 既存の相対参照構造を維持できない場合は参照元から解決できる配置へ変換し、変更理由と変更内容を変換レポートに記録すること
- バックエンド抽象化を導入しないこと
- GitHub 互換ローカルサーバを前提にしないこと
- GitHub Issue 作成を必須操作にしないこと
- GitHub PR 作成を必須操作にしないこと
- GitHub PR 取り込みを必須操作にしないこと
- `gh issue` / `gh pr` をローカル版の必須操作にしないこと
- PR 本文が担っていた `SPEC確定候補` を Case ファイルに移すこと
- PR 本文が担っていた `Findings / Capture候補` を Case ファイルに移すこと
- `rules/labels.yaml` に存在しないラベルを追加しないこと

### レポート出力の必須項目

`transform/generate.md` は変換後にレポート出力を要求する。レポートには少なくとも以下を含めること（REQ-0141-028, AG-009）。

- 入力スナップショット
- 仕様管理リポジトリ
- 生成先リポジトリ
- 生成した出力
- ローカル版 `case-open` / `case-run` / `case-close` の変換内容
- ひな形の変換内容
- `.opencode/` 実パス確認結果
- 同名ファイル確認結果
- `generated_by` 識別情報の確認結果
- ガードレール確認結果
- 残存する GitHub 固有参照
- 手動確認が必要な事項
- 結果: `PASS` / `FAIL`

### 残存 GitHub 固有参照の違反判定基準

本判定基準は `transform/spec.md` に正本として集約し、`transform/generate.md`・`transform/review.md` はこれを参照すること（REQ-0141-029）。

| 参照の性質 | 違反/非違反 |
|---|---|
| 必須操作として残る GitHub Issue / PR 参照 | 違反 |
| 必須入力として残る GitHub Issue / PR 参照 | 違反 |
| 必須出力として残る GitHub Issue / PR 参照 | 違反 |
| 背景説明の GitHub Issue / PR 参照 | 非違反 |
| GitHub 版との置換表の GitHub Issue / PR 参照 | 非違反 |
| 対象外の説明の GitHub Issue / PR 参照 | 非違反 |
| 用語上の参照 | 非違反 |

## transform/review.md（レビュー用プロンプト）の要件

`transform/review.md` は生成先リポジトリに生成された `.opencode/commands/` および `.opencode/skills/` が `src/opencode-local/` 配下の仕様・定義に合致しているか確認するためのプロンプトである。

### 確認対象一覧

`transform/review.md` は少なくとも以下を確認対象とする（REQ-0141-028, AG-009）。

#### 生成物の配置と識別子

- `.opencode/commands/` にローカル版コマンドが生成されていること
- `.opencode/skills/` にローカル版スキルが生成されていること
- ローカル版コマンド / スキルが参照するひな形が `.opencode/` 配下に生成されていること
- 生成物が `src/opencode-local/` 配下に出力されていないこと
- `.opencode/` が `src/opencode/` 配下へ解決されていないこと
- 同名ファイルに `generated_by: local-opencode-transform` の識別情報がある場合のみ再生成・上書きが許可されること
- 同名ファイルに識別情報がない場合、または異なる識別情報がある場合、生成が停止されること
- 生成物に `generated_by: local-opencode-transform` の識別情報があること

#### GitHub Issue / PR 非依存の確認

- 生成されたローカル版が GitHub Issue 作成を必須操作として要求していないこと
- 生成されたローカル版が GitHub PR 作成を必須操作として要求していないこと
- 生成されたローカル版が GitHub PR 取り込みを必須操作として要求していないこと

#### Case ファイル運用の確認

- ローカル版 `case-open` が `.agentdev/cases/case-{NNNN}.md` を作成すること
- ローカル版 `case-run` が GitHub PR を作成せず、Case ファイルを更新すること
- ローカル版 `case-close` が GitHub PR 取り込み / Issue クローズを要求せず、Case ファイルを完了状態に更新すること
- `SPEC確定候補` と `Findings / Capture候補` が Case ファイルに保持されること

#### Case ファイル仕様の準拠確認

- 状態が `rules/status.yaml` に従うこと
- ラベルが `rules/labels.yaml` から選定されていること
- 見出しが `rules/headings.yaml` に従うこと

#### 状態遷移の定義確認

- ローカル版 `case-run` 停止時の `running` から `blocked` への遷移が定義されていること
- ローカル版 `case-close` 停止時の `review` から `blocked` への遷移が定義されていること
- ローカル版 `case-run` 停止後の `blocked` → `running` → `review` の再開経路が定義されていること
- ローカル版 `case-close` 停止後の `blocked` → `review` → `closed` の再開経路が定義されていること

#### 残存 GitHub 固有参照の扱い確認

- 残存する GitHub 固有参照のうち、必須操作・必須入力・必須出力として残るものが違反として扱われていること
- 背景説明・置換表・対象外・用語上の GitHub 参照が違反として扱われていないこと

### レビュー結果フォーマット

レビュー結果は少なくとも以下を含むこと（REQ-0141-028, AG-009）。

| 項目 | 内容 |
|---|---|
| 結果 | `PASS` / `FAIL` |
| 確認した入力 | レビュー対象としたファイル一覧 |
| 違反一覧 | 検出された違反のリスト（対象・違反内容） |
| 警告 | 違反ではないが注意が必要な事項 |
| 確認済み要件 | 確認対象一覧の各項目に対する判定結果 |
| 最終判定 | 総合判定とその根拠 |

### 必須チェック失敗時の扱い

必須チェックが 1 つでも失敗した場合、結果は `FAIL` とする（REQ-0141-028）。部分通過（一部必須項目のみ通過）を `PASS` として扱わない。

## transform/spec.md（変換仕様）の要件

`transform/spec.md` は変換プロンプト（`transform/generate.md`）とレビュープロンプト（`transform/review.md`）が参照する変換仕様を保持する。本 SPEC（`docs/specs/local-transform.md`）と `docs/specs/local-generation.md` が意味仕様の原本であり、`transform/spec.md` は実行時の変換対象一覧・ガードレール一覧・レポートフォーマットを集約した運用参照資料とする。

`transform/spec.md` は少なくとも以下を含むこと。

- 変換対象コマンド / スキル / ひな形の一覧
- ガードレール一覧（正本。`transform/generate.md` は本ファイルを参照すること）
- レポートフォーマット（正本。`transform/generate.md` は本ファイルを参照すること）
- 残存 GitHub 固有参照の違反判定基準（根拠列を含む正本。`transform/generate.md`・`transform/review.md` は本ファイルを参照すること）

## 関連項目

- [ローカル Case ファイル](local-case-file.md) — Case ファイルのスキーマ・状態遷移・見出し
- [ローカル版 OpenCode 生成](local-generation.md) — 生成フロー・`generated_by` 識別子・ジャンクション検出安全ゲート
- [実行時パッケージ境界](runtime-package-boundary.md) — `consumer-generated` リポジトリ種別
- [ワークフロー契約](workflow-contracts.md) — Local backend 差分契約
- REQ-0141 — ローカル版 OpenCode 生成方式とローカル Case ファイル運用の要件定義
- ADR-0126 — ローカル版 OpenCode 生成基盤の source model 拡張と生成安全性制約
