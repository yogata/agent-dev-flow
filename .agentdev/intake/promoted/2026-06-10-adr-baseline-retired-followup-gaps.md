# ADR baseline/retired 導入後の未完了フォローアップ

## 観測

Issue #671（ADR体系全面改定・01XX baseline導入・retired移動）の子Issue検証にて、以下のギャップを検出した。

### #675 command/skill後続変更 — 3/7項目が部分対応

- **agentdev-learning-pipeline**: ADR候補分類前にADR禁止条件で絞るフィルタリングゲートが未実装。問題クラス分類基準（line 88-98）の前にADR禁止基準による事前絞り込みがない
- **req-define**: ADR判定根拠・ADR不要理由の記録ステップが未実装。Step 5の「ADR判断を記録」は判定結果のみで根拠のトレーサビリティがない
- **req-save**: adr-revision-mode: full-reclassification相当の処理ロジックが未実装。標準CREATE/APPEND/UPDATE/SPLITのみでADR全面改定シナリオの特殊処理がない

### #676 SPEC更新 — workflow-contracts.md

- Line 213のADR globパターン `docs/adr/ADR-*.md` がbaseline/retired構造を反映していない。retired/ サブディレクトリの存在が考慮されていない

### #677 Guides更新 — design-principles.md

- false negative基準（ADRが必要なのに見逃しを防止する基準）の記載がない。提案内容に含まれていたが完了条件からは外れていたため未対応

## 影響

- learning-pipelineでADR不要な項目がADR候補として誤分類される可能性がある
- req-defineでADR判定の根拠が記録されず、後から「なぜADRが必要/不要だったか」が追跡不能
- req-saveでADR全面改定シナリオ（baseline再編）を実行できない
- workflow-contracts.mdのglobパターンが不正確だが実用上の影響は軽微

## backlog-review での検討事項

- 5項目を個別Issueとして扱うか、まとめて1Issueで対応するか
- learning-pipeline / req-define / req-save の3項目はREQ-0112-050との兼ね合いで優先度をどう設定するか
- workflow-contracts.mdのglob修正の優先度（実用上の影響が軽微）
- design-principles.mdのfalse negative基準の追加有無（完了条件外だったが提案内容に含まれていた）

## 根拠

- Issue #671: https://github.com/yogata/agent-dev-flow/issues/671
- PR #682（#675対応・MERGED）: https://github.com/yogata/agent-dev-flow/pull/682
- PR #681（#676対応・MERGED）: https://github.com/yogata/agent-dev-flow/pull/681
- PR #680（#677対応・MERGED）: https://github.com/yogata/agent-dev-flow/pull/680
- REQ-0112（ADRライフサイクル標準化）
