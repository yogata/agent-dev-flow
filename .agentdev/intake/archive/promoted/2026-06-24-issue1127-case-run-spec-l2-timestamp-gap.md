# case-run SPEC の L2 タイムスタンプ計測欠落

## 発生源

- Issue: #1127
- PR: #1128 (merged, squash, commit 3ed7821)
- 発生日: 2026-06-24

## 観測

`docs/specs/commands/case-run.md` SPEC（status: draft, updated: 2026-06-22）に、case-run の L2 タイムスタンプ計測（REQ-0151-009、REQ-0130-028）の記載がない。PR #1128 は case-run コマンド定義（`src/opencode/commands/agentdev/case-run.md`）の Step 5/6/7/8 に L2 計測を追記したが、対応する SPEC（`docs/specs/commands/case-run.md`）への追記が漏れた。原因は REQ-0151 の spec-save 対象 SPEC に case-run.md が含まれていなかったため（case-auto.md、case-close.md、epic-wave-model.md の3 SPEC のみが対象）。

PR #1128 本文の `## SPEC確定候補` セクションで明示的に指摘されていた。case-run.md SPEC は draft かつ今回の実装が内容を検証していない（SPEC 本文に L2 記載がないため検証対象が存在しない）ため、draft → accepted 昇格の対象外。

## 今回扱わない理由

#1127 のスコープはコンフリクト解消モデルとタイムスタンプ計測のコマンド定義実装。SPEC 本文への L2 計測追記は spec-save の責務であり、本 Issue（実装担当）のスコープ外。PR は本項目で完了をブロックしない。

## 影響

- case-run SPEC とコマンド定義が L2 計測の点で不整合（SPEC に記載なし、コマンド定義に実装あり）。
- REQ-0151-009、REQ-0130-028 の SPEC 適合確認が case-run.md で取れない。

## レビューで決めること

- `/agentdev/spec-save` の再実行で `docs/specs/commands/case-run.md` へ L2 タイムスタンプ計測（REQ-0151-009、REQ-0130-028）を追記するか。
- 追記後に case-run.md SPEC を draft → accepted 昇格するか（本 PR でコマンド定義が検証済みとなるため昇格条件を満たす可能性）。

## 根拠

PR #1128 本文「SPEC確定候補」セクション。case-close Step 3-2（SPEC確定フロー）にて option (b)「spec-save 再起動の提案」として処理。capture-boundaries の split rule に従い具体的修正対象は intake へ分離。
