# STEP-1/2: Issue 番号解決・QG-4 達成判定（issue-resolution-and-qg4）

> 本 reference は `agentdev-workflow-case-close` SKILL.md の制御平面（STEP 一覧）STEP-1, STEP-2 詳細である。
> Issue 番号解決・ルーティング（単一 vs Epic Wave）と QG-4 最終完了判定ゲートを提供する。

## STEP-1: Issue 番号解決・ルーティング

### Purpose

Issue 番号を解決し、単一 Issue クローズと Epic Wave クローズの処理ルートを確定する。

### Input Resolution

1. SSoT 再構成: Issue 本文（実行構成表有無、`agentdev_gh` の issue_read 操作）
2. identifier 保持: Issue番号（ユーザー入力またはセッション内会話）
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- case-close command から Issue 番号が渡されている

### Procedure

ユーザー入力またはセッション内会話から番号を取得。
複数候補時は直近を優先して確認。
検出不可時はユーザーに指定を求めて停止。

**Epic Issue 判定**: 解決した Issue 番号の本文を `agentdev_gh` の issue_read 操作で取得し、実行構成表（`agentdev-epic-tracker` の実行構成表（`| Wave | Issue | 前提 | 状態 |`））が存在するか確認。

- **テーブル存在時**: **Epic Wave クローズ**（STEP-E1〜E6、[references/epic-wave-close.md](epic-wave-close.md)）へ分岐
- **テーブル不存在時**: **単一 Issue クローズ**（STEP-1-1〜）へ進む（後方互換）

### STEP-1-1: 重複ファイルチェック（merge/pull 実行前、単一 Issue クローズ時）

`agentdev-git-worktree` の「PR merge 前重複ファイルチェック」プロシージャに従い、ローカル未コミット変更ファイルと対象 PR 変更ファイルの重複を検出、停止条件の判定を行う。
`agentdev_gh` の pr_changed_files / pr_mergeable 操作実行不可時は後方互換性として STEP-6（実行前同期）でフォールバック検出を維持する。

### Result

- 処理ルート確定（単一 Issue クローズ または Epic Wave クローズ）
- 単一 Issue クローズ時: 重複ファイルチェック結果

### Evidence

- Issue 番号の入手経路、Issue 本文読取結果、実行構成表有無の判定根拠、重複ファイルチェック結果

### Completion Verification

- 処理ルートが決定的処理として確定していること

### Resume-Idempotency

- 読取と判定のみで副作用を持たない。再実行時は同一 Issue 本文から同一ルート判定に到達する

## STEP-2: QG-4 達成判定（前提確認）

### Purpose

Issue 本文の完了条件チェックボックスを最終評価・更新し、達成判定（QG-4）を行う。
完了条件の評価と状態遷移は、既存の完了条件・証拠からの導出として自律確定する（REQ-{NNNN}-{NNN}。確定権限: 正規契約からの導出）。最終工程であること自体を理由に人間承認を要求しない。修正が必要な場合は正規所有工程（case-run 差し戻し等）へ戻し、人間判断は引き上げ条件（REQ-{NNNN}、`<foundations/v4-responsibility-boundaries>` Design「人間判断への引き上げ条件」節）に該当する場合のみとする。

### Input Resolution

1. SSoT 再構成: Issue 本文（完了条件チェックボックス）、PR 本文（capture 入力源）、test strategy セクション、SSoT コメント（verify-only closure 時の判定根拠）
2. identifier 保持: Issue番号、PR番号
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- 単一 Issue クローズ ルート（STEP-1 でテーブル不存在判定）

### Procedure

達成判定、完了ゲート（QG-4）→ `agentdev-quality-gates` の QG-4（Final Acceptance Gate）に従い、Issue本文の完了条件チェックボックスを最終評価、更新する。
判定基準、検査観点は `agentdev-quality-gates` の QG-4 を参照。

- **完了条件チェックボックス評価・更新は case-close の責務**（QG-4）。case-run、実行担当サブエージェント、外部実行バックエンドは完了条件チェックボックスを更新しない。case-close は case-run/ 実行担当サブエージェントとは**別コンテキスト**で、PR 作成後に独立して完了条件を再読込して最終完了判定する
- **トレーサビリティ check の実行前提**: 下記の段階ゲートで check を実行する際は、`agentdev-traceability` SKILL.md「実行方法」節の実行前提に従う（`--req` は要件行IDの個別カンマ指定のみ受理し `..` 形式の範囲構文は非対応、`--root` は検証対象リポジトリのルート明示、宣言の走査対象は拡張子・除外ディレクトリの前提どおり）。前提を満たさない実行の結果は QG-4 の判定根拠に使わない
- **QG-4 checker 実測手順（merge 直前 HEAD・evidence 化・baseline 登録漏れ検査）**: QG-4 の checker 実測（full integrity suite、個別 checker、IR 検査）は次の3要素を満たして実施する:
  1. **merge 直前 HEAD 実施**: checker 実測は、merge 直前の origin/main 取り込み済み branch HEAD で実施する（古い branch HEAD・分岐時点の baseline での実測結果を QG-4 判定根拠に使わない）
  2. **evidence 化**: 検出した新規 NG の出所が自 Case 変更であることを evidence として記録する（fail 由来分類: 既知欠陥・環境依存・当該変更起因の3分類。実行 HEAD・checker 種別・検出箇所を PR 本文等の検証記録へ残す）
  3. **baseline 登録漏れ検査**: provenance-tracked baseline（NG baseline）への登録漏れを検査する。自 Case 変更で解消済みの既存 NG が baseline に残存していないか、新規 NG が未登録のまま通過扱いになっていないかを確認する
- **QG-4 checker 実測の baseline 規約（provenance 付き登録・再生成時保全・役割分離・合否判定）**: baseline の登録・更新・判定は次の規約に従う。契約の正は checker 実行契約 Design（checker 実行契約と検出基盤規則）「baseline 退避物と BaselineFile の役割分離と合否判定基準」節と NG baseline 運用手順（integrity 契約 Design）であり、本手順は工程側の接続のみを扱う:
  1. **役割分離**: baseline 退避物（checker 実行 stdout の退避。ok/failures/stats 形式）は比較証跡であり、delta 検査用 BaselineFile（entries 形式）は delta 検査の入力である。両者は別役割であり、形式非互換は欠陥ではない。退避物を BaselineFile として入力に使わない
  2. **provenance 付き登録のみ許容**: baseline エントリおよび恒久免除レジストリへの追加は、provenance（起因の由来、正当化の参照先 rationale_ref、適用日）付きでのみ許容する。無条件 baseline 追加を禁止する
  3. **全量再生成時の provenance 保全**: BaselineFile の全量再生成は cap 更新（増分反映）と使い分け、全量再生成時は従来の approved provenance を引き継ぐことを確認する（provenance 保全。引き継ぎを確認せずに再生成を完了扱いにしない）
  4. **合否判定基準**: 既知違反の合否は failures の一致（件数と内容）で判定し、分類層（severity・bucket 別）の件数一致を確認する。scanned 件数差は環境差（走査環境・OS・junction 状態に由来）として不合格根拠にしない
  5. **参照是正系 ACT の baseline 要否確認**: 参照切替・旧パス是正等の参照是正系横断是正（ACT）を含む変更では、既存 baseline エントリの期待値が走査先パス・検出文言に依存するかを確認する前置を置き、依存する場合は baseline 期待値・除外定義の追随更新を同一変更単位で処置する。要否確認の実施記録（依存なし確認または更新実施）を検証記録へ残す
- **検証対応の3完全性ゲート（完了阻止）**: 完了条件チェックボックスの評価とは別に、対象要件行（当該 Case の Issue 本文が対象とする要件行）の Design 対応、implementation 対応、verification 対応（policy が required と判定する要件行）の完全性を判定する。対象要件行に Design 対応、implementation 対応、または required 行の verification 対応の欠落が残る場合、当該 Case を**完了として扱わない**（チェックボックスが全て checked でも完了扱いにしない）。`agentdev-traceability` の check（`--req` で対象要件行に限定、`missing-design` / `missing-implementation` / `missing-verification` の findings を該当行の完了阻止条件として扱う）で機械的に導出する。check が正常に完全性を判定できなかった場合（check 実行不能、検査対象の取得不能等）は対応完全性の合格として扱わず、検査不能の旨を報告してマージに進まない（fail-closed）。**policy が optional と明示した要件行の verification 対応欠落は完全性違反に含めない**。Decision 対応の欠落は完了阻止条件に含めない。判定の所有は本 Workflow Skill が保持し、command 定義へ複製しない。ゲート停止の状態は REQ ファイル、トレーサビリティポリシー、対応宣言という durable state から再構成可能である。実行の詳細は SKILL.md「トレーサビリティ能力の利用（QG-4 独立再検査）」参照
- **worktree root 起点の完全性判定時の再実行（誤差し戻し防止）**: traceability check を worktree root 起点で実行して検出対象の完全性が確定できない場合、main 側 root で check を再実行し、トレーサビリティポリシー登録 commit の時系列（ブランチ分岐の前後）を確認してから完了阻止を判断する。durable state 上で解消済みの対象行を本変更起因の失敗と誤判定しない。再実行は読取系 check の実行のみで行い、GitHub I/O・Tool 操作契約は変更しない
- **PR 対象範囲 vs 全体 評価スコープ判定（QG-4 観点8）**: unchecked 完了条件を達成判定する前に、各完了条件の評価スコープ（PR 対象範囲 または 全体）を QG-4 観点8「PR 対象範囲 vs 全体 判定マトリクス」に従い決定する（境界ケース #1532 由来）
- **完了条件単位の最終評価（検証義務独立導出・条件単位評価区分・非循環証拠・close 条件）**: 各完了条件の達成判定は、case-run の合格申告や実装 diff だけを最終基準とせず、根拠となる正規契約から評価範囲、期待結果、反例条件、許容される除外を導出または照合する。判定は完了条件単位に pass / fail / blocked / not applicable の評価区分で区別し、not applicable は当該条件が評価対象に適用されないことを正規契約から説明できる場合だけ許可する（未投影、未実装、未検証、証拠不足、検証不能、予定変更対象外、実行担当の責務外判断を根拠にしない。適用性判断の根拠を判定記録へ保持する）。証拠がその条件の意味命題を実際に立証していることを確認し、条件ID・名称の一致、テスト名の類似、関連ファイルの検査といった形式的一致だけを達成証拠にしない。「残存0件」「全経路」「すべて整合」「漏れなし」等の全称・不存在条件では、正規契約から導出した評価範囲を対象に反例探索を行い、変更ファイルのみまたは実装担当が選択した対象のみの確認を、全評価範囲を被覆しない限り達成証拠にしない。Issue closed、PR merged、QG pass、完了条件チェック済み等の工程状態を、成立前提である機能・品質・契約条件の証明へ循環利用しない（工程状態自体が明示的な完了条件である場合は当該条件に限り直接証拠として利用できる）。現在の完了条件を否定する反例 finding を intake、learning、後続 Issue、Findings、別途確認等へ分類しただけでは当該条件を達成扱いにせず、反例を元条件から切り離すには正規な要件変更、対象範囲変更またはあらかじめ定められた項目固有処置を要する。合意済み検証方法を別手段へ変更する場合は、元の検証義務に対して同等以上の観測能力を持ち未証明範囲が増えないことを確認する（同等性未確認の代替検査〔通し実行から単体テスト、実 runtime から静的構造確認、実ホストからスタブ、リポジトリ全体から変更ファイルのみへの変更を含む〕を達成証拠にしない）。終了対象が負う必須完了条件に fail、blocked、未判定、未投影、証拠不足、検証不能、意味不一致、未解決反例が1件でも存在する場合は close せず、必須未達を Gate 全体の warn 等で通過させない。上記の構造的検査（証拠・根拠の性質検査、必須未達の集約、close 可否判定）は `agentdev-workflow-case-close` スキル配下の実行コード `scripts/src/final-acceptance.ts` の決定的関数 `evaluateFinalAcceptance` で行う。本関数は既存の QG-4 判定手順が消費する決定的検査であり、新しい品質ゲート、新しい結果状態、恒久的な受け入れ義務台帳を構成しない
- 手順、再 grep/再検査/再計測、事後確認（再読込 VERIFY）、未達項目残存時の停止（完了条件評価専任責務）、test strategy 処理完了確認（未処理項目が残る場合は構造化エラーで停止）の詳細は `agentdev-quality-gates` の QG-4 を参照
- PR 存在確認
- **verify-only closure の QG-4 達成判定（SSoT コメント参照）**: verify-only closure（PR も carrier commit も存在しない Issue 完了）では、case-run が記録した SSoT コメント（Issue コメント）の実行コマンド列と検証結果を判定根拠として参照する。PR が存在しないため PR 本文の検証差分セクションは存在せず、SSoT コメントが検証証跡の恒久記録の正となる。SSoT コメントから次の3点を確認する:
  - 3検査（配布依存境界・IR-{NNN}・トレーサビリティ）の実行記録と新規違反 0 件確認
  - integrity suite の N/M 件数突合と直前実績比較
  - 実行コマンド列の再実行可能性（実行 cwd・実行形態の記載）
  SSoT コメントが存在しない verify-only closure、または SSoT コメントに検証結果の記載が欠落している場合は QG-4 不合格として完了扱いにしない。docs_chore 特例フロー（main 直接 commit が存在する PR なし完了）は本手順の対象外であり、直接 commit 内容で QG-4 を検証する

### Result

- 完了条件チェックボックス評価・更新完了（再読込 VERIFY 済み）
- 観点8 評価スコープ確定
- 完了条件単位の評価区分（pass / fail / blocked / not applicable）と、証拠・根拠の性質検査による違反検出、必須未達の集約、close 可否判定の結果（`scripts/src/final-acceptance.ts` の `evaluateFinalAcceptance` 判定結果を含む）
- test strategy 処理完了確認
- 対象要件行の3完全性判定結果（Design 対応・implementation 対応・required 行 verification 対応の欠落の有無）
- verify-only closure 時: SSoT コメント参照手順の確認結果（3検査記録、件数突合、再実行可能性）

### Evidence

- 完了条件チェックボックスの評価結果と更新後の再読込 VERIFY 結果、観点8 評価スコープ判定、test strategy 処理完了状態、段階ゲートの判定根拠（check の JSON 結果または定義どおりの手動確認結果）
- 完了条件単位の評価記録: 各条件の根拠正規契約、検証義務、評価範囲、検証手段、取得した証拠と対象成果物の状態、除外根拠、判定区分。これらの主要関係は既存証拠チャネル（Issue、PR 本文検証差分セクション、QG 結果、SSoT コメント等）から追跡可能な位置へ記録する（記録位置は STEP-3 の docs 検証・Design 確定経路と同一チャネル）。追跡不能な「独立検証済み」記録だけを完全な最終受け入れ証拠にしない
- `evaluateFinalAcceptance` の判定結果（違反検出、必須未達集約、close 可否）
- verify-only closure 時: SSoT コメントの参照結果（3検査の実行記録と新規違反 0 件確認、integrity suite の N/M 件数突合と直前実績比較、実行コマンド列の再実行可能性確認）

### Completion Verification

- 未達チェックボックスが残っていないこと（残る場合は構造化エラーで停止）。更新後の再読込 VERIFY が合格であること。完了条件単位の評価で、必須条件に fail、blocked、未判定、未投影、証拠不足、検証不能、意味不一致、未解決反例が1件も残っておらず、not applicable には正規契約上の根拠が存在すること。必須未達を Gate 全体の warn で通過させていないこと。対象要件行に Design 対応・implementation 対応の欠落が残らず、policy が required と判定する要件行の verification 対応が存在すること（該当行の欠落残存時は完了として扱わない。policy が optional と明示した要件行の verification 対応欠落は完了阻止の理由にしない。Decision 対応の欠落は完了阻止条件に含めない）。verify-only closure 時は SSoT コメントが存在し検証結果の記載が欠落していないこと（SSoT コメント不在または検証結果記載欠落時は完了として扱わない）

### Resume-Idempotency

- Issue 本文のチェックボックス状態（durable state、更新後に再読込）で評価済み否かを再構成する。更新済みチェックボックスを再評価しない
- verify-only closure 時は対象 Issue のコメント一覧（durable state、`agentdev_gh` の comment_list）から SSoT コメントの有無を再構成する。SSoT コメント不在時の完了抑止は再実行時も維持する

## resume point

- Issue 番号解決状態、Epic Wave vs 単一 Issue ルート判定
- 重複ファイルチェック結果（単一 Issue ルート）
- QG-4 完了条件チェックボックス評価・更新状態、観点8 評価スコープ、verify-only closure 時の SSoT コメント参照状態

## 関連 STEP

- 前: なし（workflow 開始）
- 次（単一 Issue ルート）: STEP-3（docs-and-spec-promotion）
- 次（Epic Wave ルート）: STEP-E1〜E6（epic-wave-close）

## 関連 Capability Skill

- Custom Tool `agentdev_gh`: Issue 本文読取
- `agentdev-epic-tracker`: Epic Issue 判定、実行構成表形式
- `agentdev-git-worktree`: 重複ファイルチェックプロシージャ
- `agentdev-quality-gates`: QG-4 Final Acceptance Gate、観点8 判定マトリクス
- `agentdev-traceability`: Design 対応・implementation 対応・required 行 verification 対応欠落行の導出（check。3完全性ゲートの完了阻止判定手段）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- ガードレール（未マージ PR はクローズしない）
- 不変条件（Issue 番号省略は同一セッション内で作成済みの場合のみ）
- 不変条件（Issue 番号解決に Issue/PR 一覧取得手続き等は禁止）
- ガードレール・不変条件（未達チェックボックス残存時の構造化エラー停止、チェックボックス更新後の再読込 VERIFY 必須、完了条件チェックボックス評価・更新は case-close 専任責務、`POL-completion-checkbox-single-writer`）
