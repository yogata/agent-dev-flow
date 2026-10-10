# 共通委譲・result 処理（delegation-and-result）


> 本 reference は `agentdev-workflow-case-run` SKILL.md の共通 STEP 詳細である。
> STEP-S4（実行担当サブエージェント委譲）と STEP-S5（result 処理・配布依存境界 最終 gate）を所有する。
> single workflow（単一 Issue 実行）から参照される。

## 目次

- STEP-S4: 実行担当サブエージェント委譲（adapter 委譲内 adversarial-review 含む）
- STEP-S5: result 処理・配布依存境界 最終 gate

## STEP-S4: 実行担当サブエージェント委譲（adapter 委譲内 adversarial-review 含む）

### Purpose

実装実行を adapter skill を読み込んだ実行担当サブエージェントへ委譲し、委譲の壁時計時間を計測する。

### Input Resolution

1. SSoT 再構成: Issue 本文（実行契約）、REQ/Decision/Design/docs/repository context（委譲先が再取得）
2. identifier 保持: Issue番号、worktree root（相対パス、`.worktrees/{N}-{type}/`）、ブランチ名、PR base（main）
3. 最小 scalar: L2 タイムスタンプ（委譲起動直前・直後、JST）
4. runtime artifact: なし（外部実行ハーネスの plan artifact 等は永続成果物としない）

### Preconditions

- STEP-S3（single）の前置 gate 群が合格していること（worktree 内検証済み）

### Procedure

- 実装実行を adapter skill（`agentdev-case-run-execution-adapter`）を読み込んだ実行担当サブエージェントへ委譲する（委譲 prompt 内で実行 command を指定）。起動手段は AGENTS.md および references/<harness>.md 参照。adapter protocol は同 skill 参照
- **委譲識別情報の発行と記録**: 委譲 prompt に委譲識別情報ブロック（委譲単位識別子 `DEL-{N}-{seq}`）を含める。case-run が委譲単位識別子を発行し、委譲単位識別子の形式（N = 対象 Issue 番号）と委譲 prompt の構造化文脈（workflow_phase、execution_unit）から親子実行関係を導出する（harness 側識別子は付加情報に限定）。記録先割当は v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節に従う。実行担当サブエージェントが当該ブロックの委譲単位識別子を PR 本文の実行識別情報セクションへ転記する。詳細なブロック形式は `agentdev-case-run-execution-adapter` references 参照
- **検証差分の記録指示**: 委譲 prompt で、実施する各検証（test strategy 項目検証、bun test フル suite、配布依存境界 gate、targeted docs guard、トレーサビリティ check、品質ゲート等）について検証種別、検証結果、finding 差分（新規、修正済み、既出、撤回、無効の5分類）を PR 本文の検証差分セクションへ実行工程 case-run の行として記録するよう実行担当サブエージェントへ指示する。形式は `agentdev-workflow-templates` の検証差分セクション規約に従う。前段階の同種検証が存在しない初回検証では全 finding を新規として記録し、後続工程（case-close）が対応記録コメントへ同一形式の case-close 行を記録する前提で工程間比較可能にする
- **配布物 references 編集前の事前 grep 前置の引き渡し**: 委譲 prompt で、配布物 references（`src/common/skills/**`、`src/common/commands/**`、templates 等）の本文編集を含む委譲には、編集前に変更対象行の文言を grep して期待値結合テスト（pin 型・anchor 型）の有無を事前確認し、検出されたテストは同一 PR で期待値を追随更新することを予防観点として引き渡す。STEP-S3-7（single.md）の事前確認結果（検出 0 件確認または検出テスト一覧）が委譲プロンプトに含まれる場合はそれを引き継ぎ、委譲内で新たに参照を編集する場合は同じ前置を実施させる。事前確認の実施記録を PR 本文の検証記録へ残すことを指示する（観点の正は docs/knowledge/structure-migration-followup-checklist.md）
- **docs 変更委譲の check_integrity 単独実行必須指示**: 委譲 prompt で、docs の内容変更を伴う委譲の場合に限り、check_integrity の単独実行（bun run 形式。`bun run .opencode/skills/<integrity-detector-skill>/scripts/check_integrity.ts`。`<integrity-detector-skill>` は対象リポジトリの integrity 検査 skill 名に解決する）を委譲 context の必須指示として含める。docs の内容変更を伴わない委譲（コードのみ・Issue 操作のみ等）では当該必須指示を含めない（無条件適用しない）。docs 変更の完了報告の前に当該検査の実行結果を報告することを実行担当サブエージェントへ指示する
- **検証義務と検証手段の分離渡し**: 委譲 prompt で、完了条件ごとの検証義務（何を証明する必要があるか、どの範囲で成立する必要があるか、いかなる反例が存在すれば不合格か）を、検証手段（証明に用いる具体的なテスト、検索、実行等）と分離して実行担当へ渡す。STEP-S2（single.md）で区別読取した検証義務と検証手段の対応を委譲 prompt に転記し、区別を崩さない。テストまたは checker の成功だけでは、当該検査が検証義務を十分に観測していることの立証なしに達成証拠としない（被覆確認なしの pass 拒否）ことを委譲契約として実行担当へ明示する
- **検査基準の実装由来生成禁止**: 委譲 prompt で、実行担当が検査対象、期待結果、除外条件を実装結果だけから生成することを委譲契約上禁止する。一意に導出可能な対象集合等は決定的処理で導出し、意味判断が必要な部分は既存 ADF 判断アーキテクチャ（決定的処理、閉じた意味評価、開いた推論）に従う。実装と同時に作成したテストが実装と同じ範囲を検査対象から漏らしたまま green となる状態を達成証拠としない
- **検証方法の弱化禁止**: 委譲 prompt で、合意済み条件が要求する観測能力を、実装担当、委譲プロンプト生成側、Verifier のいずれも自律的に弱化しないことを委譲契約として明示する。検証手段を変更する場合は元の検証義務に対して同等以上の観測能力と未証明範囲の不増を確認する。runtime・実ホスト・実経路での成立を要求する条件を、同等性未確認の静的構造検査、単体テスト、スタブ結果のみで達成扱いにしない
- **反例申告義務**: 委譲 prompt で、実行担当は現在の完了条件を否定する反例を検出した場合に申告すること、反例を intake、learning、後続 Issue、Findings 等へ分類しただけでは元条件の達成扱いとならないことを委譲契約として実行担当へ明示する
- **合意変更時の旧実行契約消費防止**: 委譲起動（dispatch）の前に、実行契約を生成した合意の変更が発生し影響する場合は、当該実行契約への反映と読み戻し確認が成立するまで旧実行契約に基づく dispatch を行わない。読み戻し確認は Issue 本文の再取得（`agentdev_gh` issue_read）で行う。result 受領側の最終受け入れにも同じ禁止を適用する（STEP-S5「委譲応答の3点ゲート（最終ゲート）」参照）
- **トレーサビリティ check の実行前提の引き渡し**: 委譲 prompt でトレーサビリティ check を指示する際は、`agentdev-traceability` SKILL.md「実行方法」節の実行前提（`--req` は要件行IDの個別カンマ指定のみ受理し `..` 形式の範囲構文は非対応、`--root` は検証対象リポジトリのルート明示、宣言の走査対象は拡張子・除外ディレクトリの前提どおり）を実行担当サブエージェントへ引き渡す
- **重複解消方針の参照と検出不能報告**: 委譲 prompt で、対象 Issue に関連する重複解消方針（変更対象分割・重複許容時の衝突解消の担当とマージ順序。Epic Issue 本文・Wave 記録に記録された競合リスク情報）を参照して実行することを実行担当サブエージェントへ指示する。同一 Wave 内の変更対象ファイル重複の実行時検出は case-auto の stage 3 実行制御が所有するため、case-run 委譲内では重複の新規検出・解消方針の新規決定を行わず、事前記録された方針に従う。変更対象集合が取得不能な場合は比較を省略せず検出不能として報告する
- **ADF-COVERS 宣言付与の正の義務**: 委譲 prompt で、対象 work_type で対応宣言を要求する実装成果物（実装対応を伴う成果物）に、実装対応役割の対応宣言を付与することを実行担当サブエージェントの正の義務として指示する。case-run は宣言の欠落を委譲先側の受動的修正対象ではなく、委譲時から要求される能動的な付与義務として委譲指針上で義務付ける。宣言が付与されていることの確認は、case-ready の Definition 品質検査が行う同一の確認（対象 work_type で対応宣言を要求する実装成果物への宣言付与確認）と同一対象・同一基準の要求であり、両要求は無矛盾である。宣言欠落が case-ready 品質検査で検出される前に委譲先が宣言を付与していない状態で PR を作成することを防止する。対応宣言の付与対象と宣言形式の正規所有はトレーサビリティ標準配布スキル（agentdev-traceability）とその参照先 Design が所有する
- **配布物対応宣言の作成先規約の予防観点引き渡し**: 委譲 prompt で、新規配布物（配布 command、skill、template、runtime script 等の consumer distribution closure 対象成果物）の作成を含む委譲には、配布物本文の記述規則を作成時の予防観点として引き渡す。引き渡す規約は「配布物の本文・コメントへ producer 側トレーサビリティ metadata（inline ADF-COVERS 宣言、要件行 ID、Decision ID 等の concrete ID）を直書きせず、対応関係は repository top-level の `traceability/` 配下 sidecar へ登録する」という作成先規約である。作成時予防と事後検知（配布依存境界 checker の source profile 検査等）は両面運用であり、予防観点の引き渡しは検知機構の代替にも検知機構の変更にもしない。配布物を作成しない委譲（producer 側文書の変更のみ等）では、対応宣言の作成先は成果物の配布境界で決定する既存規約（producer 側成果物は inline 宣言または sidecar のいずれか）に従い、この引き渡しを適用しない。本項目と ADF-COVERS 宣言付与の正の義務は同一対象・無矛盾であり、付与義務が対応関係を「付与する」ことを要求するのに対し、本項目は配布対象成果物の場合の宣言の「作成先」を委譲 context へ規約として引き渡す。記述規則と両面運用契約の正規所有は配布依存境界 Design（「配布物本文の記述規則」「事前書き込み gate と最終 gate の契約」の各節）が所有し、本 reference は再定義しない
- **実行担当の報告要素と途中報告の引き渡し**: 委譲 prompt で、実行担当は事実・結果、停止（再開条件を含む）、判断変更の影響対象を報告すること、委譲要求（委譲起動）は実着手と同一視されないため、実装または検証に実着手した事実を報告すること（取りまとめ側が進行状況の開始日時を初回設定する）、工程終了（result 確定）を待たず確定した停止・判断待ちを途中報告できることを指示する（報告契約は `agentdev-case-run-execution-adapter` 参照）。取りまとめ側の記録反映は本 reference STEP-S5「工程記録の取りまとめ反映」参照
- **L2 タイムスタンプ計測**: 委譲起動直前・直後に壁時計タイムスタンプ（JST）を記録し、実行担当サブエージェント実行時間を計測する。併せて STEP-S3（worktree 設置）と STEP-S6（クリーンアップ）の開始・終了時刻を記録する
- 委譲プロンプト、前置 gate 結果の引き渡し（staleness check 差異、配布依存境界の違反ベースライン、AUTOGEN 索引再生成の必須指示）、test strategy 項目の test-fix ループ、実行担当サブエージェントの責務（目標分解、各 criterion に observable evidence を要求、品質ゲートの実行、test-fix ループ）、委譲起動失敗・異常終了時の扱い（即 `failed` とせず実装完了・検証未完了として扱う）の詳細は `agentdev-case-run-execution-adapter` スキルを参照
- **bun test フル suite 正規形**: test strategy の検証で bun test フル suite を実行する場合、正規形（3 cwd 分割実行・./ prefix・環境ラベル）に従う。正規形の規定は `agentdev-quality-gates`（QG-4 bun test フル suite 正規形）を正とする。3分割は integrity suite、src 側 skill script テスト、repo ルート系 guard テストで構成し、各実行の cwd はリポジトリルート（worktree root または main root）に統一する。**bun test 全体実行の実行指示は timeout を明示指定する（300〜600 秒を標準とする。全体実行の実測所要時間が既定 timeout を超えるため）**。実行担当サブエージェントは PR 本文に各分割実行の実行 cwd・起動コマンド形式・timeout 指定値・環境ラベル（worktree または main、junction 伝播状態、依存パッケージ状態）と fail 全件の由来分類（既知欠陥・環境依存・当該変更起因）を記録する。当該記録はフル suite 受理判断の機械受理基準（`agentdev-quality-gates` QG-4 の bun test フル suite 正規形・機械受理基準）を満たす形式で記録する。受理判断は記録の機械的検証により行われ、手動判断（記録を伴わない裁量判断）で代替しない。テスト環境前提（worktree の node_modules 未伝播と `bun install` 前置、main からの読取専用実行）は `agentdev-git-worktree` の worktree 構造的制約を参照する。起動コマンド（`<integrity-detector-skill>` は対象リポジトリの integrity 検査 skill 名に解決する）:

  ```bash
  bun test ./.opencode/skills/<integrity-detector-skill>/scripts/
  bun test ./src/common/skills/
  bun test ./.opencode/plugins/ ./scripts/
  ```
- **引き渡し**: 割り当てられた1 Issue の Issue番号、worktree root（相対パス指定、worktree 内制約）、ブランチ名、PR base（main。rebase・同期基準も main を参照）
- **構造化文脈の直列化（委譲時）**: 委譲プロンプトの入力（inputs）内に構造化文脈（10意味）を構造化して直列化する。直列化形式、制約（全文履歴・巨大な計画本文の複製禁止、正規情報源の非代替、初期文脈としての利用と再確認の維持）は `agentdev-case-run-execution-adapter` スキルの委譲プロンプト雛形「構造化文脈の直列化（委譲時）」に従う。前工程で確定した事項は Issue 本文（関連 ADR 拘束条件等）と durable state から構成する。canonical_references の各項目は、配布物参照において目的判別（正規原本確認、実行時投影確認、双方整合確認）を含める。判別は `agentdev-workflow-lifecycle` スキルの参照先解決ポリシー（`references/reference-resolution.md`）に従う
- **PR URL 受領**: 実行担当サブエージェントが直接 PR 作成を行い、PR URL を委譲 result として返却する（PR URL フォールバック検索は使用しない）
- **case-run 本体は実装方針を生成・審査しない**: 実装方針の形成、adversarial-review 呼出、結果反映は委譲内で adapter の委譲契約に従い、最初の実装変更前に実施する。case-run 本体が実装方針を生成、保持、審査するステップを新設しない。委譲 result（4状態）のみで委譲内の結果を受領する
- **adapter 委譲内 adversarial-review**: 発動条件判定と review 呼出は adapter 委譲内で実行担当サブエージェントが分離して実施する。default-on、skip 条件（実装方針が自明で意味的決定が存在しない場合）該当時は省略して従来フローを継続する。ユーザーが review の実施を明示的に指示した場合は通常のユーザー指示としてその場で実行する（専用の検出・フラグ・Issue 本文への専用保存・後工程への専用伝播・skip 条件の専用上書き処理を持たない）。skip 時は判定理由と代替自己反証（却下案・緩和策・unresolved なしの確認）を PR 本文へ必須記録する（silent skip の防止）。実装方針限定、blocked 遷移（(1) 既確定文書の変更・追加・撤回が必要、(2) 要件・仕様問題の検出、(3) unresolved な本質的争点またはユーザー判断事項が残る）の詳細は `agentdev-case-run-execution-adapter` 参照
- **background 委譲の起動消失の回復**: background 委譲の起動直後消失を検知した場合、durable state（worktree の git status、PR 存在、Issue コメント）で実行の帰属を確認する。実行未試行と判定した場合は同期実行によらず background での再委譲（親 orchestration が所有する起動間隔契約に従う）を行い、background 再委譲の起動失敗が継続する場合は、Design が所有する再試行計上契約に基づき delegation-unavailable として再開可能な停止報告へ確定する。実行中断と判定した場合の継続判断も当該 durable state に基づく。実行並列上限（共有 active Issue task 枠）は case-auto orchestration stage 3 が単一所有する（詳細は `agentdev-case-run-execution-adapter` 参照）

### Result

- 委譲 result（4状態: completed-pr / blocked / failed / delegation-unavailable）、L2 タイムスタンプ

### Evidence

- 委譲起動記録、result（PR URL または Issue コメント SSoT）、L2 タイムスタンプ

### Completion Verification

- result が4状態のいずれかで受領されていること。completed-pr 時は PR URL が取得されていること

### Resume-Idempotency

- PR 未作成かつ result 未確定の場合、委譲フェーズから再開できる。委譲起動失敗・異常終了時は即 `failed` とせず実装完了・検証未完了として扱い、worktree の git status と残留変更で帰属を確認する（詳細は adapter skill の異常終了時事後処理参照）

## STEP-S5: result 処理・配布依存境界 最終 gate

### Purpose

委譲 result を4状態契約で処理し、実装後の worktree HEAD に対して配布依存境界の最終 gate を適用する。

### Input Resolution

1. SSoT 再構成: 委譲 result、PR 本文（completed-pr 時）、Issue コメント（blocked/failed 時）、worktree HEAD の実ファイル
2. identifier 保持: Issue番号、PR番号
3. 最小 scalar: L2 タイムスタンプ（STEP-S3/S4 計測分の受け渡し）
4. runtime artifact: なし

### Preconditions

- STEP-S4 の委譲 result を受領している

### Procedure

- **委譲応答の3点ゲート（最終ゲート）**: result 4状態処理の前に、委譲応答の4状態 result（completed-pr / blocked / failed / delegation-unavailable）・commit hash・PR URL の3点を必須検査する。不足する委譲応答を「要約で完結した completed-pr」として扱わず、再開（再委譲または継続指示）する。実装・検証の要約は3点検査の通過を代替しない。verify-only closure（PR も carrier commit も存在しない Issue 完了）は SSoT コメント契約の別経路として既存どおり扱い、3点の不足判定を適用しない（詳細は `agentdev-case-run-execution-adapter` 参照）。実行契約を生成した合意の変更が反映と読み戻し確認なしに残る場合、旧実行契約に基づく最終受け入れを行わず、反映と読み戻し確認（STEP-S4「合意変更時の旧実行契約消費防止」参照）を成立させた後に受け入れを判断する
- **result 4状態処理**（`agentdev-case-run-execution-adapter` の result 契約）:
  - **completed-pr**: 実装完了、PR作成済み。PR番号を受け取り最終 gate（後述）へ。成功成果は PR 作成である。verify-only closure（PR も carrier commit も存在しない Issue 完了）ではこの限りではなく、検証証跡は SSoT コメント（Issue コメント）へ記録する（references/single.md「verify-only closure の検証実行と SSoT コメント記録」参照）
  - **blocked**: 回答可能な blocker。詳細本文は Issue コメントに SSoT として記録済み（実行担当サブエージェント責務）。エラー処理に従い停止、ユーザー報告
  - **failed**: repository context で回答不能な blocker。詳細本文は Issue コメントに構造化して記録済み。エラー処理に従い停止、ユーザー報告
  - **delegation-unavailable**: 実行インフラが委譲を起動できなかった状態。実行未試行のため `pending` に戻す
- **infra-transient 分類（停止報告への付随。result enum への追加なし）**: ツール基盤（harness・Custom Tool 実行環境）の故障に起因する停止は、Case 失敗（blocked / failed）と区別して infra-transient（ツール基盤故障）分類として停止報告へ付随させ、停止報告に回復経路（supervisor 等による harness 再起動による回復の見込みと durable state からの冪等再開）を含める。判定条件（単一ツール恒常失敗・プロセス生存・再試行無効・他経路正常の4条件同時成立）の正規所有は case-auto Design「停止理由分類」節である。infra-transient は result 契約（4状態）の第5状態ではなく、既存の停止報告に付随する停止理由分類である。harness 側の修正（fresh process 分離・自動再初期化）は本リポジトリの対象外とする
- **工程記録の取りまとめ反映（result 受領時・途中報告受領時）**: 委譲 result と途中報告（確定した停止・判断待ち）の受領内容から記録契機を判定し、記録コメント投稿と本文進行状況・結果セクション更新を実行する。着手・引き渡し・再開は記録契機ではなく、着手は進行状況の開始日時（初回実着手。停止・再開で上書きしない）、引き渡しと再開は本文・PR で工程移行を表現する。実行担当の報告（事実・結果、停止〔再開条件〕、判断変更影響）を反映の入力とし、case-run 本体は報告を解釈して記録へ構造化する。対応は次のとおり:
  - **実着手**: 実行担当から実装または検証に実着手した事実を報告された時点で、進行状況の開始日時を初回設定する（委譲要求〔STEP-S4 の委譲起動〕は実着手と同一視しない。停止・再開で開始日時を上書きしない）
  - **停止**: result blocked / failed / delegation-unavailable 受領時、および途中報告で確定した停止を受領した時点。停止コメントには再開条件を必須記録する。停止の通知を遅らせない
  - **再開（記録コメントなし）**: 再委譲・継続指示で作業を再開させるときはコメントを生成せず、停止コメントに記録された再開条件の充足確認と最新条件（停止後に更新された合意・Definition）の引き渡しを PR 本文・会話記録で行う。開始日時は上書きしない
  - **判断変更**: 合意変更（Definition Amendment 受領等）を記録するとき。撤回対象（撤回される合意・判断の範囲）を必須記録し、記録・受領と実行への適用を区別する。影響しない作業を一律停止しない
  - **引き渡し（記録コメントなし）**: 実装完了（completed-pr）から完了判定（case-close）への工程移行はコメントを生成せず、PR 本文と Issue 本文で表現する
  - **完了（検証証拠のみ）**: 完了判定は case-close（判定主体）が担当し、case-run は完了判定を行わない（実行の申告だけで完了扱いにしない）。検証のみで完了する Issue では、実施した検証の証拠を検証証拠種別の記録コメントへ残す
  - **実行証拠報告は照合入力に限定**: 実行担当の実行証拠報告（PR 本文の検証差分セクション、合格申告を含む）は受入側（case-close）の照合対象に限定され、受入評価の母集団（判定対象）の正ではない。受入側は終了対象の正規完了条件から母集団を独立導出し、報告を正規条件と実行証拠の照合（部分証拠・根拠不足・必須条件欠落の拒否判定）に消費する。報告を母集団の生成に使わず、報告から必須条件を削除・重複・空化しても受入側は母集団との突合で欠落を検出する
  - 反映手順: 記録コメントは記録種別に応じた工程記録コメントテンプレート（`agentdev-workflow-templates` 選定）を用い、投稿前に記録コメント検証スクリプト（scripts/record-comments.ts、決定的処理。基本項目と種別別必須項目の検証）で検査する（fail-closed）。本文進行状況・結果セクション更新は同スクリプトの進行状況・結果セクション構築と既存本文への適用で本文を組み立て、Custom Tool `agentdev_gh` の comment_create / issue_update で実行する。投稿・更新の成否確認（読み戻し検証）は Tool VERIFY に委任する（部分成功時の再試行は既存の Tool 操作契約に従う）。Epic 本文への反映は本 STEP では行わない（case-close 単一書き手）
- **L2 タイムスタンプ受け渡し**: result 状態（completed-pr/blocked/failed）にかかわらず、STEP-S3（worktree 設定）、STEP-S4（実行担当サブエージェント実行）で計測した L2 タイムスタンプを result に含める。case-auto は本 L2 内訳を case-run 委譲の L1 壁時計時間の内訳として読み取る
- **STEP-S5-1: 配布依存境界の最終変更経路 gate（実装後、command 公開順序の STEP-S5 に対応）**: result が `completed-pr` の場合、STEP-S6 に進む前に、実装後の実際の worktree HEAD に対して最終 gate を行う（実装担当サブエージェントが追加した変更も含めて検査する）。本 gate は src 側（原本）と .opencode 側（投影）の双方反映検証を必須とする
  - 実行条件: result が `completed-pr` であり、PR 対象ファイルに `src/common/{commands,skills}/**` 変更を含む場合。当該変更を含まない PR（docs のみ等）ではスキップする
  - 実行コマンド（双方反映検証）:
    - src 側（原本）: `bun run .opencode/skills/<integrity-detector-skill>/scripts/check_distribution_boundary.ts --profile source --json`。現在の worktree（実装後 HEAD）の配布物原本ツリーを検査する
    - .opencode 側（投影）: 同スクリプトに `--profile link` を指定して `.opencode/` 投影を検査する。worktree は junction 未伝播（`agentdev-git-worktree` の worktree 構造的制約参照）のため投影が実体化していない場合は、位置引数（repoRoot）で junction 構成が維持された root を指定して読取専用実行し、実行環境と junction 伝播状態を環境ラベルとして gate 判定記録に含める。投影が実体化していないまま worktree で実行して検査対象がゼロとなった場合は gate-not-passed として扱う。link 検査は投影経路の健全性（投影が原本を正しく反映する状態）の検証であり、PR 変更分の内容検証は src 側検査が担う
  - **checker コマンドの実行経路（安定実行経路）**: stdout 証跡（機械可読レポート）を要する checker の実行は、モジュール import 経由（`node --experimental-strip-types`）を標準経路とする。bun run 等の CLI 経由で実行する場合は、Windows + bun 環境で process.exit の終了タイミングにより stdout レポートが失われることがあるため、process.exit 前に stdout の flush を保証する終了手順を例外経路として用いる。契約は checker 実行契約（checker 実行契約と検出基盤規則 Design）「安定実行経路」節を参照する
  - **checker コマンドの stdout 退避形式**: 本 gate の checker コマンドは exit code が意味を持つコマンド（非ゼロ exit = 違反検出）であるため、実行と stdout 取得は 検証コマンドの stdout 証跡退避形式（`spawnSync` による status/ stdout 分離取得 + `fs.writeFileSync` の UTF‑8 明示書き出し）。非ゼロ exit 時も JSON 実行結果（Evidence）を保持する
  - 検出結果の分類: 検査エラー（読込不能、未分類エントリ、adapter 起動失敗）は全て gate-not-passed として扱う。clean として通過させない。source / link いずれかの profile で違反または検査エラーが残存する場合、最終 gate 全体を通過扱いにしない（投影分離原則）
  - **checker 実行記録の欠落検出**: 本 gate の合格判定では、PR 本文の品質メトリクス表「checker 実行記録（配布依存境界）」必須行（`agentdev-workflow-templates` の PR テンプレート）に src 側・.opencode 側の実行結果が記録されていることを確認する。src/common/{commands,skills}/** 変更を含む PR で当該行が空・未記載の場合は記録欠落として扱い、gate 合格の前提を満たさない（記録欠落を検出した場合は gate 合格判定を行わず記録を補完させる）。該当変更を含まない PR では「スキップ（該当変更なし）」の記載を確認する。STEP-S3-5 事前 gate との二重構造（前置 gate と最終 gate の重畳、case-close 側 STEP-3-1 / E4-1 との重畳）は維持する（single.md STEP-S3-5 参照）
  - 違反検出時の停止契約（adapter result `blocked` とは区別）: 違反検出時は PR 本文の `## Findings / Capture候補` セクションに `### distribution-boundary` 小見出しで記録し、STEP-S6 へ進まず case-run を停止する。adapter result は `completed-pr` のまま変更せず、adapter result 契約の `blocked` へ上書きしない。停止理由は「配布依存境界 最終 gate 違反（PR 本文記録済み）」と報告し、SSoT は PR 本文とする。next action は同一 Issue で case-run を再実行し違反を修正する（worktree+ブランチ存活時は STEP-S3 をスキップし STEP-S4 から再開、べき等）。case-close へは進めない

### Result

- result 処理結果（4状態別）、最終 gate 判定（合格 / 違反停止 / スキップ）、L2 受け渡し
- 工程記録反映結果（記録契機判定、記録コメント投稿・本文進行状況・結果セクション更新の実施。検証スクリプトによる事前検査結果を含む）

### Evidence

- result 状態と PR URL または Issue コメント、最終 gate の JSON 実行結果（source / link 各 profile、環境ラベル含む）

### Completion Verification

- 委譲応答の3点ゲート（4状態 result・commit hash・PR URL）を通過した result の4状態処理が完了していること。completed-pr + src/common 変更時は双方反映検証（source / link 両 profile）を伴う最終 gate 合格（または違反記録済み停止）であること

### Resume-Idempotency

- 最終 gate は worktree HEAD に対する読取検査であり再実行可能。違反修正後の再実行で合格すれば同一 result（completed-pr）から STEP-S6 へ進む

## 関連 STEP

- 前: STEP-S3（single.md）
- 次: STEP-S6（single.md）

## 関連 Capability Skill

- `agentdev-case-run-execution-adapter`: adapter protocol、result 契約、adapter 委譲内 adversarial-review、異常終了時事後処理
- `agentdev-workflow-orchestration`: 障害伝播、capture 境界
- `agentdev-quality-gates`: QG-4 bun test フル suite 正規形（機械受理基準）
- integrity checker skill（repo 固有）: check_distribution_boundary.ts（--profile source / --profile link）、generate_indexes.ts（AUTOGEN 索引再生成）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（単一 Issue のみ処理、委譲1件の実装実行委譲、result 4状態契約。Epic・Wave の実行制御は case-auto orchestration stage 3 が単一所有）
- ガードレール（完了条件チェックボックスの評価・更新は case-close QG-4 の責務、`POL-completion-checkbox-single-writer`）
- 不変条件（blocked/failed の SSoT は Issue コメント、completed の SSoT は PR 本文。verify-only closure では検証証跡は SSoT コメントへ記録し carrier commit を作成しない）
- 不変条件（外部実行ハーネス中間成果物の非扱い、PR URL 受領）
- 不変条件（Design確定候補は PR 本文の別セクションに記録）
