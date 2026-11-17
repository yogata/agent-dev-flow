# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## prepare_definition_pr.ts 計測日収束が既存 IR-072 NG ファイルへ当日日付を設定し収束残す

- **問題事象**: Root Case #4071 の設計PR 機械工程（prepare_definition_pr.ts）で check_integrity が失敗し、内蔵の計測日収束 step が req-updated-freshness NG 対象ファイル（docs/designs/local/adf-simplification-deferred-records.md）の frontmatter updated を当日（2026-11-15）へ進行させた。当該ファイルの内容最終変更 commit は 2026-11-14（origin/main 由来）のため、IR-072 の一致判定は解消せず NG が残った。
- **発生局面**: 実装（case-open STEP-4 機械工程・worktree での check_integrity 実行）
- **検知方法**: script 報告 JSON の check_integrity step 失敗と、収束後の check_integrity 再実行で NG 1 件が残存したことによる検出
- **根本原因**: 収束 step の補正値が「当日日付（commitDate）」で固定されており、PR の変更対象ではなく内容変更日が過去日の既知 NG ファイル（delta 未登録）に対しては、checker が要求する正確な収束値（内容最終変更日）とずれる
- **自律対応内容**: 当該ファイルの updated を内容最終変更日（2026-11-14）へ補正する明示パス commit を追加し、check_integrity の未管理 delta を main 実測（3 件）から 1 件（OU-009 管轄の IR-053 warning）へ減らして収束させた
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（REQ-119-002・REQ-010-081 の運用枠内の補正。収束 step の補正値算出の改良案が積み残し候補）
- **横展開観点**: 機械工程 script が checker 報告を解釈して自動補正する他箇所（close_mechanical_steps 等）でも、補正値を「報告が要求する値」と「実行日」のどちらから導くかを区別する必要がある
- **再発条件**: PR 変更対象外かつ IR-072 の ng-baseline 未登録ファイルが corpus に残存した状態で機械工程を実行した場合
- **予防策候補**: 収束 step が req-updated-freshness 報告から対象ファイルの内容最終変更日（author date）を抽出して補正値とする
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（runMeasurementDateConvergence）
- **関連**: Issue #4071・PR #4072・docs/designs/integrity/rules/IR-072-req-updated-freshness.md
- **タグ**: `#ci` `#機械工程` `#worktree`

## 機械工程の stagePaths 外に generate_indexes 再生成出力が残置する

- **問題事象**: 同機械工程で generate_indexes が .opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml（generated_at のみ変化）と、収束後再実行で docs/designs/quality/req-health-metrics.md を再生成したが、いずれも stagePaths 指定外のため commit されず作業 worktree に残置した。manifest は起源が worktree 環境のタイムスタンプ更新のみのため破棄し、req-health-metrics.md は追補 commit で確定した。
- **発生局面**: 実装（case-open STEP-4 機械工程・収束 step の generate_indexes 再実行）
- **検知方法**: script 報告 JSON の diff.changedFiles と stagePaths の差分照合、および worktree の git status 確認
- **根本原因**: 収束 step の再実行出力が stage-and-commit step の後で working tree へ書かれる構造であり、stagePaths は呼出側が事前構成するため、再生成物のうち事前予測できなかった分は commit 対象から外れる
- **自律対応内容**: manifest は worktree 環境由来のタイムスタンプのみの変化として checkout で破棄（OU-013 の鮮度整備に委譲）、req-health-metrics.md は明示パスの追補 commit で確定した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（TS-012(5) と OU-013 が鮮度規律の正を所有）
- **横展開観点**: 報告 JSON の changedFiles と stagePaths の差分は機械工程実行後の常規確認点とできる
- **再発条件**: 収束 step が generate_indexes 再実行を発動する条件（計測日 drift）が成立した場合
- **予防策候補**: 収束 step が再実行後に再生成対象を明示パスで追加 commit する
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（runMeasurementDateConvergence）
- **関連**: Issue #4071・PR #4072
- **タグ**: `#機械工程` `#worktree`

## check_changed_docs --base-ref が worktree HEAD で対象 0 件（TARGET-EMPTY）を返す

- **問題事象**: case-open STEP-4 の targeted docs guard（check_changed_docs.ts --workflow design-save --base-ref origin/main --root worktree）を commit 済み worktree HEAD で実行したところ、git diff origin/main...HEAD に docs 3 ファイルが存在するにもかかわらず「対象ファイルが検出されませんでした（--base-ref 指定）」の zero-targets 警告を返した。--workflow design-save では docs/decisions/ 配下が appliesTo 対象外であることも判明した（design-save の対象は docs/designs/ のみ）。
- **発生局面**: case-open STEP-4 機械工程（設計PR 作成前の品質ゲート実行・worktree HEAD 0a79bc51・push 前）
- **検知方法**: guard 報告の「files checked: 0」と zero-targets 警告（対象 0 件を clean 扱いにしない規律で実行前確認）
- **根本原因**: --base-ref による変更ファイル検出が worktree コンテキストで空になり、加えて workflow 値の対象フィルタ（design-save は docs/designs/ のみ）が本変更（docs/decisions/・docs/README.md）に不適合だった
- **自律対応内容**: --files による明示指定モード（space 区切りの個別渡し。help の注意に従う）で docs 3 ファイルを渡し、workflow 値を case-run（docs/decisions・docs/README を対象に含む）へ変更して再実行し exit 0（failures 0・warnings 0）を得た
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（正規契約内の実行方法切替。zero-targets を clean 扱いにしない既存規律の適用）
- **横展開観点**: targeted docs guard を worktree HEAD で実行する場合は --files 明示指定を標準とし、workflow 値は変更対象パスの appliesTo に合う値を選ぶ（design-save ≠ docs/decisions）。実行前に git diff での対象実測を併記すると誤 pass・誤 FAILURE を防げる
- **再発条件**: --base-ref 付き targeted docs guard を worktree HEAD で実行した場合・docs/decisions 等を design-save workflow 値で検査した場合
- **予防策候補**: --base-ref の worktree コンテキストでの diff 計算の修正、または guard が TARGET-EMPTY に workflow 値の対象範囲ヒントを出力する改善
- **想定反映先**: .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts（base-ref 解決と対象フィルタの案内）
- **関連**: Case #4113・PR #4114
- **タグ**: `#checker実行` `#worktree` `#targeted-docs-guard`

## prepare_definition_pr の traceabilityReqIds が REQ 行変更なし Case で構成不能になる

- **問題事象**: prepare_definition_pr.ts の入力検証は traceabilityReqIds の非空・有効 REQ 行 ID を必須とする（REQ-030-028）。REQ 行変更を伴わない maintenance Case（Decision 新規作成のみ・Case #4113）では判定対象 REQ 集合が存在せず、script 入力 JSON が構成不能で fail-closed 拒否になることが契約文面とテスト fixture（非空必須の機械検証）から判明した。
- **発生局面**: case-open STEP-4 機械工程の入力組立
- **検知方法**: script 入力契約（validateInput・REQUIRED_GATES）と prepare_definition_pr.test.ts の fixture 確認。契約文面から決定的に判明したため実試行による fail 証跡の取得は省略
- **根本原因**: script 契約が REQ 行変更を伴う Definition 変更を前提に設計されており、REQ 変更なし Case（Decision のみ）での traceability check 対象集合が空しか存在しない
- **自律対応内容**: REQ-029-014〜016 の正規代替経路（手動相当手順 + 対照実行による悪化ゼロ件の機械証明）へ切替。worktree 作成・Decision 配置・generate_indexes・明示パス commit・check_integrity・traceability check（--req なしコーパス全体・main HEAD と対照し findings 完全一致）・targeted docs guard を手動で実行し証跡を保存した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（REQ-029-016 の代替経路の履行。script 契約の拡張は行わない）
- **横展開観点**: REQ 変更なしの maintenance / docs_chore Case で設計PRを作る場合、traceabilityReqIds 構成不能を事前に判定して代替経路へ切替する判断点が毎回発生する。対照実行（main HEAD vs worktree HEAD の findings 完全一致）が悪化ゼロ件の機械証明として機能する
- **再発条件**: REQ 行変更を伴わない Case（Decision のみ・docs_chore 等）で実変更ありと判定された場合
- **予防策候補**: script 入力検証に「traceabilityReqIds 空 + REQ 行変更なし Case」の正規入力構成（コーパス全体 check モード）を追加する
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（validateInput・validateTraceabilityReqIds）
- **関連**: Case #4113・PR #4114・REQ-029-014〜016・REQ-030-028
- **タグ**: `#機械工程` `#case-open` `#traceability`

## case-ready 受入検査で check_integrity の new unmanaged NG が後続ゲート抑止し対照実行で代替した

- **問題事象**: Root Case #4113 の case-ready 受入検査（acceptance-checks phase・accept_definition_checks.ts）で check_integrity --profile source が exit 1（req-updated-freshness NG・docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md・frontmatter updated 2026-10-05 vs 内容変更 commit date 2026-11-16）となり、script の後続抑止で overlap・generate_indexes・traceability の3ゲートが未実行になった。NG 対象ファイルは本 PR 差分外であり、PR #4103（b1b4cbddb・2026-11-16）の IR 規則メタデータ是正で内容変更した際に frontmatter updated を変更日へ追随させなかった既存債務の顕在化。baseline 未登録（new unmanaged NG・delta）のため既知債務扱いにならず exit 1 の駆動源になった
- **発生局面**: Definition 受入（case-ready STEP-1 機械工程・worktree HEAD 0a79bc51 での script 呼び出し）
- **検知方法**: script 報告 JSON の definition-acceptance-checks step fail と stderr の「1 new unmanaged NG (delta, exit code driver)」、および報告内 NG 詳細の req-updated-freshness 行
- **根本原因**: PR #4103 が docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md の本文を変更しながら frontmatter updated を変更日へ進めていなかった（IR-072 違反の新規顕在化）。case-open の対照実行（main HEAD bb89a0a8b）時点では顕在化前であり、HEAD 進行後に NG が現れた。case-open 証跡の IR-027 baseline-known NG は今回の実行では baseline 進行により info 化しており、NG の構成が入れ替わっていた
- **自律対応内容**: 現行 main HEAD（697de153f）で check_integrity 対照実行を実行し、同一ファイル・同一内容の NG 1件が出ることを機械確認（本変更起因の悪化 0件・REQ-029-014〜016 の正規代替経路）。残り3ゲート（generate_indexes 再生成差分・overlap 突合・traceability check コーパス全体）を手動相当手順で実行し証跡を保存した
- **ユーザー確認有無**: なし（対照実行による悪化ゼロ件の機械証明で受入判断を正規契約から導出）
- **Decision/REQ/spec影響**: なし（IR-055-runtime-unresolved-reference.md の freshness 債務は残置。是正は REQ-117 系の docs 整合是正へ接続）
- **横展開観点**: case-ready 受入検査は merge 前の worktree HEAD で実行されるため、case-open 対照実行時の main HEAD と現在 main HEAD の間で baseline 状態が進行していると NG 構成が入れ替わり得る。受入判断は「script 終了コード」ではなく「本変更起因の新規無管理違反の有無（対照実行）」で確定する
- **再発条件**: case-open と case-ready の間で main HEAD が進行し、その進行に含まれる docs 内容変更が frontmatter updated を追随させていない場合
- **予防策候補**: case-open の機械工程に「対照実行時の main HEAD で新規未管理 NG を検出したら baseline 登録または是正を完了させる」手順を追加する。IR-072 対象ファイルの freshness 是正は REQ-117 系で一括是正する
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（対照実行 step）・docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md（updated 是正）
- **関連**: Case #4113・PR #4114・PR #4103・REQ-029-014〜016・docs/designs/integrity/rules/IR-072-req-updated-freshness.md
- **タグ**: `#ci` `#機械工程` `#case-ready`

## 書込み guard がプロジェクト外一時領域（Temp/opencode）への write を fail-closed ブロックする

- **問題事象**: case-revise DEL-4113-REV1 の判断変更記録コメントの投稿前必須項目検証で、コメント本文と検証スクリプトを opencode 標準一時領域（C:\Users\ogatay\AppData\Local\Temp\opencode）へ保存しようとしたところ、agentdev-textlint-guard の書込み guard が「write targets a path outside the project root ... blocked per fail-closed」で write 2 件をともに拒否した。一時資材の保存ができず投稿前検証が実行できない状態になった
- **発生局面**: 実装（case-revise STEP-5・記録コメント投稿前検証）
- **検知方法**: write ツール実行の即時エラー応答（guard の fail-closed 拒否メッセージ）
- **根本原因**: harness 標準の Temp/opencode 一時ディレクトリはプロジェクト root 外であり、書込み guard のプロジェクト root 外 write 拒否（fail-closed）の対象になる。harness 側の「事前承認済み一時領域」という前提とプロジェクト guard の配置契約が一致していない
- **自律対応内容**: guard の解除・迂回は行わず、プロジェクト内の正規状態外一時領域 .agentdev/tmp/（.gitignore 対象・.agentdev README の約束対象外）へ保存先を切替して検証（validateRecordComment）を完了させた。検証後に今回作成分 2 ファイルを削除して後片付け（既存の他 Case 一時資材には触れない）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（AGENTS.md「書込み guard 運用指針」と docs/knowledge/windows-powershell-bulk-io-corruption.md の既存規律・既存配置契約の範囲内）
- **横展開観点**: 委譲実行で Temp/opencode へ一時ファイルを書く前に、書込み guard のプロジェクト root 外拒否を想定し .agentdev/tmp/ を第一選択にする（pull --ff-only 前置は不要な一時バッファでも同様）
- **再発条件**: プロジェクト root 外のパス（Temp/opencode を含む）に write ツールでファイルを作成しようとした場合
- **予防策候補**: .agentdev/tmp/ を一時資材の標準保存先とする知識の横展開（docs/knowledge/ への追記候補）
- **想定反映先**: src/common/skills/agentdev-git-worktree/references/worktree-operations.md（書込み guard 運用指針節への一時領域記述追補候補）または docs/knowledge/windows-powershell-bulk-io-corruption.md
- **関連**: Case #4113・DEL-4113-REV1・agentdev-textlint-guard
- **タグ**: `#guard` `#worktree` `#一時資材`

## case-close の REQUIRED_GATES_PRE_MERGE が REQ 行なし Case で corpus traceability の exit 2 を機械 fail にする

- **問題事象**: Root Case #4113 の case-close 機械工程 pre-merge（close_mechanical_steps.ts）で、REQ 行参照のない Case（maintenance・削除系）では traceabilityGate に lifecycle gate 完全性の正しい実行形態（--req 対象行限定）が構成不能のため --req なし corpus 実行を指定せざるを得ない。corpus 実行は既存 missing 系（missing-implementation 15・missing-verification 17 = main baseline と同一）を検出するのが正規の診断結果（summary pass=10 fail=2）だが、script の step 判定（exitCode === 0 で pass/fail 分類）が check の正規終了コード 2 を機械 fail に分類し、exitCategory failure・isCloseOperationPermitted false（mechanical-failure）で終了操作（issue_close）が抑止された。isCloseAcceptanceReady も exitCategory success を要求するため終了判定記録が accepted にならない
- **発生局面**: 完了判定（case-close STEP-3 機械工程 pre-merge 1回目・merge 直前 HEAD 6b2de3fb6）
- **検知方法**: 報告 JSON の traceability-check step fail（exitCode 2・summary 未取得）と exitCategory failure。check を script 外で再実行し stdout JSON（pass=10 fail=2・missing 系 REQ ID 集合）を取得して fail の由来を既出系と確認
- **根本原因**: lifecycle gate 完全性の判定対象行（--req）と corpus advisory 診断（--req なし）が機械工程の gate 入力構造では区別されず、対象行 0 行の Case では必ず corpus 実行を gate に指定することになる。check の exit 2 は「corpus missing 系の存在」の正常報告であり機械工程の実質失敗ではないが、決定的な step 分類では区別できない
- **自律対応内容**: GATE_ALTERNATIVE_ROUTES 第3経路（対照実行による悪化ゼロ件の機械証明）を gate ラッパーとして実装し再実行で受理した。ラッパーは check を corpus 全体で実行（観測能力削減なし）し、構造系6項目全 pass かつ missing 系 REQ ID 集合が事前 main baseline（PR 本文記録・main root 実測）と完全一致であることを決定的突合で検証、成立時に exit 0 を返す。判定メタ（対象行 0 行の根拠・突合結果・check 生 exit code）を証跡化し、検証差分には既出 32件として記録した
- **ユーザー確認有無**: なし（代替経路の履行・観測能力の未削減を機械証明で確定）
- **Decision/REQ/spec影響**: なし（STEP-3 reference 冒頭の検査不能と代替検証の関係・fail-open 契約の範囲内の処置）
- **横展開観点**: REQ 変更なしの maintenance / docs_chore Case の case-close では毎回同じ構成不能問題が発生する。isCloseAcceptanceReady / isCloseOperationPermitted は決定的判定のため、意味判断での受理を機械受理に翻訳する gate ラッパー（判定根拠の証跡化を含む）が現行構造での実用解になる。直接実行の advisory 記録（exit 2）を先に取得しておくと受理根拠が強くなる
- **再発条件**: 完了条件の Issue 本文に REQ 行参照がなく、かつ corpus に未解決の missing 系 REQ 行が存在する Case の case-close
- **予防策候補**: close_mechanical_steps の入力構成に「traceabilityGate が corpus 実行（--req なし）を指す場合の受理基準（構造系 pass + baseline 一致）」を正規入力として追加する。または check 側に lifecycle-scope モード（対象行 0 行で exit 0）を追加する
- **想定反映先**: src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts（REQUIRED_GATES_PRE_MERGE・traceability step 判定）・src/common/skills/agentdev-traceability/scripts/src/check.ts
- **関連**: Case #4113・DEL-4113-CLOSE1・REQ-029-014〜016・GATE_ALTERNATIVE_ROUTES
- **タグ**: `#機械工程` `#case-close` `#traceability`

## check_integrity の IR-073 untracked-residue が機械工程の終了判定記録を検出する

- **問題事象**: Root Case #4113 の post-merge check_integrity（merge 後 main HEAD 4b0f5afd2）で、機械工程が書き出した終了判定記録 .agentdev/close-acceptance/issue-4113.json が IR-073 untracked-residue の NG として検出された（OK 990 / NG 2・既知 NG 1件と併せて NG 2件表示）。契約状態記録・未追跡残存検査（contract-state-residue-check）では approvalEntries に .agentdev/close-acceptance/ が承認一覧対象として存在するため承認済み扱いだが、check_integrity 側の baselines/ng-baseline.json には未登録で承認構造が不一致
- **発生局面**: 完了判定（case-close STEP-5・Post-merge 最終検証）
- **検知方法**: check_integrity 報告の UntrackedResidue カテゴリ NG 行（.agentdev/close-acceptance/issue-4113.json）
- **根本原因**: .agentdev/close-acceptance/ は .gitignore 非対象の一時保護記録領域（機械工程が書き出し・post-merge で回収）であり、恒久的な承認一覧（ng-baseline）への登録対象として想定されていない。回収後は解消するため永続 NG ではないが、pre-merge 機械工程実行後〜reclamation 前に check_integrity を実行する構成では常に1件の既知構造として現れる
- **自律対応内容**: 一時保護記録である旨を既存契約（Case #4084 記録）で確認し、本 Case 起因の新規 NG 0件として検証差分に記録（ng-baseline への登録は行わない）。reclamation 標準手順（実在確認→証拠退避→明示パス削除→不存在確認）で回収し、回収後の検出解消を対照実行で確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: post-merge で check_integrity を実行する case-close では、機械工程の終了判定記録が IR-073 で1件検出される構造が既知として続く。報告の NG 件数を既知件数と突合する際はこの構造を差し引いて対照する
- **再発条件**: pre-merge 機械工程実行後〜reclamation 前に check_integrity を実行した場合
- **予防策候補**: close-acceptance 領域の .gitignore 追加、または check_integrity 側の IR-073 除外定義への close-acceptance 登録（provenance 付き）
- **想定反映先**: .gitignore・.opencode/skills/repo-agentdev-integrity/baselines/（IR-073 除外定義）
- **関連**: Case #4113・DEL-4113-CLOSE1・Case #4084
- **タグ**: `#checker実行` `#case-close` `#integrity`

## prepare_definition_pr の check_integrity fail 時早期 return が提案本文の欠落と計測日収束の不完結を生む

- **問題事象**: Root Case #4117 の case-open STEP-4 機械工程（prepare_definition_pr.ts）で、check_integrity が計測日未同期 3 NG（req-metrics-measurement-example 計測日 AUTOGEN 未同期 1・req-updated-freshness 2〔うち 1 件は main 由来の既出債務の吸収〕）で非ゼロ終了した。script は measurement-convergence step（frontmatter updated 追随 commit 2451fa726）まで実行したが、その後 (1) 収束の generate_indexes 再実行の出力を commit せず未 commit のまま残し、(2) 提案本文（proposal）を生成せず早期 return したため、traceability check と提案本文は script 外の手動相当手順で完結する必要が生じた。さらに measurement-convergence step が frontmatter updated に commit 当日（2026-11-17）を設定したが、IR-072 req-updated-freshness checker の契約は「最終内容変更 commit の author date との一致（frontmatter-only commit は除外）」であるため、内容変更日が 2026-11-16 の対象（IR-055 rules）では NG が解消されず、updated を 2026-11-16 へ訂正する追加 commit（6251ba7aa）が要った
- **発生局面**: case-open STEP-4 機械工程 1 回目（HEAD af25bd551 → 収束補正後 6251ba7aa）
- **検知方法**: 報告 JSON の exitCategory failure と check_integrity step fail・proposal 空オブジェクト。check_integrity stdout の NG 3 行と、worktree git status の未 commit 派生物（req-health-metrics.md）
- **根本原因**: script の制御フローが「check_integrity 非ゼロ = 即座の全体打ち切り」を前提とし、measurement-convergence による補正 commit の後の継続実行（traceability gate・提案本文生成）を持たない。また収束 step の updated 設定値（commit 当日）と checker 契約（内容変更 author date・frontmatter-only commit 除外）の意味が一致していない
- **自律対応内容**: 既存の幂等再実行手順（報告 JSON と git 状態から適用済み工程を確認し不足分のみ処理）とゲートの読取系実行手順（main root 実体から --root worktree 指定）で残工程を完結した。派生物の明示パス指定補正 commit（77695d5d4）と IR-072 契約に整合した updated 訂正 commit（6251ba7aa）の後、check_integrity を再実行して exit 0・NG 0 件を確認し、traceability check --req を実行して missing-design 0 件・deferred のみを確認した。提案本文は script の proposal テンプレートに基づき実測証跡で再構築した
- **ユーザー確認有無**: なし（既存 contingency 手順の履行）
- **Decision/REQ/spec影響**: なし（REQ-030-025/026/027/029・REQ-117-011 の既存契約の範囲で処置）
- **横展開観点**: REQ 行追加を伴う Definition Package 生成では、req-health-metrics.md の計測日 AUTOGEN 更新が commit 前配置と commit 後検査の間でずれ得る。REQ 追加 Case の case-open では、check_integrity 非ゼロ時に「収束補正後の再実行」を標準の救済として想定し、報告 JSON の proposal 欠落を手動再構築で補う工程を事前に用意する。case-ready / case-close の同型機械工程も同じ制御フロー構造を持つため同様の事象が発生し得る
- **再発条件**: REQ 行追加等で計測日派生物が更新される Case で、check_integrity が計測日系 NG で非ゼロ終了した場合。および既存債務（内容変更日が frontmatter updated より新しい docs ファイル）を収束 commit が吸収する場合
- **予防策候補**: (1) prepare_definition_pr.ts の提案本文生成を check_integrity 判定の前または失敗時も含めて実行する（途中結果として proposal を返す）、(2) runMeasurementDateConvergence の updated 設定を「対象ファイルの最終内容変更 commit の author date」へ一致させ、frontmatter-only commit を内容変更として扱わない checker 契約と揃える
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（assembleReport の呼び出し位置・runMeasurementDateConvergence の updated 設定）。本 Case の REQ-029-017（機械工程の入力構成）の case-run 実装時にあわせて評価する
- **関連**: Case #4117・REQ-029-017・REQ-030-032・REQ-117-011・IR-072
- **タグ**: `#機械工程` `#case-open` `#traceability`
## 同一 artifact の対応宣言を複数 sidecar に分散すると traceability checker の duplicate-inconsistencies になる

- **問題事象**: 同一 artifact パス × role の対応宣言を複数 sidecar（case-open と case-close）に分散させると、traceability checker が duplicate-inconsistencies（同一論理関係の矛盾）を検出する
- **発生局面**: Root Case #4117 の sidecar 追加（commit 3382cca07 の前段試行）
- **検知方法**: traceability checker の duplicate-inconsistencies 報告
- **根本原因**: 単一実装を複数 component の sidecar が個別に宣言すると論理関係の重複登録になる
- **自律対応内容**: case-close sidecar への cross-component 宣言を撤去し、そのファイルを所有する component（case-open）の sidecar に宣言を集約して解消
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 単一実装を共有する変更では、対応宣言は所有 component の sidecar に集約する
- **再発条件**: 複数 component にまたがる変更で各 sidecar に同一 artifact の宣言を書く場合
- **予防策候補**: sidecar 追加時の「同一 artifact パス × role の宣言は所有 component の sidecar に 1 件」チェック（checker 側または手順側）
- **想定反映先**: .opencode/skills/agentdev-traceability（checker）・agentdev-workflow-case-run（手順）
- **関連**: Case #4117・REQ-029-017・REQ-030-032
- **タグ**: `#traceability` `#sidecar` `#case-run`

## scripts/self-sync.ps1 は third-party Skill の未配置を ERROR にする（worktree 自動同期の限界）

- **問題事象**: scripts/self-sync.ps1 は third-party Skill（yomiyasu）の未配置を ERROR（exit 7）にする。network 取得を伴うため worktree の自動同期では完走しない
- **発生局面**: Root Case #4117 の worktree 環境構成（plugins 投影のみを手動で構成）
- **検知方法**: self-sync.ps1 の exit 7 と third-party 未配置の ERROR 出力
- **根本原因**: 同期対象に network 取得前提の第三者 Skill が含まれる
- **自律対応内容**: 本 Case では plugins 投影のみを手動構成し、third-party Skill は対象外として継続
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 第三者 Skill を含む完全投影は network 前提の手順として分離する候補
- **再発条件**: worktree で self-sync.ps1 を完走前提で実行する場合
- **予防策候補**: self-sync.ps1 の third-party 取得を分離した network 前提手順化（または --skip-third-party 相当の選択肢）
- **想定反映先**: scripts/self-sync.ps1
- **関連**: Case #4117・yomiyasu（third-party Skill）
- **タグ**: `#self-sync` `#worktree` `#環境構成`

## Windows 環境で textlint-guard-distribution.test.ts の afterAll rmSync が EBUSY で間欠 fail する

- **問題事象**: full-integrity-suite 分割 ③（plugins+scripts）の実行で、scripts/self/release/textlint-guard-distribution.test.ts の afterAll（449 行目 rmSync）が OS 一時ディレクトリの adftl-dist-git-* で EBUSY を出して間欠 fail する（unnamed afterAll fail で「794 tests」と計上されることもある）
- **発生局面**: Root Case #4117 の case-close pre-merge 機械工程（r2・r3 の gate ③、単独再実行では green）
- **検知方法**: gate ③ の exit 1 と stderr の EBUSY スタック・replicate 実行（spawnSync パイプ捕捉を模倣）での再現確認
- **根本原因**: Windows のハンドル競合（テスト終了直後のディレクトリ削除競合）。PR #4120 は当該ファイルに非接触であり事前存在の環境依存欠陥
- **自律対応内容**: 単独再実行で green（r4 全 11 step pass）であることと PR 非接触を確認し、環境依存の事前存在として機械受理の対象外（failureOrigins 不使用・再実行で立証）として処置
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: Windows での bun test 一括実行は afterAll のテンポラリ削除競合で間欠 fail し得る。fail 時はファイル接触と単独再実行で由来分類（PR 起因か環境起因か）を確定してから扱う
- **再発条件**: Windows 上で分割 ③ を連続実行しハンドル解放が遅延する場合
- **予防策候補**: afterAll の rmSync に retry/遅延導入、または一時ディレクトリを OS tmp からテスト実行ディレクトリ配下へ変更
- **想定反映先**: scripts/self/release/textlint-guard-distribution.test.ts
- **関連**: Case #4117（close 実行・工程記録コメント検証差分）・PR #4120（非接触確認）
- **タグ**: `#bun-test` `#windows` `#間欠fail` `#case-close`

## 終了判定記録の post-merge 回収は追跡化（commit）ではなく削除で行う

- **問題事象**: 終了判定記録 `.agentdev/close-acceptance/issue-{N}.json` が post-merge の回収（明示パス削除）ではなく恒久 commit として main へ追跡登録された（Case #4117・commit 43fc9b812）。SKILL 契約は同記録を「恒久 commit 対象の契約状態記録ではなく一時保護記録（機械工程が書き出し、post-merge reclamation で回収）」と定める
- **発生局面**: Root Case #4117 の case-close STEP-6（reclamation）
- **検知方法**: 再開実行が durable state を照合（`git ls-files .agentdev/close-acceptance/` で追跡検出。#4113 まで同領域は追跡対象外で回収済みの対照）
- **根本原因**: 回収手順（実在確認→証拠退避→明示パス削除→不存在確認）と IR-073 untracked-residue の解消（追跡化で NG を消す）の混同
- **自律対応内容**: 証拠退避（git 履歴 43fc9b812 に内容保存済み・完了記録コメント参照・tmp 証跡コピー close-close-acceptance-record-final.json）のうえ `git rm` で削除（commit d2041231c）し不存在を確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 回収対象の一時記録の NG 解消は「追跡化」ではなく「削除」で行う。追跡化は一時保護記録の恒久化であり契約違反になる
- **再発条件**: 機械工程 post-merge runner が deleteFile を提供しない構成（scripts/README.md の機構整理候補）で手動回収を置き換えた場合
- **予防策候補**: runner への deleteFile 注入（既存の機構整理候補と同一）と、回収前の `git ls-files` による追跡状態確認の工程追加
- **想定反映先**: src/common/skills/agentdev-workflow-case-close/scripts（runner deleteFile 注入）・scripts/README.md 回収手順
- **関連**: Case #4117・Case #4084・Case #4113
- **タグ**: `#case-close` `#reclamation` `#close-acceptance`

## HTTP API 起動セッションの blocking 委譲で親の実行が返りを失い停止する

- **問題事象**: opencode サーバー（ポート4098）を HTTP API で起動したセッションから ADF 標準実行（case-auto 相当）を実行したところ、blocking 委譲（task）を起動した親の実行が、委譲先の完了（RESULT ブロックの投稿・2026-11-17 03:18）を受け取れずに停止した（親の最終更新 02:14 のまま）。再開メッセージで再実行した2度目は、委譲先セッションが作成されたまま起動しなかった（03:47・メッセージ1件で停止）。
- **発生局面**: Case #4117 の case-auto —— HTTP API からの起動・2026-11-17 01:08〜04:05
- **検知方法**: サーバーの session API による親セッションの更新時刻の停滞と、委譲先セッションの状態の、直接の読み取り
- **根本原因**: 未確定。HTTP クライアントの切断の後に親の実行は blocking 委譲の完了まで生存するが、返りを処理する時点で停止する。クライアント切断との関連が疑われるが未検証である。UI（クライアントを維持する経路）からの実行では 2026-11-16 の Case #4113 で blocking 委譲が完走しており、発生していない。
- **自律対応内容**: blocking 委譲を使わない実行の形（同一セッションでの委譲なしの実行）へ切り替えた。Case #4117 の case-close と Case #4118 の case-run 以降をこの形で完遂（正規の工程・検査・記録の様式は維持・検査の省略なし・HITL 要求の発生なし）。併せて、HTTP API 起動ではセッションを生成するときの directory 指定が効かず cwd が System32 になるため、指示の文でリポジトリの絶対パスを明示する運用で回避した。
- **ユーザー確認有無**: なし（2026-11-17 の完了報告で特記として報告し、続行の指示でこの記録を起票）
- **Decision/REQ/spec影響**: なし（実行基盤の運用の知見。正規契約の変更なし）
- **横展開観点**: HTTP API から ADF を実行する場合は、工程ごとに委譲なしで実行するか、blocking 委譲の後に都度の再開メッセージを送る運用が必要
- **再発条件**: HTTP API からセッションを起動し、クライアントを切断した状態で blocking 委譲を使用する場合
- **予防策候補**: クライアントの切断の後の親 run の生存と blocking task の返りの処理についての実装の調査（opencode 本体。リポジトリの外）
- **想定反映先**: なし（opencode 本体の挙動のため）
- **関連**: Case #4117・Case #4118・2026-11-17 の完了報告
- **タグ**: `#実行基盤` `#opencode` `#委譲`

## 横断依存検査エンジンの入力 JSON を README 概要のみで組立てて TypeError で fail する

- **問題事象**: case-open STEP-5 の横断依存検査（inspect_cross_dependencies.ts）の検査入力 JSON を初めて組立てた際、README の「検査入力 JSON」節の構造概要のみを根拠に `case_id`・`target_artifacts`・`target_req_rows` というフィールド名で入力を組み、実際の契約（lib の CaseDeclaration: `case_ref`・`epic_ref`・`artifact_paths`・`target_rows`、`current_case.is_epic_intake`、トップレベル `mode`）と不一致で 2 回の fail（`mode must be "case-open" or "case-ready"`、`TypeError: decl.artifact_paths is not an object`）を返した。
- **発生局面**: case-open STEP-5 横断依存検査（エンジン入力 JSON 組立・初回実行）
- **検知方法**: CLI の入力契約 fail（stderr error 行）と engine の TypeError（stderr スタック）
- **根本原因**: scripts/README.md の検査入力 JSON 説明が置き場所・方針・kind 一覧の概要のみで、必須フィールド名（CaseDeclaration / CrossDependencyInspectionInput の interface 定義）を記載していないため、型定義ファイルを読まずに README から推測して組立てた
- **自律対応内容**: cross_dependency_types.ts の CaseDeclaration / CrossDependencyInspectionInput / SharedAreaDefinition を実読し、正しいフィールド名で入力 JSON を再組立てし、実行を完遂（population_count 1・condition_a 0 件・detection_unavailable 0 件・警告なし）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（呼出側の入力組立ミスの即時回復。エンジン本体は入力契約通りに fail しており、検出条件の変更なし）
- **横展開観点**: 機械検査エンジンの入力 JSON を初めて組立てる場合は README 概要ではなく lib の型定義（interface 定義）を一次情報として読むのが安全。--validate-input 相当の検証専用経路を持たないエンジンでは、入力契約ミスが実行時 TypeError で露見する
- **再発条件**: inspect_cross_dependencies.ts の検査入力 JSON を README のみを根拠に組立てた場合・shared_areas の kind 契約を他文書から推測した場合
- **予防策候補**: scripts/README.md の「検査入力 JSON」節へ CaseDeclaration / CrossDependencyInspectionInput / SharedAreaDefinition の必須フィールド名一覧（または型定義ファイルへの明示参照）を追記する
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/scripts/README.md（「検査入力 JSON」節）
- **関連**: Case #4123・PR #4124
- **タグ**: `#機械工程` `#checker実行`

## 検証用ラッパースクリプトの相対上層解決ミスがメイン側の誤パスへ一時退避ファイルを書き出す

- **問題事象**: case-run の検証用ラッパースクリプト（node -e spawnSync）が `path.resolve(dirname, "..", "..", "..")` による REPO_ROOT 解決を worktree 内スクリプトに対して用いたため、メイン側 `.worktrees/.agentdev/tmp/evidence` へ一時退避ファイル 8件を誤作成した。実行直後の退避ファイル不存在確認で検知し、誤作成物のリスティング取得（本実行由来であることの確認）後に明示パス削除で回収した。REPO_ROOT 解決を `".."` 2つへ修正して再実行した。
- **発生局面**: Case #4123 の case-run 検証（bun test 正規形・stdout/stderr 分離退避用ラッパー実行）
- **検知方法**: 実行直後の退避ファイル不存在確認（想定パスに退避が存在しないことの確認）
- **根本原因**: worktree 配下のスクリプトに対する相対上層解決は worktree root ではなくメイン root 側の親を辿る。worktree 構造での「repo root」はブランチ構成と異なり上層ディレクトリの固定数では決まらない
- **自律対応内容**: 誤作成物のリスティング取得と明示パス削除で回収後、`git rev-parse --show-toplevel` による top-level 判定を前置した解決へ修正して再実行
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（検証スクリプト側の回復。正規契約の変更なし）
- **横展開観点**: worktree 配下の検証スクリプトで相対上層解決を行う場合は `git rev-parse --show-toplevel` による top-level 判定を前置すべき。後片付け義務の履行には退避先の実在確認（書出しと確認の同一パス化）が要る
- **再発条件**: worktree 内スクリプトで `dirname` からの相対上層解決により repo root を導出した場合
- **予防策候補**: 検証用ラッパーの雛形（共通化された生成経路があればその雛形）へ top-level 判定の前置を組み込む
- **想定反映先**: case-close・case-run の検証用ラッパースクリプト作成手順（references）
- **関連**: Case #4123・PR #4125
- **タグ**: `#bun-test` `#worktree` `#証跡退避`

## bun test の複数 filter で no-match filter が静かに無視され worktree での分割実行が合格し得る

- **問題事象**: worktree で bun test 分割③（`bun test ./.opencode/plugins/ ./scripts/`）を実行した場合、`.opencode/plugins` は junction 未伝播で実在しないため filter に no-match となるが、他 filter（`./scripts/`）に match があれば bun test は終了コード 0 で実行を完了する。件数突合（409 tests across 23 files）は scripts 分割のみを計上しており、plugins 分割の未実行が静かに隠れ得る。
- **発生局面**: Case #4123 の case-run・case-close 検証（bun test 正規形 3 cwd 分割・worktree 実行）
- **検知方法**: 件数突合と実行対象ディレクトリの実在事前確認（Test-Path）の併用
- **根本原因**: bun test は複数 filter の一部に no-match があっても他 filter に match があれば終了コード 0 で実行する（no-match filter を静かに無視する）。worktree の junction 未伝播は filter 対象の欠落を生み、その欠落が fail として表面化しない
- **自律対応内容**: 分割対象ディレクトリの実在事前確認（Test-Path）と、未伝播時の実体パス補完実行（`bun test ./src/opencode/plugins/` で 384 tests を補完実行）を検証手順へ組み込んだ。未実行対象を実行済みとして扱わない記録（検査範囲の環境差明記）を検証差分へ記録した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（検証手順の運用知見。bun test 実行形態契約の検査範囲記録と整合）
- **横展開観点**: bun test 分割実行では件数突合に加え、分割対象ディレクトリの実在事前確認と未伝播時の実体パス補完実行を検証手順へ組み込むべき（実施範囲判別の学び）。no-match 静的無視は「0 件実行の成功扱い」に直結するため検査範囲記録の環境差明記と併用する
- **再発条件**: worktree 等の junction 未伝播環境で bun test 複数 filter を実行した場合・新規配置領域を分割対象に追加した場合
- **予防策候補**: bun test 正規形手順（qg-4-final-acceptance.md）の worktree 分割③ 環境差注記への実在事前確認と補完実行の明記（既存記述は代替検証手順の運用を案内する形のため、実在確認ステップの前置化を検討）
- **想定反映先**: src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（worktree 環境差注記）
- **関連**: Case #4123・PR #4125
- **タグ**: `#bun-test` `#worktree` `#検証手順`

## bun test 分割の並行実行で実測時間比較系と timeout 帯系のテストが非決定的 fail する

- **問題事象**: case-close の最終検証で bun test 4分割を並行実行（node child_process spawn による同時起動）したところ、7件の fail（分割① check_integrity 関連 3件〔5.0〜5.5秒の timeout 帯系〕、分割② TS-009 実測時間比較系 2件・unnamed 2件）を観測した。同一環境での単独逐次再実行では全分割 fail 0件・case-run 実績と同件数（5891 tests across 261 files）を確認し、fail は並行実行の相互作用による非決定的失敗と由来分類した。
- **発生局面**: Case #4123 の case-close 最終検証（bun test 正規形・初回並行実行 → 逐次再実行で解消確認）
- **検知方法**: full integrity suite 実行の fail 検出と非決定的失敗の再現確認手順（単独逐次再実行）
- **根本原因**: TS-009 実測時間比較系テストは CPU 負荷に依存する実測時間の比較で合否を判定するため、並行実行による CPU 競合で比較が破綻する。check_integrity timeout 帯系テストも並行負荷下で閾値超過し得る。逐次実行では相互作用が発生しない
- **自律対応内容**: 逐次再実行（4分割直列・timeout 600秒明示）で全分割 fail 0件・件数突合一致を確認し、正規形実行記録は逐次実行を採用。並行実行の 7 fail は環境依存と由来分類して検証差分へ記録した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（検証実行形態の運用知見。機械受理基準の記録様式は変更しない）
- **横展開観点**: bun test 正規形の実行は実測時間比較系テストを含むため逐次実行を標準とすべき。並行実行による fail は非決定的失敗の再現確認（単独再実行）で由来分類する手順が消費コストを生む。実測時間比較系テストの負荷依存性は suite 実行環境のラベル（並行/逐次）を検証記録に含める根拠になる
- **再発条件**: bun test 分割（または単一 suite）を並行実行した場合・実測時間比較系テストを CPU 負荷のある環境で実行した場合
- **予防策候補**: bun test 正規形手順（qg-4-final-acceptance.md）への「分割実行は逐次を標準、並行実行時は非決定的 fail の再現確認を前提に記録する」注記の追加。実測時間比較系テストへの環境ラベル前置（負荷状態の記録）の検討
- **想定反映先**: src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（bun test 正規形・実行形態契約）
- **関連**: Case #4123・PR #4125
- **タグ**: `#bun-test` `#検証手順` `#非決定的失敗`

## case-close で post-merge cleanup を issue_close 前に実行すると freshness 順序契約の pre-merge 冪等再実行の前提が欠落する

- **問題事象**: case-close STEP-5-2 の freshness 順序契約（Issue 書込み完了 → fresh revision で機械工程冪等再実行して終了判定記録再生成 → 直後に issue_close）の「機械工程」は pre-merge phase である（終了判定記録の書出しは pre-merge 分岐のみ）が、post-merge 機械工程（cleanup 付き）を issue_close の前に実行して worktree とローカルブランチを削除したため、pre-merge 冪等再実行の前提（worktree 存在・branch 存在・依存解決済み gate 実行体）が欠落した。worktree/branch の再作成（git branch + worktree add）と bun install ×3 + textlint-guard build:engine の再実行により依存整備をやり直してから pre-merge 再実行・issue_close・post-merge cleanup 再実行（remove 前掃除の再実行を含む）に至った。
- **発生局面**: Case #4123 の case-close STEP-5-2（freshness 順序・終了判定記録再生成）
- **検知方法**: post-merge 報告 JSON の diff.closeAcceptanceRecord が undefined（post-merge 分岐では終了判定記録を書出さない）であることの確認と freshness 順序契約との突合
- **根本原因**: 終了判定記録（.agentdev/close-acceptance/）の provisional/final 書出しは close_mechanical_steps.ts の pre-merge 分岐にのみ実装されている。issue_close 直前に必要なのは「終了判定記録の targetRevision を fresh revision に一致させる」pre-merge 再実行であり、worktree/branch 削除（post-merge cleanup）は issue_close の後の STEP-6 が正の順序である
- **自律対応内容**: durable state 再構成（resume protocol 相当）として branch 復元（git branch {branch} cecfc2d7c）→ worktree add → 依存整備（bun install ×3、textlint-guard bun install && bun run build:engine）→ pre-merge 機械工程冪等再実行（fresh issueUpdatedAt で全 gate pass・終了判定記録 targetRevision 2026-11-17T05:37:55Z で accepted 書出し）→ issue_close → post-merge cleanup 再実行の順序で完了。検証義務の省略は行わなかった（同一 HEAD での gate 再履行）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（workflow 実行順序の運用知見。検証義務・契約の変更なし）
- **横展開観点**: case-close の正しい実行順序は「Issue 書込み完了（checkbox 確定・完了記録・本文更新・対応記録）→ fresh issue_read → pre-merge 機械工程冪等再実行〔fresh revision で終了判定記録再生成〕→ issue_close → post-merge cleanup（remove 前掃除 → worktree/branch 削除）→ reclamation 手動回収」。post-merge cleanup を issue_close 前に置くと pre-merge 再実行の gate 実行体前提が失われる
- **再発条件**: case-close で post-merge cleanup を issue_close の前に実行した場合・freshness 再実行が必要な Case で worktree を事前に削除した場合
- **予防策候補**: case-close SKILL.md・cleanup-and-capture.md の STEP-5-2-4 手順へ「機械工程冪等再実行は pre-merge phase であること（post-merge cleanup は issue_close 後）」の明示追記。post-merge 報告 JSON に close-acceptance-record step が存在しないことの注意書き
- **想定反映先**: src/common/skills/agentdev-workflow-case-close/SKILL.md（STEP-5-2 の freshness 順序節）・references/cleanup-and-capture.md（STEP-5-2-4）
- **関連**: Case #4123・Case #4084・PR #4125
- **タグ**: `#case-close` `#機械工程` `#freshness順序`
