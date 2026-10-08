# 評価レポート

## メタデータ
- **実行日時**: 2026-10-08 12:40（backlog-auto stage 2 learning 系統として実行）
- **対象エントリ数**: 38件（inbox: 38件, deferred: 160件〔インデックススキャン 164 見出し - 構造ヘッダー4。照合候補約45件本文確認〕）
- **問題クラス数**: 30 判定単位（クラス7 + 単独23）= 38 エントリ。duplicate 0・reject 0。adversarial-review（STEP-4）による C2 分割（entry 2→U22 deferred・entry 3→U23 promote）と U13 処分変更（promote→deferred）を反映済み

## 実行概要

- 正規化: inbox 38エントリは全て新13フィールド形式（正規化対象なし）。見出し日付なしは capture 側起因の逸脱（前回と同様）。書式注意: エントリ35/36間の `---` 区切り欠落（L634-636）→ 移動処理は13フィールド見出しベースで境界判定
- 分析体制: STEP-1〜3 の読取・照合を deep 委譲（読取専用・正規文書の実測 grep/ls による fix gap 確認含む）、親が主要クレーム5件を再検証（definition-pr-and-idempotency.md:29・worktree-operations.md:150-163/175-200・workflow_body_contract.test.ts timeout 0件・REQ-021-029・並行 intake 3ファイルの実在）
- Jev 先行評価: 2件実施（disposal-determination〔境界8単位〕、sublimation-possibility〔promote予定14単位〕）
- Jev 観測: 20261008T033615Z-0da7（廃棄判定・confidence 0.5）/ 20261008T033744Z-3004（昇華可能性）— ともに observation_write 済み
- 最終処分: **promote 9単位/13エントリ（全て区分5 既存対策の更新）+ deferred 21単位/25エントリ**（adversarial-review 後の確定値。review 前は promote 9〔U13 含む〕/deferred 20〔C2 統合〕）
- adversarial-review（STEP-4）: 発動条件判定 true（Jev 観測 20261008T034245Z-b9da・0.96）。2系統独立 review stream（Stream A: 分類・処分妥当性 / Stream B: 証拠適合・成果物化適性）→ counter-challenge → convergence → convergence audit 完了。受理 finding: (1) U13 promote の fix gap 主張が実測で否定（worktree-operations.md L458-478 に prune→node fs.rmSync→消滅確認の順序厳守手順と Filename too long robocopy フォールバックが既存・両 stream が独立に実証）→ U13 deferred へ、(2) C2 の deferred 根拠のうち entry 3（generate_indexes 計測日）は未カバー（L29 の工程順序契約は check_integrity/traceability-check のみ commit 後へ移動し generate_indexes は commit 前配置のまま・計測日再 commit 収束規律は未反映・docs/knowledge にも該当なし）→ entry 3 を U23 として promote へ分割、entry 2 は U22 として deferred 維持。結論維持の根拠修正: U20（根拠を「entry 自身が適用済みの既存是正経路〔frontmatter のみ是正 commit の content-change 除外〕+実害軽微」へ）、U15（deferred L1502/L1522/L1540 を特定参照）、U9（root-case-and-definition-package.md 手順 1.5(5)/4.6 + deferred L2506 へ参照修正）、C5（cite を L167/L202 へ修正）。文言修正: Jev 分岐数、U1 反映時の既存 Step 1-3 構成との改訂範囲明記、C8 反映先へ v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節（正規所有者）追加、U19 反映先を requirement-development.md STEP-4 節へ正確化・「33 行」→「33 件（重複計上含む）」、RA-009 は Case #3507 の Resolution Action 注記、C6/C8 の templates 反映は単一編集バッチへ統合
- Jev との最終判断分岐（計7件・全て semantic_disagreement として観測反映済み。観測レコード単位: 0da7 に4件・3004 に3件）:
  - C2/C3/C5: Jev は promote 側（0.75/0.69/0.60）→ deferred 維持。理由: 既存規定の実測確認済み（工程順序契約・環境ラベル規律・--root 実行手順）、並行 intake 経路の実在（case-3533/3536）、前回昇華済み同主題知識（junction 環境差・IR-072 再実測）を重く評価。ただし C2 は adversarial-review で分割され、entry 3 は Jev 判定（promote）と同一の U23 promote となった（review による是正が Jev 分岐の解消方向）
  - U14: Jev 廃棄判定は promote（0.79）だが昇華可能性は false（0.71）→ 昇華可能性評価を優先し deferred に確定（回避確立済み・script 契約の進化待ち）
  - C6/C8: Jev 昇華可能性 false（0.53/0.51・境界値）→ promote 維持。理由: fix gap の実測確認と 2 Case 実害を重く評価
  - U2: Jev 昇華可能性 false（0.73）→ promote 維持。理由: deferred L2466（update 適用の解釈規則は再発時に再評価）の再評価条件発火ケースであり、重複ではなく保留知見の昇華完結
  - C4/U3/U20/U21: Jev 昇華可能性 false（0.73/0.67/0.65/0.83）→ 受理し deferred に確定（既存規律〔由来3分類+対照実行、確認記録要求、AUTOGEN dry-run 差分検出、docs-check 正規形〕との重複寄り）

## 処分判定基準

8軸合計は参考値であり、質的基準との複合で判定した。(a) 実害未観測の設計観測、実装済み・既存文書カバー済み、並行 intake/RU 経路との重複管理 → deferred 優先。(b) fix gap 保有で予防策が正規反映先への明示補足に帰着する → promote。Jev 先行評価の確率分布は境界単位の裁定材料とし、実測確認済みの fix gap・既存カバーを上書きしない。

## promote 単位（9単位/13エントリ・全て区分5 既存対策の更新）

### U1: 複数ファイル一括機械処理の原子書込順序 — 29/40
- **エントリ**: 複数ファイル一括機械処理は全検証をメモリ完結後に一括原子書込する（部分書込後の検証 throw で中間状態が残存）[inbox]（backlog-auto 2026-10-06、commit f549e506）
- **8軸**: 発生1/影響5（30エントリ消失の中間状態）/横展4/反映先4/自動化4/再利用4/再発3/費対4
- **処分理由**: fix gap 実測（deferred-atomic-move-procedure.md に「メモリ完結→全検証→一括原子書込」の機械実行時実装構成規律の記載なし・既存の書込順序規律〔Step 2 失敗時は inbox 変更せず・Step 3 は Step 2 成功時のみ〕とは別物・grep 実測）、実害観測（git 復元で回復）
- **反映先**: agentdev-learning-pipeline/references/deferred-atomic-move-procedure.md（機械実行時の実装規律。既存 Step 1-3〔追記→検証→クリア〕構成と「メモリ完結→一括書込」構成の関係〔改訂か併記か〕を成果物で明示すること・review 指摘反映）+ 横断の一括機械変更 write 規律
- **既存対策照合**: deferred L3132（PowerShell 回避 write 規律）・L2715（置換後全実行）は補完関係で本件未カバー
- **昇華可能性**: true（Jev 0.73 同意）

### C1: traceabilityGate exit code 判定粒度 — 28/40（エントリ2件）
- **エントリ**: traceability check の exit code は 9 種検査全体の合否であり case-open の missing-design 0 件ゲートと意味が一致しない [inbox]（Case #3507）; prepare_definition_pr.ts の traceability-check ゲートが case-run/case-ready 段階の未充足を含む fail 数で exit 2 [inbox]（Case #3525）
- **8軸**: 発生2/影響3/横展3/反映先4/自動化4/再利用3/再発5（新規 REQ 行 Definition PR で毎回再発・PR #3350 先行例）/費対4
- **処分理由**: fix gap 実測（prepare_definition_pr.ts L409-419 で exitCode!==0 一律 fail の現行実装確認・missing-design status 判定への限定は未実装）
- **反映先**: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts + case-open Design「機械工程の script 呼び出し契約」節
- **既存対策照合**: deferred L2045（missing-verification の必然性）は別機構
- **昇華可能性**: true（Jev 0.53 同意）

### C6: close_mechanical_steps.ts 報告 JSON の証跡非保持 — 26/40（エントリ2件）
- **エントリ**: close_mechanical_steps pre-merge の integrityGates 報告は exitCode のみで stdout/stderr 証跡を退避しない [inbox]（Case #3532）; 同・報告 JSON は gate の証跡を保持しないため件数突合系 gate は個別実行+退避で証跡を確保する [inbox]（Case #3536）
- **8軸**: 発生2/影響3/横展3/反映先4/自動化4/再利用3/再発4/費対3
- **処分理由**: fix gap（件数突合系 gate の個別実行+退避の必須項目化は未整備）、2 Case 連続の実害（証跡欠落→由来分類不能→再実行）
- **反映先**: docs/designs/commands/case-close.md 機械工程節 + agentdev-workflow-templates 検証差分記録規約
- **制約（Decision/REQ 候補）**: 報告契約拡張（stdout 退避機能追加）は req-define へ引渡し
- **昇華可能性**: true（Jev false 0.53 と分岐・semantic_disagreement 記録済み）

### C7: bun test 既定 5 秒 timeout の suite 負荷相互作用 flake — 32/40（エントリ2件）
- **エントリ**: bun test 既定 timeout 5 秒の suite 内負荷相互作用 timeout が Wave 1・Wave 2-2 の 2 Case 連続で再現（単独実行は常に pass） [inbox]（Case #3532/#3534）; bun test ③ workflow_body_contract.test.ts はフル suite 実行時に 5 秒 timeout で落ちる flake [inbox]（Case #3537）
- **8軸**: 発生2/影響3（3 回フル再実行コスト）/横展4/反映先5（特定ファイル）/自動化5（一行的修正）/再利用3/再発5（2 Case 連続実証）/費対5
- **処分理由**: fix gap 実測（workflow_body_contract.test.ts に timeout 記述なし・grep 0件・親再検証済み）
- **反映先**: scripts/self/case-intake-cross-inspection/workflow_body_contract.test.ts（明示 timeout 設定）+ agentdev-quality-gates bun test 実行形態契約への注記
- **昇華可能性**: true（Jev 0.57 同意）

### C8: 検証差分記録の様式不足（件数申告・部分列挙） — 28/40（エントリ2件）
- **エントリ**: PR 本文検証差分の textlint hard 件数申告は件数突合の根拠にならない（集合差分での同一性判定が必要） [inbox]（Case #3536）; traceability check の検証差分記録は 9 検査種別の全列挙と summary 突合を要する [inbox]（Case #3536）
- **8軸**: 発生2/影響3/横展4（全 Case の検証差分記録に適用）/反映先4/自動化4/再利用3/再発4/費対4
- **処分理由**: fix gap 実測（agentdev-workflow-templates SKILL.md L148-161 に検証差分セクション規約は存在するが checker 別必須要素〔textlint 集合退避・traceability summary+9種別全列挙〕は未規定）、実害（件数不一致 36 vs 40、corpus 系不計上）
- **反映先**: v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節（検証差分セクションの記録先割当と意味集合の正規所有者・review により追加）+ agentdev-workflow-templates SKILL.md 検証差分セクション規約 + templates/pr_desc.md（C6 の templates 反映と同一編集バッチで統合反映）
- **昇華可能性**: true（Jev false 0.51 と分岐・semantic_disagreement 記録済み）

### U2: update 適用の見出し行扱い — 25/40
- **エントリ**: update 系 artifact_actions の content 適用が見出し行を置換範囲に含めないと「**USE FOR**:」見出しが重複する [inbox]（Case #3530 Wave 1）
- **8軸**: 発生1/影響3/横展3/反映先4/自動化4/再利用3/再発3/費対4
- **処分理由**: fix gap 実測（artifact-contracts.md は append の target_area/anchor 契約中心で update 適用時の見出し行を含む置換範囲解釈と適用後重複見出し検査は未規定）。deferred L2466（update 適用の解釈規則は再発時に再評価）の再評価条件発火
- **反映先**: docs/designs/responsibilities/artifact-contracts.md（update 適用の解釈規則）+ agentdev-design-file-manager
- **昇華可能性**: true（Jev false 0.73 と分岐・semantic_disagreement 記録済み）

### U5: STEP-7 3 連鎖ミスの前置確認 — 27/40
- **エントリ**: STEP-7 で draft 喪失・削除パス誤り・capture commit への削除ステージ混入の 3 連鎖ミスを発生させ回復した [inbox]（Case #3530 Wave 1）
- **8軸**: 発生1/影響4（draft 喪失・commit 混入）/横展4（git 運用汎用）/反映先4/自動化3/再利用4/再発3/費対4
- **処分理由**: fix gap 実測（readiness-and-cleanup.md L50-53 に Form Zero 規定はあるが git rm 失敗時のステージ汚染確認前置・reset --hard 前の tracked/untracked 確認は未記載）
- **反映先**: agentdev-workflow-case-ready/references/readiness-and-cleanup.md + agentdev-git-worktree/references/worktree-operations.md
- **昇華可能性**: true（Jev 0.51 同意）

### U19: REQ 新設の検証スコープ 3 段確認手順 — 28/40
- **エントリ**: verification.optional 登録を伴う REQ 新設は検証スコープ判断の記録と policy 登録と恒常手段実体確認を同一変更で行う [inbox]（Case #3530 Wave 2-3）
- **8軸**: 発生1/影響4（33 件〔missing-implementation 14 + missing-verification 19・重複計上含む〕の後置解消。C1 影響3 を上回る根拠は Wave 3 まで残存した規模）/横展4/反映先4/自動化3/再利用4/再発4/費対4
- **処分理由**: 既存 REQ-021-029（policy.yaml 登録判断の要件展開包含）は適用漏れだったが、Wave 3 で実施した 3 段確認手順（要件行命題→実装実体所在→検証手段）の規律化は未規定であり、適用漏れ再発防止の手順明示として補足に帰着（Jev 廃棄判定 promote 0.64・昇華可能性 true 0.65 と一致）
- **反映先**: src/common/skills/agentdev-workflow-req-define/references/requirement-development.md STEP-4 要件展開節（「検証スコープ判断節」という独立節は現行なし・review により正確化）
- **昇華可能性**: true（Jev 0.65 同意）

### U23: generate_indexes 計測日の再 commit 収束規律（旧 C2-entry3・review により promote へ分割） — 26/40
- **エントリ**: generate_indexes の req-metrics 計測日は計測対象ファイルの commit author date から導出されるため commit 前実行では 1 日遅れの値を出力する [inbox]（Case #3507）
- **8軸**: 発生1/影響3/横展4/反映先4/自動化3/再利用3/再発3/費対4（旧 C2 クラス値を引き継ぎ）
- **処分理由**: adversarial-review で実証: definition-pr-and-idempotency.md:29 の工程順序契約は check_integrity/traceability-check のみを commit 後へ移動し、generate_indexes は「REQ 行編集、generate_indexes、stage・commit」順で commit 前配置のまま（再発条件が未解消）。計測日 1 日遅れを再 commit で収束させる運用の一文規律は工程文書へ未反映（entry 3 自身が予防策候補と明記・実測確認済み）。docs/knowledge/ にも該当知識なし。fix gap 保有で一文の明示補足に帰着
- **反映先**: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（generate_indexes 派生物の計測日収束〔同一 PR 内再 commit〕の一文）
- **既存対策照合**: deferred L1211（AUTOGEN 計測日の日付境界発火）は近接既存。L29 は check_integrity/traceability-check のみ対象
- **昇華可能性**: true（review による分割後の新単位。Jev 廃棄判定〔旧 C2〕promote 0.75 と同方向）

## deferred 単位（21単位/25エントリ）

| 単位 | エントリ | 8軸 | 主な根拠（既存カバー・実測確認済み） |
|---|---|---|---|
| U22 | 2 | 26/40 | definition-pr-and-idempotency.md:29 が Case #3507 RA-009（後段2検査を stage-and-commit 後へ移動）の工程順序契約を反映済み（review 実測確認。旧 C2 の entry 2 側） |
| C3 | 12, 15, 16 | 25/40 | worktree-operations.md:178 環境ラベル+由来3分類（対照実行は L179）・docs/knowledge/worktree-environment-fail-classification.md 実在・deferred L2526/L2624 zero-targets 知見。残りは記録様式細則 |
| C4 | 20, 24 | 27/40 | L178 の対照実行・由来3分類規律が本質をカバー（Jev 昇華可能性 false 0.73 受理）。prh 恒久対処は並行 intake（case-3536）へ委ね済み |
| C5 | 25, 36 | 27/40 | worktree-operations.md:177/199・qg-4:332/451 が規定済み・並行 intake（case-3533）実在（Jev promote 0.60 と分岐し deferred 維持） |
| U3 | 6 | 26/40 | root-case-and-definition-package.md L57+L108 に事前確認と確認記録要求が既存（Jev 昇華可能性 false 0.67 受理、残りは記録場所明示のみ） |
| U4 | 7 | 15/40 | execution-structure 契約自体が作成前実行を要求（遵守漏れ・実害未観測） |
| U6 | 9 | 15/40 | 既存の起動位置規律の適用事例（entry 自身が明記） |
| U7 | 10 | 20/40 | worktree-operations.md L168-175 に整備手段の選択基準が既存（bun install 唯一の確定手段と明記済み） |
| U8 | 11 | 18/40 | 既存の安定実行経路契約の適用・ENOENT 即検知 |
| U9 | 13 | 19/40 | 前回昇華済み C1（inline×sidecar 集合一致）の適用事例・deferred L2506 が sidecar 単一情報源化を保持 |
| U10 | 14 | 18/40 | 既存の実行形態契約の適用・root 再実行で即解消 |
| U11 | 18 | 28/40 | worktree-operations.md:150-163 が node fs.symlinkSync 正規手段を手順例つき規定・処理系差注意も既存（Jev deferred 0.57 同意）。残りは git-bash mklink サイレント失敗モードの追記のみ |
| U12 | 19 | 14/40 | 実害未観測（既出 14 件・新規 0）・entry 自身が別案件候補と明記 |
| U14 | 22 | 22/40 | 回避経路確立済み・実害小。Jev 昇華可能性 false 0.71 を受理（script 契約の create 系対応が変わるタイミングで再評価） |
| U15 | 23 | 22/40 | REQ-100/101/102 と同型の慣行（entry 自身が明記）・実害は作業分量のみ・宣言系 deferred 知識3件（L1502 網羅性・L1522 ADF-COVERS 配置・L1540 implementation 宣言確認）（Jev deferred 0.84 同意） |
| U16 | 29 | 21/40 | 並行 intake（case-3535 pin-regex）実在・修正自体は intake 済み |
| U17 | 30 | 14/40 | .agentdev/README.md jev-observations 行に既記載（既知振る舞い・実害なし） |
| U18 | 33 | 20/40 | 実害軽微（追随 commit 分離 1 回）・運用回避確立・checker 契約変更は req-define 別判断（Jev deferred 0.89 同意） |
| U20 | 37 | 26/40 | entry 自身が既存是正経路（frontmatter のみの是正 commit が ir072IsFrontmatterOnlyCommit で content-change 除外される機械的是正）を適用済み・実害軽微（Jev 昇華可能性 false 0.65 受理。review により根拠を L140/L143・REQ-061-046・前回昇華済み C2 の3本立てから差替え — いずれも merge 後の author date 保持とは直結しない） |
| U13 | 21 | 28/40 | 【review により promote→deferred】worktree-operations.md L458-478 に prune→node fs.rmSync→消滅確認の順序厳守手順と Filename too long robocopy フォールバックが既存（両 stream 実測）。deferred L2891 知見も同節へ反映済み。本エントリは既存規定の適用事例 |
| U21 | 38 | 28/40 | docs-check 正規形（--dry-run なし本実行）が既存（Jev 昇華可能性 false 0.83 受理） |

## duplicate 判定

deferred.md 160 エントリとの照合で再発観測追記を要する duplicate は 0 件。近接候補の除外根拠: C7↔L3012（別機構: timeout vs 前提アサーション）、U13↔L2891（補完関係・promote 側へ統合記載）、U11↔L1560（作成系 vs 削除系）、C2↔L2064（工程順序 vs 対象漏れ）。前回昇華済み知識への再発（U9）は duplicate 区分の照合対象が deferred.md であるため deferred で処理。

## 自律確定記録（STEP-5）

- **自律確定範囲**: 全 30 判定単位（adversarial-review 後の確定値）。処分は正規契約（処分の質的基準、REQ-021-029 等）からの導出と委譲された裁量の範囲で確定した。主要な境界 8 単位は Jev 先行評価（観測 20261008T033615Z-0da7）を経て確定し、adversarial-review（2 stream 独立検証・convergence audit 完了・unresolved なし）による是正（U13 deferred 化・C2 分割）を反映
- **HITL 不要理由**: (1) promote 9 単位（U1, C1, C6, C7, C8, U2, U5, U19, U23）はいずれも fix gap の実測確認（正規文書への grep/ls・review stream による再検証含む）と既存対策照合を経ており、区分5（既存対策の更新）への帰属が正規基準から導出可能。(2) deferred 21 単位は既存規定・並行 intake 経路・前回昇華済み知識との重複が実測確認済み（review による根拠修正反映）。(3) 破壊的変更（inbox 強制クリア・大量削除）なし・prune は通常対象（staged/duplicate）のみ。(4) Jev との分岐 7 件は全て差異理由を observation_write で記録済み
- **証跡**: 本 evaluation-report + Jev 観測 3件（0da7/3004/b9da・observation_write 済み）+ 2 review stream の所見（counter-challenge・convergence audit 完了）+ promoted/ 成果物（STEP-6 生成）
