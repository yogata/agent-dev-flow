# check_integrity.ts の findRepoRoot が worktree 内検証を困難にする（PR #1358 Findings）

## 観察

case-close Issue #1357 / PR #1358 (case-auto Draft 2 OU-002) の TS-001 クロスチェック実施中に観察。`check_integrity.ts` はスクリプト自身の配置位置 (`scriptDir`) を起点に `findRepoRoot(scriptDir)` で repo root を決定する設計であり、スクリプトは main repo の `.opencode/skills/repo-agentdev-integrity/scripts/` に配置されている。このため git worktree (`.worktrees/{N}`) 内で同スクリプトを起動しても main repo の root が返り、worktree 内の編集結果に対する整合性検証が直接的に行えない。

## 影響

- worktree での編集結果検証には、スクリプトを worktree へコピーするか、引数で root を明示する改修が必要
- CI では `check_changed_docs.ts --base-ref origin/main` が変更ファイルスコープで代用するため、実運用上のブロッカーではない
- ローカル開発体験（worktree を用いた並列開発時の検証即時性）の低下要因

## 修正されなかった理由

PR #1358 の AC は REQ-0141-004 施行（broken link 修正、core 滞留語彙除去、IR-057 違反 0 件確認）であり、検証スクリプト自体の改善は対象外。本 PR では worktree 配下ファイルに対する IR-057 等価検査（手動 ripgrep + obsolete-path-map vocab entries 適用）で代替検証し、CI で `check_changed_docs.ts` が変更ファイルスコープで IR-057 を再実行することを注記してマージした。

## 課題

- `check_integrity.ts` の root 解決方式を見直し、引数 `--root` 等で明示可能にする、または環境変数 / worktree 検出で切り替える
- 代替として worktree から呼び出すための wrapper や、変更ファイルベースの `check_changed_docs.ts` のみで運用する方針を明文化する

## 想定対応 Issue

- 保守系（maintenance）— `repo-agentdev-integrity` スクリプト群のローカル開発体験改善。優先度は高くない（CI 代用あり）
- learning 候補としても評価可能だが、具体的な改修対象（スクリプト引数拡張等）が残るため intake として管理する

## 根拠

PR #1358 本文「## Findings / Capture候補 > ### intake」より:

> `check_integrity.ts` は `findRepoRoot(scriptDir)` で main repo を起点とするため、worktree 内での編集結果検証が直接的に行えない。スクリプト自身が main repo の `.opencode/skills/repo-agentdev-integrity/scripts/` に配置されていることに起因。worktree で検証するにはスクリプトを worktree へコピーするか、引数で root を明示する改修が必要。CI では `check_changed_docs.ts --base-ref origin/main` が変更ファイルスコープで代用するため実運用上の問題はないが、ローカル開発体験の改善候補として記録する。

## 観測元

- PR #1358 (Issue #1357 / REQ-0141 UPDATE / case-auto Draft 2 OU-002)
- case-close Step 10 capture 回収
- 観測日時: 2026-07-02 (case-close 実行中)