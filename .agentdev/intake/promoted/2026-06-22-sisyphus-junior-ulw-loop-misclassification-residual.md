# Sisyphus-Junior(ulw-loop) 誤分類表記の残存（source 版 SKILL.md・case-auto.md）

## 観測

PR #1022 (Issue #1017) で SPEC 版の誤分類表記 `Sisyphus-Junior(ulw-loop)` を修正したが、以下の箇所に同名の表記が残存している。`/ulw-loop` は skill ではなく command であり、`Sisyphus-Junior(ulw-loop)` は誤分類。

### 残存箇所

1. **source 版 workflow-orchestration SKILL.md**: `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md` L8 description に `Sisyphus-Junior(ulw-loop)` 表記が残存。SPEC 版（`docs/specs/skills/agentdev-workflow-orchestration.md`）は修正済み。
2. **case-auto.md**: `src/opencode/commands/agentdev/case-auto.md` L45, L74 に `Sisyphus-Junior(ulw-loop)` 表記が 2 箇所残存。Issue #1017 の完了条件の字面判定では捕捉されなかった。

## 影響

- source 版 SKILL.md の description は `/help` 等でユーザに提示される可能性が高く、誤分類表記が継続露出
- case-auto.md が SPEC `docs/specs/commands/case-run.md`（正規化済み）・`src/opencode/commands/agentdev/case-run.md`（本 PR で正規化済み）と表記不一致
- 読者に「ulw-loop は Sisyphus-Junior の修飾または別名」との誤解を与える

## 課題

- 残存箇所（計3箇所）を `Sisyphus-Junior` へ修正
- SPEC↔source 同期の自動検査強化
- `Sisyphus-Junior\(ulw-loop\)` パターンの grep 検査を恒久ルール化し、再発防止

## 既存要件との関連

- SPEC `docs/specs/commands/case-run.md`（正規化済み委譲契約）
- SPEC↔source 同期ルール（REQ-0101-017-026 関連）

## 根拠

- 元 inbox item:
  - `2026-06-22-issue1017-workflow-orchestration-source-sisyphus-junior-ulw-loop.md`
  - `2026-06-22-issue1017-case-auto-sisyphus-junior-ulw-loop-residual.md`
- PR #1022 / Issue #1017
