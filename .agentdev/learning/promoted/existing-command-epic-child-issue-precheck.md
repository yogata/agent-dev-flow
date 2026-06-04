# Epic子Issue未クローズの事前検知と自動プロンプト

## 背景

Epic Orchestratorモードのcase-runで全子IssueのPR作成・MERGEDまで完了しても、子Issue自体はOPENのまま残存することがある。Epicのcase-close時にG04 guardrail（全子Issue CLOSED → 自動クローズ）に抵触し、手動で8件の子Issueを個別case-closeする事態が発生した。

## 問題

case-closeのEpic Issue検出時に以下が欠けている:
1. 子IssueのOPEN/CLOSED状態の事前チェック手順
2. 未クローズ子Issueが存在する場合の警告と先close推奨プロンプト

現状はG04 guardrail判定で「Epic自動クローズ不可」を検知するが、その時点で手戻りが発生している。

## 望ましい変更

case-closeに以下を追加:
- Epic Issue検出時（G04判定前）に子IssueのOPEN/CLOSED状態を事前チェック
- 未クローズ子IssueがN件（N>0）ある場合、ユーザーに「先にN件の子Issueをcase-closeする必要がある」ことを通知
- Orchestrator完了報告のフォーマットに「N件の子IssueがOPEN（要case-close）」を明記

## 対象範囲

### 対象

- `.opencode/commands/agentdev/case-close.md` — Epic検出・G04判定の手順

### 対象外

- case-run — Orchestrator完了報告フォーマットの変更は別Issueとする
- 他コマンド・スキル

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `.opencode/commands/agentdev/case-close.md` | Epic検出時に子Issue状態の事前チェックと未クローズ警告を追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/commands/agentdev/case-close.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: G04 guardrail（line 53: `Epic自動クローズ判定: 全子Issue CLOSED → 自動クローズ`）は存在するが、これは判定ルールのみ。判定前の事前チェック・警告手順がない。Epicのcase-close時に初めてG04に抵触し、手戻りが発生する。

## 制約

- G04 guardrailの判定ロジック自体は変更しない（事前チェックの追加のみ）
- 子Issueのcase-close自動実行は行わない（ユーザー判断に委ねる）
- `gh issue list`等の既存gh CLIコマンドのみを使用する

## 受け入れ条件

- [ ] case-closeのEpic検出ステップに子Issue OPEN/CLOSED状態の事前チェックが追加されている
- [ ] 未クローズ子Issueが存在する場合、件数とIssue番号を通知する手順がある
- [ ] G04 guardrailの既存判定ロジックに影響がない

## 元learning item / 根拠

- **要約**: Epic Orchestrator完了後も子IssueがOPENのまま残存し、Epicのcase-close時にG04に抵触
- **根拠**: Epic #519で10子IssueのPR MERGED完了後も8件がOPENのまま。G04制約でEpicをクローズできず、手動で8件の子Issue case-closeが必要だった
- **再発条件**: (1) Epic Orchestratorでcase-run実行、(2) 子Issue PRがMERGED、(3) 子Issueのcase-closeを個別実行せずにEpicのcase-closeを試みる
- **横展開可能性**: Epic Orchestratorで10+子Issueを処理する全パターン。Wave数が多い大規模Epicで顕著

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: Epic #519, 子Issue #520-#529, G04 guardrail
