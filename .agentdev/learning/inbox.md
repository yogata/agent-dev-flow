# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## case-run 実行担当サブエージェント委譲不可 (ハーネス call_omo_agent 制約)

- 問題事象: case-run (Sisyphus-Junior) 実行時、call_omo_agent ツールが explore/librarian agent 型のみを許可し、agentdev-case-run-execution-adapter が定義する実行担当サブエージェント型を起動できない。Epic Wave 並列委譲 (最大5件) も同様に機能しない
- 発生局面: 実装 (case-run)
- 検知方法: call_omo_agent ツール呼出し試行時の schema 制約 ("custom agents... not supported") 確認
- 根本原因: ハーネス (oh-my-openagent) の call_omo_agent ツール schema が explore/librarian のみを許可。adapter skill が定義する実行担当サブエージェント型 (custom agent) は schema で弾かれる
- 自律対応内容: システムプロンプト「the implementation, verification, and final handoff are yours」に準拠し、case-run オーケストレータと実行担当サブエージェントを兼ねてインライン実行で完遂。全 PR の Findings セクションに delegation-chain-unavailable エントリを記録し、本来の case-run フローとの差分を明示
- ユーザー確認有無: なし
- ADR/REQ/spec影響: あり。agentdev-case-run-execution-adapter SKILL が定義する委譲プロトコルが現在のハーネス環境で機能しない。REQ-0149 (agentdev-gh-cli 委譲基盤) の実行環境前提、Epic Wave 並列委譲モデル (最大5件) の達成可能性を再確認する必要がある
- 横展開観点: 同一ハーネス環境で動作する全 case-run で同一事象が発生。Epic Wave 並列委譲の速度優位性が失われる
- 再発条件: call_omo_agent が explore/librarian のみを許可するハーネス環境で case-run を実行した場合に必ず発生
- 予防策候補: (a) call_omo_agent schema で custom agents をサポート、(b) adapter skill の委譲プロトコルにハーネス能力に応じたフォールバックを定義、(c) case-run がハーネス能力を事前検出して委譲可否を判断し Inability を冒頭で明示
- 想定反映先: agentdev-case-run-execution-adapter SKILL、agentdev-workflow-orchestration capture-boundaries.md、REQ-0149 実行環境前提
- 関連: Epic #1515 Wave 1 PR Findings delegation-chain-unavailable エントリ全件 (PR #1522/#1523/#1524/#1525)。Epic #1515 ステータス追跡テーブル Wave 1 完了 (2026-07-15)
- タグ: #delegation #harness-limitation #case-run #inline-execution #epic-wave

## QG-4 spec-bug acceptance: Issue完了条件 vs Epic対象外 の調整判断 (#1516/TS-004)

- 問題事象: #1516 (OU-001) の TS-004 (配布 command 6ファイル実行制御パラメータ直接記述 0件) が FAIL (16件残留)。case-run は QG-3 spec-bug に分類。TS-004 達成には配布 command 実装本体改修が必要だが、Epic #1515「対象外: 配布 command/skill/docs の実装本体改修」と矛盾
- 発生局面: レビュー (case-close QG-4)
- 検知方法: case-run QG-3 分類結果 (spec-bug) の case-close QG-4 最終受け入れ判定
- 根本原因: Epic 完了条件のテスト戦略 (TS-004「0件」) と Epic 対象外 («配布 command 実装本体改修») が矛盾。REQ-0162-002 (実行制御パラメータ references 集約) は要件として追加されたが、src/opencode/ command 本文からの除去は未実施で、それを要求する TS-004 がスコープ外と衝突
- 自律対応内容: case-close QG-4 で (a) Issue #1516 完了条件 5項目は全て客観的に達成 (REQ-0162-007/008, REQ-0144-025, SPEC section, baseline 11件明記)、(b) TS-001/002/003/004 は全て PR Findings に record-in-findings 済み、(c) Epic「対象外」が実装本体改修を明示的に除外していることを根拠に accepted (completed) と判定。spec-bug Findings は case-update / intake 経由で後続委譲
- ユーザー確認有無: なし (task delegation で「accepted per Epic対象外 reconciliation, or blocked」の判断を委譲)
- ADR/REQ/spec影響: あり。REQ-0162-002 (実行制御パラメータ references 集約) の実装が未完。Epic 完了条件 TS-004 checkbox は最終 Wave まで未達の可能性。document-model SPEC のテスト戦略と対象外の整合性チェック機構が必要
- 横展開観点: 同様の「テスト戦略 vs 対象外」矛盾は他の Epic でも発生し得る。Epic 完了条件策定時にテスト戦略の実現可能性を対象外と照合する手順が必要
- 再発条件: Epic 完了条件のテスト戦略が達成不可能な実装を要求し、同時に Epic がその実装を対象外とする場合
- 予防策候補: (a) case-open 時に Epic 完了条件のテスト戦略と対象外の整合性を自動検証、(b) QG-2 (Acceptance Criteria Coverage Gate) でテスト戦略の実現可能性を検証、(c) spec-bug 分類時の case-close QG-4 判断基準を SPEC 化
- 想定反映先: agentdev-quality-gates QG-2 (acceptance-criteria-coverage)、agentdev-req-analysis (テスト戦略の実現可能性検証)、agentdev-workflow-templates (Epic 完了条件テンプレート)
- 関連: Issue #1516, PR #1525, Epic #1515 Wave 1
- タグ: #qg4 #spec-bug #epic-scope #test-strategy #acceptance-judgment

## verification-only PR の squash merge と files_checked 空の正当ケース (Epic #1515 Wave 2)

- 問題事象: PR #1527 (Issue #1521 / OU-006) は verification-only でファイル変更 0件。squash merge 可能か、また case-close Step 3-1 targeted docs guard で files_checked が空になる際の正当性確認手順が不明だった
- 発生局面: レビュー (case-close QG-4 / Step 3-1)
- 検知方法: gh pr view の files 配列が空、check_changed_docs.ts --files 指定で files_checked が空になり TARGET-EMPTY が問うた際の Step 3-1 REQ 確認手順 (item 1-4) 実行
- 根本原因: verification-only case-run (実装差分なし、検証のみ) の成果物である空 PR の取り扱いが command SPEC に明文化されていない。GitHub は空 PR の squash merge を許容し空 commit を生成するが、case-close 側は files_checked 空 を正当理由で処理する手順 (REQ Phase 3) を踏む必要がある
- 自律対応内容: (1) GitHub が空 PR の squash merge を受入れたことを確認 (commit 2b34f8b0 生成)、(2) Step 3-1 REQ item 1-4 に従い files_checked 空の理由を「verification-only PR で変更ファイル 0件」と特定し正当と判断、(3) QG-4 は完了条件を現在の repo 状態で客観評価し PASS 判定
- ユーザー確認有無: なし
- ADR/REQ/spec影響: あり。verification-only PR の case-close 取り扱い (merge 可否、files_checked 空の確認手順) が command SPEC に未明文化。false-clean 3層防御 (本 Epic OU-005 で実装) との相互作用の文書化が必要
- 横展開観点: REQ/SPEC の受け入れ基準が既存 repo 状態で満たされている場合 (req-save/spec-save 完了済みで case-run が検証のみ) に発生し得る
- 再発条件: case-run が verification-only (実装差分なし) で PR を作成し、case-close が targeted docs guard を実行する場合
- 予防策候補: (a) case-run SPEC に verification-only PR の取り扱い (空 commit 許容、case-close への引継ぎ) を明文化、(b) check_changed_docs.ts が files_checked 空時に verification-only フラグを考慮、(c) case-close Step 3-1 に verification-only PR の確認手順を明記
- 想定反映先: docs/specs/commands/case-run.md (verification-only セクション)、docs/specs/commands/case-close.md (Step 3-1 verification-only 確認)、docs/requirements/REQ-0158.md (false-clean と verification-only の相互作用)
- 関連: Issue #1521, PR #1527, Epic #1515 Wave 2, REQ-0158 false-clean 3層防御 (本 Epic OU-005)
- タグ: #verification-only #empty-pr #squash-merge #files-checked-empty #false-clean #case-close

## check_changed_docs.ts --files 引数解析 (comma 区切り vs space 区切り) (Epic #1515 Wave 2)

- 問題事象: case-close Step 3-1 で check_changed_docs.ts --files に comma 区切り文字列 ("file1,file2,file3") を渡すと、1つのファイルパスとして解釈され fs.existsSync で除外され files_checked が空になり TARGET-EMPTY (strict severity) が発火した
- 発生局面: レビュー (case-close Step 3-1 targeted docs guard)
- 検知方法: check_changed_docs.ts 実行結果の files_checked 空と TARGET-EMPTY strict failure、script ソース (L121-126) の --files パーサ確認で space 区切り仕様を発見
- 根本原因: --files パーサが `while (i < args.length && !args[i].startsWith("--")) parsed.files.push(args[i])` で次トークンを順次 file として積む仕様。comma 区切りは 1 file 扱い。case-close.md の実行コマンド例は `--files <PR 変更ファイル一覧>` と抽象表記で区切り文字が明示されていない
- 自律対応内容: space 区切りで再実行し files_checked 3件、coupled 3件、failures 0 で PASS を確認。comma 区切りが仕様外であることを特定
- ユーザー確認有無: なし
- ADR/REQ/spec影響: あり。case-close.md Step 3-1 の実行コマンド例で --files の区切り形式が未明示。check_changed_docs.ts のヘルプテキスト、SPEC targeted-docs-guard-implementation.md の呼出例でも区切り形式が未明記
- 横展開観点: case-run、spec-save 等 --files を使用する全 workflow で同一事象が発生し得る
- 再発条件: --files に comma 区切りで複数ファイルを渡す場合
- 予防策候補: (a) check_changed_docs.ts ヘルプ/エラーメッセージで区切り形式を明示、(b) comma 区切りも併用受入 (split on comma)、(c) case-close.md / SPEC 呼出例で space 区切りを明示
- 想定反映先: check_changed_docs.ts (usage メッセージ)、docs/specs/integrity/targeted-docs-guard-implementation.md (呼出例)、src/opencode/commands/agentdev/case-close.md (Step 3-1 実行コマンド)
- 関連: Issue #1520, PR #1526, Epic #1515 Wave 2, OU-005 false-clean 3層防御
- タグ: #check-changed-docs #files-arg #cli-usage #false-clean-trigger #case-close
