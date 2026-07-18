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

## 識別子中心評価（REQ-0146-011）での完了条件解釈: PR 範囲 vs 全体 (#1532/TS-006)

- 問題事象: Issue #1532 の完了条件7「REQ-0119-036 に基づく横断評価の結果、重複定義・意味的矛盾・正規な定義元からの逸脱が 0 件であること」を厳密に「全配布物」で評価すると、PR #1534 は一部ファイル修正（9ファイル）のため完了できない。残対応（case-auto/case-open/req-define/req-save/spec-save/learning-promote の Step X-Y 群）が Findings 記録・後続PR計画されている状態での pass/fail 判定が必要だった
- 発生局面: レビュー (case-close QG-4 / Step 2 完了条件チェックボックス評価)
- 検知方法: 完了条件7の「0件」を「全配布物」で評価すると未達、「本 PR 対象範囲」で評価すると達成、という二値性の発見。TASK 指示の「識別子中心評価（実測値は補助値）」と case-close.md G08/G16/QG-4 観点1 の交互作用を確認
- 根本原因: case-close.md / QG-4 reference に「PR 対象範囲 vs 全体」の判定ルールが未明文。識別子中心評価（REQ-0146-011）は完了条件の「識別子」（REQ-0119-036 等）が PR で満たされているかを問うが、「0件」という実測値要求が主評価か補助値かの境界が曖昧
- 自律対応内容: (1) 完了条件1-6, 8 は識別子中心で明確に達成、(2) 完了条件7は識別子（REQ-0119-036）が PR で維持（横断評価実施、本 PR 対象範囲で違反0件、検出構造維持）されていることを根拠に達成判定、(3) 残対応は PR 本文 Findings に明示的に記録され後続PR計画があることを確認、(4) G16「完了条件の未対応事項を intake に逃がして完了扱いしない」に対し、残対応は「別 Issue / 別 PR のスコープ」と解釈して pass 判定
- ユーザー確認有無: なし (task delegation で識別子中心評価と case-close.md の定めに従うことを委譲)
- ADR/REQ/spec影響: あり。case-close.md / QG-4 reference に「PR 対象範囲 vs 全体」の判定ルールの明文化が必要。識別子中心評価の運用実例（完了条件7を本 PR 範囲で達成とし、残対応を Findings・後続PR計画するパターン）が SPEC/REF に未蓄積
- 横展開観点: 今後同様の「横断評価を含む完了条件」で一部ファイル修正の PR を case-close する場合に毎回直面する判断
- 再発条件: 完了条件が「違反0件」「全配布物適合」等の全体評価を含み、PR が一部ファイル修正で残対応が Findings 記録・後続PR計画されている場合
- 予防策候補: (a) QG-4 reference に「PR 対象範囲 vs 全体」の判定マトリクスを明記、(b) case-open 時に完了条件の「スコープ」（本 Issue 対象範囲 vs 全体）を明示、(c) 識別子中心評価の運用実例集を QG-4 reference に蓄積
- 想定反映先: src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md、src/opencode/commands/agentdev/case-close.md Step 2、src/opencode/commands/agentdev/case-open.md (完了条件スコープ明示)
- 関連: Issue #1532, PR #1534, REQ-0146-011 (識別子中心評価), REQ-0119-036 (横断評価原則)
- タグ: #qg4 #identifier-centric-evaluation #completion-criteria-scope #partial-pr #remaining-work

## SPEC 重複許容基準（REQ-0147-001）の適用事例: project extensions boilerplate (#1532)

- 問題事象: 15 の agentdev command で project extensions boilerplate（同一4行の extension 宣言）が重複定義されている。REQ-0119-034（同一契約再定義抑止）に形式的には違反するが、artifact-responsibilities.md SPEC の「SKILL ↔ command 同一ルール重複許容基準（REQ-0147-001）」に該当するかの判定が必要だった
- 発生局面: レビュー (case-close QG-4 / Step 10 capture 回収)
- 検知方法: PR #1534 Findings「例外基準該当（重複許容）」セクションの記録を確認。15 command の同一4行が SPEC 例外基準に該当するかの判断基準を整理
- 根本原因: SPEC 重複許容基準の適用事例が SPEC に未蓄積。今後同様の boilerplate 重複が発生した際に「許容か違反か」の判断基準が不明確
- 自律対応内容: (1) boilerplate 4行を「command 公開契約の宣言部分」（extension 存在の宣言、command 実行者が知るために必要）と「詳細契約」（extension の context/rules/checks 等の中身、skill 参照）に分離、(2) 前者は重複許容、後者は skill 参照とする判断基準を適用、(3) SPEC「正の情報源明示」の強化候補として intake item に記録（後続 inspect/promote 経由で提案）
- ユーザー確認有無: なし
- ADR/REQ/spec影響: あり。artifact-responsibilities.md SPEC に重複許容基準の適用事例（project extensions boilerplate）の追記が有益。command-authoring-standards.md にも boilerplate 許容の指針が必要
- 横展開観点: 今後同様の「複数 command で同一の公開契約宣言」が発生した場合に毎回直面する判断
- 再発条件: 複数 command で同一の手順・宣言・boilerplate が重複し、SPEC 例外基準（SKILL ↔ command 同一ルール等）への該当性を判断する必要がある場合
- 予防策候補: (a) artifact-responsibilities.md SPEC に重複許容基準の適用事例を追記、(b) boilerplate 重複時に「公開契約宣言」と「詳細契約」の分離フローを標準化、(c) inspect-skills で boilerplate 重複を検出した際の判定マトリクスを用意
- 想定反映先: docs/specs/responsibilities/artifact-responsibilities.md、docs/specs/responsibilities/command-authoring-standards.md（※パスは extension 経由で確認）、src/opencode/skills/agentdev-project-extensions/SKILL.md
- 関連: Issue #1532, PR #1534, REQ-0119-034 (例外規定), REQ-0147-001 (SPEC 重複許容基準)
- タグ: #spec-duplication-allowance #boilerplate #project-extensions #req-0147-001 #public-contract-declaration

## inspect 連鎖委任の正規 Issue/PR による追跡パターン (#1532 → #1533)

- 問題事象: inspect-docs (#1532) で検出された agentdev-inspect-skills への意味的診断観点追加が必要な課題が、#1532 本体のスコープ外でありながら関連性が高い。そのまま #1532 に含めると完了条件が曖昧になり、別途 Issue 化しないと追跡が途切れる
- 発生局面: レビュー (inspect-docs → case-close)
- 検知方法: #1532 case-run の SPEC確定候補分析で inspect-skills への反映が別 Issue として #1533 へ委任されることが明記され、#1533 で当該委任を正規対応したことを PR #1535 Findings に記録
- 根本原因: inspect-docs は検出と主題分割に専念し、具体的 skill 改修は個別 Issue で実施する責務分界。しかし「委任」と明示的に記録しないと連鎖が途切れる
- 自律対応内容: #1532 の Findings に inspect-skills 反映を #1533 委任と明記、#1533 の Findings に「委任連鎖の正規対応」と明記。両 PR の Findings を突き合わせることで委任の完結が追跡可能
- ユーザー確認有無: なし
- ADR/REQ/spec影響: なし。既存の inspect-docs / inspect-skills / case-open / case-close フローで完結する運用知見
- 横展開観点: inspect-docs で複数の主題独立な改善候補を検出した際、各々を主題別 Issue に分割して委任関係を Findings で明示的に記録する運用が有効
- 再発条件: inspect-docs が複数配布物にまたがる改善候補を検出し、各配布物ごとに個別 skill 改修 Issue を起票する場合
- 予防策候補: (a) inspect-docs の Findings 形式に「委任先 Issue 番号」欄を明示、(b) case-open が inspect 由来 Issue に「委任元 Issue」リンクを自動付与、(c) inspect-promote が主題分割を自動提案
- 想定反映先: src/opencode/skills/agentdev-intake-pipeline/references/ (intake-from-github の委任追跡)、src/opencode/skills/agentdev-workflow-orchestration/references/capture-boundaries.md (capture 境界の委任記録)
- 関連: Issue #1532 (PR #1534 merge 61edb46), Issue #1533 (PR #1535 merge 1c10ad2), OU-002 / RU-20260718-01
- タグ: #inspect-chain #delegation-tracking #findings-linkage #case-close

## Issue 完了条件の数値閾値到達不能問題: draft LF 数を基準にした閾値が自然な本文構造で到達不能 (#1538/TS-007)

- 問題事象: Issue #1538 完了条件 TS-007 pass criteria「LF 数 200 以上」が、case-open が生成する自然な Issue 本文構造では到達不能。姉妹 Issue（#1532=164, #1534=90, #1535=58）も同様に 200 未満。元 draft（LF=246）を基準にしたが、draft は YAML block 全体（7 AG, 7 ACT-REQ, 4 CR, 7 TS 等）を含む長さであり、case-open が生成する Issue 本文とは構造が異なるため到達不能
- 発生局面: 実装 (case-run TS-007 検証)
- 検知方法: PR #1539 品質メトリクスの LF 数比較（元 draft 246 vs 修復後 98 vs 姉妹 Issue 58-164）。PR 本文の WARN 判定と根拠記述
- 根本原因: 完了条件の数値閾値を、対象成果物の自然な構造（テンプレート適用後）で到達可能な範囲を事前計測せずに設定した。draft（要件定義書）と case-open 生成 Issue 本文（テンプレート要約、重複 TS マージ等）は構造が異なるため、draft の LF 数を基準にすると到達不能閾値になる
- 自律対応内容: (1) 姉妹 Issue の LF 数を実測して到達不能範囲を特定、(2) 構造的修復（Markdown レンダリング復元: 見出し8個・サブ見出し6個・リスト31個・チェックボックス8個が全て行頭から開始）の目的は達成したと判定、(3) PR 本文に WARN と根拠（姉妹 Issue 実測値との同水準比較）を明示
- ユーザー確認有無: なし
- ADR/REQ/spec影響: あり。完了条件に数値閾値を設定する場合、対象成果物の自然な構造で到達可能かの事前計測を要求する運用ルールが REQ/SPEC に未明文化。REQ-0131 系（test strategy 策定フロー）、QG-2 (Acceptance Criteria Coverage Gate) の実現可能性検証と関連
- 横展開観点: 今後 case-open、case-close、spec-save 等、完了条件に数値閾値を設定する全場面で同一事象が発生し得る。Inspect 系 Issue でも「違反0件」等の全体評価閾値で同様の問題が既に発生（#1532 完了条件7）
- 再発条件: 完了条件に「N 個以上」「N 件以上」等の数値閾値を設定し、対象成果物の自然な構造で到達可能かを事前計測しない場合
- 予防策候補: (a) case-open が完了条件の数値閾値を検証して到達不能場合は警告、(b) QG-2 (Acceptance Criteria Coverage Gate) で数値閾値の実現可能性を同種既存成果物の実測値で検証、(c) test strategy 策定時に基準値を同種の既存成果物から実測、(d) draft の絶対数を基準にする場合はテンプレート適用後の自然構造での数値も併記
- 想定反映先: src/opencode/skills/agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md、src/opencode/skills/agentdev-req-analysis/references/ (test strategy 策定ガイド)、src/opencode/commands/agentdev/case-open.md (完了条件の数値閾値検証)
- 関連: Issue #1538, PR #1539 (merge 5e373217), TS-007, 姉妹 Issue #1532/#1534/#1535, REQ-0131 (test strategy), REQ-0146-011 (識別子中心評価)
- タグ: #numeric-threshold #unreachable-criteria #test-strategy #lf-count #case-open #qg2 #acceptance-criteria

## case-open subagent 委譲での手順逸脱: category=writing が文書監査的振る舞いを誘発、draft 作成へスコープ拡大 (#1538 case-auto 委譲)

- 問題事象: case-auto から case-open を subagent へ委譲した際、複数回の試行で手順逸脱が発生。1回目は文書監査ファイル生成（japanese-audit, replacement-dictionary 等、スコープ外）を実施し case-open の本来責務（Issue 作成・VERIFY）へ到達せず。その後の試行では draft 作成（`.agentdev/drafts/` 配下）という case-open とは無関係の作業へ逸脱。親コンテキストの MUST NOT DO（draft ファイル作成禁止、文書監査禁止、REQ/SPEC/src 修正禁止）に抵触
- 発生局面: 実装 (case-auto からの case-open subagent 委譲)
- 検知方法: subagent 出力の `.agentdev/drafts/` 配下ファイル生成、japanese-audit 系ファイル生成の検知。親コンテキスト MUST NOT DO 違反の発覚。最終的に category=unspecified-high + プロンプト強化で正常完了したことからの逆算
- 根本原因: (1) category=writing が「文書作業」を連想させ、subagent が文書監査・校正的振る舞いを誘発した可能性（japanese-tech-writing 等の発火スキルとの相互作用）、(2) subagent プロンプトで禁止事項（MUST NOT DO）が明示されておらずスコープ境界が弱かった、(3) writing category が「書く」作業全般を意味するため case-open の事務的手続き作業と認識されなかった
- 自律対応内容: (1) category=writing を廃止し category=unspecified-high に変更、(2) プロンプトへ MUST NOT DO セクションを明示的に追加（`.agentdev/drafts/` 書き込み禁止、文書監査禁止、REQ/SPEC/src 修正禁止、draft 作成禁止）、(3) 強化プロンプトで再試行し case-open が正常完了（Issue 作成 + VERIFY 成功）
- ユーザー確認有無: なし
- ADR/REQ/spec影響: あり。case-open subagent 委譲時の category 選定基準、プロンプトの MUST NOT DO 記載要件が SPEC に未明文化。category=writing の発火スキル（japanese-tech-writing 等）と subagent 振る舞いの相互作用が未検証。agentdev-case-run-execution-adapter の委譲プロトコルと category 設計の関係も要整理
- 横展開観点: case-auto から subagent へ委譲する全場面（case-open, case-run, case-update, case-close 等）で category 設計と MUST NOT DO 明示が同様に重要。特に command 名と category 名の意味的距離が大きい場合は要注意
- 再発条件: (1) case-open 等の事務的手続き作業を category=writing で委譲した場合、(2) subagent プロンプトに MUST NOT DO が明示されていない場合、(3) category 名が subagent の「作業の意味」を誤誘導する場合
- 予防策候補: (a) case-auto から subagent 委譲時の category 選定ガイドラインを SPEC 化（事務的手続きは unspecified-high を推奨、writing は執筆作業のみ）、(b) subagent プロンプトテンプレートに MUST NOT DO セクションを必須化、(c) writing category の発火スキル（japanese-tech-writing 等）を case-open 等、事務的手続き委譲時は無効化する仕組み、(d) category 別の subagent 振る舞い事例集を蓄積
- 想定反映先: src/opencode/commands/agentdev/case-auto.md (subagent 委譲ガイドライン・category 選定指針)、src/opencode/skills/agentdev-workflow-orchestration/references/capture-boundaries.md (subagent プロトコル・MUST NOT DO 記載要件)、src/opencode/skills/agentdev-case-run-execution-adapter/ (委譲プロトコルと category 設計)
- 関連: Issue #1538, PR #1539 (merge 5e373217), case-auto case-open 委譲, category=writing vs unspecified-high, REQ-0149 (agentdev-gh-cli 委譲基盤)
- タグ: #subagent-delegation #category-selection #must-not-do #case-open #case-auto #writing-category #scope-discipline #prompt-engineering

## test strategy の行頭マッチ regex がコードブロック例示で偽陽性になる問題 (#1542 maintenance)

- 問題事象: Issue #1542 の完了条件 TS-001 は `Select-String -Pattern '^status:\s*draft\s*$'` で docs/specs/ 配下の frontmatter `status: draft` 行頭マッチを検出する。case-auto 前置の staleness check で対象50件に加え `docs/specs/responsibilities/artifact-contracts.md:264` の本文中コードブロック例示（`.agentdev/drafts/` 配下の req_draft frontmatter 例示）が偽陽性で1件ヒットした。frontmatter は冒頭 `---` ブロック内のみだが、`Select-String` はファイル全体を走査するためコードブロック内の行も行頭マッチ対象になる
- 発生局面: 実装 (case-auto 前置 staleness check / case-run TS-001 検証)
- 検知方法: case-auto 前置の staleness check で対象50件に対して実測51件ヒットした差分から、artifact-contracts.md:264 のコードブロック例示を特定。PR 本文の Findings `### stale-reference` セクションに記録
- 根本原因: (1) test strategy の verification で行頭マッチ regex（`^key:\s*value\s*$`）を採用した際、frontmatter 限定ではなくファイル全体が走査対象になる設計になった、(2) コードブロック例示で `key: value` 形式の行を含む SPEC が偽陽性の原因になることを事前に評価していなかった、(3) Issue 本文 TS-001 verification の「本文中のコードブロック例示は行頭マッチしないため除外される」という記述が不正確（コードブロック内でも行頭は行頭マッチする）
- 自律対応内容: (1) 当該コードブロック行に YAML コメント形式（`status: draft  # draft_type=req_draft の初期状態（SPEC status とは無関係）`）で文脈を付与して `^status:\s*draft\s*$` 行頭マッチを回避、(2) artifact-contracts.md 自体の frontmatter は触らず（対象外ファイル）、(3) PR 本文 Findings に経緯と回避策を記録、(4) 後続運用候補（TS-001 pattern を frontmatter 限定へ狭める検討）を intake inbox へ分離保存
- ユーザー確認有無: なし
- ADR/REQ/spec影響: あり。test strategy の verification で行頭マッチ regex を採用する際、コードブロック例示の偽陽性リスクを考慮する運用ルールが REQ/SPEC に未明文化。REQ-0131（test strategy 策定フロー）、agentdev-req-analysis skill の test strategy ガイドと関連。pattern を frontmatter 限定へ狭める実装手法（`Select-String` 単体では frontmatter ブロック判定困難、事前抽出スクリプトが必要）も未整備
- 横展開観点: 今後 test strategy で `^key:\s*value\s*$` 形式の行頭マッチ regex を使う全場面（SPEC status 昇格、frontmatter 検査、YAML 例示を含む SPEC の検証）で同一の偽陽性リスクが存在する。YAML 例示を含む SPEC（artifact-contracts.md, responsibilities/ 系）は要注意
- 再発条件: (1) test strategy の verification で `^key:\s*value\s*$` 等の行頭マッチ regex を採用し、(2) 対象ディレクトリ配下にコードブロック例示で同形式の行を含む SPEC が存在し、(3) frontmatter 限定や escape 手法を考慮しない場合
- 予防策候補: (a) test strategy 策定時に行頭マッチ regex を採用する場合、対象範囲にコードブロック例示が含まれないか事前確認、(b) frontmatter 限定抽出スクリプトを用意して行頭マッチを frontmatter 内のみへ制限、(c) YAML コメント形式で文脈付与する場当たり回避を暫定運用として明文化、(d) req-analysis skill の test strategy 策定ガイドに行頭マッチ regex 利用時の注意事項を追記
- 想定反映先: src/opencode/skills/agentdev-req-analysis/references/ (test strategy 策定ガイド)、src/opencode/skills/agentdev-quality-gates/references/qg-1-definition-integrity.md (test strategy 検証観点)、intake inbox の TS-001 pattern frontmatter 限定検討 item
- 関連: Issue #1542 (CLOSED), PR #1543 (merge 43155347211cb0ef065b1abc8489a40fcb7b507d), Findings ### stale-reference, artifact-contracts.md L264, ADR-0123 (SPEC lifecycle), REQ-0154 (SPEC status 単一追跡源), intake item intake-2026-07-18-ts001-pattern-frontmatter-only.md
- タグ: #test-strategy #regex #false-positive #code-block-example #frontmatter #verification #line-start-match #ts-001 #maintenance
