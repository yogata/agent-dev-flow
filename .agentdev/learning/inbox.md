# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## docs-only SPEC 変更で AUTOGEN block 索引の再生成 commit が欠落し case-close の E5b 前段 gate で検出

- **問題事象**: PR 2253（docs-only、SPEC 2ファイルの行数変動）に AUTOGEN block 索引 docs/specs/quality/spec-health-metrics.md の再生成 commit が含まれていなかった。マージ後の case-close E5b 前段検証で generate_indexes.ts --dry-run の WOULD UPDATE が検出され、Epic Wave クローズが停止した。
- **発生局面**: 実装（case-run の PR 作成）、レビュー（case-close の Wave クローズ検証）
- **検知方法**: workflow extension check（autogen-index-regeneration-diff）による bun run generate_indexes.ts --dry-run の WOULD UPDATE 行。マージ前 baseline 5d89b9df では差分なしであり、PR 2253 由来と確定した
- **根本原因**: case-run が docs-only 変更で SPEC 行数計上ファイル（spec-health-metrics.md）への影響を認識せず、PR 作成前に dry-run 差分確認と再生成 commit を実施しなかった
- **自律対応内容**: case-close は契約どおり索引ファイルを直接編集・commit せず E5b 前段で停止し、再生 commit を case-run 責務として case-auto（委譲元）へブロック報告した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（case-close SPEC Step 3-3 の設計どおりに検出・停止。case-run 側手順の運用徹底が課題）
- **横展開観点**: docs-only PR でも SPEC の行数・status を変える変更は AUTOGEN 索引に反映される。case-run は PR 作成前に dry-run を実行し WOULD UPDATE があれば再生成を commit する
- **再発条件**: SPEC ファイルの行数・status を変える docs 変更で case-run が generate_indexes.ts を実行しない場合
- **予防策候補**: case-run の PR 作成手順へ generate_indexes.ts --dry-run（差分なし確認または再生成 commit）を組み込む
- **想定反映先**: case-run command / agentdev-workflow-case-run の PR 作成手順
- **関連**: docs/specs/commands/case-close.md Step 3-3、.agentdev/extensions/skills/agentdev-workflow-case-close.yaml、PR 2253、Issue 2203
- **タグ**: #case-run #autogen #index
