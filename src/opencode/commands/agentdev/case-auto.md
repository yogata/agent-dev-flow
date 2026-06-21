---
description: req-save→spec-save→case-open→case-run→case-closeを順次自走実行する（明示指定時のみ）
agent: sisyphus
---

# 最大自走モード

要件docから req-save → spec-save → case-open → case-run → case-close を順次実行し、repo内変更に限りマージまで自走する。標準ワークフローの置き換えではなく、ユーザーが明示的に指定した場合のみ使用する追加入口である。

## 入力

- Issue番号（数値）または Issue URL: 既存Issue から case-run → case-close を自走する場合
- 要件doc: 明示パス指定/ `.agentdev/drafts/req-draft-*.md` 単一自動検出/ セッション内要件doc（3段階優先順位・構造化 `draft-data` 形式）

## 出力

- REQ/ADR artifact_actions がある場合: REQ/ADRファイル + GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み
- artifact_actions に応じた各工程の出力（工程分岐は Step 3 参照）

## 手順

1. **入力解決**:
 - **実行開始時刻の記録**: 本 Step の冒頭（入力解決の最初の処理）で、case-auto の実行開始時刻を JST（Etc/GMT-9）・人間が読みやすい形式（例: `2026-06-21 15:30:00 JST`）で記録し、変数（`case_auto_started_at`）に保持する。この時刻は Step 7（停止時報告）および Step 8（完了報告）での所要時間算出の基準として使用する
 - **Issue番号/URL入力モード**: 引数が数値のみまたは GitHub Issue URL の場合、Issue番号として解決し case-run移行モードへ分岐する（Step 3 の Issue番号/URL入力分岐へ）。この場合、要件docの入力解決・work_type読取はスキップする
 - **要件doc入力モード**: 明示パス→draft検出（複数件含む全件処理対象）→セッション内要件docの順で入力を特定する。`.agentdev/drafts/req-draft-*.md` が2件以上存在する場合、全draftを処理対象として検出し、各draftの `operation_units` から `recommended_order` と `depends_on` に基づいて全OUの処理順序を決定する。不明時は停止しreq-define実行またはパス指定を求める
2. **work_type 読取**: 入力要件docの `draft-data` から work_type を取得する（参考情報・パイプライン分岐の判定には使用しない）
3. **工程分岐**（`work_type` 固定分岐ではなく `artifact_actions` 存在による動的判定）:
 - **Issue番号/URL入力**: case-run → case-close（req-save・spec-save・case-open・work_type読取をスキップ）。Step 1 で解決した Issue番号/URL を case-run（task()）にそのまま渡す。draft-data の読み取りを行わない
 - **artifact_actions ベース分岐**: `draft-data` の `artifact_actions` を読み取り以下の工程を動的判定する:
 - `artifact: req` または `artifact: adr` の entry が含まれる場合 → req-save を実行
 - `artifact: spec` の entry が含まれる場合 → spec-save を実行（req-save の後）
 - 常に → case-open を実行（req-save/ spec-save の有無にかかわらず）
 - その後 → case-run → case-close
 - **spec-save 実行判定**: req-save 完了後に `draft-data` の `artifact_actions` から `artifact: spec` entry を確認する:
 - `artifact: spec` entry が存在し空でない場合 → spec-save を実行（SPEC保存対象を `docs/specs/` へ保存）
 - `artifact: spec` entry が空の場合 → spec-save をスキップし case-open へ進む
 - `artifact_actions` フィールドが存在しない（旧形式 draft）場合 → **後方互換**: spec-save をスキップし従来ワークフロー（req-save → case-open → …）で実行
 - **auto_gate preflight**: `draft-data` の `auto_gate.auto_ready` を確認し、false の場合または未解決 item（unresolved_questions/ unresolved_conflicts/ out_of_repo_operations/ stop_reasons）が残る場合は停止する
4. **各工程の実行**: case-auto は全工程（req-save/ spec-save/ case-open/ case-run/ case-close）を各コマンドの委譲契約に従って task で起動し、オーケストレーションに専念する。case-run は Sisyphus-Junior(ulw-loop) への task 委譲モデルを使用する。各工程の task は対応するコマンド定義（`.opencode/commands/agentdev/{step}.md`）を authoritative source として読み込み実行する。case-auto は各工程の完了結果（保存済みファイル・Issue/PR番号・pass/warn/fail）のみを受領し、次工程への入力として渡す。**インライン実行は禁止する**（コンテキスト枯渇防止）

 ### 工程別委譲契約

 case-auto は各工程を以下の委譲契約で起動する:

 | 工程 | 起動方式 | inputs | output_contract |
 |------|---------|--------|-----------------|
 | req-save | task() | draft path, OU ID | 保存済みREQ/ADRリスト, draft status=saved, pass/warn/fail |
 | spec-save | task | draft path | 保存済みSPECリスト, SPEC消費済みフラグ, pass/warn/fail |
 | case-open | task() | draft path, OU ID | Issue番号(Epic含む), pass/warn/fail |
 | case-run | task() | 単一 Issue番号 または Epic Issue番号（`#epic`・現在 Wave の子Issue を case-run が並列委譲） | completed(pr)/blocked/failed（Epic Wave 実行時は子Issue ごとの結果集合） |
 | case-close | task | 単一 Issue番号 または Epic Issue番号（`#epic`・現在 Wave の一括クローズ） | マージ結果, Capture保存結果, 削除済みブランチ, pass/warn/fail, Epic 最終 Wave 判定結果 |

 各 task の side_effect_boundary は対応するコマンド定義のガードレール（ファイル操作制約）に従う。case-auto は各 task の結果に基づいて次工程へ進むか停止条件（Step 7）を判定する。各工程の後段処理（case-open の RU 削除、case-close の learning/intake capture・.agentdev/ commit/push 等）は各 task が対応するコマンド定義に従って実行する
 - **品質ゲート（QG-1〜QG-4）の継承**: case-auto は QG を独自実装しない。構成コマンド（req-save: QG-1, case-open: QG-2, case-run: QG-3, case-close: QG-4）がそれぞれ `agentdev-quality-gates` スキルを参照して Gate を適用する。各 task が対応する Gate を実行する。case-auto は工程間制御のみを担い、Gate 判定を再評価・差し替えしない（G07, G09）
 - **case-run の実行担当サブエージェント委譲モデル**: case-run は実装実行を実行担当サブエージェント（`agentdev-case-run-execution-adapter`）経由で外部実行バックエンドへ委譲し、自身は orchestration に専念する。case-auto は case-run の実行担当サブエージェント委譲モデルを変更せず、実装実行・PR作成を自ら行わない。実行担当サブエージェント result（completed(pr)/blocked/failed）の処理は case-run 定義に従う
 - case-auto は req-save/ case-open の task() に draft path と OU ID のみを渡すこと。OU 本文の切り出しは行わない
 - case-auto は OU の統合・分割、REQ 操作分類、Issue 階層判定を再評価しないこと。各 task() が対応するコマンド定義（req-save/ case-open）の判定結果に従う
 - case-open task の完了後、出力を確認して以下のいずれかに分岐する:
 - **Standard flow（単一 Issue）**:
 1. case-open task が共通終了処理（Step 17〜18-2: コメント追加・ドラフト削除・RU削除・完了報告）を完了していることを確認すること
 2. **クリーンアップ検証ゲート**（後述）を実行し、ドラフトファイル・RUファイルの残存がないことを確認すること。残存時は停止すること
 3. 既存の直列フロー（case-run → case-close）を実行
 - **Epic Issue flow（マルチREQ または 単一REQ Epic flow）**:
 1. case-open task が共通終了処理（Step 17〜18-2: コメント追加・ドラフト削除・RU削除・完了報告）を完了していることを確認すること
 2. **クリーンアップ検証ゲート**を実行し、ドラフトファイル・RUファイルの残存がないことを確認すること。残存時は停止すること
 3. Step 4-1（Wave 反復制御）に進む
 - **Step 4-1 Wave 反復制御（case-run #epic → case-close #epic の反復）**: Epic Issue 番号を記録する。Epic Issue 本文（SSoT）から Wave 構成・各子Issue ステータスを読み取る（**読み取りのみ・Epic Issue 本文の書き込みは case-close の単一書き手責務・**）。Epic/Wave orchestration（子Issue 選択・task 並列起動・Epic Issue 本文ステータス追跡テーブルの更新）は case-run/ case-close が担い、case-auto は Wave 反復制御に専念する。以下の Wave 反復ループを実行する:
 1. **task→case-run(#epic)**: Epic Issue 番号を case-run task に渡す。case-run は現在 Wave の ready 子Issue を Sisyphus-Junior(ulw-loop) に並列委譲（最大5件）し、1 Wave の実行（PR作成まで）で return する
 2. **task→case-close(#epic)**: case-run task の結果（子Issue ごとの completed(pr)/ blocked/ failed）を確認する。completed(pr) の子Issue がある場合、Epic Issue 番号を case-close task に渡す。case-close は現在 Wave の PR作成済み子Issue を一括マージ・クローズし、Epic status table を更新する（単一書き手）。case-close は最終 Wave 判定を行い、Epic クローズ または 残 Wave 通知を返す
 3. **次 Wave 判定**: case-close task() の結果から Epic 全 Wave 完了可否を判定する:
 - **全 Wave 完了（Epic クローズ済み）**: Epic 完了報告（Step 8）へ進む
 - **残 Wave あり**: Step 1（task→case-run(#epic)）に戻り次 Wave を実行する（べき等・Epic Issue 本文から進行状況判定）
 4. **blocked/ failed の扱い**: case-run task が blocked/ failed を返した子Issue は case-close 対象外となる。一部 completed(pr) がある場合は case-close(#epic) で completed(pr) のみ処理し、その後停止条件（Step 7）の判定へ進む。全子Issue が blocked/ failed の場合は Wave 反復を停止し部分完了報告（Step 8）へ進む。停止時は完了済み OU・進行中 OU・未実行 OU・再開可能な次コマンドを報告すること
 5. **OU 逐次処理**: 1 OU（Epic 全 Wave 完了）を close まで完了した後に次の OU へ進むこと。Epic Issue flow でも Step 8-1（逐次OU処理ループ）相当の処理を適用する
 - **クリーンアップ検証ゲート**: Standard flow の case-run 移行前・Epic Issue flow の Step 4-1（Wave 反復制御）開始前の双方で、以下を検証する:
 - ドラフトファイル（`.agentdev/drafts/req-draft-*.md`）が削除されていること。残存する場合は停止し手動削除を依頼すること
 - 当該ケースで消費した RU ファイル（`.agentdev/backlog/req-units/RU-*.md`）が削除されていること。残存する場合は停止し手動削除を依頼すること
 - 検証結果（成功・残存ファイル一覧）を case-auto 完了報告（Step 8）に含めること
5. **工程間の状態引き継ぎ**: 各工程の task 起動結果（Issue番号、PR番号）を次工程の入力として渡す。加えて以下の引き継ぎ情報を最終工程まで保持すること: (1) RU ファイルパス（case-open task の RU 削除で使用） (2) capture 対象情報（case-close task の learning/intake capture で使用）
6. **複数REQ対応**: req-save task の出力から複数 REQ doc または scale:large を検出した場合、case-auto は case-open の Issue 構造ルールをそのまま使用する。case-auto 自体に Issue 階層決定ロジックを持ってはならない。req-save task から case-open task へ状態を引き継ぐ際、case-auto は複数 REQ doc の保存結果をフィルタリングや再評価なしでそのまま渡す。case-auto は Epic Issue 化の判定に関与しないこと。case-open の判定結果に従うこと
7. **停止条件の検出**: 以下のいずれかを検出した場合、実行を停止し停止理由・現在地点・再開可能な次コマンドを報告する:
 - **停止時タイミング情報の追記**: 停止報告に Step 1 で記録した `case_auto_started_at`（開始時刻）・停止時刻（JST・人間が読みやすい形式: 例 `2026-06-21 15:30:00 JST`）・経過時間（停止時刻 − 開始時刻、人間が読みやすい形式: 例 `12分34秒`・全体合計のみ・工程別内訳は含めない）を含めること
 - (1) req-define合意要件からの逸脱
 - (2) 要件未合意のscope拡大
 - (3) repo外実体変更の必要性
 - (4) DB migration実行の必要性
 - (5) deploy/applyの必要性
 - (6) 認証・秘密・権限変更の必要性
 - (7) CI/test/lint失敗がself-healing不能
 - (8) merge conflict/ remote hash不一致
 - (9) 作成元不明branch/ user-owned branch/ 他作業branchの削除検出
 - (10) 未コミット変更の帰属不明
8. **完了報告**: 最終工程（case-close task）の完了報告をそのまま出力する。Epic Issue を伴う Wave 反復実行時は、完了・blocked・failed 子Issue 一覧を含める（Epic Issue 本文ステータス追跡テーブルから読み取り・case-auto は書き込まない）。停止時は完了済み OU、進行中 OU、未実行 OU、再開可能な次コマンドを報告する
 - **タイミング情報の追記**: 完了報告生成時刻（Step 8 開始時点）を JST・人間が読みやすい形式（例: `2026-06-21 15:30:00 JST`）で記録する。case-close task() の完了報告（テンプレート）は変更せず、case-auto が以下を追記すること:
 - 開始時刻: Step 1 で記録した `case_auto_started_at`
 - 終了時刻: 完了報告生成時刻
 - 所要時間: 終了時刻 − 開始時刻（人間が読みやすい形式: 例 `12分34秒`・全体合計のみ・工程別内訳は含めない）
 - 停止条件による中断時（Step 7 経由）の報告にも、上記と同じ形式で開始時刻・停止時刻・経過時間を含めること（停止時刻を終了時刻として扱う）
8-1. **Standard flow 逐次OU処理ループ**: Standard flow の case-close task 完了後、未処理 OU が残存する場合は次 OU の処理を自動的に開始する:
 - 処理対象の全 OU から次の未処理 OU を特定する（`recommended_order`, `depends_on` に基づく）
 - 次 OU が存在する場合: 当該 OU の `artifact_actions` に応じた工程分岐で Step 2 に戻る（REQ/ADR artifact_actions あり: req-save → …、SPEC artifact_actions あり: spec-save → …、常に case-open → …）。spec-save 実行判定は Step 3 に従う
 - 全 OU の処理が完了した場合のみ全体完了報告を出力する
 - 次 OU の draft ファイルが存在しない場合: 停止し完了済み OU・未実行 OU・再開コマンドを報告する
 - 逐次OU処理中に停止条件（Step 7）を検出した場合: 完了済み OU・進行中 OU・未実行 OU・再開可能な次コマンドを報告する

## ガードレール

### 自走境界
- G01: 自走対象はrepoにファイルとして残る変更に限定する
- G02: 以下は自走対象外とする: DB migration実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金・権限・認証情報に関わる変更、repo外の実データ操作、通知送信
- G03: migrationファイル・IaCファイルの作成・修正は対象とし、migration実行・IaC applyは対象外とする
- G04: GitHub Issue/ PR/ comment/ merge/ close は自走対象とする
- G05: remote branch削除は当該case-auto/ case-runが作成したbranchに限定する
- G06: docs/ REQ/ ADR/ SPEC/ command reference/ guide の更新を自走対象に含める

### 委譲・参照制約
- G07: case-auto は各工程（req-save/ spec-save/ case-open/ case-run/ case-close）を task で起動し、**インライン実行してはならない**。case-run も task 起動を使用する。各工程の task は対応するコマンド定義を authoritative source として実行する（手順の case-auto 定義内再実装は回避）
- G08: 工程固有の詳細手順とcase-auto定義が矛盾する場合、工程固有処理は既存コマンド定義を優先し、自走境界・入力解決・工程間制御はcase-auto定義を優先する。各 task の実行は対応するコマンド定義に従う
- G09: 既存のreq-save/ spec-save/ case-open/ case-run/ case-closeの責務を変更しない。task 委譲は起動方式の変更であり、各コマンドの責務・ガードレール・成果物を変更しない
- G27: 各 task の起動は工程別委譲契約（Step 4 の委譲契約表）に従うこと。inputs に指定された情報のみを渡し、output_contract に指定された結果のみを受領する
- G28: case-auto は各 task の完了結果（Issue/PR番号・pass/warn/fail）のみを親コンテキストに保持し、工程内部の調査過程・中間ログ・読解メモを親コンテキストに累積しないこと
- G13: case-auto は Issue 階層決定ロジックを持ってはならない。複数 REQ doc または scale:large の場合は case-open の Issue 構造ルールに委譲する
- G14: case-auto は req-save task から case-open task への状態引き継ぎ時、複数 REQ doc の保存結果をフィルタリングまたは再評価してはならない。保存結果をそのまま渡す
- G15: case-auto は子Issue 選択ロジック・子Issue 単位の task 並列起動を行わない。Wave 全体の実行を case-run(#epic) に委譲し、Wave 境界のクローズを case-close(#epic) に委譲する
- G16: case-auto は独自の操作単位ステータス追跡を持ってはならない。Epic Issue のステータス追跡テーブルを使用する。**Epic Issue 本文の書き込みは case-close の単一書き手責務。case-auto は読み取るのみで書き込まない**
- G18: case-auto は操作単位キューの管理・制御のみを担い、OU 本文の抽出・変換・REQ 操作解釈を行わないこと
- G19: case-auto は req-save 段階（case-open 完了前）のみ draft を OU 情報の SSoT として扱うこと。case-open 完了後は子Issue（Epic Issue のステータス追跡テーブル含む）が SSoT となること。クリーンアップ検証ゲート（ドラフト削除検証）は case-open 完了後に実行すること。独自の OU 状態管理を持たないこと
- G20: OU 間依存は queue dependency として扱い、依存関係があるだけでは Epic Issue 化しないこと
- G21: case-auto は Epic Issue 化の判定に関与しないこと。case-open の判定結果に従うこと

### 出力制約
- G10: 成果物本文（Issue本文・PR本文・commit message・保存対象ファイル本文・テンプレート成果物）はverbatimで返す。判定結果・調査過程・中間ログ・読解メモは要約・成果物パス・根拠・親判断事項・capture候補へ圧縮して返す

### Capture 整合制約
- G17: case-auto は構成コマンド（case-run/ case-close）の capture 責務境界に従う。case-auto 固有の capture 振る舞いは持たない。capture 境界の詳細は `agentdev-workflow-orchestration` を参照

### 実行時パス制約
- G11: 既存コマンド定義を読み込む際、source path を実行時パスに読み替えてはならない。コマンド定義内のパス参照は記述された通りに解釈し、source path を実行時参照先として使用しない
- G12: 委譲先コマンドの実行時 Read/ Glob に source path 固定参照を含めない
- G13: case-auto の capture 責務は委譲。構成コマンド（case-run/ case-close）の capture 責務境界に従い、case-auto 固有の capture 振る舞いは持たない。境界の詳細は `agentdev-workflow-orchestration/references/capture-boundaries.md` 参照



