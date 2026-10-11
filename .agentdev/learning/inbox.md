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
