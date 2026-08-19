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
- **SPLIT 予兆計測（既存REQ）**: APPEND/UPDATE 対象の既存 REQ の健全性メトリクス（要件行数、関心分類数、成果物種別数）を計測し、req-health-metrics SPEC（extension 経由）の定量閾値で SPLIT シグナルを算出する。合計 2 以上の場合、APPEND 実施前にユーザーへ SPLIT 要否を提案する。計測対象は当該 REQ の要件テーブル行（`^| REQ-NNNN-MMM |`）

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

`agentdev-req-analysis` の分析観点に従って網羅し、REQ/Decision/SPEC 境界を確定する。

### Input Resolution

1. SSoT 再構成: 関連 REQ/Decision/SPEC（glob/grep による事前特定）
2. identifier 保持: REQ-ID、RU 暫定分類
3. 最小 scalar: なし
4. runtime artifact: draft-data 下書き

### Preconditions

- STEP-3 で操作分類が確定している

### Procedure

詳細ゲート、委譲接続点は `agentdev-req-analysis` の各 Phase を参照。

- **変更影響候補抽出**: 変更影響候補を抽出しドラフトに保持する。RU からの対象領域キーワード抽出、glob/grep での関連 REQ/Decision/SPEC 事前特定、サブエージェント調査委譲への調査優先対象リスト（ヒント）構築、実ファイル完全列挙の維持（詳細は `agentdev-req-analysis`「調査スコープ洗練手順」参照）
- **分類ゲート（REQ 最終分類確定）**: 各要件行候補を「変更後仕様」/「反映作業」に分類する。REQ/SPEC 境界判定を行い SPEC 保存対象を `artifact_actions`（`artifact: spec`）に分離する。RU 暫定分類（`tentative_classification`）があれば document-model SPEC（extension 経由）の文書7分類モデルへ照らして最終分類を確定し上書きする
- **文書分類妥当性検証**: REQ 要件行に SPEC 分離基準違反残留がないか検出する。検出時は SPEC 保存対象へ移送する（安定契約例外は対象外）
- **Decision要否確認ゲート**: Decision候補・既存REQ/Decision/SPEC との衝突候補・責務境界変更を含む場合、`agentdev-architecture-advisory` へ委譲する。出力は4ラベル構造（確定事項/推定事項/ユーザー確認事項/ブロッカー）。soft-contract（Decision）。ブロッカーまたは未決事項残存時は壁打ち（STEP-2）へ差し戻す
- **実行主体分類表**: 委譲契約を定義する場合、各委譲について実行主体分類表（adapter skill / command / subagent / harness）を必須とする（詳細は delegation-contracts SPEC（extension 経由）参照。委譲を含まない要件では省略可）
- **test strategy 定義**: 各合意項目（AG-*）の検証方法を test strategy として定義する。3要素構造（`verification` / `pass_criteria` / `on_failure`）を必須とし、`on_failure` を持たない検証項目は含めない。項目識別子は `TS-NNN`、`on_failure` アクション種別は `fix-and-reverify` / `record-in-findings` の2値。シリアライズ形式の詳細は req-define command SPEC（extension 経由）の draft-data test_strategy フィールドスキーマ参照

### Result

- 変更影響候補、最終分類、SPEC 分離結果、Decision要否確認結果、test strategy 定義

### Evidence

- 影響候補リスト、分類判定根拠、助言の4ラベル構造結果、test strategy 項目

### Completion Verification

- 全要件行候補の分類が確定し、SPEC 分離基準違反残留が0件であること。test strategy 項目が全て3要素を持つこと

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
- 不変条件（SPEC 分離基準該当行の `artifact_actions` 分離）
- 不変条件（アーキテクチャ助言サブエージェントの参照と未確認事項非混入）
- 不変条件（test strategy 3要素完全、欠落時は QG-1 fail 扱い）
