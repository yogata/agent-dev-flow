# 評価レポート

## メタデータ
- **実行日時**: 2026-09-25（STEP-4 accepted findings 修正版）／2026-09-25（STEP-5 判定確定・promoted 成果物生成）
- **対象エントリ数**: 18件（inbox: 18件、deferred: 130エントリ中、同一クラス照合3件を確認）
- **問題クラス数**: 1（未分類16エントリ含む）
- **確定状態**: STEP-6 永続化完了（2026-09-25・ユーザー明示要求により実行）。promoted成果物11件生成済み。gh66 learning固有余部をdeferred.mdへ追記済み、inbox.md はヘッダーのみへクリア済み（staged 12件・duplicate 5件のpruneを含む）。git commit/push 実施済み

## STEP-4 修正記録

- **Class2分割**: Case #3123（対象REQ行のDesign対応事前確認欠落）とCase #3113（sidecarのcomponent対応誤り）は、根本原因・再発条件・予防策が異なる。前者はcoverage --reqによる確認と欠落時のartifact_actions組込み、後者は宣言追加前のcomponent/sidecar対応一覧確認が予防策であり、三要素が一致しない。各1件のため最小クラスタサイズ（2件）未満となり未分類へ移動。
- **Class3分割**: 測定内容の非対称（候補検証の有無・入力同一性）とLLM推論の非決定性は原因と予防策が異なる。前者は測定設計の対称性確認、後者は検出差分の正当理由付けであり、各1件のため未分類へ移動。
- **Class4の単独化**: deferredの「行移動系 baseline delta」（2026-08-09）はcheckerのbaseline行位置管理であり、inspect findingのdomain鮮度とは根本原因・再発条件・予防策が異なる。同一クラス対応を解除し、domain鮮度1件を未分類へ移動。
- **未分類件数**: 前版の10件は誤り（前版の一覧は11件）。上記5件の移動を反映し、未分類は16件。
- **算術修正**: 前版Class2の各軸（3+4+3+5+3+3+4+4）は29であり、記載の30/40は誤り。分割後、各エントリを個別評価。
- **既存文書との照合**: REQ-036-032（`docs/requirements/REQ-036.md:51`）はfinding差分全件への正当理由付けを既に規定するため、LLM非決定性エントリを既存契約の実証（duplicate）とした。一方、測定内容の対称性は同要件に明記されず、真のギャップとして残す。`docs/designs/responsibilities/custom-tool-contracts.md:86` はJevの2段階書込みと `llmFinalJudgment` / `llmTreatment` 追記完成modeを既に規定するため、Design記述欠落は主張できない。入力schema表示と実装の乖離の処分はこの時点では未決とした（STEP-5で既存対策の更新として確定。「判定サマリ（STEP-5 確定版）」参照）。
- **STEP-5先行記載の除去**: STEP-4時点で、前版の確定済み表現、自律確定記録、promoted成果物名、prune実施済み主張を除去し、その時点では全て暫定案として記載した。本節および「問題クラス一覧」「未分類」「全体傾向」「Decision候補除外記録」はSTEP-4時点の記録であり、全項目はその後のSTEP-5で確定済みである（確定内容は「STEP-5 判定確定記録」「判定サマリ（STEP-5 確定版）」「HITL 承認結果」を参照）。
- **Decision除外範囲の修正**: 全項目を一括除外せず、運用手順追加が主な処分区分5候補のみを対象とする。Design候補は一括除外しない。

## 問題クラス一覧

### 問題クラス1: write ツールによる workspace 外一時ファイル書込みの guard ブロックと標準手段切替

- **根本原因**: repo側write guard（fail-closed）はproject root外の書込みを一律ブロックし、harness環境情報のtempディレクトリ許可表示とは独立に判定する。機械的検査エンジンのREADMEに検査入力JSONの置き場所指針が定められていない。
- **再発条件**: workflowがharness提示のworkspace外tempへwriteツールで一時ファイルを書き込む場合に再発。
- **予防策**: case-open scripts/README.mdへの置き場所指針（workspace外temp禁止、一時ファイルはproject root内〔worktree配下一時パス・gitignore領域〕に限定、検査後削除）と、worktree-operations.md「書込み guard 運用指針」へのworkspace外ブロック知見（project root内配置への切替）の集約を候補とする。guardブロック後の別API経路（node writeFileSync等）によるworkspace外書込みは迂回として採用しない。

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 4/5 | inbox 2件（Case #3101・#3139）+同一クラスと確認したdeferred 3件（リポジトリ外temp書込みブロック〔2026-08-15移動〕、OS一時ディレクトリのproject root外判定〔2026-09-19〕、承認済みtempを含むproject root外のfail-closed block〔2026-09-20〕）=5件。基準4は5–7件。 |
| 影響度 | 2/5 | 代替手段への切替で完結し、データ破壊なし。 |
| 横展開性 | 4/5 | worktree運用・機械的検査実行全体で発生し得る。 |
| 反映先明確度 | 5/5 | 対象ファイル・注記内容までinboxで特定済み。 |
| 自動化適性 | 2/5 | guard自体は正しく動作し、主な候補は文書注記。 |
| プロジェクト固有知識再利用性 | 4/5 | Windows worktree運用固有の知見。 |
| 再発可能性 | 4/5 | harness提示tempへの書込みを試みるたびにブロック。 |
| 費用対効果 | 4/5 | 注記追記は低コスト。 |
| **加重合計** | **29/40** | 4+2+4+5+2+4+4+4=29。 |

- **処分（STEP-5 確定）**: 5 既存対策の更新（fix gap）。worktree-operations.md「書込み guard 運用指針」の集約範囲にworkspace外writeブロック事例がなく、case-open scripts/README.mdに検査入力の置き場所指針がない。成果物 `existing-countermeasure-update-worktree-write-guard-temp-path.md` 生成済み。

#### エントリ一覧
- 2026-09-20頃: 横断依存検査の検査入力JSONがworkspace外書込みでguardブロックされworktree内一時パスへ切替（Case #3101）[inbox]
- 2026-09-25: writeツールのworkspace外一時ファイル書込みguardブロックはnode writeFileSync経由でも解消可能（Case #3139）[inbox]
- 2026-08-15移動: ハーネスWriteツールのリポジトリ外temp書き込みがdistribution-boundary-guardでブロック（deferred.md:814）[deferred]
- 2026-09-19: OS一時ディレクトリもtextlint guardのproject root外判定でfail-closedブロック（deferred.md:2320）[deferred]
- 2026-09-20: 承認済みtempを含むproject root外へのwrite tool書込みをguardがfail-closed block（deferred.md:2402）[deferred]

上記deferred 3件は根本原因（project root外書込みをguardがfail-closedで拒否）、再発条件（一時ファイル等のproject root外書込み）、予防策（root内配置・標準手段への切替）の一致を確認した。今回、deferredの移動・pruneは行わない。

### 未分類

以下16件は単独エントリのため問題クラスを形成しない（最小クラスタサイズ2件）。以下の各項はSTEP-4時点の暫定状態を記録した過去の記録であり、全項目はSTEP-5で確定済みである。「暫定:」「未決（HITL）」の表現はいずれも当時の状態を記録したものであり、現在未決の項目は存在しない。「全体傾向」「Decision候補除外記録」もSTEP-4時点の所見である。処分の確定結果と証跡は本レポート末尾の「STEP-5 判定確定記録」「判定サマリ（STEP-5 確定版）」「HITL 承認結果」を正とする。

1. **Case #3123: case-readyトレーサビリティ完全性ゲート停止** — 意味変更対象行のDesign対応をcoverage --reqで事前確認し、欠落時にartifact_actionsへ含める手順がDefinition Package生成にない。対象手順・確認方法・欠落時の処置はエントリに特定されている。**暫定: 5 既存対策の更新（fix gap）**。
2. **Case #3113: sidecarのcomponent対応誤り** — producer/componentとsidecarの対応一覧を宣言前に確認する定型手順がない。移動とcheck再実行で全9項目passの証跡あり。**暫定: 5 既存対策の更新（fix gap）**。
3. **Case #3139: 並列測定の作業内容の非対称** — REQ-036-032は同一revision・corpus・既知findingを比較基準とするが、候補検証の有無・入力同一性など測定作業の対称性を明記しない。非対称subset測定を取り下げ全件対称測定で置換した実例がある。**暫定: 5 既存対策の更新（fix gap）**。測定内容の対称性確認を受け入れ条件へ明示する候補。
4. **Case #3139: LLM意味診断の非決定性とfinding突合** — REQ-036-032（`docs/requirements/REQ-036.md:51`）がfinding差分全件への正当理由付けを既に規定し、エントリ自身も同要件の設計妥当性再確認と申告。**暫定: duplicate**（既存契約の実証。新規の差分説明型要件ギャップとは扱わない）。
5. **Case #3121: inspect finding由来draftのdomain鮮度** — slug・行番号・文言で実パスを一意特定した証拠があり、finding domainの鮮度確認手順は不足。**暫定: 5 既存対策の更新（fix gap）**。
6. **Case #3103: worktree bun types依存整備** — worktree-operations.mdの選択基準（junction/bun install）は存在するが、main側node_modules不在時にworktree内bun installへ一意に決まる判定補助の明示はない（同節の依存整備・選択基準を確認）。**暫定: 5 既存対策の更新（fix gap）**。
7. **Case #3123: 子task観測証跡の永続チャネル** — 一時session出力では親が証跡を永続化できない事例と、PR本文Findingsへの記録実績あり。委譲契約に永続チャネル記録形式を定める候補。**暫定: 5 既存対策の更新（fix gap）**。
8. **Case #3111: 配布物concrete ID検出実証** — エントリ自身が既存対策の範囲内・新規再発要因なし・予防策なしと記録。DEC-014のchecker検知面の実証。**暫定: duplicate**。
9. **Case #3109: skills_structure fallback実証** — 正常動作確認で予防策候補なし。REQ-018-001のfallback実証。**暫定: duplicate**。
10. **Case #3139: check_integrity --json stdout混在** — 同一問題を記録したintake item `2026-09-25-check-integrity-json-stdout-report-line.md` の存在を確認。エントリ自身もSplit Ruleによる分割を申告。**暫定: duplicate（intake経由で処理中）**。
11. **Case #3139: 並列測定の委譲回収fan-in実証** — エントリ自身が実装側のSTEP-2-1 fan-in手順の存在を申告。**暫定: duplicate**。
12. **Case #3123: gh exited with 66** — intake item `2026-09-25-agentdev-gh-spawn-infra-transient.md` はinfra-transient停止分類・serve再起動回復・spawn分離を扱う。ただしinbox側が判断を委譲したcustom-tool-contracts.mdへの運用特性記録要否（fail-closed契約が環境故障時にpipelineを止める特性）はintake itemで確認できない。**未決（HITL）**: intake重複として扱うか、契約記録候補を残すかを一意に決められない。
13. **Case #3139: Jev observation_write completion schema** — `custom-tool-contracts.md:86`に2段階書込み・llmFinalJudgment/llmTreatment追記完成modeが既記載で、Design契約の記述欠落は確認できない。残る候補はTool入力schema表示と実装の乖離。**未決（HITL）**: duplicate、3 恒久契約候補（Design）、5 既存対策の更新のどれとするかは一意でない。Design候補をDecision候補除外の一括対象にしない。
14. **agentdev_gh issue_list page limit** — REQ-092-001（`docs/requirements/REQ-092.md:24`）は広範filter時のsearch併用を規定し、`src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md`も存在する。一方、頻出トークンを避ける選択性とstate: open限定で足りるケースの知見は残余候補。**未決（HITL）**: 既存規律との重複度と残余知見について、duplicate / 5 既存対策の更新 / deferredが競合する。
15. **Case #3107: evidence pathのprune後参照不能** — pathにRU番号・learningタイトル等の代替識別子を併記する候補は具体的だが、実装阻害はなく、REQ-018-006/007に学びの内容が凝縮済み。**未決（HITL）**: 5 既存対策の更新かdeferredか、間接影響とテンプレート変更の波及判断が必要。
16. **Case #3139: headless同期委譲timeout目安** — 同期/非同期の選択基準自体は実装済みで、環境依存の数値断定を避ける候補注記が残る。**未決（HITL）**: 軽微・単発としてdeferredにするか、目安注記を5 既存対策の更新として扱うかが一意でない。

## promote 時prune結果

- **対象エントリ数**: 18件
- **prune実施**: 完了（2026-09-25・STEP-6）。promoted 証拠検証（全11件の「元learning item / 根拠」確認）と deferred 追記検証（読み返し＋git diff で既存エントリ無変更を機械確認）を完了後に inbox.md をヘッダーのみへクリア
- **prune対象**: duplicate確定5件（LLM非決定性突合、concrete ID検出実証、skills_structure fallback実証、委譲回収fan-in実証、check_integrity JSON stdout〔intake重複・修正適用済みをコード実証〕）および inbox の staged 12件（クラス1で2件を1成果物に統合したため成果物は11件）
- **prune非対象**: deferred照合3件（問題クラス1の参照情報として現状維持・移動しない）、gh66 learning固有余部（deferred.md へ追記済み）
- **証拠保存**: promoted 成果物の「元learning item / 根拠」セクションに inbox エントリの証拠を保存済み（prune 前に全11件を検証済み）

## 全体傾向

- **高頻出・高影響**: 問題クラス1（write guard、29/40、5件）。
- **横展開性が高い**: 問題クラス1（4/5）。単独エントリはクラス集計に含めない。
- **自動化適性**: 問題クラス1は2/5。未分類の対策候補は手順・契約確認が主。
- **全体所見**: Case #3139の測定・委譲観察には既存契約の実証と手順上の不足が混在する。intakeとの重複候補はgh exited 66とcheck_integrity JSON stdoutの2件だが、gh exited 66は契約記録要否が未決。REQ-036の差分正当化規定とJev Design記述を既存事実として反映し、真のギャップと区別した。

## Decision候補除外記録

- **対象item**: 暫定処分区分5候補のうち、問題クラス1、Case #3123のtraceability事前確認、Case #3113のsidecar確認、Case #3139の測定対称性、Case #3121のdomain鮮度、worktree bun types、観測証跡永続チャネル
- **除外理由**: 運用ルール（手順・注記の追加が主で、エントリ上にアーキテクチャ上の決定・技術選定がない）
- **根拠事実**: 各予防策候補はworkflow手順、README注記、または選択基準への追記。
- **代替反映先候補**: 既存対策の更新（処分区分5）候補としてreq-defineへ引き継ぐ。
- **除外対象外**: Jev completion schemaはDesign/恒久契約候補としてエントリ自身が影響を申告しており、一括除外しない。Design記述の既存有無を踏まえた処分はHITL未決。

## 判定サマリ（STEP-5 確定版）

処分は確定済み。確定方式「自律確定」は HITL 不要（判定根拠・HITL 不要理由は「STEP-5 判定確定記録」参照）、「ユーザーHITL承認」はユーザー承認済み。promoted 成果物はすべて `.agentdev/learning/promoted/` 配下。

| エントリ | 処分（確定） | 確定方式 | promoted 成果物 |
|---|---|---|---|
| 問題クラス1 write guard（inbox 2件: #3101・#3139） | 5 既存対策の更新 | 自律確定 | existing-countermeasure-update-worktree-write-guard-temp-path.md |
| Case #3123 traceability事前確認 | 5 既存対策の更新 | 自律確定 | existing-countermeasure-update-traceability-design-coverage-precheck.md |
| Case #3113 sidecar component対応 | 5 既存対策の更新 | 自律確定 | existing-countermeasure-update-traceability-sidecar-component-check.md |
| Case #3139 測定対称性 | 5 既存対策の更新 | 自律確定 | existing-countermeasure-update-parallel-measurement-symmetry-acceptance.md |
| Case #3121 domain鮮度 | 5 既存対策の更新 | 自律確定 | existing-countermeasure-update-inspect-finding-domain-freshness.md |
| worktree bun types（Case #3103） | 5 既存対策の更新 | 自律確定 | existing-countermeasure-update-worktree-bun-install-decision-aid.md |
| 観測証跡永続チャネル（Case #3123） | 5 既存対策の更新 | 自律確定 | existing-countermeasure-update-delegation-evidence-persistent-channel.md |
| issue_list page limit（Case #3103） | 5 既存対策の更新 | ユーザーHITL承認 | existing-countermeasure-update-issue-list-search-selectivity.md |
| evidence path代替識別子（Case #3107） | 5 既存対策の更新 | ユーザーHITL承認 | existing-countermeasure-update-evidence-path-alternate-identifiers.md |
| Jev completion schema（Case #3139） | 5 既存対策の更新（冗長なDesign追加なし） | ユーザーHITL承認 | existing-countermeasure-update-jev-observation-write-schema-mismatch.md |
| headless timeout目安（Case #3139） | 5 既存対策の更新（実観測基準・固定数値閾値なし） | ユーザーHITL承認 | existing-countermeasure-update-sync-delegation-observed-timeout.md |
| gh exited with 66（Case #3123） | intake先行・learning固有知見はdeferred | ユーザーHITL承認 | なし（deferred追記対象） |
| Case #3139 LLM非決定性突合 | duplicate（REQ-036-032 既規定の実証） | 自律確定 | なし |
| concrete ID検出実証（Case #3111） | duplicate | 自律確定 | なし |
| skills_structure fallback実証（Case #3109） | duplicate | 自律確定 | なし |
| 委譲回収fan-in実証（Case #3139） | duplicate | 自律確定 | なし |
| check_integrity JSON stdout（Case #3139） | duplicate（intake重複・修正適用済みをコード実証） | 自律確定 | なし |

- **件数**: promoted 11成果物（inbox 12エントリ分。クラス1で2件統合）、duplicate 5、deferred追記対象 1。inbox 18エントリと一致（12+5+1）。
- **移動・prune・inboxクリア・git永続化は本実行では未実施**（STEP-6 残処理）。上記の処分は確定済みであり、次回実行は確定済み処分に基づく残処理のみを行う。

## STEP-5 判定確定記録

### 自律確定分（ユーザー承認なし。判定結果・主要根拠・HITL不要理由）

1. **問題クラス1 write guard → 5 既存対策の更新**
   - 主要根拠: 8軸29/40。inbox 2件（Case #3101・#3139）に加えdeferred照合3件（deferred.md:814・:2320・:2402、実読確認済み）が同一クラス（project root外書込みをguardがfail-closed拒否・再発条件・標準手段切替）で一致。既存対策ギャップは case-open scripts/README.md の検査入力置き場所指針不在（fix gap）と worktree-operations.md「書込み guard 運用指針」節の集約範囲外（同節は実在確認済み）。
   - HITL不要理由: 処分区分候補が5に一意（運用手順・注記追加が主で、duplicate/deferred/reject の競合なし）。反映先候補ファイル特定済み。

2. **Case #3123 traceability事前確認 → 5 既存対策の更新**
   - 主要根拠: case-ready STEP-2 の lifecycle gate completeness が対象要件行 scope で fail-closed である一方、req-define / case-open の Definition Package 生成手順に「意味変更対象行の design 対応有無確認（coverage --req）と欠落時の artifact_actions 組込み」が存在しない。baseline 既知 missing-design（REQ-031-030 実例）を含む Case は case-ready で必ず停止する構造。
   - HITL不要理由: 運用手順追加が唯一の処分。アーキテクチャ決定・技術選定を含まない。

3. **Case #3113 sidecar component対応 → 5 既存対策の更新**
   - 主要根拠: sidecar の所属は producer/component 境界で決まる（PR #3133 で宣言移動・check 全9項目 pass の証跡）。`src/opencode/skills/agentdev-traceability/references/sidecar-and-policy.md`（実在確認済み）に運用手順は存在するが、宣言追加前の component/sidecar 対応一覧確認の定型が明示されていない。
   - HITL不要理由: 既存手順への確認ステップ追記のみ。

4. **Case #3139 測定対称性 → 5 既存対策の更新**
   - 主要根拠: REQ-036-032（`docs/requirements/REQ-036.md:51`、実読確認済み）は同一 Git revision・corpus・既知 finding を比較基準と規定するが、測定作業の対称性（候補検証の有無・入力同一性）は明記しない。非対称 subset 測定の取り下げ（ユーザー判断 2026-09-25）と全件対称再測定への置換実例あり。
   - HITL不要理由: 既存 REQ 行への対称性明示候補の引き継ぎであり新規要件化ではない。ユーザーは本項について新たな判断を追加していない（STEP-4 暫定案からの処分変更なし）。

5. **Case #3121 domain鮮度 → 5 既存対策の更新**
   - 主要根拠: inspect finding の domain 記録が配置移動後の実配置と不一致でも、slug（document-model）・行番号（L375）・文言の3点で機械的一意特定できた実績。finding domain の鮮度確認（実パス照合）手順は不足。
   - HITL不要理由: 手順注記追加が唯一の処分。

6. **worktree bun types → 5 既存対策の更新**
   - 主要根拠: `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md`「bun test 実行の環境前提」節は実在（実読確認済み）するが、main 側 node_modules 不在時に worktree 内 bun install へ一意に決まる判定補助の明示はない。
   - HITL不要理由: 既存選択基準表への判定補助追記のみ。

7. **観測証跡永続チャネル → 5 既存対策の更新**
   - 主要根拠: 子 task の観測証跡が一時 session 出力のみで完結した実例（driver blocked 報告）と、record-in-findings 契約による PR 本文 Findings 記録の実績（PR #3138）。委譲契約に証跡の永続チャネル記録形式の定義なし。
   - HITL不要理由: 委譲契約 reference への記録手順追記が唯一の処分。

8. **LLM非決定性突合 → duplicate**
   - 主要根拠: REQ-036-032 が「finding 差分には全件に正当理由を付すこと」を既に規定（`docs/requirements/REQ-036.md:51` 実読確認）。エントリ自身も REQ-036-032 設計の妥当性再確認と申告。意味的矛盾 0 件の観測は既存契約の実証。
   - HITL不要理由: 既存契約条文とエントリ申告が一致する単一解。新規ギャップなし。

9. **concrete ID検出実証 → duplicate**
   - 主要根拠: エントリ自身が「既存対策の範囲内・新規問題クラスなし・予防策なし」と記録。checker（check_distribution_boundary_cli.ts）検知面の正常作動実証であり、同等内容が DEC-014 多層 enforcement の既存構成でカバー。
   - HITL不要理由: エントリ申告と既存対策の一致。昇華すべき新規知見なし。

10. **skills_structure fallback実証 → duplicate**
    - 主要根拠: 正常動作確認（REQ-018-001 fallback 実証）で予防策候補なし。エントリ自身が観測記録と申告。
    - HITL不要理由: 正常系観測の duplicate。昇華すべきギャップなし。

11. **委譲回収fan-in実証 → duplicate**
    - 主要根拠: エントリ自身が実装側 STEP-2-1 fan-in 手順（agentdev-workflow-inspect-docs）の既存を申告。担当別個別記録の実証記録。
    - HITL不要理由: 既存手順の実証であり新規ギャップなし。

12. **check_integrity JSON stdout → duplicate**
    - 主要根拠: (a) 同一問題の intake item 実在（`.agentdev/intake/inbox/2026-09-25-check-integrity-json-stdout-report-line.md`、確認済み）。(b) **修正適用済みをコード実証**: `check_integrity.ts` L11346 は `console.log(formatJsonReport(report))`（--json 時の stdout は純 JSON）、L11352 は `console.error("Report written to: ...")`（通知は stderr に分離済み）。inbox 主張の stdout 混在は現行コードで発生しない。
    - HITL不要理由: intake 重複と解決済み（修正適用済み）の機械確認による単一解。unsupported deletion を避けるため、本実行では prune（削除）を実施せず duplicate 確定の記録のみ。

### ユーザーHITL承認分（5項目）

ユーザーは以下5項目の処分を承認した。この5項目以外の争点についてユーザー承認を主張しない。

1. **issue_list page limit → 5 既存対策の更新（承認）**: REQ-092-001（`docs/requirements/REQ-092.md:24`、実読確認済み）は広範 filter 時の search 併用を既規定するが、search トークンの選択性指針（相互参照頻出トークンの回避）と state: open 限定で冪等検出が足りるケースの知見は残余ギャップとして追記対象。duplicate/deferred は不採用。
2. **evidence path代替識別子 → 5 既存対策の更新（承認）**: path 単独参照の prune 後参照不能構造に対し、prune を跨ぐ代替識別子（RU番号・learning タイトル・関連 Case 番号）の併記候補を既存対策の更新として引き継ぐ。deferred は不採用。
3. **gh exited with 66 → intake先行＋learning固有知見deferred（承認）**: intake item `2026-09-25-agentdev-gh-spawn-infra-transient.md`（確認済み）が infra-transient 停止分類・回復経路・spawn 分離を先行処理するため本エントリの promoted 生成はしない。learning 固有の知見（判定完了ごとの durable checkpoint・再開時の前置死活チェック・「無出力・非零終了」による早期死亡切り分け・否定仮説8件の診断記録）は deferred として living pool 維持。custom-tool-contracts.md への新規契約記録は本承認の範囲に含めない。
4. **Jev completion schema → 5 既存対策の更新（承認・冗長なDesign追加なし）**: custom-tool-contracts.md:86（実読確認済み）は 2段階書込みと llmFinalJudgment / llmTreatment 追記完成 mode を既に規定するため Design 記述の重複追加は行わない。promoted 対象は公開 schema 表示（Tool 入力 schema の required 表示）と実装の completion allowlist（LLM final-judgment フィールドのみ受理）の乖離の解消を既存対策の更新として扱うこと。
5. **headless timeout目安 → 5 既存対策の更新（承認・実観測基準）**: 同期委譲の実効判定は事前見積もりでなく環境 timeout の実観測を基準とする（observed-time 原則）。固定数値閾値は定義しない（環境依存）。deferred は不採用。

## HITL 承認結果

- **承認済み**: 上記5項目（2026-09-25 ユーザー承認）。
- **自律確定**: 上記12項目（ユーザー承認の擬制ではない。判定結果・主要根拠・HITL不要理由は自律確定分の記録を正とする）。
- **確定済みの不可逆処理の実施状態**: promoted 成果物生成・deferred追記（gh66 learning固有余部）・inboxクリア（prune含む）・git commit/push すべて実施済み（2026-09-25・ユーザー明示要求）

## 後続処理意向（STEP-6 残処理・次回実行対象）

| 対象 | 処置（確定済み） | 実施状態 |
|---|---|---|
| inbox 12エントリ（promoted 生成済み分） | staged。prune 完了（証拠は各 promoted 成果物の「元learning item / 根拠」に保存済み・prune 前に検証済み） | 完了（inbox クリアにより実施） |
| duplicate 5件 | prune 完了 | 完了（inbox クリアにより実施） |
| gh66 learning固有余部 | deferred.md 追記（読み返し検証済み・既存130エントリ無変更をgit diffで機械確認） | 完了 |
| deferred照合3件（問題クラス1参照情報） | 移動しない（現状維持） | 対象外 |
| inbox.md | ヘッダーのみへクリア | 完了 |
| git 永続化（commit/push） | `.agentdev/learning/` 配下のみ対象 | 完了 |
