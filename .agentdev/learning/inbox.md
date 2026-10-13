# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---
## 並行 case-open 実行下で共通 Jev 観測の先行 commit が兄弟 Case に先取され commit メッセージと実体が乖離した

- **問題事象**: case-open STEP-1 の先行明示パス commit で、draft と共通 Jev 観測（Batch 単位観測 2件）を add 後に commit したところ、commit 実体は draft のみ（1 file）で、メッセージ「RU-0210 由来 draft と req-define Jev 観測を永続化」と乖離した。Jev 観測 2件は並行兄弟 Case（RU-0208 由来、commit 8f224096）が先に commit しており、本 Case の commit 実行時点で既に tracked だった
- **発生局面**: 実装（case-open STEP-1 引き継ぎ判定。並行 case-open 委譲実行）
- **検知方法**: commit 後の git show --stat と git ls-files による実体確認（1 file changed と ls-files 登録の突合）
- **根本原因**: 複数の並行 Case が同一の Batch 単位 Jev 観測ファイルを消費対象として検出・commit する構造のため、add と commit の間に兄弟 Case の commit が挟まると、自 Case の commit pathspec から対象が外れる race 状態になる。先行 commit 手順は add 直後のステージ実体確認を含まない
- **自律対応内容**: commit 実体を git show --stat / git ls-files で確認し、Jev 観測は兄弟 Case の commit（8f224096）で既に永続化済みであることを確認して受け入れた。amend によるメッセージ修正は並行 push 競合の危険があるため実施せず、乖離を WARNING 記録として残した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: Batch 単位の共通観測を複数 Case が消費する構成では、commit 実行直前にステージ内容（git diff --cached --stat 等）とメッセージの一致を確認する運用が同種 race 全般に有効
- **再発条件**: 並行 case-open で同一 Jev 観測（Batch 共通観測）を複数 Case が検出・commit 対象に含め、一方が先に commit した場合
- **予防策候補**: 先行明示パス commit 手順に、commit 実行直前のステージ実体確認（git diff --cached --name-only と意図対象の突合）と、実体が空になった対象の除外を組込む。あるいは共通観測の検出時に既に tracked な分を add 前に除外する
- **想定反映先**: case-open スキル reference（handoff.md の先行 commit 手順）または learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、commit 9f7c8ffe（draft のみ）、commit 8f224096（兄弟 Case による Jev 観測 commit）、Issue #3678
- **タグ**: `#case-open` `#git` `#並行実行`

## prepare_definition_pr の check_integrity gate が base 起因の既存債務で fail した場合の対照救済と残ゲート消費の手順が reference にない

- **問題事象**: case-open STEP-4 の prepare_definition_pr 実行で、自 Case 変更と無関係の既存債務（base revision 起因の NG 16件）により check_integrity gate が exit 1 で fail し、後続抑止により traceability gate が未実行のまま script が終了した。設計PR 作成は失敗ではなく、手順上の扱いが reference に定義されていなかった
- **発生局面**: 実装（case-open STEP-4 機械工程の script 呼び出し。並行 case-open 委譲実行）
- **検知方法**: script 報告 JSON の step status（check_integrity: fail、exitCode 1、NG 明細）と、NG 16件の全件が本 Case 対象ファイル外（phase 系 skill・system.md 同期・frontmatter 鮮度）であることの突合
- **根本原因**: check_integrity はコーパス全体の既存債務を検出するため、base で既に NG があると本変更起因でなくても必ず fail する。traceability gate 判定仕様には対照救済（worktree HEAD と main HEAD の両方で check を実行し findings 完全一致を機械証明）の規定があるが、check_integrity 向けの対照救済と、後続抑止で止まった残ゲート（traceability check）の消費手順は reference（definition-pr-and-idempotency.md）に明文化されていない。script は one-shot 設計のため、再実行すると definitionEdits の再適用（旧文不在失敗）になる
- **自律対応内容**: base revision（branch 作成元 origin/main HEAD）の detached worktree で check_integrity を再実行し、NG findings 16件が完全一致・差分 0 件であることを機械証明して本変更起因の検出悪化 0 件を根拠づけ（traceability gate 判定仕様の対照救済を準用）、証拠を PR 本文へ記録した。残ゲートは消費関数 consumeDefinitionTraceability（script lib の単一実装）を checker 実行結果へ直接適用して判定（pass=11 fail=0、deferred なし）し、報告 JSON の check_integrity 提案本文「check_integrity: 本 script 実行内で成功」を意味レビューで訂正して PR 作成可と判断した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存契約の準用。手順の明文化は learning-promote での判断に委ねる）
- **横展開観点**: コーパス全体を検査する必須ゲート（check_integrity、docs-check 等）を Case 専用 machine 工程で実行する構成全般に、base 対照による既存債務分離と、後続抑止時の残ゲート消費手順（単一実装の消費関数の直接適用）が同様に適用可能
- **再発条件**: Case 変更と無関係の既存 NG が base に存在する状態で、prepare_definition_pr 等の one-shot machine 工程 script がコーパス全体検査を実行する場合
- **予防策候補**: definition-pr-and-idempotency.md へ、check_integrity gate の対照救済手順（base 対照の実施方法・証拠の PR 記録）と、後続抑止時の残ゲート消費手順（lib 消費関数の単一実装適用、definitionEdits 再適用の回避）を明文化する。あるいは script 側で base 対照比較を内蔵し報告に含める
- **想定反映先**: case-open スキル reference（definition-pr-and-idempotency.md の gate 判定仕様節）または prepare_definition_pr script の拡張。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、PR #3687、Issue #3679、scripts/lib/definition-traceability-gate.ts、Issue #3684（phase 系 NG の処遇 Case）、Issue #3675（frontmatter 鮮度 NG の処遇 Case）
- **タグ**: `#case-open` `#machine-gate` `#対照救済`


## REQ 行追加時に docs/README.md 手動管理区間の要件件数記述が追随漏れし req-range-staleness NG を生む

- **問題事象**: REQ-112 追加の Definition 変更（case-open STEP-4 機械工程）で、generate_indexes は docs/README.md の AUTOGEN ブロック（readme-req-summary-count 等）を 70 件へ更新したが、AUTOGEN 外の手動管理区間の散文記述「現行要件は69件である。」は更新対象外のため 69 が残留し、check_integrity gate が req-range-staleness NG（states 69 active REQs but actual count is 70）で exit 1 fail した。あわせて REQ 行数 AUTOGEN 派生物 docs/designs/quality/req-health-metrics.md が stagePaths 事前包含不能（契約上標準 contingency）で補正 commit を要した
- **発生局面**: 実装（case-open STEP-4 機械工程の script 呼び出し後の check_integrity gate。並行 case-open 委譲実行）
- **検知方法**: prepare_definition_pr 報告 JSON の step status（check_integrity: fail、exitCode 1）と NG 明細の req-range-staleness 行
- **根本原因**: active REQ 件数の記述が docs/README.md に AUTOGEN 対象ブロックと手動管理区間（AUTOGEN 外散文）の2箇所存在し、手動区間は generate_indexes が更新しない。REQ 追加 Case の Definition 編集対象に手動区間が含まれず、REQ 行数 AUTOGEN 派生物も stagePaths へ事前包含できない契約のため初回 gate で必ず不整合が顕在化し得る
- **自律対応内容**: worktree 内 docs/README.md 手動区間を 70 へ修正し、req-health-metrics.md とともに明示パス指定の補正 commit（Ref: #3681 commit e43bb977）。worktree HEAD / main HEAD の対照再検査で本変更起因の検出悪化 0 件を機械証明し PR #3690 を作成
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（手順の明文化は learning-promote での判断に委ねる）
- **横展開観点**: REQ 行追加（active REQ 件数変化）を伴う全 Definition 変更 Case に同様に適用可能。docs/README.md 以外にも手動管理区間の件数記述が存在する文書（requirements/README.md の req-active-count は AUTOGEN 対象）がないかの棚卸しが価値を持つ
- **再発条件**: REQ 行追加を伴う Definition 変更で docs/README.md の手動管理区間を編集対象に含めない場合
- **予防策候補**: definition-pr-and-idempotency.md に REQ 追加 Case の Definition 編集対象へ docs/README.md 手動管理区間（「現行要件は N 件である」）の追随を含める手順を明文化する。prepare_definition_pr script の stagePaths 既定値へ REQ 行数 AUTOGEN 派生物（req-health-metrics.md、docs/README.md、requirements/README.md）を REQ 追加 Case 向けに予見的に含める拡張も候補
- **想定反映先**: case-open スキル reference（definition-pr-and-idempotency.md の stagePaths・派生物 contingency 手順節）または prepare_definition_pr script 拡張。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、PR #3690、Issue #3681、commit e43bb977、scripts/src/prepare_definition_pr.ts
- **タグ**: `#case-open` `#generate_indexes` `#REQ採番`


## agentdev_gh の操作別入力契約の差異（issue_read は labels 非対応）で Tool 呼出が invalid-input になる

- **問題事象**: case-open STEP-5 の冪等検出・横断依存検査のため issue_read で未クローズ Case 群の本文を取得した際、issue_list と同じ呼出形式（labels フィールド付き request）を流用したところ、issue_read の入力契約が labels を unknown-field として拒否し invalid-input（retryable）で失敗した
- **発生局面**: 実装（case-open STEP-5。並行 case-open 委譲実行）
- **検知方法**: agentdev_gh の failure 応答（kind: invalid-input、detail: unknown-field [labels]、contingency に gh CLI 読取系 fallback を提示）
- **根本原因**: agentdev_gh の操作カタログは操作ごとに独立した入力契約を持ち、issue_list（labels 許容）と issue_read（labels 非対応）で許容フィールドが異なる。呼出側が操作間で共通のリクエスト形状を想定すると契約違反になる
- **自律対応内容**: labels フィールドを除去した最小契約形式（number のみ）で再試行し、12 件の Issue 本文取得に成功した。読取系操作の入力検証エラーは冪等であり、failure detail の契約指示に従った入力修正で解決する
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存 Tool 契約の遵守。影響の記録のみ）
- **横展開観点**: agentdev_gh の全操作呼出で、操作別契約の必須・許容フィールドを事前に確認する規律が同様に適用可能。書込み系では fail-closed で作成前に止まるが、読取系でも同様の事前確認が無駄な再試行を防ぐ
- **再発条件**: 複数操作を連続呼出する workflow で、1つの操作のリクエスト形状を別操作へ流用する場合
- **予防策候補**: workflow skill の reference 手順に、操作別入力契約の最小フィールド構成（issue_read は number のみ等）を明記する。learning-promote での判断
- **想定反映先**: case-open スキル reference（definition-pr-and-idempotency.md の冪等検出手順、root-case-and-definition-package.md の横断依存検査手順）または agentdev-issue-management。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Issue #3676、Custom Tool agentdev_gh（issue_read 契約）
- **タグ**: `#case-open` `#agentdev_gh` `#入力契約`


## REQ 行なし bugfix Case の traceability gate 対象行に implementation covers 行集合を選ぶと design 対応欠落の既存債務で fail する

- **問題事象**: case-open STEP-4 の REQ 行変更なし Design 語彙修正 Case で、traceability check の対象行（traceabilityReqIds）に本変更対象 Design の implementation covers 行 11 件（inline ADF-COVERS(implementation) 宣言）を指定したところ、missing-design が 8 行（REQ-007-002/003/005、REQ-017-003、REQ-048-001/002/008/016）で fail した。これらの行は現行 corpus で design 対応を持たない既存状態であり、本変更起因ではない
- **発生局面**: 実装（case-open STEP-4 品質ゲート。並行 case-open 委譲実行）
- **検知方法**: traceability check 報告の missing-design findings（対象行集合と reqId の突合）と、coverage --req による design 対応帰着の実測（本 Design は design covers を1行も担わない）
- **根本原因**: Design ファイルの implementation covers 宣言行集合は「design 対応を持つ行集合」と一致しない。Design が design 対応を担うのは inline ADF-COVERS(design) 宣言または sidecar design セクションを持つ場合のみであり、本 Design（agentdev-workflow-templates.md）は implementation 宣言のみで design 対応を持たない。traceability gate の missing-design 0 件ゲートは「対象行の design 対応が完全であること」を要求するため、design 対応を持たない行を対象集合に含めると既存債務が fail として顕在化する
- **自律対応内容**: coverage 実測で本変更対象 Design が design 対応を担わないことを確認し、対象行集合を「本 Design が対応関係を宣言する中で design 対応を持つ 3 行（REQ-014-016、REQ-100-005、REQ-100-008）」へ修正して再実行し、missing-design 0 件・11 check 全 pass で gate 判定を完了した。対象外 8 行の design 欠落は REQ-021-024 の既存債務として case-ready へ引き継ぐ旨を記録した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存 gate 判定仕様の対象行選択の運用知見。REQ 行を持たない Case の対象行決定は reference に未明文化）
- **横展開観点**: REQ 行変更なしの bugfix Design 変更 Case（target_req: null）全般に適用可能。traceabilityReqIds は「本変更で design 関係が変わり得る行」＝「本変更対象 Design が design 対応を担う行、または design 対応を持つ対応宣言行」を選択する
- **再発条件**: REQ 行なしの Design 変更 Case で、対象 Design の implementation covers 行集合を traceabilityReqIds に流用する場合
- **予防策候補**: definition-pr-and-idempotency.md に REQ 行なし Case の traceabilityReqIds 選択基準（design 対応を持つ行集合を coverage 実測で特定）を明文化する。learning-promote での判断
- **想定反映先**: case-open スキル reference（definition-pr-and-idempotency.md の gate 判定仕様節）。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Issue #3676、PR #3691、scripts/lib/definition-traceability-gate.ts
- **タグ**: `#case-open` `#traceability` `#対象行選択`

## Windows Git Bash の /tmp リダイレクト先を node スクリプトが読めず ENOENT になる

- **問題事象**: case-open STEP-4 の yomiyasu lint 前処理で、bash の /tmp へ diff をリダイレクトした後、node スクリプトから同一 /tmp パスを fs.readFileSync で読むと ENOENT で失敗した。bash（Git Bash）の /tmp は Windows 側の一時領域へ仮想的にマップされる一方、node は /tmp をカレントドライブ直下の実パスとして解決するため両者のパス空間が一致しない
- **発生局面**: 実装（case-open STEP-4 の編集 diff 抽出と yomiyasu_lint.py への検査対象渡し。並行 case-open 委譲実行）
- **検知方法**: node の ENOENT（syscall: open、path: C:WINDOWSTEMPopencodediff-wt.txt を期待して /tmp を解決した失敗）と、リダイレクト直後の ls では /tmp ファイルが実在する対比
- **根本原因**: Git Bash の /tmp 仮想マッピングと node の Windows パス解決の不一致。エンコーディング破損問題（PowerShell 系の既知知識）とは別系統のパス解決問題
- **自律対応内容**: リダイレクト先を C:/WINDOWS/TEMP/opencode 配下の明示 Windows パスへ変更し、bash と node の双方から同一実パスで参照する形へ切替して解決した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: bash と node/python を同一ファイル経由で連結する工程全般（lint 前処理、検査入力 JSON 生成、diff 抽出）に適用可能。workspace 外一時領域を使う工程では明示 Windows パスへ統一する
- **再発条件**: Windows 環境で bash の /tmp を経由して bash と node/python 間で一時ファイルを受け渡す場合
- **予防策候補**: bash と他言語実行基盤を連結する工程手順では、一時ファイルの受け渡し先を AGENTS.md の承認済み一時領域（C:WINDOWSTEMPopencode）の明示 Windows パスへ統一する規律を reference 側へ明記する
- **想定反映先**: workflow skill 共通の環境前提 reference または agentdev-git-worktree reference の Windows 環境注意。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Case #3675、docs/knowledge/windows-powershell-bulk-io-corruption.md（PowerShell 系の別系統問題）
- **タグ**:   

## REQ-030-027 の design 宣言を sidecar へ部分集合 mirror で追加すると duplicate-inconsistencies で traceability gate が fail-closed 停止する

- **問題事象**: case-open STEP-4 の Definition 適用で、新規 REQ 行（REQ-030-027）の design 宣言を traceability/agentdev-workflow-case-open.yaml へ `design: docs/designs/commands/case-open.md: [REQ-030-027]` の 1 行のみで追加したところ、traceability check の duplicate-inconsistencies が「同一論理関係（artifact パス × role）の対応宣言が複数情報源で矛盾（情報源: inline 宣言, sidecar）」で fail し、設計PR作成前の fail-closed で停止した。inline ADF-COVERS(design) は同 artifact に 13 関係（REQ-030-014/017〜027、REQ-083-002/003）を宣言しており、sidecar の部分集合 mirror が情報源間の行集合不一致と判定された
- **発生局面**: 実装（case-open STEP-4 機械工程。並行 case-open 委譲実行。Case #3686 / PR #3692）
- **検知方法**: prepare_definition_pr.ts の traceability gate（check --req REQ-030-027）が exit 2・duplicate-inconsistencies fail を返し、findings の detail に矛盾する 2 情報源が表示された
- **根本原因**: sidecar へ design 宣言を新設する場合、同一 artifact × role の行集合は inline 宣言と完全一致する必要がある（整合しない重複は duplicate-inconsistencies の検出対象）。追加対象行だけの部分集合 mirror は「sidecar のみに無い関係」ではなく「inline のみに存在する関係の残存」として集合不一致に計上される。draft の case_open_hints は sidecar design 宣言への追随反映のみを指示し、完全一致 mirror の要件までは指示していなかった
- **自律対応内容**: 不足分のみの再適用（冪等再実行）として、sidecar design 宣言を inline の 13 関係と完全一致する mirror へ拡張する補正 commit（edc488d6）を DefinitionEdit 旧文完全一致契約の範囲で適用し、traceability gate を pass（missing-design pass、duplicate-inconsistencies pass、missing-implementation/verification のみ deferred）へ復帰させた
- **ユーザー確認有無**: なし（fail-closed gate の機械的検出に対する機械的修復）
- **Decision/REQ/spec影響**: なし（REQ-030-024 の集合一致・duplicate-inconsistencies 検出の既存契約どおりの動作）
- **横展開観点**: sidecar の design 宣言新設は REQ-030-027 のみならず既存 inline 宣言全体との集合一致を要求する。既存 artifact × role への初回 sidecar 宣言追加では、inline 宣言の全関係を機械的に列挙して mirror する手順が同種 gate fail 全般に有効。Issue #3678（同一 artifact × role 宣言の集約規則の明文化 Case）と同根の問題クラスであり、実観測事例として補強になる
- **再発条件**: draft の case_open_hints が「sidecar design 宣言への追随反映」のみを指示し、inline 宣言との行集合一致要件を明示しないまま case-open STEP-4 を実行する場合
- **予防策候補**: case-open Design または draft 組立側の hint に「sidecar design 宣言の新設・追加は同一 artifact × role の inline 宣言行集合との完全一致を要件とする」ことを明記する。あるいは REQ-030-024 の適用前集合一致検証（1.5 の (5)）を design 宣言の新設時にも必須化する。learning-promote での判断
- **想定反映先**: agentdev-traceability references/sidecar-and-policy.md（集約規則節。Issue #3678 の対象）、case-open reference（definition-pr-and-idempotency.md の traceability gate 手順）。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Case #3686、PR #3692、commit edc488d6、Issue #3678（同根問題の規則明文化 Case）
- **タグ**: `#case-open` `#traceability` `#sidecar` `#fail-closed`

## 対照救済の findings 比較は stdout 全文を正とし report ファイルは実行間で上書きが保証されない

- **問題事象**: case-open STEP-4 の check_integrity 対照救済（対照実行）で、findings の機械比較対象を worktree 内の integrity report ファイル（.agentdev/integrity/reports/<日付>-integrity-report.md）から抽出したところ、stdout では解消済みの NG 行（req-updated-freshness 1 件）が report ファイルには残留し、report ベースの再比較で計測日収束の反映が観測されなかった
- **発生局面**: 実装（case-open STEP-4 機械工程の品質ゲート評価。並行 case-open 委譲実行。Case #3683 / PR #3693）
- **検知方法**: stdout 全文ベースの集合比較（NG + Warning 行の sort・差分 0 件）では baseline（main HEAD）と完全一致になったのに対し、report ファイルベースの同比較では旧 NG 行が残存する乖離
- **根本原因**: report ファイル（実行日時名の md）は checker の書込みタイミング・上書き条件が実行間で保証されず、GateExecutionEvidence.detail.stdout（script が実行証跡として保存した原結果）と内容集合が乖離し得る。対照救済契約（findings が完全一致・差分 0 件の機械証明）の比較対象は stdout 全文が正であり、report ファイルを比較対象にすると stale 内容による誤判定を生じる
- **自律対応内容**: 比較対象を stdout 全文へ統一し、3 実行（1 回目・収束後・baseline）の NG + Warning 行集合の sort・完全一致（差分 0 件）を機械証明した。収束 commit 後の worktree HEAD と baseline main HEAD の findings が完全一致で、本変更起因の検出悪化 0 件を根拠づけた
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（対照救済手順の既存契約どおりの運用）
- **横展開観点**: GateExecutionEvidence を保存する機械工程（prepare_definition_pr.ts、close_mechanical_steps.ts 等）を消費する品質ゲート評価全般に適用可能。証拠の消費は detail.stdout の原結果を正とし、実行生成物の別表現（report md、summary、stderrTail）を比較対象にしない
- **再発条件**: 対照救済や差分証明の実装で、コマンド出力の証跡（stdout）ではなく checker が書き出すファイル（report、JSON 出力ファイル等）を比較対象とする場合
- **予防策候補**: case-open reference（definition-pr-and-idempotency.md）の対照救済手順に「findings 比較の対象は GateExecutionEvidence.detail.stdout 全文とし、実行生成物ファイルを比較対象にしない」ことを明記する。learning-promote での判断
- **想定反映先**: agentdev-workflow-case-open reference（definition-pr-and-idempotency.md 対照救済手順節）。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Case #3683、PR #3693
- **タグ**: `#case-open` `#check_integrity` `#evidence`

## workflow extension の yomiyasu 前置適用 rule を読み込む前に GitHub 文章を投稿して事後補完となった

- **問題事象**: case-ready STEP-4 の Root Case 本文更新（実現方針章の新設と完了条件の展開）を agentdev_gh issue_update で実施した際、workflow extension（agentdev-workflow-case-ready.yaml）の rules（GitHub 文章は agentdev_gh へ渡す前に yomiyasu 推敲）を確認せずに投稿した。投稿後に extension を読み込んで rule を認識し、変更散文部分の事後 lint 確認で補完した（指摘 5 件はコード識別子の半角空白とチェックボックス契約構造への指摘で、正当な用語・構造への指摘として理由を記録して保持し修正不要判定）
- **発生局面**: 実装（case-ready STEP-4 execution contract 確定。単独 case-ready 実行）
- **検知方法**: STEP-6 の横断依存検査入力構成のため workflow extension（.agentdev/extensions/skills/agentdev-workflow-case-ready.yaml）を読み込んだ時点で rules 存在を再認識（投稿後の事後確認）
- **根本原因**: STEP 実行手順に workflow extension の rules 確認が必須前処理として組み込まれておらず、GitHub 書込み操作の直前に extension rules を読み込む工程がスキップされた。acceptance_gates は Definition PR 受入検査で参照する前提の運用に寄り、rules 節の参照契機が本文更新操作に結び付いていなかった
- **自律対応内容**: 変更散文部分（実現方針章・完了条件 3 項目）を検査専用ファイル（workspace 外承認一時領域の明示 Windows パス）へ抽出して yomiyasu_lint.py をファイル引数で実行（通常終了コード 0）、指摘理由を記録して保持。以降の状態のみの更新（STEP-6 ready 遷移の進行状況変更）は再推敲不要条項で継続した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: workflow extension の rules が GitHub 文章への前置処理を要求する全プロジェクトで、case-open / case-run / issue 等 Issue・PR を書き込む工程全般に、書込み直前の extension rules 確認の組込みが同種逸脱全般に有効
- **再発条件**: workflow extension の rules に GitHub 文章への前置処理が宣言されているプロジェクトで、workflow skill が Issue / PR 本文更新を実行する場合
- **予防策候補**: workflow skill reference（execution-contract.md「Root Case 本文の更新」節等）に「GitHub 書込み直前の workflow extension rules 確認」手順を明文化する。agentdev-project-extensions の runtime 読み込み契約を STEP 開始時の必須前処理へ位置付ける案も候補。learning-promote での判断
- **想定反映先**: case-ready reference（execution-contract.md Root Case 本文の更新節）、case-open / case-run 同種手順、agentdev-project-extensions。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Issue #3674、.agentdev/extensions/skills/agentdev-workflow-case-ready.yaml
- **タグ**: `#case-ready` `#yomiyasu` `#workflow-extension`

## role: case の Root Case の正規状態遷移を trackingState 指定で実行して issue_update が拒否された

- **問題事象**: case-ready STEP-6 の ready 遷移で、role: case の Root Case（#3674）への issue_update に trackingState: ready を指定したところ、operation-failed（detail: issue_update kind/trackingState apply only to tracking issues）で失敗し、同時指定の labels・body 更新も全体として中止された
- **発生局面**: 実装（case-ready STEP-6 ready 遷移）
- **検知方法**: agentdev_gh の failure 応答（kind: operation-failed、retryable: true、detail に契約理由）
- **根本原因**: trackingState は role: tracking の追跡Issue の論理状態であり、role: case の Case Issue は本文の進行状況セクションが正規状態の正（workflows/v4-lifecycle-state-machine Design）。正規状態遷移（open → ready）を本文進行状況の key-value 更新で行うべきところ、tracking 系の操作引数を Case Issue の更新へ混在させた
- **自律対応内容**: trackingState を除去した issue_update（本文進行状況の正規状態: ready 変更 + work_type ラベル bugfix 付与）で再実行し、成功と VERIFY を確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（Custom Tool 操作契約どおりの動作）
- **横展開観点**: role: case Issue の状態遷移は本文進行状況セクションの更新で行い、trackingState は role: tracking 専用である契約の区別は、case-run（running / blocked / review 遷移）、case-close（closed 遷移）、issue 等 role: case を扱う全工程に適用可能
- **再発条件**: role: case Issue の正規状態遷移を trackingState 操作引数で実行しようとする場合
- **予防策候補**: case-ready reference（readiness-and-cleanup.md「ready 遷移」節）に「正規状態の遷移反映は本文進行状況セクションの更新で行い、trackingState 操作引数は role: case に使用しない」を明記する。learning-promote での判断
- **想定反映先**: case-ready / case-run / case-close reference の状態遷移手順。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Issue #3674、Custom Tool agentdev_gh（issue_update 契約）
- **タグ**: `#case-ready` `#agentdev_gh` `#CaseIssue`

## case-ready 機械工程の traceability gate --req フィルタは Case の対象要件行に限定し触れた REQ の全行を渡さない

- **問題事象**: case-ready 受入機械工程（accept_definition_checks.ts acceptance-checks phase）の traceability gate に、Case が参照する REQ ファイルの全要件行（REQ-006-105〜114・9行）を --req フィルタへ渡したところ、REQ 要件行を1行も変更しない docs_chore Case に対して missing-design 7行（REQ-006-105/106/107/108/109/111/113）を検出し、gate fail（traceability readiness gate failed）で機械工程が途中停止した
- **発生局面**: 設計PR受入（case-ready STEP-1 機械工程。並行 case-ready 委譲実行。Case #3675 / PR #3689）
- **検知方法**: accept_definition_checks.ts の報告 JSON で traceability-check step status=fail・blocking reason「a targeted REQ row has no Design correspondence」（後続ゲート抑止も作動）
- **根本原因**: 対象要件行が空集合（要件行の追加・意味変更なし・docs_chore）である Case の gate フィルタに、触れた REQ ファイルの全行を渡したため、本 Case が対象としない行の corpus 既存債務が blocking 判定の対象に混入した。gate の正しいスコープは「対象 Case の要件行」であり、変更対象 REQ ファイルの全行ではない
- **自律対応内容**: 対象要件行 0 行の解釈へ修正し、同一 findings が main HEAD（db78a1c0・merge 前対照）でも完全再現することを機械証明して base 起因既存債務と確定。本 Case 対象行の missing-design 0 件・policy 有効（verificationPolicyUnavailable: false・policy-invalid pass）で gate 合格と判定し、merge を続行した
- **ユーザー確認有無**: なし（委譲時に check_integrity 対照救済の前提が親から付与済み。対象行スコープの解釈は対照機械証明で裏付け）
- **Decision/REQ/spec影響**: なし（STEP-2/STEP-6 gate の「対象要件行」スコープの既存契約どおりの運用）
- **横展開観点**: 要件行を変更しない docs_chore / bugfix Case の case-ready・case-open 機械工程全般に適用可能。--req フィルタの構成は draft の要件行変更差分から導出し、REQ ファイル単位で全行を列挙しない
- **再発条件**: case-ready（または case-open）機械工程の traceability gate で、要件行を変更しない Case に REQ ファイル全行の --req フィルタを渡す場合
- **予防策候補**: case-ready reference（definition-acceptance.md）に「--req フィルタは Case の対象要件行に限定（要件行変更なし Case では空集合。空集合時は policy 有効性確認で gate 合格判定）」を明記する。learning-promote での判断
- **想定反映先**: agentdev-workflow-case-ready references/definition-acceptance.md（STEP-2 traceability check 節）。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Case #3675、PR #3689
- **タグ**: `#case-ready` `#traceability` `#gate` `#docs_chore`

## case-ready の条件付き評価では処置 choice を親判断の最終確定後に単独評価として生成する

- **問題事象**: case-ready STEP-5 のスコープ重複判定（逐次経路）で、交差 boolean と処置 choice（スキップ・ユーザー確認）を 1 回の Jev evaluate に一括同梱したため、boolean の最終確定が重複なし（false）で処置 choice の発動条件不成立が確定した後も、choice の評価結果が観測 JSON に非作動値として残った
- **発生局面**: 実行構造確定（case-ready STEP-5。Case #3681、Standard flow）
- **検知方法**: observation_write の finalResult 組立時に、処置 choice の確定値（スキップ）が採用された処置ではないことを表現する値域が choice 形式に存在しないことで気づいた（非該当を表す値がない閉集合）
- **根本原因**: 条件付き評価の発動制御（親判断の最終確定結果が発動条件を満たした場合だけ後続質問を生成し、不成立時は質問も観測も生成しない）に従い、処置 choice を親 boolean の Jev 先行評価完了・LLM 最終判断確定後の別 evaluate 呼出として構成すべきだった。1 evaluate = 1 observation の単位で質問バッチを組む際に親子条件を分離していなかった
- **自律対応内容**: 観測は評価器実値どおり両問を記録（1:1 契約維持）し、処置 choice が前提不成立で非作動であることを完了報告に明記。観測の書換え・再生成は行わない（識別子安定性契約）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（条件付き評価の発動制御の既存契約どおり。本 entry は運用側の構成ミスの記録）
- **横展開観点**: 条件付き化された判断単位（Wave 構成判断、スコープ重複処置 choice 等）を持つ全 workflow（case-ready、req-define、backlog-review 等）の Jev 質問バッチ構成に適用可能。親条件依存の choice は親判断確定後の独立 evaluate として構成する
- **再発条件**: boolean（重複の有無）と処置 choice（分岐後の処置）を同一バッチで evaluate に渡す場合
- **予防策候補**: case-ready reference（execution-structure.md の判断単位割当て節）に「条件付き choice は親判断の最終確定後の別 evaluate として生成する（質問バッチへの同梱禁止）」を明記する。learning-promote での判断
- **想定反映先**: agentdev-workflow-case-ready references/execution-structure.md。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Case #3681、.agentdev/jev-observations/20261013T155053Z-99c0.json
- **タグ**: `#case-ready` `#jev` `#条件付き評価`
