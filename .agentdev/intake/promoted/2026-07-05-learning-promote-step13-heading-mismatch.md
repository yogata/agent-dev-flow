# learning-promote Step 13 見出し「アーカイブ移動」と実体の不整合

## 観測内容

PR #1402（Epic #1395 Wave 3, Issue #1398）完了後、`src/opencode/commands/agentdev/learning-promote.md` Step 13 の見出しは「アーカイブ移動（原子的操作）」のままだが、実体は `deferred.md` への追記（リネーム後）。`docs/specs/commands/learning-promote.md` L64 の SPEC 記述「Step 13: アーカイブ移動（原子的）」も同様に見出し維持。

spec-save（commit 3beadaec）で `archive/active.md` → `deferred.md` の文字列置換が行われたが、見出し「アーカイブ移動」は操作概念として残存。

## 影響

- archive/ 廃止・deferred.md リネーム後も「アーカイブ移動」という見出しが残存するため、読者が「archive/ への移動」を想起し、deferred.md（living pool）への追記という実体と齟齬が生じる
- ドキュメントの概念一貫性が損なわれる

## 課題

以下いずれかの方向性を決定:
- (a) 「アーカイブ移動」→「deferred 移動」または「inbox → deferred 移動」に SPEC（`docs/specs/commands/learning-promote.md` L64）と command（`src/opencode/commands/agentdev/learning-promote.md` Step 13 見出し）を整合更新する
- (b) 「アーカイブ移動」は操作のメタファーとして維持（archive/active.md 廃止後も「アーカイブ的移動」を意味する）との判断で見送る

## 既存要件との関連

- PR #1402 SPEC確定候補 SC-001（case-close Step 3-2 option (c)「見送り」により記録）
- `docs/specs/commands/learning-promote.md` L64
- `src/opencode/commands/agentdev/learning-promote.md` Step 13
- archive/active.md 残存一括是正（learning ドメイン、別成果物）と関連するが見出し意味判断は独立
