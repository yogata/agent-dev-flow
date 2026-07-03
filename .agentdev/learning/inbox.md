# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## case-open と case-run の間に rename PR がマージされると Issue 本文のファイル名参照が陳腐化する

- **問題事象**: Issue #1371 本文が `check_read_contracts.ts`、`docs/specs/commands/inspect-read-contracts.md` を参照していたが、case-open → case-run の間に並行 PR #1362 がマージされ、対象ファイルは `check_doc_inputs.ts`、`docs/specs/commands/inspect-doc-inputs.md` へ rename 済みとなっていた。case-run 実装時に現行名称へ読み替えて実装する必要が生じ、QG-3 で has-deviation（spec-bug 分類）として記録された
- **発生局面**: case-run 実装中（QG-3 実装乖離検出）
- **検知方法**: QG-3 実装乖離検出。Issue 本文の完了条件が旧名称のままで、実装は現行名称で行われたため乖離として分類
- **根本原因**: case-open 時点で存在したファイル名・パスが、並行 rename PR のマージで陳腐化した。case-open 実行時のファイル存在確認、case-run 冒頭の staleness check のいずれも手順化されていない
- **自律対応内容**: 現行名称で実装し、QG-3 乖離として PR 本文に分類（spec-bug）と経緯を記録。REQ-0108-054 の本来要件（ランナー明記）は保持した。Issue 本文の旧名称の書き換えは case-update 責務のため case-close では実施せず、完了条件チェックボックスのみ更新した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。QG-3 has-deviation として処理済み。プロセス改善候補の記録のみ
- **横展開観点**: 手動 case 単独運用で並行 rename PR がマージされる場合に同様の陳腐化リスクがある。case-auto は Wave 境界で PR マージするため Wave 内では発生しにくいが、Wave 間でも前 Wave の rename が後 Wave の Issue 本文へ影響する可能性は残る
- **再発条件**: case-open → case-run の間に、Issue 本文が参照するファイル名・パスを変更する PR がマージされた場合
- **予防策候補**: case-run 冒頭で Issue 本文が参照するファイルパスの存在確認（staleness check）を QG-3 の前置検査として追加する。または case-open の Issue 本文生成時に、参照ファイルが存在することを確認する手順を強化する。検出後は case-update で Issue 本文を現行名称へ更新してから case-run を再開する運用も想定
- **想定反映先**: case-run command 手順（QG-3 前置 staleness check）、または inspect-docs 検出対象候補、case-open 手順の参照ファイル存在確認強化
- **関連**: Issue #1371、PR #1372、PR #1362（rename 元）、QG-3 has-deviation（spec-bug 分類）
- **タグ**: `#case-run` `#qg-3` `#staleness` `#rename`
