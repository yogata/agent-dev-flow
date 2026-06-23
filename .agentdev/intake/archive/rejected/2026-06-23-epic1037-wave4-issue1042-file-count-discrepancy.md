# Issue #1042 ファイル数記載差異（76 → 実 75）の修正候補

## 発生源

- Epic: #1037 (Wave 4 Batch 1 close)
- Issue: #1042 (AG-009: src/opencode/skills/ 規範逸脱カタログ作成)
- PR: #1055 (merged, squash ead167f3)
- カタログ: `.agentdev/inspect/inbox/compliance-catalog-skills.md` F-009 (info)
- 発生日: 2026-06-23

## 内容

Issue #1042 本文は「src/opencode/skills/ 配下の .md ファイル（76件）」と記載するが、実ファイル数は 75 件。PR #1055 は実ファイル数 75 で査読対象とした（F-009 に info 記録）。カタログ作成の完了条件は「76 ファイルがすべて査読されている」だったが、実 75 ファイルすべてを査読したため実質的に完了（case-close で完了判定済み）。

## 推奨対応先

case-update で Issue #1042 本文の「76件」を「75件」に修正する候補。Issue #1042 は既にクローズ済みのため、修正の実利は薄い（参照元がなければ影響なし）。Epic #1037 の分解表にも「76」の記載はないため、Epic 側の修正は不要。

現時点では blocker ではなく、低優先度の整理候補。本 intake は PR #1055 F-009 の記録を intake/inbox/ へ回収したもの（capture 責務 G21）。

## 現在の追跡状態

- Issue #1042 本文: 「76件」のまま（未修正）
- カタログ: 実 75 ファイルで査読完了・F-009 に差異記録済み
- 完了判定: case-close で PASS（実質的に全ファイル査読済み）
