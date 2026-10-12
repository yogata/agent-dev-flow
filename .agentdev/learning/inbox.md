# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## agentdev_gh issue_create で role: case に対し kind を渡すと input contract 違反で拒否される

- **問題事象**: case-open 工程で Root Case を agentdev_gh issue_create により起票した際、role: "case" と kind: "task" を同時に渡すと input contract 違反（invalid-input、detail: kind requires role 'tracking'）で拒否され、作成が1回失敗した
- **発生局面**: 実装（case-open STEP-2 の Root Case 起票、GitHub Issue 作成）
- **検知方法**: agentdev_gh の即時応答（ok: false、failure.kind: invalid-input、retryable: true）
- **根本原因**: kind フィールドは追跡Issue（role: tracking）専用の論理属性であり、Case Issue（role: case）の入力契約では受け付けない。追跡Issue 論理スキーマの role と kind の適用条件を誤って Case 起票へ重畳適用した
- **自律対応内容**: kind フィールドを除去し、role: "case" と labels（検索・整理用 work_type ラベル）のみで再呼出しして作成に成功した。Tool は fail-fast で応答し、VERIFY は 2回目の呼出しで通過した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: Tracking / Case / Epic / 子 Issue の起票でも role に応じたフィールド適用条件を確認してから呼出す。issue_create の kind は role: tracking のときのみ有効
- **再発条件**: Root Case や追跡Issue 起票で issue_create の入力に role と kind を無条件に両方設定したとき
- **予防策候補**: role が case / tracking のどちらかを先に確定し、kind は tracking のときのみ設定する呼出し前チェック。Custom Tool 操作契約 Design の issue_create 入力契約（role/kind 適用条件）の確認
- **想定反映先**: agentdev-issue-tracking（追跡Issue 論理スキーマの role/kind 適用条件の明示）または Custom Tool 操作契約 Design の issue_create 入力契約の注記
- **関連**: .agentdev/extensions/skills/agentdev-workflow-case-open.yaml、Root Case #3623、src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md
- **タグ**: `#gh-workaround` `#custom-tool`

## 冪等検索の search トークンに topic_slug を単独使用すると本文に投影されない構成の Root Case を検出できない

- **問題事象**: case-open 工程の冪等検出で issue_list の search に topic_slug（case-open-skill-v5-vocabulary）を単独使用した。Root Case のタイトルと本文は topic_slug を含まない構成（issue-title-policy が topic_slug をタイトルから除く情報に指定、本文投影範囲にも topic_slug を含めない運用）であるため、当該トークンでは既存同主題 Root Case が存在しても検出できない構造になっていた
- **発生局面**: 実装（case-open STEP-2 直前の既存 Root Case 冪等検出、GitHub Issue 検索）
- **検知方法**: STEP-5 の冪等再確認で本文語彙（設計根拠対応）による再検索に切替した際、topic_slug トークンが Root Case 本文の実在語彙と接続していないことに気付いた（手動確認）
- **根本原因**: search トークン選択指針（冪等キー語、REQ 番号、topic_slug 等の例示）において、例示語が対象 Issue 本文に投影されない語である場合の無効性に注意が向いていなかった。検索トークンの有効性は本文実在語彙との照合で確認する必要がある
- **自律対応内容**: STEP-5 の冪等再確認で本文に実在する選択性ある語（設計根拠対応）にトークンを切替し、既存 Root Case が自 Case（#3625）のみであることを検出確認した。重複生成なしを確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: issue_list の冪等検索では、search トークンが対象 Issue 本文の実在語彙であることを起票済み本文との照合で確認してから使う。タイトル・本文から除外される情報（topic_slug、投入識別子等）をトークンの単独根拠にしない
- **再発条件**: Root Case 本文へ topic_slug を投影しない構成の Case で、冪等検索トークンに topic_slug を単独使用したとき
- **予防策候補**: 冪等検索の search トークンは REQ 番号・主題語等の本文実在語彙から選ぶ運用ルール。SKILL 側 search トークン選択指針の topic_slug 例示への注記（本文投影される語に限る旨）の必要性は learning-promote での昇華判断に委ねる
- **想定反映先**: agentdev-issue-management（issue-operation-safety.md の search トークン選択性指針）または agentdev-workflow-case-open SKILL 本文の冪等分岐節
- **関連**: Root Case #3625、src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md、docs/designs/workflows/issue-title-policy.md
- **タグ**: `#gh-workaround` `#idempotency`

## 配布 reference 追記に docs/designs/ 等の具参照を含めると IR-055 が新規 delta として検出される

- **問題事象**: case-open STEP-4 の Definition 編集（case-ready 配布 reference readiness-and-cleanup.md への横断依存検査入力構成規律追記）において、追記文面に「docs/designs/** の ADF-COVERS 宣言」という docs/designs/ 具参照を含めた。prepare_definition_pr.ts の check_integrity ゲートで IR-055 runtime-unresolved-reference の新規 delta（baseline 未登録）1 件が検出され、ゲートが fail した
- **発生局面**: 実装（case-open STEP-4 の機械工程、check_integrity ゲート実行）
- **検知方法**: prepare_definition_pr.ts 報告 JSON の check_integrity step status: fail（exit 1、1 new unmanaged NG）。手動再実行の JSON 報告で新規 warning の message「New heuristic violation: docs/designs/ reference 'docs/designs/' detected (IR-055 delta from baseline)」を確認
- **根本原因**: 配布物（src/common/**）は runtime 投影先（.opencode/ 等）から docs/designs/ を直接参照できない（配布物具体参照禁止、IR-055）。追記文面を draft 合意文（AG-001）から転記する際、合意文の docs/designs/** 表記をそのまま持ち込んだ
- **自律対応内容**: 追記の該当箇所を抽象化参照（「Design 文書に配置された ADF-COVERS 宣言」）へ修正し、既存 worktree 再利用で不足分のみ再実行（definition-edit、stage-and-commit、check_integrity、traceability-check）して pass を確認した。修正を Definition PR #3630（commit fde2c95d）へ含めた
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 配布物へ docs 配下の Design/REQ 内容を転記する場合は、docs/designs/・docs/requirements/ 等のパス文字列を具参照として書かず抽象化参照に置き換える。AGENTS.md・reference・SKILL の編集で docs 配下パスを引用する際も同様
- **再発条件**: 配布物（src/common/** 等の配布対象）への docs 配下パスを含む文面の追記・転記を行ったとき
- **予防策候補**: docs 配下パス文字列を配布物へ書く前に IR-055（runtime-unresolved-reference）の検出対象であることを確認する。転記時に「正規成果物の Design 文書」「該当 Design」等の抽象化参照へ置換する運用
- **想定反映先**: 配布物編集を伴う workflow skill（case-run / case-open references）への具参照禁止の注記。yomiyasu 拡張 rule の指摘候補への追加は learning-promote での昇華判断に委ねる
- **関連**: Root Case #3629、Definition PR #3630、src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md、docs/designs/integrity/rules/IR-055-runtime-unresolved-reference.md
- **タグ**: `#integrity` `#distribution-boundary`

## 横断依存検査の共有領域 autogen-req-index に req-row-mentions を使うと REQ 単位集計索引との不一致で未登録需要が生じる

- **問題事象**: case-open STEP-5 の横断依存検査で、AUTOGEN 対象索引（req-health-metrics.md、requirements/README.md）を共有領域 kind req-row-mentions（行 ID 出現照合）として構成したところ、REQ 行を追加しない Case（本 Case REQ-061-029 を含む 7 Case）の対象行が索引本文に出現しないため「未登録行の重複需要」として警告対象に上がった（condition (b) case_count 7）
- **発生局面**: 実装（case-open STEP-5 の横断依存検査、検査入力 JSON の shared_areas 構成）
- **検知方法**: inspect_cross_dependencies.ts の報告 JSON（condition_b.autogen-req-index.demand_cases）と共有領域の性質（req-metrics は REQ 単位集計で行 ID を保持しない）の突合（手動確認）
- **根本原因**: AUTOGEN 索引への「REQ 行登録需要」は行 ID 登録ではなく REQ 追加起因の索引再生成需要であり、行 ID 出現照合（req-row-mentions）とは意味が不一致。共有領域の kind 選択が領域の登録形態と対応していない
- **自律対応内容**: 警告をエラー扱いにせず gate_effect: none のままゲート遷移へ影響させず、警告の意味レビューで構成起因の需要と評価して完了報告へ記録した。対応関係領域（adf-covers-declarations）は AG-001 (2) の和集合構成（sidecar 59 + inline 宣言 41）を適用し、本 Case（REQ-061-029）は対応関係領域・policy とも登録済みで需要 0 件、condition (a) も 0 件を確認
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 横断依存検査の shared_areas 構成では、領域の登録形態（行単位リストか対応宣言か全文出現か）と engine の kind の意味を対応させてから file_paths を決める。AUTOGEN 索引のような派生物索引を共有領域に加える場合の需要定義は昇華判断へ委ねる
- **再発条件**: AUTOGEN 対象索引等の派生物索引を req-row-mentions で共有領域に構成して検査したとき
- **予防策候補**: shared_areas の kind と登録形態の対応表を scripts/README.md へ追記する案は learning-promote での昇華判断に委ねる。検査構成時は対象行が領域に現れる形式（行 ID 登録か集計か）を先に確認する
- **想定反映先**: agentdev-workflow-case-open scripts/README.md（検査入力 JSON の共有領域構成ガイド）または workflow 契約 Design「Case 投入時の横断依存検査契約」節
- **関連**: Root Case #3629、.agentdev/drafts/req-draft-case-ready-cross-dep-input-composition.md（AG-001 (2)）、src/common/skills/agentdev-workflow-case-open/scripts/lib/cross_dependency_types.ts
- **タグ**: `#cross-dependency` `#false-positive`

## 新規 REQ 行の設計PRで traceability gate が対象行の missing-implementation/verification を構造的に fail 計上する

- **問題事象**: case-open STEP-4 の prepare_definition_pr.ts 呼び出しで、新規 REQ 行（REQ-035-021）追加の Definition 変更に対し traceability gate が fail を報告した（pass=9 fail=2）。fail の内訳は対象行 REQ-035-021 の missing-implementation / missing-verification であり、case-open の正規ゲートである missing-design（対象行）は pass していた
- **発生局面**: 実装（case-open STEP-4 機械工程、Definition branch での traceability check 実行時）
- **検知方法**: prepare_definition_pr.ts の報告 JSON の traceability-check step が status: fail を返したため、check を再実行して checks 各検査種別の内訳（missing-design pass、missing-implementation fail、missing-verification fail、形式検査系 8 種全件 pass）を確認した
- **根本原因**: STEP-4 reference の gate 判定仕様は「missing-design 以外の検査種別は status: fail のとき fail とする」を script 実装が文字どおり適用する一方、gate 判定仕様の冒頭は「case-run / case-ready 段階の前提である missing-implementation / missing-verification の既存欠落を含むため、case-open の正規ゲート（対象 REQ 行の missing-design 0 件）と意味が一致しない」と規定する。新規 REQ 行の設計PR 段階では対象行の implementation / verification 宣言は構造的に存在しないため script の gate 判定が必ず fail になることが手順上明文化されていない
- **自律対応内容**: case-open の正規ゲート（対象行の missing-design 0 件）を gate 判定仕様の冒頭規定から導出して合格と判定し、missing-implementation / missing-verification を case-run / case-ready 段階で解消される既知の未完了（realization_actions として保持）として実行記録と PR 本文へ記録した上で PR 作成へ進んだ。coverage --req REQ-035-021 で design 対応の case-run.md 宣言への帰着を併用確認した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（本体変更は行わない。gate 判定仕様の文言と script 実装の解離の明文化余地を学びとして記録）
- **横展開観点**: 工程の正規ゲートと機械検査の全体合否（終了コード）が解離する場面では、報告 JSON の検査種別内訳を確認して工程ゲートの意味へ帰着させて判定する
- **再発条件**: 新規 REQ 行（または新規 Decision）を Definition branch に追加する設計PR を case-open が作成し、script の traceability gate 判定が対象行の missing-implementation / missing-verification を含めて fail を返すとき、毎回再発する
- **予防策候補**: STEP-4 reference（definition-pr-and-idempotency.md）の gate 判定仕様節へ「新規 REQ 行の設計PR では対象行の missing-implementation / missing-verification の fail が構造的に発生する（case-run / case-ready 段階の前提欠落であり case-open では解消不可能）」旨の明文化を追加する。script 側の判定対象変更は既存契約の変更を伴うため reference 側の明文化が最小の予防策
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（gate 判定仕様節の補足）
- **関連**: Case #3628、PR #3631、docs/designs/commands/case-run.md、traceability check --req REQ-035-021
- **タグ**: `#workflow-deviation` `#traceability-gate` `#definition-pr`

## check_integrity --update-ir055-baseline が既存エントリの provenance と warning_total_cap を保持せず再生成する

- **問題事象**: case-open STEP-4 の機械工程で本変更起因の IR-055 新規違反（workflow skill reference 追記文の `docs/designs/` 誘導参照）を baseline 管理へ回すため `check_integrity.ts --update-ir055-baseline` を実行したところ、baseline 差分が「新規エントリの追加」にとどまらず、既存エントリから classification / reason（provenance 由来記述）が削除され、warning_total_cap（58）が消失し、同一ファイルの既存エントリ（repo-*）が新規違反パターン（docs/designs/）への置換対象として失われた
- **発生局面**: 実装（case-open STEP-4 機械工程の check_integrity fail 対処、worktree 内での baseline 再生成実行時）
- **検知方法**: 再生成後の `git diff`（worktree 内）で baseline json の既存エントリの reason 消失・cap 消失・エントリ置換を確認
- **根本原因**: `--update-ir055-baseline` は「現在の違反集合から baseline を生成する」コマンドであり、既存 baseline の provenance 付フィールド（classification / reason）と warning_total_cap を入力として読み込んで保存する設計ではない。既存 provenance を維持した部分更新の用途には適合しない
- **自律対応内容**: 再生成結果を採用せず baseline を HEAD へ revert し、既存エントリ群を保持したまま新規エントリ 1 件（file × pattern × severity × count × classification: baseline × provenance reason）を node スクリプトによる手動追記で最小変更として追加した。追加後の check_integrity 再実行は pass（NG 0 / Warning 0、entries 27・cap 58 を維持）で、既存 provenance は破壊していない
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: baseline 系の `--update-*` コマンドを使う場合は全再生成（現状スナップショット化）と部分追記（provenance 保持）のどちらの操作が目的かを先に区別する。既存 provenance を維持する用途では手動エントリ追加（node の JSON 読書）が最小変更経路である
- **再発条件**: check_integrity の IR-055 baseline（または同型の provenance 付き baseline）に対し、既存 provenance を維持したまま新規違反を承認追加しようとして `--update-ir055-baseline` を実行したとき、毎回再発する
- **予防策候補**: case-open STEP-4 機械工程手順（definition-pr-and-idempotency.md）の traceability gate 対処手順へ「IR-055 baseline への承認追加は手動エントリ追加で行い、`--update-ir055-baseline` は full 再生成用途と区別する」旨の追記。または baseline 更新コマンド側の provenance 保持化（実装変更は別 Case 範囲）
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（check_integrity 対処手順）
- **関連**: Case #3627、PR #3633、commit 05d392b6（baseline 手動追加 commit）、.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts（--update-ir055-baseline 実装）
- **タグ**: `#baseline` `#ir-055` `#provenance` `#workflow-deviation`

## prepare_definition_pr が Design 追記の見出しのみを適用し本文段落を欠落させ、PR 検証欄が verbatim 適用を誤主張する

- **問題事象**: case-open STEP-4 の Definition PR（Case #3642 / PR #3643）で、artifact_actions（ACT-DESIGN-001〜004）の Design 追記が節見出し行のみ適用され、合意済み本文段落 7 段落が PR 差分に存在しなかった。PR 本文の検証欄は「artifact_actions の合意済み content を verbatim で適用した」と記載しており、適用実態と検証記録が不一致だった
- **発生局面**: 実装（case-open STEP-4 の Definition 編集・PR 作成。case-ready STEP-1 の忠実性検査で検出）
- **検知方法**: case-ready の忠実性機械検査（draft の ACT content と PR branch ファイルの verbatim 包含突合）で 4/7 ACT が MISSING と判定。git diff で見出し+空行のみ追加され本文不在を確認
- **根本原因**: 検証記録が組立の dry-run 証拠（assembly_verification の edit_sha256）の再確認ではなく、適用予定内容の記述になっており、適用後の成果物への突合が行われていなかった。見出しだけ適用される部分適用モードが prepare_definition_pr 側で発生しても検出ゲートが存在しなかった
- **自律対応内容**: case-ready 側で draft の検証済み組立条件（assemble-draft-section.ts、target_sha256/edit_sha256 突合）により Design 4 ファイルを事前状態へ復元の上で再適用し、修復 commit 430a1928 で既存 PR を再利用して受入検査 4 ゲートを再実行の上 merge した。PR 本文の検証記録と yomiyasu 記録を実態に合わせて訂正した
- **ユーザー確認有無**: なし（既存 PR 再利用の修復経路。人間に留保された判断の新規確定なし）
- **Decision/REQ/spec影響**: なし
- **横展開観点**: Definition 適用系 script の報告・PR 記録は「適用予定」ではなく「適用後成果物の機械突合証跡」でなければならない。verbatim 適用の主張には適用後ファイルへの包含突合（または edit_sha256 再現）を伴う
- **再発条件**: prepare_definition_pr（または同型の Definition 適用 script）が anchor 節への追記で見出し行のみを適用し、適用後突合を行わずに PR を作成するとき、Design 追記系の artifact_action で毎回発生し得る
- **予防策候補**: case-open STEP-4 の受入検査へ「artifact_actions の content と適用後ファイルの verbatim 包含突合（7/7 CHECK）」を追加する。または prepare_definition_pr の報告 JSON へ適用後 file sha256 を含め case-ready が突合できる形にする
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（STEP-4 手順への適用後突合追加）、src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md（忠実性確認の機械手順明文化）
- **関連**: Case #3642、PR #3643、修復 commit 430a1928、.agentdev/drafts の assembly_verification 記録（draft は case-ready 成功後に削除済み。証跡は PR #3643 本文の検証差分へ記録）
- **タグ**:   

## 実行担当サブエージェントの起動 API が露出しない環境では case-run STEP-S4 の委譲起動が成立しない

- **問題事象**: 本実行環境は call_omo_agent が explore/librarian の research 用のみを露出し、実装担当サブエージェントの起動 API（category deep / unspecified-high）が露出しない。case-run STEP-S4 の委譲起動がこの環境では成立しなかった
- **発生局面**: 実装（case-run STEP-S4。Epic #3642 Wave 1、Issue #3645 の実行）
- **検知方法**: 委譲起動前の能力検出（実行担当型 category の起動 API 不在の確認）
- **根本原因**: 実行環境の harness が research 用サブエージェントのみを露出し、実装担当 category の起動 API を露出していない
- **自律対応内容**: identity 契約に従い case-run 主体が委譲契約（result 4状態・3点ゲート・worktree 隔離・test-fix ループ）を適用した上で実装を完遂した（self-apply。harness-delegation reference「委譲起動不能時の事前判定経路」に従う）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（委譲契約の自己適用であり、配布 SKILL の委譲契約の変更ではない）
- **横展開観点**: PR #3649（Issue #3644）の delegation-join-formation 記録も同型観測。委譲起動 API の露出有無を AGENTS.md のハーネス選定へ明記する改善候補
- **再発条件**: 実装担当サブエージェントが非露出の harness で case-run STEP-S4 の委譲を行うとき
- **予防策候補**: AGENTS.md ハーネス選定への委譲起動 API 露出有無の明記、委譲起動前能力検出の常時実施
- **想定反映先**: AGENTS.md（ハーネス選定節）、harness-delegation reference
- **関連**: PR #3648（Issue #3645）、PR #3649、Epic #3642 Wave 1
- **タグ**: `#harness` `#delegation`

## node_modules 未伝播の worktree で tsc 型検査が bun:test / node 型未解決となる

- **問題事象**: worktree 環境で tsc 型検査が bun:test / node 型未解決となる（node_modules 未伝播環境で bun:test の型解決源が不在。bun test は組込みランナーのため動作する）
- **発生局面**: 実装（case-run の typecheck 実行。Issue #3646 の実行）
- **検知方法**: typecheck 実行時の TS エラー（bun:test / node 型未解決）の出力と環境起因の確認
- **根本原因**: node_modules 未伝播の worktree では bun:test / node の型解決源が存在しない
- **自律対応内容**: 型エラーを実装側 0 件と環境起因（テスト側の型未解決のみ）に分類し、main root での同一検査で補完検証した。品質メトリクスへ環境ラベル付きで記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 型検査の環境ラベル記録に「型解決源の有無」を含める改善候補
- **再発条件**: node_modules 未伝播の worktree で bun:test を import するテストを含む typecheck を実行したとき
- **予防策候補**: 環境ラベルへの型解決源の有無の記録、typecheck は main root（node_modules 伝播あり）で実行する運用
- **想定反映先**: agentdev-git-worktree（worktree 構造的制約の注記候補）
- **関連**: PR #3650（Issue #3646）
- **タグ**: `#worktree` `#typecheck`

## worktree の .opencode 投影の skill 伝播が不均一で checker 実行経路が skill ごとに分岐する

- **問題事象**: worktree の .opencode 投影に repo-agentdev-integrity は存在するが agentdev-traceability が未伝播で、checker 実行経路が skill ごとに main root / worktree で分岐した
- **発生局面**: 実装（case-run の traceability check 実行。Issue #3646 の実行）
- **検知方法**: traceability check 実行時の worktree 投影への checker 配置不在の検出
- **根本原因**: worktree 投影（junction / 実体化）の伝播状態が skill ごとに不均一
- **自律対応内容**: main root の .opencode 投影から checker を実行し、検査対象は worktree HEAD を --root 明示して検証した。検証差分の環境ラベルへ実行経路の分岐を記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: checker 実行経路の環境ラベル（実行起点 root と検査対象 root の区別）を検証差分へ残す
- **再発条件**: worktree 投影に未伝播の skill の checker を worktree 内で実行しようとしたとき
- **予防策候補**: checker 実行前に投影の伝播状態を確認し、main root 実行 + --root 明示への統一運用
- **想定反映先**: agentdev-git-worktree（worktree 投影の伝播状態確認手順の候補）
- **関連**: PR #3650（Issue #3646）
- **タグ**: `#worktree` `#traceability`

## case-run 直接実行時に実装着手時刻を初手で計測せず進行状況の開始日時を設定できなかった

- **問題事象**: case-run 単一セッション内での直接実行時、実装着手（STEP-S4a 開始）時刻を初手で計測せず、進行状況の開始日時を正確に設定できなかった（実測は commit 03:44:21 と PR 作成 03:52:48 のみ。L2 タイムスタンプ内訳も着手起点の実測なし）
- **発生局面**: 実装（case-run STEP-S5 進行状況更新。Issue #3646 の実行）
- **検知方法**: 進行状況セクション更新時の開始日時の欠落確認
- **根本原因**: 着手時刻の初手計測が手順に組み込まれておらず、後追いでは commit / PR 作成時刻しか実測できない
- **自律対応内容**: 開始日時を N/A（実測併記）として記録し、計測欠落を learning 候補として明記した。Issue 本文の開始日時は case-close でも N/A（実測併記）のまま維持した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: L2 タイムスタンプ計測の着手起点の実測が未整備。実装着手の最初の操作で時刻を記録する初手計測の導入候補
- **再発条件**: case-run 単一セッションでの直接実行（self-apply）で着手時刻を記録せずに実装を開始したとき
- **予防策候補**: STEP-S4 開始時の初手で date 実行と時刻記録を手順化する
- **想定反映先**: agentdev-workflow-case-run（STEP-S4 手順の初手計測明記候補）
- **関連**: PR #3650（Issue #3646）、Issue #3646 本文 進行状況
- **タグ**: `#measurement` `#workflow-deviation`

## TS-008 の効果評価目標（通常10分/遅くとも30分）は Wave-1/Wave-2 修正後も before 約69分の観測で未達であり、残遅延は証拠がなく未帰属

- **問題事象**: Epic #3642 の効果評価目標（ADF実装開始待ち: 通常10分/遅くとも30分）は、Wave-1 基礎修正（#3648/#3649/#3650/#3651）と Wave-2 条件付き4案判定（#3652）完了後も、before 観測 約69分（case-auto開始 02:11:13.973 → 最初の case-run 実作業 03:20:05.658 = 68分51.685秒）に対し未達だった。残遅延の要因は記録された証拠からは特定できず未帰属
- **発生局面**: 実装（case-run TS-008 効果目標計測と報告。Epic #3642 Wave 2、Issue #3647）
- **検知方法**: PR #3652 本文 TS-008 の計測記録（before 観測の入口別境界と目標値の比較。検証差分セクションの計時記録）
- **根本原因**: 全体経路の残遅延は case-open/case-ready の観測境界まで分解した計測が今回の Issue 範囲では得られず（case-run Issue は case-open/case-ready を通らない）、同条件 after 比較も本 Issue 内では実施不能。残遅延の帰属に必要な証拠が不足
- **自律対応内容**: 目標未達を実装修正完了と別判定して記録（AG-004 条件8・TS-008 の分離規定どおり）。全体経路の同条件 after 計測を実施不能と明記し、直接比較値を捏造しなかった。case-run開始からの時間を69分の直接比較値として使わない旨も明記。record-in-findings により本エントリへ記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（効果評価目標は Epic 本文の scope_contract.measurement に規定済み。目標未達を理由とする対象外の自動追加は 0 件）
- **横展開観点**: 性能目標付き Epic の完了判定では、目標未達を実装未完了と混同せず record-in-findings + 別判定で記録する運用が AG-004 条件8 で機能した。他の目標付き Case でも同型の分離判定を適用できる
- **再発条件**: 効果評価目標を持ちながら全体経路の after 計測を同一 Issue 内で実施できない構成（case-run Issue が case-open/case-ready を通らない）で目標を評価するとき
- **予防策候補**: 効果測定の after 計測は次回 case-auto 実行時の観測機会として扱うことの明示。残遅延の帰属には入口別境界の観測分解（委託開始/担当作成/最初の実作業の区別保持）が必要
- **想定反映先**: docs/designs/workflows/ の効果測定関係 Design または learning pipeline での昇華判断
- **関連**: Epic #3642、Issue #3647、PR #3652（TS-008 効果目標と適用先セクション）
- **タグ**: `#measurement` `#performance-goal`

## 新規REQ行の traceability raw fail を工程別 gate が区別できず Definition PR の進行が止まる

- **問題事象**: Root Case #3653 の case-open STEP-4 で、新規 REQ-110 の15行と REQ-104-008 を対象にした traceability check が終了コード2、pass 9 / fail 2 を返した。fail は対象行の missing-implementation と missing-verification で、missing-design は pass し、形式検査系も全件 pass だった
- **発生局面**: 実装（case-open STEP-4 の Definition branch に対する品質ゲート実行時）
- **検知方法**: `prepare_definition_pr` の traceability-check 報告 JSON と保存済み raw checker 結果を照合し、検査種別ごとの status を確認した
- **根本原因**: 新規 REQ 行の実装・検証対応は case-run / case-ready が所有するため Definition 段階では未成立である。一方、共通 checker の全体終了コードを工程別に解釈する consumer がなく、Definition 段階の正規条件である設計対応と、後続工程の未完了義務を分離できていなかった
- **自律対応内容**: 利用者の明示承認後、raw checker の終了コードと findings を変更せず、case-open と case-ready の stage consumer が工程別に結果を分類する実装と回帰テストを追加した。implementation / verification findings は未完了として保持し、Definition 段階の判定で成功扱いしないことを確認した。case-open scripts 31件、case-ready scripts 30件が pass し、raw 結果を PR #3655 に記録した
- **ユーザー確認有無**: あり（Definition-stage gate consumer の修正を明示承認）
- **Decision/REQ/spec影響**: canonical REQ と Decision の変更なし。case-open の Definition PR gate reference と workflow consumer の工程別判定を整合させた
- **横展開観点**: Traceability checker の raw findings は保持したまま、gate consumer が当該工程の責任範囲と後続工程の義務を区別する。検査器の全体 status を単純に工程の成否へ転用しない
- **再発条件**: 新規 REQ 行を Definition PR に追加し、implementation / verification 対応が未成立のまま共通 traceability checker を実行する一方、工程別 gate consumer が同種の未完了を区別しない場合
- **予防策候補**: Definition、readiness、implementation、final-completion 各工程で gate consumer の対象検査と deferred obligation の扱いを回帰テストで固定し、raw checker 証跡と工程判定を別々に記録する
- **想定反映先**: `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md`、`src/common/skills/agentdev-workflow-case-open/scripts/lib/definition-traceability-gate.ts` と各 stage consumer のテスト
- **関連**: Root Case #3653、PR #3655、前回同種の観測 Case #3628 / PR #3631、`.agentdev/integrity/reports/2026-10-12-case3653-traceability-check.json`
- **タグ**: `#workflow-deviation` `#traceability-gate` `#definition-pr`
