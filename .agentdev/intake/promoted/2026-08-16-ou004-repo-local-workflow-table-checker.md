# /repo/* の前出出力検証表移行に伴う checker 対象拡張（repo-local 向け表形式検査）

## 観測内容

OU-004 の層3転換で check_command_format.ts の旧検出規則（Step 0 検出・Step 非連番検出・numbered list 主手順検出）を廃止したが、docs-check.md（/repo/*）が `## 手順` + `### Step N` 形式を維持しているため、廃止規則は /repo/* には当初から非適用のままとなっている。/repo/* を前出出力検証表へ移行する際、checker の対象拡張（repo-local 向け表形式検査）が必要になる見込み。

## 影響

- /repo/* の形式検査が checker 対象外のまま移行すると、形式回帰を機械検査で捉えられない

## 課題

/repo/* の前出出力検証表移行時に、check_command_format.ts へ repo-local 向け表形式検査の対象拡張を検討する。

## 既存要件・成果物との関連

- 対象: check_command_format.ts、/repo/*（docs-check.md）
- 関連: 2026-08-16-ou004-en-substep-lettered-prefix-cleanup.md（同移行に伴う規約節整理）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2188 (Issue #2183 / OU-004, Epic #2178 Wave 3) SPEC確定候補 セクション 2
- 元 item: intake-2026-08-16-ou004-repo-local-workflow-table-checker.md
