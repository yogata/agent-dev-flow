# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## case-open の yomiyasu 適用記録が PR 上への投稿漏れとなり case-ready 受入前置確認で検出される

- **問題事象**: case-open STEP-4 完了条件に「PR 作成直後に yomiyasu 適用記録（対象・実施結果・保持した指摘理由の最小限記録）を PR 本文（検証欄等）または PR コメントへ記録する」が存在したが、実行時には learning inbox への個別記録のみを行い PR 上への記録投稿が漏れていた
- **発生局面**: 実装（case-ready STEP-1 受入前置確認。Root Case #4126・PR #4127）
- **検知方法**: case-ready の project extension acceptance_gates 前置確認（「PR の差分に docs/** の日本語文章変更を含む場合、当該変更文章への yomiyasu 適用記録が PR 上に存在すること。不足時はマージを行わず」）。PR 本文・コメント一覧に記録が存在しないことを comment_list 実測で検出
- **根本原因**: case-open 側で適用事実の永続記録（learning inbox・修正 commit 55df9dc89）は行われたが、STEP-4 完了条件の「PR 上への記録存在」検証が完了判定に組み込まれていなかった
- **自律対応内容**: case-open 時の適用事実を learning inbox 記録（commit 46b875c56）と修正 commit 55df9dc89 から確認し、PR へ最小限の yomiyasu 適用記録コメントを1件投稿（comment_create、commentId 6952760380）して前置確認を成立させた後、merge を実行した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の記録様式〔agentdev-workflow-lifecycle「文章品質・書込み規約」節〕の適用。記録のためだけの再帰的コメント投稿は1件に限定）
- **横展開観点**: 受入側 acceptance_gates が前工程の記録漏れを fail-closed で検出する構造は機能した。記録の本体（適用事実）と記録の提出先（PR 上）が分離していると提出漏れが起きる。工程完了判定には「記録の投稿先に存在する」ことの実測（comment_list・PR 本文検索）を含める
- **再発条件**: case-open が learning inbox への記録のみで工程を完了扱いにした場合
- **予防策候補**: case-open STEP-4 の完了判定に「PR 上への記録存在」の機械確認（comment_list と PR 本文への記録検索）を組み込む
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md「PR 作成」節 5番（yomiyasu 適用記録）
- **関連**: Issue #4126・PR #4127
- **タグ**: `#文章品質` `#工程契約`

## prepare_definition_pr.ts 冪等再実行時 nothing-to-commit で後続ゲートが実行されない

- **問題事象**: 設計PR 機械工程の複数回再実行（IR-067 phantom 解消・計測日収束の反復修正）の最終段で、worktree が clean（全編集 commit 済み）の状態で script を再実行すると stage-and-commit step が nothing-to-commit で exitCode 1 となり、check_integrity と traceability check が実行されない
- **発生局面**: 実装（case-open STEP-4 機械工程・冪等再実行。Root Case #4126・PR #4127）
- **検知方法**: script 報告 JSON の stage-and-commit step の stderrTail「nothing to commit」と exitCategory failure
- **根本原因**: script の stage-and-commit は変化の有無を判定せず git commit を無条件実行する設計で、適用済み完了状態（definitionEdits 空・全対象 commit 済み）の再実行を commit fail として扱う
- **自律対応内容**: 適用済み工程を報告 JSON と git 状態から確認した上で、commit 済み HEAD に対するゲート2種（check_integrity・traceability check）を同一実行形態（main root 実体 + --root worktree root）で手動実行し、証拠を検証記録へ保存（GATE_ALTERNATIVE_ROUTES の manual-equivalent-procedure）。ただし REQ frontmatter updated 進行に伴う req-metrics 派生物の再生成が残存していた回は、派生物を stagePaths に含めた再実行で script 正規経路を維持した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（正規代替経路の適用。script 契約の変更は行っていない）
- **横展開観点**: 大規模 Definition 変更（27 REQ・複数宣言追随）では phantom・freshness の反復修正が発生し、script の冪等再実行が commit 対象空に到達する。再実行前に git status で worktree clean を確認するのが常規点
- **再発条件**: 機械工程の反復修正を含む大規模 Definition 変更で script を複数回再実行した場合
- **予防策候補**: script の stage-and-commit が stage 対象空のとき適用済みとして報告するか、commit 不要モードを入力契約へ提供する
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（stage-and-commit step）
- **関連**: Issue #4126・PR #4127
- **タグ**: `#機械工程` `#worktree`

## 大規模 DefinitionEdit の機械組立では verbatim 突合による追加適用と挿入位置の構造確認が必須

- **問題事象**: 49 edit の DefinitionEdit 入力を機械組立 script で構成した際、(1) REQ-002 の参照置換 edit を組立対象から漏らした、(2) design-principles.md の 0節挿入 edit の oldBlock が「## 1.」見出し行までを含み、0節が 1節見出しの直後に挟まる構造破損を生んだ。いずれも機械工程のゲートは通過する（REQ-002 は意味変更なしの文言差のみ、0節は見出し順序の機械検査対象外）
- **発生局面**: 実装（case-open STEP-4 機械工程・DefinitionEdit 入力 JSON の組立。Root Case #4126・PR #4127）
- **検知方法**: (1) は artifact_actions 適用後の verbatim 包含突合（REQ-030-027）で文言の未包含として検出し commit 916ae7052 で追加適用。(2) は 0節の yomiyasu lint の対象抽出失敗を契機に design-principles.md を再読込し、見出し構造の実確認で検出して 0節を 1節の前に移動する修正 commit（55df9dc89）で解消
- **根本原因**: 組立 script の編集リストが draft の artifact_actions 全件を機械的に網羅する構成でなく、target 接頭辞による手動列挙だった。挿入系 edit の anchor は行番号ベースの slice で構成し、末尾行が見出し行に一致する場合の構造検証を持たなかった
- **自律対応内容**: verbatim 突合の FAIL 項目を修正 edit として追加適用し、0節の位置を移動修正。両者を同一 PR 内の追加 commit で確定した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（verbatim 突合と適用直前照合の既存規律が機能した）
- **横展開観点**: verbatim 突合（REQ-030-027）は組立漏れの検出器として実効的に機能した。挿入系 DefinitionEdit の newText は anchor 先頭から oldBlock を切り出し、末尾に見出し行を含めない設計が望ましい。ゲートを通過した PR でも文書構造の実確認（見出し順序・前後節の整合）は人間側確認に値する
- **再発条件**: artifact_actions 数が多い Definition 変更を機械組立 script で構成した場合
- **予防策候補**: 組立 script で draft の artifact_actions ID 列挙と edits 数の機械突合を実施する。挿入系 edit の行構造事前確認に「oldBlock 末尾が見出し行でないこと」の検証を追加する
- **想定反映先**: case-open STEP-4 の DefinitionEdit 組立手順・src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（validateEditLineStructure）
- **関連**: Issue #4126・PR #4127
- **タグ**: `#機械工程` `#組立`

## 大規模 checker 手術では削除対象スクリプトを import / copyFileSync / fixture から逆方向 grep で先に列挙してから削除する

- **問題事象**: 削除対象 checker・スクリプトの一括削除後に、テスト側の copyFileSync（削除済みファイル参照）・fixture YAML copy が残存し、テスト実行で失敗を生む。sed 的な一括削除では削除対象の依存方向（誰が import しているか・誰が copy しているか）が追跡されない
- **発生局面**: 実装（Epic #4126 Wave-1 子 Issue #4131 OU-004 Phase 4・integrity checker 群の簡素化。PR #4136）
- **検知方法**: bun test 全件実行（3分割正規形）での削除済みファイル参照 fail。walk_enumeration_contract.test.ts から check_retired_artifact_residual 参照が残存
- **根本原因**: 削除対象スクリプトの依存方向（import・copyFileSync・fixture 参照）の列挙を削除前に実施していなかった
- **自律対応内容**: 削除対象を import / copyFileSync / fixture から逆方向 grep で列挙し直し、残余参照を同一 PR 内で除去（walk_enumeration_contract.test.ts から check_retired_artifact_residual 参照除去）して再実行で全件 pass を確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 大規模削除では「削除対象を消す」より「参照側から削除対象を見つける」が効率的。bun test 全件 PASS は残余参照の発見手段として実効的だが、事前の逆方向列挙で fail を0件化できる
- **再発条件**: checker・スクリプト・fixture を跨ぐ依存を持つファイルの大規模削除を実行した場合
- **予防策候補**: 削除対象ファイル名を引数に import/copyFileSync/fixture 参照を一括 grep する前置手順を case-run の削除系委譲契約へ追加
- **想定反映先**: case-run 委譲契約（削除系変更の前置手順）
- **関連**: Issue #4126・#4131・PR #4136
- **タグ**: `#削除系変更` `#bun test`

## bun test の describe 構造の cuts は行レベルの深さ追跡で閉じを検証する

- **問題事象**: describe ブロックの削除（機械手術）で閉じ括弧の対応が崩れ、Unexpected end of file を2回発生させた。行レベルの文字列置換ではネストした describe の深さが追跡されない
- **発生局面**: 実装（Epic #4126 Wave-1 子 Issue #4131 OU-004 Phase 4・回帰テストと checker テストの describe cuts。PR #4136）
- **検知方法**: bun test 実行時の Unexpected end of file（構文エラー）
- **根本原因**: describe ブロック削除を開始行と終了行の文字列突合だけで実施し、ネスト深さの追跡がなかった
- **自律対応内容**: 行レベルの深さ追跡で describe の閉じを検証する手順へ切替し、cuts 後の構文確認を bun test で実施
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: テストファイルの機械手術（describe 統合・削除）では、構文エラーがテスト実行まで顕在化しない。cuts 直後に syntax-only で閉じ検証するのが低コスト
- **再発条件**: describe 構造の機械的な cuts・統合を複数箇所へ適用した場合
- **予防策候補**: describe cuts の前置に開始行・終了行の深さ一致検証を組み込む
- **想定反映先**: case-run 委譲契約（テストファイル手術の前置手順）
- **関連**: Issue #4126・#4131・PR #4136
- **タグ**: `#bun test` `#機械工程`

## worktree 内では .opencode junction 未伝播により traceability checker を相対パス起動できず、main root 実体から --root 指定で実行する（既出記録あり・本 entry は重複統合対象）

- **問題事象**: worktree 内の .opencode/ には agentdev-* junction が伝播しないため、agentdev-traceability checker を worktree 内の相対パスで起動できない。また node ランナーでは Bun.YAML が未定義のため sidecar 解析が擬似 findings（malformed-declarations 全件）を出す
- **発生局面**: 実装と case-close 検証（Epic #4126 Wave-1 子 Issue #4130 OU-003 Phase 3 と Wave-1 境界クローズ。PR #4134）
- **検知方法**: worktree 実行での scan 対象欠落（擬似 findings）。既出: PR #4127 テスト結果セクションに同一実行形態の記録あり
- **根本原因**: worktree 構造的制約（agentdev-git-worktree references）と checker 実行ランナー（bun 必須）の前提が checker 実行手順に機械的に組込まれていない
- **自律対応内容**: main root 実体から `--root <worktree root>`（Windows 形式絶対パス・forward slash 記法）を指定する実行形態（PR #4127 と同一）を採用。ランナーは bun で統一
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（worktree 構造的制約の既存契約の適用）
- **横展開観点**: junction 未伝播環境での checker 実行は main root 実体＋--root 指定が正規形。ランナーの言語実装依存（Bun.YAML）も checker 実行の前置確認対象（node で起動すると擬似 findings で誤判定する）
- **再発条件**: worktree 環境で junction 系 checker を起動した場合、または bun 以外のランナーで Bun.YAML 依存 checker を起動した場合
- **予防策候補**: checker 実行契約にランナー前置確認（bun 統一・Bun.YAML 依存明記）を追記する
- **想定反映先**: checker-execution-contracts Design（安定実行経路節）・agentdev-git-worktree references（worktree 構造的制約）
- **関連**: Issue #4126・#4130・PR #4134・PR #4127
- **タグ**: `#worktree` `#checker実行`


## artifact × role の対応宣言は同一論理関係の単一情報源契約に従い inline 側へ追記する（inline と sidecar の混在は duplicate-inconsistencies で機械検出される）

- **問題事象**: 既存 inline 宣言を持つ Design へ design 宣言を sidecar に新規追加すると、traceability check が duplicate-inconsistencies（inline と sidecar の宣言矛盾）として検出する
- **発生局面**: 実装（Epic #4126 Wave-2 子 Issue #4132 OU-005 Phase 5・missing-design 13行の design 対応移管。PR #4137）
- **検知方法**: traceability check の duplicate-inconsistencies（機械検出。本 PR で実検出あり）
- **根本原因**: artifact × role の対応宣言の情報源判断（inline と sidecar の単一情報源契約）が対応宣言追加手順に機械的に組込まれていなかった
- **自律対応内容**: 既存 inline 宣言を持つ Design（operating-model.md・traceability-model.md・quality-gate-model.md）への design 宣言追加は inline 側へ追記する形へ修正し、新規 sidecar（ra010-traceability-modernization.yaml）は inline 宣言を持たない対象のみへ配置。実装後の traceability check で duplicate-inconsistencies 0件を機械検証
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の単一情報源契約の適用）
- **横展開観点**: 対応宣言の追加は「当該 artifact に inline 宣言が既存するか」を前置確認し、inline 既存なら inline 側追記・inline 未存在なら sidecar 追加が正規経路。情報源混在は機械検出されるが事前判断で防げる
- **再発条件**: 対応宣言（design/implementation/verification）の追加を inline と sidecar のどちらへ行うか判断する場合
- **予防策候補**: 対応宣言追加手順に「inline 宣言既存確認の前置」を組み込む
- **想定反映先**: agentdev-traceability（check・宣言追加手順）・traceability-model Design（単一情報源契約節）
- **関連**: Issue #4126・#4132・PR #4137
- **タグ**: #トレーサビリティ #宣言追加\n