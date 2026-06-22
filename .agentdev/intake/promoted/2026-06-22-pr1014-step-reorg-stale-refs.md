# PR #1014 Step 再編に伴う stale reference の一括更新（QG-3/QG-4 refs・case-close ガードレール）

## 観測

PR #1014 (Issue #1013 / REQ-0143) の case-run ステップ再編に伴い、参照側の Step 番号が旧番号のまま残存している。今回の準拠作業は command 定義ファイルの Step 形式を対象とし、skill references 内・ガードレール本文内の Step 番号参照の追従更新は含まれていない。

### 残存箇所

1. **QG-3/QG-4 references**: `.opencode/skills/agentdev-quality-gates/references/qg-3-implementation-deviation.md`・`qg-4-final-acceptance.md` 内に旧 case-run Step 番号（Step 7, Step 8, Step 11-1 等）の stale reference が残存。
2. **case-close ガードレール**: `src/opencode/commands/agentdev/case-close.md` のガードレール G17・G19・G23 が旧 Step 番号を参照。今回の準拠作業はガードレール番号形式の統一（G01 形式）を対象とし、ガードレール本文内の Step 番号参照の追従更新は含まれていない。

## 影響

- QG-3/QG-4 実行時の case-run Step 参照が現行番号と不一致になり、ゲート評価時の手順照合が困難
- case-close 実行時、ガードレールが参照する Step 番号と実際の手順 Step 番号が不一致
- 今後の品質ゲート・case-close 運用で参照迷子による評価漏れ・ガードレール違反見逃しの可能性

## 課題

- QG-3/QG-4 references 内の case-run Step 番号参照を現行番号へ一括更新
- case-close.md の G17・G19・G23 の Step 番号参照を現行番号へ一括更新
- 他の command ファイル・skill references でも同種の stale Step 参照がないか横断確認

## 既存要件との関連

- PR #1014 (Issue #1013 / REQ-0143) の case-run ステップ再編

## 根拠

- 元 inbox item:
  - `2026-06-22-issue1013-qg3-qg4-stale-case-run-step-refs.md`
  - `2026-06-22-issue1013-case-close-guardrail-stale-step-refs.md`
- PR #1014 / Issue #1013 / REQ-0143
