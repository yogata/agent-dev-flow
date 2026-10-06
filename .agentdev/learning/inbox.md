# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 複数ファイル一括機械処理は全検証をメモリ完結後に一括原子書込する（部分書込後の検証 throw で中間状態が残存）

- **問題事象**: learning-promote STEP-6 の deferred 移動・prune を node スクリプトで実行した際、prune 判定の startsWith チェックがエントリ区切りの改行揺れで1件を誤除去と判定し検証 throw した。throw 時点で deferred.md への追記は未着手だったが、同スクリプト内の先行ステップで inbox.md は既にヘッダーのみへクリア済みだったため、30エントリが inbox から消え deferred にも存在しない中間状態が発生した（git 復元で回復、最終的に全処理成功）
- **発生局面**: 運用（learning-promote STEP-6 の原子的移動プロシージャ機械実行。同一リポジトリで workflow 内の複数ファイル書込）
- **検知方法**: スクリプト内の検証ステップ（prune 対象見出し数と staged+duplicate 数の突合）が throw。直後の git status と `git show HEAD:.agentdev/learning/inbox.md` で消失エントリを確認
- **根本原因**: 複数ファイルへの書込を段階的に実施し、各段階の後に検証を置く構成だった。検証 throw は書込済みファイルを巻き戻さないため、検証が「成功した書込の確認」ではなく「後続書込の gate」になっていない配置だと、throw 時点で中間状態が残る。加えて prune 判定の見出しマッチが文字列開始比較（startsWith）で改行揺れに脆かった
- **自律対応内容**: (1) `git show HEAD:.agentdev/learning/inbox.md` で直前 commit から30エントリを復元した。(2) スクリプトを、全ファイル内容をメモリ上で構築し全検証（見出し数・処分判定数・移動日数・文字化け・BOM/CRLF）を全て成功させてから3ファイルを一括書込する構成に修正し、再実行して成功した。(3) 検証失敗時は何も書込まないことを確認済み
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の原子的操作プロシージャの適用実装の改善。契約変更なし）
- **横展開観点**: 複数ファイルを同時に更新する機械処理（移動・prune・変換・リネーム一括適用等）では、ファイルシステムへの書込を成功判定の後ろに全て配置する。部分書込が発生する既存スクリプトは、検証 throw がどのタイミングでも「元の状態」または「完了状態」の二択になるかを点検する価値がある
- **再発条件**: 複数ファイルへの分割書込を伴う機械処理で、検証ステップが書込ステップの間に挟まれている構成。検証が throw する正当なケース（バグ・データ揺れ）で実際に中間状態が残る
- **予防策候補**: 複数ファイル一括処理の機械実行は「メモリで全構築→全検証→一括書込」の順を標準とする。既存プロシージャ（deferred-atomic-move-procedure 等）の機械実行例にこの順序設計を明記する
- **想定反映先**: agentdev-learning-pipeline の deferred 原子的移動プロシージャ reference（機械実行時の実装規律）、横断的には既存対策更新系（一括機械変更の write 規律）と同型
- **関連**: backlog-auto 2026-10-06 実行、commit f549e506（回復と最終成功を同一 commit に含む）
- **タグ**: `#atomic-write` `#learning-promote` `#node-script` `#partial-write`

---

## Definition PR 機械工程の check_integrity を stage-and-commit 前に実行すると IR-072 構造的 fail が必ず再現する（対策の先行適用は手動 commit より工程順序修正が冪等再実行と整合する）

- **問題事象**: case-open STEP-4 の prepare_definition_pr.ts 実行で、definition-edit（REQ frontmatter updated を適用日へ更新）の直後に check_integrity を実行すると、IR-072（req-updated-freshness）が「updated=適用日 vs 最終内容変更 commit author date=旧日付」の構造的不一致で fail した（NG 20 件。PR #3483・ce6bd072 と同型の再現）
- **発生局面**: 実装（case-open STEP-4 の Definition PR 機械工程。Case #3507）
- **検知方法**: script 報告 JSON の check_integrity step fail（exit 1）と中断レポート（.agentdev/integrity/reports/ の integrity-report）の NG 内容突合
- **根本原因**: check_integrity の updated 突合は git log author date を参照するため、未 commit 変更を含む working tree では git log に変更が反映されず構造的に不一致となる。検査側で未 commit 変更を除外する対応は検査ロジックの複雑化のため不採用（draft CR-005 で確定済み）であり、工程順序（check_integrity を stage-and-commit の後に配置）の修正が正の対策
- **自律対応内容**: (1) draft の stop_conditions（自己言及注意）に従い contingency を選択した。手動 commit → 冪等再実行は stage-and-commit が nothing-to-commit で非 0 になり script 契約と噛み合わないため、RA-009 の工程順序修正（check_integrity・traceability-check を stage-and-commit 後へ移動。dry-run では skip 警告）を script と単体テストへ先行適用した。(2) 既存 worktree・branch を再利用し definitionEdits を空にした冪等再実行で commit と check_integrity pass を確定した。(3) 先行適用分は main working tree 未 commit のまま PR 本文 Findings セクションへ記録し、stage 3 の RA-009 本実装への取り込みを明示した
- **ユーザー確認有無**: なし（draft 合意内の contingency 選択。delegation 停止条件が両経路を認可）
- **Decision/REQ/spec影響**: なし（RA-009 として既に Definition PR #3508 へ反映済みの対策の先行適用。追加の Decision/REQ 変更なし）
- **横展開観点**: 突合型検査（git log 参照系）を機械工程に組込む場合は、検査対象の commit 状態が検査時点で確定していることを工程順序で保証する。fail 時の contingency は「手動 commit → 再実行」よりも「対策の先行適用 → 冪等再実行」が script の stage-and-commit 契約と整合する
- **再発条件**: git log 参照系検査を、対象ファイル編集後かつ commit 前に実行する工程順序。draft の自己言及注意が存在しない Case でも同じ fail を起こす
- **予防策候補**: RA-009 本実装（Definition PR #3508 の merge 後）で解消する。単体テストの工程順序期待値も同時に更新する（先行適用済み。stage 3 で期待値重複変更に注意）
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/scripts/prepare_definition_pr.ts（先行適用済み）、definition-pr-and-idempotency.md の工程順序記述（RA-003/008/009 と同一バッチで直列適用）
- **関連**: Case #3507、Definition PR #3508、commit 3bba60df/3b87450e、PR #3483（過去事例）
- **タグ**: `#ir072` `#check-integrity` `#process-order` `#idempotent-rerun`

---

## generate_indexes の req-metrics 計測日は計測対象ファイルの commit author date から導出されるため commit 前実行では 1 日遅れの値を出力する

- **問題事象**: Definition PR 機械工程で、REQ 行編集後・commit 前に generate_indexes を実行した結果、req-health-metrics.md の AUTOGEN ブロックの計測日が「計測日: 2026-10-06。」のまま更新されず、check_integrity（commit 後実行）の index-generation-consistency（IR-061）が「expected=計測日: 2026-10-07。vs current=2026-10-06」で fail した
- **発生局面**: 実装（case-open STEP-4 の Definition PR 機械工程。Case #3507）
- **検知方法**: check_integrity 中断レポートの NG「index-generation-consistency: req-metrics-measurement-example AUTOGEN block out of sync」
- **根本原因**: generate_indexes の req-metrics 計測日導出は計測対象ファイル群（REQ ファイル等）の最新変更日（git log author date）を参照する。commit 前の working tree では編集が git log に反映されず、計測日として commit 前日の値が出力される。工程順序上 generate_indexes が commit 前に配置されるため、初回実行では計測日が必ず 1 日遅れになる
- **自律対応内容**: (1) worktree 内の git diff で req-health-metrics.md と docs/README.md が generate_indexes による未 stage 変更として残存していることを確認した。(2) 派生物 2 ファイルを stagePaths に追加して冪等再実行し（REQ ファイルが commit 済み author date=適用日になった後の再生成）、計測日が正しく更新された派生物を commit した。(3) 派生物 commit に伴い req-health-metrics.md 自体の frontmatter updated を IR-072 追随で更新し、check_integrity pass を確定した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（AG-010/RA-009 の工程順序契約は変更しない。REQ 行変更を伴う Definition 変更での派生物追随の運用知見）
- **横展開観点**: AUTOGEN 派生物の再生成結果が git 履歴依存の日付を含む場合、再生成は commit 済み HEAD 状態で実行するか、派生物を同一 PR 内で再 commit して収束させる。REQ 行追加を伴う Definition 変更では req-health-metrics.md と docs/README.md が派生物候補になる
- **再発条件**: REQ 行数等メトリクスの変化を伴う Definition 変更で、generate_indexes を commit 前に実行する工程順序
- **予防策候補**: RA-003/RA-008/RA-009 の同一バッチ直列適用（definition-pr-and-idempotency.md 更新）時に、派生物再生成の工程順序（commit 前後）と stagePaths 追随を明記する。RA-009 適用後も generate_indexes は commit 前配置のため、初回実行で派生物計測日がずれた場合は再 commit で収束する運用を工程文書へ記録する
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（RA-008 が再実測対象範囲の特定手順を追記予定）、scripts/README.md
- **関連**: Case #3507、Definition PR #3508、IR-061、IR-072
- **タグ**: `#generate-indexes` `#autogen` `#ir061` `#author-date`

---

## traceability check の exit code は 9 種検査全体の合否であり case-open の missing-design 0 件ゲートと意味が一致しない

- **問題事象**: Definition PR 機械工程の traceability-check step（check.ts --req 新規行、exit code 判定）が exit 2 で fail した。出力 JSON を確認すると missing-design は pass で、fail の実体は missing-implementation と missing-verification（case-open 時点で対応が存在しない新規行 7 行）だった
- **発生局面**: 実装（case-open STEP-4 の Definition PR 機械工程。Case #3507）
- **検知方法**: script 報告 JSON の traceability-check step fail（exit 2）と、worktree 内で check.ts を直接実行した出力 JSON の checks 別 status 突合
- **根本原因**: check.ts の終了コード契約は「すべて pass で 0、検査 fail ありで 2」であり、9 種検査全体を含む。case-open の正規ゲート（STEP-4 手順 4）は missing-design 0 件のみを要求するが、新規行の implementation・verification 対応は case-run 以降で成立するため、case-open 時点では missing-implementation/verification が fail するのが正常。traceabilityGate の exit code 判定をそのまま使うと正常状態を fail と誤判定する
- **自律対応内容**: (1) 出力 JSON から missing-design status=pass を確認し、missing-design 0 件ゲートの通過を確定した。(2) missing-implementation/verification の fail は後工程対応の期待値である旨を PR 本文テスト結果欄へ記録した。(3) script 側の exit code 判定との整合は先送らず、本学びとして記録した（script の traceabilityGate 実行形態の修正は case-open の scope 外）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: あり得る（definition-pr-and-idempotency.md の traceability check 手順に「missing-design status のみを判定する」実行形態の明記余地。AG-010 関連の definition-pr-and-idempotency.md 更新（RA-003/008/009）と同一バッチで検討する価値）
- **横展開観点**: 役割別完全性検査（design/implementation/verification）の実行段階が工程により異なる場合、exit code 一括判定は工程のゲート条件と意味がずれる。工程側が所有するゲート条件（本例: missing-design）を明示して判定する
- **再発条件**: prepare_definition_pr.ts の traceabilityGate に check.ts を指定し exit code 判定する構成で、新規 REQ 行（implementation/verification 未成立）を含む Definition 変更を実行する
- **予防策候補**: traceabilityGate の実行形態を「check.ts 出力の missing-design status を判定するラッパー」または「coverage --req による design 対応実測帰着確認」に限定する。RA-009 先行適用済み script の次回修正時に同時に整える
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/scripts/prepare_definition_pr.ts（traceabilityGate 実行形態）、definition-pr-and-idempotency.md STEP-4 手順 4
- **関連**: Case #3507、Definition PR #3508、agentdev-traceability check 契約
- **タグ**: `#traceability` `#missing-design` `#exit-code` `#gate-semantics`

---

## update 系 artifact_actions の content 適用が見出し行を置換範囲に含めないと「**USE FOR**:」見出しが重複する

- **問題事象**: case-ready 受入検査（忠実性確認）で、Definition PR #3508 の docs/designs/skills/agentdev-design-file-manager.md 変更に「**USE FOR**:」見出しが 2 連続で出現していることが判明した。ACT-DESIGN-007 の content（USE FOR 箇条書き修正後全文）を update 適用した際、既存見出し行が残ったまま見出し直後から本文が置換されていた
- **発生局面**: Definition 受入（case-ready STEP-1 忠実性確認。Case #3507）
- **検知方法**: PR head worktree での diff 全文突合（req_draft の ACT-DESIGN-007 content と PR diff の照合）
- **根本原因**: content 完全性（対象セクション全文を含む完全な content。REQ-030-024）の要求は content 側に向けられたものであり、適用側が target_area 一致箇所を「見出し行を含めて置換する」のか「見出し直後から置換する」のかの解釈が固定されていない。後者の解釈で適用すると見出しが重複し、前者の解釈で見出しがずれると既存見出しが黙示削除される
- **自律対応内容**: (1) case-ready 側で重複見出しを削除する Definition 修正（commit c88c54c2）を PR へ push した。(2) 検出と修正経路を PR 本文検証差分へ記録した
- **ユーザー確認有無**: なし（合意 content からの機械的復元であり、新しい意味判断を伴わない）
- **Decision/REQ/spec影響**: なし（REQ-030-024 は適用前検証の規律として既存。検出・修正は受入検査の正規経路）
- **横展開観点**: update 系 content 適用の見出し行の扱いは target_area/anchor のマッチング規則（search-target-area.ts 契約: 見出し行全体との完全一致）と合わせて適用側で固定すべきである。適用後の重複見出し・見出し欠落検査を適用前検証（REQ-030-024）の前置確認へ組込むと本種の逸脱を機械検知できる
- **再発条件**: update 系 artifact_actions で target_area が見出し直下の箇条書き・段落群を指し、content が「見出し＋本文」の全文を含む場合の適用
- **予防策候補**: artifact-contracts.md の update operation 契約へ「target_area 一致に見出し行が含まれるか否か」の適用側規則と、適用後の重複見出し検査の前置項目追加を検討する
- **想定反映先**: docs/designs/responsibilities/artifact-contracts.md（update operation・適用前検証節）、docs/designs/skills/agentdev-design-file-manager.md（update 操作契約）
- **関連**: Case #3507、Definition PR #3508（commit c88c54c2）、REQ-030-024
- **タグ**: `#content-completeness` `#update-operation` `#duplicate-heading` `#acceptance-checks`

---

## 意味変更行の design 対応事前確認の省略は case-ready の missing-design ゲートで fail-closed になるが、省略自体が PR 記録から判別できない

- **問題事象**: case-ready が REQ-061-045（coverage 既存行対象。本 Case の新ルール）に従い coverage 確認の対象を更新行へ拡大したところ、REQ-015-002/003（AG-003 による文言排他化＝意味変更行）が design 対応 0 件であることが traceability check（fail-closed 完全性判定）で検出された。case-ready Design「意味変更行の design 対応事前確認」節のとおり、design 対応が欠落する意味変更行は case-open が artifact_actions（artifact: design）へ組込むべきであり、組込み漏れの Definition PR は ready 不遷移・case-open 差し戻しとなる。Definition PR #3508 は case-open 時の check 対象 10 行（新規 7 行＋design 対応あり更新行 3 行）で missing-design pass を記録していたため、この欠落は case-ready 初回検出となった
- **発生局面**: Definition 受入（case-ready STEP-1 受入検査／STEP-2 準備の traceability check。Case #3507）
- **検知方法**: check --req 13 行（case-open 対象 10 行＋REQ-015-002/003・REQ-062-003）での missing-design findings 3 行
- **根本原因**: missing-design 0 件ゲート（増分ベース）と意味変更行の coverage 事前確認（coverage --req）が別手順であり、事前確認の実行記録（coverage 結果・design 対応有無の実測帰着・組込み可否判断）を Definition PR 本文へ残す要求が存在しない。update 対象行の選定が design 対応有無を暗黙基準にすると、欠落既存行が対象から黙示的に外れ、ゲートの自己無保証になる
- **自律対応内容**: (1) REQ-062-003 を表記統一のみ（意味変更行に非該当）としてゲート対象外と判断し、REQ-015-002/003 を差し戻し原因行として確定した。(2) Definition PR #3508 を保持し merge を中止した。(3) Root Case #3507 へ差し戻し記録をコメントした。(4) 本学びを inbox へ capture した
- **ユーザー確認有無**: なし（case-ready Design L45/L57 と SKILL 分岐の fail-closed 適用であり、正規経路の機械的適用）
- **Decision/REQ/spec影響**: なし（現行契約の適用。ただし事前確認の記録要求の追加は REQ/Design 変更余地あり）
- **横展開観点**: 増分ベースのゲートと事前確認が別手順の構造では、対象選定基準（増分か意味変更か）と実行記録の両方が明示されないと欠落行がゲートを素通りする。coverage（advisory）と check（fail-closed）の役割分担（root-case-and-definition-package.md 手順 4.5）を意味変更行にも明示適用し、coverage 実測帰着を検証記録へ残す
- **再発条件**: 既存行の意味変更を含む Definition Package で、意味変更行が design 対応 0 件かつ check 対象から外れて Definition PR が作成される
- **予防策候補**: root-case-and-definition-package.md 手順 4 へ「coverage --req の実行記録（design 対応有無の実測帰着と組込み可否判断）を PR 本文検証差分へ残す」要求の追加を検討する。case-ready Design の「事前確認を省略した Case は停止し得る」を、省略の判別可能性（記録要求）と併記する
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md（手順 4）、docs/designs/commands/case-ready.md（意味変更行の design 対応事前確認節）
- **関連**: Case #3507、Definition PR #3508、REQ-015-002/003、REQ-061-045、case-ready Design「意味変更行の design 対応事前確認」節
- **タグ**: `#missing-design` `#coverage` `#semantic-change-row` `#fail-closed`

---

## 構成検証を GitHub Issue 作成後に実行した（execution-structure 契約は作成前実行を要求）

- **問題事象**: case-ready STEP-5 の構成検証（Epic サイズ上限・必須依存維持・全割当）を、子 Issue 9 件の GitHub Issue 作成後に実施した。execution-structure 契約は「構成確定後かつ GitHub Issue 作成前に構成検証を実行する。上限超過または構成不備を検出した場合は停止する（Issue を作成しない）」を要求する。結果は合格（子 Issue 9 件で上限 10 未満・必須依存 0 エッジで前提列整合・21 OU + 13 RA + 16 TS 全割当）で構成不備は生じなかったが、不備検出時に Issue 作成を止める保護が機能しない順序だった
- **発生局面**: 運用（case-ready STEP-5 実行構造確定。Case #3507）
- **検知方法**: Epic Issue 本文更新の実装中に execution-structure reference の「GitHub Issue 作成前」条件を再確認し自検知
- **根本原因**: 構成確定と Issue 作成を連続実行する計画で、構成検証を独立した前置ステップとして組み込んでいなかった。上限計算・割当突合が決定的計算で済むため検証を後回しにした
- **自律対応内容**: 作成後に構成検証を実行し合格を確認。構成不備なしのため Issue 是正は不要と判断し、本 deviation を capture
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行順序の遵守漏れ。契約変更なし）
- **横展開観点**: 「X を実行する前に Y を検証し、不備なら X を行わない」型の契約では、Y を X と同一の作業ブロックに置かず前置ステップとして明示実行する。決定的計算で済む検証ほど後回しになりやすい
- **再発条件**: 作成系操作（Issue 作成・commit・push）の直前に要求される検証を、作成系操作と同一ブロックで後置実行する場合
- **予防策候補**: execution-structure 手順で構成検証を独立した前置ステップ（検証合格を Issue 作成の開始条件とする）として明記する
- **想定反映先**: agentdev-workflow-case-ready の execution-structure 運用（手順明記は case-ready Design 所有）
- **関連**: Case #3507 case-ready 実行（Definition merge ad22ea16 後）
- **タグ**: `#execution-structure` `#case-ready` `#ordering-violation` `#structure-verification`

---

## STEP-7 で draft 喪失・削除パス誤り・capture commit への削除ステージ混入の 3 連鎖ミスを発生させ回復した

- **問題事象**: case-ready STEP-7 の実行で 3 件のミスが連鎖した。(1) main を origin/main へ同期する `git reset --hard origin/main` の実行前に、push 未の永続化 commit（a3cae627）で tracked になっていた req-draft の tracked 状態を確認せず、draft を working tree から喪失させた（退避 branch から復元して回復）。(2) 削除対象 RU の 0 埋め 4 桁表記（RU-0164）を padStart(3) で組み立て、機械工程 script を 2 回失敗させた。(3) script の git rm がステージ済みの状態（staged-entries-check が commit を止めた直後）で capture 永続化の git add を実行し、capture commit に RU 削除 16 件を混入させた（削除と commit の間に別操作を挟む Form Zero 違反）。未 push のうちに reset --soft で commit を解体し、明示パス指定で capture commit と削除 commit に分離して回復した
- **発生局面**: 運用（case-ready STEP-7 draft/RU 削除と同期確認。Case #3507）
- **検知方法**: (1) は script の git rm「did not match any files」fail で発覚。(2) は同じ fail の pathspec 表示で発覚。(3) は capture commit 出力の「16 files changed / delete mode 100644 RU-*」で発覚
- **根本原因**: (1) 履歴操作（reset --hard）を履歴の現状把握（ローカル先行 commit が push 未であること・tracked ファイル差分）の確認なしに実行した。(2) 動的に組み立てる識別子の書式（4 桁）を既存実物で確認せず推定した。(3) 直前の失敗試行がステージを汚したままの状態であることを確認せず git add を実行した
- **自律対応内容**: draft を退避 branch（3507-preapply-backup）から復元、padStart(4) で修正、reset --soft HEAD^ で混入 commit を解体し capture commit（4 files）と削除 commit（RU 16 件明示パス指定）に分離して回復。最終的に main 同期確認まで完了
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（実行上のミスと回復。契約変更なし）
- **横展開観点**: 履歴操作の前には「この操作で消える tracked ファイルがないか」を git ls-files / status で確認する。失敗した機械工程 script の後にはステージ状態の汚染が残るため、次の git add / commit の前に必ず git status でステージ内容を確認する。識別子書式は対象ディレクトリの実ファイル名で確認する
- **再発条件**: 未 push の commit が存在する main で hard reset を行う場合・機械工程 script 失敗直後に別目的の git add を行う場合・0 埋め桁数が混在する識別子を動的生成する場合
- **予防策候補**: STEP-7 手順で「git rm 失敗時はステージ汚染の有無を status で確認してから次の操作へ進む」前置を明記する
- **想定反映先**: agentdev-workflow-case-ready readiness-and-cleanup の draft/RU 削除手順、agentdev-git-worktree の worktree-operations（履歴操作の前置確認）
- **関連**: Case #3507 case-ready 実行（Definition merge ad22ea16 後）
- **タグ**: `#case-ready` `#cleanup` `#form-zero` `#git-reset` `#recovered`

---
