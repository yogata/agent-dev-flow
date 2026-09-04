# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-04: worktree での git stash pathspec 失敗と誤 pop リスク

- **問題事象**: worktree サブディレクトリで `git stash push -- <相対 pathspec>` が `:(prefix:...)` 解決エラーで失敗した。`;` 連結の後続 `git stash pop` が実行され、既存 stash の適用が conflict を起こし得た（本実行で発生・`git reset --merge` で復旧、既存 stash エントリは kept のまま未破壊）
- **発生局面**: case-run 委譲（Epic #2553 Wave 2 / Issue #2555 / PR #2577、OU-002 実装時）
- **検知方式**: stash push の失敗後も pop が走ったことで検知
- **根本原因**: worktree 配下では相対 pathspec の `:(prefix:)` 解決が機能しないケースがあり `git stash push` が失敗する。`;` 連結は直前コマンドの失敗にかかわらず後続を実行するため、意図しない stash が pop される
- **自律対応内容**: `git reset --merge` で conflict 状態を復旧。stash エントリは破壊しなかった
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（git 操作手順の教訓）
- **横展開観点**: worktree 内で stash 系 git 操作を行う全 workflow（case-run / case-close / agentdev-git-worktree 連携）に共通
- **再発条件**: worktree サブディレクトリでの stash push + pathspec 指定、かつ `;` 連結または失敗を無視する pop
- **予防策候補**: stash 系は `&&` 連結する。pathspec は worktree root から指定する。`git stash push` の成功確認を pop の事前条件にする
- **想定反映先**: agentdev-git-worktree skill の git 操作知識、または learning-promote での分類
- **関連**: PR #2577 本文 Findings セクションからの capture 回収（case-close STEP-6）
- **タグ**: #git #worktree #stash #case-run

---

## 2026-09-04: gate 違和解消の exemption が並行 checker に波及せず、case-run の再検証範囲を超えて collateral が残存

- **問題事象**: E4-1 配布依存境界 gate 違反（ADF-COVERS 宣言行 2 行の IR-059 concrete-id 誤検出）の解消として detector-level exemption を実装した PR で、同一宣言行が (1) 並行する IR-055 checker の新規 delta NG 2 件、(2) traceability check の malformed-declaration 1 件（回帰テストのフィクスチャ文字列）として検出され続けた。case-run の fix-and-reverify は違反していた gate の detector 再実行のみで、sibling checker の再実行を行わなかったため、collateral は case-close の独立再検査で初めて検出された
- **発生局面**: case-close 再実行（Epic #2556 Wave 2 / Issue #2558 / PR #2578・commit 82186d71 の E4-1 exemption 実装後）
- **検知方式**: case-close QG-4 独立再検査での traceability check / check_integrity 再実行（検証差分の 新規 分類として記録）
- **根本原因**: 宣言行・宣言形式文字列を「検査対象宣言」として扱う exemption が checker ごとに独立実装されており（配布境界 detector のみ適用済み）、case-run の fix-and-reverify 契約が「当該 gate の再検証」のみを要求し sibling checker の再実行を含まない
- **自律対応内容**: case-close で新規 3 件を検証差分 新規 として記録し、intake inbox へ capture（merge gate 判定には影響しないため close は継続）
- **ユーザー確認の有無**: なし
- **ADR/REQ/spec影響**: なし（checker 間の exemption 整合は現行契約の範囲内で未規定）
- **横展開観点**: 検出系 checker が複数あるリポジトリで「ある checker の false positive への exemption 実装」を行う全 case-run / fix-and-reverify に共通。exemption 実装後は同系統の検査対象宣言を扱う全 checker（IR-055・traceability corpus 走査等）を再実行する
- **再発条件**: 宣言・メタデータ形式の文字列を配布物へ追加する実装で、複数 checker が同一文字列を異なる観点（distribution boundary / runtime reference / 宣言 corpus）で走査する構成
- **予防策候補**: fix-and-reverify の検証範囲に「変更ファイルが走査対象になる checker の再実行」を含める。exemption 実装 PR の検証手順に sibling checker の delta 確認を追加
- **想定反映先**: agentdev-workflow-orchestration（self-healing loop の検証範囲定義）、または intake 経由での checker 整備 RU 化
- **関連**: #2558 対応記録コメント（検証差分 新規 3 件）・intake inbox の IR-055 補足・traceability malformed フィクスチャ item
- **タグ**: #integrity #exemption #case-run #case-close #checker-integration