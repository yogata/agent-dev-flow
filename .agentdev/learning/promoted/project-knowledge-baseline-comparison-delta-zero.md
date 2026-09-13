# baseline 未整備環境での対照実行による gate 合格判定（delta 0 実証）

## 背景

baseline ファイル不在環境（worktree、新環境）では、baseline 保持型 gate/checker が既存違反を新規違反と区別できず failure 化する。case 2787 で self-sync 適用後の docs-check 検査（走査対象切替）と配布依存境界 gate の2系統で同時に顕在化した。

## 問題

- `check_distribution_boundary.ts --profile source` が baseline 不在のため delta 計算が動かず、既存 violation（PR 変更と無関係）を `ok: false` で報告し、gate 合格判定が機械的に得られない
- worktree で `self-sync.ps1 -Mode apply` を実行すると走査対象が投影側へ切り替わり、NG baseline 未整備環境では既知 NG が新規 unmanaged NG として顕在化する

## 望ましい変更

baseline 未整備環境での gate 実行時は、対照実行（同一 detector・同一引数を main HEAD（PR 変更未適用）と変更 HEAD（worktree）で同一環境再実行）により同一 signature を確認し、新規違反 delta 0 を実証して合格扱いと判定する手順を標準化する。baseline policy（baseline 超過分のみ gate 失敗）に基づく判定根拠として記録する。

## 対象範囲

- 対象: baseline 保持型 checker の gate 合格判定（distribution-boundary gate、docs-check 系検査）、worktree での self-sync 適用後検査
- 対象外: baseline ファイルの整備自体（IR-059 baseline 整備は後続課題）、checker 実装の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|---|---|---|
| Design | docs/designs/integrity/distribution-boundary.md | baseline policy 節への対照実行 delta 0 判定手順の追記 |
| Design | docs/designs/integrity/checker-execution-contracts.md | baseline 未整備環境での対照実行手順の追記 |
| knowledge | docs/knowledge/（新規知識文書） | 対照実行による gate 合格判定の知識文書化 |

## 既存対策確認

- 確認結果: 部分的に既存（detached worktree による baseline 比較手順は worktree-operations.md に規定済み）
- 該当ファイル: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md（git stash 運用手順節: baseline commit 上の detached worktree で検証・比較）
- ギャップ分類: fix gap
- ギャップ詳細: baseline 比較の物理手順は既存だが、gate 合格判定への適用（同一 signature 確認 → delta 0 で合格扱い）が未文書化。case 2787 で確立した判定手順の標準化が必要

## 制約

- 対照実行は stash ではなく detached worktree を使う（stash 往復リスク回避の既存規約に従う）
- delta 0 実証は同一 detector・同一引数・同一環境での再実行に基づく（異なる環境間の結果比較で代替しない）

## 受け入れ条件

- [ ] baseline 未整備環境での対照実行 delta 0 判定手順が文書化されている
- [ ] 判定根拠（baseline policy 準拠）が記録形式に含まれる
- [ ] detached worktree による baseline 比較の既存手順と矛盾しない

## 元learning item / 根拠

- 要約: baseline 不在環境で gate/checker が既存違反を新規違反と誤分類し failure 化する問題と、対照実行 delta 0 実証による合格判定
- 根拠: inbox 2026-09-12（self-sync 適用で走査対象切替×NG baseline 未整備、stash 対照実行で由来分類）、2026-09-12（配布依存境界 gate を main HEAD と PR HEAD worktree の対照実行で同一 signature 確認 → delta 0 合格判定）。発生4件相当（近接 deferred 2件含む）
- 再発条件: baseline 未整備環境（worktree・新環境）で baseline 保持型 checker を gate として実行した場合
- 横展開可能性: baseline 保持型 checker の gate 合格判定全般、case-run の stash 対照実証と同一手法

## 推奨Issue分類

- 分類: feature（検証判定手順の標準化）
- 推奨ラベル: documentation, agentdev, verification
- 関連Issue: なし（case 2787 の集約知見。IR-059 baseline 整備は別課題）
