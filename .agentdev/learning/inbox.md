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

## PR #3519: 検査起動位置と変更済みコードの所在を一致させる

- **問題事象**: 作業領域側の変更を検証する際、mainの実体から起動すると未変更コードが実行された。
- **発生局面**: 実装
- **検知方法**: PR本文の検証記録と起動位置の照合。
- **根本原因**: 検査対象rootと実行するコードの所在を区別していなかった。
- **自律対応内容**: 作業領域内の変更済みchecker実体から起動して再検査した。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし。既存の起動位置規律の適用事例。
- **横展開観点**: checker自身を変更する検証に適用する。
- **再発条件**: main側の実体から変更済み作業領域を検査する場合。
- **予防策候補**: 対象rootと実行コードの所在を別々に確認する。
- **想定反映先**: worktreeの検査起動手順。
- **関連**: https://github.com/yogata/agent-dev-flow/pull/3519 の learning 第1項。
- **タグ**: `#checker` `#worktree`

---

## PR #3519: 依存の参照先がない場合は作業領域で整備する

- **問題事象**: main側の依存ディレクトリが空または不在で、junctionによる依存参照が成立しなかった。
- **発生局面**: 実装
- **検知方法**: 依存ディレクトリの存在確認。
- **根本原因**: 参照先が生成されていない状態でjunction方式を選択した。
- **自律対応内容**: 既存手順に従い対象packageでbun installを実施した。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし。既存の一意決定手順の適用。
- **横展開観点**: 新しい作業領域の型検査と依存解決。
- **再発条件**: main側node_modulesが不在の環境。
- **予防策候補**: 整備方法選択前に参照先の存在を確認する。
- **想定反映先**: worktreeの依存整備手順。
- **関連**: https://github.com/yogata/agent-dev-flow/pull/3519 の learning 第2項。
- **タグ**: `#dependencies` `#worktree`

---

## PR #3520: Bun固有APIに依存するcheckerはBunで実行する

- **問題事象**: nodeの型除去経路で配布依存境界checkerを起動すると失敗した。
- **発生局面**: 実装
- **検知方法**: import.meta.pathが未定義になる起動失敗。
- **根本原因**: Bun固有APIへの依存をNodeの実行経路で代替した。
- **自律対応内容**: Bun経路へ切り替えて検査を完了した。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし。既存の安定実行経路契約の適用。
- **横展開観点**: 個別checkerの実行経路選択。
- **再発条件**: Bun依存checkerをNodeから起動する場合。
- **予防策候補**: ランタイム依存を確認してから証跡取得用の起動方法を選ぶ。
- **想定反映先**: checker実行手順。
- **関連**: https://github.com/yogata/agent-dev-flow/pull/3520 の learning 第1項。
- **タグ**: `#bun` `#checker`

---

## PR #3520: 走査件数と違反列を分けて比較する

- **問題事象**: 同じcheckerでも作業領域とmainで走査件数が406対407となった。
- **発生局面**: 実装
- **検知方法**: 検査結果の件数比較。
- **根本原因**: 作業領域には第三者取得Skillが投影されていなかった。
- **自律対応内容**: failuresとhitsで違反を比較し、件数差を環境差として記録した。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: baselineと異なる投影環境の検査。
- **再発条件**: 作業領域とmainで投影状態が異なる場合。
- **予防策候補**: 件数を環境ラベルと併記し、違反列と混同しない。
- **想定反映先**: 検査結果の比較手順。
- **関連**: https://github.com/yogata/agent-dev-flow/pull/3520 の learning 第2項。
- **タグ**: `#baseline` `#scan-scope`

---

## PR #3523: テストのinline宣言とsidecar追加の整合を確認する

- **問題事象**: 既存テストへsidecarで検証対応を追加するとduplicate-inconsistenciesが発生した。
- **発生局面**: 実装
- **検知方法**: 対象行に限定したtraceability check。
- **根本原因**: 既存inline宣言とsidecarの対象集合が一致しなかった。
- **自律対応内容**: inline宣言のない新規テストへ分離し、sidecarを単一情報源とした。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし。既存の宣言集合一致規律の適用。
- **横展開観点**: anchorテストへの要件行追加。
- **再発条件**: 既存inline宣言を確認せずsidecarだけを追加する場合。
- **予防策候補**: テスト配置前に宣言集合を照合する。
- **想定反映先**: traceability宣言登録手順。
- **関連**: https://github.com/yogata/agent-dev-flow/pull/3523 の learning 第1項。
- **タグ**: `#traceability` `#sidecar`

---

## PR #3523: cwd依存テストはリポジトリrootから実行する

- **問題事象**: integrity scripts配下をcwdにした実行で4件のENOENTが発生した。
- **発生局面**: 実装
- **検知方法**: issue_tracking_list.test.tsの失敗とroot起点の再実行。
- **根本原因**: テストがsrc/commonへの相対パスをcwd起点で解決していた。
- **自律対応内容**: 作業領域rootへcwdを合わせ、22テスト合格を確認した。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし。既存の実行形態契約の適用。
- **横展開観点**: 複数packageを含むsuiteの実行位置。
- **再発条件**: scripts配下から相対パス依存テストを実行する場合。
- **予防策候補**: root cwdと./付きパスを記録して実行する。
- **想定反映先**: フルsuite実行手順。
- **関連**: https://github.com/yogata/agent-dev-flow/pull/3523 の learning 第2項。
- **タグ**: `#cwd` `#test-runner`

---

## PR #3523: 依存生成物と新規ファイルによる走査件数差を説明する

- **問題事象**: 配布依存境界checkerの走査件数がbaselineと異なった。
- **発生局面**: 実装
- **検知方法**: 対象集合の比較。
- **根本原因**: vendor生成物の有無と新規テスト追加が対象集合を変えた。
- **自律対応内容**: 件数差の原因を特定し、違反数0と環境ラベルを併記した。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: 依存生成を伴う検査のbaseline比較。
- **再発条件**: vendor生成状態や対象ファイル数が異なる場合。
- **予防策候補**: failuresとhitsを主指標とし、件数差の原因も保持する。
- **想定反映先**: 配布依存境界の検査記録。
- **関連**: https://github.com/yogata/agent-dev-flow/pull/3523 の learning 第3項。
- **タグ**: `#vendor` `#scan-scope`

---

## PR #3524: link投影の対象0件は検査不能として扱う

- **問題事象**: 作業領域でlinkプロファイルの検査対象が0件となりexit1を返した。
- **発生局面**: 実装
- **検知方法**: zero-targets:linkのadapter-failure。
- **根本原因**: 作業領域へSkillのjunction投影が伝播していなかった。
- **自律対応内容**: sourceの作業領域実測とlinkのmain環境参照を分けて記録した。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし。既存のfallback契約の適用。
- **横展開観点**: 投影状態の異なる作業領域の検査。
- **再発条件**: junction未伝播の作業領域でlinkのみを実行する場合。
- **予防策候補**: 対象0件をclean扱いせず、主証拠と環境参照を区別する。
- **想定反映先**: 配布依存境界checkerのfallback運用。
- **関連**: https://github.com/yogata/agent-dev-flow/pull/3524 の learning。
- **タグ**: `#zero-targets` `#junction`

---

## prepare_definition_pr.ts の traceability-check ゲートが case-run/case-ready 段階の未充足（missing-implementation/verification）を含む fail 数で exit 2 を返し、機械工程が failure 終了扱いになる（case-open の正規ゲートは missing-design 0 件）

- **問題事象**: case-open STEP-4 の prepare_definition_pr.ts 実行で、definition-edit・generate_indexes・stage-and-commit・check_integrity がすべて pass した後、traceability-check ステップが exit 2（summary fail=2: missing-implementation / missing-verification）で fail 判定となり、script 全体が exit 1（failure）で終了して proposal PR 本文が空になった。case-open の正規ゲートは missing-design 0 件であり、missing-implementation / missing-verification は case-run（RA 実装）・case-ready（verification 登録）段階の未充足で case-open 段階では必ず未充足になる。coverage --req による design 実測帰着確認（2 件）と併せて意味レビューで継続判断した（Case #3525・PR #3526）
- **発生局面**: 実装（case-open STEP-4 の Definition PR 機械工程。Case #3525〔REQ-061-047/048 新規行追加〕）
- **検知方法**: script 報告 JSON の traceability-check step fail（exitCode 2・summary 空）と、同一コマンドの直接実行による実測 JSON（pass=7 fail=2、fail が missing-design 以外のみ）の突合
- **根本原因**: prepare_definition_pr.ts の traceability-check ステップが exitCode != 0 を一律 fail と扱い、ゲート対象（missing-design 0 件）と check 全体の fail 数（case-run/case-ready 前提の missing-implementation・missing-verification を含む）を区別しないため。PR #3350（REQ-019-003）でも同型の救済（PR 本文への記録と意味レビュー継続）が実施済みの既知パターン
- **自律対応内容**: (1) worktree 内で check --req REQ-061-047,REQ-061-048 を直接実行し missing-design pass・fail 2 件が missing-design 以外であることを実測。(2) coverage --req で design 対応 2 件の実測帰着（case-ready.md:11）を確認し missing-design 0 件ゲート成立を裏付け。(3) push と PR 作成へ継続し、判定根拠を PR 本文の検証差分セクションへ記録
- **ユーザー確認有無**: なし（case-auto 配下は親判断解決へ委譲、本件はゲート成立の実測による継続判断）
- **Decision/REQ/spec影響**: 候補あり（prepare_definition_pr.ts のゲート判定を missing-design のみへ限定する、または --req 対象行の missing-implementation/verification を case-run/case-ready 前提の警告化する恒久対の検討）
- **横展開観点**: REQ 行新規追加を伴う Definition PR では本偏差が毎回発生する（恒久対がない限り再発）。case-ready の Definition 受入でも同型の判定粒度問題が発生し得る
- **再発条件**: REQ 行新規追加（implementation/verification 宣言が case-run/case-ready 以後に確定する行）を伴う case-open STEP-4 の機械工程実行
- **予防策候補**: prepare_definition_pr.ts の traceabilityGate 判定を、stdout JSON の checks.missing-design.status == pass に基づく判定へ変更する（summary 全体の pass/fail でなく）。または入力 JSON へ gate 対象 check 名を明示させる
- **想定反映先**: agentdev-workflow-case-open scripts（prepare_definition_pr.ts）、case-open Design「機械工程の script 呼び出し契約（RU-0162）」節のゲート判定記述
- **関連**: Case #3525・PR #3526・commit d7b462ea、同型救済の先行例 PR #3350（Case #3342・REQ-019-003）
- **タグ**: `#case-open` `#traceability` `#gate-granularity` `#prepare-definition-pr`

---

## Windows git-bash 環境で cmd //c mklink /J がサイレント失敗する（bun -e fs.symlinkSync は確実に動作する）

- **問題事象**: worktree の node_modules 未伝播時に `cmd //c mklink /J` で junction を作成したところ、標準出力にエラーを出さず junction が作成されないサイレント失敗が発生した（Case #3525）
- **発生局面**: 実装（worktree での bun test フル suite 実行前置。Case #3525）
- **検知方法**: lstatSync/realpathSync での junction 実在・参照先確認
- **根本原因**: git-bash 経由の cmd 呼び出しでの mklink /J は環境によりエラーが握り潰される
- **自律対応内容**: `bun -e "fs.symlinkSync(target, path, 'junction')"` へ切替え、作成後に realpathSync で参照先を検証
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の junction 作成手順の実行経路選択の知見）
- **横展開観点**: worktree node_modules 未伝播時の依存整備（junction 作成手順）に mklink 経路のサイレント失敗リスクを記録する価値
- **再発条件**: git-bash 経由で mklink /J を実行する場合
- **予防策候補**: junction 作成は bun -e fs.symlinkSync を標準とし、作成後に lstatSync で symlink 判定を検証する
- **想定反映先**: worktree の依存整備手順（node_modules junction）
- **関連**: Case #3525・PR #3527 の learning 第1項
- **タグ**: `#windows` `#junction` `#mklink` `#worktree`

---

## scripts/self/release 配下のテストは公式 typecheck 対象範囲外であり distribution-boundary tsconfig 相当の strict 指定で既出 strict エラー 14 件が存在する

- **問題事象**: scripts/self/release/wave-composition-purity.test.ts を distribution-boundary tsconfig と同一 strict 指定で typecheck すると、既存コード領域（L122-127・TS-001 系）に strict 系エラー（TS18047/18048/2532/2554）14 件が存在する。HEAD 版を同条件で実行した結果と同一集合・行オフセット対応で既存起因（Case #3525）
- **発生局面**: 実装（QG-4 の typecheck 実行。Case #3525）
- **検知方法**: tsc --noEmit（distribution-boundary tsconfig と同一 strict 指定）の実行
- **根本原因**: scripts/self/release 配下は公式 typecheck 対象範囲外であり strict 指定での検査が未整備
- **自律対応内容**: 新規型エラー 0（既出集合との一致）を確認して継続。型チェック対象範囲の整備は別案件候補として記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の対象範囲設定の事実確認）
- **横展開観点**: typecheck 対象範囲外のテストへ strict 指定で検査する場合、HEAD 版との同一集合比較で新規起因を分離する
- **再発条件**: scripts/self/release 配下を strict 指定で typecheck する場合
- **予防策候補**: 対象範囲の整備（tsconfig 追加または除外の明記）を別案件として検討
- **想定反映先**: typecheck 対象範囲の整備案件（候補）
- **関連**: Case #3525・PR #3527 の learning 第2項
- **タグ**: `#typecheck` `#strict` `#test-scope`

---

## textlint 最終検査の gate fail は worktree と main HEAD の差分実行で本 Case 変更起因の新規 NG 0 件を証明して既知欠陥として分類できる

- **問題事象**: case-close STEP-3 の textlint 最終検査（gate.ts --root worktree --purpose independent）が hard violations 40 件で fail した。検出は prh 訳語表（Definition PR → 設計PR 等）の既存文書 17 ファイルへの違反で、本 Case 変更ファイル 3 件は 1 件も含まない（Case #3525）
- **発生局面**: 実装（case-close STEP-3 textlint-final-check gate。Case #3525）
- **検知方法**: close_mechanical_steps.ts の textlint-final-check step fail（exit 1）と gate.ts 個別再実行の stdout JSON 突合
- **根本原因**: gate は対象 root 全件の拒否対象違反ゼロを合格条件とするため、リポジトリ既存の prh 違反が worktree 指定実行でも検出される
- **自律対応内容**: main HEAD 2b8bcd2 で同条件実行し同一 40 hard・同一 17 ファイルを確認。変更ファイルへの hard 違反 0 件と合わせて fail 由来分類「既知欠陥」を確定し、対応記録コメントの検証差分へ記録して継続
- **ユーザー確認有無**: なし（fail 由来3分類〔既知欠陥・環境依存・当該変更起因〕の契約適用）
- **Decision/REQ/spec影響**: なし（既存の checker 実測契約の適用）
- **横展開観点**: 全件列挙型 gate が既存欠陥で fail する場合、同一条件の base HEAD 実行との差分で新規 NG 起因を分離する
- **再発条件**: 既存文書に拒否対象違反が残存する状態で、worktree root 指定の textlint gate を実行する close
- **予防策候補**: prh 訳語表違反 40 件の恒久対処（別途候補）。または textlint gate への baseline 機構の検討
- **想定反映先**: case-close の textlint 最終検査運用、textlint prh 辞書整備案件（候補）
- **関連**: Case #3525・PR #3527 merge commit f48f2d9a、対応記録コメント（検証差分）
- **タグ**: `#textlint` `#known-defect` `#diff-execution` `#case-close`

---

## 長パスを含む worktree は git worktree remove が Filename too long で失敗するため node fs.rmSync で削除する

- **問題事象**: textlint vendor・node_modules junction を含む worktree（3525-fix）の削除で `git worktree remove` が「Filename too long」で exit 255 失敗。worktree 登録は解除されたがディレクトリが残存した（Case #3525）
- **発生局面**: 運用（case-close STEP-6-1 worktree 削除。Case #3525）
- **検知方法**: git worktree remove のエラー出力と worktree list・ディレクトリ実在確認
- **根本原因**: worktree 内の深いパス（検査ツール配下の依存物等）が Windows MAX_PATH を超過し git 内部の削除が失敗する
- **自律対応内容**: `bun -e fs.rmSync(path, {recursive: true, force: true})` で残存ディレクトリを削除し、削除完了を確認（junction はリンク自体のみ削除され参照先は無傷）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の削除手順の実行経路選択の知見。--force 不使用の原則は変更しない）
- **横展開観点**: worktree remove の Filename too long 失敗時は、worktree list から登録解除を確認してから残存ディレクトリを node 側で削除する
- **再発条件**: Windows 環境で深いパスの依存物を含む worktree を削除する場合
- **予防策候補**: worktree-operations の削除手順へ「remove 失敗時の登録解除確認と node rmSync フォールバック」を明記する価値
- **想定反映先**: agentdev-git-worktree references worktree-operations.md（削除失敗時の対処）
- **関連**: Case #3525・merge commit f48f2d9a
- **タグ**: `#worktree` `#windows` `#long-path` `#cleanup`

---

## prepare_definition_pr の definitionEdits は既存ファイル置換のみを支持し新規ファイル作成（REQ create OU）を表現できない

- **問題事象**: case-open STEP-4 の機械工程 script（prepare_definition_pr.ts）の definitionEdits は「対象パス・旧文・新文の完全一致一意指定」であり、新規 REQ ファイルの作成（ACT-REQ-001 operation: create）を直接表現できない。worktree 内 readTextFile 失敗が definition-edit fail になる
- **発生局面**: 運用（case-open STEP-4。Case #3530 の REQ-103 新設）
- **検知方法**: script 入力契約（DefinitionEdit 型）と applyDefinitionEdit の実装確認
- **根本原因**: 機械工程 script の編集プリミティブが置換系のみで create 系の表現を持たない
- **自律対応内容**: worktree 作成と新規ファイルの内容適用をモデル側の Definition Package 適用として実施し、script 呼び出しは既存 worktree 再利用（期待 branch 上）+ definitionEdits 空 + stage/commit/generate_indexes/check_integrity/traceability ゲート実行に使用した。全ゲート成功を script 報告 JSON で確認
- **ユーザー確認有無**: なし（機械工程の実行経路選択。ゲート省略なし）
- **Decision/REQ/spec影響**: なし（case-open Design「機械工程の script 呼び出し契約」の動作範囲の知見。契約変更は別途候補）
- **横展開観点**: create 系 OU を含む Definition Package では、worktree+ファイル適用をモデル側で行い script に検証・commit を担わせる構成が現行の現実解
- **再発条件**: operation: create の artifact_action を含む draft で prepare_definition_pr.ts を definitionEdits 主体で実行する場合
- **予防策候補**: prepare_definition_pr への create 系編集（新規ファイル contents）の入力表現追加（別途候補）
- **想定反映先**: agentdev-workflow-case-open scripts README または Design「機械工程の script 呼び出し契約」節
- **関連**: Case #3530・PR #3531
- **タグ**: `#case-open` `#definition-pr` `#script-contract`

---

## 新規 REQ の Definition PR では missing-design 0 件ゲートのため design 役割宣言の割当てが発生する（draft に design アクションが無くても）

- **問題事象**: REQ-103 新設の Definition PR で、traceability check の missing-design 0 件ゲート（増分ベース・新規行のみ）のため、draft の artifact_actions に design アクションが存在しないまま 31 行の design 役割宣言の割当て先決定が必要になった
- **発生局面**: 運用（case-open STEP-3/STEP-4。Case #3530）
- **検知方法**: traceability check --req（新規行限定）の missing-design findings と case-open reference（definition-pr-and-idempotency.md 手順4）の突合
- **根本原因**: 新規 REQ 行は作成時点で design 対応宣言を持たず、ゲートは宣言追随を Definition Package 構成要素として要求する。割当て先の決定は各行の主題ドメイン→既存 Design の対応判断を伴う
- **自律対応内容**: 各要件行の主題ドメインが現時点で正規所有する Design 文書へ design 役割 ADF-COVERS 宣言を 1 行追記（11 ファイル・修飾注記付き。REQ-100/101/102 の先行例と同型）。宣言は全面再評価（REQ-103-016/-017）の処遇確定時に参照追随で更新する旨を PR 本文の判断記録へ明記
- **ユーザー確認有無**: なし（ゲート契約の機械的要求への追随。新規規範確定は含まない）
- **Decision/REQ/spec影響**: なし（既存ゲート契約の適用）
- **横展開観点**: 新規 REQ を含む draft の case-open では、design 宣言割当ての作業分量を見積もりに含めるべき。行数が多い REQ では複数 Design への分割割当てが自然に発生する
- **再発条件**: 新規 REQ（複数行）の Definition PR を作成する場合
- **予防策候補**: req-define の draft 段階での design 対応先行確認（任意）または case-open Design への割当て手順の明文化
- **想定反映先**: case-open Design「意味変更行の design 対応事前確認」節（新規行版の割当て手順）
- **関連**: Case #3530・PR #3531
- **タグ**: `#traceability` `#missing-design` `#definition-pr`

---

## 先行 merge が main の check_integrity を赤化したまま Case 投入が進行し Definition PR の品質ゲートで初検出される

- **問題事象**: f48f2d9a（#3527 マージ）で追加された skill 参照ファイル内の repo-root scripts/ パス参照（wave-composition-purity.test.ts）が、skill 相対解決では到達不能なため reference-path-existence NG として main に残存。Case #3530 の Definition PR の check_integrity ゲート（commit 済み HEAD 実行）で初めて block として顕在化した
- **発生局面**: 運用（case-open STEP-4 品質ゲート。Case #3530）
- **検知方法**: prepare_definition_pr.ts の check_integrity step fail（exit 1、2 new unmanaged NG）とレポートの ReferencePath NG 確認
- **根本原因**: Case 投入〜merge 時の検査が当該 NG を検出しないまま main に取り込まれ、次の Definition 系 PR の commit 後実行ゲートで初めて delta NG として顕在化する
- **自律対応内容**: 本 Case の変更対象外であることを確認した上で、provenance（issue-3527-commit-f48f2d9a-case-3530-definition-pr）付きで ng-baseline.json へ一時吸収し、参照形式の是正を本 Case の case-run（RA-002 領域）で実施する計画を PR 本文の判断記録へ記録。ゲート通過後の実測で exit 0 を確認
- **ユーザー確認有無**: なし（既存 baseline 機構の provenance 付き適用。v2:REQ-0161-005 の manifest 契約どおり）
- **Decision/REQ/spec影響**: なし（既存 NG baseline 機構の適用）
- **横展開観点**: merge 前検査で coverage が無い検査系（commit 後実行を要する frontmatter 突合系等）の NG は次の Definition PR まで潜在する。全件列挙型 gate の fail は「既知欠陥・環境依存・当該変更起因」の3分類で分離する運用が有効
- **再発条件**: commit 済み HEAD 前提の検査項目が、merge 時点では実行されない経路で新規 NG を持ち込む場合
- **予防策候補**: Definition 系 PR の前置で base HEAD との同条件差分実行（既知欠陥分離）の検討
- **想定反映先**: case-open / case-ready の品質ゲート運用、check_integrity の baseline 運用
- **関連**: Case #3530・PR #3531・先行 commit f48f2d9a
- **タグ**: `#check-integrity` `#ng-baseline` `#pre-existing-defect` `#definition-pr`

---

## worktree では textlint final gate が vendor 未伝播で fail-closed 停止するため plugin package 本体実体から --root <worktree> 指定で実行する

- **問題事象**: worktree 環境で textlint final gate（gate.ts --purpose final）を実行すると、`.opencode/plugins/agentdev-textlint-guard/vendor/`（engine bundle・kuromoji 辞書）が worktree に未伝播のため fail-closed 停止した
- **発生局面**: 実装（case-run の textlint 最終検査。Case #3532・Epic #3530 Wave 1）
- **検知方法**: gate 実行時の vendor 欠落検知による fail-closed 停止
- **根本原因**: worktree junction 未伝播の構造的制約が plugins 系 vendor 生成物にも適用される（既存規律の worktree junction 未伝播と同型）
- **自律対応内容**: plugin package 本体実体（メインリポジトリ）から `--root <worktree>` を指定して実行し検査を完了した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の fallback 契約と同型の構造的制約の適用）
- **横展開観点**: `agentdev-git-worktree-test-fallback` が扱う src/ 構造系テスト fallback の対象範囲と同型であり、分類・恒久化の候補
- **再発条件**: worktree で plugins 系 vendor 依存 checker を実行する場合
- **予防策候補**: plugins 系 vendor 依存 checker の worktree fallback 分類と恒久化の検討
- **想定反映先**: agentdev-git-worktree-test-fallback の対象範囲分類、textlint gate 運用
- **関連**: PR #3539 の learning 第1項
- **タグ**: `#textlint` `#worktree` `#vendor` `#fallback`

---

## close_mechanical_steps pre-merge の integrityGates 報告は exitCode のみで stdout/stderr 証跡を退避しないため fail 由来分類と件数突合の証跡は実行側で退避が必要

- **問題事象**: case-close STEP-3 の full integrity suite（bun test 3 分割）を close_mechanical_steps pre-merge で実行したところ、分割③で 1 件のテスト timeout が検出されたが script 報告 JSON は各 gate の exitCode のみを記録し、fail 明細・件数サマリー（「Ran N tests across M files」）・stdout/stderr を保存しなかった。機械受理基準の必須記録（件数突合、fail 全件の由来分類の証跡）を生成するため、3 分割を stdout/stderr 分離退避付きで再実行した
- **発生局面**: 実装（case-close STEP-3 機械工程。Case #3532・Epic #3530 Wave 1）
- **検知方法**: 報告 JSON の full-integrity-suite step（exitCode 集約のみ）と機械受理基準の記録要件（件数突合・fail 由来分類）の突合
- **根本原因**: script の StepRecord detail が exitCode 集約のみで、非ゼロ exit 時の由来分類に必要な fail 明細と件数サマリーの証跡退避を報告契約が含まない
- **自律対応内容**: 正当理由「証跡欠落」で 3 分割を stdout/stderr 分離退避付きで再実行。分割③ 初回 timeout 1 件（「配布物の具体参照排除（RA-003、TS-004）」）を単独再実行（pass・13/1・2.49 秒）→ 分割③ フル再実行（fail 0・654/39）で解消し、実行形態由来（suite 内負荷相互作用）と分類して由来不明 0 件を確定した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: 候補あり（close_mechanical_steps の integrityGates 報告へ stdout/stderr 退避先指定・件数サマリー抽出の追加検討）
- **横展開観点**: exit code が意味を持つ検証コマンドの機械工程実行では、非ゼロ exit 時の由来分類に必要な明細の退避を実行経路に含める
- **再発条件**: full integrity suite で fail が発生する close 実行
- **予防策候補**: close_mechanical_steps 側への証跡退避機能追加（または script 入力へ退避先指定の追加）
- **想定反映先**: agentdev-workflow-case-close scripts（close_mechanical_steps.ts の報告契約）
- **関連**: Case #3532・merge commit b84b623e
- **タグ**: `#case-close` `#full-suite` `#evidence-preservation` `#fail-classification`

---

## bun test 既定 timeout 5 秒の suite 内負荷相互作用 timeout が Wave 1・Wave 2-2 の 2 Case 連続で再現（単独実行は常に pass）

- **問題事象**: full integrity suite 分割③（`bun test ./.opencode/plugins/ ./scripts/`）で「配布物の具体参照排除（RA-003、TS-004）」テストが Wave 1（#3532）と Wave 2-2（#3534）の 2 Case 連続で timeout fail となった。Wave 1 は 1 回、Wave 2-2 は 2 回のフル再実行を経て 3 回目で fail 0 に解消。同一テストの単独再実行は両 Wave とも pass（2.3〜2.5 秒）で、suite 下の実測（5.2〜5.6 秒）が bun test 既定 timeout（5 秒）をわずかに超えるだけの余裕不足
- **発生局面**: 検証（case-close STEP-3 full integrity suite。Epic #3530 Wave 1・Wave 2-2）
- **検知方法**: 分割③ 実行の fail 検出と fail 由来分類手順（単独再実行 → フル再実行）
- **根本原因**: 該当テスト（エンジン配布ファイルの解析）の実行時間が suite 内の並列負荷で約 2 倍に増幅され、既定 5 秒 timeout に対する余裕が非決定的に尽きる。検査対象はテストで明示的な timeout 設定を持たず、suite 側の負荷相互作用に対する耐性が設計されていない
- **自律対応内容**: fail 由来分類手順に従い単独再実行（pass）→ フル再実行を繰り返し、3 回目のフル再実行で fail 0 を取得して実行形態由来として解消。各実行の stdout/stderr を分離退避し由来不明 0 件を確定した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: 候補あり（該当テストへの明示 timeout 設定の引き上げ、または該当テストの単独分割実行の恒久化検討）
- **横展開観点**: suite 内で重い解析を行うテストは既定 timeout の非決定的超過を避けるため明示 timeout を持つべき。単独実行 pass でも suite 実行で timeout するテストは負荷相互作用として恒常的に再現し得る
- **再発条件**: 該当テストを含む full integrity suite 分割③ の実行
- **予防策候補**: 該当テストへの明示 timeout 設定（例: 30 秒）、または heavy 解析テストの分割③ 内での先行実行
- **想定反映先**: scripts/self/case-intake-cross-inspection/workflow_body_contract.test.ts、bun test フル suite 正規形（実行形態契約）の注記
- **関連**: Case #3534・merge commit 336095b6・Wave 1 の同一テスト timeout 記録（#3532 対応記録コメント）
- **タグ**: `#bun-test` `#timeout` `#full-suite` `#flaky` `#fail-classification`

---

## PR 本文検証差分の textlint hard 件数申告は件数突合の根拠にならない（集合差分での同一性判定が必要）

- **問題事象**: case-close STEP-3 の textlint final gate で worktree hard 実測 40 件を取得したが、case-run が PR 本文検証差分に申告していた件数は 36 件で不一致。実行条件（同一 branch HEAD 7b0505de・同一規則構成）で件数が異なるため、申告件数単体では既知違反の同一性を判定できなかった
- **発生局面**: 検証（case-close STEP-3 textlint 最終検査の由来判定。Case #3534・Epic #3530 Wave 2-2）
- **検知方法**: gate 実測 JSON（path:line:column:ruleId の hard findings 集合）と PR 本文申告件数（36 件）の突合
- **根本原因**: 件数は集計時点・cache 状態・severity 抽出方法の差で変動し得る一方、検証差分の記録が件数を同一性の根拠として扱いやすい。集合の同一性判定には要素レベルの突合が必要だが、件数申告だけでは再現できない
- **自律対応内容**: worktree 側と main 側の gate を両方実行し、hard findings を path:line:column:ruleId 鍵で集合差分突合（新規 0 件・除去 0 件の完全一致）を取得。件数差（36 vs 40）は集計差と判断し、集合差分による新規 0 件の判定を本実行で確定した。変更ファイル内の 1 件（case-auto SKILL.md 105 行 prh）は diff hunk 外の既存行で変更行由来 0 件も併せて確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の検証差分記録規約は集合差分判定と矛盾しない。記録様式の補強候補）
- **横展開観点**: 検証差分の「違反件数」を記録する場合は集合（要素キー）の同一性判定と併記する。件数のみの申告は close 時の由来判定を失敗させ得る
- **再発条件**: 変更行由来 0 件を件数突合だけで判定する close 実行
- **予防策候補**: textlint gate の JSON 実測（hard findings 集合）の退避を検証差分の証跡チャネルに含める
- **想定反映先**: PR 本文テンプレートの検証差分セクション記録様式（textlint 行）、agentdev-workflow-templates
- **関連**: Case #3534・merge commit 336095b6
- **タグ**: `#textlint` `#evidence-preservation` `#verification-diff` `#case-close`

---
