# check_integrity.ts の findRepoRoot が worktree 内検証を困難にする（PR #1358 Findings）

## 観測内容

case-close Issue #1357 / PR #1358 (case-auto Draft 2 OU-002) の TS-001 クロスチェック実施中に観察。`check_integrity.ts` はスクリプト自身の配置位置 (`scriptDir`) を起点に `findRepoRoot(scriptDir)` で repo root を決定する設計であり、スクリプトは main repo の `.opencode/skills/repo-agentdev-integrity/scripts/` に配置されている。このため git worktree (`.worktrees/{N}`) 内で同スクリプトを起動しても main repo の root が返り、worktree 内の編集結果に対する整合性検証が直接的に行えない。

## 影響

- worktree での編集結果検証には、スクリプトを worktree へコピーするか、引数で root を明示する改修が必要
- ローカル開発体験（worktree を用いた並列開発時の検証即時性）の低下要因
- CI では `check_changed_docs.ts --base-ref origin/main` が変更ファイルスコープで代用するため、実運用上のブロッカーではない

## 課題

- `check_integrity.ts` の root 解決方式を見直し、引数 `--root` 等で明示可能にする、または環境変数 / worktree 検出で切り替える
- 代替として worktree から呼び出すための wrapper や、変更ファイルベースの `check_changed_docs.ts` のみで運用する方針を明文化する

## 既存要件との関連

- REQ-0141-004 施行（broken link 修正、core 滞留語彙除去、IR-057 違反 0件確認）: PR #1358 で完了
- 本 item は `check_integrity.ts` のローカル開発体験改善（保守系、優先度は高くない）

## 観測元

- PR #1358 (Issue #1357 / REQ-0141 UPDATE / case-auto Draft 2 OU-002)
- case-close Step 10 capture 回収
