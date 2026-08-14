---
description: 要件を整理、定義する（機能追加、バグ修正共通）
---

# 要件定義

機能追加またはバグ修正の要件を整理、定義する。
壁打ちフェーズで使用。

## 入力

- ユーザーの自然言語による機能追加/バグ修正の説明
- GitHub Issue URL（既存Issueの場合）
- エラーログ（バグ修正の場合）
- **ユーザーが明示した入力ファイル**: 設計メモ、調査メモ、RU（`.agentdev/backlog/req-units/RU-*.md`）等。全て参照専用入力（G04）
- req-save SPLIT 検出時の検出事項（`.agentdev/drafts/requirements-review-finding-{topic-slug}.md`）
- inspect-skills 診断結果の検出事項（`.agentdev/inspect/inbox/inspect-skills-finding-{topic-slug}.md`）。参照専用入力として扱い、未確認事項、採否未確定事項を要件本文に混入させない（inspect lifecycle、-151 相当）
- **promoted 直読み禁止**: `.agentdev/intake/promoted/` 及び `.agentdev/learning/promoted/` は直接読み込まない。backlog-review による RU 化を経由すること

## 出力

- `.agentdev/drafts/req-draft-{topic-slug}.md`（全 work_type 共通、構造化 `draft-data` 形式）

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/req-define.yaml`）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## session由来RU 消費契約（参照）

`source_type: chat` かつ `generated_by: session` のRU（session由来RU）を受領した場合、一時成果物ライフサイクル要件と artifact-contracts SPEC「RU アーティファクト契約（session由来RU）」セクションを正規原本として `logical_key` によるRU案特定、`session:...` 論理URI の非解決、必須8セクション読み取り契約、`tentative_classification` → 最終分類の扱いを扱う。本コマンドは同契約を再定義せず、各項目の判定基準、検証観点は正規原本（一時成果物ライフサイクル要件 + artifact-contracts SPEC）へ委譲する

## 手順

### Step 1: セッションコンテキスト検知（引数なし単体実行時のみ）

`agentdev-req-analysis` に従い、当該セッション履歴・現在コンテキストから6項目（要件内容、work_type、scale、Decision、構造化、適用範囲）を推論し信頼度付きで表示。Confirmed のみで要件doc自足可能なら Step 3 以降へ、部分的不足で補足質問解消可能なら壁打ち（Step 3）へ、有効な Requirement Source 構成不能なら Step 2（RU 自動検出）へ。引数ありの場合は Step 2 から開始

### Step 2: 明示入力ファイルの読み込み（指定時）

Read tool で読み込み、壁打ちの初期コンテキストとして扱う。
複数ファイル指定時は全て読み込む。
引数なしの場合で、かつ Step 1 でセッション履歴、現在コンテキストから有効な Requirement Source を構成できなかった場合のみ、`.agentdev/backlog/req-units/RU-*.md` の存在を確認し1件なら自動検出。
0件なら Step 3 へ。
2件以上なら候補一覧を表示し自動選択しない。
セッション履歴、現在コンテキストおよび RU のいずれからも有効な入力を構成できない場合、壁打ち対話を開始する

  **2-1. session由来RU 受領時**: 読み込んだRU が `source_type: chat`、`generated_by: session` の場合、「session由来RU 消費契約（参照）」セクションに従う。`session:...` 論理URI の解決、必須8セクション読み取り契約、`tentative_classification` → 最終分類の扱いは正規原本（一時成果物ライフサイクル要件、artifact-contracts SPEC）へ委譲する

### Step 3: 壁打ち対話

`agentdev-req-analysis` に従って深掘り。明示入力ファイルがある場合、その内容を開始点として活用

 **3-1. 前工程からの引き継ぎ判定**: 入力が AgentDevFlow 本体、配布 command、配布 skill、配布 template、配布 script の不具合または改善点を対象とする場合、`agentdev-workflow-lifecycle` に従い前工程からの引き継ぎ用 RU 入力として整理する。現在プロジェクトの通常要件docとして定義せず、出力に `agentdev_handoff: true` を含める

### Step 4: 既存REQ照合

`agentdev-req-file-manager` の照合方法論に従って実行。
CREATE 前に APPEND/UPDATE 候補を必ず評価すること。
要件の分割が必要な場合は保存操作ではなく requirements review 候補として扱うこと。
操作分類結果は `draft-data` の `artifact_actions` に記録

 **4-1. 定量的データ検証**: `glob docs/requirements/<REQ-*>.md`（および副次的に `glob docs/decisions/<DEC-*>.md`）で実ファイル列挙と AGENTS.md 等の文書記載レンジとの乖離を確認・解消する。詳細は `agentdev-req-analysis` を参照

 **4-2. SPLIT 予兆計測（既存REQ）**: APPEND/UPDATE 対象の既存 REQ の健全性メトリクス（要件行数、関心分類数、成果物種別数）を計測し、req-health-metrics SPEC（extension 経由）の定量閾値で SPLIT シグナルを算出。合計 2 以上の場合、APPEND 実施前にユーザーへ SPLIT 要否を提案。計測対象は当該 REQ の要件テーブル行（`^| REQ-NNNN-MMM |`）。閾値、計算式の詳細は `agentdev-req-analysis` を参照

### Step 5: 要件展開

`agentdev-req-analysis` の分析観点に従って網羅。詳細ゲート、委譲接続点は `agentdev-req-analysis` の各 Phase を参照:

- **5-1. 変更影響候補抽出**: 変更影響候補を抽出しドラフトに保持。RU からの対象領域キーワード抽出、glob/grep での関連 REQ/Decision/SPEC 事前特定、サブエージェント調査委譲への調査優先対象リスト（ヒント）構築、実ファイル完全列挙の維持。詳細は `agentdev-req-analysis`「調査スコープ洗練手順」参照
- **5-2. 分類ゲート（REQ 最終分類確定）**: 各要件行候補を「変更後仕様」/「反映作業」に分類。REQ/SPEC 境界判定を行い SPEC 保存対象を `artifact_actions`（`artifact: spec`）に分離。RU 暫定分類（`tentative_classification`）があれば document-model SPEC（extension 経由）の文書7分類モデルへ照らして最終分類を確定し上書き
- **5-3. 文書分類妥当性検証**: REQ 要件行に SPEC 分離基準違反残留がないか検出。検出時は SPEC 保存対象へ移送（安定契約例外は対象外）
- **5-4. Decision要否確認ゲート**: Decision候補・既存REQ/Decision/SPEC との衝突候補・責務境界変更を含む場合、`agentdev-architecture-advisory` へ委譲。出力は 4 ラベル構造（確定事項/推定事項/ユーザー確認事項/ブロッカー）。soft-contract（Decision）。ブロッカーまたは未決事項残存時は壁打ち（Step 3）へ差し戻し
- **5-5. 実行主体分類表（REQ）**: 委譲契約を定義する場合、各委譲について実行主体分類表（adapter skill / command / subagent / harness）を必須。詳細は delegation-contracts SPEC（extension 経由）参照。委譲を含まない要件では省略可
- **5-6. test strategy 定義（REQ, REQ）**: 各合意項目（AG-*）の検証方法を test strategy として定義。3要素構造（`verification` / `pass_criteria` / `on_failure`）を必須とし、`on_failure` を持たない検証項目は含めない。項目識別子は `TS-NNN`、`on_failure` アクション種別は `fix-and-reverify` / `record-in-findings` の2値。シリアライズ形式の詳細は req-define command SPEC（extension 経由）の draft-data test_strategy フィールドスキーマ参照

### Step 6: Decision判断

`agentdev-decision-guidelines`（manual reference）に従ってDecision判断を記録（Decisionファイル作成は req-save で実行）。各副ステップ（6-1: 既存Decision重複確認、6-2: Decision禁止ゲート、6-3: 判断根拠記録、6-4: 作業手段Decision拒否ゲート、6-5: Decision番号指定形式 `new:{topic-slug}`）の詳細、委譲接続点は `agentdev-req-analysis` を参照

### Step 7: 要件doc生成

テンプレート: `.opencode/commands/agentdev/templates/req-define/req-draft.md` を Read → 構造化 `draft-data` 形式に従って生成。原本は構造化された `# draft-data` fenced YAML block。Step 6-2/5-3 で分離した SPEC 候補は `artifact_actions`（`artifact: spec`）として統合し `## SPEC候補` 補助セクションは出力しない。保存対象は単一の `artifact_actions` 配列に統合する

各副ステップ（7-1: 定義完全性ゲート QG-{N}、7-2: operation_units 生成、7-2a: depends_on/recommended_order 定義、7-3: artifact_actions 生成、7-3a: target_area/content 形式、7-3b: SPEC action 分類根拠出力、7-4: test_strategy 生成、7-5: review_dispositions 生成）の詳細、フィールドスキーマ、委譲接続点は `agentdev-req-analysis` の req-define detailed gates、および req-define command SPEC（extension 経由）の各フィールドスキーマを参照。`target_spec`、`spec_logical_division`、`canonical_owner`、`on_failure`、`review_dispositions` の出力形式も同 SPEC を正とする

### Step 8: work_type 判定

ラベルに基づき4値分類（bugfix/feature/maintenance/docs_chore）。bugfix + Decision必要時は feature に昇格

### Step 9: Scale判断（feature のみ）

`agentdev-workflow-lifecycle` で standard/large を判定。large 時はユーザーと分解計画を協議。9-1 実装スコープシグナル確認（ドラフト内に修正候補リスト、検出事項カタログ、影響ファイル一覧等の実装詳細セクション存在時に large 昇格判定、昇格理由をユーザー提示）の詳細は `agentdev-workflow-lifecycle` を参照

### adversarial-review 挿入境界（経路A、REQ-{NNNN}-{NNN}）

Step 9（Scale判断: feature）または Step 8（work_type 判定: feature 以外）完了後、Step 10（ドラフト保存）の前に挿入する。req-define は adversarial-review を原則実行する（default-on、REQ-{NNNN}-{NNN}）。発動条件判定と review 呼出を分離する（REQ-{NNNN}-{NNN}）。

- **発動条件判定（REQ-{NNNN}-{NNN}、REQ-{NNNN}-{NNN}）**: default-on で発動する。skip 条件（Scale=L0 で Decision判断対象なし、意味的決定なし）該当時は省略して従来フロー（review を挿入せず Step 10 へ進む）を継続できる（REQ-{NNNN}-{NNN}）。ユーザー明示指定時は skip 条件にかかわらず必ず発動する（REQ-{NNNN}-{NNN}）。skip 判断のためだけの新規 HITL、承認点は追加しない。
- **review 呼出（REQ-{NNNN}-{NNN}）**: 発動条件判定で発動と判定された場合、要件候補（draft-data、`agreed_items`、`artifact_actions`、Decision判断結果、Scale判断結果）を対象に adversarial-review を呼び出す。委譲契約は delegation-contracts SPEC（extension 経由）「adversarial-review との委譲契約接続」節に従う。
  - Decision finding は Step 6（Decision判断）へ戻し再評価する。要件展開に関わる finding は該当 Step へ戻す。accepted finding の反映は呼出元の責務である（REQ-{NNNN}-{NNN}）。
  - 未解決のユーザー判断事項が残る場合、Step 10（ドラフト保存）へ進まない（REQ-{NNNN}-{NNN}）。工程委譲起源であるため既存 status に unresolved 判断事項を付加する（REQ-{NNNN}-{NNN}）。
  - 呼出失敗時は silent skip を禁止し、従来フローを維持する（REQ-{NNNN}-{NNN}）。

詳細な挿入境界は req-define command SPEC（extension 経由）「adversarial-review 挿入境界（経路A）」節を正とする。

### Step 10: ドラフト保存

全 work_type（feature/ bugfix/ maintenance/ docs_chore）で `.agentdev/drafts/req-draft-{topic-slug}.md` に保存。Step 7 の構造化 `draft-data` 形式（`# draft-data` fenced YAML block）で保存する。標準データモデル fields（`work_type`, `scale`, `summary`, `auto_gate`, `agreed_items`, `artifact_actions`, `conflict_resolutions`, `operation_units`, `test_strategy`, `review_dispositions`, `case_open_hints`）を保持する。`workflow_route` は派生値として保存しない。後続工程の分岐は `artifact_actions` の存在で決定する（`artifact: req`/`adr` → req-save、`artifact: spec` → spec-save）。`operation_units` を含め、`execution_groups` は出力しない。`summary` 等の人間可読セクションは補助的であり下流処理の正として扱われない

各副ステップ（10-1: 実装詳細の分離、10-2: auto_gate 完了ゲート、10-2a: 未確定内容の auto_ready 抑止）の詳細、stop_reasons 記録形式、代表 fixture、引用誤検知除外パターンは req-define command SPEC（extension 経由）「未確定内容の auto_ready 抑止」節、および `agentdev-req-analysis` の req-define detailed gates を参照

### Step 11: 要件doc確認

生成した要件docをユーザーに提示（承認は求めず提示のみ）。差し戻し時は壁打ち継続（Step 2 へ）。次コマンド実行を確定の意思表示として扱う

各副ステップ（11-1: 複数RU同時入力受付、11-2: 統合/分離判定、11-3: 操作単位ごとの出力生成、11-4: Epic 規模検出時の記録、11-5: Wave 候補/依存関係の記録、11-6: OU 構造検証）の詳細、委譲接続点は `agentdev-req-analysis` を参照。11-2 では生成ドラフト自身の健全性メトリクス（要件行数、関心分類数、成果物種別数）を計測し、req-health-metrics SPEC（extension 経由）の閾値で SPLIT シグナルを算出して合意内容に反映する（新規 CREATE ドラフトで要件行数が 51 行超の場合は SPLIT 要否をユーザーへ提案）

### Step 12: 完了報告

完了報告templateに従って出力。work_type に応じた種別を選択:
 - feature standard → .opencode/commands/agentdev/templates/req-define/feature.md
 - feature large (Epic)規模 → .opencode/commands/agentdev/templates/req-define/feature-epic.md
 - bugfix/ maintenance/ docs_chore → .opencode/commands/agentdev/templates/req-define/lightweight.md

## ガードレール

- G01: 壁打ちフェーズのみ（実装コード禁止）
- G02: 関連ドキュメントの個別ファイル列挙をユーザーに求めない
- G03: ファイル編集スコープ: `.agentdev/drafts/**` のみ作成、編集を許可
- G04: ユーザーが明示した入力ファイルは参照専用入力（変更、削除しない）。`.agentdev/backlog/req-units/RU-*.md` の削除は行わない（後続の case-open 成功後に実行）
- G05: `docs/` 配下の広範な探索禁止（例外: 明示入力ファイルと docs/requirements/\*\* の参照専用参照、Step 5-1 の限定探索は許可）
- G06: inbox.md/ deferred.md を直接ロードしない
- G07: 採用済み成果物の直読み禁止
- G08: `git` コマンドは実行しない
- G09: チェックボックスは測定可能で一意（`agentdev-req-analysis` 品質基準）
- G10: 要件doc構造は req-draft.md テンプレート（構造化 `draft-data` 形式）に従う
- G11: Decision閾値以上の判断は `agentdev-decision-guidelines` へ
- G12: work_type 判定基準は `agentdev-workflow-lifecycle` を参照
- G13: req-define は Issue 階層を決定しない。`depends_on`（必須依存のみ）は case-open が execution_unit 構成（連結成分判定）に使用する依存情報であり、最終 Issue 構成は case-open が決定する
- G14: req-define は draft に `operation_units` セクションを出力し、`execution_groups` セクションは出力しないこと（038）。単一REQ操作の場合も 1 件の OU として出力する。Epic/ Wave/ Issue 構成の生成は case-open の責務である
- G15: SPEC 分離基準に該当する要件行候選は REQ 要件行に残留させず、`draft-data` の `artifact_actions`（`artifact: spec`）へ分離すること。安定契約例外は分離対象外
- G16: Decision判断が必要な変更（Decision要否確認ゲート）では Decision 判断前に `agentdev-architecture-advisory` を参照する。アーキテクチャ助言サブエージェントは Decision 要否、推奨方向、設計リスク、根拠を返し、最終的な Decision 作成判断は親エージェントが行う
- G17: アーキテクチャ助言サブエージェントの助言は親エージェントが分類し、未確認事項を要件本文へ混入させない。同サブエージェントはファイル編集主体ではない
- G19: test strategy 項目は verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素を完全に持つこと（REQ）。on_failure（不合格時の処置）を持たない検証項目は test strategy に含めないこと（REQ）。3要素のいずれかが欠落する項目を検出した場合、保存前に QG-{N} が fail として扱う（REQ）


