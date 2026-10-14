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

## accept_definition_checks の overlap 要約は top-level warnings を読むため常に 0 表示になる。警告提示は保存済み stdout 証跡の機械再解析で確定する

- **問題事象**: case-ready STEP-1 受入検査で accept_definition_checks.ts の overlap-cross-check step の summary が「warnings=0」と表示した一方、同一 step detail に保存された engine 報告 stdout 全文には condition_a warnings=1（#3679 と #3686 の同一パス重複）が記録されていた。summary 文字列を根拠にすると横断依存検査の警告提示記録が欠落する
- **発生局面**: 実装（case-ready STEP-1 受入検査・STEP-6 横断依存検査の再実行。Case #3682）
- **検知方法**: STEP-6 で共有エンジン（inspect_cross_dependencies.ts）を直接再実行した報告（condition_a.count=1）と受入検査 summary（warnings=0）の不一致を、保存済み step detail の stdout 全文を JSON.parse して condition_a を照合する機械再解析で確定
- **根本原因**: accept_definition_checks.ts の overlap 要約生成が報告 JSON の top-level warnings フィールドを読むが、engine 報告契約（cross_dependency_types.ts）は warnings を condition_a.warnings にネストしており top-level は常に不在。parsed.warnings?.length ?? 0 が常に 0 になる
- **自律対応内容**: summary を捨てて step detail の stdout 全文から engine 報告を再解析し、warning 1 件（本 Case #3682 は非関与。#3679 と #3686 の重複）を提示記録として完了報告へ繰り込んだ。警告は ready 遷移判定を変更しないため gate 判定への影響はなし
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（gate 意味論と報告 JSON 契約の変更は learning-promote での判断に委ねる）
- **横展開観点**: script 報告の要約文字列（summary・件数文字列）を gate 判定や警告提示の根拠に使う工程全般。definition-acceptance.md が規定するとおり要約は併存情報であり、原結果の全文（step detail の stdout）が正
- **再発条件**: accept_definition_checks.ts 経由で overlap-cross-check を実行し、engine が 1 件以上の警告を返す場合に毎回再発する（警告 0 件時は偶発的に一致するだけ）
- **予防策候補**: 要約生成を parsed.condition_a.warnings.length と detection_unavailable の有無から構成する修正。あわせて消費側手順に「警告提示の確定は detail stdout の機械再解析で行う」を明記
- **想定反映先**: src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts（overlap 要約生成箇所）と agentdev-workflow-case-ready references の消費側規律。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Case #3682、PR #3685、src/common/skills/agentdev-workflow-case-open/scripts/lib/cross_dependency_types.ts（報告契約）、Issue #3680（同 script の別箇所修正 Case）
- **タグ**: `#case-ready` `#script` `#overlap` `#gate`

## acceptance-checks の AUTOGEN 再生成差分検出は実行日を跨ぐ並列バッチで計測日 1 行差分の warn を毎回生む

- **問題事象**: case-ready STEP-1 受入検査（acceptance-checks phase）の autogen-regeneration-diff step で、generate_indexes 再実行により docs/designs/quality/req-health-metrics.md の AUTOGEN 計測日行のみが 1 行差分として検出され、script が needs-judgment（exit 2）と「Regeneration diff must be resolved before merge」警告を返した。並列バッチの Case 実行が日付境界を跨ぐたびに同一の warn が再発し、毎回モデルの意味レビュー判断を要する
- **発生局面**: 実装（case-ready STEP-1 受入検査。Case #3683、並列バッチ Batch D）
- **検知方法**: 受入検査報告 JSON の autogen-regeneration-diff step status=warn と diffStat（1 insertion, 1 deletion）を確認し、差分実体を再生成後の git diff で照合して計測日行のみであることを実測
- **根本原因**: 計測日 AUTOGEN は generate_indexes 実行日から導出されるため、PR 作成日と merge 判定日が日付境界を跨ぐと、本 PR 非起因の派生物差分が再生成分の warn として表面化する。計測日のずれは内容変更ではない（definition-pr-and-idempotency.md の計測日収束契約）ため阻塞げではないが、script は差分の有無しか判定できない
- **自律対応内容**: 差分実体が計測日行のみであることを機械確認し、(1) 本 PR が当該派生物を宣言・変更していないこと（pr_changed_files と ACT-DESIGN-001 宣言の一致）、(2) merge で当該派生物が変化しないこと（branch 版と main 版の非差分確認）を根拠に非阻塞げと判断して merge を継続した。派生物の PR への混入は宣言範囲逸脱となるため行わない
- **ユーザー確認有無**: なし（正規契約からの導出）
- **Decision/REQ/spec影響**: なし（計測日収束契約の既存どおり。gate への計測日のみ差分の決定的除外は learning-promote での判断）
- **横展開観点**: generate_indexes 派生物の AUTOGEN 再生成差分を gate 判定に使う全工程（case-open STEP-4、case-ready STEP-1）。日付境界を跨ぐ長時間バッチ実行全般
- **再発条件**: PR 作成（generate_indexes 実行）と case-ready 受入検査が日付境界を跨ぎ、かつ計測日 AUTOGEN が再生成対象に含まれる場合
- **予防策候補**: accept_definition_checks.ts の autogen-regeneration-diff step に「差分が計測日 AUTOGEN 行のみの場合は pass 扱い（警告に計測日のみ差分である旨を記録）」の決定的判定を追加する。learning-promote での判断
- **想定反映先**: src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts（autogen-regeneration-diff step）。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Case #3683、PR #3693、src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（計測日収束契約）
- **タグ**: `#case-ready` `#script` `#autogen` `#計測日`

## acceptance-checks の integrity gate が PR 非起因の既存債務で fail-closed 抑止すると後続ゲートの script 経由継続手段が不在になる

- **問題事象**: case-ready STEP-1 受入検査（acceptance-checks phase）で check_integrity が PR 非起因の既存債務（IR-055 delta・IR-068・IR-072・expanded-readme-sync 計 16 NG。全て PR 差分外ファイルで #3675 / #3684 の処遇対象）で非ゼロ終了し、script が後続ゲート（overlap-cross-check・autogen-regeneration-diff・traceability-check）を実行せず early-return した。PR 自体の起因違反は 0 件（check_changed_docs は対象 4 ファイルで 0 失敗）だが、後続 3 ゲートを同一 script 呼出で継続する resume 手段が存在しない
- **発生局面**: 実装（case-ready STEP-1 受入検査。Case #3686、PR #3692 受入）
- **検知方法**: 受入検査報告 JSON の definition-acceptance-checks step status=fail と保存された check_integrity evidence（16 NG の全文一覧）を意味レビューし、NG 全件のファイルが PR 変更 4 ファイル（pr_changed_files）の外であることを機械照合して PR 起因 0 件と判定
- **根本原因**: 非ゼロ終了の integrity gate は証拠保存の上で後続ゲート抑止が正（fail-closed 維持）だが、抑止後の継続経路が「修復後の case-ready 再実行」のみで、修復不要な既存債務（base 起因・処遇 Case 起票済み）では後続ゲートを script の証拠契約に乗せたまま継続できない。同一条件再実行の禁止（REQ-030-025 消費規律）と要求の矛盾
- **自律対応内容**: 実行済み gate の再実行は行わず、抑止されて未実行の 3 ゲート（overlap・generate_indexes + AUTOGEN 差分・traceability check）を個別実行で継続し、同一の証拠項目（終了コード・stdout/stderr・targetRevision edc488d6・実行コマンド）を保存して意味レビューした。traceability は missing-design 0・policy 有効、overlap は警告 1 件（#3679 との同一パス重複・既知）、AUTOGEN 差分なしで merge を継続。前例は Case #3675 の「base 起因の既存債務は本 Case と無関係」の機械証明運用
- **ユーザー確認有無**: なし（正規契約からの導出。PR 起因 0 件の機械照合に基づく）
- **Decision/REQ/spec影響**: なし（受入検査の後続ゲート継続手順の明文化は learning-promote での判断）
- **横展開観点**: 品質ゲート束ね型 script 全般（fail-closed 抑止と再実行禁止の併存）。リポジトリ全体の既存債務が混在する環境での Definition PR 受入全般
- **再発条件**: check_integrity が PR 非起因の delta NG を持ち続ける環境で case-ready 受入検査を行う場合に毎回再発する（現行 main は IR-055/IR-068/IR-072 の delta 債務が常態）
- **予防策候補**: accept_definition_checks.ts に「integrity gate 非ゼロ時に、保存した evidence の NG ファイル集合が PR 変更ファイル集合と交差しない場合は integrity step を warn 扱い（pr-attribution-clean 記録付き）で後続ゲートを継続する」決定的判定の追加。learning-promote での判断
- **想定反映先**: src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts（integrity gate 後続抑止の条件付き継続）と agentdev-workflow-case-ready references/definition-acceptance.md（既存債務時の継続手順）。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Case #3686、PR #3692、Case #3675（既存債務機械証明の前例）、Issue #3684（IR-068/IR-055 債務の処遇 Case）
- **タグ**: `#case-ready` `#script` `#integrity` `#既存債務`

## Jev evaluate の observationMetadata.references.digest に sha256 以外の値を渡すと観測永続化が失敗し評価単位の観測が欠落する

- **問題事象**: case-ready STEP-5 の Jev 先行評価（Standard / Epic 確定判断）で observationMetadata.references[].digest に "unknown" を渡したところ、評価器は成功（Standard・必須・一貫。confidence 0.76）したが観測永続化が invalid_input（sha256 hex 64 文字必須）で失敗した。評価単位の観測（1 semantic evaluation = 1 observation）が生成されず、observationId も発行されないため observation_write による最終判断の事後追記も不可能
- **発生局面**: 実装（case-ready STEP-5 実行構造確定の Jev 先行評価。Case #3686）
- **検知方法**: evaluate 応答の observation.warning（"observation write failed: invalid_input: input reference digest must be a sha256 hex digest"）と .agentdev/jev-observations/ の新規ファイル不在の突合で確定
- **根本原因**: 再構成可能な入力の参照には sha256 実測値が必須という契約に対し、参照ファイルの digest を未計算のまま placeholder 文字列で渡した。入力検証は評価器成功後に観測書込み時に行われるため、評価結果だけが返り観測が欠落する失敗様式になる
- **自律対応内容**: 当該評価（Standard / Epic 確定）は観測なしで LLM 最終判断（Standard）を確定し、完了報告に識別可能な warning として記録。後続の 2 評価（スコープ重複 boolean・処置 choice）では node crypto による sha256 実測値を渡して観測永続化と observation_write を完結させた（20261013T160137Z-5179、20261013T160213Z-9eb6）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（観測書込み失敗時の fail-open 維持と warning 明示は既存契約どおり）
- **横展開観点**: agentdev_jev evaluate の references を渡す 6 系統 Workflow 全般（learning-promote、req-define、case-ready、intake-promote、inspect-promote、backlog-review）。digest 未計算のまま渡す呼出側実装全般
- **再発条件**: 参照ファイルの sha256 を実測せず placeholder を渡した場合に必発（評価成功・観測欠落のサイレント様式として危険）
- **予防策候補**: 呼出側手順に「references を渡す場合は事前に node crypto で sha256 を実測する」前置規律の明文化。観測書込み失敗時の warning を workflow 完了報告の必須記録項目とする。learning-promote での判断
- **想定反映先**: src/common/skills/agentdev-workflow-case-ready/references/execution-structure.md（Jev 評価経路の呼出手順）等の 6 系統 Workflow reference。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Case #3686、.agentdev/jev-observations/20261013T160137Z-5179.json、.agentdev/jev-observations/20261013T160213Z-9eb6.json
- **タグ**: `#case-ready` `#jev` `#observation` `#input-validation`

## agentdev_gh issue_update でバックスラッシュ入り本文（正規表現パターン等）を更新する際、原文 JSON 表現からの逐語複写をせずエスケープを自前で組み立てると本文を破壊する

- **問題事象**: case-close STEP-2 の完了条件チェックボックス更新（issue_update）で、本文中の rg 正規表現パターン `\.\./\.\./\.\./runner` を含む行の `- [ ]` → `- [x]` 置換を、原文の JSON エスケープ列（`\\.\\./`）を複写せず自前で `\/` を付けて再構成した結果、GitHub 上の本文に `\.\.\/` 等の余分なバックスラッシュが混入した。再読込 VERIFY で検出し、原文 JSON 表現の逐語複写に戻す修正で計 2 回の再更新を要した
- **発生局面**: 実装（case-close STEP-2 完了条件チェックボックス更新。Case #3673）
- **検知方法**: 更新後の再読込 VERIFY（gh issue view の生本文）で、ストアド本文のパターン表記と初回 issue_read 応答の逐語比較（`\/` 混入件数と `[x]` 件数の突合）
- **根本原因**: JSON 層のエスケープ（`\\` → `\`、`\/` → `/`）を展開しながら本文を自前で組み立てたため、正規表現内のリテラル列と実際に欲しい列の区別が崩れた。バックスラッシュを含む本文は「送信時に組み立てる」のではなく「初回読取応答の JSON 文字列を検証済みソースとして複写する」対象である
- **自律対応内容**: 初回 issue_read 応答の body JSON 文字列を逐語複写し、変更をチェックボックス状態 3 行の置換のみに限定して再更新。生本文で `\/` 0 件・`[x]` 3 件を確認して収束
- **ユーザー確認有無**: なし（再読込 VERIFY による機械確認）
- **Decision/REQ/spec影響**: なし（Issue 更新時の前後内容比較運用の強化は learning-promote での判断）
- **横展開観点**: agentdev_gh issue_update / pr_update / comment_create で正規表現・コード断片・Windows パス等のバックスラッシュ入り本文を扱う全 workflow（case-close チェックボックス更新、case-revise の Case 関連 Issue 本文更新、templates 由来本文の転記）
- **再発条件**: バックスラッシュ入り本文（正規表現パターン、エスケープシーケンス記載）を含む Issue/PR 本文更新で毎回潜在
- **予防策候補**: issue_update 手順に「変更対象行以外は初回読取応答の JSON 文字列を逐語複写する」「更新後は生本文でバックスラッシュ列の逐語比較を行う」前置規律の明文化。learning-promote での判断
- **想定反映先**: src/common/skills/agentdev-issue-management/SKILL.md（Issue 更新時の前後内容比較）と src/common/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md（チェックボックス更新手順）。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Case #3673、PR #3694
- **タグ**: `#case-close` `#agentdev-gh` `#issue-update` `#escaping`


## case-close 独立再実行で兄弟 Case 間の同一ファイル pre-existing textlint 違反が重複検出され得る

- **問題事象**: case-close 独立再実行で pre-existing textlint hard 違反 2 件（src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md の L50/L80 の「Definition PR」表記）を検出した。発見時点では未解消だったが、兄弟 Case #3679 の PR #3695（main merge 済み commit 95f771c5）で同箇所が「設計PR」へ置換済みのため解消済みの可能性が高い
- **発生局面**: 実装（case-close。Case #3678 / PR #3696）
- **検知方法**: textlint 検査の hard 違反報告（definition-pr-and-idempotency.md L50/L80 の指摘行）
- **根本原因**: 同一ファイルを複数の並行 Case が検査対象に含むため、片方の Case が修正する前に他方の Case が同じ既存違反を検出する。発見時点の状態を「解消済み可能性の注記なし」で記録すると、既に解消済みの違反に対する再調査・重複修復を後続の読み手が実行し得る
- **自律対応内容**: 検出時点では未解消であることを記録しつつ、兄弟 Case #3679 の PR #3695（main merge 済み commit 95f771c5）で同箇所が「設計PR」へ置換済みであることを確認し、解消済み可能性の注記を添えて記録した。本 Case での重複修復は行わない
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 並行 Case 実行環境で corpus 既存ファイルの検査を行う工程全般に適用可能。pre-existing 違反の記録には「発見時点の状態」と「他 Case による解消済み可能性（main merge 状況）」の両方を注記する規律が有効
- **再発条件**: 並行 Case 間で同一ファイルを検査対象に含み、一方が既存違反を修正する前に他方が検査を実行する場合
- **予防策候補**: pre-existing 違反の検出時に、同一ファイルの他 Case での修正状況（main merge の有無）を確認してから記録する手順を明文化する。learning-promote での判断
- **想定反映先**: case-close reference（既存債務の扱い手順）または case-open reference（対照救済手順）。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Refs: #3678、Case #3679、PR #3695、commit 95f771c5
- **タグ**: `#case-close` `#textlint` `#既存債務` `#並行実行`


## worktree と main root の両方で同一の check_integrity self-sync 乖離を観測した場合は corpus 既存債務の兆候

- **問題事象**: phase 系スキル 6 件の junction 欠落（check_integrity self-sync 乖離 6 件）を観測した。case-run worktree でも merge 後 main root でも同一の 6 件を観測。兄弟 Case #3684（PR #3701）で投影登録・junction 再構築が実施されたため解消済みの可能性が高いが、観測時点の記録として保持する
- **発生局面**: 実装（case-close。Case #3678 / PR #3696）
- **検知方法**: check_integrity の self-sync 乖離報告（phase 系スキル 6 件の junction 欠落）と、worktree・main root 双方での同一結果の突合
- **根本原因**: 環境差異（worktree vs main root）で乖離内容が変わらず同一であれば、実行環境の問題ではなく corpus 側の構造的欠落（投影登録・junction 未構築の既存債務）である。乖離を環境起因と誤認すると corpus 側の修復が先送りされる
- **自律対応内容**: 双方環境での同一乖離を根拠に corpus 既存債務の兆候と判定し、修復は兄弟 Case #3684（PR #3701）の投影登録・junction 再構築に委ねて重複修復を回避した。観測時点の記録として学びを残した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: check_integrity 等 corpus 全体検査の乖離分類全般に適用可能。worktree と main root の両方で同一乖離を観測した場合は環境起因でなく corpus 既存債務の兆候として、処遇 Case の起票状況を確認してから修復の要否を判断する
- **再発条件**: corpus 構造的欠落（投影・junction 未構築等）が存在し、複数環境から同一検査を実行する場合
- **予防策候補**: check_integrity 乖離の分類手順に「複数環境で同一乖離が観測されるかの確認」前置を追加し、同一なら corpus 既存債務として処遇 Case 起票状況を確認する。learning-promote での判断
- **想定反映先**: case-close reference（既存債務の扱い手順）または check_integrity 実行手順 reference。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Refs: #3678、Case #3684、PR #3701
- **タグ**: `#case-close` `#check_integrity` `#既存債務` `#junction`


## bun test を 3分割並行実行すると timeout 系の疑似 fail が多発する。並行実行時の fail はまず単独直列再実行で起因分離する

- **問題事象**: bun test を 3 分割並行実行したところ、timeout 系の疑似 fail が多発した（観測 9 件中 6 件が hook/5s timeout 由来）。同一コマンドを単独直列再実行すると解消することを 2 回実証済み
- **発生局面**: 実装（case-close。Case #3678 / PR #3696）
- **検知方法**: 並行実行での fail 分布（hook/5s timeout 由来の集中）と、同一コマンドの単独直列再実行での解消の対比
- **根本原因**: 並行実行形態によるリソース競合で hook timeout（5s）に達する実行が発生し、テスト本体の品質問題ではなく実行形態起因の疑似 fail として顕在化する。実行形態起因と品質起因の判別手順が手順書に明文化されていない
- **自律対応内容**: 並行実行の fail をそのまま品質問題として扱わず、同一コマンドの単独直列再実行で起因分離する手順を実施し、2 回とも解消を確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 検証工程でテストを並行実行する全 Case に適用可能。並行実行時の fail は実行形態起因と品質起因を分離するため、まず単独直列再実行を行い、再現する場合のみ品質問題として扱う判別手順が有効
- **再発条件**: bun test 等のテストスイートを並行実行し、hook timeout 系の fail が集中する場合
- **予防策候補**: 検証手順 reference に「並行実行時の fail はまず単独直列再実行で起因分離する（解消すれば実行形態起因、再現すれば品質起因）」判別手順を明文化する。learning-promote での判断
- **想定反映先**: case-run / case-close reference（検証手順・CI 対応手順）。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Refs: #3678
- **タグ**: `#case-close` `#bun-test` `#並行実行` `#疑似fail`


## worktree 内での textlint gate 実行は plugin 配下の依存生成が前提であり、未生成時は fail-closed 案内の手順どおりで回復できる

- **問題事象**: worktree（.worktrees/3675-impl）内で textlint final gate を実行した際、agentdev-textlint-guard plugin 配下の依存実体（vendor/ 配下）が未生成のため fail-closed で停止した。worktree 構造的制約（node_modules 未伝播）により、main root で生成済みの依存は worktree 側へ引き継がれない
- **発生局面**: 実装（case-run 検証の textlint final gate 実行。Case #3675 / PR #3698）
- **検知方法**: textlint gate 実行時の fail-closed 案内メッセージ（依存未生成の指摘）
- **根本原因**: agentdev-textlint-guard plugin は third-party 依存の実体を git 管理と配布物に含めず、版固定情報（package.json + bun.lock）のみを管理するため、worktree 作成直後の plugin package には依存実体が存在しない
- **自律対応内容**: 案内メッセージの手順どおり plugin package 配下で bun install && bun run build:engine を実行して依存を生成し、textlint gate を実行できた。回復に追加の判断は不要であった
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存の fail-closed 案内どおりの回復）
- **横展開観点**: worktree 内で plugin 依存を前提とする検査（textlint gate、導入系 script）を実行する全 Case に適用可能。依存生成の前置を実行手順に組み込むと fail-closed 停止と回復の往復を防げる
- **再発条件**: worktree 作成直後に plugin 依存を前提とする検査を実行する場合（毎回潜在）
- **予防策候補**: case-run / case-close reference の検証手順に「worktree 内で textlint gate 等を実行する場合の前置として plugin 配下で bun install && bun run build:engine を実行する」を明記する。learning-promote での判断
- **想定反映先**: case-run reference（検証手順）、agentdev-git-worktree reference（worktree 構造的制約・bun test 実行環境前提の同種注意）。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Case #3675、PR #3698、README「開発者セットアップ（textlint 依存の生成）」
- **タグ**: `#case-run` `#textlint` `#worktree` `#依存生成`


## squash merge 後のローカルブランチ削除は git cherry 判定でも git branch -d が拒否され得る。main 取込の実測確認後に -D を使う

- **問題事象**: case-close STEP-6 のクリーンアップで、squash merge 済み PR（Case #3676 / PR #3707）のローカルブランチ fix/issue-3676 を削除しようとしたところ、git branch -d が「not fully merged」で拒否された。直前の git cherry origin/main <branch> は `-` prefix（patch 相当が main に含まれる）を返しており、patch-id 等価判定と merge-base 判定の結果が乖離した。case-ready の記録先例（Case #3705 の definition-amend ブランチ削除）は「git cherry 確認後 git branch -d で削除」だったが、同一手順でも拒否され得る
- **発生局面**: 運用（case-close STEP-6 クリーンアップ。Case #3676 / PR #3707 merge commit 367263fe）
- **検知方法**: git branch -d の拒否メッセージ（error: the branch 'fix/issue-3676' is not fully merged）
- **根本原因**: squash merge は merge commit を作らないため、ブランチのコミットは main の歴史から到達可能でない。git branch -d の削除可否判定は祖先到達可能性（merge-base）基準であり、git cherry の patch-id 等価判定とは別基準。到達可能でない限り -d は内容取込済みでも拒否する
- **自律対応内容**: 対象変更ファイル（scripts/self/release/scripts-layout.test.ts）の git diff（ブランチ vs origin/main）が空であることを実測確認（exit 0・差分なし）し、cherry 判定と合わせて main 取込を二重確認した上で git branch -D で削除した。削除後、branch --list 空・git ls-remote 空（remote は deleteBranchOnMerge 削除済み）を確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存クリーンアップ手順の範囲内。--delete-branch 使用禁止制約は維持）
- **横展開観点**: squash merge を採用する全 Case の case-close クリーンアップ（worktree/ブランチ削除）に毎回適用可能。先例の手順をそのまま踏襲せず、-d 拒否は squash merge では通常系として扱う
- **再発条件**: squash merge 後にローカルブランチを git branch -d で削除する場合（毎回）
- **予防策候補**: case-close / git-worktree のクリーンアップ手順に「squash merge 後のブランチ削除は -d 拒否を前提に、変更内容が main に含まれることの実測確認（git cherry + 対象ファイル diff 空）をした上で -D を使用する」を明記する。learning-promote での判断
- **想定反映先**: case-close reference（cleanup-and-capture.md のクリーンアップ手順）、agentdev-git-worktree reference（worktree-operations.md のブランチクリーンアップ）。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Case #3676、PR #3707、commit 367263fe、Case #3705（case-ready 記録 6158565722 の先例手順）
- **タグ**: `#case-close` `#git` `#squash-merge` `#ブランチ削除`


## 対応宣言の新規 sidecar 作成は既存情報源との duplicate-inconsistencies を生む。作成前に同一 artifact × role の集約規則を確認する

- **問題事象**: REQ-112-001〜003 の implementation・verification 対応宣言を、実行計画の想定どおり traceability/ 配下の新規 sidecar へ作成しようとしたところ、初回の traceability check (exit 2) で duplicate-inconsistencies 3 件が検出された
- **発生局面**: 実装（case-run 対応宣言作成。Case #3681 / PR #3708）
- **検知方法**: 対応宣言作成後の traceability check の fail（exit 2、duplicate-inconsistencies 3 件。同一 artifact × role の既存情報源との分散指摘）
- **根本原因**: 同一 artifact × role の対応宣言が既存情報源（inline 宣言と agentdev-traceability.yaml）と新規 sidecar に二重に分散し、集約規則違反となった。計画段階で既存情報源の有無と集約規則の参照を省略していた
- **自律対応内容**: agentdev-traceability reference「同一 artifact × role を跨ぐ宣言の集約規則」に従い、新規 sidecar を作成せず既存情報源（inline 宣言 3 件と agentdev-traceability.yaml 1 件）へ追加統合した。統合後の再実行で 11 検査全 pass（exit 0）を確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: トレーサビリティ対応宣言を新規に追加する全 Case に適用可能。宣言作成の前に同一 artifact × role の既存情報源（inline 宣言、既存 sidecar、agentdev-traceability.yaml）を確認し、新規 sidecar の作成は集約規則上必要な場合に限定する
- **再発条件**: 実行計画が新規 sidecar 作成を前提とし、既存集約規則を確認せずに対応宣言を作成する場合
- **予防策候補**: case-open / case-run の実行計画作成時に、対応宣言の追加方法として既存情報源の集約規則を参照する前置を入れる。learning-promote での判断
- **想定反映先**: case-open / case-run reference（対応宣言作成手順）または agentdev-traceability reference（集約規則への参照導線）。learning-promote での判断
- **関連**: .agentdev/learning/inbox.md、Case #3681、PR #3708、traceability/agentdev-traceability.yaml、docs/requirements/REQ-112.md
- **タグ**: `#case-run` `#traceability` `#対応宣言` `#集約規則`


## bun test 分割① の既存 fail 2 件（IR-055・ローカルIssue pr_merge テスト）は baseline 既存欠陥で別単位追跡が必要

- **問題事象**: bun test 分割①（integrity suite）の IR-055 runtime-unresolved-reference 実修復回帰テストと、ローカルIssue role 条件付きスキーマの pr_merge テスト（issue_tracking_list.test.ts）が常時 fail する。baseline（origin/main f6a842da）でも同一 fail 名が再現する既存欠陥である。case-close 独立再検査（Case #3674）で単独再実行（188 pass / 1 fail・21 pass / 1 fail）と baseline 再現確認の両方で安定再現を確認した
- **発生局面**: 検証（bun test フル suite 実行。Case #3674 / PR #3697）
- **検知方法**: bun test 分割① 実行の fail（2907 pass / 2 fail）。単独再実行と baseline detached worktree 再現確認で由来分類
- **根本原因**: baseline commit 時点から存在する既存欠陥。IR-055 は delta from baseline 違反 4 件の実修復回帰、pr_merge テストは runAgentdevGhOperation の pr_merge で ok=false となる実装不整合
- **自律対応内容**: fail 全件の由来分類で pre-existing と分類し、baseline detached worktree での同一 fail 名再現で裏付けた。修復は本 Case の完了条件から除外し、追跡Issue #3702 を起票して別単位で追跡した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（修復管理は追跡Issue #3702。本 Case は正式な受け入れ条件変更として処理済み）
- **横展開観点**: baseline 既存 fail が存在する suite で「fail 0 件」を完了条件とする Case は達成不能になる。完了条件の定義時に baseline 状態を確認する
- **再発条件**: baseline commit に既存 fail が存在するまま新しい Case が fail 0 件の絶対条件を負う場合
- **予防策候補**: 起票時の bun test 全体実行（baseline 対照）で既存 fail の有無を確認し、既存 fail は別単位 Issue で追跡する前置を入れる。learning-promote での判断
- **想定反映先**: case-open / req-define の完了条件定義手順。learning-promote での判断
- **関連**: 追跡Issue #3702、Case #3674、PR #3697、issue_tracking_list.test.ts、check_integrity.test.ts
- **タグ**: `#bun-test` `#baseline` `#既存fail` `#由来分類`


## launcher protected-path テストはフル suite 負荷時のみ git commit タイムアウトで fail する flaky

- **問題事象**: launcher protected-path テストがフル suite 実行時のみ git commit タイムアウト（60 秒）で fail し、単独実行では baseline・本 worktree の両方で pass する。Case #3674 の case-run 実行では fail したが、case-close 独立再検査のフル suite では fail 未出現（pass）だった
- **発生局面**: 検証（bun test 分割① フル suite 実行。Case #3674）
- **検知方法**: フル suite 実行の fail と単独再実行での pass の不一致。再現性確認で flaky と判定
- **根本原因**: フル suite 負荷時のサンドボックス初期化（git commit 60 秒タイムアウト）が要因の疑い。状態依存・負荷依存の非決定的失敗
- **自律対応内容**: 単独再実行で pass することを baseline・本 worktree の両方で確認し、フル suite 実行時の一時環境要因として無効分類した。後続のフル suite で fail 未出現だったことで flaky 判定を維持した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: flaky 判定は単独再実行とフル再実行の両記録（単独→フルの順序）で状態依存性を確認してから分類する
- **再発条件**: フル suite 負荷時にサンドボックス初期化の git commit が 60 秒を超える場合
- **予防策候補**: 該当テストの git commit 処理に明示的 timeout 緩和またはリトライを入れる。learning-promote での判断
- **想定反映先**: 該当テスト実装（launcher protected-path テスト）または checker 実行契約 Design の flaky 扱い基準。learning-promote での判断
- **関連**: Case #3674、PR #3697
- **タグ**: `#bun-test` `#flaky` `#タイムアウト`


## 補完領域の textlint 系 76 fail は vendored 依存未生成が原因で baseline と完全同一の既存 fail として残存する

- **問題事象**: 補完実行（./src/opencode/ ./src/senpi/ ./src/common/tools/ ./src/common/guards/ ./src/third-party/）の textlint-guard 系 76 fail が baseline と件数・テスト名とも完全一致のまま残存する。vendored engine bundle・プロジェクト用語・prh 辞書等が主体
- **発生局面**: 検証（bun test 補完実行。Case #3674）
- **検知方法**: 補完実行の fail（737 pass / 76 fail）と baseline 再現確認（fail 集合 diff 完全一致）
- **根本原因**: vendored 依存（textlint engine 等）が plugin package 配下で事前生成されていない状態。生成前置（bun install && bun run build:engine）未実施の環境では fail する構造
- **自律対応内容**: baseline 再現確認で pre-existing と分類し、本 Case の完了条件から除外した（追跡Issue #3702 の追跡範囲）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: フル suite 実行の前置として vendored 依存の事前生成を確認する手順が必須である現状の在庫
- **再発条件**: plugin package 配下の vendor/ 未生成で textlint 系テストを実行する場合
- **予防策候補**: フル suite 正規形の依存パッケージ前置に vendored 依存生成の確認を組込む。learning-promote での判断
- **想定反映先**: agentdev-quality-gates reference（bun test フル suite 正規形の依存前置）・README 開発者セットアップ。learning-promote での判断
- **関連**: 追跡Issue #3702、Case #3674、PR #3697、src/opencode/plugins/agentdev-textlint-guard/
- **タグ**: `#bun-test` `#textlint` `#vendored-dependency` `#baseline`


## baseline 既存 fail 存在下の「bun test 全体 fail 0 件」絶対完了条件は達成不能になる。baseline 対照＋由来分類への基準変更が先行例

- **問題事象**: baseline（origin/main HEAD）時点で既存 fail が存在する構造で、「bun test 全体が fail 0 件」という絶対完了条件を持つ Case が、本 Case 変更単独では達成不能になった。Case #3674 の初回 QG-4 判定で fail と判定され停止した
- **発生局面**: レビュー（case-close STEP-2 QG-4 達成判定。Case #3674）
- **検知方法**: QG-4 判定での完了条件3 未達判定（fail 合計 79 件残存）。suite 全体絶対判定と baseline 相対判定の乖離
- **根本原因**: 完了条件が suite 全体の絶対判定として定義され、baseline 既存 fail の分離が考慮されていなかった。本 Case の起因事象（ENGINE_TREE 検査常時 1 fail）は解消済みでも、他の既存 fail が条件達成を阻害した
- **自律対応内容**: case-close は baseline waiver を行わず親判断へ停止した（停止記録 6152686604）。その後 req-define 再合意・case-revise 経路で完了条件3 を baseline 対照＋QG-4 fail 由来分類基準へ正式変更し（反映記録 6158011276）、case-close が新基準で QG-4 判定を再実施して合格させた（pre-existing 78・変更由来 0・由来不明 0）
- **ユーザー確認有無**: あり（再合意は利用者レビュー確定）
- **Decision/REQ/spec影響**: あり（baseline 対照＋由来分類を含む完了条件の先行例を形成。QG-4 契約の例外運用ではなく正式な受け入れ条件変更として扱う）
- **横展開観点**: baseline 相対判定を含む完了条件は、機械受理基準（由来分類・baseline 再現確認）を伴う形で定義する
- **再発条件**: baseline 既存 fail が存在する状態で fail 0 件の絶対条件を負う Case
- **予防策候補**: 完了条件の fail 件数条件には baseline 対照の前提を明示する。learning-promote での判断
- **想定反映先**: req-define / case-ready の完了条件定義ガイド、agentdev-quality-gates reference。learning-promote での判断
- **関連**: Case #3674、停止記録 6152686604、反映記録 6158011276、追跡Issue #3702、PR #3697
- **タグ**: `#qg-4` `#完了条件` `#baseline対照` `#由来分類`

## bash パイプ経路の終了コード観測は checker 本体の終了コードではない

- **問題事象**: case-close の検証で traceability check（check.ts）の終了コードを `bun run … | head` の後の `$?` で観測したところ EXIT=0 と表示された。実際には check.ts は summary.fail > 0 で意図的に exit 2 を返しており、観測した 0 はパイプ先 head の終了コードだった。誤って合格と解釈するところだった
- **発生局面**: case-close 実行時の checker 個別実行・実装
- **検知方法**: spawnSync による同一コマンド再実行で status=2 が出力され、bash パイプ経路の観測値と矛盾した
- **根本原因**: bash の `$?` はパイプライン最終コマンド（head）の終了コードを保持する。checker 本体の終了コードは pipefail 未設定では失われる
- **自律対応内容**: spawnSync（stdio 分離・status 取得）で checker を再実行し、status と stdout を分離して観測した。以降の checker 実行はパイプを経由させず、stdout/stderr 分離退避で証跡を成立させた
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: checker 個別実行の終了コード観測全般（exit code が意味を持つ checker は既知）。パイプ経由の観測で合格扱いにしない
- **再発条件**: 終了コードを検証根拠にする実行を `| head` 等のパイプ付きで実行した場合
- **予防策候補**: 終了コード観測を伴う検証実行はパイプを使わず、出力確認は退避ファイル読み戻しで行う
- **想定反映先**: checker 実行契約 Design「安定実行経路」節の補足、docs/knowledge。learning-promote での判断
- **関連**: Case #3704、agentdev-traceability check.ts
- **タグ**: `#bun` `#終了コード` `#パイプ` `#検証実行`

## node 経路では Bun.YAML 依存 checker が全 YAML 解析に失敗し疑似 fail が大量発生する

- **問題事象**: traceability check.ts を node --experimental-strip-types で実行したところ、YAML 解析が全件失敗し（Bun is not defined）、malformed-declarations 69 件・policy-invalid 1 件・missing 系の大量検出という疑似 fail を出力した（summary pass 6 / fail 5）
- **発生局面**: case-close 実行時の checker 個別実行・実装
- **検知方法**: case-run 記録（pass 8 / fail 3）と実行結果の大幅な不一致。findings の detail が「YAML 解析に失敗した（Bun is not defined）」であることを確認した
- **根本原因**: check.ts の YAML 解析は Bun ランタイム API（Bun.YAML）に依存する。node 経路（安定実行経路の import 実行）では Bun が存在しないため解析が失敗する
- **自律対応内容**: bun 依存 checker は bun 経路で実行する契約へ戻し、bun run + spawnSync 分離取得で再実行した。その結果 case-run 記録どおり pass 8 / fail 3（links 系 0・policy-invalid 0・malformed-declarations 0）を確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: Bun.YAML を使う checker は全部 node へ移行できない。「安定実行経路」は bun 非依存 checker に限定して適用する
- **再発条件**: Bun.YAML 依存 checker を node --experimental-strip-types で実行した場合
- **予防策候補**: checker 個別実行前に Bun 依存（Bun.* 参照）を確認する前置を checker 実行手順に加える。learning-promote での判断
- **想定反映先**: checker 実行契約 Design「Bun 依存 checker の実行経路」節、agentdev-traceability の実行手順。learning-promote での判断
- **関連**: Case #3704、agentdev-traceability scripts/src/check.ts
- **タグ**: `#bun` `#BunYAML` `#checker実行経路` `#疑似fail`

## close_mechanical_steps.ts の bun test 記録は stdout のみで機械受理基準の根拠にならない

- **問題事象**: case-close の pre-merge 機械工程 script（close_mechanical_steps.ts）が full-integrity-suite の detail に記録するのは bun test の stdout 先頭行のみで、件数サマリー（Ran N tests across M files、stderr 出力）と fail 明細が欠落した。script の報告 JSON 単体では件数突合・fail 由来分類の証拠が成立しなかった
- **発生局面**: case-close 実行時の機械工程・実装
- **検知方法**: script 報告 JSON の full-integrity-suite step が exit 1 を返したが、fail の明細・件数が報告内に存在せず、由来分類が不能だった
- **根本原因**: script の runner（spawnSync pipe）は bun test の stderr を内部捕捉するが、integrityResults へは stdout のみを保存する設計である（検証差分セクション規約は分離退避の接続点を stderr 出力ランナーの直接実行と定義しており、現行設計どおり）
- **自律対応内容**: 規約どおり bun test 3 分割を外部で stdout/stderr 分離退避付き（`>` と `2>`）に再実行し、件数突合（2909/115、591/43、700/44）と fail 3 件の由来分類（pre-existing 2・状態依存 1・本変更起因 0）の証跡を退避ファイルで成立させた
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 機械工程 script を使う他の close（Epic Wave ルート）でも同じ二重実行が必要になる
- **再発条件**: close_mechanical_steps.ts（phase pre-merge）の integrityGates に bun test を指定した場合
- **予防策候補**: bun test は script 経由ではなく直接実行（分離退避付き）を標準とし、script への integrityGates 指定は mergeable ポーリング等の他工程に限定する。learning-promote での判断
- **想定反映先**: agentdev-workflow-case-close references/docs-and-design-promotion.md の full integrity suite 節、close_mechanical_steps.ts の input 指針。learning-promote での判断
- **関連**: Case #3704、scripts/src/close_mechanical_steps.ts（agentdev-workflow-case-close）
- **タグ**: `#bun-test` `#証跡` `#機械工程` `#件数突合`

## prepare_definition_pr の入力 JSON を段階構築した際 definitionEdits が重複し旧文不在 fail が発生する

- **問題事象**: case-open STEP-4 で prepare_definition_pr.ts の入力 JSON を、updated 行編集のベース構築と draft 抽出による本文編集マージの 2 段階で構築したところ、同一行編集（frontmatter updated）が definitionEdits に二重に入り、2 回目の適用で旧文不在（not found）fail 5 件が報告され、script が stage・commit 前に停止した
- **発生局面**: case-open 実行時の機械工程・入力組み立て
- **検知方法**: script 報告 JSON の definition-edit fail 5 件（各ファイル 1 回）と、worktree 内 git diff で全実 edits が適用済みであることの突合不一致
- **根本原因**: 入力 JSON の段階的構築で段階間の edits 重複検証（同一 path + 同一 oldText の重複排除）を行わなかった
- **自律対応内容**: 報告 JSON と git 状態から適用済み工程を確認し、不足分なしとして definitionEdits を空にした冪等再実行（既存 worktree の期待 branch 再利用）で残り工程（generate_indexes、明示パス指定 stage・commit、check_integrity、traceability check）を実行して収束させた
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: prepare_definition_pr を model が手動組み立てで実行する case-open 実行全般。definitionEdits の構築は (path, oldText) 組の一意性検証と重複排除を通してから script へ渡す
- **再発条件**: 入力 JSON を複数段階（ベース + マージ）で構築して同一ファイルの同一行編集を二重に含めた場合
- **予防策候補**: definitionEdits 構築後に (path, oldText) 組で重複排除する前置検査を加える。script 入力検証側で重複 edits を拒否する案もある。learning-promote での判断
- **想定反映先**: agentdev-workflow-case-open references/definition-pr-and-idempotency.md の STEP-4 冪等再実行手順、prepare_definition_pr.ts の validateInput。learning-promote での判断
- **関連**: Case #3710、src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts
- **タグ**: `#case-open` `#機械工程` `#冪等再実行` `#入力重複`
