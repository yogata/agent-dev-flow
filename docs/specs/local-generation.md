---
title: ローカル版 OpenCode 生成
status: draft
created: 2026-06-20
updated: 2026-06-20
---

# ローカル版 OpenCode 生成

> **Scope**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である（ADR-0103）。ローカル版 OpenCode の生成フロー、安全ゲート、`generated_by` 識別子、ひな形変換方針、更新運用を定義する。実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（ADR-0104）。REQ-0141 と ADR-0126 の詳細仕様を原本とする。

## 目的

GitHub Issue / PR を使わない個人利用環境（ローカル版 OpenCode）向けに、AgentDevFlow のコマンド / スキル / ひな形を生成先リポジトリの `.opencode/` に直接生成する方式を定義する（REQ-0141-001〜033）。原本である `src/opencode/` を改変せず、識別子と安全ゲートで原本保護を担保する。

## リポジトリ分離

ローカル版生成は以下の 2 リポジトリ構成を前提とする（REQ-0141-002, 006）。

| リポジトリ | 役割 | 主な対象パス |
|---|---|---|
| 仕様管理リポジトリ（AgentDevFlow 本体） | ローカル版生成の入力元。GitHub 版原本と生成時ソース領域を保持 | `src/opencode/`, `src/opencode-local/` |
| 生成先リポジトリ | ローカル版を導入する利用側リポジトリ。生成物と Case ファイルを保持 | `.opencode/commands/`, `.opencode/skills/`, `.agentdev/cases/` |

ローカル版生成は AgentDevFlow 本体リポジトリでは実行しない（REQ-0141-006）。生成時の入力元として AgentDevFlow 本体リポジトリの `src/opencode/` と `src/opencode-local/` を参照する。

## src/opencode-local/ ディレクトリ構成

`src/opencode-local/` はローカル版生成のためのスキーマ、変換プロンプト、変換仕様のみを保持する生成時ソース領域である（REQ-0141-004, 005）。生成済みコマンド / スキル / ひな形は配置しない。

```text
src/opencode-local/
  README.md              ← ローカル版生成の実行手順（transform/generate.md の入力方法を記載）
  case-schema/           ← Case ファイルの定義（local-case-file.md SPEC 参照）
    case-file.md         ← スキーマ定義（YAML 前書き・status enum・labels・headings・採番）
    rules/
      frontmatter.yaml   ← YAML 前書きスキーマの機械可読定義
      status.yaml        ← status enum と状態遷移表の機械可読定義
      labels.yaml        ← labels 値域の機械可読定義
      headings.yaml      ← 見出し一覧の機械可読定義
  transform/             ← 変換プロンプトと変換仕様
    generate.md          ← 変換用プロンプト（AI エージェントがローカル版を生成するための指示）
    review.md            ← レビュー用プロンプト（生成結果を検証するための指示）
    spec.md              ← 変換仕様（変換対象・ガードレール一覧・レポートフォーマット）
  generation-flow.md     ← 生成フロー定義（手順・安全確認・generated_by 形式）
```

### 作成しないディレクトリ

以下は作成しない（REQ-0141-005）。

- `src/opencode-local/_conv/`
- `src/opencode-local/commands/`
- `src/opencode-local/skills/`
- `src/opencode-local/requirements/`
- `src/opencode-local/specs/`

`requirements/` と `specs/` は `docs/` 配下の同名ディレクトリと概念衝突するため不採用。要件は `docs/requirements/` で一元管理し、`src/opencode-local/` には配置しない。

## 生成フロー

ローカル版生成の全体フローを定義する（REQ-0141-007, 031, 032）。

1. **実行環境の特定**: 生成先リポジトリが AgentDevFlow 本体リポジトリでないことを確認する
2. **入力の読み込み**: AI エージェントが仕様管理リポジトリの `src/opencode/` と `src/opencode-local/` 配下を読み込む
3. **ジャンクション検出安全ゲート**: 生成先リポジトリの `.opencode/` の実パスを確認する（後述）
4. **同名ファイル確認**: `.opencode/commands/` と `.opencode/skills/` の同名ファイルを `generated_by` 識別子で確認する（後述）
5. **変換の実行**: `transform/generate.md` の指示に従い、AI エージェントがローカル版コマンド / スキル / ひな形を生成する
6. **生成物の配置**: `.opencode/commands/` と `.opencode/skills/` に直接配置する
7. **レポート出力**: 変換レポートを出力する（後述）

決定的な変換ロジックを実装した変換スクリプトは使用しない。AI エージェントが変換プロンプトに従って生成する（REQ-0141-032）。変換スクリプトはリポジトリ管理対象外とする（REQ-0141-009）。

## generated_by 識別子

ローカル版生成物には `generated_by: local-opencode-transform` の識別情報を持たせる（REQ-0141-011）。

### 記録形式

| 生成物の種別 | 記録方法 |
|---|---|
| Markdown または YAML 前書きを持つファイル | YAML 前書きに `generated_by: local-opencode-transform` を記録 |
| YAML 前書きを持たないファイル | 同等の先頭コメントに記録 |

### 上書き許可条件

同名ファイルに対する再生成、上書きは以下の条件でのみ許可する（REQ-0141-012, 013）。

- 同名ファイルに `generated_by: local-opencode-transform` 識別情報がある場合: 再生成、上書きを許可する
- 同名ファイルに識別情報がない場合: 安全確認不能として生成を停止する
- 同名ファイルに異なる識別情報がある場合: 生成を停止する

## ジャンクション検出安全ゲート

ジャンクション / シンボリックリンク等により `.opencode/` が `src/opencode/` 配下へ解決される環境での誤生成を防止するため、生成前に `.opencode/` の実パスを確認する（REQ-0141-010）。

### 検出条件

`.opencode/` の実パスが `src/opencode/` 配下へ解決される場合、ローカル版生成を停止する。

### 実装方式

ジャンクション検出は決定的な検査として script で実装する（ADR-0107, ADR-0126 decision #3）。AI エージェントの解釈に依存せず、ファイルシステムの実パス解決により機械的に判定する。

### 停止時の扱い

ジャンクション環境を検出した場合、生成を開始せずに停止する。ユーザーにジャンクション構成の解除を促すメッセージを出す。

## ひな形変換方針

ローカル版生成では GitHub Issue / PR 関連のひな形を Case ファイル構造に合わせて変換する（REQ-0141-008, AG-008）。

| GitHub 版ひな形 | 変換先 |
|---|---|
| GitHub Issue 本文向けひな形 | Case ファイル本文向け |
| GitHub PR 本文向けひな形 | `## マージ前確認` / `## SPEC確定候補` / `## Findings / Capture候補` 向け |
| Issue コメント向けひな形 | `## 作業ログ` 向け |
| GitHub PR 取り込み後の完了報告向けひな形 | ローカル版完了報告または `## 完了判定` 向け |

### 相対参照構造の維持ルール

ローカル版コマンド / スキルが参照するひな形は、既存の相対参照構造を維持して配置することを優先する（REQ-0141-008）。

- 既存の相対参照構造を維持できない場合: 参照元から解決できる配置へ変換する
- 変換した場合: 変更理由と変更内容を生成レポートに記録する（REQ-0141-008）

## 生成レポート出力フォーマット

変換後に生成レポートを出力する。レポートの必須項目を定義する（REQ-0141-028, AG-009）。

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

### 残存 GitHub 固有参照の違反判定基準

| 区分 | 違反/非違反 |
|---|---|
| 必須操作として残る GitHub Issue / PR 参照 | 違反 |
| 必須入力として残る GitHub Issue / PR 参照 | 違反 |
| 必須出力として残る GitHub Issue / PR 参照 | 違反 |
| 背景説明の GitHub Issue / PR 参照 | 非違反 |
| GitHub 版との置換表の GitHub Issue / PR 参照 | 非違反 |
| 対象外の説明の GitHub Issue / PR 参照 | 非違反 |
| 用語上の参照 | 非違反 |

## ガードレール一覧

ローカル版生成が遵守するガードレールを定義する（REQ-0141-014, AG-009, AG-010）。

- `src/opencode/` を変更しないこと（REQ-0141-014）
- `src/opencode-local/` を変更しないこと
- 生成物を `src/opencode-local/` 配下に出力しないこと
- AgentDevFlow 本体リポジトリでローカル版生成を実行しないこと（REQ-0141-006）
- 生成先リポジトリの `.opencode/` が `src/opencode/` 配下へ解決される場合は生成を停止すること（REQ-0141-010）
- 同名ファイルに `generated_by: local-opencode-transform` 識別情報がある場合のみ再生成、上書きを許可すること（REQ-0141-012）
- 同名ファイルに識別情報がない場合または異なる識別情報がある場合、生成を停止すること（REQ-0141-013）
- ローカル版コマンドは `.opencode/commands/` に配置すること
- ローカル版スキルは `.opencode/skills/` に配置すること
- ローカル版ひな形は既存の相対参照構造を維持して配置すること（REQ-0141-008）
- バックエンド抽象化を導入しないこと（REQ-0141-027）
- GitHub 互換ローカルサーバを前提にしないこと（REQ-0141-027）
- GitHub Issue 作成、PR 作成、PR 取り込み、Issue クローズおよび `gh issue` / `gh pr` をローカル版の必須操作にしないこと（REQ-0141-026）
- PR 本文が担っていた `SPEC確定候補` と `Findings / Capture候補` を Case ファイルに移すこと（REQ-0141-020）
- `rules/labels.yaml` に存在しないラベルを追加しないこと
- 生成物をリポジトリ管理対象にしないこと（`.opencode/commands/` / `.opencode/skills/` / `.opencode/` 配下ひな形）（REQ-0141-008）
- 変換スクリプトをリポジトリ管理対象にしないこと（REQ-0141-009）

## 更新運用（全削除して作り直し）

ローカル版の高頻度更新は想定しない。更新時は `.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を全削除して作り直す（REQ-0141-033）。差分更新は想定しない。

全削除により `generated_by` 識別子による上書き保護を迂回できるが、これは利用者自身の明示的操作によるものであり、ローカル版生成プロンプトによる自動上書きとは区別する（AG-015）。

## 実行エントリポイント

ローカル版生成の実行手順は `src/opencode-local/README.md` に記載する（REQ-0141-031）。手順は OpenCode 等 AI エージェントで `transform/generate.md`（変換用プロンプト）を入力またはファイル参照して実行する内容とする。

## 生成物とリポジトリ管理

以下をリポジトリ管理対象外とする（REQ-0141-008）。

- 生成された `.opencode/commands/`
- 生成された `.opencode/skills/`
- 生成された `.opencode/` 配下ひな形

`.agentdev/cases/` 配下の Case ファイルはリポジトリ管理対象とする（REQ-0141-016、詳細は [ローカル Case ファイル](local-case-file.md) 参照）。

## 同名規則と同居制限

ローカル版は GitHub 版 `/agentdev/*` および `agentdev-*` と同じ名前で生成する前提とする（REQ-0141-015）。GitHub 版とローカル版を同じ `.opencode/` に同居させる利用環境は対象外とする。

## 関連項目

- [ローカル Case ファイル](local-case-file.md)（Case ファイルのスキーマ、状態遷移、見出し）
- [ローカル版 OpenCode 変換プロンプト](local-transform.md)（変換用プロンプトとレビュー用プロンプトの要件）
- [実行時パッケージ境界](runtime-package-boundary.md)（`consumer-generated` リポジトリ種別）
- [ワークフロー契約](workflow-contracts.md)（Local backend 差分契約）
- REQ-0141（ローカル版 OpenCode 生成方式とローカル Case ファイル運用の要件定義）
- ADR-0126（ローカル版 OpenCode 生成基盤の source model 拡張と生成安全性制約）
- ADR-0105（source / projection 分離（`src/opencode/` → `.opencode/`、relates-to））
