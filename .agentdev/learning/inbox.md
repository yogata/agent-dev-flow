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
