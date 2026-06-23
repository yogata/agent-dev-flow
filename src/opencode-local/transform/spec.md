# ローカル版 OpenCode 変換仕様

> 本ファイルは変換プロンプト（`transform/generate.md`）とレビュープロンプト（`transform/review.md`）が参照する変換仕様を集約した運用参照資料である。意味仕様の正本は `docs/specs/local-transform.md` と `docs/specs/local-generation.md`。本ファイルは正本 SPEC と矛盾してはならない。

## 目的

ローカル版 OpenCode 生成における変換対象一覧、ガードレール一覧、レポートフォーマット、違反判定基準を一箇所に集約し、変換プロンプト、レビュープロンプト、生成フロー定義が共通して参照できるようにする（REQ-0141-028, 029）。

本ファイルと各プロンプトの関係:

| ファイル | 役割 | 本ファイルとの関係 |
|---|---|---|
| `transform/generate.md` | 変換用プロンプト（AI エージェントへの生成指示） | ガードレール一覧、レポートフォーマット、違反判定基準の正本を本ファイルに集約し、同ファイルを参照する |
| `transform/review.md` | レビュー用プロンプト（生成結果の検証指示） | 確認対象一覧の基準として本ファイルのガードレール、違反判定基準を参照 |
| `transform/spec.md`（本ファイル） | 変換仕様の集約 | 正本 SPEC の運用参照資料 |

## 変換対象一覧

### コマンド

| 変換対象 | 入力元 | 生成先 | 変換内容 |
|---|---|---|---|
| ローカル版 `case-open` | `src/opencode/commands/agentdev/case-open.md` | `.opencode/commands/agentdev/case-open.md` | GitHub Issue 作成を `.agentdev/cases/case-{NNNN}.md` 作成へ意味変換（REQ-0141-021） |
| ローカル版 `case-run` | `src/opencode/commands/agentdev/case-run.md` | `.opencode/commands/agentdev/case-run.md` | GitHub PR 作成を行わず、PR 相当の内容を Case ファイルの該当セクションへ追記（REQ-0141-022） |
| ローカル版 `case-close` | `src/opencode/commands/agentdev/case-close.md` | `.opencode/commands/agentdev/case-close.md` | GitHub PR 取り込み / Issue クローズを行わず、ローカル Git の取り込み結果と完了処理を Case ファイルに記録（REQ-0141-023） |
| その他ローカル版コマンド | `src/opencode/commands/agentdev/*.md` | `.opencode/commands/agentdev/*.md` | GitHub Issue / PR 必須参照の除去、Case ファイル参照への置換 |

### スキル

| 変換対象 | 入力元 | 生成先 | 変換内容 |
|---|---|---|---|
| ローカル版スキル群 | `src/opencode/skills/agentdev-*/` | `.opencode/skills/agentdev-*/` | GitHub Issue / PR 必須参照の除去、Case ファイルスキーマ、状態遷移、見出しへの準拠 |

### ひな形

| 変換対象 | 入力元 | 生成先 | 変換内容 |
|---|---|---|---|
| GitHub Issue 本文向けひな形 | `src/opencode/` 配下 | `.opencode/` 配下 | Case ファイル本文向けに意味変換 |
| GitHub PR 本文向けひな形 | `src/opencode/` 配下 | `.opencode/` 配下 | `## マージ前確認` / `## SPEC確定候補` / `## Findings / Capture候補` 向けに意味変換 |
| Issue コメント向けひな形 | `src/opencode/` 配下 | `.opencode/` 配下 | `## 作業ログ` 向けに意味変換 |
| 完了報告向けひな形 | `src/opencode/` 配下 | `.opencode/` 配下 | ローカル版完了報告または `## 完了判定` 向けに意味変換 |

## ガードレール一覧

ローカル版生成が遵守するガードレール（REQ-0141-014, AG-009, AG-010）。
本ファイルが正本であり、`transform/generate.md` は参照する。

### 原本保護

- `src/opencode/` を変更しないこと（REQ-0141-014）
- `src/opencode-local/` を変更しないこと
- 生成物を `src/opencode-local/` 配下に出力しないこと
- AgentDevFlow 本体リポジトリでローカル版生成を実行しないこと（REQ-0141-006）

### 安全ゲート

- 生成先リポジトリの `.opencode/` が `src/opencode/` 配下へ解決される場合は生成を停止すること（REQ-0141-010）
- 同名ファイルに `generated_by: local-opencode-transform` の識別情報がある場合のみ再生成、上書きを許可すること（REQ-0141-012）
- 同名ファイルに識別情報がない場合、または異なる識別情報がある場合は生成を停止すること（REQ-0141-013）

### 配置規則

- ローカル版コマンドは `.opencode/commands/` に配置すること
- ローカル版スキルは `.opencode/skills/` に配置すること
- ローカル版ひな形は既存の相対参照構造を維持して配置すること（REQ-0141-008）
- 既存の相対参照構造を維持できない場合は参照元から解決できる配置へ変換し、変更理由と変更内容を変換レポートに記録すること

### バックエンド制約

- バックエンド抽象化を導入しないこと（REQ-0141-027）
- GitHub 互換ローカルサーバを前提にしないこと（REQ-0141-027）

### GitHub 依存除去

- GitHub Issue 作成を必須操作にしないこと
- GitHub PR 作成を必須操作にしないこと
- GitHub PR 取り込みを必須操作にしないこと
- `gh issue` / `gh pr` をローカル版の必須操作にしないこと

### Case ファイル引き継ぎ

- PR 本文が担っていた `SPEC確定候補` を Case ファイルに移すこと
- PR 本文が担っていた `Findings / Capture候補` を Case ファイルに移すこと
- `rules/labels.yaml` に存在しないラベルを追加しないこと

### リポジトリ管理対象外

- 生成された `.opencode/commands/` をリポジトリ管理対象にしないこと（REQ-0141-008）
- 生成された `.opencode/skills/` をリポジトリ管理対象にしないこと（REQ-0141-008）
- 生成された `.opencode/` 配下ひな形をリポジトリ管理対象にしないこと（REQ-0141-008）
- 変換スクリプトをリポジトリ管理対象にしないこと（REQ-0141-009）

## レポートフォーマット

変換後に生成レポートを出力する。
レポートの必須項目（REQ-0141-028, AG-009）。
本ファイルが正本であり、`transform/generate.md` は参照する。

| 項目 | 内容 |
|---|---|
| 入力スナップショット | 読み込んだ `src/opencode/` と `src/opencode-local/` のファイル一覧 |
| 仕様管理リポジトリ | AgentDevFlow 本体リポジトリの識別情報 |
| 生成先リポジトリ | ローカル版導入先リポジトリの識別情報 |
| 生成した出力 | 生成したファイルの一覧（パス、種別） |
| 変換内容 | case-open / case-run / case-close の各変換内容、ひな形の変換内容 |
| `.opencode/` 実パス確認結果 | ジャンクション検出安全ゲートの結果 |
| 同名ファイル確認結果 | 既存ファイルと `generated_by` 識別子の照合結果 |
| `generated_by` 確認結果 | 生成物に付与した識別子の確認 |
| ガードレール確認結果 | 各ガードレールの遵守確認結果 |
| 残存する GitHub 固有参照 | 残存する GitHub Issue / PR 参照のリストと違反/非違反の判定 |
| 手動確認事項 | 利用者の手動確認が必要な事項 |
| 結果 | `PASS` / `FAIL` |

## 残存 GitHub 固有参照の違反判定基準

生成物に残存する GitHub 固有参照の違反/非違反判定基準（REQ-0141-029）。

| 参照の性質 | 違反/非違反 | 根拠 |
|---|---|---|
| 必須操作として残る GitHub Issue / PR 参照 | 違反 | ローカル版は GitHub Issue / PR を必須操作にしない（REQ-0141-026） |
| 必須入力として残る GitHub Issue / PR 参照 | 違反 | ローカル版は GitHub Issue / PR を必須入力にしない |
| 必須出力として残る GitHub Issue / PR 参照 | 違反 | ローカル版は GitHub Issue / PR を必須出力にしない |
| 背景説明の GitHub Issue / PR 参照 | 非違反 | GitHub 版との対比、経緯説明としての参照は許容 |
| GitHub 版との置換表の GitHub Issue / PR 参照 | 非違反 | 置換対応表自体が GitHub 版とローカル版の対応を示すため |
| 対象外の説明の GitHub Issue / PR 参照 | 非違反 | 適用範囲外の説明としての参照は許容 |
| 用語上の参照 | 非違反 | 用語解説、概念説明としての参照は許容 |

違反が1件でも残存する場合、レポート結果は `FAIL` とする。

## Case ファイルスキーマ参照

変換時・レビュー時に参照する Case ファイル定義（`src/opencode-local/case-schema/`）。

| 参照先 | 内容 |
|---|---|
| `case-schema/case-file.md` | Case ファイルスキーマ定義（YAML 前書き、status enum、labels、headings、採番） |
| `case-schema/rules/frontmatter.yaml` | YAML 前書きスキーマの機械可読定義（REQ-0141-017） |
| `case-schema/rules/status.yaml` | status enum と状態遷移表の機械可読定義（REQ-0141-018） |
| `case-schema/rules/labels.yaml` | labels 値域の機械可読定義（REQ-0141-019） |
| `case-schema/rules/headings.yaml` | 見出し一覧の機械可読定義（REQ-0141-020） |

## 関連項目

- [変換用プロンプト](generate.md) — ローカル版生成の指示書
- [レビュー用プロンプト](review.md) — 生成結果の検証指示
- [生成フロー定義](../generation-flow.md) — 手順、安全確認、`generated_by` 形式
- [Case ファイルスキーマ定義](../case-schema/case-file.md) — ローカル Case ファイルの構造
- `docs/specs/local-transform.md` — 変換プロンプト、レビュープロンプト要件の正本
- `docs/specs/local-generation.md` — 生成フロー、安全ゲートの正本
- REQ-0141 — ローカル版 OpenCode 生成方式とローカル Case ファイル運用の要件定義
- ADR-0126 — source model 拡張と生成安全性制約
