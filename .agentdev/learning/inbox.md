# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 一括テキスト是正 Issue が介入 PR により陳腐化し scope-partial PR となる

- **問題事象**: Issue #1418 は「PR #1402 実施後に archive/active.md 参照 11箇所残留」前提で起票されたが、起票時刻（2026-07-05 12:35 JST）より前に PR #1412（同日 00:17）と PR #1415（同日 02:36）が既にリネームを完了していた。結果として 4件の完了条件のうち 3件が起票時点で既達成となり、本 PR の実スコープは learning-capture/SKILL.md の役割是正 1件のみで、example.md 4箇所は QG-3 scope-partial（変更不要）となった。
- **発生局面**: case-open（Issue 起票）/ case-auto draft 連続実行
- **検知方法**: case-run が PR 本文 Findings「Issue 前提の陳腐化」として指摘。case-close が PR 本文から回収し学びとして昇華候補化。
- **根本原因**: RU/inspect 由来の一括テキスト是正 Issue を起票する際、起票根拠となった rg/grep 結果（検出時点の状態）と起票時点の main 最新状態とに時間差があり、その間に別 PR が同一ファイル群を修正した。case-open 側で完了条件の最新妥当性を再検証しなかった。
- **自律対応内容**: case-close QG-4 で完了条件4件を個別に再評価。example.md 4箇所は「archive/active.md 参照の削除」が文字通り達成済み（PR #1412 で deferred.md にリネーム済み、かつ Layer 2/3 の promote 動作記述として事実正確）と判定し record-in-findings でマージを完遂。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用是正 case、REQ-0103 既存要件の範囲内）
- **横展開観点**: inspect-promote → backlog-review → case-open、および case-auto の draft 連続実行で、rg 駆動の一括是正 Issue を起票する全経路に同様の陳腐化リスクがある。
- **再発条件**: (1) RU/inspect が「N箇所の一括是正」を検出し、(2) 検出から case-open 起票までの間に、(3) 別 PR が同一ファイル群を修正した場合。
- **予防策候補**: case-open（docs_chore/bugfix の Issue 化）が完了条件を本文に展開する前に、対象パスで rg/grep を再実行し検出内容が現在も有効か確認する。同日内に複数 PR がマージされている場合は必須。
- **想定反映先**: case-open command（完了条件展開前の最新状態再確認ステップ）
- **関連**: Issue #1418, PR #1419, RU-0016, PR #1412, PR #1415
- **タグ**: `#case-open` `#陳腐化` `#一括是正` `#scope-partial`
