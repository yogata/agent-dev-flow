# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-14 case 2796 Wave 1 / case 2797（PR #2801）: worktree で full check_integrity を実行する際の repo-local Plugin 投影前提

- 観測元: case 2797（DEL-2797-3、PR #2801）本文 learning 候補、case-close 2026-09-14 回収
- 内容: worktree は `.opencode/plugins/<plugin>` junction・loader shim・plugins 配下 node_modules が未整備だと PluginProjection 検査で環境由来 NG（only-worktree 10 件）が発生する。検証時は一時構成（junction + shim 配置 → 検証 → 削除）で解消でき、base との分離突合で変更起因と環境起因を分離できる

## 2026-09-14 case 2796 Wave 1 / case 2797（PR #2801）: Design 節文言の配布物転記時の concrete-id 違反

- 観測元: case 2797（DEL-2797-3、PR #2801）本文 learning 候補、case-close 2026-09-14 回収
- 内容: docs 内 Design 節の文言を配布物（skill / reference Markdown）へ転記する際、REQ/IR 番号（REQ-031、IR-055 等）をそのまま書くと配布依存境界の concrete-id / unclassified-entry 違反になる。番号は一般形（IR-{NNN}、checker 名参照）へ翻訳する必要がある（本件の fix-and-reverify 3 件はこの翻訳漏れ）

## 2026-09-14 case 2796 Wave 1 / case 2797（PR #2801）: bun test フル suite の直前実績比較の制約

- 観測元: case 2797（DEL-2797-3、PR #2801）本文 learning 候補、case-close 2026-09-14 回収
- 内容: bun test 直前実績比較（base での N/M 実行）は main 側書込み回避のため worktree 完了検証では未実施となり得る。fail 0 件と規模妥当性（3086 tests / 134 files）で受領したが、main 側書込みを伴わない base 件数比較手段（読取専用 detached worktree 実行等）があれば候補

## 2026-09-14 case 2799（PR #2803）: repo-agentdev-integrity 検査スクリプトの実行ランナーは bun

- 観測元: case 2799（DEL-2799-3、PR #2803）本文 learning 候補、case 2800（PR #2804）でも同様、case-close 2026-09-14 回収
- 内容: check_changed_docs.ts・generate_indexes.ts 等 repo-agentdev-integrity の scripts は CommonJS の require() を使用するため node --experimental-strip-types では ReferenceError で実行不可。bun 経由（`bun .opencode/skills/repo-agentdev-integrity/scripts/<script>.ts`）が現行の実行手段。checker 実行契約の安定実行経路（node モジュール import）は check_distribution_boundary_cli.ts のような runCli export 型に適用され、require() 混在スクリプトには適用できない

## 2026-09-14 case 2800（PR #2804）: 検証対応任意行の要件でも implementation 宣言欠落は QG-4 で差し戻しになる

- 観測元: case 2800（DEL-2800-3、PR #2804）、case-close QG-4 独立再検査で検出、case-close 2026-09-14 回収
- 内容: 検証対応要否カタログ登録行（missing-verification は pass）でも、要件実現内容を正規所有する Design へ ADF-COVERS(implementation) 宣言が無いと traceability check の missing-implementation が fail になり case-close がマージを停止する。design-save で Design 本体へ要件反映した場合は、実装対応の宣言先（当該 Design ヘッダの既存宣言ブロック）を忘れず確認する

## 2026-09-14 case 2796/2799/2800: background task 起動の連続消失と同期実行への切替

- 観測元: case-run 実行（DEL-{N}-1/-2）、case-close 2026-09-14 回収
- 内容: run_in_background=true の委譲起動が2回連続で起動直後に消失（worktree クリーン・PR なし・SSoT コメントなしで実行未試行と判定）。harness 側 background task 機構の異常。同期実行（run_in_background=false）に切り替えることで確実に result を受領できた。background 委譲の消失を検知したら durable state（worktree git status・PR・Issue コメント）で帰属確認し、未試行なら同期実行で再委譲する回復手順が有効

## 2026-09-14 case 2805（case-open STEP-4）: サブエージェント bash の Windows パス結合不具合による repo root 迷子ファイル作成

- **問題事象**: adversarial-review を ultrabrain カテゴリのサブエージェントへ委譲した際、サブエージェントが bash でトレーサビリティ check の JSON 出力先パスを結合する際に OS 区切り文字を喪失し、repo root 直下に `CWINDOWSTEMPopencodetrace-check.json`（約94KB）という迷子 untracked ファイルが作成された（意図先は OS テンポラリ配下）
- **発生局面**: 実装（case-open STEP-4 の review 委譲内の読取検査実行）
- **検知方法**: 親エージェントが STEP-5-0 の commit 前に `git status --porcelain=v1` を実行した際に untracked 迷子ファイルを検知（review サブエージェントの I-04 finding でも指摘）
- **根本原因**: サブエージェントが bash コマンドで絶対パス文字列とファイル名を文字列連結した際、Windows 環境の区切り文字（`\` または `/`）が失われたまま出力先パスを構築した。サブエージェント側には出力先がプロジェクト外であることの検証がなく、エラーにならず repo root への書込みが成立した
- **自律対応内容**: 親エージェント（case-open 実行主体）が明示パス指定の git 操作で迷子ファイルをコミット対象から除外し（Form Zero・スイープ禁止の遵守）、本 learning エントリとして capture。迷子ファイル自体は untracked の一時残骸として削除
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: サブエージェントへ bash でのファイル出力を委譲する場合全般（review・実装・検査委譲）。Windows 環境での作業ツリー外出力は区切り文字喪失による repo root 汚染リスクがある
- **再発条件**: bash（POSIX シェル）で Windows 絶対パス（`C:\...`）を含む文字列連結により出力先を構築し、かつ書込み先がプロジェクト内外かの検証を行わない場合
- **予防策候補**: bash での一時ファイル出力は `/` 区切りの正パス（`C:/WINDOWS/TEMP/opencode/...`）または `$TEMP` を使う。委譲プロンプトに出力先パスの完全な正区切り表記を明示する。commit 前の `git status --porcelain` 確認（untracked 迷子検知）を commit 前置手順として維持する
- **想定反映先**: agentdev-workflow-orchestration（Split Rule・委譲時の作業衛生）、learning pipeline 経由でサブエージェント委譲プロンプトの規約へ
- **関連**: Issue #2805（case-open 実行）、adversarial-review 委譲（ultrabrain、2026-09-14）
- **タグ**: `#windows` `#bash` `#subagent-delegation` `#git-hygiene`
