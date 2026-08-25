# テスト実行残渣（tests/tmp-*）の git 管理防止のための .gitignore 検討

## 観測

旧ローカルテストの実行残渣（src/opencode-local/agentdev-gh-cli/tests/tmp-local-runner-*/case-*.md 18ファイル、src/opencode/plugins/agentdev-gh-tool/tests/tmp-plugin-local-*/ 6ディレクトリ）が git 管理されたままになっていた。前者は PR 2440 で削除済み。後者（tmp-plugin-local-*）は同種の残渣だが PR 2440 の削除対象から外れた。

## 今回扱わない理由

tmp-plugin-local-* 配下の削除・gitignore 化は当該 Case の完了条件（issue_tracking_list.test.ts の新方式置換）の範囲外。gitignore パターン追加は配布基盤（REQ-009）の設計判断を伴う。

## 影響

テスト実行のたびに tmp 成果物が未追跡または誤って staged になり得る。PR 2440 では残渣ファイルの削除 diff（59ファイル中24ファイル）が PR を膨らませた。

## レビューで決めること

- src/opencode-local/agentdev-gh-cli/tests/tmp-*/、src/opencode/plugins/agentdev-gh-tool/tests/tmp-*/ を .gitignore に追加するか
- 追加する場合、テスト側で tmp ディレクトリを repo 内に置く設計（os.tmpdir() 利用）の見直しを含めるか

## 根拠

- PR 2440 本文「Findings / Capture候補」intake 3件目
- PR 2440 変更ファイル一覧（tmp-local-runner-* 18ファイル削除、tmp-plugin-local-* 6ディレクトリ新規）
