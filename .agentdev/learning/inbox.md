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
