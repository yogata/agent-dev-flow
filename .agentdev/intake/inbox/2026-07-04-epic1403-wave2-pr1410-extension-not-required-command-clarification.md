# extension未所持 command が正常である旨の運用明確化（SPEC確定候補）

## 観測

PR #1410（Epic #1403 Wave 2, Issue #1406）の移行作業で、`.agentdev/extensions/commands/` 配下に16個の extension が作成された。配布 command 総数は17個のため、1個の command が extension を持たない。これは `inspect-extensions` command（SPEC 直接参照を持たず project 非依存で動作するため extension 不要、標準動作で継続）。

`docs/specs/foundations/project-extensions.md` line 61「対象extension が存在しない場合は標準動作で続行する」に既述だが、実際の運用観点（「extension を持たない command が存在し正常である」旨）の明記がない。

## SPEC確定候補としての位置づけ

PR #1410 SPEC確定候補 S-1。case-close Step 3-2 の処理結果は **見送り（option c）**:
- 対象 SPEC（project-extensions.md）は `status: draft` だが、本 Issue #1406 の実装は SPEC 内容の検証（実装と整合）を完了している
- S-1 は SPEC 本文への追記候補であり status 変更（draft→accepted）ではないため、case-close 内での処理は「見送り + intake 保存」とした
- spec-save の再実行により SPEC 本文へ追記するかは backlog-review → req-define で判断

## 今回扱わなかった理由

SPEC status 昇格（draft→accepted）は「実装が SPEC 内容を検証した」ことが条件（case-close Step 3-2）。S-1 は SPEC 本文への内容追記であって status 昇格ではない。SPEC status 昇格は別途 case-close で実施するか、独立した spec-save で処理すべき。

## 影響

- 運用文面の明示化が無くとも、`check_extensions.ts` は `public_commands=17` に対して extension 数が16以下を正常扱いする（ok=true）
- ただし新規 command 追加時に「extension 必須」と誤解されるリスクが残る

## レビューで決めること

- project-extensions.md へ「extension を持たない command が存在し正常である」旨を追記するか
- SPEC status の昇格（draft→accepted）タイミングを S-1 処理と同時に行うか、独立 case として切り出すか

## 根拠

PR #1410 SPEC確定候補 S-1 より。Wave 2 case-close で回収（見送り + intake 保存）。