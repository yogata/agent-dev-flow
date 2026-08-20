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

## 機械置換スクリプトの old 側転写ミスは MISS 印字を残して中断時に見逃される

- **問題事象**: プレースホルダ ID 表記の機械置換（count-verified 置換スクリプト、35ファイル）で、置換ルールの old 側「（委譲先は REQ/006/007）」が実ファイルの「（委譲基盤 REQ/006/007）」と転写ミスで未適合だった。スクリプトは MISS を印字したが、ドライバー中断まで未処置のまま残り、resume 時の取り残し修正が必要になった。
- **発生局面**: 実装（case-run の機械置換実行、resume 前段）
- **検知方法**: resume 時の全置換ルール適合再確認で MISS 1件を検出（agentdev-gh-cli/SKILL.md）
- **根本原因**: 機械置換の old 文字列を grep による実在確認なしに組み立てた。転写ミスはスクリプトの MISS 印字で検出可能だが、中断時に MISS を確認する手順がなかった
- **自律対応内容**: 取り残し1件を修正し（PR 2280）、全走査で適合残存 0件を再確認
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（運用手順の欠落）
- **横展開観点**: 機械置換の old 文字列は grep による実在確認をしてから組み立てる。中断・resume を伴う機械置換では MISS 印字の確認を resume 前段に組み込む
- **再発条件**: 大量ファイルへの一括置換で old 文字列を手転写し、中断を挟む場合
- **予防策候補**: 機械置換手順へ「old 側の grep 実在確認」と「MISS 印字の逐次確認」を組み込む
- **想定反映先**: case-run の機械置換実行手順（agentdev-workflow-case-run の委譲時手順）
- **関連**: PR 2280、Issue 2237
- **タグ**: #machine-replacement #case-run #resume

## 配布物本文への内部 ID 直書きは distribution boundary gate で blocking される

- **問題事象**: layer3-style-conversion-table.md への追記時に内部 ID（AG-023 等）を含む説明文を記述し、check_distribution_boundary.ts が unclassified-entry 違反を検出した。内部 ID を使わない表現へ置換して再検証で合格した（test-fix ループ適用）。
- **発生局面**: 実装（case-run の配布物編集）、検証（配布依存境界 gate）
- **検知方法**: check_distribution_boundary.ts --profile source の unclassified-entry 違反（exit 非ゼロ）
- **根本原因**: 配布物（src/opencode 配下）の説明文にプロジェクト内部 ID を直接記載した。配布依存境界（REQ-029、DEC-014）は配布物への内部 ID 直書きを禁止する
- **自律対応内容**: 内部 ID を用いない表現へ置換し、再検証で合格（PR 2281）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（既定 gate の設計どおりに検出・解消）
- **横展開観点**: 配布物編集時は内部 ID（AG-NNN・REQ-NNNN 等）の直接記載を避け、機能名・役割名で表現する。変換対照表・SKILL.md 本文の追記も同様
- **再発条件**: 配布物へ内部 ID を含む説明文を追記した場合
- **予防策候補**: case-run の配布物編集手順へ「内部 ID 直書き回避」の注意を組み込む（gate による機械検出は既存）
- **想定反映先**: case-run の配布物編集・検証手順
- **関連**: PR 2281、Issue 2238、docs/specs/integrity/distribution-boundary.md
- **タグ**: #distribution-boundary #case-run #internal-id

## bun test の実行 cwd によって隠しディレクトリ・ネスト package 配下の拾い上げが変わる

- **問題事象**: worktree 環境で `bun test ./`（対象ディレクトリ明示なしのルート実行）は隠しディレクトリ .opencode/ 配下の正規 suite（repo-agentdev-integrity/scripts）を拾わず、src/opencode/skills/agentdev-artifact-graph 配下のみを実行して zod 解決エラーとなった（PR 2283）。また worktree ルートからの `bun test ./` はネストされた package.json 配下（repo-agentdev-integrity/scripts、.opencode/plugins）のテストを拾わず、full suite 実行は 3 箇所の cwd（ルート、.opencode/plugins、repo-agentdev-integrity/scripts）で分割実施する必要があった（PR 2284）。
- **発生局面**: 実装（case-run の検証実行、worktree 環境）
- **検知方法**: PR 本文への実行記録（AG-035 の cwd・起動コマンド記録様式）。ルート実行の件数急減（Ran N tests の N が正規 suite 分しか増えない）と zod 解決エラーの発生
- **根本原因**: bun test のテスト発見は cwd 基準の再帰走査で、隠しディレクトリ（.opencode/）とネストされた package.json 境界の解釈が実行 cwd によって変わる。正規形（`./.opencode/skills/repo-agentdev-integrity/scripts/` 明示）のみが意図した suite を確定させる
- **自律対応内容**: 両 PR とも AG-035 契約どおり正規形（./ prefix 付きディレクトリ明示）で再実行し、full suite 2058 pass / 0 fail を確認した
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（AG-035 の運用注記としての追記に相当。full suite の分割実行要件は PR 2284 本文の検証記録が初出）
- **横展開観点**: full suite 実行は単一 cwd の `bun test ./` で完結しない。実行 cwd・起動コマンド・拾い上げ対象の 3 点を証拠記録に揃え、N/M 件数突合で拾い漏れを検出する
- **再発条件**: worktree 等 junction・ネスト package が混在する環境で対象ディレクトリを明示せず bun test を実行する場合
- **予防策候補**: full suite 実行手順の標準形を「3 cwd 分割実行（ルート、.opencode/plugins、repo-agentdev-integrity/scripts）」として明文化する
- **想定反映先**: agentdev-quality-gates SPEC の full integrity suite 運用、case-close STEP-3-1 の full integrity suite 実行手順
- **関連**: PR 2283、PR 2284、Issue 2247、Issue 2248
- **タグ**: #bun-test #cwd #full-suite #ag035

## 配布物変更 PR で case-run が配布依存境界 gate を省略すると concrete-id 違反が case-close 最終 gate 初検出となり Wave クローズが部分停止する

- **問題事象**: Epic 2307 Wave 1 クローズで、PR 2341（case-open 配布スキル適合）の case-close E4-1 最終 gate（check_distribution_boundary.ts --profile source、PR HEAD worktree 検査）が concrete-id 違反16件（該当行10行、REQ-043/REQ-017/REQ-042 等）を検出した。PR 2341 のテスト結果に同 gate の実行記録がなく、case-run 段階では検出されなかった。結果、PR 2341 はマージ中止、Issue 2311 は Epic ステータス追跡テーブルで blocked、Wave 1 は4/5完了の部分クローズとなった。同 Wave の PR 2342 / 2343 は gate を実行しており（2343 は初回違反を concrete ID 除去で fix-and-reverify）、2341 のみ実行が欠落していた。
- **発生局面**: 実装（case-run の PR 作成）、レビュー（case-close の Epic Wave クローズ gate）
- **検知方法**: case-close E4-1 共用 detector による PR HEAD worktree スキャン。base main 40096376 の control 実行は failures 0 であり、違反が PR 差分由来と確定（git grep で PR HEAD 6ファイルのみ該当）
- **根本原因**: 配布スキルソース（src/opencode/skills 配下）への concrete REQ ID 追記に加え、当該 PR の品質統制で配布依存境界 gate が実行されなかった。単発 PR の gate 省略は case-close 最終 gate（事前書き込み gate と最終 gate の契約）まで違反を持ち越す
- **自律対応内容**: case-close は E4-1 契約どおりマージを中止し、PR 2341 本文へ ### distribution-boundary 小見出しで違反を記録、Epic 2307 テーブルへ blocked を記載した（completed へ上書きなし、残り4子Issueは正常クローズ）
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし（case-close E4-1 の設計どおりに検出・停止。case-run 側の gate 実行徹底が課題）
- **横展開観点**: 配布物変更（src/opencode 配下）を含む PR では PR 作成前に必ず gate を実行する。PR 2343 と同じ concrete ID → ドメイン語参照への置換を PR 作成段階で完了させておけば case-close でのマージ中止・blocked 伝播は発生しない
- **再発条件**: 配布物変更 PR で case-run が check_distribution_boundary.ts --profile source を実行せず PR を作成した場合
- **予防策候補**: case-run の品質統制・PR 作成手順へ、配布物変更時の check_distribution_boundary.ts --profile source 実行を必須ステップとして明示する
- **想定反映先**: case-run command / agentdev-workflow-case-run の品質統制・PR 作成手順
- **関連**: PR 2341、PR 2343、Issue 2311、Epic 2307、docs/specs/integrity/distribution-boundary.md、agentdev-workflow-case-close references/epic-wave-close.md E4-1
- **タグ**: #case-run #distribution-boundary #gate #epic-wave-close

## 2026-08-20: 機械置換の境界設計におけるトークン境界保護と識別子リネーム時のリテラル内パス漏れ

- **問題事象**: SPEC→Design 移行の横断語彙置換では lookaround 付きトークン境界（ACT-SPEC-NNN 履歴ID、小文字トークン、英語一般名詞 Specification の自動保護）が有効に機能した一方、Step4 の変数名リネーム（Design_PATH_PATTERNS）で正規表現リテラル内の旧パス文字列が機械置換対象から漏れ、check_test_impact.ts が docs/designs/ 変更を検出不能にする実装バグとして顕在化した（PR 2350）。
- **発生局面**: 実装（case-run の横断機械置換・識別子リネーム）
- **検知方法**: PR 本文への再 grep 記録と契約テスト実行（check_test_impact の検出不能を契約テストが捕捉）
- **根本原因**: 機械置換の対象設計が識別子（トークン）単位と文字列置換の2系統で運用され、変数名リネームに付随する正規表現リテラル内の旧パス文字列はいずれの対象からも外れていた。
- **自律対応内容**: 当該 PR 内で check_test_impact.ts の旧パス正規表現を修正し、構造固定契約テストの期待値を同一 PR で更新して再検証した。
- **ユーザー確認の有無**: なし
- **ADR/REQ/Design影響**: なし（Issue 2349 の横断変更内で完結）
- **横展開観点**: 語彙置換・識別子リネームを伴う横断是正 PR 全般。正規表現リテラル・パス文字列は識別子とは別系統の確認対象になる。
- **再発条件**: 識別子リネームや機械置換を伴う横断変更で、リテラル内パス・パターン文字列を別途 grep 確認せずにマージする場合
- **予防策候補**: 識別子リネーム時はリテラル内パスを別途 grep 確認する手順を横断是正の検証ステップへ組み込む。トークン境界保護の lookaround 設計は有効実績として参照。
- **想定反映先**: agentdev-doc-writing の機械置換規則（mechanical-replacement-rules.md）、横断是正 PR の再 grep 手順
- **関連**: PR 2350、Issue 2349
- **タグ**: #機械置換 #横断是正 #リテラル内パス

---

## 2026-08-20: 大規模 PR の targeted docs guard --files 渡しでコマンド行長上限に近づくリスクと gh files API 100件上限

- **問題事象**: case-close の targeted docs guard を --files モードで実行する際、gh pr view --json files は API 仕様により先頭100件しか返さず、524ファイル変更の PR（PR 2350）では実ファイル一覧が得られない。さらに全パスを引数渡しすると結合長 32,040 文字に達し、Windows のコマンド行上限（32,767）に近接して失敗リスクが生じる。
- **発生局面**: 実行（case-close STEP-3-1 targeted docs guard、マージ後 main 環境）
- **検知方法**: マージ前後コミット（8bf06c42..5111aac3）の git diff --name-only 件数（524）と gh API files 件数（100）の突合、結合文字数の実測
- **根本原因**: gh REST API の files ページング仕様（100件上限）と、--files の引数展開がコマンド行経由であることの組合せ。
- **自律対応内容**: 当該実行では git diff --name-only <マージ前コミット>..<マージ後コミット> で全ファイル一覧を確定し、同差分と等価なファイル集合を与える --base-ref <マージ前コミット> で guard を実行して exit 0（524 files_checked、failures 0）を確認した。
- **ユーザー確認の有無**: なし
- **ADR/REQ/Design影響**: なし（check_changed_docs.ts の CLI 契約上、--base-ref と --files は排他の正当モード）
- **横展開観点**: 大規模横断変更 PR（ファイル数が多い case-close）全般で発生し得る。
- **再発条件**: 変更ファイル数が多い PR で --files に全パスを引数渡しする場合、または gh files API の先頭100件を前提に検査対象を確定する場合
- **予防策候補**: 大規模 PR ではマージ前後コミットの git diff --name-only でファイル一覧を確定し、--base-ref <マージ前コミット>（等価ファイル集合）で guard を実行する手順を取る。
- **想定反映先**: agentdev-workflow-case-close references/docs-and-design-promotion.md の targeted docs guard 手順、agentdev-gh-cli の PR 補助データ読込手続き
- **関連**: PR 2350、Issue 2349
- **タグ**: #case-close #targeted-docs-guard #files-mode #コマンド行上限

---

## 2026-08-20: 新規配布スキル scripts のコメント・description への producer 内部 ID 埋め込みが同 Wave 両 PR で連続発生（gate は PR 作成前に検出・修正）

- **問題事象**: Epic 2351 Wave 1 の両 PR（2355: agentdev-project-extensions scripts 新規作成、2356: agentdev-artifact-graph query_graph.ts / テスト修正）で、配布依存境界 gate（check_distribution_boundary.ts --profile source）がそれぞれ concrete-id 8件+unclassified 4件（計12件）、concrete-id 2件+unclassified 4件（計6件）の違反を検出した。いずれもコメント・description・テスト名中の producer 内部 ID 参照（REQ-044 / DEC-019 / TS-002 / TS-004 / UC-001 / OU-003 等）。両 PR とも gate 実行は case-run 段階で実施されており（前回学びの予防策が機能）、PR 作成前にコメント一般化で解消済み。
- **発生局面**: 実装（case-run、配布物新規作成・修正時）
- **検知方法**: case-run STEP-S5 の配布依存境界 gate（PR HEAD worktree スキャン）
- **根本原因**: 新規配布スキル scripts を作成する際、実装者がコメント・description に要件根拠（REQ/DEC/TS/UC ID）を書き出す習慣があり、配布物（src/opencode/**）が consumer 環境で producer 内部 ID を参照禁止する制約（配布依存境界 Design）を初期作成時点で想起しにくい。根拠は docs/designs 側へ寄せるかドメイン語で表現する必要がある。
- **自律対応内容**: 両 PR とも該当コメント等を ID 参照なしの振る舞い記述へ一般化し、gate 再実行 ok=true / exit 0 を確認後に PR 作成（2355 は 6fa4a059、2356 は b1776d04）。
- **ユーザー確認有無**: なし
- **ADR/REQ/Design影響**: なし（gate 設計どおりに検出・解消。Design 契約の変更不要）
- **横展開観点**: 配布物（src/opencode/**）を新規作成・修正する全 PR が対象。コメントだけでなく package.json の description、README、テストの describe 名も検出対象になる。
- **再発条件**: 配布スキル scripts を新規作成し、コメント・description・テスト名に producer 内部 ID（REQ-/DEC-/TS-/UC-/OU- 等）を記述した場合。
- **予防策候補**: 配布物新規作成時はコメント・description に内部 ID を書かずドメイン語で表現する。gate 実行は PR 作成前に必須（本 Wave では機能した）。case-run の初期手順に「配布物作成時のコメント規約」を明示する。
- **想定反映先**: case-run command の品質統制・PR 作成手順、agentdev-workflow-case-run
- **関連**: PR 2355、PR 2356、Issue 2352、Issue 2354、Epic 2351、docs/designs/integrity/distribution-boundary.md
- **タグ**: `#distribution-boundary` `#case-run` `#配布物` `#コメント規約`

---

## 2026-08-20: フル integrity suite 未実施のままマージされた新規配布物追加 PR で IR-055 delta 違反がマージ後 main で初検出

- **問題事象**: Epic 2351 Wave 1 クローズのマージ後検証で、repo-agentdev-integrity フル suite（bun test 全件）が IR-055「runtime-unresolved-reference」実修復回帰テストで失敗した（PR 2355 で新規追加された src/opencode/skills/agentdev-project-extensions/scripts/README.md の repo-local / repo-agentdev-integrity 参照3件、delta from baseline 違反）。PR 2355 の case-run は配布側サブセットテスト（21件）と checker 個別テストのみ実施し、フル suite（特に check_integrity.test.ts の実リポジトリ回帰テスト）を未実施のまま PR 作生・マージされていた。並列 Wave の PR 2356 はフル suite を実施していたが、その worktree には PR 2355 の新規ファイルが存在しないため検出不能だった。
- **発生局面**: レビュー（case-close マージ後検証）。起因は実装（case-run のテスト実施範囲）
- **検知方法**: case-close のマージ後 main での bun test 全件実行（IR-055 delta テスト失敗、2 fail 中1件）
- **根本原因**: 配布物を新規追加する PR の品質統制にフル integrity suite 実施が必須化されておらず、サブセットテストの green だけで PR 作成可能になっている。加えて並列 Wave の worktree 相互は他 PR の変更を含まないため、マージ後の組み合わせ状態はマージ前の個別 worktree では検証できない。
- **自律対応内容**: case-close は違反を intake item（2026-08-20-project-extensions-readme-ir055-repo-refs.md）として回収し、コメント一般化の修正候補を後続へ委譲した。マージ済みのため case-close では実装を修正していない。
- **ユーザー確認有無**: なし
- **ADR/REQ/Design影響**: なし（IR-055 ルールは設計どおりに検出。修正は intake 経由で後続 Case 化）
- **横展開観点**: 配布物（src/opencode/**）を新規追加・大幅修正する PR すべて。並列 Wave 構成の Epic では個別 worktree の suite green が全体 green を保証しない。
- **再発条件**: 新規配布物を追加する PR でフル integrity suite を実施せずマージした場合、および並列 Wave の変更が同一 main 上で初めて結合する場合。
- **予防策候補**: 配布物を追加する PR の品質統制に「bun test ./.opencode/skills/repo-agentdev-integrity/scripts/ 全件（少なくとも check_integrity.test.ts）」を必須ステップとして明示する。
- **想定反映先**: case-run command の品質統制、agentdev-workflow-case-run
- **関連**: PR 2355、Epic 2351、intake 2026-08-20-project-extensions-readme-ir055-repo-refs.md、.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts
- **タグ**: `#case-run` `#integrity-suite` `#IR-055` `#配布物` `#epic-wave`

---

## 2026-08-20: worktree の scripts ディレクトリは node_modules 未解決で開始し bun test が大量 fail する（bun install で解消、node_modules は gitignore 対象外）

- **問題事象**: PR 2356 の case-run で、worktree 内の scripts ディレクトリ（.opencode/skills/repo-agentdev-integrity/scripts、src/opencode/skills/agentdev-artifact-graph/scripts）に node_modules が存在しない状態で bun test を実行したところ、zod 解析エラーで大量 fail する状態から開始した（環境起因、移行と無関係）。bun install（bun.lock 変更なし）で解消。また .opencode/skills/repo-agentdev-integrity/scripts/node_modules は gitignore 対象外のため、コミット対象から明示的に除外した。case-close のマージ後 main 検証でも、main checkout の src/opencode/skills/agentdev-project-extensions/scripts（PR 2355 で新設）に node_modules が無く、bun install を先に実行する必要があった。
- **発生局面**: 実装（case-run、worktree テスト実行時）およびレビュー（case-close のマージ後検証）
- **検知方法**: bun test の zod 解析エラーによる大量 fail（モジュール解決失敗）
- **根本原因**: git worktree はトラックファイルのみ展開され、gitignore または非追跡の node_modules は新しい worktree・チェックアウトに存在しない。scripts 単位の package.json/bun.lock 構成（runtime-package-boundary）では、テスト実行前に各 scripts ディレクトリで bun install が必要。
- **自律対応内容**: case-run は bun install で解消し node_modules をコミット対象から除外。case-close はマージ後検証の batery で bun install を前置して配布側・repo-local の全テストを実施（21 pass / 169 pass / suite 実施）。
- **ユーザー確認有無**: なし
- **ADR/REQ/Design影響**: なし（runtime-package-boundary Design の scripts 単位依存解決の帰結）
- **横展開観点**: worktree・fresh clone で scripts 配下のテストを実行する全場面（case-run、case-close、レビュー、CI）。新規配布スキル scripts を追加する PR のマージ後は main checkout 側でも bun install が必要。
- **再発条件**: worktree 作成直後または新規 scripts ディレクトリ追加直後に bun install を前置せず bun test を実行した場合。
- **予防策候補**: worktree で scripts 配下のテストを実行する手順に「bun install 前置」を明示する。新規 scripts ディレクトリの .gitignore（node_modules 除外）を同梱する（PR 2355 が実施済みのパターン）。
- **想定反映先**: case-run command / agentdev-workflow-case-run のテスト実行手順、agentdev-git-worktree の worktree セットアップ手順
- **関連**: PR 2356、PR 2355、Epic 2351
- **タグ**: `#worktree` `#bun-install` `#node_modules` `#case-run`

---

## 2026-08-21: 再帰列挙のディレクトリ単位エラー握り潰しは静かな部分レポートを生む（一過性の走査減少を実観測、移行後に伝播へ構造変更）

- **問題事象**: 再帰ファイル探索移行（PR 2357）の検証中、旧 walk 実装群（ディレクトリ単位の catch でエラーを黙ってスキップする構造）で、Windows のディレクトリロック（AV 等が起因と推定）時に走査結果が一過性に減少する事象を観測した（tests_scanned 455→285、checked_files 481→473、scanned_files 500→484）。穏やかな状態では旧実装・新実装とも完全一致・決定的（10 連続実行で同一）。
- **発生局面**: 実装（移行前後の before/after 比較検証時）
- **検知方法**: 実リポジトリ出力の before/after 比較（列挙件数の突合で一過性減少を検出）
- **根本原因**: 旧実装がディレクトリ単位のエラーを catch-and-skip しており、部分走査でも正常終了の体裁でレポートが出る。各 checker に列挙件数の期待値突合が存在しないため、静かな部分レポートを検出する手段がなかった。
- **自律対応内容**: 移行後の共通ヘルパー（globWalkRel、enumerateFilesRel）は ENOENT 以外の走査エラーを伝播させ、静かな部分レポートを構造的に排除した。ただし Bun の globSync が内部で一部エラーを握り潰す可能性は残存する。
- **ユーザー確認有無**: なし
- **ADR/REQ/Design影響**: なし（checker-execution-contracts Design の移行契約どおり。エラー伝播方針の明文化は Design確定候補として intake item 2026-08-21-node-fs-glob-design-complement.md へ委譲）
- **横展開観点**: ファイル列挙を前提とする全 checker・検証 harness。列挙件数を期待件数と突合する「二重確認」規約（パターンマッチ・網羅検査設計の標準規約）の適用候補。
- **再発条件**: ディレクトリ単位でエラーを握り潰す走査実装が残存する場合、および外部ロック（AV、並列プロセス）により走査中にディレクトリが一時的に読めなくなる環境。
- **予防策候補**: 各 checker の出力に列挙件数の期待値突合（固定期待値または前回実行値からの大幅減少警告）を導入する。
- **想定反映先**: repo-agentdev-integrity の各 checker、checker-execution-contracts Design（列挙エラー伝播方針）
- **関連**: PR 2357、Issue 2353、Epic 2351、.opencode/skills/repo-agentdev-integrity/scripts/lib/glob_walk.ts
- **タグ**: `#再帰列挙` `#エラー握り潰し` `#部分走査` `#checker`

---

## 2026-08-21: Windows + Bun 1.3.10 の node:fs globSync はドット始まりパス要素を列挙できず junction/symlink を下降する（契約維持には補助経路が必須）

- **問題事象**: node:fs glob 移行（PR 2357）の実行検証（TS-004）で、Bun 1.3.10（Windows）の fs.globSync に次の制約を実測した。(1) withFileTypes オプション非対応（エラー）、promise 形式 glob() は callback 必須。(2) ワイルドカードがドット始まりパス要素（.opencode、.agentdev 等）を列挙できない（cwd に直接指定したディレクトリ配下は列挙可）。(3) junction / symlink ディレクトリを下降する（旧 readdir 実装は非下降）。(4) 欠落 cwd は ENOENT throw。
- **発生局面**: 実装（TS-004 可用性実行検証）
- **検知方法**: bun 1.3.10 Windows での最小列挙実行と実リポジトリ出力の before/after 比較
- **根本原因**: Bun の node:fs glob 実装が Node.js と完全互換でない（列挙表現力・走査挙動の差）。
- **自律対応内容**: 走査ルート直下の隠しディレクトリは「トップレベル単一階層 readdir で発見 → cwd 直指定 glob で列挙」の補助パスで網羅（全 455 件が移行前と同一）。リンク経由パスは祖先 lstat 検査で除外し旧挙動を厳密維持。ENOENT はキャッチして空扱い。
- **ユーザー確認有無**: なし
- **ADR/REQ/Design影響**: なし（制約の明文化は Design確定候補として intake item 2026-08-21-node-fs-glob-design-complement.md へ委譲）
- **横展開観点**: Bun + Windows で node:fs glob を使う全 scripts（repo-local checker、配布スキル scripts）。ドット名ディレクトリ配下の列挙とリンク非下降の両対策は glob_walk.ts 共通ヘルパー（repo-local・distributed 両版）が所有。
- **再発条件**: glob のワイルドカードでドット始まりディレクトリ配下を直接列挙しようとした場合、およびリンク非下降契約を前提に glob の素の結果を使った場合。
- **予防策候補**: node:fs glob 利用時は globWalkRel / enumerateFilesRel 共通ヘルパー経由に限定する。Bun バージョン更新時にドット要素列挙・withFileTypes 対応の再実測を行う。
- **想定反映先**: checker-execution-contracts Design「再帰ファイル探索と CLI 引数解析の標準API移行」、glob_walk.ts（repo-local・distributed 両版）
- **関連**: PR 2357、Issue 2353、Epic 2351
- **タグ**: `#node-fs-glob` `#bun` `#windows` `#再帰列挙`
