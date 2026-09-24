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

## case-ready トレーサビリティ完全性ゲートが baseline 既知 missing-design の対象行で fail-closed 停止する（対象行 design 対応の事前確認が Definition 計画に必要）

- **問題事象**: case-ready STEP-2 canonical 再取得時の traceability check（対象要件行 scope・機械実行）で、本 Case が意味変更した既存行 REQ-031-030 の missing-design（Design 対応 0 件）を検出し、workflow 契約（STEP-2 差し戻し分岐・fail-closed・手動判断での代替禁止）により case-open 差し戻し・ready 未遷移で停止した。欠落は pre-merge baseline（7847b412）で既に存在し本 Case 由来の増分はなかったが、lifecycle gate completeness は対象要件行 scope で fail-closed であり、baseline 既知の例外は契約上 missing-verification にしかない
- **発生局面**: case-ready workflow STEP-2（Case #3123・Definition PR #3124 merge 後の canonical 再取得）
- **検知方法**: agentdev-traceability check.ts `--req REQ-034-025,REQ-034-028,REQ-034-044,REQ-034-045,REQ-031-030` の missing-design fail（exit 2）+ coverage.ts による design 0 件 / implementation 3 件の実査 + pre-merge baseline 7847b412 での同一検出再現
- **根本原因**: req-define / case-open の Definition Package 計画時に「既存行の意味変更」を対象とする場合、当該行の現行 design 対応有無の確認が手順に組込まれておらず、baseline 既知の design 対応欠落行を含む Case が case-ready ゲートで必ず停止する構造になっている（case-open の missing-design 0 件ゲートは新規行 REQ-034-044/045 には適用・適合したが、意味変更行 REQ-031-030 には増分ベースの判定で適用されなかった。比較として兄弟 Case 新設の REQ-031-033 は case-run.md Design の design 対応 1 件を持つ）
- **自律対応内容**: merge は巻き戻さず（resume protocol）、DEC-042 は proposed 維持、draft 保持で停止。Root Case #3123 本文へ停止理由・証跡・再開条件を記録し本学びを capture
- **ユーザー確認有無**: なし（停止報告で判断肢を提示）
- **Decision/REQ/spec影響**: なし（現行契約の正しい適用。ゲート契約変更は別 Case）
- **横展開観点**: 既存 REQ 行を意味変更する Case の req-define / case-open では、対象行（新規行に加え意味変更行）の design 対応有無を traceability coverage で事前確認し、欠落している場合は Definition 内で design 対応追加（例: 実現 Design の ADF-COVERS(design) 宣言追記）を artifact_actions に含めて合意する。増分ベース（新規行のみ）の missing-design ゲート適用では case-ready の lifecycle gate を通過できない
- **再発条件**: baseline で design 対応 0 件の既存 REQ 行を対象に含む Definition Case が case-ready に到達した場合に毎回再発し得る（corpus の missing-design 既知債務 877 行の範囲で発生余地がある）
- **予防策候補**: req-define / case-open の Definition Package 生成手順に「対象行の design 対応事前確認（coverage --req）と欠落時の artifact_actions 組込み」ステップの追加
- **想定反映先**: docs（req-define / case-open 系 workflow skill・Design への手順追記。具体化の判断は backlog/intake 側）
- **関連**: agentdev-traceability（check-interpretation「completeness の 2 層解釈」）、Case #3123（PR #3124）
- **タグ**: `#traceability` `#missing-design` `#case-ready` `#lifecycle-gate`

## トレーサビリティ sidecar は宣言元 component に対応づける

- **問題事象**: producer 側ソースの実装・verification 宣言を plugin 登録層用 sidecar に置いた初回検査で duplicate-inconsistencies が2件検出された。
- **発生局面**: 実装・検証（Case #3113、PR #3133）。
- **検知方法**: REQ-011-033 を対象とした traceability check の findings。
- **根本原因**: sidecar の所属は変更対象ファイルの見た目ではなく、producer/component（配布物単位）の責務境界で決める必要があるが、宣言作成時にその対応先を誤った。
- **自律対応内容**: producer ソースとテストの宣言を traceability/agentdev-gh.yaml に移し、check を再実行して全9項目 pass を確認した（PR 本文の記録）。
- **ユーザー確認有無**: なし。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: 対応宣言を追加する前に対象ファイルの producer/component と sidecar 対応を照合する。Tool 本体は agentdev-gh、plugin 登録層は agentdev-gh-tool の sidecar を用いる。
- **再発条件**: producer 側実装の宣言を隣接する登録層 component の sidecar へ追加した場合。
- **予防策候補**: 宣言追加前の component/sidecar 対応一覧確認を定型化する。
- **想定反映先**: traceability 宣言運用手順。
- **関連**: traceability/agentdev-gh.yaml、traceability/agentdev-gh-tool.yaml、Case #3113（PR #3133）。
- **タグ**: #traceability #sidecar #component-boundary

## Case Issue 本文のレビュー判断 evidence path が backlog-review prune 後に参照不能になる構造

- **問題事象**: Case Issue 本文のレビュー判断（RD-001/RD-002）が参照する evidence path（`.agentdev/learning/promoted/existing-countermeasure-update-junction-os-command-differences.md`、`.agentdev/learning/promoted/existing-countermeasure-update-worktree-operations-backslash-path-note.md`）が、本 Case の SSoT 再取得時点で worktree・main とも存在しなかった。backlog-review の prune（成功成果物削除）による正常なライフサイクルの可能性が高いが、本文からは prune 済みなのか欠落なのか判別できない
- **発生局面**: case-run SSoT 再取得（Case #3107、PR #3127）。
- **検知方法**: PR 本文 Findings セクションの申告（RD-001/RD-002 の evidence path 不在の観察）。
- **根本原因**: 採用済み学びの evidence path を Case Issue 本文へ絶対パスで記録する構成は、promoted 成果物の削除（prune）後に参照不能になる。prune は成功成果物の正常な削除であり、参照側の本文に tombstone もライフサイクル記録も残らない。
- **自律対応内容**: 実装阻害なし（REQ-018-006/007 行本文に学びの内容が合意済み投影として凝縮済み）として case-close を継続し、本観察を learning inbox へ回収。
- **ユーザー確認有無**: なし。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: Case Issue 本文の evidence path は、参照先成果物のライフサイクル（prune）を跨いで耐える識別子（promoted 時の RU 番号・learning タイトル・関連 Case 番号）と併記する。path 単独の参照は後工程（case-revise・監査）での証跡追跡を弱め得る。
- **再発条件**: learning promoted 成果物を参照する Case Issue 本文が backlog-review prune 以降に後工程で再読込された場合。
- **予防策候補**: Issue 本文テンプレートの evidence 記録規約に「path + prune 後も識別可能な代替識別子（RU 番号・タイトル）の併記」を追加する。backlog-review 側の prune 記録との突合手順の明記。
- **想定反映先**: docs（Issue テンプレート・backlog-review 系 workflow skill への注記追記。具体化の判断は backlog/intake 側）。
- **関連**: .agentdev/learning/promoted/（prune 対象）、agentdev-backlog-integration（prune 方針）、Case #3107（PR #3127）。
- **タグ**: #traceability #evidence-path #prune #lifecycle

## 配布物本文への concrete ID 直書きを配布依存境界 checker の事後検知が捕捉し節参照化で解消

- **問題事象**: 初回実装で配布物本文（harness-delegation.md）へ要件行 ID（REQ-031-033、REQ-031-007）を直書きし、配布依存境界 checker の事後検知で捕捉された。
- **発生局面**: 実装（case-run・Case #3111、PR #3132）。
- **検知方法**: 配布依存境界 checker（check_distribution_boundary_cli.ts）の concrete_id_hits 事後検知（初回 concrete-id 違反 2 件）。
- **根本原因**: 文書執筆中に配布物本文への concrete ID 直書き禁止（配布依存境界）の適用を漏らした。既存の作成時予防 + 事後検知の両面運用（DEC-014 配布依存境界多層 enforcement）の検知面が正常作動した事象であり、既存対策の範囲内。新規問題クラス・未防止の再発要因なし。
- **自律対応内容**: 本文の要件行 ID を case-run Design の節参照へ置換して解消し、再検証合格（ok: true / concrete_id_hits 0）。
- **ユーザー確認有無**: なし。
- **Decision/REQ/spec影響**: なし（配布 SKILL 本体・REQ 行は無変更）。
- **横展開観点**: 配布物本文を追記する場合は節参照方式を執筆時に先行選択する。検知面（checker）が正しく作動していることの実証事例として、多層 enforcement の運用継続判断の根拠になる。
- **再発条件**: 配布物本文を新規執筆・追記する際に concrete ID を混入した場合（検知面は常時作動）。
- **予防策候補**: なし（既存の作成時予防 + 事後検知で担保。追加施策不要）。
- **想定反映先**: なし（既存対策で継続運用。具体化の判断は backlog/intake 側）。
- **関連**: src/opencode/skills/agentdev-case-run-execution-adapter/references/harness-delegation.md、DEC-014（配布依存境界多層 enforcement）、Case #3111（PR #3132）。
- **タグ**: #distribution-boundary #concrete-id #detection-working


## worktree 型検証で bun types が未解決の場合の依存整備手段選択

- **問題事象**: Case #3103 の worktree 内で tsc 型検証を実行した際、bun types の解決失敗（TS2688）が発生した。
- **発生局面**: case-run の型検証（DEL-3103-2、Case #3103）。
- **検知方法**: tsc --noEmit の TS2688 エラー。
- **根本原因**: worktree には main 側 node_modules が自動伝播しない。main 側 node_modules が存在しない場合は junction による依存共有が成立せず、依存整備手段は worktree 内 bun install へ決定的に切り替わる。
- **自律対応内容**: agentdev-git-worktree の bun test 実行環境前提に従って worktree 内 bun install を実行し、型検証を再実行した。tsconfig の書き戻しがないことを git status で確認した（PR 本文の記録）。
- **ユーザー確認有無**: なし。
- **Decision/REQ/spec影響**: なし。
- **横展開観点**: worktree で型検証・テストを行う際は node_modules の伝播状態を確認し、main 側 node_modules がない場合は worktree 内 bun install を選択する。
- **再発条件**: worktree 内で依存パッケージを必要とする検証を行い、依存未伝播かつ main 側 node_modules が存在しない場合。
- **予防策候補**: bun 依存整備手段の選択基準表に、main 側 node_modules 不在時は手段2（worktree 内 bun install）へ一意に決まる判定補助を追記する。
- **想定反映先**: agentdev-git-worktree の worktree-operations.md「bun test 実行の環境前提」。
- **関連**: DEL-3103-2、REQ-018、Case #3103（PR #3130）。
- **タグ**: #worktree #bun #typecheck #dependency-setup
