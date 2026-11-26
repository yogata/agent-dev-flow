---
id: 2026-11-26-draft-artifact-action-same-target-overwrite
created_at: 2026-11-26T22:50:00+09:00
source: case-open (Root Case #4227 の自工程 deviation capture)
status: unreviewed
---

# draft の ACT-DESIGN-004 と ACT-DESIGN-005 が同一 H3 節を書き換え対象として重複している

- **課題**: Root Case #4227 の draft で ACT-DESIGN-004（target_area「対話ウィザード」、H2 全体を content として持つ）と ACT-DESIGN-005（target_area「導入先での Codex・Antigravity の選択」、同一 H3 節のみを content として持つ）が docs/designs/local/install-script-usability.md の同一 H3 節（「導入先での Codex・Antigravity の選択」）を書き換え対象として重複している。適用順の結果 005 の文言が最終状態となり、004 の H3 記述は置換される。draft 生成段階で同一対象の重複・衝突を検出する仕組みがない
- **期待する処分**: 上流（req-define の draft 生成）へ同一対象 action の重複検出・警告を加えるかを判断する。本 Case の適用結果（005 優先で確定）は case-open の実行記録として扱う
- **出典**: Root Case #4227 の case-open 実行（2026-11-26、draft の artifact_actions 構造確認と機械工程適用）
- **実証根拠**: draft 489〜559 行の ACT-DESIGN-004/005 宣言（同一 target、target_area の包含関係）と、004 の content が H3「導入先での Codex・Antigravity の選択」を含み 005 の content が同一 H3 を別文言で持つことの確認
