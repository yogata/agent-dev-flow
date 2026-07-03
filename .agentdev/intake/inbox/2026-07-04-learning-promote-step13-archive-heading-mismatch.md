# learning-promote Step 13 見出し「アーカイブ移動」と実体（deferred.md 追記）の不整合

## 観測

PR #1402（Epic #1395 Wave 3, Issue #1398）完了後、`src/opencode/commands/agentdev/learning-promote.md` Step 13 の見出しは「アーカイブ移動（原子的操作）」のままだが、実体は `deferred.md` への追記（リネーム後）。`docs/specs/commands/learning-promote.md` L64 の SPEC 記述「Step 13: アーカイブ移動（原子的）」も同様に見出し維持。

spec-save（commit 3beadaec）で `archive/active.md` → `deferred.md` の文字列置換が行われたが、見出し「アーカイブ移動」は操作概念として残存。

## 今回扱わなかった理由

PR #1402 は文字列置換と AG-005 多状態性明記が対象であり、Step 13 見出しの意味整合性は別判断となる。SPEC 変更を伴うため本 PR では見送り、case-close Step 3-2 SPEC 確定フローでの判断を提案していた。本候補は同フロー option (c)「見送り」により後続への委譲として記録。

## 影響

archive/ 廃止・deferred.md リネーム後も「アーカイブ移動」という見出しが残存するため、読者が「archive/ への移動」を想起し、deferred.md（living pool）への追記という実体と齟齬が生じる。ドキュメントの概念一貫性が損なわれる。

## レビューで決めること

以下のいずれか（PR #1402 SPEC確定候補 SC-001 より）:

- (a) 「アーカイブ移動」→「deferred 移動」または「inbox → deferred 移動」に SPEC（`docs/specs/commands/learning-promote.md` L64）と command（`src/opencode/commands/agentdev/learning-promote.md` Step 13 見出し）を整合更新する
- (b) 「アーカイブ移動」は操作のメタファーとして維持（archive/active.md 廃止後も「アーカイブ的移動」を意味する）との判断で見送る

## 根拠

PR #1402 SPEC確定候補 SC-001 より。case-close Step 3-2 SPEC 確定フロー option (c)「見送り」により記録。ユーザー承認を要する判断のため自動処理せず後続へ委譲。
