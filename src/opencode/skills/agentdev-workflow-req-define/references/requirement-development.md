# STEP-3/4/5: 既存REQ照合・要件展開・Decision判断（requirement-development）

<!-- ADF-COVERS(implementation): REQ-055-001, REQ-055-002 -->

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
- **文書分類妥当性検証**: REQ 要件行に Design 分離基準違反残留がないか検出する。検出時は Design 保存対象へ移送する（安定契約例外は対象外）
- **Decision要否確認ゲート**: Decision候補・既存REQ/Decision/Design との衝突候補・責務境界変更を含む場合、`agentdev-architecture-advisory` へ委譲する。出力は4ラベル構造（確定事項/推定事項/ユーザー確認事項/ブロッカー）。soft-contract（Decision）。ブロッカーまたは未決事項残存時は壁打ち（STEP-2）へ差し戻す
- **実行主体分類表**: 委譲契約を定義する場合、各委譲について実行主体分類表（adapter skill / command / subagent / harness）を必須とする（詳細は delegation-contracts Design（extension 経由）参照。委譲を含まない要件では省略可）
- **評価契約確定（実証Case時）**: 実証Caseとして確定した場合、実証開始前に評価契約の構成要素を必要に応じて壁打ちで確定する。構成要素は評価対象・仮説、比較対象、比較条件、評価方法、評価観点、評価シナリオ、測定・観察項目、判定基準、必要証拠、採用条件、不採用条件、判定不能条件、中止条件、再実行条件、比較条件逸脱時の扱いとする。詳細は req-define command Design（extension 経由）「実証Case判定と評価契約」参照
- **評価契約の変更管理**: 実証開始後、実行側の自律判断で評価契約を変更しない。ユーザーが評価契約の変更を明示的に指示した場合のみ変更でき、変更内容、変更理由、既存評価結果への影響を追跡可能にし、影響する既存評価について必要な再評価または再実行を行い、変更前の契約と結果を失わない。実証全体の最終完了後は当該実証の評価契約および最終結果を書き換えない。完了後に異なる条件で評価する場合は新しい実証として扱う
- **変更誘発境界リスク分析**: `agentdev-req-analysis` の「変更誘発境界リスク分析」観点に従い、変更差分から dependency boundary、client/server boundary、execution boundary、build/runtime boundary、environment propagation boundary の 5観点境界について case-specific risk を導出する。project 固有のリスク導出規則を参照する場合、extension 読込経路（配布成果物の責務境界の要件が正規所有する読込契約、`agentdev-project-extensions` が実行時参照先）に従い、知識が不在の場合は ADF core の一般規則のみで 5観点境界分析を実行する（分析を省略しない）。導出した case-specific risk は検証契約へ投影する。変換経路は change → risk → verification obligation → test strategy とし、投影先は test strategy、投影完全性の検査は QG-1（リスク→test strategy 投影完全性検査）が担う
- **test strategy 定義**: 各合意項目（AG-*）の検証方法を test strategy として定義する。3要素構造（`verification` / `pass_criteria` / `on_failure`）を必須とし、`on_failure` を持たない検証項目は含めない。項目識別子は `TS-NNN`、`on_failure` アクション種別は `fix-and-reverify` / `record-in-findings` の2値。シリアライズ形式の詳細は req-define command Design（extension 経由）の draft-data test_strategy フィールドスキーマ参照。test strategy と評価契約は分離する。test strategy は実証手段・計測手段・実証環境が正常に動作したかを扱い、評価契約は評価対象から得られた結果と採否を扱う。評価対象が採用基準を満たさなかったことを実装不具合として自動修正しない。導出済み case-specific risk から検証義務（verification obligation）を導き、test strategy 項目へ投影する（change → risk → verification obligation → test strategy）。選択した検証手段の質は `agentdev-req-analysis` の「検証手段の質基準」観点（production-equivalent verification、正本は analysis-viewpoints reference）に従い判定する。完了時点の証跡契約は REQ-007-006〜009 が正規所有するため、本工程では複製せず参照に留める

### Result

- 変更影響候補、最終分類、Design 分離結果、Decision要否確認結果、case-specific risk 導出結果（5観点境界の確認記録を含む）、test strategy 定義、評価契約（実証Case時）

### Evidence

- 影響候補リスト、分類判定根拠、助言の4ラベル構造結果、case-specific risk 記録（導出有無と5観点確認の記録）、test strategy 項目、評価契約の構成要素確定結果（実証Case時）

### Completion Verification

- 全要件行候補の分類が確定し、Design 分離基準違反残留が0件であること。5観点境界の確認が実施済みであり、導出済み case-specific risk が test strategy へ投影済みであること（投影完全性は QG-1 が検査）。test strategy 項目が全て3要素を持つこと。実証Case時は評価契約が実証開始前に確定していること

### Resume-Idempotency

- 判定結果は draft-data 下書きへ反映する。再開時は下書きの確定済み分類を再評価しない

## STEP-5: Decision判断

### Purpose

`agentdev-decision-guidelines`（manual reference）に従ってDecision判断を記録する（Decisionファイル作成は req-save で実行）。

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
- 不変条件（評価契約と test strategy の分離、評価対象が採用基準を満たさなかったことの実装不具合としての自動修正禁止）
- 不変条件（変更誘発境界リスク分析の省略禁止。リスク導出規則不在時は ADF core の一般規則のみで 5観点境界分析を実行する）
- 不変条件（case-specific risk の test strategy 投影。投影完全性の検査は QG-1 が担い、本工程は投影の実施のみを行う）
- 不変条件（test strategy 定義時の検証手段の質基準適用。質基準の正本は `agentdev-req-analysis` の analysis-viewpoints reference、完了時点の証跡契約は REQ-007-006〜009 が正規所有するため複製しない）
