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

## ng-baseline.json の環境別表記重複 entry は正規化導入後に冗長化する

- **問題事象**: ng-baseline.json の case-close.md command-capture-duty に src / .opencode の環境別表記 entry が二重で存在していた（Issue 2179 暫定措置由来）。PR 2254 のパス bucket key 正規化導入後、これらは同一 bucket key へ衝突する冗長な entry となった。
- **発生局面**: 実装（case-run の checker 修正）、運用（baseline 管理）
- **検知方法**: 正規化実装時の衝突挙動分析（同一論理 NG の環境別観測として max 採用する設計検討の中で特定）
- **根本原因**: 環境依存のパス表記を bucket key が含んでいた従来仕様で、環境ごとに entry が追加されていた
- **自律対応内容**: 手書き削除は機械生成必須契約（integrity-contracts「baseline entry 運用契約」(1)）に反するため実施せず、次回 `--update-ng-baseline --ng-baseline-additions` 実行時に自然に単一 entry へ統合される見込みを記録した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用知見。正規化衝突時 semantic の SPEC 明文化は別途 intake item 化済み）
- **横展開観点**: baseline 更新は並列 Wave 実行中に実施しない（同一 baseline 二重更新禁止）。冗長 entry の解消は次回の一括再生成タイミングに乗せる
- **再発条件**: 環境別表記の baseline entry が残存する状態で正規化のみ先行導入した場合
- **予防策候補**: baseline 再生成のタイミング（直列実行可能な時期）で環境別表記 entry を機械的に統合する
- **想定反映先**: integrity-contracts SPEC の NG baseline 運用手順運用（docs-check 運用）
- **関連**: PR 2254、Issue 2206、docs/specs/integrity/integrity-contracts.md「baseline entry 運用契約」
- **タグ**: #integrity #ng-baseline #normalization

## case-close の SPEC 昇格（draft → accepted）は spec-health-metrics AUTOGEN 差分を生む

- **問題事象**: Epic 2205 Wave 1 クローズで checker-execution-contracts SPEC を draft から accepted へ昇格した結果、マージ後の E5b 前段 gate では差分ゼロだった generate_indexes.ts --dry-run に WOULD UPDATE: docs/specs/quality/spec-health-metrics.md が新たに発生した。
- **発生局面**: レビュー（case-close の SPEC 確定フロー STEP-3-2）
- **検知方法**: SPEC 昇格編集後に dry-run を再実行したことで検出（フロー内の自己確認）
- **根本原因**: spec-health-metrics が SPEC の status を計上対象とするため、case-close 自身の昇格編集も AUTOGEN 索引差分の発火要因になる。PR 2253 由来の既知学び（case-run の PR 作成側面）と同型だが発火主体が異なる
- **自律対応内容**: AUTOGEN 索引ファイルは直接編集・commit せず、SPEC frontmatter と docs/specs/README.md status 列（追跡情報源）のみ更新し、再生成 commit を case-auto（case-run 責務）への引継ぎ事項として報告した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（spec-lifecycle-application の昇格手順どおり。README status 列は case-close の更新責務）
- **横展開観点**: SPEC の status・行数を変える操作は発火主体（case-run か case-close か）を問わず AUTOGEN 差分を生む。昇格実施後は dry-run を再実行して差分有無を確認する
- **再発条件**: case-close が SPEC 昇格を実施し、昇格後の dry-run 再確認と case-auto への引継ぎ報告を省略した場合
- **予防策候補**: case-close の SPEC 確定フローへ「昇格後 dry-run 再実行・差分は引継ぎ報告」を明示する
- **想定反映先**: agentdev-workflow-case-close の docs-and-spec-promotion STEP（references/docs-and-spec-promotion.md）
- **関連**: Issue 2209、Epic 2205、docs/specs/integrity/checker-execution-contracts.md、docs/specs/quality/spec-health-metrics.md、先行学び（PR 2253、Issue 2203 の entry）
- **タグ**: #case-close #autogen #spec-lifecycle
