---
description: project read contract 機構（ADR-0133、IR-056）の整合性を読み取り専用で診断し、検出事項を .agentdev/inspect/inbox/ へ出力する
agent: sisyphus
---

# inspect-read-contracts

project read contract 機構（`.agentdev/config.yaml`、`.agentdev/read-contracts/**`、配布コード直接参照排除）の整合性を読み取り専用で診断し、検出事項、分類、根拠、推奨 route を提示する。
診断結果は `.agentdev/inspect/inbox/` へ出力する。

## 基本原則: 診断専用（検査対象を直接修正しない）

診断を基本とし、許可される副作用は `.agentdev/inspect/inbox/inspect-read-contracts-finding-*.md` の生成、および `.agentdev/inspect/` 配下の git 永続化（commit/ push）のみ。

- 診断結果の提示
- 検出事項ファイル生成（`.agentdev/inspect/inbox/`）
- 推奨 route の提示（intake / learning / req-define / 直接修正 等）

検査対象（`.agentdev/config.yaml`、`.agentdev/read-contracts/**`、`src/opencode/**`、`docs/**`）の直接修正は行わない。

## 入力

- なし（コマンド実行時に全対象成果物を自動スキャン）

## 出力

- 診断レポート（セッション内テキスト出力）
- 検出事項リスト（対象、観点、分類、根拠、推奨 route）
- `.agentdev/inspect/inbox/inspect-read-contracts-finding-{timestamp}.md`（検出事項ファイル出力）

## project read contract

本コマンドは以下の6歩で docs を解決する（ADR-0133）。

1. `.agentdev/config.yaml` を読み込む
2. `.agentdev/read-contracts/commands/inspect-read-contracts.yaml` を読み込む
3. `must_read` に列挙された paths を読み込む
4. `conditional_read` の条件が該当する場合のみ、当該 paths を読み込む
5. read contract に列挙されていない `docs/specs/**` 内部パスを固定知識として読みに行かない
6. read contract が存在しない場合は `config.yaml` の `roots` と明示入力のみを使う

## 手順

### Step 1: スキャン対象の収集

以下を収集する:
- `.agentdev/config.yaml`
- `.agentdev/read-contracts/commands/*.yaml`
- `.agentdev/read-contracts/skills/*.yaml`
- `src/opencode/commands/agentdev/**/*.md`
- `src/opencode/skills/agentdev-*/SKILL.md`、`src/opencode/skills/agentdev-*/references/**/*.md`
- `docs/DOC-MAP.md`、`docs/README.md`、`docs/specs/README.md`

### Step 2: check_read_contracts.ts 実行

`check_read_contracts.ts`（IR-056 実装）を呼び出し、9項目の検査結果を得る:

```bash
bun .opencode/skills/repo-agentdev-integrity/scripts/check_read_contracts.ts . --json
```

### Step 3: 検査結果の解釈

各 failure を以下の観点で解釈し、診断ラベルを付ける:

| 観点 | 対象 | 推奨 route |
|------|------|------------|
| config.yaml 欠陥 | check #1, #2 | req-define（要件漏れ）、直接修正 |
| read contract ディレクトリ欠陥 | check #3 | 直接修正（テンプレート配置） |
| command read contract 欠落 | check #4（warning） | intake（テンプレート追加候補） |
| read contract schema 違反 | check #5 | 直接修正 |
| read contract path 不在 | check #6 | 直接修正（path 修正）、req-define（SPEC 移動に伴う影響） |
| DOC-MAP 探索可能性不足 | check #7（warning） | intake（DOC-MAP 整備候補） |
| 配布コード直接参照残存 | check #8, #9 | 直接修正（read contract 移行） |

### Step 4: 分類

検出事項ごとに NG 分類ラベルを付ける:
- false positive: 検査対象外、exemption 対象（SPEC パス例示、検査対象パス指定）
- pre-existing: 既知の問題で本次スコープ外
- 今回修正対象: 本次スコープで対応すべき問題

### Step 5: route 提示

修正は実行せず、推奨 route を提示する。

### Step 6: 検出事項出力

検出事項を `.agentdev/inspect/inbox/inspect-read-contracts-finding-{timestamp}.md` へ出力する。

### Step 7: 完了報告

検出件数、分類内訳、推奨 route 一覧を報告する。

## ガードレール

- G01: 検査対象を直接修正しない（診断専用）
- G02: 診断結果は `.agentdev/inspect/inbox/` のみへ出力する
- G03: false positive 判定は exemption 仕様（IR-056、project-read-contracts SPEC）に厳密に従う
- G04: check_read_contracts.ts の結果をそのまま提示し、独自の検査ロジックで上書きしない

## エラー処理

| エラー | 対処 |
|--------|------|
| check_read_contracts.ts 実行失敗 | エラー内容を報告して停止。スクリプト側の不具合の可能性 |
| 対象ファイル群が存在しない | 「対象なし」と報告して終了（config.yaml が無い場合は検出事項 #1 として扱う） |
