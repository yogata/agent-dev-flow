# cli_utils.ts の将来計画 normative 参照

## 観測内容
repo-local `cli_utils.ts` に `.omo/plans/agentdev-migration-2026-08-05.md §7` を Normative とするコメントが残る。

## 影響
将来計画の移動・削除で参照切れとなり、計画資料が正規規範であるとの誤認が残る。現行の Design 方針とも整合しない。

## 課題
normative 表記を削除するか、非 normative の実在する参照先へ付け替える。対象は `repo-agentdev-integrity/scripts/cli_utils.ts`。

## 既存要件・正規成果物との関連
Issue #2571、PR #2590、REQ-057-015、`cli_utils.ts` 21行目。
