---
description: promoted artifact を分析・統合し、Requirement Unit（RU）を生成する
agent: sisyphus
---

> **Deprecated**: このコマンドは `/agentdev/backlog-review` + `/agentdev/backlog-save` に分割されました（REQ-0105-038, 039）。
>
> - **分析・ユーザー承認**: `/agentdev/backlog-review`
> - **RU 生成・永続化**: `/agentdev/backlog-save`
>
> 今後は上記コマンドを使用してください。本コマンドは移行期間中のみ維持されます。

# Req Backlog（非推奨）

`/agentdev/backlog-review` → `/agentdev/backlog-save` を順次実行する互換ラッパー。

## Steps

1. `/agentdev/backlog-review` を実行（ユーザー承認まで含む）
2. 承認結果を `/agentdev/backlog-save` に引き渡して実行
3. 完了報告 → completion-reports/req-backlog/standard.md
