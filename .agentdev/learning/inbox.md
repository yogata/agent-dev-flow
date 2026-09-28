# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## agentdev_gh issue_update の入力契約は role フィールドを受けない（issue_create と共通の role 指定を転記すると invalid-input）

- **問題事象**: case-open（Root Case Issue #3189 の adf_case 埋め戻し）で agentdev_gh の issue_update を、issue_create と同じ入力構成（role: case を含む）で呼び出したところ、unknown-field [role] の invalid-input で rejected された。
- **発生局面**: 実装（case-open lifecycle STEP-2 の Issue 作成後埋め戻し。Root Case Issue #3189）
- **検知方法**: Custom Tool agentdev_gh の fail-closed 応答（kind: invalid-input、detail: field 'role' is not part of the issue_update input contract）
- **根本原因**: agentdev_gh の操作カタログでは role は issue_create / issue_list の入力契約に存在し、issue_update には存在しない。操作共通の論理役割指定（role: case）を issue_update へも転記できると想定した呼出側の契約把握不足。
- **自律対応内容**: role フィールドを除いた同一本文・同一タイトルで issue_update を再実行し、埋め戻しを完了（成功応答で検証済み）。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（Tool 入力契約の範囲内の修正）
- **横展開観点**: issue_close / issue_reopen / issue_update 等、番号特定済みの後続操作では role を渡さない。issue_create → issue_update 連鎖で role を引き回す実装・プロンプトでは操作ごとの入力契約差異を意識する。
- **再発条件**: issue_create の呼出引数を流用したまま issue_update / issue_close / issue_reopen へ role を含めて渡した場合。
- **予防策候補**: agentdev_gh の操作切替時に操作固有の input contract を確認する。role は操作対象特定のための issue_create / issue_list 専用フィールドとして扱う。
- **想定反映先**: agentdev_gh Custom Tool の操作別 input contract 差異の明記（契約ドキュメント）、または issue 操作知識（agentdev-issue-tracking）への追記。
- **関連**: Root Case Issue #3189、src/opencode/skills/agentdev-workflow-case-open/
- **タグ**: `#gh-tool` `#issue-update` `#input-contract`

## REQ-030-017 隔離検査の git diff --stat origin/main HEAD は並行 case-open の origin/main 先行進行で非自 Case 差分を含む（merge-base 起点で自 Case 差分を機械確認）

- **問題事象**: case-open（Root Case #3192、Definition PR #3195 作成前隔離検査）で `git diff --stat origin/main HEAD` を実行したところ、自 Case 変更（docs/requirements/REQ-092.md +5 -3）に加え `.agentdev/learning/inbox.md` -16 行が表示され、差分が「自 Case 分のみ」とは直接判定できなかった。
- **発生局面**: case-open lifecycle STEP-4 の並行 case-open PR 作成前隔離検査（REQ-030-017）
- **検知方法**: diff --stat の出力ファイル一覧と自 Case commit 出力（1 file changed）の突合。HEAD 親が merge-base（0c943fc8）と一致していることの確認
- **根本原因**: worktree 作成後に兄弟 Case が origin/main へ commit（capture learning）を先行 push しており、diff --stat origin/main HEAD には origin/main 側変更の逆差分（HEAD に存在しない先行分）が現れる。reference 手順（definition-pr-and-idempotency.md「並行 case-open の PR 作成前隔離検査」手順1）は merge-base 起点の差分確認を明示していない
- **自律対応内容**: merge-base と HEAD 親の一致で兄弟 commit を含むスタック構造でないことを確認し、`git diff --stat <merge-base> HEAD` で自 Case 差分（docs/requirements/REQ-092.md のみ）を機械的に確認。差分再構成救済は不要と判定して PR 作成へ進んだ
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（reference 手順の補完要求は intake で管理）
- **横展開観点**: 並行 case-open では origin/main が自 Case 実行中に先行進行する常態。隔離検査やコンフリクト判定で origin/main 直指定 diff を鵜呑みにせず、merge-base 起点で自 Case 分を切り出す
- **再発条件**: 並行 case-open 中に兄弟 Case が origin/main へ push した状態で diff --stat origin/main HEAD を実行した場合
- **予防策候補**: 隔離検査手順へ merge-base 起点の差分確認（`git diff --stat $(git merge-base origin/main HEAD) HEAD`）と HEAD 親・merge-base 一致確認の併記
- **想定反映先**: agentdev-workflow-case-open reference definition-pr-and-idempotency.md「並行 case-open の PR 作成前隔離検査（REQ-030-017）」手順1
- **関連**: Root Case Issue #3192、Definition PR #3195
- **タグ**: `#git-worktree` `#req030-017` `#parallel-case-open`

## draft artifact_actions の target_area「### 対象外」は REQ 現行構造（## 適用範囲配下ネスト）へのセクション名参照として解釈する

- **問題事象**: REQ-092 update（Case #3192）の draft ACT-REQ-003 content が「### 対象外」見出し + フラット bullet 形式で書かれており、現行 REQ 標準構造（「## 適用範囲」配下の「- **対象外**:」ネストリスト）と乖離していた。content を全文そのまま置換すると REQ 構造が崩れ他 REQ と不整合になる。
- **発生局面**: case-open lifecycle STEP-4 の Definition 変更（docs/requirements/REQ-092.md 対象外節更新）
- **検知方法**: 現行 REQ-092.md と draft content の構造比較（要件行・文言は一致、見出し階層のみ乖離）
- **根本原因**: draft content は合意済み文言の正であり文書構造の正ではない。target_area は適用先セクションの特定子であり、現行 REQ の実際の見出し階層とは一致しない
- **自律対応内容**: 現行構造（## 適用範囲配下ネスト）を保持したまま第1項の文言を draft content 通りに per-line 置換で適用した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: REQ update 系 Case では draft artifact_actions の content は文言の正、構造は現行 REQ 標準を正として読む。target_area は「適用先セクションの特定子」として解釈する
- **再発条件**: REQ update 系 Case で draft content が見出し形式を含む場合
- **予防策候補**: req-define 側で target_area 記法と content 形式の関係（文言の正 / 構造は現行標準）を明文化するかを検討
- **想定反映先**: req-define の draft 生成規約（該当箇所があれば）
- **関連**: Root Case Issue #3192
- **タグ**: `#req-update` `#draft-format`

## 同一ファイルへの複数 edit 同時並行適用時、guard fail-closed ブロック後に部分適用残骸が残り得る（実取得 → 単発再 edit で解消）

- **問題事象**: case-open（Root Case #3193、Definition 変更 18 artifact_actions 適用）で req-impact-map.md への 7 件の edit を同一メッセージで同時並行実行したところ、1 件が agentdev-textlint-guard の fail-closed ブロック（oldString is not found verbatim）で拒否された。ブロック後に行を grep で確認すると、当該 edit の newString の一部（列挙追加のみ）が反映され、パス修正部分が未反映の部分適用残骸が残っていた。
- **発生局面**: 実装（case-open lifecycle STEP-4 の Definition 変更適用。Case 専用 worktree）
- **検知方法**: edit 応答の fail-closed メッセージ（cannot verify edit … blocked per fail-closed）と、ブロック後に grep で該当行を実取得した結果の突合
- **根本原因**: 同一ファイルへの複数 edit の同時並行適用では、guard の oldString verbatim 照合が他 edit の適用結果に依存して成立し得ず、拒否応答の return 時点で当該 edit の適用状態が「完全未適用」ではなく「部分的に適用された残骸」となり得ることを呼出側が前提としていなかった
- **自律対応内容**: ブロックされた対象行を grep で実取得し、残骸状態を実体とした oldString で単発 edit を再実行して完全適用を完了（成功応答で検証済み。UTF-8 健全性と出現回数の文字列検証は後段の branch HEAD 実測で全件合格を確認）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 同一ファイルへ複数 edit を出す場合は相互非依存の oldString を選ぶか順次実行へ切り出す。guard ブロック後は行の実取得（grep）で現在状態を確認してから oldString を組み立てる（完全未適用を仮定した再 edit は失敗する）
- **再発条件**: 同一ファイルへの複数 edit を 1 メッセージで同時並行実行し、かつ guard 検証が oldString verbatim 照合を行う環境
- **予防策候補**: guard ブロック時の再 edit 手順（実取得 → 再 oldString → 単発 edit）と、同一ファイルへの複数 edit は順次実行に限定する運用規律を明文化する
- **想定反映先**: AGENTS.md 編集規律（edit ツール優先節の補足）、または agentdev-git-worktree reference worktree-operations.md「書込み guard 運用指針」節の補足
- **関連**: Root Case Issue #3193、Definition PR #3196、docs/designs/responsibilities/req-impact-map.md
- **タグ**: `#edit-tool` `#textlint-guard` `#fail-closed`

## 並行 case-ready 間で git rm のステージが並走プロセスの git commit に混入し、コミットメッセージと削除内容が不一致になり得る

- **問題事象**: case-ready STEP-7（Case #3186）で `.agentdev/backlog/req-units/RU-0001.md` を git rm してステージした直後、並走 Case #3189 の case-ready が実行した commit（841a0c6f「chore(agentdev): remove consumed RU-0012 and draft after case-ready (Case 3189)」）に、本 Case のステージ済み RU-0001.md 削除（37 行）が混入した。コミットメッセージは Case 3189 のみを示すが RU-0001.md（Case #3186 分）の削除を含む不一致状態となった
- **発生局面**: case-ready lifecycle STEP-7 の draft / RU 削除と git 永続化（並行 7 Case 実行中。共有 working tree の main）
- **検知方法**: push 前の git log --stat 確認で 841a0c6f の変更一覧に自 Case 分の RU-0001.md 削除が含まれることを検出（git status ではステージ消失として現れる）
- **根本原因**: git commit はインデックス全体をコミットする。明示パス指定の git rm でも、commit 側をパス限定しない限り、rm と commit の間に並走プロセスの commit が割り込むと自 Case のステージが他 Case のコミットへ取り込まれる
- **自律対応内容**: RU-0001.md 削除内容自体は本 Case の正規 STEP-7 作業どおりであり、混入コミットの amend（履歴書き換え）は並走 Case の push と競合するリスクが上回ると判断して混入のまま push し、本学びで記録。Root Case 完了報告にも混入経緯を記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（運用規律の補完要求は intake 管理候補）
- **横展開観点**: draft / RU 削除の git 永続化を行う全工程（case-ready STEP-7、case-close の capture 永続化等）。共有 working tree の main で commit する並行 workflow 間で共通の競合様式
- **再発条件**: 共有 working tree の main 上で複数プロセスが git rm（ステージ作成）→ git commit（無パス指定）を実行し、rm と commit の間に他プロセスの commit が割り込んだ場合
- **予防策候補**: 削除の永続化は git rm <path> と git commit -- <path>（明示パス指定 commit）を連続実行で行う、または commit 前に git status --short でステージ全体を確認し自 Case 分以外のステージが存在すれば commit を待機して再確認する
- **想定反映先**: agentdev-workflow-case-ready reference readiness-and-cleanup.md「draft / RU 削除」節、agentdev-git-worktree reference worktree-operations.md「並列実行安全ステージング」関連節
- **関連**: Root Case Issue #3186、Definition PR #3188、並走 Case #3189（commit 841a0c6f）
- **タグ**: `#git` `#parallel-case-ready` `#stage-race`

## bun test scripts/ 全体実行（2628 tests・約 190 秒）は既定 120 秒 timeout で途中打ち切りとなる（委譲時は 300〜600 秒へ延長）

- **問題事象**: case-run（Case #3199、OU-004）で `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/` 全体（107 ファイル / 2628 テスト / 6731 expect() calls）を Windows 環境で実行したところ、所要 188.64 秒で既定 120 秒のハーネス timeout を超え、初回実行は途中打ち切りとなった。
- **発生局面**: 実装検証（case-run の TS-007 (2) 回帰テスト全体実行。Case 専用 worktree）
- **検知方法**: bash 応答の timeout エラー（完了前の強制終了）
- **根本原因**: scripts/ 配下の回帰テスト全体の所要時間（約 190 秒・Windows）がハーネス既定 timeout（120 秒）を上回る規模に達しているが、委譲プロンプト側で timeout 延長が指定されていなかった。
- **自律対応内容**: timeout を延長して再実行し合格（2628 pass / 0 fail）を確認。case-close でも同範囲の独立再検証を timeout 600 秒指定で再実行し合格（177.10 秒）を確認済み。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（検証実行の timeout 指定運用の範囲内）
- **横展開観点**: REQ-010-068 契約（checker スクリプト・fixture 変更 → bun test 回帰テスト合格）を満たすための scripts/ 全体実行は全 checker 系 Case で共通の重い検証。実行時は必ず timeout 明示指定が必要。case-close の独立再検証でも同様。
- **再発条件**: scripts/ 配下の bun test 全体を timeout 指定なし（既定 120 秒）で実行した場合。
- **予防策候補**: bun test scripts/ 全体実行を含む検証の委譲プロンプト・workflow reference に timeout 300〜600 秒の明示指定を追記する。
- **想定反映先**: case-run / case-close の検証実行 reference（bun test 実行形態契約）、agentdev-quality-gates の QG 実行手順。
- **関連**: Issue #3199、PR #3204、親 Epic #3197
- **タグ**: `#bun-test` `#timeout` `#windows`

## agentdev_gh issue_create は role: case で kind を受理しない（kind は tracking 専用。Case Issue の work_type は物理ラベルで指定）

- **問題事象**: case-open（Root Case Issue #3210 作成）で agentdev_gh の issue_create を role: case + kind: task（work_type maintenance に対応させる意図）で呼び出したところ、invalid-input（detail: kind requires role 'tracking'）で rejected された。あわせて、gh issue list --label case の読取補完も 0 件を返した（Case Issue は role に対応する物理ラベル "case" を持たず、work_type 系ラベル〔bug / maintenance / enhancement / bugfix〕が付く）。
- **発生局面**: case-open lifecycle STEP-2 の Root Case 作成（Root Case Issue #3210）
- **検知方法**: Custom Tool agentdev_gh の fail-closed 応答（kind: invalid-input、retryable: true、detail: request does not match the issue_create input contract (invalid-field [kind]: kind requires role 'tracking')）。および gh issue list のラベル実測（#3186=bug、#3193/#3197/#3200=maintenance、#3192=enhancement、#3191=bugfix）
- **根本原因**: agentdev_gh の操作契約では kind は role 'tracking' の追跡Issue に対する論理分類であり、role: case（Case Issue）では受理されない。Case Issue の work_type は論理 kind ではなく物理ラベル（work_type ラベル）で表現される。呼出側（委譲指示）が「kind は work_type に対応」という前提で呼出しを組み立てた契約把握不足。
- **自律対応内容**: kind を外し、work_type 物理ラベル maintenance を labels で指定して再実行し、作成を完了（成功応答・Tool 内部 VERIFY 済み）。issue_create の kind 指定は再試行せず引数修正で対応（AG-004 の適用具体化どおり）。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（Tool 入力契約の範囲内の修正。Case Issue の work_type ラベル付与運用は既存 Case 実測と整合）
- **横展開観点**: Case Issue（role: case）起票では work_type を物理ラベル（labels）で指定し、kind を渡さない。tracking 軸の論理値（role/kind/trackingState）と work_type 物理ラベルは別系統の概念として扱う。population 実測や読取補完で gh CLI を使う場合も「case」ラベルフィルタは機能しないため、ラベルなし列挙 + タイトル・本文確認を用いる。
- **再発条件**: role: case の issue_create に kind を含めて渡した場合。または Case Issue の population 実測を物理ラベル "case" でフィルタした場合。
- **予防策候補**: 委譲プロンプト・手順書の Case Issue 起票指示では「role: case + labels に work_type 物理ラベル」と契約どおりに明記する。agentdev_gh の role/kind/labels の受理対応表を issue 操作知識へ追記する。
- **想定反映先**: agentdev-issue-management reference issue-operation-safety.md（RA-001 で新設される population 実測節の隣接領域。本エントリは本 Case の合意済み追記対象外であり後続 learning-promote 対象）、agentdev-issue-tracking の論理スキーマ運用記述
- **関連**: Root Case Issue #3210、Case #3186（label bug 実測）、Case #3193/#3197/#3200（label maintenance 実測）、本 inbox 既存エントリ「agentdev_gh issue_update の入力契約は role フィールドを受けない」
- **タグ**: `#gh-tool` `#issue-create` `#input-contract` `#labels`

## #3211（40bd84e4）が IR-055 新規 strict violation 2 件を checker 実測・baseline 登録なしで main へ merge した（host main が check_integrity EXIT 1 の状態で残留）

- **問題事象**: case-open 冪等再実行（Case #3192 修復）で worktree branch へ origin/main（40bd84e4）を merge したところ、check_integrity --profile source が新規 unmanaged NG 2 件（IR-055 delta）で EXIT 1 となった。出所を確認すると host main（40bd84e4）でも同一 2 件・EXIT 1 が実測され、main 自体が新規 NG を抱えた状態で残留していた。
- **発生局面**: case-open lifecycle 冪等再実行（case-ready STEP-1 品質検査差し戻し対応）の checker 再実測（worktree HEAD fac56445）
- **検知方法**: check_integrity 応答の NG baseline applied サマリ（「2 new unmanaged NG (delta, exit code driver)」）と、該当 2 ファイルの `git show 40bd84e4` 追加行突合。あわせて host main での同一 checker 再実測で再現を確認
- **根本原因**: #3211（40bd84e4「harden workflow operation references (Refs #3210)」）が distribution files（worktree-operations.md:173 の 'repo-local'・definition-pr-and-idempotency.md:33 の 'repo-agentdev-integrity'）へ repo-* 参照を含む行を追加し、IR-055 の新規 strict violation 実測と baseline（ir-055-baseline.json・最終 commit 207ac004）への approved 登録を行わないまま main へ merge された。Case #3210 の実績記録「main の check_integrity は NG 0 実測済み」は 40bd84e4 より前の時点（#3207 merge 時点）の実測値であり、40bd84e4 時点の実測ではなかった
- **自律対応内容**: 出所が本 Case 変更と無関係な pre-existing（main 由来）であることを host main 同一実測で証明し、本 Case では修正せず Root Case #3192 本文と修復完了 comment に出所・実測値を記録。baseline approved 登録は該当元 Case（#3210/#3211 系）の対応範囲として実施しない判断を記録
- **ユーザー確認有無**: なし（Root Case comment への出所確認記録と完了報告で明示）
- **Decision/REQ/spec影響**: なし（本 Case での baseline 変更なし。要否判断は #3210/#3211 系へ委ねる）
- **横展開観点**: distribution files に repo-* 参照を新規導入する変更は、同一 PR 内で IR-055 実測（新規 unmanaged NG 0 または provenance 登録済み）を完了してから merge する。先方の「NG 0 実測済み」記録を鵜呑みにせず、自 Case の merge 後 branch HEAD で再実測して出所を特定する
- **再発条件**: checker 関連行を含む PR が QG-4 の checker 実測（branch HEAD 全体・新規 unmanaged NG 確認）を経ずに main へ merge され、後続 Case が origin/main 取り込み時にその delta を引き取る場合
- **予防策候補**: QG-4 最終完了判定の checker 実測を merge 直前の main 取り込み済み branch HEAD で実施し、「baseline-known 以外の新規 NG の出所が自 Case 変更であること」を evidence 化する。provenance-tracked baseline 登録漏れの検査を QG-4 手順へ明記する
- **想定反映先**: agentdev-quality-gates references qg-4-final-acceptance.md（checker 実測の coverage 範囲明記）、case-close workflow の QG-4 判定手順
- **関連**: Case #3192、Definition PR #3195、40bd84e4（PR #3211 / Case #3210）、docs/designs/integrity/rules/ 配下 IR-055 関連 rule
- **タグ**: `#integrity` `#ir055` `#baseline` `#qg4`

## integrity checker 系スクリプトの実体は src/opencode/ 配下ではなく .opencode/skills/repo-agentdev-integrity/scripts/（merge 済み worktree の .opencode は実ディレクトリとして存在する）

- **問題事象**: case-open 冪等再実行（Case #3192 修復）で委譲指示どおり `bun src/opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts` を実行したところ Module not found で失敗した。repo-agentdev-integrity は src/opencode/skills/ の 49 skill には含まれず、git 追跡実体は .opencode/skills/repo-agentdev-integrity/ 配下のみ。
- **発生局面**: case-open lifecycle 冪等再実行の AUTOGEN 再生成（Case 専用 worktree 3192-definition。merge 済み状態）
- **検知方法**: bun 応答の Module not found エラー → glob での実在パス特定（.opencode 側のみヒット）→ `ls src/opencode/skills/` と `git ls-files` の突合
- **根本原因**: 委譲指示が「worktree の .opencode/ は空（ジャンクション未伝播）」を前提に src 側パスを指定したが、同 skill は src 側に存在せず、git 追跡済みの .opencode/skills/repo-agentdev-integrity/ が worktree では実ディレクトリとして checkout される（ジャンクション前提が環境実態と不一致）
- **自律対応内容**: .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts を worktree 内で直接実行し、import.meta.dir 由来の findRepoRoot で worktree root が解決されることを確認した上で再生成を実行（成功・no changes）。host 側への誤書込みは発生しないことをパス構成確認で事前保証した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: integrity checker・generate_indexes 系の実行パス指定は .opencode/skills/repo-agentdev-integrity/scripts/ を正とする。worktree で「.opencode が空」という前提を使う手順は、実行前に当該パスの実在を確認してから src 側代替へ切り替える
- **再発条件**: integrity 系スクリプトを src/opencode/skills/ 配下のパスで指定した場合、または worktree の .opencode 状態を未確認のままジャンクション前提で手順を組んだ場合
- **予防策候補**: integrity 系 checker 実行手順のパス指定を .opencode/skills/repo-agentdev-integrity/scripts/ に統一する。worktree の .opencode 状態（ジャンクション/実ディレクトリ/欠落）は手順の前置確認項目とする
- **想定反映先**: repo-agentdev-integrity SKILL.md（実行契約のパス記載）、case-ready / case-open reference の checker 実行手順
- **関連**: Case #3192、Definition PR #3195、.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts
- **タグ**: `#integrity` `#path` `#worktree`

## .agentdev/learning/deferred.md の反映先候補 11 行が不在スキル agentdev-doc-writing を指したまま残留（反映先消滅・現行化または廃棄判定の要否）

- **問題事象**: Case #3200（OU-002・語彙レジストリ不在 skill 行削除）の完了後、`.agentdev/learning/deferred.md` に不在スキル `agentdev-doc-writing` を反映先候補とする保留エントリ 11 行が残存している。反映先候補スキル自体が語彙レジストリから削除済みのため、これらのエントリの反映先が消滅している。
- **発生局面**: case-close（PR #3208 本文の Findings / Capture 候補回収。Epic #3197）
- **検知方法**: case-run DEL-3200-2 の TS-006 再検証（repo 全域 `agentdev-doc-writing` grep）で、`learning/deferred.md` 反映先候補 11 行が履歴記録として除外明示されたことの確認
- **根本原因**: 過去の learning-promote が反映先候補として当時実在した agentdev-doc-writing を記録したが、その後の skill 廃止で反映先が消滅した。learning pipeline には反映先の実在性を再確認する機構がないため、消滅後のエントリが living pool に残留する
- **自律対応内容**: PR #3208 本文の Capture 候補として learning inbox へ回収（本エントリ）。deferred.md の直接修正は learning-promote の責務のため行わない
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: learning-promote は deferred エントリの再評価時に反映先候補の実在性を確認し、消滅している場合は反映先の現行化または廃棄判定を行う。履歴記録としての除外明示（TS-006）と living pool の現行性は別問題として扱う
- **再発条件**: skill 廃止時にその skill を反映先候補とする deferred エントリの棚卸しが行われない場合
- **予防策候補**: skill 廃止系の Case で learning/deferred.md の該当反映先エントリ有無を capture 段階で確認する
- **想定反映先**: learning-promote（deferred エントリの反映先実在性確認・現行化または廃棄判定）、learning pipeline 拡張候補
- **関連**: Issue #3200、PR #3208、Epic #3197、.agentdev/learning/deferred.md
- **タグ**: `#learning` `#deferred` `#stale-target`

## Windows 環境の bun は MSYS 形式パス（/c/...）を解決せず Module not found となる（スクリプト指定は Windows 形式パス C:/... を使用）

- **問題事象**: case-run（DEL-3191-1・Case #3191）の verify スクリプト実行で、bun へ MSYS 形式パス（/c/... 形式）でスクリプトを指定したところ Module not found で失敗した。
- **発生局面**: 実装検証（case-run 実行担当サブエージェント委譲の traceability scripts 実測。Case 専用 worktree）
- **検知方法**: bun 応答の Module not found エラー
- **根本原因**: Windows 環境の bun は MSYS 形式パスを解決しない。シェルが bash（MSYS）でも bun 自体のパス解決は Windows 形式を要求するため、シェルのパス形式と実行バイナリの受理形式は独立している
- **自律対応内容**: スクリプト指定を Windows 形式パス（C:/...・forward slash）へ変更して再実行し、検証を完了
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: Windows + bash 環境で bun にパスを渡す全検証手順（checker 実行・bun test 等）で共通。bash の用語感覚で /c/... を渡さない
- **再発条件**: Windows 環境で bun へ MSYS 形式パス（/c/...）を渡した場合
- **予防策候補**: bun 実行手順のパス指定を Windows 形式（C:/...・forward slash）に統一する
- **想定反映先**: case-run / case-close の検証実行 reference（bun 実行形態契約）、worktree-operations.md の checker 実行手順
- **関連**: Case #3191、PR #3213、src/opencode/skills/agentdev-traceability/scripts/
- **タグ**: `#bun` `#windows` `#path`

## worktree 内の repo-agentdev-integrity は data/ 一部欠落のため checker は host repo root を cwd にして --root で対象 worktree を指定して起動する

- **問題事象**: case-run（DEL-3191-1・Case #3191）で worktree 内の check_distribution_boundary_cli を worktree cwd で起動しようとしたところ、`data/distribution-targets.yaml` 等の一部ファイルが worktree 側に存在せず起動できなかった。
- **発生局面**: 実装検証（case-run の配布依存境界 checker 実行。Case 専用 worktree .worktrees/3191-case）
- **検知方法**: checker 起動時のファイル不在エラーと worktree 内 data/ の実在確認
- **根本原因**: worktree の .opencode/skills/repo-agentdev-integrity/ には checker が要求する一部リソース（data/ 配下）が欠落しており、cwd を worktree とした起動では必要リソースが解決されない
- **自律対応内容**: host repo root を cwd にして --root で worktree を指定する形で checker を起動し検証を完了（環境指示「配布物検証は host repo root から --root 指定」の具体例の補強）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree 内 checker 実行手順は「host repo root を cwd、対象を --root で指定」を標準形とする。integrity checker 系の実体パスは .opencode/skills/repo-agentdev-integrity/scripts/（本 inbox 既存エントリ参照）と併せて適用する
- **再発条件**: worktree cwd で repo-agentdev-integrity の checker を起動した場合
- **予防策候補**: checker 実行手順に「host repo root を cwd、対象を --root で指定」の起動形を明記する
- **想定反映先**: repo-agentdev-integrity SKILL.md（実行契約）、agentdev-git-worktree reference worktree-operations.md の読取系 checker 実行手順
- **関連**: Case #3191、PR #3213、.opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary_cli.ts
- **タグ**: `#integrity` `#worktree` `#checker`

## ADF-COVERS 対応宣言の役割は design 対応ゲートを通すため ADF-COVERS(design) を使用する（implementation 宣言では missing-design が解消しない）

- **問題事象**: case-open（Root Case #3214、Definition PR #3215）で、新規 REQ-094 行への design 対応宣言を ADF-COVERS(implementation) で記載したところ、coverage 実測で counts {design: 0, implementation: 12} となり missing-design 12 行（missing-design 0 件ゲート不合格）を検出した。
- **発生局面**: Definition 変更（case-open STEP-4 missing-design 0 件ゲート。Case 専用 worktree .worktrees/3214-definition）
- **検知方法**: agentdev-traceability coverage --req REQ-094-001〜012 の counts 実測（design: 0）
- **根本原因**: ADF-COVERS 宣言の役割（design / implementation / verification）は宣言の役割タグがそのまま coverage の役割解釈になる。Design ファイル本体に書いた宣言でも implementation タグなら implementation 役割として解釈され、design 対応（case-open missing-design ゲート・case-ready ready 遷移ゲートの対象）には数えられない
- **自律対応内容**: 宣言を ADF-COVERS(design) へ変更し、coverage 再実測で counts {design: 12}、missing-design 0 件を確認してゲート合格
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: Design ファイル（docs/designs/**）への新規 REQ 行対応宣言は ADF-COVERS(design) を標準とする（case-ready Design 冒頭の既存宣言 ADF-COVERS(design): REQ-061-xxx 系と同型）。coverage の4役割は decision / design / implementation / verification
- **再発条件**: Design ファイルへ ADF-COVERS(implementation) で新規 REQ 行を宣言した場合
- **予防策候補**: coverage --req 実測を宣言作成直後に実行して design 役割として解釈されていることを確認する（case-open STEP-4 ゲートが fail-closed として機能するため重大化はしないが、手戻りを削減できる）
- **想定反映先**: case-open workflow skill reference（definition-pr-and-idempotency.md の missing-design 0 件ゲート手順）、agentdev-traceability check-interpretation.md の役割解釈の説明
- **関連**: Root Case #3214、PR #3215、docs/designs/responsibilities/document-type-responsibilities.md、docs/designs/authoring/vocabulary-registry.md
- **タグ**: `#traceability` `#adf-covers` `#case-open`

## REQ 新規作成時の docs/README.md 件数言及行は generate_indexes.ts の自動更新対象外（req-range-staleness が検出する）

- **問題事象**: case-open（Root Case #3214、Definition PR #3215）で REQ-094 新規作成後に generate_indexes.ts を実行したが、docs/README.md 本文の「現行要件は56件である」行は AUTOGEN ブロック外のため更新されず、check_integrity の req-range-staleness が新規 unmanaged NG 1 件を検出した。
- **発生局面**: Definition 変更（case-open STEP-4 索引再生成後の checker 実測）
- **検知方法**: check_integrity --profile source の req-range-staleness NG（docs/README.md states 56 active REQs but actual count is 57）
- **根本原因**: generate_indexes.ts は AUTOGEN ブロック（id=readme-req-summary-count 等）のみ更新し、本文中の手動記述（「現行要件はN件である」等の件数言及行）は対象外
- **自律対応内容**: docs/README.md 本文行を 57 件へ修正し、check_integrity 再実測で新規 unmanaged NG 0 件を確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: REQ/Decision/Design の件数や一覧を本文で言及する手動記述は索引再生成の追随対象外。REQ 新規作成・廃止を含む Definition PR では generate_indexes 実行後に req-range-staleness を含む check_integrity 実測が必須
- **再発条件**: REQ ファイルを新規作成・廃止する Definition PR で generate_indexes.ts 実行のみで check_integrity を省略した場合
- **予防策候補**: Definition PR の期待値確定手順（REQ 行変更時の check_integrity・check_autogen_freshness 実測）を case-open STEP-4 手順2.5 後の必須実測として維持する（本件はその手順どおりの実測で検出・修正完了）
- **想定反映先**: case-open workflow skill reference（definition-pr-and-idempotency.md 手順2.5 の checker 実測の意図説明）
- **関連**: Root Case #3214、PR #3215、docs/README.md、src/opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts
- **タグ**: `#integrity` `#autogen` `#req-staleness`

## トレーサビリティ対応宣言は「未宣言の artifact のみ」を新規 sidecar に集約し、既存宣言持ち artifact は該当情報源へ追加する

- **問題事象**: case-run（REQ-094 Wave 2 横断是正バッチ）で、修正対象ファイルを新規 sidecar に一括列挙したところ、既存 sidecar 宣言済みファイル・inline 宣言済みファイルと重複し duplicate-inconsistencies を検出した（PR #3226・#3228・#3230 の対応宣言作業）。
- **発生局面**: トレーサビリティ対応宣言作成（case-run STEP-S5 対応宣言、Epic #3216 Wave 2）
- **検知方法**: agentdev-traceability check の duplicate-inconsistencies（同一 artifact × role × 要件行の複数情報源矛盾）
- **根本原因**: artifact パス × role の対応宣言が複数情報源（既存 sidecar / inline ADF-COVERS 宣言）に分かれる状態で、新規 sidecar に全修正対象を一括列挙すると既存宣言と重複する
- **自律対応内容**: 新規 sidecar は「未宣言の artifact のみ」に集約し、既存宣言持ち artifact は該当情報源（既存 sidecar または inline 宣言）へ追加して再検査 9/9 pass を確認（本手順込みで解消済み）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 対応宣言追加前には component / sidecar 対応一覧の事前確認を行う（agentdev-traceability sidecar-and-policy.md の手順）。inline 宣言が使用中の文書には inline 優先規則（producer 側）で集約する
- **再発条件**: 修正対象ファイル一覧をそのまま新規 sidecar に列挙した場合
- **予防策候補**: 対応宣言作成前に既存宣言（sidecar・inline）の走査を必須化する（coverage --artifact または rg での ADF-COVERS 宣言事前確認）
- **想定反映先**: agentdev-traceability 側への操作知識追記候補（PR #3226 本文 Findings 記録）
- **関連**: Epic #3216、PR #3226・#3228・#3230、traceability/src-opencode-correction.yaml、traceability/decisions-terminology-batch.yaml
- **タグ**: `#traceability` `#adf-covers` `#duplicate-inconsistencies`

## check_distribution_boundary --profile link は worktree 内で projection 未実体化により必ず zero-targets になる（違反ではない）

- **問題事象**: case-run 委譲内 agent が worktree 内で check_distribution_boundary --profile link を実行し、zero-targets（projection 未実体化）を「違反」と誤認するリスクがあった（PR #3226 の case-run 記録）。
- **発生局面**: 配布依存境界 gate 実行（case-run STEP-S5・Epic #3216 Wave 2-6 src バッチ）
- **検知方法**: PR 本文検証差分の記録（実際には既存 reference のフォールバック手順に従い host main root projection で実行して回避済み）
- **根本原因**: worktree では .opencode/plugins の junction 未伝播により projection が実体化されず、--profile link の検査対象が 0 件になる。環境差を違反と区別しないと誤停止・誤合格が起きる
- **自律対応内容**: 既存運用手順どおり host main root projection で実行し、環境ラベル（実行環境=main root 実体、検査対象=main root projection、junction 伝播状態）を記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree 内 gate 実行では環境ラベル（実行環境・junction 伝播状態・検査対象 root）の記録が誤判定防止の要。zero-targets は違反ではなく環境差として解釈する
- **再発条件**: worktree 内で --profile link を初回実行した委譲 agent が zero-targets を違反判定した場合
- **予防策候補**: 委譲 prompt の前置観点として「worktree 内 --profile link は必ず zero-targets」を明示する
- **想定反映先**: workflow-case-run delegation-and-result・reference-resolution reference（PR #3226 本文 Findings 記録の追記候補）
- **関連**: Epic #3216、PR #3226、check_distribution_boundary.ts
- **タグ**: `#distribution-boundary` `#worktree` `#gate`

## docs 配下の過去文書には異言語混入が残存し得る（DEC-012 の「区別 없ければ」を是正）

- **問題事象**: case-run（REQ-094 Wave 2-3 docs/decisions バッチ）で、DEC-012 に韓国語混入「区別 없ければ」を発見し「区別がなければ」へ是正した（PR #3228）。UTF-8/LF の破壊は検出していない。
- **発生局面**: TS-001 抽出・是正（Epic #3216 Wave 2-3）
- **検知方法**: docs/decisions 配下の機械抽出（一般英単語・異言語候補の走査）
- **根本原因**: 過去の編集で混入した異言語は日本語・英語いずれにも該当しないため、英単語混在のみを対象とする検査では捕捉されない
- **自律対応内容**: 「区別がなければ」へ意味保持是正済み（PR #3228 マージ済み）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 文書品質の機械検査は英単語混在・CJK 破損に加えて第三言語混入も観点に含め得る（REQ-053-039 の機械検査対象拡大ではない個別是正の範囲）
- **再発条件**: 異言語 IME の誤変換・貼り付け混入が行われた文書を横断走査した場合
- **予防策候補**: 横断走査時にハングル等の非想定文字クラスの検出を走査観点に追加する（検査基盤変更は別検討）
- **想定反映先**: なし（本エントリで記録）
- **関連**: Epic #3216、PR #3228、docs/decisions/DEC-012.md
- **タグ**: `#docs-integrity` `#decisions` `#encoding`

## prh 固定置換辞書への実測済み語の登録は DEC-028 限定例外の実測立証を別途行う（schema・retry の語例が確定済み）

- **問題事象**: case-run（REQ-094 Wave 2）で schema→スキーマ、retry→再試行等の固定置換可語（訳語表⑤）の語例が横断是正の実測で確定したが、prh 固定置換辞書への新語登録は DEC-028 の限定例外（文脈非依存性・誤検出ゼロの実測立証）を要するため本 Wave スコープ外として残置した（PR #3229・#3227 記録）。
- **発生局面**: Wave 2 横断是正（Epic #3216）後の辞書運用判断
- **検知方法**: PR 本文 Findings / Capture候補 の記録（#3229・#3227）
- **根本原因**: Wave 1 で prh 辞書を空辞書で納品する契約（実測立証なき登録を行わない運用）のため、実測はあるが立証手続き（誤検出ゼロ実測）が未実施
- **自律対応内容**: 登録は行わず capture として記録（本エントリ）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: DEC-028 の運用（変更なし）
- **横展開観点**: 横断是正で確定した語例は語彙レジストリ（vocabulary-registry.md、accepted）への追記候補でもある（PR #3227 Design確定候補 記録。accepted Design への内容追記は別 Case 対象）
- **再発条件**: 固定置換可語の語例が確定した後、立証手続きなしに prh 辞書へ登録する場合
- **予防策候補**: prh 新語登録は「文脈非依存性判定 + 誤検出ゼロ実測」の2手続きを経てから行う
- **想定反映先**: なし（本エントリで記録）
- **関連**: Epic #3216、PR #3227・#3229、DEC-028、.agentdev/config/plugins/agentdev-textlint-guard-prh.yml、docs/designs/authoring/vocabulary-registry.md
- **タグ**: `#prh` `#vocabulary` `#dec-028`

## 横断是正バッチの REQ-094 系 implementation 宣言の恒久配置先の設計が未決（inline 宣言使用中の文書への対応宣言の正規化）

- **問題事象**: case-run（REQ-094 Wave 2-2 docs/designs バッチ）で、REQ-094-001/004/005/010/011 の implementation を是正済み文書へ個別宣言する構成が、既存 inline ADF-COVERS 宣言との単一情報源契約（duplicate-inconsistencies）により sidecar では宣言不可だった。本バッチでは inline 宣言を持たない 4件のみ sidecar 宣言し、残り 30件の適用事実は PR 本文検証差分を正とした（PR #3229 記録）。
- **発生局面**: 対応宣言作成（Epic #3216 Wave 2）
- **検知方法**: traceability check の duplicate-inconsistencies と sidecar/inline 宣言の集合矛盾
- **根本原因**: inline 宣言（producer 側優先）と sidecar の役割分担が REQ-094 系の横断是正適用体（多数の既存文書への適用事実の宣言）に対して定義されていない
- **自律対応内容**: inline 宣言を持たない文書のみ sidecar 宣言、残りは PR 本文検証差分を正として記録（現行解消。恒久配置先は未決）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（設計検討事項として残置）
- **横展開観点**: 今後の新規 Markdown に対する REQ-094 適用（REQ-094-012）では、適用事実の宣言方式（inline 追記 vs sidecar 集約 vs PR 検証差分）を事前に決めておく必要がある
- **再発条件**: 次回横断是正・新規文書への REQ-094 適用時
- **予防策候補**: REQ-094 系 implementation 宣言の恒久配置先を別 Case（req-define / case-open 系）で設計する
- **想定反映先**: なし（設計検討事項）
- **関連**: Epic #3216、PR #3229、traceability/ra002-designs-batch-correction.yaml、v4-traceability-model Design
- **タグ**: `#traceability` `#req-094` `#sidecar`
