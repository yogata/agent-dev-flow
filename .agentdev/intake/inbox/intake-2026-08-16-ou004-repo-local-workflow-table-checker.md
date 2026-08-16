# Intake Item: /repo/* の前出出力検証表移行に伴う checker 対象拡張（repo-local 向け表形式検査）

## 発生源

- PR: #2188 (Issue #2183 / OU-004, Epic #2178 Wave 3)
- 発生 phase: case-close Capture 回収（SPEC確定候補）
- capture 分類: intake（SPEC確定候補、backlog 化）

## 問題

OU-004 の層3転換で check_command_format.ts の旧検出規則（Step 0 検出・Step 非連番検出・numbered list 主手順検出）を廃止したが、docs-check.md（/repo/*）が `## 手順` + `### Step N` 形式を維持しているため、廃止規則は /repo/* には当初から非適用のままとなっている。/repo/* を前出出力検証表へ移行する際、checker の対象拡張（repo-local 向け表形式検査）が必要になる見込み。

## 推奨対応

/repo/* の前出出力検証表移行時に、check_command_format.ts へ repo-local 向け表形式検査の対象拡張を検討する。SPEC 本文の確定は backlog 化後に扱う。

## 関連

- Issue: #2183 (CLOSED), Epic: #2178 (CLOSED)
- PR: #2188 (SPEC確定候補 セクション 2)
