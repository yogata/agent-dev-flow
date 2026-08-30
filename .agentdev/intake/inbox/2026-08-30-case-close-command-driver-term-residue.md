# case-close command line 12 の「driver」は旧実行主体名の残存候補

## 観測

配布 command・skill 70 ファイルの文章品質是正（REQ-053-013 履行、PR #2484）で、src/opencode/commands/agentdev/case-close.md line 12 の「case-run/ driver/ 外部実行バックエンド」という表記中の「driver」が旧実行主体名の残存候補であることが確認された。現行語は「実行担当サブエージェント / 外部実行基盤」である。

置換先の特定は文脈から一義と断定できないため、本件（AG-005 推測修正禁止）では保持して是正していない。

## 影響

- 実行主体を指す語彙が文書間で不統一になり、読者が旧語と現行語の対応を推測する必要がある
- 同型の旧語残存が他の配布物にもある可能性

## レビューで決めること

- 「driver」の意図（現行語どれに対応するか）の特定と是正
- 旧実行主体名の横断残存確認

## 根拠

- PR #2484 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2484 ）
