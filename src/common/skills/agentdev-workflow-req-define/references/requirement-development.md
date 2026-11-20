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

- `agentdev-req-file-manager` の照合方法論に従って実行する。CREATE 前に APPEND/UPDATE 候補を必ず評価する。操作分類は要求の持続的な目的・関心と既存REQの目的・所有範囲との対応を主軸とし、作業種別・実装部品の一致・入力体裁だけでの統合判断やREQ変更要否の決定をしない。既存の要件行の規定だけで要求が成立する場合は変更不要（REQ操作なし）とし、所有先を一意に決定できない場合は保留して候補と不足を報告する（判定基準と正規情報の取得・取り扱いの詳細は `agentdev-req-file-manager` の照合方法論参照）。要件の分割が必要な場合は保存操作ではなく requirements review 候補として扱う。操作分類結果とその根拠は `draft-data` の `artifact_actions` に記録する
- **定量的データ検証**: `glob docs/requirements/<REQ-*>.md`（および副次的に `glob docs/decisions/<DEC-*>.md`）で実ファイル列挙と AGENTS.md 等の文書記載レンジとの乖離を確認する。実行側で解消できる乖離（列挙手段の過不足等）は解消する。正規情報の取得異常（インデックス掲載 REQ の実ファイル不在など、実行側で解消できない乖離）は解消対象とせず、`agentdev-req-file-manager` 照合方法論「正規情報の取得と取り扱い」の保留規律（取得失敗が照合・操作分類の判断に必要な場合の操作分類確定禁止・補完禁止）に従って候補と不足している判断材料を報告する（詳細は `agentdev-req-analysis` 参照）
- **SPLIT 予兆計測（既存REQ）**: APPEND/UPDATE 対象の既存 REQ の健全性メトリクス（要件行数、関心分類数、成果物種別数）を計測し、`agentdev-req-structure-diagnostics` の SPLIT 定量閾値で SPLIT シグナルを算出する。合計 2 以上の場合、APPEND 実施前にユーザーへ SPLIT 要否を提案する。計測対象は当該 REQ の要件テーブル行（`^| REQ-NNNN-MMM |`）

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
- **調査委譲の全文抽出・引き継ぎ規律**: 調査対象ファイルの全文は既存の機械的手段で取得し、モデルに逐語再生成させない。取得物への参照と、モデルによる判断・要約を分ける。取得物は後続担当が実際に読める形で委譲先へ引き継ぎ、取得不能、切断、文字化けを完全な抽出として扱わない。引き渡し形式の詳細は `agentdev-req-analysis`「サブエージェント調査委譲スコープ絞り込み」参照
- **調査委譲の並列化と待機規律**: 独立した調査・評価だけ並列化する。調査結果を入力とする評価（分類ゲート群、Decision要否確認等）は、入力となる調査結果の確定を待って開始する。抽出・書込み等の前提が満たせない状態を、対象なし、成功、評価不要として扱わない
- **分類ゲート（REQ 最終分類確定）**: 各要件行候補を「変更後仕様」/「反映作業」に分類する。REQ/Design 境界判定を行い Design 保存対象を `artifact_actions`（`artifact: design`）に分離する。RU 暫定分類（`tentative_classification`）があれば document-model Design（extension 経由）の文書7分類モデルへ照らして最終分類を確定し上書きする。分類判定の単位はファイル全体ではなく記述単位とし、判定単位が記述単位か（ファイル全体・文書種別単位の判定結果を記述単位判定に還元して説明できるか）、対象記述の寿命区分は何か（恒久契約・期間限定契約・一時監査・移行作業・履歴記録の別）の2項目を、分類・適用範囲・ID表記の横断適用（関連文書と req-define 判断入口の一致）の一部として判定し、判定結果を分類根拠の引き継ぎに含める。既存の文書種別責務（Knowledge の環境知識・作業記録、guide の手順、Report 等の非規範情報）に整合する記述は、分類不能を理由に REQ へ誘導しない
- **design 対応事前確認**: 変更対象のうち既存 REQ 行の意味変更を含む場合、`agentdev-traceability` の coverage --req により当該行の design 対応有無を事前確認する。design 対応が欠落する意味変更行を検出した場合は、当該行の design 対応を `artifact_actions`（`artifact: design`）へ組込む。本確認は STEP-6 の生成手順（draft-generation.md の design 対応事前確認）へ引き継がれる前段の確認であり、後段の case-ready lifecycle gate completeness（fail-closed）での停止を予防する位置づけである（正規所有は case-open Design「意味変更行の design 対応事前確認」節）
- **文書分類妥当性検証**: REQ 要件行に Design 分離基準違反残留がないか検出する。検出時は Design 保存対象へ移送する（安定契約例外は対象外）。具体名・パス・値の存在だけでは内部詳細と判定せず、公開入口、対応対象、安全境界、安定外部契約に該当する記述は具体名を含めた要約として REQ に残す。成果を保証する記述と既定の手段を記す記述が同一行に混在する場合、成果・制約のみを REQ に残し、具体コマンド、検索引数の使用手順、実行方法を既存 Design または配布参照文書へ分離する。分離先として Knowledge 文書を選択しない（Knowledge は規範の所有先ではなく、非規範的な環境知識・作業知識・観測の記録の配置先である）
- **Decision要否確認ゲート**: Decision候補・既存REQ/Decision/Design との衝突候補・責務境界変更を含む場合、`agentdev-architecture-advisory` へ委譲する。出力は4ラベル構造（確定事項/推定事項/ユーザー確認事項/ブロッカー）。soft-contract（Decision）。ブロッカーまたは未決事項残存時は壁打ち（STEP-2）へ差し戻す
- **実行主体分類表**: 委譲契約を定義する場合、各委譲について実行主体分類表（adapter skill / command / subagent / harness）を必須とする（詳細は delegation-contracts Design（extension 経由）参照。委譲を含まない要件では省略可）
- **変更誘発境界リスク分析**: `agentdev-req-analysis` の「変更誘発境界リスク分析」観点に従い、変更差分から dependency boundary、client/server boundary、execution boundary、build/runtime boundary、environment propagation boundary の 5観点境界について case-specific risk を導出する。project 固有のリスク導出規則を参照する場合、docs/knowledge/ を正規知識領域とし、利用可能なハーネスの探索能力を通じて関連知識を検索する（Project Knowledge の所有と workflow 利用の要件が正規所有する利用契約に従う）。知識が不在の場合は ADF core の一般規則のみで 5観点境界分析を実行する（分析を省略しない）。導出した case-specific risk は検証契約へ投影する。変換経路は change → risk → verification obligation → test strategy とし、投影先は test strategy、投影完全性の検査は QG-1（リスク→test strategy 投影完全性検査）が担う
- **test strategy 定義**: 各合意項目（AG-*）の検証方法を test strategy として定義する。3要素構造（`verification` / `pass_criteria` / `on_failure`）を必須とし、`on_failure` を持たない検証項目は含めない。項目識別子は `TS-NNN`、`on_failure` アクション種別は `fix-and-reverify` / `record-in-findings` の2値。シリアライズ形式の詳細は req-define command Design（extension 経由）の draft-data test_strategy フィールドスキーマ参照。導出済み case-specific risk から検証義務（verification obligation）を導き、test strategy 項目へ投影する（change → risk → verification obligation → test strategy）。選択した検証手段の質は `agentdev-req-analysis` の「検証手段の質基準」観点（production-equivalent verification、正本は analysis-viewpoints reference）に従い判定する。完了時点の証跡契約を正規所有する要件群が正規所有するため、本工程では複製せず参照に留める
- **検索系検証の網羅範囲・修正対象列挙一致確認**: test strategy 項目に検索系検証（rg 等）を定義する際、検証コマンドの網羅範囲（対象パス・パターン）と修正対象列挙（変更対象ファイル集合）の一致を確認する。See Also 等の参照行は修正対象ではないため、網羅範囲から除外するか、検索に含める場合は参照行を検出対象外とする扱いを明示する。本確認は既存の test strategy 定義義務（3要素構造、case-specific risk 投影、検証手段の質基準適用）への追加であり、既存手順を置換するものではない
- **REQ 新設時の検証対応 3 段確認**: REQ 新設（CREATE）を伴う要件展開では、新設する各要件行について 3 段で確認する。(1) 要件行の命題: 達成状態が判定可能な文として要件行が書けているか、(2) 実装実体の所在: 行の達成を担う実装・文書の実体が特定できるか、(3) 検証手段: 検証方法と合格条件を定義できるか。verification 対応を任意とする行の検証スコープ判断（トレーサビリティポリシーへの登録要否、恒常検証手段の割当）はこの 3 段確認の中で確定し、判断結果を draft へ反映する（REQ 新設時の検証スコープ登録判断を要件展開に含め判断結果を draft へ反映する既存契約の適用手順）。3 段の確認を後工程へ先送りせず、要件展開内で完了する
- **REQ 行廃止・移管時の参照残存確認**: REQ 行の廃止・他 REQ への移管・retired 化を伴う場合、廃止・移管対象の旧行 ID を指す参照の残存を機械的検索（rg 等）で確認し、結果と残存参照の処置を `artifact_actions` に記録する。検索範囲は docs/ 全体、repository top-level `traceability/` 配下の sidecar、`.agentdev/extensions/skills/*.yaml` の ADF-COVERS 宣言を含む網羅範囲とする。`docs/reports/` 配下は履歴記録領域として参照残存の検出対象から除外する（歴史記録は是正対象外。除外の正規根拠は checker 実行契約 Design「検出対象除外規定」）

### Result

- 変更影響候補、最終分類、Design 分離結果、Decision要否確認結果、case-specific risk 導出結果（5観点境界の確認記録を含む）、test strategy 定義

### Evidence

- 影響候補リスト、分類判定根拠、助言の4ラベル構造結果、case-specific risk 記録（導出有無と5観点確認の記録）、test strategy 項目、検索系検証の一致確認結果（該当時）

### Completion Verification

- 全要件行候補の分類が確定し、Design 分離基準違反残留が0件であること。5観点境界の確認が実施済みであり、導出済み case-specific risk が test strategy へ投影済みであること（投影完全性は QG-1 が検査）。test strategy 項目が全て3要素を持つこと。検索系検証（rg 等）を含む test strategy 項目がある場合、網羅範囲と修正対象列挙の一致確認が実施済みであること。REQ 行の廃止・移管を伴う場合、旧行 ID を指す参照の残存確認（docs/・sidecar・extensions yaml 網羅。docs/reports/ は履歴記録領域として対象外）が実施済みであること。既存行の意味変更を含む場合、design 対応事前確認（coverage --req 実査・欠落時 artifact_actions 組込み）が実施済みであること。サブエージェント調査委譲を実施した場合、全文抽出が機械的手段によるものであり、取得物が委譲先へ引き継がれていること

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
- 不変条件（調査対象全文の機械的抽出、モデル逐語再生成の禁止、取得物の引き継ぎ。手段の具体は実行基盤側に委譲）
- 不変条件（独立した調査・評価だけの並列化。調査結果を入力とする評価の依存待機）
