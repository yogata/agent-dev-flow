# ローカル版 OpenCode 変換用プロンプト

> 本ファイルは AI エージェントがローカル版 OpenCode のコマンド / スキル / ひな形を生成先リポジトリの `.opencode/` に生成するための指示書である。意味仕様の正本は `docs/specs/local-transform.md` と `docs/specs/local-generation.md`。変換仕様の集約は `transform/spec.md` 参照。

## 目的

GitHub Issue / PR を使えない個人利用環境（ローカル版 OpenCode）向けに、AgentDevFlow 本体リポジトリの `src/opencode/`（GitHub 版原本）と `src/opencode-local/`（生成時ソース）を読み込み、ローカル版コマンド / スキル / ひな形を生成先リポジトリの `.opencode/commands/` および `.opencode/skills/` に生成する（REQ-0141-007, 031, 032）。

決定的な変換ロジックを実装した変換スクリプトは使用しない。AI エージェントが本プロンプトに従って生成する（REQ-0141-032）。

## 入力

読み込む入力元と対象を以下に示す。

### 仕様管理リポジトリ（AgentDevFlow 本体）

| 入力元 | 読込対象 | 役割 |
|---|---|---|
| `src/opencode/` | コマンド（`commands/agentdev/*.md`）・スキル（`skills/agentdev-*/`）・ひな形 | GitHub 版原本。変換の入力 |
| `src/opencode-local/case-schema/` | Case ファイルスキーマ定義（`case-file.md`, `rules/*.yaml`） | ローカル Case ファイル構造の定義 |
| `src/opencode-local/transform/spec.md` | 変換仕様（変換対象一覧・ガードレール・レポートフォーマット） | 変換内容と検証基準の集約 |
| `src/opencode-local/generation-flow.md` | 生成フロー定義 | 手順・安全確認・`generated_by` 形式 |

### 生成先リポジトリ（ローカル版導入先）

| 確認対象 | 目的 |
|---|---|
| `.opencode/commands/agentdev/` | 同名ファイルの有無と `generated_by` 識別子の確認 |
| `.opencode/skills/agentdev-*/` | 同名ファイルの有無と `generated_by` 識別子の確認 |
| `.opencode/` の実パス | ジャンクション検出安全ゲート |

## 変換対象

変換対象となるコマンド / スキル / ひな形の範囲を以下に示す。

| 変換対象 | 入力元 | 生成先 |
|---|---|---|
| ローカル版コマンド | `src/opencode/commands/agentdev/*.md` | `.opencode/commands/agentdev/*.md` |
| ローカル版スキル | `src/opencode/skills/agentdev-*/` | `.opencode/skills/agentdev-*/` |
| ローカル版ひな形 | `src/opencode/` 配下のひな形群 | `.opencode/` 配下（相対参照構造を維持） |

ローカル版は GitHub 版 `/agentdev/*` および `agentdev-*` と同じ名前で生成する前提とする（REQ-0141-015）。GitHub 版とローカル版を同じ `.opencode/` に同居させる利用環境は対象外とする。

## 必須変換

以下の意味変換を実施する（REQ-0141-021〜023）。変換仕様の詳細は `transform/spec.md` 参照。

### コマンドの意味変換

| 変換対象 | 変換内容 |
|---|---|
| ローカル版 `case-open` | GitHub Issue 作成を `.agentdev/cases/case-{NNNN}.md` 作成へ意味変換する |
| ローカル版 `case-run` | GitHub PR 作成を行わず、PR 相当の内容を Case ファイルの該当セクション（`## マージ前確認` / `## SPEC確定候補` / `## Findings / Capture候補` / `## 作業ログ`）へ追記する形へ意味変換する |
| ローカル版 `case-close` | GitHub PR 取り込み / Issue クローズを行わず、ローカル Git の取り込み結果と完了処理を Case ファイル（`## マージ結果` / `## 完了判定`）に記録する形へ意味変換する |

### ひな形の意味変換

| 変換対象 | 変換内容 |
|---|---|
| ひな形（GitHub Issue 本文向け） | Case ファイル本文向けに意味変換する |
| ひな形（GitHub PR 本文向け） | `## マージ前確認` / `## SPEC確定候補` / `## Findings / Capture候補` 向けに意味変換する |
| ひな形（Issue コメント向け） | `## 作業ログ` 向けに意味変換する |
| ひな形（完了報告向け） | ローカル版完了報告または `## 完了判定` 向けに意味変換する |

### Case ファイル運用への置換

ローカル版各コマンドの I/O を GitHub Issue / PR から Case ファイルへ置換する。

| GitHub 版 | ローカル版 |
|---|---|
| GitHub Issue 本文 | Case ファイル本文 |
| GitHub Issue コメント | `## 作業ログ` |
| GitHub Issue の状態 | Case ファイルの `status` |
| GitHub Issue のラベル | Case ファイルの `labels` |
| GitHub PR 本文 | `## マージ前確認` / `## SPEC確定候補` / `## Findings / Capture候補` |
| GitHub PR 取り込み結果 | `## マージ結果` |
| GitHub Issue のクローズ | `status: closed` + `closed_at` |

## ガードレール

生成時に以下のガードレールを遵守する（REQ-0141-014, AG-009, AG-010）。ガードレール一覧は `transform/spec.md` と同一内容を保持し整合すること。

### 原本保護

- `src/opencode/` を変更しないこと（REQ-0141-014）
- `src/opencode-local/` を変更しないこと
- 生成物を `src/opencode-local/` 配下に出力しないこと
- AgentDevFlow 本体リポジトリでローカル版生成を実行しないこと（REQ-0141-006）

### 安全ゲート

- 生成先リポジトリの `.opencode/` が `src/opencode/` 配下へ解決される場合は生成を停止すること（REQ-0141-010）
- 同名ファイルに `generated_by: local-opencode-transform` の識別情報がある場合のみ再生成・上書きを許可すること（REQ-0141-012）
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

## レポート出力

変換後に生成レポートを出力する。レポートには少なくとも以下の必須項目を含める（REQ-0141-028, AG-009）。レポートフォーマットの集約は `transform/spec.md` 参照。

| 項目 | 内容 |
|---|---|
| 入力スナップショット | 読み込んだ `src/opencode/` と `src/opencode-local/` のファイル一覧 |
| 仕様管理リポジトリ | AgentDevFlow 本体リポジトリの識別情報 |
| 生成先リポジトリ | ローカル版導入先リポジトリの識別情報 |
| 生成した出力 | 生成したファイルの一覧（パス・種別） |
| 変換内容 | case-open / case-run / case-close の各変換内容、ひな形の変換内容 |
| `.opencode/` 実パス確認結果 | ジャンクション検出安全ゲートの結果 |
| 同名ファイル確認結果 | 既存ファイルと `generated_by` 識別子の照合結果 |
| `generated_by` 確認結果 | 生成物に付与した識別子の確認 |
| ガードレール確認結果 | 各ガードレールの遵守確認結果 |
| 残存する GitHub 固有参照 | 残存する GitHub Issue / PR 参照のリストと違反/非違反の判定 |
| 手動確認事項 | 利用者の手動確認が必要な事項 |
| 結果 | `PASS` / `FAIL` |

## 残存 GitHub 固有参照の違反判定基準

生成物に残存する GitHub 固有参照を判定する（REQ-0141-029）。

| 参照の性質 | 違反/非違反 |
|---|---|
| 必須操作として残る GitHub Issue / PR 参照 | 違反 |
| 必須入力として残る GitHub Issue / PR 参照 | 違反 |
| 必須出力として残る GitHub Issue / PR 参照 | 違反 |
| 背景説明の GitHub Issue / PR 参照 | 非違反 |
| GitHub 版との置換表の GitHub Issue / PR 参照 | 非違反 |
| 対象外の説明の GitHub Issue / PR 参照 | 非違反 |
| 用語上の参照 | 非違反 |

違反が1件でも残存する場合、レポート結果は `FAIL` とする。

## 関連項目

- [変換仕様](spec.md) — 変換対象一覧・ガードレール一覧・レポートフォーマットの集約
- [レビュー用プロンプト](review.md) — 生成結果を検証するための指示
- [生成フロー定義](../generation-flow.md) — 手順・安全確認・`generated_by` 形式
- [Case ファイルスキーマ定義](../case-schema/case-file.md) — ローカル Case ファイルの構造
- `docs/specs/local-transform.md` — 変換プロンプト要件の正本
- `docs/specs/local-generation.md` — 生成フロー・安全ゲートの正本
- REQ-0141 — ローカル版 OpenCode 生成方式とローカル Case ファイル運用の要件定義
- ADR-0126 — source model 拡張と生成安全性制約
