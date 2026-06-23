# ADR-0113 (deprecated) Decision 主題違反 — ADR 整理ケース候補

## 観測

OU-002 Wave 3 (#1021 / PR #1025) の横断検出で、`docs/adr/ADR-0113.md` に REQ-0101-043/044 違反（Decision セクションが「廃止・削除・移行」を作業手段として主題化）を検出した。

- **ファイル**: `docs/adr/ADR-0113.md`
- **違反箇所**: title「診断ワークフロー導入とレビュー系コマンド完全削除」、Decision セクション `### 2. docs-review / skill-review の完全削除`
- **違反基準**: REQ-0101-043/044（廃止・削除・移行は Decision 主題にせず結果・影響セクションに位置づける）

本 Wave の constraint「Do NOT edit REQ/ADR files」により未修正。検出のみ行い PR #1025 Findings に記録した。

## 影響

- ADR-0113 は `status: deprecated`（2026-06-16, OU-07）。diagnostics → inspect 改名により現行根拠として非適合。deprecated ADR のため現行基盤への影響なし。
- `/repo/docs-check` が本違反を含む事前存在 NG findings を報告し続ける（Wave 3 scope 外として残存）。
- REQ-0101-043/044 の機械判定ルールが deprecated ADR をどう扱うか（検出対象に含めるか除外するか）が未確定。

## レビューで決めること

- ADR-0113 を `retired/` へ移動（完全廃止）するか、deprecated のまま Decision セクションを結果・影響へ再分類するか。
- REQ-0101-043/044 の機械判定ルール（`/repo/docs-check`）で deprecated ADR を検出対象外とするフラグを ADR frontmatter に追加するか。
-Wave 3 で見送った ADR Decision 主題違反の横断検出結果を、次工程の ADR 整理 RU の入力とするか。

## 根拠

- PR #1025 Findings / Capture候補: https://github.com/yogata/agent-dev-flow/pull/1025
- 対象: `docs/adr/ADR-0113.md`
- 違反基準: REQ-0101-043, REQ-0101-044（廃止・削除・移行の Decision 主題化禁止）
- 前提: OU-002 Wave 3 constraint「Do NOT edit REQ/ADR files」
- 関連 Epic: OU-002 #1018（本 Wave 3 で完結・本 intake は後続 ADR 整理ケースへ委譲）
