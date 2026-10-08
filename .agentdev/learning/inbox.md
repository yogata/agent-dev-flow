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

