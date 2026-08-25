# command-file-format SPEC 陳腐化是正と check_command_format.ts 対象拡張の残候補

## 観測

/repo/docs-check.md の前出出力検証表移行（Issue #2229・PR #2274）に伴い、command-file-format SPEC と checker 側に旧様式前提の陳腐化が4件確認された。

1. `docs/specs/authoring/command-file-format.md`「手順セクション形式」節の「前得出出力検証表」はタイポ（正: 前出出力検証表。同 SPEC「機械検査対象」節では「前出出力検証表様式」と正しく表記）
2. 同 SPEC「代替フロー内サブステップ表現 > 代表例」（`case-close.md` の `**E1.**`〜`**E6.**`）が実態と陳腐化。公開 `/agentdev/*` コマンドの `src/opencode/commands/agentdev/` 配下で `**EN.**` 形式は grep 0件（W1 移行で消滅）
3. 同 SPEC「注意」3番目の理由付け「公開 `/agentdev/*` コマンドでは主手順の手順列挙を `### Step N` 形式で表現する前提のため」が旧様式前提で陳腐化（公開コマンドは既に前出出力検証表へ移行済み）。`/repo/*` 限定という結論自体は移行後も妥当
4. `check_command_format.ts` の実装コメント「`/repo/* Command は従来形式を維持する`」（`PUBLIC_COMMAND_DIR_PATTERN` 定義部）が本移行で前提崩れ（`/repo/*` に `### Step` 見出しを使う command が存在しなくなった）

あわせて PR #2274 の SPEC確定候補として、checker への repo-local 向け表形式検査（`command-format-public-step-heading`・`command-format-workflow-table`）の `/repo/*` への対象拡張が検討され、結論「本 Issue では実装しない」（理由: Issue 対象範囲が検討のみ、SPEC「thin Command モデル検査」節の区別方針更新が先決、走査対象が docs-check.md 1ファイルのみで便益小、EN. 形式の SPEC 記述が旧様式前提で陳腐化し checker 拡張の前に SPEC 整理が必要）が記録された。残候補として「拡張実装・checker コメント更新は SPEC 陳腐化箇所の整理とセットで別途 Issue 化することが適切」と明記されている。

## 今回扱わない理由

Issue #2229 の対象範囲は /repo/docs-check.md の移行と checker 対象拡張の検討記録のみ。SPEC 本文の陳腐化是正と checker 本体の変更はいずれも対象外宣言どおり別課題。

## 影響

SPEC の代表例・理由付けが実態と乖離したまま残り、EN. 形式規約の解釈の根拠が不安定になる。checker 実装コメントも将来の対象拡張判断の誘導として陳腐化したまま残る。

## レビューで決めること

- SPEC 陳腐化是正（タイポ修正、代表例の実態追従または削除、理由付けの書き直し）と checker 対象拡張・コメント更新を単一 Issue で扱うか、SPEC 是正を先行させるか（PR 本文の残候補は「セットで」を推奨）
- checker 対象拡張の要否自体（走査対象が docs-check.md 1ファイルのみで便益は将来の新規 /repo/* command 追加時に限られる）

## 根拠

- PR 2274 本文「Findings / Capture候補」1〜4件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2274）
- PR 2274 本文「SPEC確定候補」check_command_format.ts への repo-local 向け表形式検査の対象拡張の検討記録（残候補の別途 Issue 化）
