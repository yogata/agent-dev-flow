# intake: docs/guides に残存する生 gh CLI 表記の正規化候補（OU-005 と同一の正規化対象）

- **発生源**: PR #2711（Issue #2700 / OU-005）の Findings/intake 記録を回収
- **capture 元**: case-close Epic Wave 1（Epic #2695、delegation DEL-CLOSE-A1）
- **captured_at**: 2026-09-09

## 内容

verification-only PR 節の表記統一（ACT-DESIGN-004、commit ff591ef4）と同種の生 gh CLI 表記が検証対象外の場所に残存している:

- `docs/designs/commands/case-close.md` L217: `gh pr view --json mergeable,mergeStateStatus` の生 gh 表記（docs/designs は IR-053 スキャン範囲外のため機械検出対象外）
- `src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md` L121: `gh pr view --json files` の生 gh 表記（IR-053 スキャン範囲内・既存。ff591ef4 と無関係）
- `docs/designs/commands/case-run.md` L322（対象外リスト）: `gh issue list` の言及（commit 5111aac3 由来の既存記述。検証対象節の外側）

## 回収時の要否判断（driver 判断済み事項の反映）

- `src/opencode/skills/agentdev-workflow-case-run/references/single.md` L226 の `gh issue edit --body-file` 言及は「Issue/PR 操作は Custom Tool agentdev_gh を標準とする」理由説明の文脈であり、IR-053 除外候補（custom-tool-contracts.md「迂回防止」基準）。本 item では**回収対象外**とした
- 正規化要否は intake-promote の review で判定すること。case-run.md L322 は対象外リスト内の言及であり、正規化不要の可能性がある

## 補足（Epic #2704 Wave 1 close 時、2026-09-09）

PR #2718（Issue #2706 / OU-007）の Findings で qg-4-final-acceptance.md の同一箇所を再観察。PR #2718 マージ（7964375f）により該当行は L121 近傍から L124 近傍へ移動しているが、`gh pr view --json files` の生 gh 表記自体は未修正のまま残存（同 PR のスコープ外）。新規 item としては起票せず、本 item への補足として記録する。

## 補足（Epic #2734 W5 close 時、2026-09-10）

PR #2751（Issue #2739）の Findings で integrity suite の gh-direct-invocation check が single.md の gh CLI 直接呼出記述を warning として再観察（main 627def84 既出、2026-09-10 集約時点も継続）。同一対象のため新規 item は起票せず本 item へ記録。集約観察は 2026-09-10-textlint-suite-existing-warnings-backlog-candidates.md の #3 を参照。
