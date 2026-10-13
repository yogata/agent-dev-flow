# 評価レポート

## メタデータ
- **実行日時**: 2026-10-13（backlog-auto stage 2 learning 系統として実行。4 回目・再開実行）
- **対象エントリ数**: 20 件（inbox: 20 件〔実行指示は 19 件だが durable state の実ファイルが SSoT で 20 件。実ファイルに従う〕, deferred: 210 エントリ〔grep 見出し 214 - 構造ヘッダー 4〕）
- **判定結果**: promote 3 単位/3 エントリ（全て区分 5 既存対策の更新）+ deferred 12 単位/17 エントリ。reject 0・duplicate 0
- **再開起点**: promoted/ 空・inbox 20 エントリ残存・promoted 実績なしのため再開プロトコルどおり STEP-1 から再実施。旧 evaluation-report（2026-10-11 実行分の 39 エントリ）は承認証跡ではないため本実行で上書き
- **分析体制**: 全 20 エントリの読取・問題クラス分類・8軸評価・既存対策照合（正規文書への grep 実測 8 件）を親が直接実施（委譲なし）
- **Jev 先行評価**: 採用（evaluate 6 回・observation_write 5 回。逐次経路どおり Jev 結果と確率分布を情報として LLM 推論し最終判断を観測へ反映。差異は differenceReason 付きで記録。Jev 返却値の scale 外値 1 件〔ka3-impact=0〕は evaluation_input_defect として scale 内へ是正）
- **STEP-4 adversarial-review**: 発動条件判定を本 report 反映後に実施（結果は「STEP-4」節）
- **HITL**: 0 件（全 20 エントリ自律確定。詳細は「自律確定記録」節）

## 処分判定基準

8軸合計は参考値であり、質的基準との複合で判定した。(a) 実害未観測の観測記録、適用済み・既存文書（docs/knowledge 含む）で対策規定済み、fail-closed 防御機構の作動事例、成果物の自足性が低い軽微補足 → deferred 優先。(b) fix gap 保有（既存対策の陳腐化・不備・適用漏れが正規文書への grep 実測で確認された）で予防策が正規反映先への明示補足・是正候補に帰着し、実害観測がある → promote。deferred プール内に同主題先行エントリがある場合、duplicate 区分ではなく既存エントリの再発観測として deferred で処理し、新エントリ側の処分判定に再発関係を記録する（既存エントリ本文は原子的移動中に編集しない）。

## 20 エントリ評価表

8軸表記: 発生/影響/横展/反映先/自動化/再利用/再発/費対 = 合計/40。（P 統合）はクラス値を代表エントリに記載し統合先単位に帰属することを示す。

| # | エントリ概要 | 単位 | 8軸 | 処分 | 根拠（1 行） | deferred/duplicate 照合 |
|---|---|---|---|---|---|---|
| 1 | issue_create で role:case に kind 渡し拒否（Root Case #3623） | u1 | 1/1/2/3/3/2/2/3 = 17 | deferred | Tool fail-fast が作動し即解消・issue-operation-safety.md L61 に role/kind 論理軸の使用規律あり | なし |
| 2 | 冪等検索 search トークンに topic_slug 単独使用で検出不能（Root Case #3625） | u2 | 1/1/2/3/2/3/2/3 = 17 | deferred | STEP-5 冪等再確認で回収・実害未発生・選択性指針への補足は軽微 | deferred 同主題近接（search index 遅延・別観点） |
| 3 | 配布 reference 追記に docs/designs/ 具参照で IR-055 delta（PR #3630） | （KA2 統合）22 | deferred | IR-055 検出器が fail-closed で検出・即修正済み・転記時規律は恒久文書に不在（grep 0 実測）だが防御は機能中 | deferred に配布境界系多数 |
| 4 | shared_areas に req-row-mentions 使用で未登録需要警告（Root Case #3629） | u3 | 1/1/2/3/3/3/2/3 = 18 | deferred | gate 影響なし・意味レビューで完了・kind 対応表欠落は軽微改善 | なし |
| 5 | 新規 REQ 行設計PRで traceability gate が構造的 fail（Case #3628） | （KA1 統合）25 | deferred | definition-pr-and-idempotency.md L47-54 に工程別 gate 判定仕様が規定済み・gate consumer 実装済み（#3653）で解消済み | エントリ 13 と同一問題の 1 事例目 |
| 6 | --update-ir055-baseline が provenance・cap 破壊（PR #3633） | u4 | 1/1/2/3/3/2/3/3 = 18 | deferred | revert 復旧・単発・実害一時的（検知・回復可能） | deferred に baseline 系多数 |
| 7 | prepare_definition_pr が見出しのみ適用し本文欠落・verbatim 誤主張（Case #3642 / PR #3643） | u5 | （P1）19/40 | promote P1 | L78 の意味レビュー規定のみで適用後成果物への突合手順なし（grep 実測）・実害（PR 差分本文不在・検証記録不一致・修復 1 回） | なし |
| 8 | 実装担当サブエージェント起動 API 非露出で委譲不成立（Issue #3645） | u6 | 1/2/2/3/3/3/3/3 = 20 | deferred | deferred L421（ADR-0127 フォールバック連続発動・2026-07-06 移動分）の同型先行の再発観測 | deferred 同主題先行（L421）の再発 |
| 9 | node_modules 未伝播 worktree で tsc 型未解決（Issue #3646） | （KA3 統合）21 | deferred | worktree-operations.md L108-174 に依存整備前提・tsc 型解決前提の詳細規定済み（grep 実測） | deferred L1297 近接 |
| 10 | worktree .opencode 投影 skill 伝播不均一で checker 経路分岐（Issue #3646） | （KA3 統合） | deferred | definition-pr-and-idempotency.md L58-64 に junction 伝播確認・main root 実行手順規定済み | deferred L3945 近接 |
| 11 | case-run 直接実行時に着手時刻を初手計測せず（Issue #3646） | （KA5 統合）19 | deferred | case-run SKILL.md L116-117 に開始日時初回設定規定あり（大部分カバー）・self-apply 初手手順の欠落は軽微補足・成果物自足性低 | なし |
| 12 | TS-008 効果評価目標未達・残遅延未帰属（Issue #3647） | （KA5 統合） | deferred | after 計測の構造的不可能性は Design 改善候補で現時点では具体性不足・実害は記録欠落のみ | なし |
| 13 | 新規 REQ 行 traceability raw fail を工程別 gate が区別できず進行停止（Case #3653 / PR #3655） | （KA1 統合） | deferred | gate consumer 実装追加（ユーザー明示承認）で解消済み・reference 規定済み | エントリ 5 と同一問題の 2 事例目 |
| 14 | cleanup script が trim 後先頭列判定で staged 誤判定（Root Case #3653） | u7 | （P2）18/40 | promote P2 | accept_definition_checks.ts L583-586 に trim 後 entry[0] 参照の実装バグが現存（実測）・実害（commit 停止 1 回・2 段障害 1 回） | なし |
| 15 | 実領域読戻し突合検証で原状喪失（Wave-1 #3657） | u8 | 1/2/2/3/3/2/2/3 = 18 | deferred | 恒久検証（phase_domain_state.test.ts）追加済み・単発・判断基準（原状保持→検証→復元突合）を含むため prune 禁止系 | なし |
| 16 | bun が Git Bash パス（/c/...）を解決せず ENOENT（Wave-3 #3662） | （KA4 統合）20 | deferred | docs/knowledge/windows-checker-msys-path-argument.md L11 に機構と C:/ 形式推奨を規定済み（grep 実測）・即解消 | deferred L3756/L3798 近接 |
| 17 | traceability check --root . 相対指定で全 REQ 欠落誤判定（Wave-1 #3660） | （KA4 統合） | deferred | 絶対パス推奨は docs/knowledge 規定済み・機構説明の補足は軽微 | deferred L3336 近接 |
| 18 | checker workflow profile 対象外パスの検査漏れ（Wave-1 #3660） | u9 | 1/1/2/3/3/2/2/3 = 17 | deferred | deferred L4176（targeted docs guard は skill 配下 references を計上対象外・2026-10-11 移動分）の同型先行の再発観測・補完検査で対処済み | deferred 同主題先行（L4176）の再発 |
| 19 | case-close 委譲指示に Design 状態評価漏れ・draft のまま Epic クローズ（#3653/#3654 最終 case-close） | u10 | （P3）21/40 | promote P3 | case-auto.md L223-230「委譲指示の構築規律」節に Design 状態評価の必須項目列挙なし（grep 実測）・実害（Design draft 残存で Epic クローズ・回復済み） | なし |
| 20 | 配布物への REQ ID 直記で配布境界 concrete-id 違反（PR #3669） | （KA2 統合） | deferred | check_distribution_boundary concrete-id 検出器が fail-closed で検出・即修正済み（merge commit 5958fe7e 配下違反 0） | エントリ 3 と同一問題の 2 事例目 |

## promote 単位（3 単位/3 エントリ）

| 単位 | 成果物 | エントリ | 8軸 | 反映先（情報候補） |
|---|---|---|---|---|
| P1 | promoted/procedure-case-open-step4-artifact-actions-applied-verification.md | 7 | 19/40 | definition-pr-and-idempotency.md STEP-4 受入検査（適用後突合の追加） |
| P2 | promoted/fix-accept-definition-checks-status-column-parse.md | 14 | 18/40 | accept_definition_checks.ts staged-entries-check の列判定（trim 前の列位置参照への修正候補） |
| P3 | promoted/procedure-case-auto-stage4-case-close-delegation-design-status-review.md | 19 | 21/40 | case-auto Design「委譲指示の構築規律」節（Design 状態評価・README status 列更新の必須項目化） |

## deferred 単位（12 単位/17 エントリ）

評価表の「deferred」17 行のとおり。いずれも deferred.md の living pool で維持し、次回 learning-promote 実行時に再評価する。エントリ 8・18 は deferred プールの同主題先行エントリ（L421・L4176）への再発であり、処分判定に再発関係を記録して移動する（既存エントリ本文は編集しない。統合は次回再評価時）。

## duplicate 判定

deferred プール 210 エントリとの照合（タグ・見出しトークンによる候補選択と候補本文突合。直近 20 エントリ常に候補）で duplicate 0 件。

## Decision 候補除外記録

- **対象 item**: 全 15 単位（KA1〜KA5、u1〜u10）。いずれも Decision 候補から除外
- **除外理由**: 「command仕様」「運用ルール」（技術判断不在）。全単位が作業手順の明文化・実装是正・検証規律の補足であり、アーキテクチャ上の決定・技術選定・設計判断を含まない
- **根拠事実**: promote 3 単位は既存手順・script 実装・Design 節への補足・是正候補であり、技術的トレードオフ判断を含まない。deferred 12 単位も同様に観測記録・作業規律・環境知見である
- **代替反映先候補**: 各単位の「反映先（情報候補）」のとおり（REQ/Design/配布skill reference/配布script）
- **「実害観測」の解釈（review 合意）**: 実害観測は、検知不能または回復不能を含む実質的被害（PR 進行停止・成果物の検証記録不一致・成果物品質問題の顕在化等）を指す。即時検知・回復可能な一時的破壊（baseline revert 復旧等）は本基準の実害観測に含めない（u4 判定の解釈根拠）

## STEP-4 adversarial-review 発動条件判定の記録

- **発動条件判定**: true（evaluation-report.md 反映済み・skip 条件〔inbox 空・1件のみで既存対策との重複が確実〕非該当。Jev 観測 20261013T104513Z-0685 true 0.93、LLM 最終判断と一致。inbox 20 エントリ・deterministic 計数は state として渡し済み）
- **review 実施**: 実施した。外部対論エージェントが非露出の環境のため本実行主体が3役（Orchestrator / Reviewer / Reviewee）を自己適用で実施（inbox エントリ 8 の harness-delegation「委譲起動不能時の事前判定経路」の前例に従う）。review 対象は evaluation-report.md のみ。不可逆処理（inbox → deferred 移動、prune、commit/push）は未実行の状態で実施
- **本質的争点 4 件と合意結果**:
  - 争点A: 8軸低スコア（18〜21/40）単位の promote 妥当性。Reviewer 反証「RU 化コストに見合わない」。Reviewee「判定基準 (b) はスコアではなく fix gap 実測 + 実害観測 + 正規反映先への帰着で判定」。合意: promote 維持。成果物には「実害は解消済み・fix gap は規定欠落のみ」の限定を明記する（accepted F1）
  - 争点B: 対応済みエントリ（KA1・u8）の deferred 維持と living pool 肥大化。合意: deferred 維持を維持しつつ、両単位を次回再評価時の prune 優先候補として記録する（accepted F2）
  - 争点C: 判定基準の「実害観測」解釈（u4 の baseline 破壊を実害に含めるか）。合意: 解釈を「実質的被害（検知・回復不能を含む）」へ限定して基準節へ補記（accepted F3）。u4 は単発性・8軸低スコアを根拠に質的複合判定で deferred 維持
  - 争点D: deferred 同型先行（L421・L4176）への再発の統合時期。合意: 規定どおり再発関係の記録のみで deferred 維持、既存エントリ本文は不変、統合は次回再評価時（accepted F4・変更なし）
- **evaluation-report 戻しループ**: 処分帰属（promote/deferred の割当て）の変更は発生しなかったため STEP-2 戻しループは発動しない。停止条件（新証拠・新前提・異なる failure condition・未評価範囲のいずれも伴わない）を満たし STEP-5 へ進む
- **unresolved**: 0 件
- **accepted findings の反映**: F1 は STEP-6 の promoted 成果物生成時に反映、F2・F3 は本 report へ反映済み（F3 は「処分判定基準」節の補記）、F4 は規定運用の確認のみ

## 自律確定記録（STEP-5）

- **自律確定範囲**: 全 20 エントリ（promote 3・deferred 17）。処分は正規契約（処分の質的基準・区分 5 / 区分 6）からの導出で確定
- **HITL 不要理由**: (1) promote 3 エントリは fix gap の実測確認（definition-pr-and-idempotency.md L78・accept_definition_checks.ts L583-586・case-auto.md L223-230 の grep 実測）と実害観測に基づき、区分 5（既存対策の更新）への帰属が正規基準から導出可能。(2) deferred 17 エントリは既存規定・docs/knowledge カバー（grep 実測 8 件）、fail-closed 防御機構の作動事例、deferred 同型先行の再発観測、軽微補足等の実測根拠を有し、区分 6（deferred）への帰属が正規基準から導出可能。(3) 破壊的変更なし（inbox クリアは手順規定の標準操作〔ヘッダーのみクリア〕であり破壊的変更に該当しない。prune は staged 3 エントリのみで証拠は promoted 成果物の「元learning item / 根拠」セクションに保存）。(4) extension 読込: workflow-extension（.agentdev/extensions/skills/agentdev-workflow-learning-promote.yaml）は version/kind/id のみで 5 セクション空配列であり、追加 rules/checks/acceptance_gates/must_not なし。HITL 判断確定原則への extension 上書きなし。(5) ユーザー明示の判断要求・人間判断への引き上げ条件該当項目は検出されなかった
- **次回再評価時の prune 優先候補（accepted F2）**: KA1（エントリ 5・13。対応済み・reference 恒久化済み）、u8（エントリ 15。恒久検証追加済み）。次回 learning-promote の promote 内部分析フェーズ時 prune の判定材料として本記録を用いる
- **証跡**: 本 evaluation-report + promoted 成果物 3 件 + deferred.md 追記 + inbox.md クリア（STEP-6 の永続化成果物が承認証跡）
