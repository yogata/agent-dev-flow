# QG-3/QG-4 references の旧 case-run Step 番号（stale reference）

## 観測

PR #1014 (Issue #1013 / REQ-0143) の case-run ステップ再編（Step 4→5, 5→6 等）に伴い、`agentdev-quality-gates` スキルの QG-3/QG-4 references 内に旧 case-run Step 番号（Step 7, Step 8, Step 11-1 等）の stale reference が残っている（pre-existing）。今回の準拠作業は command 定義ファイルの Step 形式を対象とし、skill references 内の Step 番号参照の追従更新は含まれていない。

## 影響

- QG-3/QG-4 実行時の case-run Step 参照が現行番号と不一致になり、ゲート評価時の手順照合が困難。
- 今後の品質ゲート運用で参照迷子による評価漏れの可能性。

## レビューで決めること

- QG-3/QG-4 references 内の case-run Step 番号参照を現行番号へ一括更新するか。
- 更新する場合、`agentdev-quality-gates/references/qg-3-implementation-deviation.md`・`qg-4-final-acceptance.md` の両方を対象とするか。

## 根拠

- PR #1014: https://github.com/yogata/agent-dev-flow/pull/1014
- Issue #1013: https://github.com/yogata/agent-dev-flow/issues/1013
- 対象: `.opencode/skills/agentdev-quality-gates/references/qg-3-implementation-deviation.md`, `qg-4-final-acceptance.md`
- 関連: case-run Step 再編（PR #1014 変更内容）
