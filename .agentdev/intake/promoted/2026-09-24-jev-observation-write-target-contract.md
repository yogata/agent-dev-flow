# agentdev_jev observation_write の書込先はツール内部解決で main 側 .agentdev/ に固定される

## 観測内容

Custom Tool `agentdev_jev` の `observation_write` は、書込先 root がツール内部解決（cwd 相対解決）のため、worktree コンテキストの委譲実行から呼び出した場合も main リポジトリ側 `.agentdev/jev-observations/` に帰着する。委譲側から書込先を指定することはできない。

- 実測: case-run の TS-004 導入検証（実 Workflow Jev 観測）で書込先を実測し、main 側 `.agentdev/jev-observations/20260923T133911Z-6859.json`（outcome=completed）への書込みを検証済み。
- 観測元: PR #3082 本文 `## Findings / Capture候補` セクション intake 小見出し（Case #3080 / REQ-091、case-close Capture 回収で回収、2026-09-23）。

## 影響

- 観測 JSON の帰属（Case / worktree）判定を誤るおそれがある。
- case-close の Capture 回収で worktree 側書込みを期待し、回収対象を見誤るおそれがある。

## 課題

契約（custom-tool-contracts）および `.agentdev/` README への observation_write 書込先意味論の明記。処分区分候補: document_correction（低優先度）。

## 既存要件との関連

REQ-090-006 および custom-tool-contracts Design「Jev 先行評価」節のいずれにも書込先意味論の記載はなく、未被覆。
