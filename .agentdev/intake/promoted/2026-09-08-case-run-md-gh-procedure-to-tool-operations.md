# case-run.md の raw gh 手続き記述の Custom Tool 操作名表記への統一

## 観測内容

`docs/designs/commands/case-run.md` L200/L216 に `gh pr view --json files`、`gh pr merge --squash` の現行文脈記述が残存している。case-run.md は Epic #2681 の stage 0 Design 適用対象外であり、PR #2685 では未修正のまま残された。GitHub I/O 正規境界（Custom Tool `agentdev_gh`）への統一が完了した現行体系では、移管仕上げ候補として処置が望ましい。

## 影響

- Design 記述が raw gh CLI の直接実行を示唆し続け、Custom Tool 経由の正規 I/O 境界（REQ-011 体系）と食い違う読まれ方をする可能性がある

## 変更候補

- L200/L216 の raw gh 手続き記述を Custom Tool 操作名（pr_changed_files / pr_merge 等）表記へ統一する
- 処置時は同一形式の既存書き換えパターン（stage 0 の case-close.md「現在の動作」セクション、PR #2685 の TS-006 zero-check 是正）を踏襲する

## 既存要件・成果物との関連

- `docs/designs/responsibilities/custom-tool-contracts.md`（GitHub I/O 正規境界の正規所有 Design）
- `docs/designs/commands/case-run.md`（対象ファイル）

## 出所

- 元 intake item: `2026-09-08-case-run-md-raw-gh-procedure-residual-2682.md`（PR #2685 Findings/Capture候補由来、Issue #2682・Epic #2681 Wave 1）
