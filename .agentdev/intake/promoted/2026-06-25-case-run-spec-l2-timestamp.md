# case-run SPEC の L2 タイムスタンプ計測欠落

## 観測内容

`docs/specs/commands/case-run.md` SPEC（status: draft, updated: 2026-06-22）に、case-run の L2 タイムスタンプ計測（REQ-0151-009、REQ-0130-028）の記載がない。
PR #1128 は case-run コマンド定義（`src/opencode/commands/agentdev/case-run.md`）の Step 5/6/7/8 に L2 計測を追記したが、対応する SPEC（`docs/specs/commands/case-run.md`）への追記が漏れた。
原因は REQ-0151 の spec-save 対象 SPEC に case-run.md が含まれていなかったため（case-auto.md、case-close.md、epic-wave-model.md の 3 SPEC のみが対象）。

## 影響

- case-run SPEC とコマンド定義が L2 計測の点で不整合（SPEC に記載なし、コマンド定義に実装あり）
- REQ-0151-009、REQ-0130-028 の SPEC 適合確認が case-run.md で取れない

## 課題

case-run SPEC へ L2 タイムスタンプ計測を追記し、コマンド定義との整合を取る。

## 既存要件との関連

- Issue #1127、PR #1128（merged, squash 3ed7821）
- REQ-0151-009、REQ-0130-028（L2 タイムスタンプ計測）
- 対象 SPEC: `docs/specs/commands/case-run.md`（status: draft）
- 原因: REQ-0151 の spec-save 対象 SPEC に case-run.md 不在

## 対応方針の方向性

- `/agentdev/spec-save` の再実行で `docs/specs/commands/case-run.md` へ L2 タイムスタンプ計測（REQ-0151-009、REQ-0130-028）を追記する
- 追記後に case-run.md SPEC を draft → accepted 昇格するか（本 PR でコマンド定義が検証済みとなるため昇格条件を満たす可能性）
