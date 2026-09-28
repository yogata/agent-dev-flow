# 評価レポート

## メタデータ

- **実行日時**: 2026-09-28（backlog-auto stage 2 learning 系統）
- **対象エントリ数**: 143件（inbox: 20件〔Cases #3186〜#3231〕、deferred: 120件〔見出し計測〕）
- **正規化適用**: 20件全件が本文13フィールド形式（旧5フィールド 0件、フィールド欠落 0件）。見出しは schema 規定の `## YYYY-MM-DD: タイトル` 形式でなく日付なし形式（前回実行と同様、解析妨害なし）。フィールド名の軽微ゆらぎあり（「ユーザー確認有無」/「ユーザー確認の有無」両形式）
- **deferred.md 読込**: 2フェーズ実施（第1フェーズ＝インデックススキャン120エントリ、第2フェーズ＝候補本文読込39エントリ）。3類型フォールバック該当なし
- **前回実行（2026-09-27）の状況**: promoted/ は空（前回採用済み成果物は backlog-review が RU 化して消費済み）。前回 deferred 判定の単独3・4・6・7・8 は移動日 2026-09-27 で deferred.md 残留を確認
- **Jev 先行評価**: 未実行（委譲分析エージェントが Jev Tool を起動せず従来経由で判定。観測 JSON 生成なし）
- **実行範囲**: STEP-1〜STEP-5（本レポートに STEP-4 review 結果と STEP-5 判定確定を含む）。STEP-6 永続化・STEP-7 報告は orchestration 実行

## 問題クラス一覧

### 問題クラス1: agentdev_gh 操作別・role別入力契約の受理範囲把握不足

- **エントリ**: issue_update へ role 転記で invalid-input（#3189）＋ role: case + kind で invalid-input（#3210）
- **根本原因**: agentdev_gh の受理フィールドは操作・role 別に異なる（role は issue_create/issue_list 専用、kind は role 'tracking' 専用、Case Issue の work_type は物理ラベル表現）が、呼出側が共通引数の転記・「kind=work_type 対応」誤前提で呼出を組んだ契約把握不足
- **再発条件**: issue_create 引数構成の流用、Case Issue を物理ラベル "case" でフィルタする場合
- **予防策**: 操作別 input contract の確認と role/kind/labels 受理対応表の issue 操作知識への追記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（#3189・#3210） |
| 影響度 | 3/5 | invalid-input で fail-closed 即時検出・引数修正で解消（重大化しないが Root Case 初回失敗） |
| 横展開性 | 4/5 | agentdev_gh 依存の全 workflow の Issue 操作 |
| 反映先明確度 | 4/5 | issue-operation-safety.md・agentdev-issue-tracking を特定済み |
| 自動化適性 | 3/5 | 契約は固定・知識追記中心 |
| プロジェクト固有知識再利用性 | 4/5 | Tool 契約と GitHub ラベル運用の接合知識 |
| 再発可能性 | 4/5 | 前回 promote 対象と同根因の再観測実績（#3189）＋新側面（#3210） |
| 費用対効果 | 4/5 | 規則数行の追記で解消 |
| **加重合計** | **28/40** | |

#### STEP-3 処分判定・既存対策照合

- **処分区分**: 既存対策の更新（5）
- **既存対策照合**: あり・fix gap。issue-operation-safety.md L135 に「issue_update は role を受理しない。role/kind/trackingState の新規設定は issue_create 専用」が既存（エントリ1の内容は現行配布物でカバー済み。前回単独1の promote が実装に反映された状態と推定）。未カバーは (a) role: case では kind 不受理、(b) Case Issue の work_type は物理ラベルを labels へ指定、(c) gh 読取補完で `--label case` フィルタは無効（ラベルなし列挙＋タイトル・本文確認）
- **該当 deferred エントリ**: なし（前回の同根因エントリは staged として prune 済み。近縁: 「2026-09-15 case 2805 Epic: body 更新のみの issue_update 後に Issue state が closed へ変化した」は別メカニズム）
- **昇華可能性**: 中〜高（fix gap は明確・数行の規則追記）
- **HITL**: ユーザー判断必要

#### エントリ一覧

1. agentdev_gh issue_update の入力契約は role フィールドを受けない（#3189）
2. agentdev_gh issue_create は role: case で kind を受理しない（kind は tracking 専用）（#3210）

### 問題クラス2: worktree・Windows 環境での integrity checker／bun 起動の環境前提把握不足（実体パス・パス形式・data/ リソース）

- **エントリ**: checker 実体は .opencode/skills/repo-agentdev-integrity/scripts/（#3192）＋ Windows bun は MSYS 形式パスを解決せず（#3191）＋ worktree 側 data/ 欠落で checker は host repo root を cwd に --root 指定（#3191）
- **根本原因**: checker・検証スクリプト起動前に実行環境前提（スクリプト実体の配置と git tracking 状態、bun のパス解決形式、data/ 等依存リソースの伝播状態）を確認せず起動した
- **再発条件**: worktree・Windows+bun 環境で integrity 系 checker・generate_indexes・検証スクリプトを起動する場合
- **予防策**: 起動形の統一（.opencode/skills/repo-agentdev-integrity/scripts/ 実体・host repo root を cwd・`--root` で対象指定・パスは Windows 形式 `C:/...`）＋ worktree の .opencode 状態の前置確認

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 3/5 | inbox 3件（#3191×2・#3192） |
| 影響度 | 3/5 | 初回失敗→切替で解消。誤パス起動は失敗として表面化し静かな破壊はない |
| 横展開性 | 4/5 | worktree 検証は常態・checker 系全般 |
| 反映先明確度 | 4/5 | worktree-operations.md・repo-agentdev-integrity SKILL.md を特定済み |
| 自動化適性 | 3/5 | 手順明記・前置確認中心 |
| プロジェクト固有知識再利用性 | 5/5 | worktree・Windows・bun 環境差の核心知見 |
| 再発可能性 | 4/5 | 委譲指示の前提誤り・bash 用語感覚は反復し得る |
| 費用対効果 | 4/5 | 既存手順への補強のみ |
| **加重合計** | **30/40** | |

#### STEP-3 処分判定・既存対策照合

- **処分区分**: 既存対策の更新（5）
- **既存対策照合**: あり・fix gap。worktree-operations.md「main root 実体 + --root 指定による読取系 checker 実行手順」・repo-agentdev-integrity SKILL.md「worktree 検査実行手順」は既存。ただし (a) worktree-operations.md L173「repo-local 実体は worktree 側に存在しない」はエントリ9の実測（git 追跡の .opencode/skills/repo-agentdev-integrity/ は worktree へ実ディレクトリ checkout される）と不一致、(b) bun 引数への MSYS 形式パス禁止は未記載、(c) worktree 側実体の data/ 一部欠落（untracked 由来）の留意点が未記載
- **該当 deferred エントリ**: なし（近縁3件: 「2026-09-05: 契約テスト2本は main repo untracked 実体」「worktree 内 checker 直接実行は junction 伝播なしで完結した」「2026-09-18: bun run による .ts 直接実行は package.json なし環境で Module not found」）
- **昇華可能性**: 高（問題・根拠・反映先が明確・3観測）
- **HITL**: ユーザー判断必要

#### エントリ一覧

1. integrity checker 系スクリプトの実体は src/opencode/ 配下ではなく .opencode/skills/repo-agentdev-integrity/scripts/（#3192）
2. Windows 環境の bun は MSYS 形式パス（/c/...）を解決せず Module not found となる（#3191）
3. worktree 内の repo-agentdev-integrity は data/ 一部欠落のため checker は host repo root を cwd にして --root で対象 worktree を指定して起動する（#3191）

### 問題クラス3: REQ-094 横断是正系トレーサビリティ対応宣言の情報源分担（sidecar/inline）未整備

- **エントリ**: 対応宣言は「未宣言の artifact のみ」を新規 sidecar に集約し既存宣言持ち artifact は該当情報源へ追加（Wave 2・PR #3226/#3228/#3230）＋ REQ-094 系 implementation 宣言の恒久配置先の設計が未決（Wave 2-2・PR #3229）
- **根本原因**: inline 宣言（producer 側優先）と sidecar の役割分担が、多数の既存文書へ適用事実を宣言する横断是正適用体に対して定義されていない。(a) 既存宣言走査なしの新規 sidecar 一括列挙が duplicate-inconsistencies を生む、(b) 恒久配置先未決のまま PR 本文検証差分を正とする暫定運用が残る
- **再発条件**: 次回横断是正バッチ・新規 Markdown への REQ-094 適用（REQ-094-012）時に宣言方式を決めずに作業する場合
- **予防策**: 対応宣言作成前の既存宣言（sidecar・inline）走査の必須化＋REQ-094 系 implementation 宣言の恒久配置先の設計（別 Case）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 2件（Wave 2 系） |
| 影響度 | 3/5 | duplicate-inconsistencies の手戻り・暫定運用の残存 |
| 横展開性 | 3/5 | トレーサビリティ宣言作業全般 |
| 反映先明確度 | 3/5 | sidecar 集約規則は反映先明確・恒久配置先は設計未決で不明 |
| 自動化適性 | 3/5 | 事前走査は coverage/rg で機械化可 |
| プロジェクト固有知識再利用性 | 4/5 | 宣言情報源分担の固有知見 |
| 再発可能性 | 4/5 | REQ-094-012 新規文書適用が残存 |
| 費用対効果 | 3/5 | 設計 Case を要する部分あり |
| **加重合計** | **25/40** | |

#### STEP-3 処分判定・既存対策照合

- **処分区分**: deferred（6）（判定分離の選択肢あり: エントリ15側は sidecar-and-policy.md L41/47〔事前確認手順既存〕への数行追記で既存対策の更新（5）へ切り出し可能）
- **既存対策照合**: あり・fix gap（エントリ15側）／なし（エントリ19側＝設計検討事項）
- **該当 deferred エントリ**: なし（近縁4件: 「トレーサビリティ対応宣言の網羅性は欠落の規模を定量化して記録」「req-saveでREQ行を是正した場合のADF-COVERS implementation宣言確認」「REQ-057-005 確定後は ADF-COVERS 宣言を docs 配下正規成果物へ配置する」「docs_chore の REQ 行 APPEND では missing-verification が必ず残る」）
- **昇華可能性**: 中（操作規則側は昇華可・設計部分は req-define/case 系への引き渡し）
- **HITL**: ユーザー判断必要（deferred 維持 vs エントリ15の切り出し昇華）

#### エントリ一覧

1. トレーサビリティ対応宣言は「未宣言の artifact のみ」を新規 sidecar に集約し、既存宣言持ち artifact は該当情報源へ追加する（#3226/#3228/#3230）
2. 横断是正バッチの REQ-094 系 implementation 宣言の恒久配置先の設計が未決（#3229）

## 未分類（単独エントリ13件）

| # | エントリ（inbox） | 8軸合計 | 処分区分 | 既存対策照合 | 昇華可能性 | HITL |
|---|---|---|---|---|---|---|
| 単独A | REQ-030-017 隔離検査の origin/main 直指定 diff が並行 case-open で非自 Case 差分を含む（#3192） | **30/40** | 既存対策の更新（5） | あり・fix gap（definition-pr-and-idempotency.md L51 は diff を origin/main 直指定のまま記載） | 高 | ユーザー判断必要 |
| 単独B | draft target_area「### 対象外」のセクション名参照解釈（#3192） | **21/40** | deferred（6） | あり・fix gap（req-define draft-generation.md L39 の突合手順は producer 側で存在・適用側の解釈規則は未記載） | 低〜中 | 自律確定可能 |
| 単独C | 同一ファイル複数 edit 同時並行の部分適用残骸（#3193） | **27/40** | 既存対策の更新（5） | あり・fix gap（worktree-operations.md L248 再読取規則は既存・同時並行禁止/順次実行規律と部分適用残骸の機構は未記載） | 中〜高 | ユーザー判断必要 |
| 単独D | git rm ステージの並走 commit 混入（#3186/#3189） | **30/40** | 既存対策の更新（5） | あり・application miss＋fix gap（git-common-procedures.md 手順3 の `git commit -- <paths>` 義務・Form Zero 原則は既存だが並走 Case の commit が無パス指定で違反。被害側防御の STEP-7 接続も未記載） | 高 | ユーザー判断必要 |
| 単独E | bun test scripts/ 全体実行の timeout 延長（#3199） | **26/40** | 既存対策の更新（5） | あり・fix gap（delegation-and-result.md L44-46・harness-delegation.md L44 の120秒保護記載は存在・timeout 延長指定が未記載） | 中〜高 | ユーザー判断必要 |
| 単独F | #3211 が IR-055 新規 violation を baseline 登録なしで merge（#3192 修復） | **26/40** | 既存対策の更新（5） | あり・guardrail insufficiency（QG-4 checker 実測は既存・merge 直前 main 取り込み済み branch HEAD での実測と provenance-tracked baseline 登録漏れ検査は未明記） | 中〜高 | ユーザー判断必要 |
| 単独G | deferred.md 反映先候補 11 行が不在スキル agentdev-doc-writing を指したまま残留（#3200） | **27/40** | 既存対策の更新（5） | なし（反映先実在性の再確認機構は learning pipeline に存在しない） | 中〜高 | ユーザー判断必要（deferred.md 本文変更を伴う） |
| 単独H | ADF-COVERS(design) 役割タグ解釈（#3214） | **27/40** | 既存対策の更新（5） | あり・fix gap（missing-design 0 件ゲート手順〔definition-pr-and-idempotency.md L34〕は既存・役割タグが coverage 役割解釈を決める旨の説明は未記載） | 中〜高 | ユーザー判断必要 |
| 単独I | docs/README.md 件数言及行は generate_indexes 対象外（#3214） | **24/40** | deferred（6） | あり・match（手順2.5＋check_integrity 実測の既存手順どおり機械検出・修正完了。AUTOGEN ブロック外手動記述の知識は残差） | 低 | 自律確定可能 |
| 単独J | --profile link の worktree zero-targets は違反ではない（#3226） | **24/40** | deferred（6） | あり・match（delegation-and-result.md L102 に zero-targets 時の fallback と gate-not-passed 扱いが既存・遵守済み。残差は委譲 prompt 前置観点の明示のみ） | 低〜中 | 自律確定可能 |
| 単独K | docs 配下の異言語混入（DEC-012 韓国語是正）（#3228） | **20/40** | deferred（6） | 近縁あり（deferred「2026-07-20: SPEC 本文への中国語文字混入」— 日本語外 CJK 検査不在の同根。検査基盤変更は別検討） | 低 | 自律確定可能 |
| 単独L | prh 固定置換辞書登録は DEC-028 立証手続きを別途行う（#3227/#3229） | **22/40** | deferred（6） | あり・match（DEC-028 限定例外運用どおりの遵守記録。語彙レジストリ追記は別 Case 対象） | 低 | 自律確定可能 |
| 単独M | checker 退避ファイルが worktree remove を拒否（#3231） | **25/40** | 既存対策の更新（5）（境界） | あり・fix gap（STEP-6-6 は .agentdev/tmp/ のみ対象・worktree 内退避ファイルは網羅しない。近縁: 「worktree 指定の check_integrity 実行は reports/ 出力の後始末が前提」） | 中 | ユーザー判断必要 |

## STEP-3 処分判定サマリ

| 判定単位 | スコア | 処分区分候補 | HITL 推奨 |
|---|---|---|---|
| クラス1（gh role/kind 契約） | 28/40 | 既存対策の更新（5） | ユーザー判断必要 |
| クラス2（checker 起動環境前提） | 30/40 | 既存対策の更新（5） | ユーザー判断必要 |
| クラス3（宣言情報源分担） | 25/40 | deferred（6）※分離可选 | ユーザー判断必要 |
| 単独A〜M（13件） | 20〜30/40 | 更新7・deferred 6 | 自律5・HITL 8 |

- **内訳**: promote 候補 10単位（クラス1・2、単独A・C・D・E・F・G・H・M＝inbox 13エントリ分）、deferred 候補 6単位（クラス3、単独B・I・J・K・L＝inbox 7エントリ分）、duplicate 0・rejected 0
- **該当 deferred エントリ（duplicate）集計**: 0単位（近縁あり 8単位）

## Decision 候補除外記録

禁止条件フィルタリングゲートを全16判定単位に適用。**恒久契約候補（Decision）への昇華対象は 0件**。

- クラス1、単独E・H（Tool 入力契約・CLI 実行形態・宣言役割解釈）→ 除外理由: **command仕様**。代替反映先: issue-operation-safety.md・agentdev-issue-tracking・各 workflow reference
- クラス2、単独A・C・D・J・M（起動形・diff 形式・edit 規律・ステージング・cleanup 手順）→ 除外理由: **運用ルール**。代替反映先: worktree-operations.md・git-common-procedures.md・readiness-and-cleanup.md・cleanup-and-capture.md
- 単独F・G（QG-4 実測 coverage・learning pipeline 実在性確認）→ 除外理由: **運用ルール／仕様変更のみ**。代替反映先: qg-4-final-acceptance.md・agentdev-learning-pipeline・agentdev-workflow-learning-promote
- クラス3、単独B・I・K・L（設計検討事項・知見記録）→ 除外理由: **技術判断不在**。代替反映先: deferred（living pool）・req-define/case 系

## STEP-4 adversarial-review 結果（2026-09-28 実施）

**発動条件判定**: 発動。evaluation-report.md 反映済み、skip 条件非該当（inbox.md エントリ 20件、1件のみでもなく既存対策との重複確実でもない）。不可逆処理は未実行であることを確認済み。review は in-context（Orchestrator・Reviewer・Reviewee 3論理役割）で実施した。

**findings**:

- A-1（反映済み）: クラス1のエントリ1（issue_update role）の内容は issue-operation-safety.md L135 で現行配布物カバー済み。発生件数軸 2/5 は rubric（inbox 内件数）どおり有効だが、採用済み成果物はカバー済み規則を再教育せず fix gap（role: case/kind 不受理・work_type 物理ラベル・--label case 無効）にスコープを限定する
- A-2（成果物生成時反映）: 単独K の deferred 追記行に近縁エントリへの明示相互参照（「近縁: 2026-07-20 SPEC 中国語混入〔検査基盤不在の同根〕— 統合候補」）を含め、統合判断を次回再評価で実行可能にする
- A-3（反映済み）: クラス3 は HITL で「deferred 維持 vs エントリ15のみ切り出し昇華」の判定分離を明示的に問う
- A-4（反映済み）: 単独G の deferred.md 9エントリへの不在反映先注記は再マッピングを行わず不在の明示に留める（SKILL.md 不変条件「learning-promote は実現先を選ぶ分類・マッピングを行わない」遵守）。注記は deferred.md 本文変更のためユーザー承認対象とする
- 棘却1: 単独D の promote 妥当性への異論（既存手順3でカバー済みでは）→ 棘却。application miss（並走 commit の無パス指定違反）＋被害側防御の未接続という fix gap が実在し、実害（push 済み混入）も発生している
- 棘却2: 単独I を duplicate とする異論 → 棘却。AUTOGEN ブロック外の知識をカバーする既存 deferred エントリは存在しない（近縁は AUTOGEN 再生成側）

**ループ離脱**: 反映後の再レビューで新たな本質的争点なし（停止条件: 反証の枯渇）。unresolved 残存なし。

## STEP-5 判定確定（自律確定記録）

**自律確定 5単位**（取得可能な根拠から処置を一意に確定できるもの。ユーザー承認なしで確定）:

| 単位 | 処分 | 主な根拠 | HITL 不要理由 |
|---|---|---|---|
| 単独B | deferred | 21/40。producer 側突合手順（draft-generation.md L39）は既存で再発可能性低下。残差は適用側解釈規則のみ | 低スコア・低影響・解消済み。deferred 維持以外の処置に根拠なし |
| 単独I | deferred | 24/40。既存手順（手順2.5＋check_integrity）どおり機械検出・修正完了。残差は説明知識のみ | 既存対策が機能した観測記録。昇華根拠なし |
| 単独J | deferred | 24/40。既存 fallback 手順（delegation-and-result.md L102）どおり回避済み | 同上 |
| 単独K | deferred | 20/40。近縁 deferred エントリと同根の知見。検査基盤変更は別検討 | 低スコア。統合判断は次回再評価で実行（A-2） |
| 単独L | deferred | 22/40。DEC-028 限定例外運用どおりの遵守記録 | 遵守記録であり対策変更を含まない |

**HITL 対象 11単位**: クラス1・クラス2・クラス3（判定分離 option 付き）・単独A・C・D・E・F・G（9エントリ注記同梱）・H・M — promote 昇華の承認および処分選択に意味判断を含むため。

## STEP-6 永続化参照情報

- **promote 10単位の成果物ファイル名**（承認時に `promoted/update-*.md` として生成）: gh-tool-role-kind-input-contract / worktree-integrity-checker-launch-contract / case-open-isolation-merge-base-diff / edit-parallel-application-guard-residue / shared-main-git-rm-stage-race / bun-test-full-suite-timeout / qg4-ir055-baseline-provenance-check / learning-deferred-stale-target-audit / adf-covers-design-role-tag / worktree-evidence-file-cleanup
- **deferred.md 移動**: 全20エントリを verbatim 追記＋移動日 2026-09-28。deferred 6単位（7エントリ）には処分判定行を付与して残置。staged 13エントリは成果物生成後に prune（証拠は各成果物「元learning item/根拠」節へ保存済み）
- **不在反映先 9エントリ注記**（単独G 承認時）: 各エントリの想定反映先行直後に「反映先備考（2026-09-28 learning-promote）: 反映先候補 agentdev-doc-writing は不在スキル（Case #3200 で語彙レジストリ削除済み）。現行化または廃棄判定は次回再評価で確定」を追加。対象見出し: PR #1122 X-6 検出残存（L259）、REQ スキーマ per-entry 曖昧さ（L338）、2026-07-23 用語表記揺れ横断（L668）、AG-005 references 300行超（L1059）、機械置換スクリプト引数意味差異（L1077）、訳語表未登録技術用語（L1365）、SKILL.md 見出し語日本語化（L1437）、配布物側だけの訳語化（L1455）、IR-067 plain 検出（L1700）
