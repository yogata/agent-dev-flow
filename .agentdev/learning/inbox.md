# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 新規起票直後の issue_list search トークン検索が空を返す（GitHub search インデックス遅延）

- **問題事象**: issue_create 直後の STEP-5 冪等検出で、search トークン「verification-infra」（作成済み Issue 本文に含む）による issue_list が空配列を返した。直前に issue_create 成功（VERIFY 済み）を確認した Issue #3550 は GitHub 上に実在する
- **発生局面**: 実装（case-open STEP-5 冪等検出。case-auto stage 1 からの委譲実行）
- **検知方法**: issue_list の検索結果が空であることと、直前の issue_create 成功報告（#3550）との矛盾
- **根本原因**: GitHub search API は新規 Issue を検索インデックスへ反映するまで時間差がある。起票直後の search トークン検索は該当 Issue をヒットさせない
- **自律対応内容**: search による検出を、既知番号の issue_read（#3550 直接読取で存在・本文・状態を確認）と issue_list の role=case + state=open フィルタ列挙へ切替して冪等検出を完了した。切替は「GitHub I/O 失敗時の gh CLI 切替継続手順」の再試行後切替規律に倣い、冪等キー基準は変更しなかった
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存手順内 contingency の適用のみ。新規契約・規則変更なし）
- **横展開観点**: case-ready 円等検出・Epic Wave 重複前置検出・兄弟 Case 検出など、search トークンで直近起票 Issue を探す全工程へ適用できる。role/state フィルタ列挙は search インデックス遅延の影響を受けない
- **再発条件**: issue_create 直後（数十秒〜数分以内）に、同じ対象を search トークンで検索した場合
- **予防策候補**: 起票直後の検出では search に依存せず、(1) 既知番号の issue_read による直接確認、(2) role/state フィルタによる列挙のいずれかで代替する。search は起票から十分な時間が経過した対象の検索に限定する
- **想定反映先**: agentdev-issue-management issue-operation-safety.md「issue_list の絞り込み規律と上限到達時 contingency」節への補足候補
- **関連**: Issue #3550、src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md「GitHub I/O 失敗時の gh CLI 切替継続手順」節
- **タグ**: `#issue_list` `#search-index-lag` `#idempotent-detection`

## 並行 case-open で関連 Jev 観測の先行 commit により partial commit が実体乖離する

- **問題事象**: case-open STEP-1 入口の先行明示パス commit で、自 Case の draft と関連 Jev 観測（req-define のバッチ構成評価。13 RU→4 draft 全体の共通観測）を commit 対象に含めたが、兄弟 Case（verification-infra）が同一観測を先行 commit（e6707290）済みだったため、自 commit（9929404b）には draft のみが含まれた。commit message は「persist ... req-draft and jev observation」であり、実体（1 ファイル）と message（2 資産）が乖離した
- **発生局面**: 実装（case-open STEP-1 untracked domain state 先行 commit。case-auto stage 1 からの委譲実行）
- **検知方法**: commit 後の出力「1 file changed」が、commit 対象に含めた 2 パスと不一致
- **根本原因**: バッチ共通の Jev 観測（subject が draft 群全体の構成評価）は複数 Case の関連観測として二重選定される。`git commit -- <paths>`（partial commit）は既に tracked になり差分のないパスを含めず、message との乖離が残る
- **自律対応内容**: 観測自体は永続化済み（兄弟 commit による）であり永続化の対は成立していたため、実害なしとして処理を継続した。message 修正（amend）は並行実行中の main 履歴に対して行わない
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存手順内での観測。契約変更なし）
- **横展開観点**: バッチ共通の Jev 観測・draft を複数 Case が commit する並行 case-open 全体。先行 commit の成否ではなく「commit message に挙げた資産が実在するか」を commit 直前に照合する規律が有効
- **再発条件**: 複数 Case が同一の共通観測（バッチ構成評価等）を関連観測として commit 対象に含め、片方が先行した場合
- **予防策候補**: 先行明示パス commit の message は、`git add` 後に `git status --short` で実際に新規 untracked のまま残っている対象のみを列挙して組む（既に tracked な対象を message に含めない）
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/handoff.md「入口の untracked domain state 検出と先行明示パス commit」節への補足候補
- **関連**: Issue #3548、commit 9929404b・e6707290、Issue #3550 の学び（search インデックス遅延）と同系統の並行実行 contingency
- **タグ**: `#case-open` `#jev-observation` `#parallel-case-open` `#commit-message-accuracy`

## prepare_definition_pr script の品質ゲートを worktree cwd で組み立て junction 未伝播で traceability-check が実行不能になる

- **問題事象**: case-open STEP-4 の prepare_definition_pr script 呼び出しで、traceabilityGate の cwd を worktree root に組み立てたところ、worktree 内 .opencode/skills/ に agentdev-traceability が存在せず（junction 未伝播。repo-agentdev-integrity のみ実在）、check.ts 実行が exit 1 で失敗し、script 全体が failure 終了した（commit fad8e0c2 までの工程は成功済み）
- **発生局面**: 実装（case-open STEP-4 機械工程の script 呼び出し。case-auto stage 1 からの委譲実行）
- **検知方法**: script 報告 JSON の traceability-check step が status fail（exit 1、summary 空）で終了。worktree 内 .opencode/skills/ の実測で agentdev-traceability 不在を確認
- **根本原因**: worktree 構造的制約（agentdev-* junction は worktree へ伝播しない）は既知で reference に fallback 手順（main root 実体 + --root 指定）が記載されているが、script 入力の GateCommandSpec を組み立てる段階で「実行コマンドの解決は main root」「検査対象の --root は worktree」の2層を混同し、両方を worktree cwd に置いた
- **自律対応内容**: 冪等再実行規律に従い、適用済み工程（worktree・edits・commit）を再実行せず不足分のみ補完した。traceability check を main root の実体（.opencode/skills/agentdev-traceability/scripts/src/check.ts）で --root <worktree> 指定により実行し 9/9 pass を確認。generate_indexes の派生物（docs/README.md）が stage 対象外で残っていたため、明示パス commit を追加実行（077bf06f）し、check_integrity を commit 済み HEAD で再実行して pass を確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存 fallback 手順の適用。契約変更なし）
- **横展開観点**: prepare_definition_pr script へ GateCommandSpec を渡す全 case-open / case-revise 実行。実行コマンドの解決 cwd と検査対象 --root の2層を区別して組み立てる
- **再発条件**: worktree 内実行前提の GateCommandSpec（cwd = worktree root、command に junction 系 .opencode/skills パス）で script を呼び出した場合
- **予防策候補**: junction 系 checker（agentdev-traceability 等）を用いる gate は cwd = repoRoot（main root 実体）+ args に --root <worktree> を渡す形式で組み立てる。generate_indexes が派生物を自動更新する場合、Decision/REQ 変更を伴う Case では派生物パス（docs/README.md 等）を stagePaths に明示包含する
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md「機械工程の script 呼び出し（prepare_definition_pr）」節への補足候補
- **関連**: Issue #3549、PR #3554、src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts、commit fad8e0c2・077bf06f
- **タグ**: `#case-open` `#worktree` `#junction-unpropagated` `#traceability-check` `#prepare-definition-pr`

## prepare_definition_pr の generate_indexes 派生物が stagePaths 外で残り追加 commit で補正した

- **問題事象**: case-open STEP-4 の prepare_definition_pr script 実行で、generate_indexes が派生物（docs/designs/quality/req-health-metrics.md の REQ 行数 AUTOGEN）を自動更新したが、入力の stagePaths に含めておらず、Definition commit（3727aafa）から漏れて working tree に dirty 残存した
- **発生局面**: 実装（case-open STEP-4 機械工程。case-auto stage 1 からの委譲実行）
- **検知方法**: script 報告 JSON の diff.changedFiles に stagePaths 外の req-health-metrics.md が含まれていることを意味レビューで確認
- **根本原因**: generate_indexes の派生物変化は script 実行後に確定するため、呼出側が入力 JSON を組み立てる時点では派生物パスの変化有無を確定できない構造的ギャップ（stagePaths は実行前の入力として固定される）
- **自律対応内容**: 派生物の diff 内容（REQ-008 行数 61→62、REQ-059 行数 5→6）を確認し、明示パス指定で追加 commit（441bddbd）して派生物を同一 PR に包含。check_integrity と traceability check を commit 済み HEAD で再実行し pass を確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（reference の Evidence 契約「派生物が同一 PR に含まれること」への遵守補正）
- **横展開観点**: 既存学び（generate_indexes 派生物の stagePaths 明示包含）の予防策を適用した実行でも、REQ 行数系 AUTOGEN（req-health-metrics.md）は事前特定が難しい。changedFiles の後段確認と追加 commit を標準 contingency として扱う
- **再発条件**: REQ 行追加・Decision 変更を伴い generate_indexes が REQ 行数系 AUTOGEN（req-health-metrics.md 等）を更新する Definition 編集
- **予防策候補**: prepare_definition_pr 実行後の changedFiles 突合を標準手順化し、stagePaths 外の派生物を自動検出した場合は明示パス commit で補正する（既存学びの docs/README.md と req-health-metrics.md を合わせた派生物候補一覧の整備）
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md の機械工程節への補足候補
- **関連**: Issue #3552、PR #3555、commit 3727aafa・441bddbd、既存学び「prepare_definition_pr script の品質ゲートを worktree cwd で組み立て…」（docs/README.md 同型）
- **タグ**: `#case-open` `#generate-indexes` `#stage-paths` `#derived-artifact` `#prepare-definition-pr`

## yomiyasu 検査専用本文ファイルの workspace 外作成指示が書込み guard に fail-closed ブロックされ project root 内へ切替した

- **問題事象**: case-open STEP-2 の extension rule（yomiyasu-application-before-write）に従い Root Case 本文候補を「非永続領域〔一時ディレクトリ等のリポジトリ外〕」へ Write しようとしたところ、agentdev-textlint-guard の workspace 外書込み guard が fail-closed ブロックした
- **発生局面**: 実装（case-open STEP-2 Root Case 本文候補生成の yomiyasu lint 前段）
- **検知方法**: Write ツールが guard 拒否（write targets a path outside the project root; blocked per fail-closed）を返した
- **根本原因**: extension rule の指示（検査専用本文ファイルをリポジトリ外へ作成）と workspace 外書込み guard（fail-closed）が環境上衝突する。rule 側は guard の存在を前提にしていない
- **自律対応内容**: guard の解除・迂回を行わず、AGENTS.md の標準手段切替指針に従い project root 内の git 管理対象外領域（.agentdev/integrity/reports/）へ検査専用ファイルを配置して lint を実行し、検査後に削除した（inspect_cross_dependencies scripts/README.md の一時ファイル置き場所方針と同一準拠）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（動作基準の遵守。契約変更なし）
- **横展開観点**: 検査専用一時ファイルが必要な全工程（yomiyasu lint、横断依存検査入力 JSON、prepare_definition_pr 入力 JSON）。workspace 外書込み guard が有効な環境では project root 内非管理領域を既定の置き場所とする
- **再発条件**: workspace 外書込み guard が有効な環境で、extension rule や手順文書がリポジトリ外への一時ファイル作成を指示した場合
- **予防策候補**: extension rule（yomiyasu-application-before-write）の手順表現を「リポジトリ外がブロックされる環境では project root 内の git 管理対象外領域へ切替する」旨へ補足する
- **想定反映先**: .agentdev/extensions/skills/agentdev-workflow-case-open.yaml の rules 表現補足、docs/knowledge/ への切替パターン記録候補
- **関連**: Issue #3552、.agentdev/extensions/skills/agentdev-workflow-case-open.yaml、agentdev-git-worktree reference「書込み guard 運用指針」
- **タグ**: `#write-guard` `#fail-closed` `#yomiyasu` `#temp-file-placement`


## case-open が Definition PR へ yomiyasu 適用記録を残さず case-ready 受入ゲートが merge を抑止した

- **問題事象**: case-ready STEP-1 の acceptance_gates 前置確認で、Definition PR #3551（docs 配下の日本語追記 2 件を含む）の本文・コメントに yomiyasu 適用記録（対象、実施結果、保持した指摘理由）が存在せず、merge を実行できずに blocked 停止した
- **発生局面**: 実装（case-ready STEP-1 受入検査。case-auto stage 2 からの委譲実行）
- **検知方法**: acceptance_gates[2]（yomiyasu 適用記録が PR 上に存在すること。不足時はマージせず対象文章の修正へ差し戻し）の前置確認で pr_read 本文と comment_list の双方に記録が見つからなかった
- **根本原因**: case-open 側（PR 作成者）が yomiyasu-application-before-write rule の記録義務（既存 PR 検証欄等への最小限記録）を履行しないまま PR を作成した。適用の実施有無と記録の存在が別管理で、記録が存在しないと適用済みを証明できない構造
- **自律対応内容**: merge を実行せず既存 PR、draft、RU 3 件を保持したまま blocked 停止。停止記録コメント（停止理由、受入検査実行結果、再開条件）を Root Case #3550 へ投稿した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（既存 acceptance_gates 契約の適用。契約変更なし）
- **横展開観点**: docs 配下の日本語変更を含む Definition PR を作成する全 case-open 実行。PR 作成直後に yomiyasu 適用記録コメントを投稿するまでを case-open STEP-4 の完了条件として扱うと、case-ready の再委譲往復を防げる
- **再発条件**: case-open が yomiyasu 適用を実施・未実施のいずれであっても記録コメントを投稿せず PR を作成した場合
- **予防策候補**: case-open 側 reference（definition-pr-and-idempotency.md）の PR 作成手順へ「docs 配下日本語変更を含む PR では作成直後に yomiyasu 適用記録を PR へ記録する」工程の追加
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md の PR 作成節、.agentdev/extensions/skills/agentdev-workflow-case-open.yaml の rules 表現補足
- **関連**: Issue #3550、PR #3551、.agentdev/extensions/skills/agentdev-workflow-case-ready.yaml（acceptance_gates[2]）
- **タグ**: `#case-ready` `#case-open` `#yomiyasu` `#acceptance-gates` `#definition-pr`

## accept_definition_checks の overlap summary が空の detection_unavailable を true と表示した

- **問題事象**: case-ready STEP-1 の accept_definition_checks script 実行で、overlap-cross-check の summary が「detection_unavailable=true」と表示した。エンジン（inspect_cross_dependencies.ts）の直接実行では detection_unavailable は空配列で、検出不能は発生していなかった
- **発生局面**: 実装（case-ready STEP-1 受入検査の機械工程）
- **検知方法**: script 報告 JSON の summary と、同一入力でのエンジン直接実行による報告 JSON の突合
- **根本原因**: accept_definition_checks.ts の summary 組み立てが `parsed.detection_unavailable != null` 判定で、空配列も存在扱いして true 表示になる（ゲート判定は exitCode のみで影響なし。表示欠陥）
- **自律対応内容**: エンジン報告 JSON の直接読取で検出不能 0 件を実測確認し、表示欠陥として学びへ記録した（script 本体は修正していない）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（表示欠陥の記録。契約変更なし）
- **横展開観点**: accept_definition_checks script の報告 JSON を意味レビューする全 case-ready / case-revise 実行。summary の detection_unavailable 表示は前提としてエンジン報告の直接確認で裏付けを取る
- **再発条件**: detection_unavailable が空配列のまま script 経由の summary を読む場合（常時）
- **予防策候補**: summary 組み立てを `Array.isArray(v) && v.length > 0` 判定へ修正する。合わせて script のユニットテストへ空配列ケースの追加
- **想定反映先**: src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts の summary 組み立て箇所と scripts/tests/accept_definition_checks.test.ts
- **関連**: Issue #3550、src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts（runAcceptDefinitionChecks の overlapSummary 組み立て）
- **タグ**: `#case-ready` `#accept-definition-checks` `#overlap-cross-check` `#display-defect`

## targeted docs guard の worktree 実行で --root に MSYS 形式パスを渡すと TARGET-EMPTY で誤検出する

- **問題事象**: worktree での targeted docs guard コミット前実行で、--root に bash の $(pwd)（MSYS 形式 /c/...）を渡すと files_checked 0 で TARGET-EMPTY が表示された
- **発生局面**: case-run 実装（worktree 内での検証実行）
- **検知方法**: targeted docs guard の stdout（files_checked 0）と実変更 3 ファイルの突合
- **根本原因**: MSYS 形式パス（/c/...）が script の root 解決で実在ディレクトリとして解決されず、検査対象が空になった（解決経路の詳細は未検証）
- **自律対応内容**: --root を $(pwd -W)（Windows 形式）に変更して再実行し、files_checked 3・failures 0 で pass を取得。初回の TARGET-EMPTY 1件は実行環境誤りとして検証結果から無効化
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree 内で --root を明示指定する全検査 script（check_integrity、traceability check、generate_indexes 等）の実行手順
- **再発条件**: bash の $(pwd) をそのまま --root へ渡す場合（常時）
- **予防策候補**: 検査手順 reference に $(pwd -W) の使用を明記する。cli_utils 側で MSYS 形式パスを検出した場合に入力エラーとして報告する案もある
- **想定反映先**: src/common/skills/agentdev-workflow-case-run の検証手順 reference、src/common/skills/repo-agentdev-integrity/scripts/cli_utils.ts
- **関連**: Issue #3552、PR #3557
- **タグ**: `#case-run` `#targeted-docs-guard` `#msys` `#worktree` `#windows`

## 長時間機械工程は shell 既定 timeout の foreground 実行で打ち切られるため背景起動と証跡ファイル退避で実行する

- **問題事象**: case-close 機械工程 script（mergeable ポーリング+traceability+フル suite 3 分割+textlint 最終 gate、実測約 7.5 分）を foreground の bash ツール呼び出しで起動したところ、既定 timeout 120s で tool 呼び出しが切断された
- **発生局面**: case-close 実装（機械工程 script 実行）
- **検知方法**: shell tool の timeout メタデータ出力（terminated command after exceeding timeout 120000 ms）
- **根本原因**: 機械工程の実測所要時間（suite ① 286.66s + ③ 173.11s + textlint gate が合計 460s 超え）が tool 呼び出し既定 timeout を大きく超える。打ち切りが子プロセス（bun）の即時 kill を伴わない Windows 環境の挙動を事前に想定していなかった
- **自律対応内容**: 機械工程の各 gate 出力を spawnSync から `.agentdev/tmp/` 配下の stdout/stderr 分離ファイルへ退避する input を組んだ上で、`(bun script --input in.json > report.json 2> report.err; echo $? > report.exit) &` の形式で背景起動した。tool 呼び出し切断後も bun プロセスが生存して完了し、report.exit の出現で完了を検知して報告 JSON と全 gate 証跡を回収した（Issue 3548 の case-close で実証）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: full integrity suite、textlint 全件走査、AUTOGEN 再生成など 120s を超え得る機械工程全般。証跡の stdout/stderr 分離退避と exit code ファイル化を前提にすれば、切断耐性のある実行形態になる
- **再発条件**: 長時間機械工程を foreground 実行し、かつ証跡退避がメモリ（spawnSync の stdout 捕捉）のみの場合。その場合は打ち切りと同時に証跡が失われる
- **予防策候補**: 長時間機械工程の実行指示には timeout 明示指定（600s 標準）に加え、背景起動+証跡ファイル退避+exit ファイルポーリングの実行形態を標準候補として併記する
- **想定反映先**: case-close / case-run の機械工程実行手順（references または docs/knowledge）
- **関連**: Issue 3548、src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts
- **タグ**: `#case-close` `#mechanical-steps` `#harness` `#timeout`
