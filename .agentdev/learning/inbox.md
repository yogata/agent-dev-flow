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

## 2026-09-11: integrity scripts の CWD 起点実行で環境依存 fail が発生し正規実行点は repo root

- **問題事象**: repo-agentdev-integrity の scripts dir を cwd とした `bun test` 実行で 8 fail / 4 errors が発生した。全件が環境依存（CWD 相対パス起因 4 fail、worktree の node_modules 欠落起因 4 errors）であり当該変更起因の違反は 0 件
- **発生局面**: case 2768（textlint Design 2点補強検証）の case-run 委譲 DEL-2768-1 における full integrity suite 実行時
- **検知方法**: integrity suite 初回実行の fail / error 検出と由来分類（CWD 相対パスは repo root を cwd とした単独再実行で 22 pass / 0 fail を確認して切り分け）
- **根本原因**: integrity 系テストが repo root 相対パス（`path.join("src", ...)` 等）を読む前提に対し、実行 cwd の規定が実行者側で守られていなかった（scripts dir を cwd にした）
- **自律対応内容**: repo root を cwd としたフル再実行で 2565 pass / 0 fail を確認。node_modules 欠落は当該 package dir（agentdev-project-extensions/scripts）で `bun install` を実行して解消（install 後の `git status --porcelain` は空を確認）
- **ユーザー確認の有無**: なし（自律修正）
- **Decision/REQ/spec影響**: なし（検証実行手順の注意）
- **横展開観点**: repo root 相対パスを前提とする他の検査系スクリプト・テスト全般で同様に発生し得る。worktree で検証する場合の node_modules 有無も同時リスク
- **再発条件**: repo root 以外（scripts dir 等）を cwd として integrity suite を実行した場合、または worktree で node_modules 未解決のまま suite を実行した場合
- **予防策候補**: integrity suite の正規実行点（cwd = repo root）を実行形態契約として明文化し、worktree 実行時は事前に `bun install` を行う手順を添える
- **想定反映先**: repo-agentdev-integrity skill の bun test 実行形態契約（references）または case-close workflow の full integrity suite 実行 reference（docs-and-design-promotion.md）
- **関連**: case 2768（Issue 2768、verify-only closure のため PR なし）
- **タグ**: #integrity #cwd依存 #bun-test #worktree

---

## 2026-09-11: verify-only case では3検査を実行証跡として実 case と同水準で実行・記録すると検証完了の根拠が再現可能になる

- **問題事象**: 変更ゼロの verify-only case では PR・carrier commit が存在しないため、検証完了の証跡が会話上のみで消えると PR-less closure の処分判断（QG-4 判定）の根拠が恒久記録から追跡できなくなる
- **発生局面**: case 2769（配布物変更直後の commit 前3検査工程の Design 明文化検証）の case-run / case-close 実行時
- **検知方法**: case-run result blocked（verify-only 契約適用）での PR-less closure 処分依頼を case-close 側が受けた際の証跡確認
- **根本原因**: verify-only case の検証証跡の恒久記録方法が手順として明文化されておらず、#2768 で確立した前例（SSoT コメントへの実行コマンド列付き記録）の運用依存だった
- **自律対応内容**: case-run 側が3検査（配布依存境界・IR-055・traceability）と integrity suite を実 case と同水準で実行し、実行コマンド・結果（new_delta 0、新規違反 0 件、2565 pass / 0 fail 等）を SSoT コメントへ記録。case-close 側はその SSoT を QG-4 判定根拠として参照し、Design 実記述の独立再確認と併せて完了判定した
- **ユーザー確認の有無**: なし（#2768 確立済み working assumption の同一適用を case-auto bounded parent decision で記録）
- **Decision/REQ/spec影響**: なし（運用上の注意。PR-less closure は carrier commit 捏造を却下した作業仮定として記録）
- **横展開観点**: 変更ゼロの docs_chore case 全般、および検証のみで完了する maintenance case で共通
- **再発条件**: verify-only case で検証コマンドと結果を SSoT コメントへ記録せずに処分判断だけを行った場合
- **予防策候補**: verify-only case では検証実行コマンド列と結果を SSoT コメントに残す（実行コマンド列はそのまま再実行手順になる）運用を標準化する
- **想定反映先**: case-run / case-close の verify-only 契約関係の Design 手順（将来的な明文化候補。intake/learning promote 経由で評価）
- **関連**: case 2769（Issue 2769、verify-only closure のため PR なし）/ 前例 case 2768
- **タグ**: #verify-only #実行証跡 #SSoT #PR-less-closure

---
