# IR-044 稼働で既存 active REQ に SPEC 混入シグナルが検出された

## 観測

Issue #899 (RU-2) で IR-044（REQ/SPEC 境界違反検出）を実装し、full-audit で稼働確認したところ、既存 active REQ 8件（REQ-0101, REQ-0104, REQ-0108, REQ-0114, REQ-0124, REQ-0126, REQ-0131, REQ-0136）に SPEC 詳細混入シグナル（Step 番号・fixture・enum・schema field 等）が検出された。

これは REQ-0136-017「既存REQ の SPEC 混入が IR-044 導入後に洗い出され、ユーザー承認を得た上で SPEC ファイルへ移行されること」の想定内成果物である。現在は heuristic warning のみで block 対象外。

## 影響

- 検出された REQ 要件行の SPEC 詳細（Step 番号・fixture・enum 等）を SPEC/rule catalog/command reference/skill reference へ段階的に移行する必要がある
- 安定契約例外（REQ-0101-069: 公開command名・domain state位置づけ等）に該当する要約残留は検出対象外として正しく除外されている
- REQ-0136-017 の完了条件は OU-05 (Issue #903) で扱われる予定

## レビューで決めること

- 検出された SPEC 混入の優先順位付け（どの REQ から移行するか）
- 各 REQ の SPEC 詳細をどの SPEC ファイルへ移行するか
- 一括移行 vs 段階的移行の判断

## 根拠

- PR #912: https://github.com/yogata/agent-dev-flow/pull/912
- Issue #899: https://github.com/yogata/agent-dev-flow/issues/899
- REQ-0136-017: 既存REQ の SPEC 混入洗い出し要件
- Epic #896 Wave 4 OU-05 (Issue #903): finding 自動化 + 既存REQ クリーンアップ
