# ローカル版 OpenCode 生成フロー定義

> 本ファイルはローカル版 OpenCode 生成の全体フロー、安全確認手順、`generated_by` 識別子の形式を定義する。意味仕様の正本は `docs/specs/local-generation.md`。本ファイルは正本 SPEC と矛盾してはならない。

## 目的

ローカル版 OpenCode のコマンド / スキル / ひな形を生成先リポジトリの `.opencode/` に生成する全体手順を定義する（REQ-0141-007, 031, 032）。
原本である `src/opencode/` を改変せず、`generated_by` 識別子とジャンクション検出安全ゲートで原本保護を担保する。

## リポジトリ分離

ローカル版生成は以下の 2 リポジトリ構成を前提とする（REQ-0141-002, 006）。

| リポジトリ | 役割 | 主な対象パス |
|---|---|---|
| 仕様管理リポジトリ（AgentDevFlow 本体） | ローカル版生成の入力元。GitHub 版原本と生成時ソース領域を保持 | `src/opencode/`, `src/opencode-local/` |
| 生成先リポジトリ | ローカル版を導入する利用側リポジトリ。生成物と Case ファイルを保持 | `.opencode/commands/`, `.opencode/skills/`, `.agentdev/cases/` |

ローカル版生成は AgentDevFlow 本体リポジトリでは実行しない（REQ-0141-006）。
生成時の入力元として AgentDevFlow 本体リポジトリの `src/opencode/` と `src/opencode-local/` を参照する。

## 生成フロー

ローカル版生成の全体フロー（REQ-0141-007, 031, 032）。
決定的な変換ロジックを実装した変換スクリプトは使用しない。
AI エージェントが変換プロンプト（`transform/generate.md`）に従って生成する（REQ-0141-032）。

### Step 1: 実行環境の特定

生成先リポジトリが AgentDevFlow 本体リポジトリでないことを確認する（REQ-0141-006）。

- 生成先リポジトリのルートを特定する
- AgentDevFlow 本体リポジトリと同一でないことを確認する
- 本体リポジトリである場合は生成を開始せず停止する

### Step 2: 入力の読み込み

AI エージェントが仕様管理リポジトリの `src/opencode/` と `src/opencode-local/` 配下を読み込む。

- `src/opencode/commands/agentdev/*.md` — GitHub 版コマンド原本
- `src/opencode/skills/agentdev-*/` — GitHub 版スキル原本
- `src/opencode/` 配下のひな形群 — GitHub 版ひな形原本
- `src/opencode-local/case-schema/` — Case ファイルスキーマ定義
- `src/opencode-local/transform/` — 変換プロンプト、レビュープロンプト、変換仕様
- `src/opencode-local/generation-flow.md` — 本ファイル（生成フロー定義）

### Step 3: ジャンクション検出安全ゲート

生成先リポジトリの `.opencode/` の実パスを確認する（REQ-0141-010）。
詳細は後述「ジャンクション検出安全ゲート」参照。

- `.opencode/` の実パスが `src/opencode/` 配下へ解決される場合、生成を停止する
- ジャンクション検出は決定的な検査として script で実装する（ADR-0107, ADR-0126 decision #3）

### Step 4: 同名ファイル確認

`.opencode/commands/` と `.opencode/skills/` の同名ファイルを `generated_by` 識別子で確認する（REQ-0141-012, 013）。
詳細は後述「`generated_by` 識別子」参照。

- 同名ファイルに `generated_by: local-opencode-transform` 識別情報がある場合: 再生成、上書きを許可
- 同名ファイルに識別情報がない場合: 生成を停止
- 同名ファイルに異なる識別情報がある場合: 生成を停止

### Step 5: 変換の実行

`transform/generate.md` の指示に従い、AI エージェントがローカル版コマンド / スキル / ひな形を生成する（REQ-0141-032）。
変換内容、ガードレール、レポートフォーマットは `transform/spec.md` 参照。

### Step 6: 生成物の配置

`.opencode/commands/` と `.opencode/skills/` に直接配置する（REQ-0141-007）。

- ローカル版コマンドは `.opencode/commands/` に配置
- ローカル版スキルは `.opencode/skills/` に配置
- ローカル版ひな形は既存の相対参照構造を維持して `.opencode/` 配下に配置（REQ-0141-008）

### Step 7: レポート出力

変換レポートを出力する。
レポートフォーマットは `transform/spec.md` 参照。

- 必須項目を過不足なく含める
- 残存 GitHub 固有参照の違反判定を行う
- 結果が `FAIL` の場合は利用者に手動確認を促す

## `generated_by` 識別子

ローカル版生成物には `generated_by: local-opencode-transform` の識別情報を持たせる（REQ-0141-011, ADR-0126 decision #2）。
これは上書き保護のアーキテクチャ不変量である。

### 記録形式

| 生成物の種別 | 記録方法 |
|---|---|
| Markdown または YAML 前書きを持つファイル | YAML 前書きに `generated_by: local-opencode-transform` を記録 |
| YAML 前書きを持たないファイル | 同等の先頭コメントに記録 |

### 上書き許可条件

同名ファイルに対する再生成、上書きは以下の条件でのみ許可する（REQ-0141-012, 013）。

- 同名ファイルに `generated_by: local-opencode-transform` 識別情報がある場合: 再生成、上書きを許可
- 同名ファイルに識別情報がない場合: 安全確認不能として生成を停止
- 同名ファイルに異なる識別情報がある場合: 生成を停止

## ジャンクション検出安全ゲート

ジャンクション / シンボリックリンク等により `.opencode/` が `src/opencode/` 配下へ解決される環境での誤生成を防止するため、生成前に `.opencode/` の実パスを確認する（REQ-0141-010, ADR-0126 decision #3）。

### 検出条件

`.opencode/` の実パスが `src/opencode/` 配下へ解決される場合、ローカル版生成を停止する。

### 実装方式

ジャンクション検出は決定的な検査として script で実装する（ADR-0107, ADR-0126 decision #3）。
AI エージェントの解釈に依存せず、ファイルシステムの実パス解決により機械的に判定する。

### 停止時の扱い

ジャンクション環境を検出した場合、生成を開始せずに停止する。
利用者にジャンクション構成の解除を促すメッセージを出す。

## 更新運用（全削除して作り直し）

ローカル版の高頻度更新は想定しない。
更新時は `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を全削除して作り直す（REQ-0141-033）。
差分更新は想定しない。

全削除により `generated_by` 識別子による上書き保護を迂回できるが、これは利用者自身の明示的操作によるものであり、ローカル版生成プロンプトによる自動上書きとは区別する（AG-015）。

## 生成物とリポジトリ管理

以下をリポジトリ管理対象外とする（REQ-0141-008）。

- 生成された `.opencode/commands/`
- 生成された `.opencode/skills/`
- 生成された `.opencode/` 配下ひな形

`.agentdev/cases/` 配下の Case ファイルはリポジトリ管理対象とする（REQ-0141-016、詳細は `case-schema/case-file.md` 参照）。

## 同名規則と同居制限

ローカル版は GitHub 版 `/agentdev/*` および `agentdev-*` と同じ名前で生成する前提とする（REQ-0141-015）。
GitHub 版とローカル版を同じ `.opencode/` に同居させる利用環境は対象外とする。

## 関連項目

- [ローカル版生成の実行手順](README.md) — AI エージェントでの実行エントリポイント
- [変換用プロンプト](transform/generate.md) — ローカル版生成の指示書
- [レビュー用プロンプト](transform/review.md) — 生成結果の検証指示
- [変換仕様](transform/spec.md) — 変換対象一覧、ガードレール一覧、レポートフォーマット
- [Case ファイルスキーマ定義](case-schema/case-file.md) — ローカル Case ファイルの構造
- `docs/specs/local-generation.md` — 生成フロー、安全ゲートの正本
- REQ-0141 — ローカル版 OpenCode 生成方式とローカル Case ファイル運用の要件定義
- ADR-0126 — source model 拡張と生成安全性制約
