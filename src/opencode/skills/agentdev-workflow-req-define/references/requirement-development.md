# STEP-3/4/5: 既存REQ照合・要件展開・Decision判断（requirement-development）

> 本 reference は `agentdev-workflow-req-define` SKILL.md の STEP-3、STEP-4、STEP-5 詳細である。
> 既存REQ照合、要件展開（分類ゲート群）、Decision判断を提供する。

## 目次

- STEP-3: 既存REQ照合
- STEP-4: 要件展開
- STEP-5: Decision判断

## STEP-3: 既存REQ照合

### Purpose

`agentdev-req-file-manager` の照合方法論に従い、CREATE 前に APPEND/UPDATE 候補を評価する。

### Input Resolution

1. SSoT 再構成: `docs/requirements/<REQ-*>.md` 実ファイル列挙（副次的に `docs/decisions/<DEC-*>.md`）、AGENTS.md 等の文書記載レンジ
2. identifier 保持: REQ-ID、DEC-ID
3. 最小 scalar: SPLIT シグナル算出値（要件行数、関心分類数、成果物種別数）
4. runtime artifact: STEP-2 の合意内容（draft-data 下書き）

### Preconditions

- STEP-2 で合意内容が確定している

### Procedure

- `agentdev-req-file-manager` の照合方法論に従って実行する。CREATE 前に APPEND/UPDATE 候補を必ず評価する。要件の分割が必要な場合は保存操作ではなく requirements review 候補として扱う。操作分類結果は `draft-data` の `artifact_actions` に記録する
- **定量的データ検証**: `glob docs/requirements/<REQ-*>.md`（および副次的に `glob docs/decisions/<DEC-*>.md`）で実ファイル列挙と AGENTS.md 等の文書記載レンジとの乖離を確認・解消する（詳細は `agentdev-req-analysis` 参照）
- **SPLIT 予兆計測（既存REQ）**: APPEND/UPDATE 対象の既存 REQ の健全性メトリクス（要件行数、関心分類数、成果物種別数）を計測し、req-health-metrics Design（extension 経由）の定量閾値で SPLIT シグナルを算出する。合計 2 以上の場合、APPEND 実施前にユーザーへ SPLIT 要否を提案する。計測対象は当該 REQ の要件テーブル行（`^| REQ-NNNN-MMM |`）

### Result

- 操作分類結果（CREATE / APPEND / UPDATE 候補、SPLIT 候補）、SPLIT シグナル算出結果

### Evidence

- 実ファイル列挙結果、照合判定の根拠、メトリクス計測値

### Completion Verification

- CREATE 前に APPEND/UPDATE 評価が実施済みであること。乖離解消済みであること

### Resume-Idempotency

- docs/ は読取のみであり副作用を持たない。再実行時は同一の照合結果に到達する

## STEP-4: 要件展開

### Purpose

`agentdev-req-analysis` の分析観点に従って網羅し、REQ/Decision/Design 境界を確定する。

### Input Resolution

1. SSoT 再構成: 関連 REQ/Decision/Design（glob/grep による事前特定）
2. identifier 保持: REQ-ID、RU 暫定分類
3. 最小 scalar: なし
4. runtime artifact: draft-data 下書き

### Preconditions

- STEP-3 で操作分類が確定している

### Procedure

詳細ゲート、委譲接続点は `agentdev-req-analysis` の各 Phase を参照。

- **変更影響候補抽出**: 変更影響候補を抽出しドラフトに保持する。RU からの対象領域キーワード抽出、glob/grep での関連 REQ/Decision/Design 事前特定、サブエージェント調査委譲への調査優先対象リスト（ヒント）構築、実ファイル完全列挙の維持（詳細は `agentdev-req-analysis`「調査スコープ洗練手順」参照）
- **分類ゲート（REQ 最終分類確定）**: 各要件行候補を「変更後仕様」/「反映作業」に分類する。REQ/Design 境界判定を行い Design 保存対象を `artifact_actions`（`artifact: design`）に分離する。RU 暫定分類（`tentative_classification`）があれば document-model Design（extension 経由）の文書7分類モデルへ照らして最終分類を確定し上書きする
- **design 対応事前確認**: 変更対象のうち既存 REQ 行の意味変更を含む場合、`agentdev-traceability` の coverage --req により当該行の design 対応有無を事前確認する。design 対応が欠落する意味変更行を検出した場合は、当該行の design 対応を `artifact_actions`（`artifact: design`）へ組込む。本確認は STEP-6 の生成手順（draft-generation.md の design 対応事前確認）へ引き継がれる前段の確認であり、後段の case-ready lifecycle gate completeness（fail-closed）での停止を予防する位置づけである（正規所有は case-open Design「意味変更行の design 対応事前確認」節）
- **文書分類妥当性検証**: REQ 要件行に Design 分離基準違反残留がないか検出する。検出時は Design 保存対象へ移送する（安定契約例外は対象外）
- **Decision要否確認ゲート**: Decision候補・既存REQ/Decision/Design との衝突候補・責務境界変更を含む場合、`agentdev-architecture-advisory` へ委譲する。出力は4ラベル構造（確定事項/推定事項/ユーザー確認事項/ブロッカー）。soft-contract（Decision）。ブロッカーまたは未決事項残存時は壁打ち（STEP-2）へ差し戻す
- **実行主体分類表**: 委譲契約を定義する場合、各委譲について実行主体分類表（adapter skill / command / subagent / harness）を必須とする（詳細は v4-delegation-contracts Design（extension 経由）参照。委譲を含まない要件では省略可）
- **変更誘発境界リスク分析**: `agentdev-req-analysis` の「変更誘発境界リスク分析」観点に従い、変更差分から dependency boundary、client/server boundary、execution boundary、build/runtime boundary、environment propagation boundary の 5観点境界について case-specific risk を導出する。project 固有のリスク導出規則を参照する場合、docs/knowledge/ を正規知識領域とし、利用可能なハーネスの探索能力を通じて関連知識を検索する（Project Knowledge の所有と workflow 利用の要件が正規所有する利用契約に従う）。知識が不在の場合は ADF core の一般規則のみで 5観点境界分析を実行する（分析を省略しない）。導出した case-specific risk は検証契約へ投影する。変換経路は change → risk → verification obligation → test strategy とし、投影先は test strategy、投影完全性の検査は QG-1（リスク→test strategy 投影完全性検査）が担う
- **test strategy 定義**: 各合意項目（AG-*）の検証方法を test strategy として定義する。3要素構造（`verification` / `pass_criteria` / `on_failure`）を必須とし、`on_failure` を持たない検証項目は含めない。項目識別子は `TS-NNN`、`on_failure` アクション種別は `fix-and-reverify` / `record-in-findings` の2値。シリアライズ形式の詳細は req-define command Design（extension 経由）の draft-data test_strategy フィールドスキーマ参照。導出済み case-specific risk から検証義務（verification obligation）を導き、test strategy 項目へ投影する（change → risk → verification obligation → test strategy）。選択した検証手段の質は `agentdev-req-analysis` の「検証手段の質基準」観点（production-equivalent verification、正本は analysis-viewpoints reference）に従い判定する。完了時点の証跡契約を正規所有する要件群が正規所有するため、本工程では複製せず参照に留める
- **検索系検証の網羅範囲・修正対象列挙一致確認**: test strategy 項目に検索系検証（rg 等）を定義する際、検証コマンドの網羅範囲（対象パス・パターン）と修正対象列挙（変更対象ファイル集合）の一致を確認する。See Also 等の参照行は修正対象ではないため、網羅範囲から除外するか、検索に含める場合は参照行を検出対象外とする扱いを明示する。本確認は既存の test strategy 定義義務（3要素構造、case-specific risk 投影、検証手段の質基準適用）への追加であり、既存手順を置換するものではない

### Result

- 変更影響候補、最終分類、Design 分離結果、Decision要否確認結果、case-specific risk 導出結果（5観点境界の確認記録を含む）、test strategy 定義

### Evidence

- 影響候補リスト、分類判定根拠、助言の4ラベル構造結果、case-specific risk 記録（導出有無と5観点確認の記録）、test strategy 項目、検索系検証の一致確認結果（該当時）

### Completion Verification

- 全要件行候補の分類が確定し、Design 分離基準違反残留が0件であること。5観点境界の確認が実施済みであり、導出済み case-specific risk が test strategy へ投影済みであること（投影完全性は QG-1 が検査）。test strategy 項目が全て3要素を持つこと。検索系検証（rg 等）を含む test strategy 項目がある場合、網羅範囲と修正対象列挙の一致確認が実施済みであること。既存行の意味変更を含む場合、design 対応事前確認（coverage --req 実査・欠落時 artifact_actions 組込み）が実施済みであること

### Resume-Idempotency

- 判定結果は draft-data 下書きへ反映する。再開時は下書きの確定済み分類を再評価しない

## STEP-5: Decision判断

### Purpose

`agentdev-decision-guidelines`（manual reference）に従ってDecision判断を記録する（Decisionファイル作成は Definition 保存内部責務、case-ready / case-revise の Capability Skill 委譲で実行）。

### Input Resolution

1. SSoT 再構成: 既存Decision（`docs/decisions/`）
2. identifier 保持: Decision番号指定形式 `new:{topic-slug}`
3. 最小 scalar: なし
4. runtime artifact: draft-data 下書き

### Preconditions

- STEP-4 の要件展開が完了している

### Procedure

`agentdev-decision-guidelines`（manual reference）に従ってDecision判断を記録する。
各副ステップ（既存Decision重複確認、Decision禁止ゲート、判断根拠記録、作業手段Decision拒否ゲート、Decision番号指定形式 `new:{topic-slug}`）の詳細、委譲接続点は `agentdev-req-analysis` を参照。

### Result

- Decision判断記録（`new:{topic-slug}` 形式、判断根拠）

### Evidence

- 重複確認結果、禁止ゲート判定、判断根拠の記録

### Completion Verification

- Decision候補が全て重複確認・禁止ゲート判定を経ており、番号指定形式が正しいこと

### Resume-Idempotency

- 記録は draft-data 下書きへ反映する。ファイル作成は行わないため副作用を持たない

## 関連 STEP

- 前: STEP-2（input-and-dialogue.md）
- 次: STEP-6（draft-generation.md）

## 関連 Capability Skill

- `agentdev-req-file-manager`: 照合方法論
- `agentdev-req-analysis`: 分析観点、detailed gates
- `agentdev-architecture-advisory`: Decision要否確認ゲートの助言委譲
- `agentdev-decision-guidelines`: Decision判断基準

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（docs/ 配下の広範な探索禁止、限定探索は許可）
- 不変条件（Decision閾値以上の判断は `agentdev-decision-guidelines` へ）
- 不変条件（Design 分離基準該当行の `artifact_actions` 分離）
- 不変条件（アーキテクチャ助言サブエージェントの参照と未確認事項非混入）
- 不変条件（test strategy 3要素完全、欠落時は QG-1 fail 扱い）
- 不変条件（変更誘発境界リスク分析の省略禁止。リスク導出規則不在時は ADF core の一般規則のみで 5観点境界分析を実行する）
- 不変条件（case-specific risk の test strategy 投影。投影完全性の検査は QG-1 が担い、本工程は投影の実施のみを行う）
- 不変条件（test strategy 定義時の検証手段の質基準適用。質基準の正本は `agentdev-req-analysis` の analysis-viewpoints reference、完了時点の証跡契約を正規所有する要件群が正規所有するため複製しない）

## Jev 先行評価の逐次経路（REQ-{NNNN}、DEC-{NNN}）

閉じた意味判断ごとに、次の逐次経路を実行できる。Jev は最終判断者ではなく、後段の LLM 推論への追加情報として扱う（Stage 1: 観測可能化）。

1. **Jev 先行評価**: Custom Tool `agentdev_jev` の `evaluate` に、本 Workflow が構成した閉じた判断入力（state、指示、基準、質問群。日本語。repository 全文を渡さない）を渡す
2. **LLM 推論**: Jev 結果と confidence を情報として含み、従来の判断材料（既存 REQ/Decision/Design の照合結果、分類ゲート群の出力、Decision 判断基準）も参照して推論する。Jev 結果だけで判断しない
3. **LLM 最終判断**: 従来経路と同一の判断基準で最終判断を確定する。Jev 結果・confidence は最終判断を確定させない
4. **unchanged/corrected 記録**: Jev 結果に対して LLM が判断を変更しなかったか（unchanged）/変更したか（corrected）を観測事実として記録する。評価カテゴリを混入させない

共通契約:

- 利用可否は `AI_GATEWAY_API_KEY` の設定有無で決まる（デフォルト有効、feature flag や opt-in 手続きは不要）。未設定時は呼び出さず `not_configured` を観測に記録し、従来 LLM 経路のみで本 Workflow を完了する
- Jev API 失敗（timeout、429、5xx、network error、response validation error）時は自動 retry せず即座に従来 LLM 経路へ fallback し、失敗分類を観測に記録する。正規状態を破損しない
- 観測は 1 Workflow 実行 = 1 JSON で `.agentdev/jev-observations/` に保存する（`agentdev_jev` の `observation_write`）。判断単位の confidence と llm_treatment は独立した一次観測値とし、閾値依存の分類結果を含めない。観測書込み失敗時は本 Workflow の success を維持し、完了報告に識別可能な warning を明示する。rollback・再実行・擬似再生成を行わない
- 再構成可能な判断入力は判断入力全文を保存せず、評価リクエストの digest と参照で保持する。再構成不能な入力のみ最小 snapshot を渡す
- 操作契約（入力、出力、失敗分類）の正は `docs/designs/responsibilities/custom-tool-contracts.md`「Jev 先行評価」節である

適用位置: STEP-3 の既存REQ照合、STEP-4 の要件展開（最終分類・Design 分離）に適用する。壁打ち対話（STEP-2）とユーザー承認境界へは適用しない。

初期割当て（適用対象19件のうち本 Workflow が所有する2件）:

| 判断単位 | 質問形式 |
|---|---|
| 既存REQ照合判断（CREATE/ APPEND/ UPDATE の帰属） | choice（CREATE・APPEND・UPDATE・REQ操作なし）+ boolean（照合確信の要否） |
| 要件展開の最終分類・Design 分離（分類ゲート群の確定） | choice（REQ 行・Design 行の帰属）+ boolean（分離要否） |

choice 形式質問の候補完備性規約（REQ-{NNNN}-{NNN}）:

choice 形式質問を構成する際は、次の規約に従う。

- **正解クラス網羅**: 正解となり得る操作クラス（REQ 操作なし等の非操作正解クラスを含む）を候補集合が網羅するように構成する。正解となり得るクラスを候補に含めないまま質問を確定しない
- **NULL 候補の明示判断**: NULL 候補（該当なし等）を候補集合へ含めるか否かを質問構成時に明示判断する。含めないと判断した場合はその判断を明示して質問を確定する。要否を暗黙に決めない
- **候補欠落由来是正の分類**: 候補集合の欠落に由来する判断是正（最近似候補への高確率張り付きと LLM 是正の組合せ）は質問構成側の欠陥として分類し、判断器精度の劣化要因として集計しない。unchanged/corrected 記録時に候補構造欠落由来と判明した是正は、判断器精度評価の集計から除外する

本 Workflow の初期割当てへの適用: 既存REQ照合判断の choice 候補に「REQ操作なし」系正解クラス（CREATE・APPEND・UPDATE のいずれにも該当しない帰属）を含める。閉じた判断として全入力が4クラスのいずれかに帰属すると構成時に判定したため、NULL 候補は含めない。

適用可否を本 Case 内で確定した判断（REQ-{NNNN}-{NNN}）:

- **Decision 要否判断群（STEP-5。`agentdev-decision-guidelines` 判断基準の適用と Decision 候補の重複確認・禁止ゲート判定）: Jev を適用しない。**
  理由: Decision 要否判断は Decision 禁止ゲートの判定（仕様変更のみ・workflow 定義・運用ルール等の該当可否）と既存 Decision の重複確認という判定表適用が主であり、かつ判断結論が Decision 正規成果物の作成可否（case-ready STEP-3 受理評価の入力）へ直接投影される。req-define はユーザー合意形成（壁打ち対話）を前提とする workflow であり、合意前に確率情報（confidence）を判断材料へ混入させると合意形成の主体性を損なうおそれがある。本判断群は Stage 1 では現行経路（判定表適用と architecture-advisory 委譲）のみで維持し、将来の適用は観測結果（Issue B）と別 Decision を前提に再評価する。

