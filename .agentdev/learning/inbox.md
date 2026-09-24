# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 横断依存検査の検査入力 JSON が workspace 外書込みで guard ブロックされ worktree 内一時パスへ切替

- **問題事象**: case-open STEP-5 横断依存検査の検査入力 JSON を harness 提案の temp ディレクトリ（C:\WINDOWS\TEMP\opencode）へ保存しようとしたところ、agentdev-textlint-guard Plugin が workspace 外への write を fail-closed でブロックした（エラーメッセージ: write targets a path outside the project root; blocked per fail-closed）
- **発生局面**: 実装（case-open workflow STEP-5・Case #3101）
- **検知方法**: write ツールの fail-closed エラー応答
- **根本原因**: 横断依存検査エンジン（inspect_cross_dependencies.ts）の scripts/README.md は --input \<input.json\> のみを規定し、検査入力 JSON の置き場所の推奨先を定めていない。一時ファイル先として workspace 外 temp を選択したが、write guard は fail-closed で workspace 外書込みを拒否する（AGENTS.md 行動規範と整合した正しい動作）
- **自律対応内容**: workspace 外 temp への書込みを断念し、本 Case 専用 worktree 配下（.worktrees/3101-definition/\.tmp-crossdep-input-ru0123.json、git 未追跡）に検査入力を置いてエンジンを実行。検査後に一時ファイルを削除し、worktree が clean であることを git status で確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: worktree 配下で実行する機械的検査の入力一時ファイルは、workspace 外 temp ではなく検査対象 worktree 配下の明示的な一時パス（commit 対象外・検査後削除）へ置く。guard ブロックは迂回せず標準手段へ切替する（AGENTS.md 書込み guard 運用指針の実行例）
- **再発条件**: worktree 配下の workflow がエンジン入力 JSON 等の一時ファイルを必要とし、harness 側推奨 temp パスに書込む場合に再発
- **予防策候補**: inspect_cross_dependencies.ts の scripts/README.md に検査入力 JSON の置き場所指針（workspace 外 temp 禁止・worktree 配下一時パス推奨・検査後削除）の注記を追加する
- **想定反映先**: docs（src/opencode/skills/agentdev-workflow-case-open/scripts/README.md への注記追記。具体化の判断は backlog/intake 側）
- **関連**: .opencode/skills/agentdev-workflow-case-open/scripts/README.md、Case #3101（PR #3102）
- **タグ**: `#worktree` `#write-guard` `#cross-dependency-inspection`

## agentdev_gh issue_list が本文頻出トークンの search + state closed 組合せで safety page limit に到達し失敗する

- **問題事象**: case-open STEP-5 冪等検出で `issue_list`（search: "RU-0124"、state: closed）を実行したところ、safety page limit（10 pages × 100）に到達する operation-failed となった（エラーメッセージ: narrow the filters (state, labels, kind, trackingState, search) and retry）。同トークンは同一バッチ兄弟 Case の Issue 本文（CR-002・wave_hints 記録等）に頻出するため、検索対象が実質絞れていない
- **発生局面**: case-open workflow STEP-5 冪等検出（Case #3103・Case #3101 の 冪等検出では未遭遇）
- **検知方法**: agentdev_gh の operation-failed 応答（retryable: true）
- **根本原因**: search トークンが本文側の頻出語（兄弟 Case が相互参照する採番計画・wave_hints の記載）と一致し、closed を含む全体走査で page limit に到達する。一時的 API エラーではなく入力フィルタの狭さが原因の決定的失敗
- **自律対応内容**: 1回再試行は同一の決定的失敗になるため実施せず、検索条件を state: open に限定して再実行し検出完了（作成直後の Root Case / Definition PR は open 状態にしか存在しないため、open 限定でも本 Case の冪等検出要件を満たす）。既存 open Root Case 0 件を機械確認して重複生成なしを確定
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: issue_list の search はタイトル等に偏在しない高選択性トークンで使い、頻出トークン + closed を含む広フィルタは避ける。冪等検出（既存 open 成果物の検出）は state: open 限定で十分なケースが多い。再試行前に入力フィルタの決定的違反（page limit 到達）と一時的 API エラーを区別する
- **再発条件**: 同一バッチ内で相互参照されるトークン（RU 番号・REQ 行 ID 等）を search に使い、state を限定しない場合に再発
- **予防策候補**: issue_list 冪等検出の手順（case-open / issue tracking 系 skill references）に、search トークンの選択性指針（相互参照頻出トークンの回避・state/role 併用）の注記を追加する
- **想定反映先**: docs（case-open / issue tracking 系 skill reference への注記追記。具体化の判断は backlog/intake 側）
- **関連**: Custom Tool agentdev_gh（issue_list）、Case #3103（PR #3104）
- **タグ**: `#agentdev-gh` `#issue-list` `#idempotency-detection`

## inspect finding 由来 draft の target_design.domain が実配置と不一致でも slug・行番号・文言で一意特定し実配置を正として扱える

- **問題事象**: draft-data の ACT-DESIGN-001 が target_design.domain: responsibilities を宣言していたが、実ファイルは docs/designs/foundations/document-model.md であり domain が実配置と不一致。宣言パスを正として機械的転記すると誤パス（docs/designs/responsibilities/document-model.md・不在）への変更が発生し得た
- **発生局面**: case-open workflow STEP-2/STEP-3（Case #3121・draft-data artifact_actions と実ファイルの突合）
- **検知方法**: draft-data の target_design パスと実ファイルの突合（responsibilities/document-model.md の不在確認・grep による DEC-002 言及 1 箇所が foundations/document-model.md L375 に存在することの確認）
- **根本原因**: inspect finding の domain 記録が document-model.md の過去の配置（responsibilities/）を参照しており、基盤 6 ドメイン再編による配置移動後に finding 側の domain が追随していない。slug・行番号・文言は実配置と一致
- **自律対応内容**: slug（document-model）・行番号（L375）・文言 3点による一意特定の機械的照合で実配置（foundations/）を正として判定し、Definition Package に備考記録した上で Definition PR を作成。Root Case 本文に解決根拠を記録し、adversarial-review skip 判断の根拠（機械的照合であり意味的決定を含まない）にも使用
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: draft-data の artifact_actions を機械的転記する前に、target_design の実パス実在確認（grep による本文一意性確認込み）を入れる。domain/slug 宣言と実配置の不一致でも slug・行番号・文言が一致すれば機械的照合で解決でき、意味的決定（HITL）を要しない。宣言側の誤記を正にして不在パスを変更対象にしない
- **再発条件**: inspect finding が配置移動（ドメイン間移送）済みの文書を旧配置の domain で参照する場合に再発
- **予防策候補**: inspect-docs / req-define 系 workflow に、finding の domain 記録の鮮度確認（実パス照合）を入れる
- **想定反映先**: docs（workflow skill reference への注記追記。具体化の判断は backlog/intake 側）
- **関連**: agentdev-workflow-case-open（STEP-2/STEP-3）、Case #3121（PR #3122）
- **タグ**: `#docs` `#domain-drift` `#mechanical-projection`
