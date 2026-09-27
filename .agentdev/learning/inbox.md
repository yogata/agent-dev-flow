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
