# STEP-7/8: コンフリクト解消 Level 2/3・完了報告（conflict-resolution-and-reporting）

> 本 reference は `agentdev-workflow-case-auto` SKILL.md の制御平面（STEP 一覧）STEP-7, STEP-8 詳細である。
> コンフリクト解消 Level 2/3（インライン case-run 再実行、オーケストレーション級判断）と完了報告（L1 タイムスタンプ、4次元集約、OU処理ループ、停止時集約報告、取りまとめ経路〔反映・読み戻し確認・引き渡し・未反映回復〕）を提供する。

## STEP-7: コンフリクト解消 Level 2/3

### Purpose

case-close からエスカレーションされた PR マージコンフリクトを Level 2（インライン case-run 再実行）と Level 3（オーケストレーション級判断）で解消する。

### Input Resolution

1. SSoT 再構成: 両 PR の diff、コンフリクト箇所、マージ順序候補
2. identifier 保持: PR番号群、Issue番号群
3. 最小 scalar: Level 2 再実行回数（最大2回、元の並列実行を含む計3回）
4. runtime artifact: なし

### Preconditions

- PR マージコンフリクト発生時（case-close から Level 1 失敗エスカレーション受領時）

### Procedure

PR マージコンフリクト発生時は、以下3レベルのエスカレーションで解消を図る。
各レベルを試行しても解消できない場合のみ次のレベルへ進む。
**機械的競合（rebase で自動解決可能）は停止条件に含まず**、Level 1 で case-close が解消する（Level 1 は case-close の責務、本 STEP では Level 2/3 の case-auto 責務を定義する）。

| Level | 担当 | 手順 | 失敗時 |
|---|---|---|---|
| Level 1 | case-close | `git rebase` による機械的解消、自動解決時は再マージ | case-auto へエスカレーション |
| Level 2 | case-auto | 両PR の diff を読み取りコンフリクト箇所を特定しコンフリクト文脈を付けてインライン case-run を再実行、最大2回（元の並列実行を含む計3回の case-run 実行） | Level 3 へ |
| Level 3 | case-auto | マージ順序変更、blocked 単位の隔離 | 停止（STEP-4 停止条件 (8)） |

Level 2 コンフリクト文脈付きインライン case-run 再実行、Level 3 オーケストレーション級判断、発生元非依存、停止条件の段階化の詳細は `agentdev-workflow-orchestration` を参照。

### Result

- コンフリクト解消（Level 2 または 3 で解消時）→ STEP-3 へ戻り再マージ
- 解消不能時（Level 3 失敗）→ STEP-4 停止経路（停止条件 (8)）

### Evidence

- Level 別の試行記録（再実行回数、マージ順序変更、blocked 隔離）、解消/停止の判定結果

### Completion Verification

- 各レベルを試行しても解消できない場合のみ次レベルへ進んでいること。機械的競合を停止条件に含めていないこと

### Resume-Idempotency

- Level 2 再実行は回数上限（最大2回）を durable に数え、上限到達時は Level 3 へ遷移する。解消済みコンフリクトの再処理は行わない

## STEP-8: 完了報告

### Purpose

全工程完了または停止判定時の完了報告を、L1 タイムスタンプと結果状態4次元の集約を含めて出力する。

### Input Resolution

1. SSoT 再構成: 各工程の完了結果、Epic Issue 本文ステータス追跡テーブル（読取のみ）、L1 工程別タイムスタンプ
2. identifier 保持: Issue番号、PR番号、OU ID
3. 最小 scalar: 開始時刻・終了時刻・所要時間
4. runtime artifact: なし

### Preconditions

- 全工程完了 または 停止判定（STEP-4/5/6/7 のいずれか）

### Procedure

最終工程（case-close 委譲）の完了報告をそのまま出力する。
Epic Issue を伴う Wave 反復実行時は、完了・blocked・failed 子Issue 一覧を含める（Epic Issue 本文ステータス追跡テーブルから読み取り、case-auto は書き込まない、`POL-epic-tracking-single-writer`）。
停止時は完了済み OU・進行中 OU・未実行 OU・再開可能な次コマンドを報告する（様式と生成経路は「停止時集約報告」節）。

#### 停止時集約報告（取りまとめ経路）

case-auto 実行契約の停止時報告要件（完了済み、進行中、未実行の各委譲単位と再開に必要な次コマンドの報告）は、本スキル配下の実行コード `scripts/src/records-report.ts` の決定的関数で生成し、停止報告（STEP-4 の停止理由分類、resume_command）と一体で出力する。

- **集約**: 対象群を完了済み / 進行中 / 未実行に分類する。観測不能な対象は進行中に含めず「観測不能」として明示する（観測不能を進行中と断定しない）。後続不能確定（blocked / failed / delegation-unavailable）の対象は完了済みに含めず、確定結果を対象行に明示する
- **次コマンド**: 再開に必要な次コマンドと再開点（どの durable state から再開するか）を報告に含める
- **現在地要素**: 停止理由分類、次の行動、最新記録参照、タイミング情報を含める。様式は Case Issue 工程記録モデルの現在地項目（工程、進行状態、次の行動、停止・待機理由、最新記録参照）と整合させる
- **生成経路**: `aggregateUnits` / `buildStopReport` / `formatStopReport`（集約、報告構造、Markdown 整形）。出力は停止時の記録コメント（再開条件を必須項目として含む）として残し、会話コンテキストの記憶に依存しない
- **再開時の最新条件**: 集約関数は入力として与えられた現行観測のみに依存する。再開時は durable state（Issue/PR、Epic Issue 本文、L1 タイムスタンプ、対象別・stage 別観測証跡）から再構成した最新観測を与え、停止時の集約を再利用して旧条件で継続しない

#### 取りまとめ経路（反映・読み戻し確認・引き渡し・未反映回復）

Case Issue 工程記録モデルの取りまとめ責務（本文・コメント・Epic への反映、読み戻し確認、引き渡し、未反映の回復）を、記録契機ごとに次の経路で実行する。反映面（Case Issue 本文 / Case Issue コメント / Epic 本文）は独立して管理し、部分成功（コメントのみ成功、本文のみ成功、Epic のみ未反映等）を区別する。

1. **反映計画**: 記録契機（着手、引き渡し、停止、再開、判断変更、完了）ごとの反映対象を反映面別に列挙する。生成経路は `planApply`（送信試行済みと未送信を区別した4区分: applied / retry / verifyFirst / pending）
2. **反映**: 未送信対象（pending）を Custom Tool 経由で反映する。Epic 本文面は Epic 反映の書込み経路の正規所有に接合する（取りまとめ経路は反映計画と読み戻し・不足判定までを担い、書込み経路を複製しない）。記録契機での本文・コメント更新の実装本体も同様に各正規所有に属する
3. **読み戻し確認**: 反映後に対象面を読み戻し、部分成功を確定する。送信試行済みで読み戻し未確認の対象（verifyFirst）は、読み戻し完了まで再試行対象に含めない（未確認のまま再送すると重複投稿を生む）
4. **不足分の再試行**: 読み戻しで不足が確認された対象（retry）のみを再試行し、存在確認済みの対象（applied）は再送しない。更新失敗・結果不明を成功扱いにしない
5. **引き渡し**: 次工程・再開時への引き渡しは既存の工程間の状態引き継ぎ（STEP-3「工程間の状態引き継ぎ」）に従い、未反映の有無を含む反映状態を引き渡す。未反映の重要条件に基づく新作業開始を行わない
6. **未反映の回復**: 未反映対象と識別情報から回復計画を生成する（生成経路は `buildRecoveryPlan`）。回復用のローカル記録は未反映内容と識別情報に限定し、第二の作業定義・恒久状態源として扱わない。失敗注入を伴う回復規律の実行本体は回復規律の正規所有に属する
7. **成果確定と記録完了の区別**: 成果の確定（PR マージ、Issue クローズ等の処理成果）と記録・終了処理の完了（全反映対象が読み戻しで存在確認済み）を区別して報告する。成果確定済みでも記録未完了の場合は終了処理を未完了として扱う（`completionState` 区分）

**tmp/ 残存確認**: 当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないことを確認する。残存時は workflow 側 cleanup 規定（当該実行内での削除）に従って処理し、残存ファイルと対応結果を完了報告に明示する。

完了報告には以下を含める（停止時フォーマットを含む）。

- **停止理由分類**: STEP-4 経由、または adversarial-review 由来の user-decision-required
- **開始時刻・終了時刻・所要時間**: 人間が読みやすい形式
- **工程別タイムスタンプ内訳（L1）**: case-open / case-ready / case-run / case-close（例外経路時は case-revise を含む）、スキップした工程は除外可、case-run の L2 内訳は case-run result から読み取って含める
- **対象別・stage 別の開始/完了観測証跡**: 各 orchestration stage における対象別の開始/完了を観測可能にするため、L1 タイムスタンプを対象別拡張（対象識別子付きの開始/完了時刻）で記録するか、等価の bg task ID と Issue status 遷移記録（pending → running → completed / blocked / failed / pending 戻しの遷移）を保持する。並列実行が逐次処理へ退化していないこと、stage 間の全対象収束（fan-in）前に次 stage が先行開始していないことの判定、および完了報告の stage 別集約は、この観測証跡に基づいて行う
- **インライン実行の記録**: case-run をインライン実行した旨
- **orchestration stage 別結果・破棄回復記録**:
  - stage 1 case-open（例外経路時は case-revise を含む）/ stage 2 case-ready / stage 3 case-run / stage 4 case-close の各対象別結果
  - 並列起動不能で停止した場合は起動試行履歴（試行回数、起動成立数、最終成功起動時刻）を含める（case-auto Design「停止理由分類」節）
  - bg task 破棄を検知して回復した場合は状態区分と回復結果
- **結果状態の4次元報告**:
  - (1) 工程結果 pass/warn/fail
  - (2) artifact_action 適用結果 applied/skipped/failed/no-op
  - (3) 定義適用工程の完了状態: 定義適用完了・警告付き工程完了・定義適用未完了
  - (4) OU ライフサイクル完了状態: Issue 作成・PR 作成・PR マージ・Issue クローズ の各完了/未完了
  - **warn を pass へ変換して集約しない**
  - **Phase 0 成功と OU 完了は別々に報告**

#### OU処理ループ

Standard flow の case-close（stage 4）完了後に未処理 OU が残存する場合は次 OU の処理を STEP-3 から開始（全 OU 処理完了時のみ全体完了報告）。
起動時対象集合は case-ready が確定した全 execution_unit であり、OU の必須依存は stage 内の直列化要因である（case-auto 実行契約。STEP-3 orchestration stage モデル参照）。OU 逐次処理は orchestration stage モデルを置き換えない。

### Result

- 完了報告出力（停止時フォーマットを含む）
- L1 タイムスタンプ、4次元集約、OU処理ループ状態、tmp/ 残存確認結果

### Evidence

- 完了報告出力（停止理由分類、タイムスタンプ内訳、stage 別結果、結果状態4次元、OU処理ループ状態、tmp/ 残存確認結果）。停止時は集約報告（完了済み/進行中/未実行/観測不能、次コマンド）と取りまとめ経路の反映状態（applied / retry / verifyFirst / pending 別の対象一覧、completionState 区分）を含める

### Completion Verification

- warn を pass へ変換せず集約していること。Phase 0 成功と OU 完了を別々に報告していること。Epic Issue 本文のステータス追跡テーブルから読み取りのみで書き込んでいないこと（Epic テーブル単一書き手制約）。当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないこと（残存時は対応結果を報告済みであること）。停止時は完了済み/進行中/未実行が集約され、次コマンドが報告されていること。観測不能対象が観測不能として明示されていること。反映面ごとに部分成功が区別され、読み戻し未確認対象が再試行対象に含まれていないこと（重複投稿防止）。成果の確定と記録・終了処理の完了が区別して報告されていること

### Resume-Idempotency

- 報告のみで副作用を持たない。停止時は完了済み OU・進行中 OU・未実行 OU・再開可能な次コマンドを durable state（Issue/Epic）から再構成して報告する。取りまとめ経路の集約・計画関数は現行観測のみに依存する純関数であり、再開時は durable state から再構成した最新観測を与えて再計画する（停止時の集約・計画の再利用による旧条件継続をしない）。読み戻し未確認対象を再送せず、不足確認済み対象のみを再試行するため、回復の再実行は冪等である

## resume point

- コンフリクト解消状態（Level 1/2/3 の進行、解消/停止）
- 完了報告出力状態
- L1 タイムスタンプ内訳、4次元集約結果

## 関連 STEP

- 前: STEP-3（input-resolution-and-orchestration）、STEP-4（stop-and-decision-resolution）、STEP-6（bounded parent decision resolution 上位合意矛盾/新規ユーザー判断時）
- 次: なし（workflow 終了、または OU処理ループで STEP-3 へ戻る）

## 関連 Capability Skill

- `agentdev-workflow-orchestration`: コンフリクト解消 Level 2/3 詳細、オーケストレーション級判断、停止条件の段階化、bg task 破棄検知時の回復
- `agentdev-case-run-execution-adapter`: Level 2 インライン case-run 再実行時の委譲契約
- `agentdev-git-worktree`: コンフリクト解消 rebase パス補助、並列実行安全ステージング
- `agentdev-epic-tracker`: Epic Issue 本文ステータス追跡テーブル（読取のみ、Epic テーブル単一書き手制約）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（成果物本文 verbatim、判定結果・調査過程・中間ログ・読解メモは要約）
- ガードレール（case-auto は独自の操作単位ステータス追跡を持たない、Epic Issue 本文書き込みは case-close 単一書き手、case-auto は読取のみ）
- 不変条件（委譲工程の完了結果のみを親コンテキストに保持）
