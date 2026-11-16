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
