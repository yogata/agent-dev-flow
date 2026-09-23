# agentdev_jev observation_write の書込先はツール内部解決で main 側 .agentdev/ に固定される

## 観測内容

`agentdev_jev` の `observation_write` は、worktree コンテキストの委譲実行から呼び出した場合も main リポジトリ側 `.agentdev/jev-observations/` へ書込む（書込先 root はツール内部解決で委譲側から指定不可）。case-close の Capture 回収や観測 JSON の帰属（Case / worktree）判定で worktree 側書込みを期待しない注意喚起が有用な可能性（本筋外の機構観察）。

## 根拠

- 観測元: PR #3082（https://github.com/yogata/agent-dev-flow/pull/3082）本文 `## Findings / Capture候補` セクション intake 小見出し
- 関連: Case #3080（REQ-091、case-close Capture 回収で回収）
- コンテキスト: case-run の TS-004 導入検証（実 Workflow Jev 観測）で observation_write の書込先を実測（main 側 `.agentdev/jev-observations/20260923T133911Z-6859.json`、outcome=completed）
