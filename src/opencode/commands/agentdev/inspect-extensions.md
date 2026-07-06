---
description: project extensions 機構（.agentdev/extensions/**）の整合性を読み取り専用で診断し、検出事項を .agentdev/inspect/inbox/ へ出力する。旧 doc-inputs 残存検出、extension 構造確認、path 実在確認、skill 存在確認を担う
agent: sisyphus
---

# inspect-extensions

project extensions 機構（`.agentdev/extensions/**`）の整合性を読み取り専用で診断し、検出事項、分類、根拠、推奨 route を提示する。
従来の doc-inputs 診断 command は本 command へ統合・改名された（旧 doc-inputs 残存検出を含む）。
診断結果は `.agentdev/inspect/inbox/` へ出力する。

## 基本原則: 診断専用（検査対象を直接修正しない）

診断を基本とし、許可される副作用は `.agentdev/inspect/inbox/inspect-extensions-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit/ push）のみ。

- 診断結果の提示
- 検出事項ファイル生成（`.agentdev/inspect/inbox/`）
- 推奨 route の提示（intake / learning / req-define / 直接修正 等）

検査対象（`.agentdev/extensions/**`、`.agentdev/doc-inputs/**`、`.opencode/**`、`docs/**`）の直接修正は行わない。

## 入力

- なし（コマンド実行時に全対象成果物を自動スキャン）

## 出力

- 診断レポート（セッション内テキスト出力）
- 検出事項リスト（対象、観点、分類、根拠、推奨 route）
- `.agentdev/inspect/inbox/inspect-extensions-finding-{timestamp}.md`（検出事項ファイル出力）

## 手順

### Step 1: スキャン対象の収集

以下を収集する:
- `.agentdev/extensions/commands/*.yaml`
- `.agentdev/extensions/skills/*.yaml`
- `.agentdev/doc-inputs/**`（旧機構残存検出用）
- `.opencode/commands/agentdev/**/*.md`
- `.opencode/skills/agentdev-*/SKILL.md`

### Step 2: 8項目の検査実行

以下の8つの検査を実行する:

#### 検査1: extension 一覧化

`.agentdev/extensions/**` 配下の extension ファイルを一覧化する。配置ディレクトリ（commands/、skills/）、ファイル名、対象 id を報告する。

#### 検査2: extension YAML 構造確認

各 extension ファイルが以下の構造を持つことを確認する:

- 必須フィールド: `version`, `kind`, `id`
- 5セクション: `context`, `rules`, `checks`, `acceptance_gates`, `must_not`（各配列）
- YAML 構文の妥当性

構文エラー、必須フィールド欠落を検出事項として報告する。

#### 検査3: kind と配置の整合確認

extension の `kind` と配置ディレクトリの整合を確認する:

- `kind: command-extension` は `.agentdev/extensions/commands/` 配下にあること
- `kind: skill-extension` は `.agentdev/extensions/skills/` 配下にあること

不一致を検出事項として報告する。

#### 検査4: id と対象 command/skill の対応確認

extension の `id` とファイル名の対応を確認する:

- command extension の `id` は `/agentdev/<command>` 形式であり、ファイル名が `<command>.yaml` であること
- skill extension の `id` は `<skill>` 形式であり、ファイル名が `<skill>.yaml` であること

不一致を検出事項として報告する。

#### 検査5: context.paths の実在確認

extension の `context` セクションに `paths` で参照されるファイルパスが実在することを確認する。不在パスを検出事項として報告する。

#### 検査6: rules/checks の skill 存在確認

extension の `rules`、`checks` セクションに `skill:` フィールドで記述された project-local skill 名が、当該プロジェクトで実在することを確認する。実在しない skill 参照を検出事項として報告する。

#### 検査7: 旧 doc-inputs 残存検出

`.agentdev/doc-inputs/**` 配下に旧参照リスト機構の残存ファイルがないか確認する。残存ファイルを検出事項として報告する。移行完了後のクリーンアップ漏れを検出する目的である。

#### 検査8: 上書き記述検出

extension が標準 command/skill の上書きとして記述されていないことを確認する。extension は追加・拡張のみであり、上書きを意図する記述（「置き換える」「default を変更する」等の表現）を検出事項として報告する。

### Step 3: 検査結果の解釈

各 failure を以下の観点で解釈し、診断ラベルを付ける:

| 観点 | 対象検査 | 推奨 route |
|------|----------|------------|
| extension 構造欠陥 | 検査2, #3, #4 | 直接修正（extension YAML 修正） |
| context path 不在 | 検査5 | 直接修正（path 修正）、要件検討（SPEC 移動に伴う影響） |
| skill 参照先不在 | 検査6 | 直接修正（skill 実装）、intake（project-local skill 整備候補） |
| 旧 doc-inputs 残存 | 検査7 | 直接修正（移行完了後の削除） |
| 上書き記述 | 検査8 | 直接修正（extension 記述修正） |

### Step 4: 分類

検出事項ごとに NG 分類ラベルを付ける:
- false positive: 検査対象外、exemption 対象
- pre-existing: 既知の問題で本次スコープ外
- 今回修正対象: 本次スコープで対応すべき問題

### Step 5: route 提示

修正は実行せず、推奨 route を提示する。

### Step 6: 検出事項出力

検出事項を `.agentdev/inspect/inbox/inspect-extensions-finding-{timestamp}.md` へ出力する。

### Step 7: 完了報告

検出件数、分類内訳、推奨 route 一覧を報告する。

## AgentDevFlow 標準の inspect 責務範囲

AgentDevFlow 標準の inspect 責務は構造確認（検査1〜4）、path 実在確認（検査5）、skill 存在確認（検査6）までとする。
command/skill 本文のプロジェクト固有文書具体参照禁止の持続的検査は、各適用プロジェクトが project-local skill により実装する（AgentDevFlow 標準の対象外）。

## ガードレール

- G01: 検査対象を直接修正しない（診断専用）
- G02: 診断結果は `.agentdev/inspect/inbox/` のみへ出力する
- G03: false positive 判定は exemption 仕様に厳密に従う
- G04: 旧 doc-inputs 残存検出（検査7）は移行過渡期の補助診断であり、残存即エラーとはしない（warning 扱い）

## エラー処理

| エラー | 対処 |
|--------|------|
| 対象ファイル群が存在しない | 「対象なし」と報告して終了（extensions/ が無い場合は検出事項として扱わない。標準動作で続行可能な状態のため） |
| YAML 構文エラー | 当該 extension を構造確認失敗として検出事項に記録し、他 extension の検査を継続する |

## See Also

- project extensions 機構の基盤 SPEC（extension schema、配置、実行時読み込み契約）
- project extensions 読み込み標準 skill（extension 探索、読み取りを担う）
- inspect-promote（次工程）
