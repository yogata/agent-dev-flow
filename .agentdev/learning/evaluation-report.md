# 評価レポート

## メタデータ
- **実行日時**: 2026-09-22 12:35
- **対象エントリ数**: 1件（inbox: 1件, deferred: 候補突合15件〔インデックススキャン → タグ・見出しトークン過剰包含フィルタ → 候補本文読込〕）
- **問題クラス数**: 1（未分類のみ。単独エントリのため最小クラスタサイズ2未満で未分類クラスタ扱い）
- **実行特性**: backlog-auto stage 2 learning 系統。Case #3056 / PR #3058（REQ-090 Jev 先行評価 Stage 1）case-run 由来

## 問題クラス一覧

### 未分類エントリ1: 新規配布物への concrete-id・inline ADF-COVERS 宣言混入（作成時観点の前置欠落）

- **根本原因**: 配布物は `REQ-{NNNN}` プレースホルダ形式が慣行で、対応宣言は traceability sidecar に置くのが正という既存規約（配布依存境界 Design「配布物本文の記述規則」節、case-run 対応宣言作成先ルール）が、新規配布物（tools/plugins/skills 配下）作成時の実装工程で前置観点として適用されず、具体 REQ 番号（REQ-090-004 等）と ADF-COVERS 宣言を6系統 Workflow reference と新規 .ts / README へ直接記載した
- **再発条件**: 新規配布物（tools/plugins/skills 配下）の作成時に concrete-id または ADF-COVERS 宣言を本文へ直接記述した場合
- **予防策**: 「新規配布物（tools/plugins/skills 配下）へは concrete-id と ADF-COVERS を書かず、sidecar へ対応宣言を登録する」を実装系 Skill 実行時・case-run の作成時確認観点として明示する

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単発（Case #3056・PR #3058） |
| 影響度 | 2/5 | 検知機構が機能し 69 failures を検出、case-run 内で自律修正（sidecar 7件への再登録）で解消、merge 阻止に至らず。修正コスト（再登録作業）のみ発生 |
| 横展開性 | 3/5 | tools / plugins / skills 配下の新規配布物を作成する全 Case で再発し得る（inbox エントリの横展開観点） |
| 反映先明確度 | 4/5 | 反映先が inbox エントリで自足的に特定済み（配布依存境界 Design の運用記述、case-run 実行系の確認観点）。既存記述の所在も機械確認済み |
| 自動化適性 | 3/5 | 検知は既に自動化済み（STEP-S3-5 事前 gate / STEP-S5 最終 gate）。予防策は作成時確認観点の明文化・前置が主体 |
| プロジェクト固有知識再利用性 | 4/5 | 配布依存境界・traceability sidecar 正規配置というプロジェクト固有契約体系に直結し、配布物作成系 Case の再利用価値が高い |
| 再発可能性 | 4/5 | 新規配布物の作成は今後も継続（6系統 Workflow reference 等の配布物拡張）。作成時観点が前置されない限り再発し得る |
| 費用対効果 | 4/5 | 既存の case-run 確認観点・Design 記述への数行の前置追記で予防可能 |
| **加重合計** | **25/40** | |

- **推奨処分案**: 処分区分5（既存対策の更新: application miss + guardrail insufficiency）→ 採用。
  - **既存対策あり**: (1) 配布依存境界 Design「配布物本文の記述規則」節（inline ADF-COVERS 宣言・concrete ID 禁止、sidecar 正規配置を明文化済み）(2) case-run SKILL.md L120 対応宣言の作成先ルール（配布対象成果物の対応関係は traceability/ 配下 sidecar へ作成・更新）(3) STEP-S3-5 事前 gate / STEP-S5 最終 gate（fail-closed 検知、今回 69 failures 検出で機能、PR #3058 で failures 0 解消済み・merge 済み）
  - **ギャップ**: case-run L120 の作成先ルールは STEP-S2 coverage 確認（既存対応関係の確認）文脈に付随し、「新規配布物の作成時」の前置観点として独立明示されていない。検知 gate は事後・事前委譲検知であり作成時（委譲内実装時）の予防観点は未整備 → application miss（規約は存在したが適用されなかった）+ guardrail insufficiency（作成時前置の不備）
  - **既存事実の整備状況**: Design 正典・case-run ルール・検知機構はいずれも整備済み。REQ/Decision/spec の新規改廃は不要（inbox エントリも「Decision/REQ/spec影響: なし（既存の配布依存境界 Design〔DEC-014・REQ-029〕と traceability sidecar 正規配置の再適用）」と記録）。実現先の選択は行わず、req-define の変更影響分析へ既存事実として引き渡す

#### エントリ一覧
- 2026-09-22: 配布物への concrete-id・producer metadata の混入を配布依存境界検査が検出 [inbox]

### 重複判定（既存昇華済み成果物・deferred との突合）

- 過去 promoted 成果物は backlog-review の RU 化後に除去済み（promoted/ は現在空。前回実行 2026-09-21 の staged 2件も同様に RU 化後除去済み）。deferred.md 候補突合（15件）の結果:
  - L1612「配布物の不在ID参照残骸は概念名参照へ置換する」: 不在ID参照**残骸の是正**であり本件（新規作成時の混入予防）とは根本原因・再発条件が異なる。相補関係
  - L1585「REQ-057-005 確定後は ADF-COVERS 宣言を docs 配下正規成果物へ配置する」: 宣言正規配置の同方向知見だが、docs 配下正規成果物への配置であり配布物**新規作成時**の作成時観点をカバーしない。相補関係
  - L381「限定的検査による『配布物参照境界達成』報告が包括的検査で覆る」: 達成報告表現と検査網羅性の問題クラスで別問題
  - L1950（fixture 宣言マーカー偽計上）、L2335（fixture 実在 REQ ID）: fixture 記述規約の問題クラスで別問題
  - L2316（BASELINE_CATEGORIES producer-metadata 欠落）: baseline 生成・読込構造の別問題
  - その他候補（L1205 gate TEMP 書出しブロック、L1439 移動系 baseline 比較、L1457 ID 除去表記残骸、L1529 unclassified-entry 分類、L1565 宣言網羅性、L1603 req-save 宣言確認、L1721 pre-write gate ブロック、L1868 checker CLI 契約、L2297 Design accepted 対応記録）はいずれも根本原因・再発条件・予防策が異なる別問題クラス
  - **duplicate なし**

## promote 時prune結果

- **対象エントリ数**: 1件（inbox 由来）
- **prune実施**: あり（staged 1件。deferred.md 追記・検証後に除去。証拠は採用済み成果物「元learning item / 根拠」セクションへ全文保存）
- **prune候補**: 1件
- **prune却下**: 0件

## 全体傾向
- 事象は検知機構（配布依存境界 gate）が機能し、case-run 内で早期解消された。ギャップは「作成時予防観点」の前置欠落であり、既存正典（Design 記述規則・case-run 確認観点）への小規模な補遺で解消する性格（処分区分5）
- 8軸スコア 25/40。前回実行（2026-09-21）の区分5採用2件（25/40・21/40）と同水準。反映先明確度・費用対効果が高い

## Decision候補除外記録
- **対象item**: 配布物 concrete-id・inline ADF-COVERS 宣言混入
- **除外理由**: 運用ルール（作成時確認観点の明示。技術判断不在）
- **根拠事実**: 予防策が case-run 実行系確認観点・Design 運用記述への前置追記であり、アーキテクチャ上の決定・技術選定を含まない。配布依存境界 Design（DEC-014・REQ-029）・case-run 作成先ルール・検知 gate は既存で変更不要
- **代替反映先候補**: 配布skill（agentdev-workflow-case-run の確認観点）、配布依存境界 Design の記述規則節の運用側補強

## Jev 先行評価観測（観察記録）
- Custom Tool `agentdev_jev` が本実行セッションに存在せず、STEP-2（問題クラス分類・8軸評価）、STEP-3（廃棄判定・昇華可能性評価）、STEP-4（発動条件判定）の逐次経路（`evaluate`・`observation_write`）を実行できなかった。`not_configured` 相当の観察として記録し、従来 LLM 経路のみで本 Workflow を完了する。観測 JSON の生成・保存は行わない（捏造禁止、観測書込み不能時の success 維持契約に従う）

## adversarial-review 記録（STEP-4）

- **発動条件判定**: 発動（default-on）。evaluation-report.md 反映済み。skip 条件〔inbox 1件のみで既存対策との重複が確実（新規性なし、廃棄判定確定）〕非該当 — 判定が promote 採用（区分5）であり、既存対策に未整備ギャップ（作成時観点前置欠落）が機械確認済みで新規性があるため
- **レビュー戦略**: 対象=本レポートの処分判定（区分5採用）と既存対策照合。目的=(a) 既存対策の過大評価による誤採用（実は duplicate または rejected） (b) 採用済み知見の deferred 誤判定（昇華不要ノイズの promoted 混入） (c) 問題クラス誤統合（不在ID残骸是正・表記残骸等との混同） (d) ギャップ分類（application miss + guardrail insufficiency）の妥当性の検出。証拠=配布依存境界 Design 本文、case-run workflow skill 本文（SKILL.md / references）、deferred.md 候補本文、PR #3058 関連記録
- **challenge（2系統の独立 stream）**:
  - stream-1（処分判定妥当性）: F1-1 検知機構が機能し解消済みのため rejected（「すでに別の対策で十分対応済み」）では（→ rejected の判定基準は「ユーザーが明示的に却下、すでに別の対策で十分対応済み」。検知は事後・事前委譲検知であり作成時予防は未整備。区分数行の前置で予防可能な費用対効果を考慮すると rejected は過小判定。採用維持）／F1-2 出現1件・影響度2のため deferred が適切では（→ 13フィールド自足・反映先明確度4・予防策が既存記述への具体的前置として確定可能・再発条件が標準 Case で現実的に残存。deferred の「情報断片的・出現回数少」に該当しない。採用維持）／F1-3 区分4（project knowledge）では（→ docs/knowledge/ 向け再利用可能知識ではなく、既存配布契約体系の適用ギャップの解消が本質。既存事実の整備状況として req-define へ引き渡す区分5が妥当）
  - stream-2（重複・ギャップ分類妥当性）: F2-1 L1612「不在ID参照残骸→概念名参照」との重複では（→ 同者は残骸**是正**の後処理知見、本件は**新規作成時**の混入予防。根本原因・再発条件・予防策が異なる。duplicate 否決）／F2-2 case-run L120 ルールが既に存在する以上 application miss のみで guardrail insufficiency は過剰では（→ L120 は coverage 確認文脈に付随し「新規配布物作成時」の前置観点として独立明示されていない事実を case-run SKILL.md 本文で機械確認。両者併記は妥当だが、採用済み成果物の既存対策確認セクションでは application miss を主、guardrail insufficiency を副として記録する）／F2-3 事象解消済みのため「既存対策の更新」の実質が残らないのでは（→ 予防策候補（作成時確認観点の明示）は未実施であり、解消済みは個別事象であって作成時観点の整備済みを意味しない。区分5として既存事実の整備状況を req-define へ引き渡す価値が残る）
- **counter-challenge**: Reviewee は F1-1 に対し、rejected の「十分対応済み」解釈には「作成時観点も含めて整備済み」が必要と反証（Reviewer 受容）。F2-2 に対し、記録上の主従を明示する修正を受容し既存対策確認セクションの記述方針へ反映
- **convergence**: 区分5採用（application miss 主 + guardrail insufficiency 副）、duplicate なし、REQ/Decision/spec 改廃不要、8軸スコア維持（25/40）で合意
- **convergence audit**: 合意候補を削除禁止基準（判断基準・技術知識・プロジェクト固有知識を含む成果物は維持）で再検査。採用済み成果物は「配布物作成時は concrete-id・inline 宣言を書かず sidecar へ登録する」という判断基準を含むため promoted での証拠保存（元learning item 全文）は妥当。rejected/deferred への降格余地なし。再 review 発動条件（新たな本質的争点が生じ得る場合）非該当 — 停止条件（新 finding なし・全 finding 処理済み・意味内容変化なし相当の反映完了）を満たしループ離脱
- **unresolved**: なし

## 自律確定記録（STEP-5 証跡）

- **エントリ1（配布物 concrete-id・inline ADF-COVERS 宣言混入）**: 確定処置 = promote（採用、処分区分5: 既存対策の更新）。主要根拠: (1) 既存記述の所在を機械確認（配布依存境界 Design L40-50「配布物本文の記述規則」節、case-run SKILL.md L120 対応宣言作成先ルール、references/single.md STEP-S3-5 事前 gate / references/delegation-and-result.md STEP-S5 最終 gate）し、「新規配布物作成時」の前置観点が未整備であることを確認 (2) 8軸 25/40・反映先明確度 4 (3) deferred 候補突合 15件で duplicate なし (4) adversarial-review で unresolved なし・rejected/deferred 降格余地なし。HITL 不要理由: 親委譲 CONTEXT が「adversarial-review → 自律確定 judgment → HITL（ユーザー判断必要項目のみ）」の順序で自律確定を授権し、取得可能な根拠で処置が一意に確定できる（REQ-038-002、REQ-003-055）
- **破壊的変更**: なし。inbox.md は正規の deferred 移動手続によるクリアのみ。deferred.md 既存エントリへの削除なし（prune は今回 staged 1件〔追記分〕のみ）。inbox 全体強制クリア、大量エントリ一括削除等の破壊的変更に該当する操作は存在しない
- **HITL-REQUIRED**: なし（全項目自律確定。ユーザー判断必要項目は残らない）
