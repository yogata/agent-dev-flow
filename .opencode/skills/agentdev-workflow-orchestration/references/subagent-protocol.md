# サブエージェント実行プロトコル

## 起動仕様

親エージェントが以下の形式でサブエージェントを起動:

```
task(category="unspecified-high", load_skills=[], run_in_background=true, prompt="...")
```

## プロンプト構成

サブエージェントのプロンプトに以下を含める:

- Issue番号
- 実行指示: 「準備フェーズ (Steps 1-5) + 実装フェーズ (Steps 6-7) + 提出フェーズ (Steps 8-9, Steps 11a-11c) を実行し、実装・乖離検出・ローカル検証・PR作成・デプロイ検証まで完了せよ」
- worktreeパス（`.worktrees/{N}-{type}`）
- `workdir` パラメータでworktree絶対パスを指定
- specs更新（Step 10）は実行禁止の明示
- **Finding 記録指示**（REQ-0106）: PR 本文の `## Findings / Intake候補` セクションに記録。各項目に発見元・内容・分類（intake/learning）を含める。`.agentdev/intake/inbox/` の直接変更禁止。Finding がない場合は「該当なし」
- **書き込み事後検証**（REQ-0106-020, MUST）: `gh` CLI 書き込み操作後に Read tool で読み戻し検証

## 親エージェント責務

- **Wave開始前のEpicステータス一括更新**: 各Wave開始前に該当Wave内の全子IssueのEpicステータスを一括更新（`agentdev-epic-tracker` スキル参照）。サブエージェントによる同時更新の競合を回避
- **全サブエージェント完了待機**: `background_output` で待機
- **specs直列更新**: Step 10 のspecs更新は親エージェントのみ実行
- **Findings / Intake候補件数の集約**: 全サブエージェント完了後、各子Issue PRの Finding 件数を集約し集約完了報告に含める

## フォールバック

サブエージェントが使用できない場合、Sequential Wave（親エージェントがWave内でIssueを1件ずつ順次処理）に切り替え。

## 失敗Issue処理

失敗したIssueはスキップし、成功Issueのみ次フェーズへ進める。失敗Issueは兄弟Issueの実行をブロックしない。
