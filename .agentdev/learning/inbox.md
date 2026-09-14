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

## 2026-09-14 case 2805 Wave 1 / case 2812（PR #2812）: Bun.YAML 依存 checker の stdout flush 保証ラッパー

- 観測元: case 2812（DEL-2806-1、PR #2812）本文 learning 候補、case-close 2026-09-14 回収
- 内容: Windows + bun 環境で process.exit を呼ぶ checker CLI を bun 直実行すると stdout レポートが失われる（既知知識 docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md）。本実行では Bun.YAML 依存のため node import 経路が使えず、Bun.write(Bun.stdout) による flush 保証ラッパー（一時ファイル、実行後に削除）で対処した。Bun.YAML 依存 checker 向けの flush 保証ラッパー実行手順は既存知識文書に明記されていない

## 2026-09-14 case 2805 Wave 1 / case 2812（PR #2812）: PR HEAD worktree root でのトレーサビリティ check は main 側カタログ更新を反映しない

- 観測元: case-close QG-4 独立再検査（case 2812、PR #2812）、case-close 2026-09-14 検知
- 内容: トレーサビリティ check の --root を PR HEAD worktree に向けると、ブランチ分岐後に main へ commit された検証対応要否カタログ登録（本件は前回 case-close ゲート停止の解消 RU-0002、commit 4987ea1e）が存在せず、durable state では解消済みの対象 6 行が unclassified と判定される。検証対応要否段階ゲートの判定対象は REQ ファイル・検証対応要否カタログ・対応宣言という横断 durable state であり、未分類判定が出た場合は main 側 root で再実行し、カタログ登録 commit の時系列（ブランチ分岐の前後）を確認してから完了阻止を判断する

## 2026-09-14 case 2805 OU-002（PR #2815）: Integrity suite・textlint final gate の Windows 環境依存失敗と timeout

- 観測元: case 2805 OU-002（DEL-2807-1、PR #2815）本文 learning 候補、case-close 2026-09-14 回収
- 内容: bun test フル suite（repo-agentdev-integrity/scripts）は Windows 環境で環境依存 fail を含む。IR-055 / NG21 の checker subprocess は約 5 秒 timeout で JSON Parse EOF（Unexpected EOF）fail が発生し flaky。zod は node_modules 未整備の worktree では依存解決失敗となり、main root では解決する。textlint final gate は case-run で 120 秒 timeout したが、時間制約を 300 秒へ拡張した単独実行（`bun run src/opencode/plugins/agentdev-textlint-guard/gate.ts --root .`）では 507 ファイル・hard violation 0 件で合格。検証失敗時は timeout 拡張・main root 実行での再現確認により環境依存か変更起因かを由来分類してから扱う。trusted-distribution BaseOid の失敗も PR 本文で環境依存として記録済み
- 関連: Issue #2807（OU-002）、PR #2815 対応記録コメント、既存知識 docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md
- タグ: `#windows` `#bun` `#integrity-suite` `#textlint` `#timeout` `#flaky`

## 2026-09-14 case 2805 OU-003（PR #2816）: 配布物 prose 内 REQ 行引用は ADF-COVERS 宣言行へ集約する

- 観測元: case 2805 OU-003（DEL-2808-1、PR #2816）本文 learning 候補、case-close 2026-09-14 回収
- 内容: 配布物の REQ 行引用は prose に書くと IR-055 / 配布依存境界の両 checker で検出される。正規パターンは「行の正確な対応は ADF-COVERS 宣言行（両 checker で免除）に集約し、prose は `REQ-{NNN}` / `DEC-{N}` braced 形式か語で表現する」。新規配布物作成時に最初からこの形式で書くことで検出 → 修正 → 再検証の往復を避けられる
- 関連: Issue #2808（OU-003）、PR #2816 対応記録コメント
- タグ: `#distribution` `#ir055` `#concrete-id` `#adf-covers`

## 2026-09-14 case 2805 OU-003（PR #2816）: worktree での bun test 実行に必要な node_modules 事前整備

- 観測元: case 2805 OU-003（DEL-2808-1、PR #2816）本文 learning 候補、case-close 2026-09-14 回収
- 内容: worktree での bun test は node_modules 未伝播により、`.opencode/` 配下の依存（zod 等）と src 側 import 解決の双方で事前整備が必要。`.opencode/package.json` 取得 + bun install に加え、src/opencode からの解決のため worktree root への node_modules junction 作成が必要だった（整備資産は gitignore 対象、commit 対象外）
- 関連: Issue #2808（OU-003）、PR #2816 対応記録コメント、既存知識 docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md
- タグ: `#worktree` `#bun-test` `#node-modules` `#junction`

## 2026-09-14 case 2805 OU-004（PR #2817）: worktree の bun test 依存整備は .opencode/skills 側 bun install で完結する

- 観測元: case 2805 OU-004（DEL-2809-1、PR #2817）本文 learning 候補、case-close 2026-09-14 回収
- 内容: worktree での bun test 分割①は zod 解決のため node_modules junction 接続が要る。`.opencode/`（package.json + node_modules/zod）は worktree へ伝播せず、`agentdev-project-extensions/scripts` を import するテストが「Cannot find package 'zod'」で error 化する。REQ-018 fallback 契約（src/opencode/ への fallback）では解決しない依存解決系の構造的制約。QG-4 正規形の `bun install --cwd` 2 dir 前置（`src/opencode/skills/agentdev-project-extensions/scripts` と `.opencode/skills/repo-agentdev-integrity/scripts`）で解決できる（case-close 再実行で確認済み）
- 関連: Issue #2809（OU-004）、PR #2817 対応記録コメント、同 inbox の「worktree での bun test 実行に必要な node_modules 事前整備」（OU-003）と関連。統合判断は learning-promote が行う
- タグ: `#worktree` `#bun-test` `#zod` `#junction` `#qg4`

## 2026-09-14 case 2805 OU-004（PR #2817）: check_integrity の --json 出力は bun CLI 経由・Windows で末尾破損することがある

- 観測元: case 2805 OU-004（DEL-2809-1、PR #2817）本文 learning 候補、case-close 2026-09-14 回収
- 内容: bun CLI 経由の checker `--json` 出力が Windows で途中破損する事例。human readable 出力 + node 単独実行へ切り替えて回避。checker 実行契約の「stdout flush 前 exit」回避策の実例
- 関連: Issue #2809（OU-004）、PR #2817 対応記録コメント、既存知識 docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md
- タグ: `#windows` `#bun` `#json` `#stdout` `#checker`

## 2026-09-14 case 2805 OU-004（PR #2817）: main root 対照実行は mid-Epic の stale 状態で環境特有 fail を出す。由来分類には PR HEAD での pass 確認を併記する

- 観測元: case 2805 OU-004 case-close の bun test 分割① main root 対照実行（2026-09-14、エージェント自律観測）
- 内容: main root での分割①対照実行が worktree（PR HEAD）より 4 件多い fail を出した（IR-055 runtime-unresolved-reference delta 系 2件・NG21 N16/N17 2件）。原因は mid-Epic の main root 環境が次子 Issue の manifest 未反映 / stale junction 状態にあることで、同一テストは PR HEAD worktree では pass する。対照実行による fail 由来分類では「baseline（main）で再現する pre-existing」と「main 環境固有で PR HEAD では pass の環境起因（無効分類）」を区別し、後者には PR HEAD での pass 結果を根拠として併記する。 Epic 進行中の main root は対照実行の baseline として絶対視しない
- 関連: PR #2817 対応記録コメント検証差分、同 inbox の「Integrity suite・textlint final gate の Windows 環境依存失敗と timeout」（OU-002）、QG-4 環境ラベル（junction 伝播状態）
- タグ: `#integrity-suite` `#ir055` `#ng21` `#main-root` `#fail-origin` `#epic`

## 2026-09-14 case 2805 OU-005（PR #2818）: 配布物削除 Case では integrity suite の fail 由来分類に extensions 横断検査を織り込む

- 観測元: case 2805 OU-005（DEL-2810-1、PR #2818）本文 learning 候補、case-close 2026-09-14 回収
- 内容: 既存の integrity suite は `.agentdev/extensions/**` の別OU専属成果物を横断検査するため、配布物削除時に旧参照が残ると本変更側の suite が失敗する。今回の専属領域は修正せず、Finding として記録した。削除系 Case では Epic Wave の専属割当を確認し、横断検査の fail は本変更起因ではなく後続 OU 専属の計画的依存として由来分類する
- 関連: Issue #2810（OU-005）、PR #2818 対応記録コメント、Epic #2805 OU-006（.agentdev/extensions/** 更新専属）
- タグ: `#integrity-suite` `#extensions` `#deletion` `#fail-origin` `#epic`

## 2026-09-14 case 2805 OU-005（PR #2818）: junction 未伝播環境の link profile は main root 読取専用 runner で代替測定する

- 観測元: case 2805 OU-005（DEL-2810-1、PR #2818）本文 learning 候補、case-close 2026-09-14 回収
- 内容: Windows の junction 未伝播環境では worktree link profile を直接測定できないため、main root の読取専用 runner と Bun 実行で検査した。case-close 配布依存境界 最終 gate（source profile）でも同様に main root から bun run し、CLI の repoRoot 位置引数に PR HEAD worktree を指定する読取専用実行で case-run STEP-S5 と同一 detector を再現した（CLI 契約 `[--profile P] [--json] [repoRoot]`）
- 関連: Issue #2810（OU-005）、PR #2818 対応記録コメント、同 inbox の「worktree での bun test 実行に必要な node_modules 事前整備」（OU-003）
- タグ: `#windows` `#junction` `#distribution-boundary` `#worktree` `#fail-origin`

## 2026-09-15 case 2805 OU-006（PR #2819）: 初回委譲応答が4状態契約を完了せずに要約で終了した

- 観測元: case 2805 OU-006（DEL-2811-1、PR #2819）本文 learning 候補、case-close 2026-09-15 回収
- 内容: 初回 delegation turn は実装・検証の要約を返したが、契約上必要な commit と PR を作成せず、completed-pr / blocked / failed の4状態結果も返さなかった。adapter contract の完了判定が未達のまま後続工程へ進めない状態になり、再開セッションで残りの検証・10コミット・PR作成まで完了した。delegated task の最終ゲートとして、commit hash・PR URL・4-state result の3点を必須検査し、不足時は要約で終了せず再開する guard が有効
- 関連: Issue #2811（OU-006）、PR #2819 対応記録、同 inbox の「background task 起動の連続消失と同期実行への切替」。統合判断は learning-promote が行う
- タグ: `#delegation` `#adapter-contract` `#four-state` `#guard`

## 2026-09-15 case 2805 OU-006（PR #2820）: worktree 内並行書き込みの検知と明示パス・ステージ確認の対処

- 観測元: case 2805 OU-006（DEL-2811-2、PR #2820）本文 learning 候補、case-close 2026-09-15 回収
- 内容: 作業中に git status の差分監視で別主体とみられる書き込み（routing references・learning 関連・docs/designs 多数ファイル）を検知した。対処として (1) in-scope ファイルのみ明示パス指定でステージ、(2) ステージ後の `git diff --stat <scope>` が空であることの確認、(3) コミットはステージスナップショットに対して実行、により PR への混入を防止できた。worktree は 1 writer 前提であり、並行書き込み検知時の早期断念基準（in-scope ファイルへの書き込み検知時は直ちに停止等）を adapter protocol 側で明文化すると再発防止になる
- 関連: Issue #2811（OU-006）、PR #2820 対応記録
- タグ: `#worktree` `#parallel-write` `#staging` `#adapter-protocol`

## 2026-09-15 case 2805 OU-006（PR #2820）: squash merge 済み分支の再利用は fast-forward 不能になる

- 観測元: case 2805 OU-006（DEL-2811-2、PR #2820）本文 learning 候補、case-close 2026-09-15 回収
- 内容: squash merge 済み分支（前回 PR #2819 の feature/issue-2811）を再利用する委譲では、remote 分支に squash 前コミット 11 件が残留し、main 由来の新 commit を fast-forward push できない。force-push 回避のため新分支（feature/issue-2811-2、base main 46d723a1）から PR を作成した。case-run の worktree/分支準備時に remote 分支の fast-forward 可否確認、または squash merge 後の分支削除運用により防止できる
- 関連: Issue #2811（OU-006）、PR #2820 対応記録
- タグ: `#squash-merge` `#branch` `#case-run` `#worktree`

## 2026-09-15 case 2805 Epic（case-close 再検証）: body 更新のみの issue_update 後に Issue state が closed へ変化した

- **問題事象**: Epic Issue 2805 の本文更新（完了条件⑤残課題記述の現状化 + 再検証記録追記）を Custom Tool agentdev_gh の issue_update で実行したところ、リクエストには state 変更を含めないにもかかわらず、直後の再読込 VERIFY で Issue state が closed へ変化していた。完了条件⑤未達の Epic が closed になるのは構造化停止契約（未達チェックボックス残存時の停止）に反するため、issue_reopen で open へ復帰した
- **発生局面**: case-close Epic Wave クローズ E5-1（完了条件最終評価に伴う Epic Issue 本文更新）
- **検知方法**: Issue body 更新後の再読込 VERIFY（issue_read）で state フィールドを期待値（open 維持）と突合
- **根本原因**: 未特定。issue_update 操作自体の副作用（Tool 内部実装が body 内容に連動して state を操作する等）または並行アクター（別セッション・ユーザー手動操作・GitHub 自動化）による state 変更の可能性が残る。issue_update の fail-closed 検証は本文反映を読み戻すため、state の意図しない変化は検知できない
- **自律対応内容**: issue_reopen で open へ復帰（読み戻し VERIFY 済み）。本文更新内容は維持。本 learning エントリとして capture
- **ユーザー確認有無**: なし（完了報告で明示）
- **Decision/REQ/spec影響**: なし
- **横展開観点**: agentdev_gh 経由の Issue/PR 更新操作全般。body 更新後の VERIFY は本文だけでなく state も含めて期待値突合すべき
- **再発条件**: issue_update 実行後、state を期待値と突合せずに後続 STEP へ進む場合
- **予防策候補**: issue_update 後の再読込 VERIFY に state の期待値突合（更新指示に含まれない限り open/closed は不変であること）を追加。意図しない state 変化検知時は元状態への復帰を即時実施し、原因を learning へ記録
- **想定反映先**: agentdev-issue-management（Issue 更新時の前後内容比較・VERIFY 手順）、agentdev-workflow-case-close（E5-1 再読込 VERIFY）
- **関連**: Issue 2805（Epic、case-close 再検証 2026-09-15）、agentdev_gh issue_update / issue_reopen
- **タグ**: `#agentdev-gh` `#issue-update` `#state-change` `#verify` `#reopen`
