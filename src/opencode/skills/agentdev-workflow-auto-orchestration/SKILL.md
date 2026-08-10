---
name: agentdev-workflow-auto-orchestration
description: case-auto コマンドの workflow 実装本体（最大自走モード orchestration）。USE FOR: case-auto Step 1〜8 の実装詳細（入力解決、工程分岐、委譲起動、インライン case-run、Wave 反復制御、L1 タイムスタンプ計測、結果状態の4次元集約、停止条件判定、停止理由分類、完了報告）、bounded parent decision resolution、コンフリクト解消モデル Level 2/3、adversarial-review 停止伝播（経路H）、子 task bg task 破棄検知時の回復、orchestration stage モデル。DO NOT USE FOR: case-auto Command 公開契約（入出力、ガードレール）の所有（case-auto.md command 定義参照）、case-run 単位の orchestration（`agentdev-workflow-orchestration` 参照）、work_type 判定（`agentdev-workflow-lifecycle` 参照）、Capture 境界詳細（`agentdev-workflow-orchestration` 参照）、委譲起動の具象実装（AGENTS.md および harness delegation 参照）
---

# case-auto workflow orchestration 実装本体

case-auto コマンドの workflow 実装を所有する Workflow Skill（責務3層分化、workflow-skill-model SPEC 準拠）。case-auto command 定義は公開 interface / dispatch のみを所有し、本スキルが workflow 実装の権威情報源となる。

## 原本（SSoT）

本スキルの原本仕様は case-auto command SPEC および関連横断 SPEC である。SPEC を正規原本とし、SKILL.md は control plane と workflow 実装本体を保持する。重複または不一致がある場合は SPEC を正とする。extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/decisions/specs）のみを前提とし、docs/specs 配下の内部構成（foundations, responsibilities 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-workflow-auto-orchestration.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **docs/specs 配下パスの固定知識化の禁止**: extension に列挙されていない docs/specs 配下のパスを固定知識として参照しない。スキル本文に具体的な project docs 内部パスを直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

case-auto command から引き渡される:

- 入力モード判定結果（Issue番号/URL 入力モード または 要件doc入力モード）
- 解決済み Issue番号/URL（Issue番号/URL 入力モード時）
- 読込済み要件doc（要件doc入力モード時）
- work_type 参考情報（要件doc入力モード時）
- 実行開始時刻 `case_auto_started_at`（Step 1 で記録）

## 出力

- 各 STEP の実行結果（停止、進行、完了）
- 停止時: 停止理由分類、停止時刻、経過時間、工程別タイムスタンプ内訳、再開可能な次コマンド
- 完了時: 最終工程（case-close 委譲）の完了報告に加え、L1 タイムスタンプ内訳、結果状態の4次元報告、インライン実行記録、orchestration stage 別結果

## 副作用

- worktree root 配下でのファイル編集は行わない（case-auto は orchestration のみ）
- GitHub Issue/PR の読み書きは各工程のコマンド委譲経由（`agentdev-gh-cli` 経由）
- 子 task bg task の起動、状態管理、破棄検知時の回復は本スキルが制御する

## control plane（STEP 遷移）

case-auto の8 STEP（Step 1〜8）に加え Step 7-1（停止理由分類）の遷移を管理する。各 STEP は resume point 単位（STEP resume point 契約、会話記憶非依存）であり、会話記憶に依存せず永続状態（Issue/PR/Epic）から再構成可能である。

| STEP | 名称 | 役割 | 次 STEP |
|---|---|---|---|
| Step 1 | 入力解決 | 実行開始時刻記録、入力モード分岐 | Step 2（要件doc入力）/ Step 3 Issue分岐（Issue番号/URL入力） |
| Step 2 | work_type 読取 | draft-data から work_type 取得（参考情報） | Step 3 |
| Step 3 | 工程分岐 | artifact_actions 存在による動的判定、auto_gate preflight | Step 4 |
| Step 4 | 各工程の実行 | 委譲起動、インライン case-run、Wave 反復制御、結果状態4次元集約 | Step 5 / Step 7（停止時） |
| Step 5 | 工程間の状態引き継ぎ | Issue番号、PR番号、RU ファイルパス、capture 対象情報の保持 | Step 6 / Step 8 |
| Step 6 | 複数REQ対応 | case-open の Issue 構造ルールへ委譲 | Step 4 OU処理ループ / Step 8 |
| Step 7 | 停止条件の検出 | 11項目の停止条件判定、停止時タイミング情報の追記 | Step 7-1 |
| Step 7-1 | 停止理由分類 | 8分類軸で停止理由を報告 | Step 8 |
| Step 8 | 完了報告 | 最終工程完了報告、L1 タイムスタンプ内訳、結果状態4次元報告 | （終了） |

OU処理ループ: Standard flow の case-close 完了後に未処理 OU が残存する場合、Step 2 から次 OU 処理を開始する。全 OU 処理完了時のみ全体完了報告とする。

## Step 実装詳細

### Step 1: 入力解決

`case_auto_started_at` に JST（Etc/GMT-9）で実行開始時刻を記録する。Step 7（停止時報告）・Step 8（完了報告）での所要時間算出の基準として使用する。

入力モード分岐:

- **Issue番号/URL入力モード**: 引数が数値のみまたは GitHub Issue URL の場合、Issue番号として解決し Step 3 の case-run移行モードへ分岐。要件doc入力より優先。要件docの入力解決・work_type読取はスキップ
- **要件doc入力モード**:
  - (1) 引数なし: `.agentdev/drafts/req-draft-*.md` 全件処理（デフォルト）。1件以上なら全件（1件含む）処理、0件なら停止し req-define 実行またはパス指定を求める。複数draftは無確認で全件処理
  - (2) 明示パス指定: 当該draftのみ。不在時は停止しエラー報告
  - (3) セッション指定キーワード（例: `req-define セッション`、`req-define 上記の内容`）: セッション内要件docを参照。**暗黙判断は行わない**（AG-003）
  - (4) 特定不可: 停止
  - 複数draft読み込み時の順序制御は各draftの `operation_units` から `recommended_order` / `depends_on` に基づき決定

### Step 2: work_type 読取

入力要件docの `draft-data` から work_type を取得する（参考情報、パイプライン分岐の判定には使用しない）。

### Step 3: 工程分岐（`work_type` 固定分岐ではなく `artifact_actions` 存在による動的判定）

- **Issue番号/URL入力**: case-run → case-close（req-save、spec-save、case-open、work_type読取をスキップ）。Step 1 で解決した Issue番号/URL を case-run にそのまま渡す。draft-data の読取は行わない
- **artifact_actions ベース分岐**: `artifact: req` または `artifact: decision` entry → req-save を実行。`artifact: spec` entry → spec-save を実行（req-save の後、entry が空ならスキップ、`artifact_actions` フィールド不存在は後方互換で spec-save スキップ）。常に → case-open → case-run → case-close
- **auto_gate preflight**: `draft-data` の `auto_gate.auto_ready` が false または未解決 item（unresolved_questions/ unresolved_conflicts/ out_of_repo_operations/ stop_reasons）が残る場合は停止

### Step 4: 各工程の実行

#### 実行モデル原則

- **委譲工程（req-save / spec-save / case-open / case-close）**: 実行担当サブエージェントとして起動。req-save / spec-save は統合委譲で順次実行（AG-005）。case-open / case-close は各コマンド委譲契約に従い起動。委譲起動不能時に `delegation-unavailable` 報告（AG-004）。各工程は対応するコマンド定義を authoritative source として実行し、本スキルは手順の再実装を行わない
- **case-run（インライン実行、AG-001/002）**: case-auto が case-run.md を authoritative source として読み込み、準備/クリーンアップフェーズを自ら実行。実行担当サブエージェント委譲フェーズでは case-auto から直接実行担当サブエージェントへ委譲（委譲起点の折りたたみ、v2:ADR-0137）。adapter skill（`agentdev-case-run-execution-adapter`）を case-auto が読み込む
- **QG-1〜QG-4 の継承**: 各工程で適用。詳細は `agentdev-quality-gates` 参照
- **親コンテキスト非累積（G28）**: 各委譲の完了結果（Issue/PR番号、pass/warn/fail）のみを親コンテキストに保持し、委譲工程内部の調査過程、中間ログ、読解メモを親コンテキストに累積しない。case-run インライン実行時のコンテキスト管理は harness の機能で対応し、親コンテキスト非累積は case-run インライン実行時の例外として取り扱う

#### OU処理順序

- 必須依存で結合した execution_unit 群は順次
- 必須依存のない execution_unit 群は並列
- 3つの「5件」文脈の区別: case-run 単位5件、orchestration stage 2 固定並列数5件（v2:ADR-0138）、Epic Wave 内子Issue 並列5件（v2:ADR-0125）。各々別文脈であり混同しない

#### クリーンアップ検証ゲート

ドラフト/RU 削除検証。case-open 完了後に実行し、req_draft / RU ファイルの残存がないことを確認する（G19）。

#### 委譲起動判定

AG-004 に従い委譲起動不能を判定する。委譲工程のインライン実行への切替えは行わない。genuine blocker（実装上の問題、スコープ外操作等）は Step 7 停止条件として扱い、`delegation-unavailable` 対象外とする。case-run インライン実行時の実行担当サブエージェントへの委譲失敗は case-run result 契約に従い処理し、本 `delegation-unavailable` 停止条件には該当しない。

#### Subagent 委譲プロトコル

- category 選定ガイドライン（G30）: 委譲先 command の責務と category 名の意味的距離を評価して決定。事務的手続き（Issue 作成、VERIFY、状態遷移等）には `unspecified-high` を推奨。`writing` category は執筆作業（docs 記述、REQ/ ADR/ SPEC 本文執筆等）のみに限定
- MUST NOT DO 必須化（G31）: 全ての subagent 委譲 prompt に MUST NOT DO セクションを必須とする。スコープ外作業（当該 command 責務外のファイル作成、REQ/ SPEC/ src の直接修正、文書監査、capture 境界を超える `.agentdev/` 直接変更等）を明示的に列挙

### Step 4-1: Wave 反復制御（Epic Issue 指定時）

case-auto が直接制御する（AG-003、G15）。case-run(#epic) への委譲は行わない。

1. case-auto が Epic Issue 番号を記録。Epic Issue 本文から Wave 構成、各子Issue ステータスを読み取る（読み取りのみ、Epic Issue 本文の書き込みは case-close の責務、G16）
2. case-auto が現在 Wave の ready 子Issue を選択し、各子Issue ごとにインライン case-run を実行（最大5件並列）。各子Issue の実行担当サブエージェントへ case-auto から直接委譲
3. Wave 内全子Issue の完了（completed-pr / blocked / failed / delegation-unavailable）を待機
4. completed-pr の子Issue がある場合、case-close(#epic) へ委譲
5. 残 Wave がある場合、次 Wave を実行（べき等）

#### 複数 execution_unit 並列 orchestration（v2:ADR-0129）

case-auto は case-open が生成した execution_unit 群（standard | epic の混在）を orchestration 対象とする。従来の「単一 Epic の Wave 反復制御」を「複数 execution_unit 群反復制御」へ一般化する。case-auto は case-open の判定結果に従い case-run(#epic) / case-run(standard) を起動する（薄いオーケストレーター原則、G13/G15/G21 維持）。Issue 階層決定、子 Issue 選択、Epic 化判定の判断ロジックは持たない。

並列実行の判定（連結成分ベース）:

- 必須依存がない複数 execution_unit 間（Epic 間、Standard 間、混在）は並列実行
- 同一 Epic 内の Wave 間は直列
- 技術的依存レベル（L0-L3）は並列判定軸から外す。ファイル衝突（L2）があっても並列を許容し、PR マージコンフリクトは後続 PR の rebase で解決する

グローバル並列上限は設定しない。case-run 単位の5件上限のみを制御対象とする。N 個の execution_unit が並列実行された場合、N×5 件の委譲同時起動リスクを許容する（運用監視対象、v2:ADR-0129）。

#### blocked 部分停止、ready 継続判定フロー

各 execution_unit の状態（closed/blocked/failed/running/ready）を読み取り、以下の判定フローで orchestration する:

| execution_unit 状態 | case-auto アクション |
|---|---|
| ready | 起動（case-run(standard) または case-run(#epic)） |
| running | 完了待機 |
| completed | case-close 相当処理へ進行 |
| blocked | 当該 execution_unit のみ停止。他の ready 対象は継続 |
| failed | 当該 execution_unit のみ case-close 対象外。他の completed-pr は case-close 対象 |

**終了条件**: 全 execution_unit が closed/blocked/failed になったら終了する。一部 blocked が残存する場合は partial blocked として報告する。

### Step 5: 工程間の状態引き継ぎ

各工程の起動結果（Issue番号、PR番号）を次工程の入力として渡す。加えて以下を最終工程まで保持する:

1. RU ファイルパス（case-open 委譲の RU 削除で使用）
2. capture 対象情報（case-close 委譲の learning/intake capture で使用）

### Step 6: 複数REQ対応

req-save 委譲の出力から複数 REQ doc または scale:large を検出した場合、case-auto は case-open の Issue 構造ルールを使用（G13）。req-save から case-open への状態引き継ぎ時、複数 REQ doc の保存結果をフィルタリング・再評価なしでそのまま渡す（G14）。Epic Issue 化の判定には関与しない（G21）。case-open の判定結果に従う。

### Step 7: 停止条件の検出

以下のいずれかを検出した場合、実行を停止し停止理由・現在地点・再開可能な次コマンドを報告する（11項目）:

1. req-define合意要件からの逸脱
2. 要件未合意のscope拡大
3. repo外実体変更の必要性
4. DB migration実行の必要性
5. deploy/applyの必要性
6. 認証・秘密・権限変更の必要性
7. CI/test/lint失敗がself-healing不能
8. コンフリクト解消モデル Level 1〜3 全てを試行しても解消不能なコンフリクト（Level 2 インライン case-run 再実行を上限回数 2回試行しても解消しない場合。機械的競合 Level 1 で自動解決可能は停止条件外。remote hash 不一致は停止条件）
9. 作成元不明branch/user-owned branch/他作業branchの削除検出
10. 未コミット変更の帰属不明
11. command 契約・実装不整合（execution_unit へ分割可能にも関わらず case-open が単一 Epic 子 Issue 上限により停止した場合を含む）

**停止時タイミング情報の追記**: 停止報告に `case_auto_started_at`、停止時刻（JST、人間が読みやすい形式）、経過時間、Step 4 で記録した工程別タイムスタンプ内訳（停止時点までの工程分）を含める。

### Step 7-1: 停止理由分類

Step 7 の停止条件を以下の分類軸で報告する（HITL 境界の変更ではなく、再開コマンド選択とユーザー通知の精度向上が目的）:

| 分類 | 対応停止条件 |
|---|---|
| req-define 合意要件からの逸脱 | (1) |
| command 契約・実装不整合 | (11) |
| 要件未合意のスコープ拡大 | (2) |
| repo 外実体変更 | (3)(4)(5)(6) |
| CI/test/lint 失敗 | (7)(8) |
| branch 削除検出 | (9) |
| 未コミット変更の帰属不明 | (10) |
| 上位合意矛盾 | bounded parent decision resolution で decision_context が現行正規成果物間の矛盾に起因する場合 |
| 新規ユーザー判断事項 | 同 decision_context が新しいユーザー価値判断・対象範囲変更・外部契約変更を必要とする場合 |

execution_unit 分割可能性があるにも関わらず case-open が停止した場合、「req-define 合意要件からの逸脱」ではなく「command 契約・実装不整合」として報告する（case-open の契約・実装不整合であり要件doc 側の問題ではない）。

### Step 8: 完了報告

最終工程（case-close 委譲）の完了報告をそのまま出力する。Epic Issue を伴う Wave 反復実行時は、完了・blocked・failed 子Issue 一覧を含める（Epic Issue 本文ステータス追跡テーブルから読み取り、case-auto は書き込まない、G16）。停止時は完了済み OU・進行中 OU・未実行 OU・再開可能な次コマンドを報告する。

完了報告には以下を含める（停止時フォーマットを含む）:

- 停止理由分類（Step 7-1 経由、または経路H の user-decision-required（「adversarial-review 由来の停止伝播（経路H）」節参照））
- 開始時刻・終了時刻・所要時間（人間が読みやすい形式）
- 工程別タイムスタンプ内訳（L1、req-save+spec-save 統合委譲 / case-open / case-run / case-close、スキップした工程は除外可、case-run の L2 内訳は case-run result から読み取って含める）
- インライン実行の記録（case-run をインライン実行した旨）
- orchestration stage 別結果・フォールバック理由・破棄回復記録（stage 1 case-open / stage 2 case-run / stage 3 case-close、stage 2 を順次フォールバック時は理由、bg task 破棄を検知して回復した場合は状態区分と回復結果）
- 結果状態の4次元報告（後述）

## orchestration stage モデル

case-auto は3つの orchestration stage を管理する（v2:ADR-0138、G29/G32）。各 stage は直列集約とし、stage 2 のみ case-run を並列起動する（G32）。

| stage | 内容 | 並列性 |
|---|---|---|
| stage 1 | case-open（Issue 作成） | 直列 |
| stage 2 | case-run（実行担当サブエージェント委譲、bg task 最大5件） | 並列（固定並列数、並列不可時順次フォールバック） |
| stage 3 | case-close（PR マージ、Issue クローズ） | 直列 |

bg task API、実行エージェント選定、実行担当サブエージェント内部の推論、context 管理、retry、heartbeat、エラー解析は harness の責務であり、本スキルは制御対象としない（G29）。

## 子 task bg task 破棄検知時の回復（v2:ADR-0138）

case-auto が Phase 2（case-run インライン実行）で起動した子 task の bg task が破棄された場合、case-auto 親ループが当該子 task の状態を回復する。

### 中断検知と状態分類

子 task の bg task 破棄を検知した場合、当該子 task の worktree で `git status` を実行し、以下の3状態のいずれかに分類する。

| 状態 | 判定条件 |
|---|---|
| (a) commit 済み、PR 未作成 | commit 履歴があるが PR が未作成 |
| (b) 未コミット変更あり | worktree に未コミット変更が残留 |
| (c) クリーン | commit 履歴も未コミット変更もない |

状態 (c) クリーンの場合は回復対象がないため回復処理をスキップし、当該子 task を pending へ戻す。

### 状態 (a) の回復（commit 済み、PR 未作成）

case-auto 親ループが当該 worktree で回復処理を代行する。

1. `git rebase origin/main` で最新の main へ追従する（必要時）。rebase で解消できないコンフリクトは後述のコンフリクト解消モデル Level 2/3 へ委譲する
2. `git push` でリモートへ反映する
3. PR 作成を代行する。PR の base branch、タイトル、本文は子 task の Issue に紐づく情報（Issue 番号、Issue タイトル、受け入れ条件、work_type）から生成する
4. 作成した PR 番号を子 task の result に `completed-pr` として記録する
5. 通常の case-close フローへ合流させる

回復時の PR 作成代行は case-auto 親ループの責務である（v2:ADR-0137 の委譲起点折りたたみモデルを維持し、子 task 側で再度委譲を起こさない）。

### 状態 (b) の回復（未コミット変更あり）

未コミット変更の帰属は安全上の懸念となるため、変更内容の作業意図整合確認ステップを必須とする。

1. worktree の変更内容（`git diff`、`git status`）を確認する
2. 変更内容が子 task の case-run 作業意図（Issue の受け入れ条件、実装計画）と整合するかを確認する
3. 整合確認ができた場合のみ、commit、push、PR 作成を代行する（PR 生成情報の Issue 紐づけは状態 (a) と同じ）
4. 整合確認できない場合（別 Issue 由来の変更混入、意図不明の変更等）は当該子 task を `blocked` とし、停止理由を「未コミット変更の帰属不明」（Step 7 停止条件 (10)、G33）として報告する

安全のため、未確認の変更を強制 commit しない。強制 commit は帰属不明の変更を本流へ持ち込む原因となる。

## bounded parent decision resolution

case-auto は下位 command から受領した decision_context を限定的に自律解決する。default-on + skip policy により各 caller command で adversarial-review が原則実行される前提と、case-auto が中央集約 review engine とはならない前提を両立するための限定的親判断解決である（経路H 停止伝播契約、bounded parent decision resolution は case-auto command SPEC、delegation-contracts SPEC、workflow-contracts SPEC が正）。

### 解決範囲

| 解決可否 | 条件 | case-auto の挙動 |
|---|---|---|
| 自律解決可能 | 現行正規成果物から一意に回答可能 | 回答を下位 command へ返し resume させる |
| 作業仮定で継続可能 | 外部仕様・互換性・データ保持・セキュリティ・対象範囲・受け入れ条件を変更しない可逆的内部詳細であり、既存契約で許容された範囲 | 作業仮定と根拠を明示した上で自走継続し、下位 command を resume させる |
| ユーザー停止（上位合意矛盾） | decision_context が現行正規成果物間の矛盾に起因し、当該矛盾そのものが finding の対象 | 一方を勝手に採用せず停止し、停止理由分類「上位合意矛盾」でユーザーへ返す |
| ユーザー停止（新規ユーザー判断事項） | 新しいユーザー価値判断、対象範囲変更、外部契約変更が必要 | 既存停止経路で停止し、停止理由分類「新規ユーザー判断事項」でユーザーへ返す |

### 作業仮定の明示要件

可逆的内部詳細を作業仮定で継続する場合、case-auto は作業仮定と根拠を明示する。明示内容は下位 command への回答に含め、ユーザーが事後確認できる形とする。外部仕様、互換性、データ保持、セキュリティ、対象範囲、受け入れ条件の変更は作業仮定の対象外であり、これらを変更する場合はユーザー停止（新規ユーザー判断事項）へ分類する。

### resume 機構

case-auto は回答、根拠、または作業仮定を下位 command へ返し、既存 resume point から処理を継続する。新規の永続結果型を導入しない。adversarial-review の再実行要否は adversarial-review 側の再 review 契約に従い、case-auto は独自の再 review 条件を持たない。

### case-auto が行わないこと

bounded parent decision resolution においても、case-auto は中央集約 review engine とはならず、raw finding を解釈、採否、候補反映しない（AG-006）。case-auto が解決対象とするのは下位 command が構造化した decision_context のみであり、下位 command が raw finding を case-auto へそのまま渡すことはない。

## コンフリクト解消モデル（3レベルエスカレーション、v2:ADR-0132）

PR マージコンフリクト発生時（case-close Step 4-2 からのエスカレーション受領時）は、以下3レベルのエスカレーションで解消を図る。各レベルを試行しても解消できない場合のみ次のレベルへ進む。**機械的競合（rebase で自動解決可能）は停止条件に含まず**、Level 1 で case-close が解消する（Level 1 は case-close Step 4-2 の責務、本節では Level 2/3 の case-auto 責務を定義する）。

| Level | 実行主体 | 解消手法 | 失敗時 |
|---|---|---|---|
| Level 1 | case-close | `git rebase` による機械的解消。自動解決時は再マージ | case-auto へエスカレーション |
| Level 2 | case-auto | 両PRのdiffを読み取りコンフリクト箇所を特定し、コンフリクト文脈を付けて case-run へ再委譲。最大2回（元の並列実行を含む計3回の case-run 実行、AG-005） | Level 3 へ |
| Level 3 | case-auto | マージ順序変更、blocked 単位の隔離 | 停止 |

**停止条件の段階化**: case-auto はコンフリクト解消に対して常に全力で解消を図る。発生元（同一 case-auto 内、別 case-auto 跨ぎ）に関わらずアクセス可能な文脈を総動員する。停止条件は Level 2 の再委譲を上限回数（2回）試行しても解消しない場合とする。Level 1 で解消できる機械的競合は case-auto の停止条件から除外する。

Level 1 の rebase 実行、エスカレーション判定は case-close の責務（case-close Step 4-2 参照）。case-auto は Level 2/3 のオーケストレーション級判断を担う。

## adversarial-review 停止伝播（経路H）

Step 4（各工程の実行）で下位 command（case-run インライン実行、工程委譲）から adversarial-review 由来の user-decision-required + decision_context を受領した場合、case-auto は当該 execution_unit の自走を停止し、ユーザー判断を待機する。

### 受領形式

| 起源 | 受領形式 |
|---|---|
| case-run 起源 | result `blocked` + user-decision-required 分類 |
| 工程委譲起源（req-define、case-open、case-close 等） | 既存 status + `parent_decision_required`（workflow-contracts SPEC「adversarial-review 由来の停止信号」節、delegation-contracts SPEC「review 経路での parent_decision_required / decision_context 適用」節） |

user-decision-required は case-run result enum 第5状態ではなく停止理由分類である。

### 停止伝播契約

1. **自走停止**: 対象 execution_unit（Issue）の処理を停止し、ユーザー判断を待機する。他の ready 対象の execution_unit がある場合は継続する（部分停止、Step 4-1 Wave 反復制御）
2. **ユーザー提示**: decision_context（対象案、合意候補、未解決争点、推奨案と根拠、ユーザーに確定してほしい判断）をユーザーへ提示する
3. **resume point の記録**: 停止時の resume point を記録する。case-run 起源は当該 Issue の case-run 再開ポイント（準備フェーズ、実装フェーズ、提出フェーズのいずれか）、工程委譲起源は当該工程の委譲起点
4. **resume point から再開**: ユーザー判断の解決後、resume point から処理を再開する。adversarial-review の再発動要否は adversarial-review SPEC「再 review 条件」「再 review 停止条件」の各節に従い、case-auto は独自に判断しない。adversarial-review 自体を恒久的な統制ゲートとしない

### case-auto が行わないこと

case-auto は経路H において以下を行わない。これらは下位 command（case-run の場合は adapter 委譲内、工程委譲の場合は当該工程）の責務であり、case-auto は伝播と再開のみを担う。

- **review 直接起動**: adversarial-review を直接起動しない（review 挿入境界は各 command SPEC が所有）
- **finding 解釈**: adversarial-review の finding を意味解釈しない（finding の意味解釈は review 呼出元である下位 command の責務）
- **採否**: finding の採用・不採用を決定しない（accepted finding の反映は review 呼出元の責務）
- **再評価**: review 対象の再評価を行わない（再 review 条件の判定は adversarial-review SPEC）

user-decision-required は Step 7-1 の HITL 境界停止条件分類とは独立する停止理由分類である。停止報告（Step 8）には user-decision-required を停止理由分類として含める。case-auto は経路H において純粋な伝播経路として機能し、adversarial-review の意味的処理には関与しない。

## L1 タイムスタンプ計測

case-auto は各工程（req-save / spec-save / case-open / case-run / case-close）の委譲起動前後にタイムスタンプを記録し、工程別の壁時計時間を完了報告に含める。現行の開始、終了時刻記録を工程別内訳へ拡張する。

- **計測単位**: 委譲起動前後の壁時計時刻（JST、`case_auto_started_at` の時刻形式に準拠）
- **記録先**: case-auto 完了報告への工程別内訳追記。永続化は必要になった段階で別途検討
- **対象外**: 委譲先内部メトリクス（L3）は harness 依存が強すぎるため対象外。case-run 内の L2 計測は case-run result に含まれる

## 結果状態の4次元集約

case-auto は各工程の結果を次の4状態次元で保持し、集約報告で次元を混同しない。各工程の output_contract が情報源となる。

| 次元 | 取得元 | 値 |
|---|---|---|
| (1) 工程結果 | 全工程（req-save+spec-save / case-open / case-run / case-close）の pass/warn/fail | pass / warn / fail |
| (2) artifact_action 適用結果 | req-save+spec-save 統合委譲の action id ごとの適用結果 | applied / skipped / failed / no-op |
| (3) 定義適用工程の完了状態 | (1)(2) の組み合わせから導出 | 定義適用完了 / 警告付き工程完了 / 定義適用未完了 |
| (4) OU ライフサイクル完了状態 | case-open（Issue 作成）、case-run（PR 作成）、case-close（PR マージ、Issue クローズ）の各成否 | 各ライフサイクル事象ごとに 完了 / 未完了 |

### 集約規則

- **(3) の導出**: 全必須 action が applied または正当な no-op で工程結果 (1) が pass → 定義適用完了。同条件で (1) が warn → 警告付き工程完了（warn を pass へ変換しない）。必須 action に skipped または failed が1件以上ある → 定義適用未完了（この場合は定義適用完了/警告付き工程完了と報告しない）。正当な no-op とは、対象外 artifact（例: spec-save における `artifact: spec` entry 不存在、後方互換の `artifact_actions` フィールド不存在）による action 不実施を指す。正当な理由なく必須 action を飛ばした場合は skipped として扱う
- **(4) の独立性**: OU ライフサイクル完了状態は (3) と独立して扱う。(3) が定義適用完了/警告付き工程完了であっても case-open（Issue 作成）が未実行なら OU ライフサイクルは未完了と報告する
- **Phase 0 と OU 完了の分離**: Phase 0 成功（(3) の定義適用完了/警告付き工程完了）と OU 完了（(4) の全ライフサイクル事象完了）を別々に報告する。一方を他方へすり替えて報告しない
- **warn 変換禁止**: (1) が warn の工程を pass として集約しない。完了報告には warn を warn のまま残す

完了報告（停止時フォーマットを含む）には上記4状態次元を工程別・action id 別・ライフサイクル事象別に列挙する。

## Phase 0 commit スコープ設計運用

Phase 0（枝PR作成フェーズ）の commit スコープ設計運用を明示する。Phase 0 は定義層（req-save / spec-save）で確定した REQ/Decision/SPEC をコミットし、枝PR を作成するフェーズである。case-run SPEC の同名節と整合する内容を維持する。

### 孫 Issue 間 SPEC スコープ交差時の扱い

Phase 0 で複数孫 Issue（Epic Wave 内の子Issue、または並列 execution_unit 内の個別 Issue）の実装が同一 SPEC ファイルに触れる場合の扱いを以下で規定する。

**SPEC 本文修正の非許容**: 孫 Issue の test strategy が `on_failure: fix-and-reverify` を指示する場合でも、Phase 0 の case-run 委譲内で SPEC 本文を修正しない。Phase 0 の SPEC 成果物は既に spec-save 工程で確定済みであり、case-run 委譲内で再修正すると定義層の一貫性が損なわれる。SPEC 修正が必要と判明した場合は `record-in-findings` で PR 本文の `## SPEC確定候補` セクションへ記録し、case-close Step 3 の SPEC 確定チェックへ引き継ぐ（`agentdev-case-run-execution-adapter` SKILL の SPEC確定候補配置契約に従う）。

**target_area の重複判定と並列制御**:

- 同一 SPEC ファイルの異なる target_area を複数孫 Issue が編集する場合: git diff が競合しないため並列マージを許容する。並列判定軸は連結成分ベースに従い、ファイル衝突（L2）は並列許容、PR マージコンフリクトは後続 PR の rebase で解決する
- 同一 SPEC ファイルの同一 target_area を複数孫 Issue が編集する場合: case-open 構成生成時に必須依存（depends_on）として連結させ、直列化する。Wave 構成で同一 Wave へ割り当てない

### ドメイン state 更新と成果物変更の同一コミット混在

Phase 0 の枝PR に含まれるコミット構成運用を規定する。原則として **2分割運用** を採用し、ドメイン state 更新と成果物変更を同一コミットへ混在させない。

**対象ディレクトリ**:

- 成果物変更: 配布対象の永続状態（docs 配下成果物、配布スキル、配布コマンド等）
- ドメイン state 更新: `.agentdev/` 配下（intake、learning、drafts、cases 等のケース固有の一時状態）

**2分割運用の理由**:

- 永続性の違い: 成果物は配布対象の永続状態、ドメイン state はケース固有の一時状態。同一コミットに混在すると revert、cherry-pick の単位が曖昧になる
- レビュー単位の分離: 成果物変更は SPEC 品質査読の対象、ドメイン state はキャプチャ境界（intake/learning）の対象。査読観点が異なるため分離する
- capture 境界の遵守: `.agentdev/intake/`、`.agentdev/learning/` の直接編集は case-run 委譲内では禁止（`agentdev-case-run-execution-adapter` SKILL）。実行担当サブエージェントは PR 本文の `## Findings / Capture候補` へ記録し、case-close が intake/learning pipeline へ引き継ぐ。よって case-run 委譲内でドメイン state をコミットへ含めることは原則として発生しない

**例外**: `.agentdev/drafts/` の削除（req-save / spec-save 完了後のクリーンアップ）は、成果物変更とは独立したクリーンアップコミットとして扱う。本運用が禁止する同一コミット混在には該当しない。当該クリーンアップは req-save / spec-save 工程の責務であり、Phase 0 の case-run 委譲内では発生しない。

## See Also

- **agentdev-workflow-orchestration**: case-run 単位の orchestration、Capture 境界、サブエージェントプロトコル
- **agentdev-workflow-routing**: レビュー拒絶ハンドリング、次コマンド推論
- **agentdev-workflow-lifecycle**: work_type 判定、フェーズ定義
- **agentdev-case-run-execution-adapter**: case-run 外部実行 adapter（委譲契約、result 4状態）
- **agentdev-epic-tracker**: Epic 進捗追跡、Epic Issue 本文ステータス追跡テーブル
- **agentdev-git-worktree**: worktree 操作、並列実行安全 git 操作
- **agentdev-project-extensions**: project extension 読込契約
