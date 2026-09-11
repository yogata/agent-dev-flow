# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-11: baseline-known 違反の一般化置換語彙が検出パターンに該当し新規違反を生む

- **問題事象**: IR-055 baseline-known strict 違反の一般化置換において、置換後の語彙「repo-local」が `repo-*` 検出パターンに該当し、新規 strict 違反として検出された（worktree-operations.md L131）
- **発生局面**: case 2766（配布物内部参照の一般化・是正）の case-run 実装・検証時
- **検知方法**: IR-055 再検査（check_integrity.ts --json）の新規違反検出
- **根本原因**: 一般化表現の語彙選択が検出器のパターン定義と突合されていなかった
- **自律対応内容**: 「本体リポジトリ専用の整合性検査 skill」へ再置換し、再検査で新規違反 0 を確認（fix-and-reverify 1 回で解消）
- **ユーザー確認の有無**: なし（自律修正）
- **Decision/REQ/spec影響**: なし（運用上の注意）
- **横展開観点**: baseline 運用を持つ他の検査器（IR-059 等）の解消作業でも同様に発生し得る
- **再発条件**: baseline-known 違反の置換解消時に、置換語彙を検出器パターンと突合せずに採用した場合
- **予防策候補**: 一般化表現の語彙選択時に検出器パターンとの突合を事前に行う、または置換後に検査を必ず再実行して新規違反 0 を確認する
- **想定反映先**: 配布依存境界系検査の運用ガイド（docs/designs/integrity/distribution-boundary.md 関連）または IR-055 triage 運用の注意書き
- **関連**: case 2766 / PR 2767
- **タグ**: #ir-055 #baseline #一般化置換

---

## 2026-09-11: worktree 内の .opencode/skills/ は junction 未伝播のため skill 実行は SoT パス起点で行う

- **問題事象**: worktree 内の `.opencode/skills/` は junction 未伝播のため `repo-agentdev-integrity` 以外の skill 実行が worktree 配置では不可能（traceability 等）
- **発生局面**: case 2766 の case-run / case-close 検証実行時
- **検知方法**: worktree 内での skill スクリプト実行時に配置欠落として検知
- **根本原因**: Windows junction が `git worktree add` で新 worktree へ伝播しない
- **自律対応内容**: `repo-agentdev-integrity` 以外の skill 実行（traceability check.ts 等）を `src/opencode/skills/`（SoT パス）起点で実行して回避
- **ユーザー確認の有無**: なし（既知回避の適用）
- **Decision/REQ/spec影響**: なし（検証実行手順の注意）
- **横展開観点**: worktree 隔離して検証する全 workflow（case-run / case-close）で共通
- **再発条件**: worktree 内で `.opencode/skills/` 配下の skill スクリプトを直接実行しようとした場合
- **予防策候補**: worktree 内検証では SoT パス（`src/opencode/skills/`）起点の実行を標準手順として明記する
- **想定反映先**: agentdev-git-worktree の references（worktree-operations.md）または検証系 workflow の手順書
- **関連**: case 2766 / PR 2767
- **タグ**: #worktree #junction #検証実行

---
