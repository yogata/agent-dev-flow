# llm-expression-patterns.md lines 54/55/59/60 の復元不能 head word 補充候補

## 発生源

- Issue: #1166
- PR: #1168 (merged, squash 7f3bc191)
- 発生日: 2026-06-25

## 内容

`src/opencode/skills/agentdev-doc-writing/references/llm-expression-patterns.md` 第3節の lines 54/55/59/60 は、検出パターン列の head word が復元不能（解説列の「」括弧内引用語も欠損）のため、PR #1168 では明示的 `N/A` 表記 + 理由明示で TS-004 on_failure record-in-findings 適用とした。

書き換え列の意味から候補を絞れるが一意に特定できない状態。本来の表現が判明した場合は、`N/A` から表現パターン名（backtick 付き）へ補充することで検出辞書の網羅性を向上できる。

該当行の現状:
- line 54: `N/A`（書き換え: 具体的対象範囲を明示、本来は「範囲が不明となる表現」）
- line 55: `N/A`（書き換え: 具体的方法を明示、line 54 と同等）
- line 59: `N/A`（書き換え: 強調削除、重要性の根拠を本文で示す、本来は「主観的強調の副詞」）
- line 60: `N/A`（書き換え: 強調削除、理由を本文で示す、line 59 と同等）

## 推奨対応先

別 Issue として切り出すことを推奨。作業候補:

- 過去の doc-writing 関連 Issue/PR（#1106, #1117, #1122 等）の議論・SPEC から本来の表現を特定
- 復元できた細胞のみ backtick 付き表現へ置換（`N/A` → `` `表現〜` ``）
- 復元不能なものは `N/A` + 理由明示を維持

## 現在の追跡状態

- PR #1168 `## Findings / Capture候補` No.2 に記録済み
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
