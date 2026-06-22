# oh-my-openagent指示プロンプトへのFindings/Capture候補テンプレート埋め込み

## 背景

PR #974 で oh-my-openagent が Findings / Capture候補セクションを自動生成しないことが判明した。case-run 実行担当サブエージェントが毎回事後補完している。`references/oh-my-openagent.md` の指示プロンプト雛形に Findings / Capture候補セクションのテンプレートが埋め込まれていないため、サブエージェントが自律的に出力すべきセクション形式を知らない。

## 問題

- `references/oh-my-openagent.md` の指示プロンプト雛形に `## Findings / Capture候補` セクション（`### intake` / `### learning` 小見出し）のテンプレートが埋め込まれていない
- case-run 実行担当サブエージェントが毎回事後補完しており、オーバーヘッドが発生している

## 望ましい変更

`references/oh-my-openagent.md` の指示プロンプト雛形に `## Findings / Capture候補`（`### intake` / `### learning` 小見出し）テンプレートを埋め込む。サブエージェントが自律的に同セクションを出力できるようにする。

## 対象範囲

### 対象
- `src/opencode/skills/agentdev-case-run-execution-adapter/references/oh-my-openagent.md`

### 対象外
- oh-my-openagent 外部リポジトリの機能変更（AgentDevFlow 側のテンプレート追加のみ）
- case-run command 自体のフロー変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-case-run-execution-adapter/references/oh-my-openagent.md` | 指示プロンプト雛形に `## Findings / Capture候補`（`### intake` / `### learning` 小見出し）テンプレートを埋め込み |

## 既存対策確認

- **確認結果**: なし
- **該当ファイル**: なし（oh-my-openagent.md 全100行で Findings/Capture候補セクションの記述なし）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: テンプレート自体が存在しない。毎回case-run実行担当が事後補完している。

## 制約

- oh-my-openagent 外部リポジトリの機能には依存しない（AgentDevFlow 側の委譲プロンプト雛形のみ変更）
- 既存の task() 委譲方式・worktree取り扱い・PR作成・result受領手順は維持

## 受け入れ条件

- [ ] oh-my-openagent.md の指示プロンプト雛形に `## Findings / Capture候補` セクションが埋め込まれている
- [ ] `### intake` / `### learning` 小見出しの形式が定義されている

## 元learning item / 根拠

- **要約**: oh-my-openagent が Findings/Capture候補セクションを自動生成しないため、毎回case-run実行担当が事後補完している
- **根拠**: PR #974 で本 PR の case-run 実行担当サブエージェントが事後補完した。oh-my-openagent.md にテンプレートがないため形式が毎回異なるリスク。
- **再発条件**: case-run で oh-my-openagent 経由の委譲を実施する毎回
- **横展開可能性**: 中。oh-my-openagent 連携時に限定されるが、毎回発生する

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: enhancement
- **関連Issue**: PR #974 Issue #973 (OU-11)
