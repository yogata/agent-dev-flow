# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---
## 2026-09-02: worktree/junction なし環境の IR-068 環境依存 fail は由来分類（環境ラベル併記）を PR 本文へ記録する

- **問題事象**: worktree 環境（.opencode/ junction 未伝播）では IR-068 skill-projection-manifest 検査が manifest↔src 差分 4件（japanese-tech-writing manifest-only、3 skill src-only）を NG として報告する。checker 自身が環境判定 INFO を併記しており、本来の変更起因の検出と混在し得る
- **発生局面**: case-run の bun test ①（integrity suite）実行時
- **検知方法**: PR #2525 の case-run で IR-055 baseline delta 検証を stash 比較で実施した際、環境依存 fail の由来を分類した
- **根本原因**: worktree 内で junction が伝播しない環境差があり、checker の配布スコープ走査が main 環境と異なる
- **自律対応内容**: 環境ラベル（worktree / junction なし）を PR 本文の検証差分へ併記し、環境依存 fail の由来分類を記録する運用を実例化した
- **ユーザー確認の有無**: なし（エージェント自律）
- **ADR/REQ/spec影響**: なし（運用実例の記録。checker 側の環境差吸収は別途判断）
- **横展開観点**: IR-055/IR-068 以外の worktree 環境依存検査（docs-check 検査群）にも同様の環境ラベル併記を適用可能
- **再発条件**: worktree 内での integrity suite 実行時に毎回発生
- **予防策候補**: 検証環境の記録と再現条件を PR 本文へ記録する運用のテンプレート化（検証差分セクションの環境ラベル欄）
- **想定反映先**: agentdev-workflow-orchestration（検証結果記録規約）、learning-pipeline
- **関連**: PR #2525、#2501、intake inbox「2026-09-01-worktree-junction-skill-projection-manifest-diffs」
- **タグ**: #worktree #junction #ir-068 #環境依存 #検証記録

---
## 2026-09-02: harness 異常終了後の PR 再利用時は PR 本文置換ができずコメントを SSoT とする

- **問題事象**: 初回委譲（DEL-2509-1）が harness 異常終了で中断した後、再委譲（DEL-2509-2）が残留 commit を利用して同一 PR を完成させたが、PR 本文の実行識別情報・検証差分は旧版（検証未実施状態を示す）のまま残った。PR 本文の更新は Custom Tool（agentdev_gh）の操作契約に pr edit が存在せず、gh-write-guard fail-closed により生 gh pr edit も不可
- **発生局面**: case-run 再委譲 → case-close（PR マージ前の SSoT 確認）
- **検知方法**: case-close が PR 本文と PR コメントの乖離を検知（Epic #2504 Wave 1、Issue #2509）
- **根本原因**: PR 本文置換の操作契約不在（fail-closed 設計）と、委譲異常終了時に PR 本文が旧版のまま残留する構造
- **自律対応内容**: DEL-2509-2 完了報告コメント（検証結果の SSoT）を正として処理し、case-close の対応記録コメントへ「コメント正・本文は archive」の正規記録を実施して虚偽記載状態を解消した
- **ユーザー確認の有無**: なし（handoff コンテキストで判断方針を事前指示され、case-close 責務として判断）
- **ADR/REQ/spec影響**: なし（運用知見。case-close command Design の PR 本文とコメントの乖離時の扱い明記が将来候補）
- **横展開観点**: case-run の再委譲手順（case-run command Design）に「PR 再利用時は実行識別情報の乖離を完了報告コメントへ明示」を追記可能
- **再発条件**: harness 異常終了後に PR を再利用して継続実行する場合
- **予防策候補**: case-run の委譲 handoff に「PR 本文の実行識別情報更新可否」の確認ステップ追加。case-close に「PR 本文とコメントの乖離検知」チェックの恒久化
- **想定反映先**: case-run command Design（再委譲手順）、case-close command Design（乖離時の扱い）、agentdev-gh（pr edit 契約の要否判断）
- **関連**: PR #2522、Issue #2509、Epic #2504
- **タグ**: #case-run #再委譲 #gh-write-guard #pr-comment-ssot #fail-closed

---
