# ローカル版 OpenCode 変換用プロンプト

> 本ファイルは AI エージェントがローカル版 OpenCode のコマンド / スキル / ひな形を生成先リポジトリの `.opencode/` に生成するための指示書である。意味仕様の正本は `docs/specs/local-transform.md` と `docs/specs/local-generation.md`。変換仕様の集約は `transform/spec.md` 参照。

## 目的

GitHub Issue / PR を使えない個人利用環境（ローカル版 OpenCode）向けに、AgentDevFlow 本体リポジトリの `src/opencode/`（GitHub 版原本）と `src/opencode-local/`（生成時ソース）を読み込み、ローカル版コマンド / スキル / ひな形を生成先リポジトリの `.opencode/commands/` および `.opencode/skills/` に生成する（REQ-0141-007, 031, 032）。

決定的な変換ロジックを実装した変換スクリプトは使用しない。
AI エージェントが本プロンプトに従って生成する（REQ-0141-032）。

## 入力

読み込む入力元と対象を以下に示す。

### 仕様管理リポジトリ（AgentDevFlow 本体）

| 入力元 | 読込対象 | 役割 |
|---|---|---|
| `src/opencode/` | コマンド（`commands/agentdev/*.md`）、スキル（`skills/agentdev-*/`）、ひな形 | GitHub 版原本。変換の入力 |
| `src/opencode-local/agentdev-gh-cli/case-schema/` | Case ファイルスキーマ定義（`case-file.md`, `rules/*.yaml`） | ローカル Case ファイル構造の定義 |
| `src/opencode-local/transform/spec.md` | 変換仕様（変換対象一覧、ガードレール、レポートフォーマット） | 変換内容と検証基準の集約 |
| `src/opencode-local/generation-flow.md` | 生成フロー定義 | 手順、安全確認、`generated_by` 形式 |

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

ローカル版は GitHub 版 `/agentdev/*` および `agentdev-*` と同じ名前で生成する前提とする（REQ-0141-015）。
GitHub 版とローカル版を同じ `.opencode/` に同居させる利用環境は対象外とする。

## 必須変換

以下の意味変換を実施する（REQ-0141-021〜023）。
変換仕様の詳細は `transform/spec.md` 参照。

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

生成時に遵守するガードレール（原本保護、安全ゲート、配置規則、バックエンド制約、GitHub 依存除去、Case ファイル引き継ぎ、リポジトリ管理対象外）は `transform/spec.md` の「ガードレール一覧」に集約している（REQ-0141-014, AG-009, AG-010）。
本プロンプトは同ファイルを入力として読み込む前提で参照する。

## レポート出力

変換後に生成レポートを出力する。
レポートの必須項目（REQ-0141-028, AG-009）は `transform/spec.md` の「レポートフォーマット」参照。

## 残存 GitHub 固有参照の違反判定基準

生成物に残存する GitHub 固有参照の違反/非違反判定基準（REQ-0141-029）は `transform/spec.md` の「残存 GitHub 固有参照の違反判定基準」に根拠列付きで集約している。
違反が1件でも残存する場合、レポート結果は `FAIL` とする。

## 関連項目

- [変換仕様](spec.md) — 変換対象一覧、ガードレール一覧、レポートフォーマットの集約
- [レビュー用プロンプト](review.md) — 生成結果を検証するための指示
- [生成フロー定義](../generation-flow.md) — 手順、安全確認、`generated_by` 形式
- [Case ファイルスキーマ定義](../agentdev-gh-cli/case-schema/case-file.md) — ローカル Case ファイルの構造
- `docs/specs/local-transform.md` — 変換プロンプト要件の正本
- `docs/specs/local-generation.md` — 生成フロー、安全ゲートの正本
- REQ-0141 — ローカル版 OpenCode 生成方式とローカル Case ファイル運用の要件定義
- ADR-0126 — source model 拡張と生成安全性制約
