# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## docs-only SPEC 変更で AUTOGEN block 索引の再生成 commit が欠落し case-close の E5b 前段 gate で検出

- **問題事象**: PR 2253（docs-only、SPEC 2ファイルの行数変動）に AUTOGEN block 索引 docs/specs/quality/spec-health-metrics.md の再生成 commit が含まれていなかった。マージ後の case-close E5b 前段検証で generate_indexes.ts --dry-run の WOULD UPDATE が検出され、Epic Wave クローズが停止した。
- **発生局面**: 実装（case-run の PR 作成）、レビュー（case-close の Wave クローズ検証）
- **検知方法**: workflow extension check（autogen-index-regeneration-diff）による bun run generate_indexes.ts --dry-run の WOULD UPDATE 行。マージ前 baseline 5d89b9df では差分なしであり、PR 2253 由来と確定した
- **根本原因**: case-run が docs-only 変更で SPEC 行数計上ファイル（spec-health-metrics.md）への影響を認識せず、PR 作成前に dry-run 差分確認と再生成 commit を実施しなかった
- **自律対応内容**: case-close は契約どおり索引ファイルを直接編集・commit せず E5b 前段で停止し、再生 commit を case-run 責務として case-auto（委譲元）へブロック報告した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（case-close SPEC Step 3-3 の設計どおりに検出・停止。case-run 側手順の運用徹底が課題）
- **横展開観点**: docs-only PR でも SPEC の行数・status を変える変更は AUTOGEN 索引に反映される。case-run は PR 作成前に dry-run を実行し WOULD UPDATE があれば再生成を commit する
- **再発条件**: SPEC ファイルの行数・status を変える docs 変更で case-run が generate_indexes.ts を実行しない場合
- **予防策候補**: case-run の PR 作成手順へ generate_indexes.ts --dry-run（差分なし確認または再生成 commit）を組み込む
- **想定反映先**: case-run command / agentdev-workflow-case-run の PR 作成手順
- **関連**: docs/specs/commands/case-close.md Step 3-3、.agentdev/extensions/skills/agentdev-workflow-case-close.yaml、PR 2253、Issue 2203
- **タグ**: #case-run #autogen #index

## ng-baseline.json の環境別表記重複 entry は正規化導入後に冗長化する

- **問題事象**: ng-baseline.json の case-close.md command-capture-duty に src / .opencode の環境別表記 entry が二重で存在していた（Issue 2179 暫定措置由来）。PR 2254 のパス bucket key 正規化導入後、これらは同一 bucket key へ衝突する冗長な entry となった。
- **発生局面**: 実装（case-run の checker 修正）、運用（baseline 管理）
- **検知方法**: 正規化実装時の衝突挙動分析（同一論理 NG の環境別観測として max 採用する設計検討の中で特定）
- **根本原因**: 環境依存のパス表記を bucket key が含んでいた従来仕様で、環境ごとに entry が追加されていた
- **自律対応内容**: 手書き削除は機械生成必須契約（integrity-contracts「baseline entry 運用契約」(1)）に反するため実施せず、次回 `--update-ng-baseline --ng-baseline-additions` 実行時に自然に単一 entry へ統合される見込みを記録した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用知見。正規化衝突時 semantic の SPEC 明文化は別途 intake item 化済み）
- **横展開観点**: baseline 更新は並列 Wave 実行中に実施しない（同一 baseline 二重更新禁止）。冗長 entry の解消は次回の一括再生成タイミングに乗せる
- **再発条件**: 環境別表記の baseline entry が残存する状態で正規化のみ先行導入した場合
- **予防策候補**: baseline 再生成のタイミング（直列実行可能な時期）で環境別表記 entry を機械的に統合する
- **想定反映先**: integrity-contracts SPEC の NG baseline 運用手順運用（docs-check 運用）
- **関連**: PR 2254、Issue 2206、docs/specs/integrity/integrity-contracts.md「baseline entry 運用契約」
- **タグ**: #integrity #ng-baseline #normalization

## case-close の SPEC 昇格（draft → accepted）は spec-health-metrics AUTOGEN 差分を生む

- **問題事象**: Epic 2205 Wave 1 クローズで checker-execution-contracts SPEC を draft から accepted へ昇格した結果、マージ後の E5b 前段 gate では差分ゼロだった generate_indexes.ts --dry-run に WOULD UPDATE: docs/specs/quality/spec-health-metrics.md が新たに発生した。
- **発生局面**: レビュー（case-close の SPEC 確定フロー STEP-3-2）
- **検知方法**: SPEC 昇格編集後に dry-run を再実行したことで検出（フロー内の自己確認）
- **根本原因**: spec-health-metrics が SPEC の status を計上対象とするため、case-close 自身の昇格編集も AUTOGEN 索引差分の発火要因になる。PR 2253 由来の既知学び（case-run の PR 作成側面）と同型だが発火主体が異なる
- **自律対応内容**: AUTOGEN 索引ファイルは直接編集・commit せず、SPEC frontmatter と docs/specs/README.md status 列（追跡情報源）のみ更新し、再生成 commit を case-auto（case-run 責務）への引継ぎ事項として報告した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（spec-lifecycle-application の昇格手順どおり。README status 列は case-close の更新責務）
- **横展開観点**: SPEC の status・行数を変える操作は発火主体（case-run か case-close か）を問わず AUTOGEN 差分を生む。昇格実施後は dry-run を再実行して差分有無を確認する
- **再発条件**: case-close が SPEC 昇格を実施し、昇格後の dry-run 再確認と case-auto への引継ぎ報告を省略した場合
- **予防策候補**: case-close の SPEC 確定フローへ「昇格後 dry-run 再実行・差分は引継ぎ報告」を明示する
- **想定反映先**: agentdev-workflow-case-close の docs-and-spec-promotion STEP（references/docs-and-spec-promotion.md）
- **関連**: Issue 2209、Epic 2205、docs/specs/integrity/checker-execution-contracts.md、docs/specs/quality/spec-health-metrics.md、先行学び（PR 2253、Issue 2203 の entry）
- **タグ**: #case-close #autogen #spec-lifecycle

## untracked な bun install 成果物（scripts/node_modules）が worktree フルスイートで順序依存失敗を生む

- **問題事象**: scripts/node_modules（untracked・bun install 成果物）が存在する worktree で full integrity suite を実行した際のみ、launcher-blockers（archive-builder）テストが順序依存で失敗した。単体再実行では合格、node_modules 除去（main 等価環境）でも合格。
- **発生局面**: 実装（case-run の検証実行、worktree 環境）
- **検知方法**: 帰属確認二段階手順（単体再実行→base/main 再現）による環境起因の切り分け（git-worktree-test-fallback SPEC の手順適用）
- **根本原因**: untracked 成果物がテスト列挙・実行順序に影響し、フルスイート時のみ発現する順序依存を作る
- **自律対応内容**: main と同一条件（node_modules 未導入）で再検証して合格を確認した。node_modules は commit 対象外
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（SPEC の帰属確認手順どおりに環境起因と判定できた事例）
- **横展開観点**: worktree に untracked のビルド成果物・依存残骸が残っている場合、フルスイート結果の信頼性評価前に有無を確認する
- **再発条件**: worktree へ bun install 等で node_modules を導入した後に削除せずフルスイートを実行する場合
- **予防策候補**: フルスイート実行前の untracked 成果物確認（git status で scripts/node_modules 等の有無を確認）を検証手順に組み込む
- **想定反映先**: agentdev-git-worktree の worktree 運用手順、case-run の検証手順
- **関連**: PR 2261、Issue 2214、docs/specs/skills/agentdev-git-worktree-test-fallback.md
- **タグ**: #worktree #bun-test #order-dependent

## projection/source 構成差が Ran N tests の N/M 件数突合を環境間でずらす

- **問題事象**: skills_structure.test.ts の REQ-018-001 worktree fallback により scan 対象が projection（main: .opencode/skills）↔ source（worktree: src/opencode/skills）で切り替わり、両ツリーの構成差（projection のみ repo-agentdev-integrity、source のみ agentdev-workflow-backlog-auto 等）によって main と worktree の Ran N tests が4件（462↔466）ずれた。
- **発生局面**: レビュー（bun test 実行形態契約 AG-035 の N/M 件数突合運用）
- **検知方法**: 両環境のフルスイート実行結果突合で 2036 vs 2040 の差を観測し、構成差による生成テスト数変動と特定
- **根本原因**: 件数突合は環境間比較を前提とするが、fallback により環境ごとにスキャン対象ツリー自体が変わる
- **自律対応内容**: 4件差は仕様どおりの fallback 挙動でコード差ではないことを PR 本文に記録し、突合の前提情報として明示した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（AG-035 の運用注記として扱い、SPEC 変更不要の判断）
- **横展開観点**: N/M 件数突合は「直前実績との急減検知」が本質であり、環境差による増減は構成差の説明付きで許容する
- **再発条件**: main と worktree で junction 有無による構成差がある環境で件数突合を実施する場合
- **予防策候補**: 件数突合時に実行環境（main/worktree）と scan 対象ツリーの構成差を証拠記録に併記する
- **想定反映先**: agentdev-quality-gates SPEC の full integrity suite 運用、case-close STEP-3-1 の full integrity suite 実行手順
- **関連**: PR 2261、Issue 2214、docs/specs/skills/agentdev-quality-gates.md
- **タグ**: #bun-test #count-check #worktree

## backlog 統合バッチの旧スナップショット分析から生成した Issue が作成時点で解消済みになる

- **問題事象**: OU-0027（Issue 2222）の2成果物（テスト期待値更新・Epic 2134 クローズ）は、いずれも Issue 作成（2026-08-18 10:59 UTC）より前に PR 2155（08-16 02:26 マージ）と Epic クローズ（08-16 02:43）で完了していた。元分析（RU-0072）は PR 2155 マージ前のスナップショット由来で、no-change 完了（PR なし・完了判定記録コメントで close）となった。
- **発生局面**: backlog-review（RU 生成）、case-open（Issue 作成）
- **検知方法**: case-run 実行前の現状再検証で、期待値リテラルが実番号形式「### STEP-3-1:」へ更新済みであることと Epic 2134 が CLOSED であることを確認
- **根本原因**: backlog 統合バッチで旧スナップショット由来の分析（RU）から Issue を生成する際、Issue 作成時点の最新 main での再検証を経ないまま Issue 化した
- **自律対応内容**: 完了判定記録コメント（issuecomment-5329083755）を SSoT として no-change 完了扱いとし、PR 作成不能（同一 HEAD 間は GitHub が拒否）の制約を記録した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 分析から Issue 生成まで時間差がある経路（backlog 統合バッチ）では、Issue 作成時に主要な完了条件を最新 main で再検証する工程が重複 Issue を防ぐ
- **再発条件**: 旧スナップショット由来の RU から生成した Issue の対象が、生成前のマージで既に解消している場合
- **予防策候補**: case-open（backlog 経路）に Issue 作成前の完了条件現状確認（already-done 検出）を組み込む
- **想定反映先**: agentdev-workflow-case-open の preflight、agentdev-backlog-integration
- **関連**: Issue 2222、RU-0072、PR 2155、Epic 2134、Issue 2219（同型の no-change 完了）
- **タグ**: #backlog #case-open #freshness

## PR 検証時 base とマージ時点 main の checker NG 状態が乖離する（base drift）

- **問題事象**: PR 2260 の検証（base = origin/main 27e8d199）では lint_skills.ts は NG 0 だったが、マージ後 main（1e3d9729）では AG-005 NG 1件（agentdev-git-worktree/references/worktree-operations.md、336行・目次なし）が検出された。差の原因は検証 base とマージ時点の間にマージされた PR 2257（bcb72c07）が当該ファイルを目次なし336行に成長させたこと。PR 本文の「NG 0」は検証 base 時点では正当。
- **発生局面**: 実装（case-run の checker 検証）、レビュー（case-close の post-merge 検証）
- **検知方法**: case-close の post-merge（main）checker 再実行で NG を検出。git log で worktree-operations.md の最終変更（bcb72c07）が両 PR（#2259/#2260）の変更対象外かつ task baseline 9813eba0 の祖先であることを確認
- **根本原因**: checker 検証は検証時点の base ツリーに対する絶対判定であり、並行マージされる他 PR が checker 状態を変化させ得る
- **自律対応内容**: Epic 完了条件3 の評価スコープ（AG-004 検出語統一）には影響しないことを確認し、AG-005 NG は Findings + intake item 化して記録した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: PR 本文の checker 合格記録は「検証 base 時点」の証拠。マージ後に checker 状態が変わる可能性があるため、case-close の post-merge checker 再実行（main）は base drift 検出の実効手段
- **再発条件**: PR 検証からマージの間に、checker 違反を増やす他 PR が main へマージされる場合
- **予防策候補**: case-close の post-merge 検証で lint_skills/check_workflow_preventive を main で再実行し、PR 検証時と差分があれば由来分類して記録する
- **想定反映先**: agentdev-workflow-case-close の Epic Wave クローズ E4 手順
- **関連**: PR 2260、PR 2257、Epic 2218、Issue 2220
- **タグ**: #case-close #checker #base-drift

## bun install 成果物のサードパーティ README が実配布物スキャンに引っかかる実行順序依存が存在した

- **問題事象**: base a08384a2 時点では `bun install` で生成される scripts/node_modules 配下のサードパーティ README（CRLF 混在）が repo-integrity の TS-009 実配布物スキャンに引っかかる実行順序依存が存在した。origin/main 側での node_modules 除外により解消済みのため、PR 2262 では非顕化だった。
- **発生局面**: 実装（case-run の検証実行、worktree 環境、bun install 実行後の検査実行）
- **検知方法**: base a08384a2 時点での TS-009 実配布物スキャン実行（PR 2262 本文の記録）
- **根本原因**: untracked な bun install 成果物（scripts/node_modules）が検査対象に混入し、実行順序（install → 検査）によって検査結果が変化する
- **自律対応内容**: origin/main 側で node_modules が除外済みとなったことで解消した。PR 2262 では非顕化として PR 本文への記録のみ実施した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 実配布物スキャンとテスト実行の双方で untracked 成果物の有無が結果を左右する。検査前に untracked 成果物の有無を確認する先行学び（PR 2261）と同根の worktree 環境起因
- **再発条件**: bun install 実行済みの worktree で、node_modules 除外が効いていない base に対して実配布物スキャンを実行する場合
- **予防策候補**: 検査実行前の untracked 成果物確認（git status で scripts/node_modules 等の有無を確認）を検証手順に組み込む
- **想定反映先**: agentdev-git-worktree の worktree 運用手順、case-run の検証手順
- **関連**: PR 2262、Issue 2204、先行学び（scripts/node_modules のフルスイート順序依存、PR 2261・Issue 2214 の entry）
- **タグ**: #worktree #bun-install #ts-009

## augmentation の意味定義・役割宣言追加が変更対象成果物リストに事前明示されないまま実施された

- **問題事象**: augmentation の意味定義・役割宣言追加（`.agentdev/artifact-graph.yaml`）は Issue 2204 の変更対象成果物リストに明示されていなかった。TIM 語彙カタログ SPEC が拡張関係型の意味定義場所を augmentation 宣言と定めているため、カタログ定義への置換の実体として実施し、解釈の明示を PR 2262 本文に記録した。
- **発生局面**: 要件定義（case-open の execution contract 生成）、実装（case-run）
- **検知方法**: 実装時の変更対象成果物リストと実際の変更内容の突合（PR 本文への解釈明示として記録）
- **根本原因**: カタログ定義への置換に伴う augmentation 宣言の追従変更が、execution contract の変更対象成果物リスト作成時点で見えていなかった
- **自律対応内容**: TIM 語彙カタログ SPEC の定める意味定義場所に従い augmentation 宣言として実施し、解釈を PR 本文に明示した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（augmentation 変更の実行契機明示の SPEC 層への取込みは intake item 化済み）
- **横展開観点**: 関係意味・語彙の変更では定義場所（カタログ本体か augmentation 宣言か）を先に確定し、変更対象成果物リストへ反映する
- **再発条件**: 拡張関係型の意味定義や役割宣言の変更を伴う Issue で、変更対象成果物リストに augmentation 宣言を明示しない場合
- **予防策候補**: 語彙・関係意味の変更を伴う Issue の execution contract で augmentation 宣言（`.agentdev/artifact-graph.yaml`）を対象成果物候補として確認する
- **想定反映先**: agentdev-workflow-case-open の execution contract 生成、REQ-017 Issue Execution Contract 運用
- **関連**: PR 2262、Issue 2204、docs/specs/foundations/traceability-model.md、docs/specs/skills/agentdev-artifact-graph.md
- **タグ**: #execution-contract #augmentation #tim

## full suite の pre-existing fail 構成がタスクコンテキストの baseline 表記と環境実測で乖離した

- **問題事象**: PR 2265 作成時のタスクコンテキストは full suite の pre-existing fail を「IR-055 delta 2 件 + checkWorkflowPreventive」の 2 fail と表記していたが、検証環境の実測は「checkWorkflowPreventive + checkExtensions（real skill tree 分類）」の 2 fail だった。IR-055 delta は当該 PR で解消済み、checkExtensions は pristine main チェックアウトでも失敗する環境依存（junction 未伝播）であり、baseline 表記と実測で fail 構成が入れ替わって観測された。
- **発生局面**: 実装・検証（case-run の worktree 環境での full suite 実行）
- **検知方法**: PR 本文 Findings への乖離記録。pristine main チェックアウトでの再現確認（PR 2265 本文に記録）
- **根本原因**: pre-existing fail の構成が環境（junction の有無・node_modules の有無）と base 時点で変動するため、タスクコンテキスト渡し時点の静的な baseline 表記が実測と乖離する
- **自律対応内容**: 各 fail の帰属を pristine main 再現で切り分け、PR 本文 Findings に乖離を記録した。merged main（junction 実体あり・node_modules インストール済み）では 2062 pass / 0 fail となり環境依存でないことを case-close の post-merge 検証で確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（既知 intake item「checkExtensions integration テストの worktree 環境失敗（ジャンクション未伝播）」と同根の観測）
- **横展開観点**: pre-existing fail を個数だけでなく「構成」（どのテストが fail か）で扱わない限り、fail の増減判定にノイズが混入する。環境要因の fail は環境ラベル付きで記録する
- **再発条件**: worktree・pristine checkout 等 junction が伝播しない環境で full suite を実行する場合
- **予防策候補**: full suite 実行記録への環境ラベル（junction 有無・node_modules 有無）添付。環境依存 fail のカタログ化
- **想定反映先**: case-run の検証手順、agentdev-git-worktree の worktree 環境要件
- **関連**: PR 2265、Issue 2210、intake item 2026-08-19-checkextensions-worktree-junction-fail.md
- **タグ**: #full-suite #pre-existing #environment-dependent

## 計測日導出規則変更を跨いだ OPEN PR の AUTOGEN 計測日がマージ後に新規則 dry-run で WOULD UPDATE になる

- **問題事象**: PR 2270（Issue 2241、AUTOGEN 計測日の日次再生成）のブランチ（base 271a99fa）は a113bd67（計測日を実行時日付から最終コミット日付基準へ変更、PR 2267）を含まない base で旧規則により req-health-metrics.md の計測日を 2026-08-19（実行時日付）へ再生成していた。マージ後 main（新規則）で generate_indexes.ts --dry-run を実行すると WOULD UPDATE 1件（導出値 2026-08-18 = REQ コーパス最終コミット df916807 の日付）が検出された。
- **発生局面**: レビュー（case-close の post-merge AUTOGEN 鮮度検証）
- **検知方法**: マージ後 main での bun run generate_indexes.ts --dry-run の WOULD UPDATE 行。git merge-base --is-ancestor a113bd67 fcdeaafc で PR ブランチが規則変更コミットを含まないことを確定
- **根本原因**: 生成器自身の導出規則が PR 検証時 base とマージ時点 main の間で変更された（base drift）。PR 時点の再生成は当時の規則では正当
- **自律対応内容**: case-close 検出分として generate_indexes.ts 再生成を commit e989b296 で実施し、再 dry-run で WOULD UPDATE 0 を確認した（先行例 cc32395c と同じ回復手段）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（autogen-freshness-gate SPEC「不合格時の処置」どおりの回復。規則自体は a113bd67 で確定済み）
- **横展開観点**: checker 状態の base drift（PR 2260 の先行学び）と同型だが、生成器の導出規則変更という新局面。AUTOGEN 索引を再生成する PR は、生成器の規則変更コミットが base に含まれるかを確認してから再生成する
- **再発条件**: AUTOGEN 再生成済みの OPEN PR が、導出規則変更コミットのマージを跨いでマージされる場合
- **予防策候補**: 生成器の規則変更が main にマージされたタイミングで、AUTOGEN 再生成を含む OPEN PR の再生成結果を新規則で再評価する
- **想定反映先**: case-run の AUTOGEN 再生成手順、agentdev-workflow-case-close の post-merge 検証
- **関連**: PR 2270、Issue 2241、コミット a113bd67（PR 2267）、e989b296、先行学び（base drift、PR 2260 の entry）
- **タグ**: #case-close #autogen #base-drift

## X-4 一文一行分割が IR-055 の {...} 行 exempt 判定を移動させ baseline delta 警告を増やす

- **問題事象**: 配布物一文一行機械是正（PR 2275、721行・155ファイル）で、agentdev-workflow-spec-save/SKILL.md の docs/specs/ 参照を含む行が X-4 分割により `{...}` プレースホルダを含まない行へ移動した。IR-055 の「`{...}` を含む行は違反カウント除外（exempt）」適用が外れ、baseline 超過の新規扱い（heuristic warning）として delta テストに警告が出た。
- **発生局面**: 実装（case-run の機械是正横断 PR）、検証（IR-055 delta テスト）
- **検知方法**: 機械是正 PR の full suite 実行で IR-055 runtime-unresolved-reference delta テストの警告増加。base 44c55d36（stash による原状態検証）との比較で行移動由来と確定
- **根本原因**: X-4 行分割は文単位の行再構成であり、IR-055 exempt は行単位の `{...}` 含有判定である。2つの行単位規則が同一行に重畳すると、分割後の行配置で exempt 適否が変化する
- **自律対応内容**: 参照の新規追加ではなく行移動によるカウント増のため、実態整合として当該エントリのみ baseline count を 6→7 へ反映した（全件再生成ではなく単一エントリ編集、pre-existing 2件は吸収せず）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（baseline 整合は integrity-contracts の baseline entry 運用契約に従う単一エントリ編集）
- **横展開観点**: 機械是正横断 PR（X-4 等の行再構成を伴う）では IR-055 exempt との相互作用で baseline delta が増え得る。delta 増加は「新規違反」と「行移動」を切り分けてから baseline 判定する
- **再発条件**: `{...}` プレースホルダ入り SPEC パス参照を含む行が一文一行分割で複数行へ割かれる場合
- **予防策候補**: 機械是正横断 PR の検証手順へ「IR-055 delta 増加時の行移動由来確認」を組み込む。X-4 と IR-055 exempt の相互作用の機械是正運用注意点としての記載場所検討は intake 採票済みの判断候補に含める
- **想定反映先**: case-run の機械是正検証手順、integrity 側 SPEC または mechanical-replacement-rules.md（記載場所は検討候補）
- **関連**: PR 2275、Issue 2235、.opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json
- **タグ**: #x4-split #ir055 #baseline #machine-replacement

## SPEC バッチ保存で参照先用語の実在確認を欠き dangling な整合先表記が残存する

- **問題事象**: ACT-SPEC バッチ保存（3b8a42ff、ACT-SPEC-001〜026 一括反映）で、workflow-templates SPEC が参照先成果物（agentdev-epic-tracker SKILL.md・references）に実在しない用語「V4形式」を整合先として引用したまま SPEC 化された。実体の定義名は references/regex-and-merge-conflict.md「新4列形式」だった。
- **発生局面**: 整理（backlog-review の RU 生成）、保存（spec-save のバッチ適用）
- **検知方法**: 検証 Issue #2228 での3成果物突合（SPEC・テンプレートコメント・references）で dangling 判定。`git log -S "V4形式"` により当該用語が 3b8a42ff で導入された dangling な参照先用語と確認
- **根本原因**: RU → draft → spec-save の経路で、SPEC 本文が挙げる整合先・参照先用語が参照先成果物に実在するかの確認手順がないままバッチ保存された
- **自律対応内容**: on_failure（fix-and-reverify）に従い SPEC 側を「新4列形式」へ是正し、docs/ + src/ 全 .md で残存 0件を再確認（PR 2273）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用手順の欠落。同バッチ由来の他 SPEC への横断確認は intake 採票済み）
- **横展開観点**: spec-save で外部成果物を整合先として挙げる場合、用語の実在 grep 確認を保存前に行う。authoring の固定トークン事前 grep 手順（PR 2263、Issue 2226）と同型の運用
- **再発条件**: バッチ SPEC 保存で参照先用語を参照先成果物の確認なしに記載する場合
- **予防策候補**: spec-save の保存手順へ「整合先・参照先用語の実在 grep 確認」を組み込む
- **想定反映先**: agentdev-spec-file-manager / workflow-spec-save の保存手順
- **関連**: PR 2273、Issue 2228、コミット 3b8a42ff、先行手順（固定トークン事前 grep、PR 2263・Issue 2226）
- **タグ**: #spec-save #dangling-reference #batch-save

## 規定本文への件数ハードコードは運用追加で即座に陳腐化する

- **問題事象**: ACT-SPEC-025 により specs/README.md 登録規定へ「6ファイル（audits/ 5 + baselines/ 1）」と件数がハードコードされた直後、PR #2262 が audits/ へ監査ファイルを追加し（計7ファイル）記述が陳腐化した。Issue #2230 の初回確認で不整合として検出された。
- **発生局面**: 整理（backlog-review の RU 生成）、保存（spec-save）
- **検知方法**: 検証 Issue #2230 での実ファイル計数（Get-ChildItem で audits 6 + baselines 1 = 7件）と規定本文記載（6ファイル）の突合
- **根本原因**: 件数が規則の本質でないのに規定本文へ固定記載された。運用追加（監査ファイル追加等）で必然的に陳腐化する構造
- **自律対応内容**: 件数非依存の記述へ是正し、実数は AUTOGEN 計測表（spec-health-metrics の計測行）へ集約する構成へ補正（fix-and-reverify、PR 2276）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（記述設計の運用知見）
- **横展開観点**: 規則・規定本文は件数・実績値等の変動値を本文に固定しない。変動値は計測・索引（AUTOGEN）側へ集約し、本文は件数非依存の規則記述にする
- **再発条件**: ファイル数・件数を規定本文へハードコードした後に運用追加が行われる場合
- **予防策候補**: spec-save・docs 編集時の査読観点へ「変動値（件数・実績値）の本文固定記載チェック」を加える
- **想定反映先**: agentdev-doc-writing の文書品質査読観点、document-type-responsibilities
- **関連**: PR 2276、Issue 2230、PR 2262、ACT-SPEC-025（コミット 3b8a42ff）
- **タグ**: #spec-save #staleness #autogen
