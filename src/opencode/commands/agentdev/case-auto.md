---
description: req-save→spec-save→case-open→case-run→case-closeを順次自走実行する（明示指定時のみ）
agent: sisyphus
---

# 最大自走モード

要件docから req-save → spec-save → case-open → case-run → case-close を順次実行し、repo内変更に限りマージまで自走する。標準ワークフローの置き換えではなく、ユーザーが明示的に指定した場合のみ使用する追加入口である（REQ-0114-017）。

## project extensions

本コマンドは実行時に自分に対応する project extension（`.agentdev/extensions/commands/case-auto.yaml`）を読み込む（ADR-0135）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- Issue番号（数値）または Issue URL: 既存Issue から case-run → case-close を自走する場合（REQ-0114-068/069）
- 要件doc（引数なし時は `.agentdev/drafts/req-draft-*.md` 全件処理がデフォルト / 明示パス指定 / セッション指定キーワードによるセッション内要件doc参照。暗黙判断廃止、構造化 `draft-data` 形式: REQ-0138, ADR-0124）

## 出力

- REQ/ADR artifact_actions がある場合: REQ/ADRファイル + GitHub Issue + 実装済みブランチ + PR + マージ済み + クローズ済み
- artifact_actions に応じた各工程の出力（工程分岐は Step 3 参照）

## 手順

### Step 1: 入力解決

実行開始時刻を JST（Etc/GMT-9）で記録し `case_auto_started_at` に保持。Step 7（停止時報告）・Step 8（完了報告）での所要時間算出の基準として使用（REQ-0114-082/094, REQ-0151-008）。

- **Issue番号/URL入力モード**: 引数が数値のみまたは GitHub Issue URL の場合、Issue番号として解決し case-run移行モードへ分岐（Step 3 の Issue番号/URL入力分岐へ）。要件doc入力より優先（REQ-0114-068/069）。要件docの入力解決・work_type読取はスキップ
- **要件doc入力モード**（REQ-0114-002）:
  - (1) 引数なし: `.agentdev/drafts/req-draft-*.md` 全件処理（デフォルト）。1件以上なら全件（1件含む）処理、0件なら停止し req-define 実行またはパス指定を求める（REQ-0114-004/005）。複数draftは無確認で全件処理
  - (2) 明示パス指定: 当該draftのみ。不在時は停止しエラー報告（REQ-0114-003）
  - (3) セッション指定キーワード（例: `req-define セッション`、`req-define 上記の内容`）: セッション内要件docを参照。**暗黙判断は行わない**（AG-003）
  - (4) 特定不可: 停止（REQ-0114-005）
  - 複数draft読み込み時の順序制御は各draftの `operation_units` から `recommended_order` / `depends_on` に基づき決定（REQ-0148, ADR-0129）

### Step 2: work_type 読取

入力要件docの `draft-data` から work_type を取得（参考情報、パイプライン分岐の判定には使用しない、REQ-0138-010）。

### Step 3: 工程分岐（`work_type` 固定分岐ではなく `artifact_actions` 存在による動的判定、REQ-0114-076）

- **Issue番号/URL入力**: case-run → case-close（req-save、spec-save、case-open、work_type読取をスキップ、REQ-0114-070/071）。Step 1 で解決した Issue番号/URL を case-run にそのまま渡す。draft-data の読取は行わない
- **artifact_actions ベース分岐**:
  - `artifact: req` または `artifact: adr` entry → req-save を実行
  - `artifact: spec` entry → spec-save を実行（req-save の後）。entry が空ならスキップ。`artifact_actions` フィールド不存在（旧形式 draft）は後方互換で spec-save スキップ
  - 常に → case-open → case-run → case-close
- **auto_gate preflight**: `draft-data` の `auto_gate.auto_ready` が false または未解決 item（unresolved_questions/ unresolved_conflicts/ out_of_repo_operations/ stop_reasons）が残る場合は停止（REQ-0114-078）
### Step 4: 各工程の実行

#### 実行モデル原則

- **委譲工程**（req-save / spec-save / case-open / case-close）: 各コマンドの委譲契約に従い起動（ADR-0127, REQ-0114-006/084）。**インライン実行は原則禁止**（コンテキスト枯渇防止）。委譲起動不能時は後述「委譲起動判定」に従い `delegation-unavailable` として報告（REQ-0162-003/004、AG-004）
- **case-run**: **インライン実行**（標準動作、AG-001、ADR-0137、REQ-0114-098/099）。case-run.md を authoritative source として読み込み、準備フェーズ（worktree 作成、委譲 prompt 構築等）とクリーンアップフェーズ（worktree 削除、result 処理等）を case-auto が自ら実行。実行担当サブエージェント委譲フェーズでは case-auto から直接委譲し、委譲チェーンを case-auto → 実行担当サブエージェントの1段階に圧縮（委譲起点の折りたたみ、AG-002、REQ-0114-099）。adapter skill（`agentdev-case-run-execution-adapter`）を case-auto が読み込む
- **case-auto 自らは実装を行わない**: case-run インライン実行といえども、case-auto は実装実行・PR作成を自ら行わない。実装は実行担当サブエージェントへ委譲（REQ-0114-099）。インライン実行は case-run の準備/クリーンアップフェーズのオーケストレーションを case-auto が自ら実行することを指す
- **req-save + spec-save 統合委譲（AG-005）**: req-save と spec-save を1つの統合委譲で順次実行。委譲内では両コマンドの定義（req-save.md, spec-save.md）を順次読み込み、draft を1回読み込み、req-save の手順を実行した後に引き続き spec-save の手順を実行。commit/push は1回に統合（REQ と SPEC の変更を1コミットにまとめる）。統合委譲に両コマンドのガードレールを適用（req-save G02: `docs/requirements/**`, `docs/adr/**`, `docs/README.md`, `.agentdev/drafts/**`、spec-save G02: `docs/specs/**`, `.agentdev/drafts/**`）。req-save/spec-save のコマンド定義・責務・ガードレール自体は変更しない（CR-002）
- **QG-1〜QG-4 の継承**: case-auto は QG を独自実装しない。構成コマンド（req-save: QG-1, case-open: QG-2, case-run: QG-3, case-close: QG-4）がそれぞれ `agentdev-quality-gates` スキルを参照して Gate を適用。case-run インライン実行時、QG-3 前置 staleness check、targeted docs guard は case-auto が case-run.md に従って実行（G07, G09）
- **タイムスタンプ計測（L1）**（REQ-0114-094, REQ-0151-008）: 各工程（req-save+spec-save 統合委譲 / case-open / case-run / case-close）の起動直前・直後に壁時計タイムスタンプ（JST）を記録。Step 8 完了報告・Step 7 停止報告の工程別内訳として使用。全体開始・終了時刻記録（REQ-0114-082/083）を廃止せず工程別内訳を併記。ハーネス内部メトリクス（L3）は対象外。case-run 内の L2 計測は case-run result に含まれ、case-auto は case-run インライン実行の壁時計時間（L1）として扱う
- **インライン実行時のコンテキスト管理（REQ-0114-100）**: harness の機能（compress 等）で対応し、AGENTS.md / references/<harness>.md に配置（REQ-0162-002）。REQ-0114-073（親コンテキスト非累積）は case-run インライン実行時の例外として取り扱う。インライン実行の適用を完了報告（Step 8）に記録

#### 工程別契約

case-auto は各工程を以下の契約で起動する:

| 工程 | 起動方式 | inputs | output_contract |
|---|---|---|---|
| req-save + spec-save | 委譲（1 統合委譲、AG-005） | draft path, OU ID | 保存済みREQ/ADRリスト, 保存済みSPECリスト, draft status=saved, SPEC消費済みフラグ, pass/warn/fail |
| case-open | 委譲 | draft path, OU ID | Issue番号(Epic含む), pass/warn/fail |
| case-run | インライン実行（case-run.md を authoritative source として読み込み、case-auto が準備/クリーンアップフェーズを自ら実行、実行担当サブエージェントへ直接委譲、AG-001/002） | 単一 Issue番号 または Epic Issue番号（`#epic`、現在 Wave の子Issue を case-auto が並列委譲、最大5件、REQ-0130-026） | completed-pr/blocked/failed/delegation-unavailable（Epic Wave 実行時は子Issue ごとの結果集合） |
| case-close | 委譲 | 単一 Issue番号 または Epic Issue番号（`#epic`、現在 Wave の一括クローズ） | マージ結果, Capture保存結果, 削除済みブランチ, pass/warn/fail, Epic 最終 Wave 判定結果 |

各工程の side_effect_boundary は対応するコマンド定義のガードレールに従う。各工程の後段処理（case-open の RU 削除、case-close の learning/intake capture、.agentdev/ commit/push 等）は各コマンド定義に従う（case-run インライン実行時の worktree クリーンアップは case-auto が case-run.md に従って実行）。

case-auto は req-save/case-open の委譲に draft path と OU ID のみを渡す（OU 本文の切り出しは行わない、REQ-0114-052）。OU の統合・分割・REQ 操作分類・Issue 階層判定を再評価しない（各工程の判定結果に従う、REQ-0114-054）。

case-auto は各工程の結果に基づいて次工程へ進むか停止条件（Step 7）を判定する。

#### case-open 完了後の分岐

case-open 委譲の完了後、出力を確認して以下のいずれかに分岐:

- **Standard flow（単一 Issue）**: case-open 委譲が共通終了処理（コメント追加、ドラフト削除、RU削除、完了報告、REQ-0114-059）を完了していることを確認 → クリーンアップ検証ゲート（後述）→ 既存の直列フロー（case-run → case-close）
- **Epic Issue flow（マルチREQ または 単一REQ Epic flow）**: 同上の確認 → クリーンアップ検証ゲート → Wave 反復制御（後述）

#### Wave 反復制御（case-auto 直接制御、AG-003、REQ-0114-097）

Epic Issue 番号を記録。Epic Issue 本文（SSoT）から Wave 構成・各子Issue ステータスを読み取る（**読み取りのみ、Epic Issue 本文の書き込みは case-close の単一書き手責務**、G16）。case-run(#epic) への委譲は行わない。各子Issue ごとにインライン case-run を実行。以下の反復ループを実行:

1. **現在 Wave の ready 子Issue 選択**: Epic Issue 本文（ステータス追跡テーブル）から現在 ready な Wave の子Issue を特定。`ready` がない場合、依存が満たされた `pending` Issue を `ready` に遷移させて選択。前提Issue が blocked/failed の場合は `pending` のまま選択対象外（REQ-0114-080）。各子Issue の worktree 作成前に `git fetch origin` を実行し、origin/main の鮮度を確認（`agentdev-git-worktree` 参照）

2. **各子Issue のインライン case-run 並列実行**（最大5件、REQ-0130-026）: 各 ready 子Issue を adapter skill（`agentdev-case-run-execution-adapter`）を読み込んだ実行担当サブエージェントへ case-auto から直接並列委譲。各子Issue ごとに case-run.md に従い準備フェーズ（worktree 作成、委譲 prompt 構築、QG-3 前置 staleness check、targeted docs guard）を case-auto が実行し、実行担当サブエージェントへ委譲、result 処理、クリーンアップフェーズを実行。委譲の起動手段・実行制御パラメータは AGENTS.md / references/<harness>.md 参照（REQ-0162-002）。1 Wave の実行（PR作成まで）で次工程へ進む

3. **委譲→case-close(#epic)**: インライン case-run の結果（子Issue ごとの completed-pr/blocked/failed/delegation-unavailable）を確認。completed-pr の子Issue がある場合、Epic Issue 番号を case-close 委譲に渡す。case-close は現在 Wave の PR作成済み子Issue を一括マージ・クローズし、Epic status table を更新（単一書き手）、最終 Wave 判定を行う

4. **次 Wave 判定**: case-close 委譲の結果から Epic 全 Wave 完了可否を判定:
   - **全 Wave 完了（Epic クローズ済み）**: Epic 完了報告（Step 8）へ進む
   - **残 Wave あり**: 手順 1（現在 Wave の ready 子Issue 選択）に戻り次 Wave を実行（べき等、Epic Issue 本文から進行状況判定）

5. **blocked/failed の扱い**: インライン case-run が blocked/failed を返した子Issue は case-close 対象外。一部 completed-pr がある場合は case-close(#epic) で completed-pr のみ処理し、その後停止条件（Step 7）の判定へ。全子Issue が blocked/failed の場合は Wave 反復を停止し部分完了報告（Step 8）へ。停止時は完了済み OU・進行中 OU・未実行 OU・再開可能な次コマンドを報告（REQ-0114-049/056）

#### OU 処理順序

- 必須依存（`depends_on`）で結合した execution_unit 群は順次処理（REQ-0114-064）
- 必須依存のない execution_unit 群は並列実行（REQ-0114-053/087、REQ-0148-018）。本並列は3つの「5件」文脈のうち **execution_unit 全体並列（上限なし、REQ-0148-018）** に該当し、**case-run Wave 内子 Issue 並列上限（最大5件、REQ-0130-026）** および **Phase 2 同時起動数（最大5件、REQ-0114-106）** とは別文脈である。3つの「5件」は混同しない（文脈別の区別は epic-wave-model SPEC「並列上限と停止条件の整理」セクション参照）。ファイル衝突等の技術的依存（L0-L3）は並列判定軸から外し直列化要因としない（REQ-0148-014）
- `recommended_order` は処理順序のヒントであり直列化ゲートではない（REQ-0114-064）
- Standard flow でも Epic flow でも適用。Standard flow で case-close完了後に未処理 OU が残れば、当該 OU の `artifact_actions` に応じた工程分岐で Step 2 に戻り次 OU の処理を開始（REQ-0114-065）。全 OU 処理完了でのみ全体完了報告（REQ-0114-067）。次 OU の draft ファイル不在時は停止し報告（REQ-0114-066）
- 複数の必須依存のない execution_unit を case-open 委譲が自動的に Epic Issue 化し Wave 1 に全 OU を配置（REQ-0114-088、G21）。並列実行完了後、残りに必須依存のある execution_unit があれば順次処理
- 採番・index 更新・draft 更新・commit・push・Epic 本文更新は各工程が対応するコマンド定義に従い、並列実行の完了を待ってから実行（直列集約、REQ-0114-093）

#### クリーンアップ検証ゲート（REQ-0114-060/061/062/063）

Standard flow の case-run 移行前、Epic Issue flow の Wave 反復制御開始前の双方で以下を検証:

- ドラフトファイル（`.agentdev/drafts/req-draft-*.md`）が削除されていること。残存時は停止し手動削除を依頼
- 当該ケースで消費した RU ファイル（`.agentdev/backlog/req-units/RU-*.md`）が削除されていること。残存時は停止し手動削除を依頼
- 検証結果（成功、残存ファイル一覧）を case-auto 完了報告（Step 8）に含める

#### 委譲起動判定（REQ-0162-003/004、AG-004）

委譲工程（req-save / spec-save / case-open / case-close）の委譲起動後または起動失敗時に委譲起動可否を判定。本判定は委譲工程のみに適用し、case-run インライン実行時の実行担当サブエージェントへの委譲失敗には適用しない（後述）。

**委譲起動不能トリガー**:
1. 委譲起動失敗（ツール不在、ハードリジェクト、agent type 拒否）
2. 委譲結果が blocked/failed で、理由が委譲 chain 破綾（起動失敗、ネスト委譲制限等）

genuine blocker（実装上の問題、スコープ外操作、コンフリクト解消不能等）は `delegation-unavailable` 対象外。Step 7 停止条件として扱う。

**判定材料**: 委譲工程 result 本文、Issue コメント（SSoT）、エラーメッセージのパターンマッチ（"Invalid agent type", "Only explore, librarian are allowed", "delegation not available" 等）。パターンに合致しない blocked/failed は genuine blocker として扱い、`delegation-unavailable` とはしない（安全側に倒す）。

**委譲起動不能時の扱い**:
- 当該工程を `delegation-unavailable` として報告。委譲工程のインライン実行への切替えは行わない
- context 管理（compress 等）は harness の責務として AGENTS.md / references/<harness>.md に配置（REQ-0162-002）
- REQ-0114-073（親コンテキスト非累積）は委譲起動不能時の例外として取り扱う
- `delegation-unavailable` 発生を完了報告（Step 8）に記録

**case-run インライン実行時の実行担当サブエージェント委譲失敗の扱い（AG-004、REQ-0114-098）**: 本節の `delegation-unavailable` 停止条件には該当しない。case-run result 契約（completed-pr / blocked / failed / delegation-unavailable）に従い処理。`delegation-unavailable` を返した場合は当該子Issue を `pending` に戻す（REQ-0162-004）。詳細な事後処理（worktree の `git status` 確認、残留箇所の grep、手動修正または PR 化）は `agentdev-case-run-execution-adapter` スキル参照

#### Subagent 委譲プロトコル（category 選定、MUST NOT DO 必須）（REQ-0163）

case-auto が各工程を subagent へ委譲する際、委譲 prompt の category と MUST NOT DO セクションは以下の要件を満たす（REQ-0163-001/002/003、Issue #1538 由来）。本要件は case-auto 委譲時に限定せず、subagent 委譲する全場面（case-auto/ case-open/ case-run/ case-update/ case-close）に共通適用する。case-run インライン実行時の実行担当サブエージェント委譲も本要件に従う。

**category 選定ガイドライン（REQ-0163-001）**:

- 委譲先 command の責務（事務的手続き、実装作業、執筆作業等）と category 名の意味的距離を評価し、subagent の振る舞いを誤誘導しない category を選定する
- command 名と category 名の意味的距離が大きい場合、subagent が関連スキルを発火させ本来責務から逸脱するリスクがある。Issue #1538 では case-open を `category=writing` で委譲した際、`japanese-tech-writing` 等の発火スキルと相互作用して subagent が文書監査ファイル生成や draft 作成へ逸脱した
- category 別の推奨用途:
  - **`unspecified-high`**: 事務的手続き（Issue 作成、VERIFY、ラベル設定、状態遷移、コメント追加、ファイル移動等）の委譲。既定の category であり特定の発火スキルと結合しないため事務的手続きに適する
  - **`writing`**: 執筆作業（docs 記述、article 作成、REQ/ ADR/ SPEC 本文執筆等）の委譲のみに限定する。事務的手続き委譲に `writing` を使用してはならない

**MUST NOT DO セクション必須化（REQ-0163-002）**:

- 全ての委譲 prompt に MUST NOT DO セクションを必須とする。スコープ外作業を明示的に列挙し、subagent がスコープ境界を推定せずに従えるようにする
- MUST NOT DO に列挙すべき代表的項目:
  - 当該 command 責務外のファイル作成（例: case-open 委譲での文書監査ファイル、draft、replacement-dictionary 等の生成）
  - REQ/ SPEC/ src の直接修正（当該 command に許可されていない場合）
  - 文書監査の実施（`japanese-audit` 等の監査ファイル生成、`japanese-tech-writing` 等の発火スキルによる監査的振る舞い）
  - スコープ外調査、スコープ外実装、capture 境界を超える `.agentdev/` 直接変更
- MUST NOT DO の記載は特定 command に限定せず、subagent 委譲する全場面で共通適用可能な形とする

**subagent 委譲プロンプトテンプレート要件（REQ-0163-003）**:

- 委譲 prompt の標準テンプレートは category 選定基準と MUST NOT DO 記載要件を統合した形式をとる
- case-auto、case-open、case-run、case-update、case-close の全委譲場面で共通適用可能な形とし、特定 command 名と category 名の意味的距離が大きい場合の注意事項を含む
- case-auto は各工程の委譲 prompt 構築時に本要件を適用する（case-run インライン実行時の実行担当サブエージェント委譲も含む）。委譲プロトコルと category 設計の関係整理は `agentdev-case-run-execution-adapter` スキル参照

#### Phase 分離モデル（REQ-0114-102〜107、ADR-0138）

case-auto が複数対象を処理する場合、Phase 分離モデルを採用する。

- **Phase 1**: 全対象の case-open を順次実行する
- **Phase 2**: case-run を bg task として最大5件ずつ並列実行し、結果と破棄を収集する
- **Phase 3**: case-close を順次実行する

各 Phase は前 Phase の対象処理の完了後に開始する。Phase 1 と Phase 3 を main push と capture の直列集約ポイントとし、commit も並列実行区間の外で処理する。

bg task がシステムにより破棄されたことを検知した場合、commit 済みで PR 未作成の状態と未コミット変更が残る状態を区別して回復する。実行担当サブエージェント内部の制御と bg task API の具体は harness 側に維持し、case-auto は起動 API と引数仕様を規定しない。bg task API と引数仕様は `references/<harness>.md` を参照する。並列実行はデフォルト挙動とし、bg task を利用できない場合のみ順次フォールバックへ切り替え、フォールバック理由を完了報告（Step 8）に含める。

### Step 5: 工程間の状態引き継ぎ

各工程の起動結果（Issue番号、PR番号）を次工程の入力として渡す。加えて以下を最終工程まで保持すること: (1) RU ファイルパス（case-open 委譲の RU 削除で使用） (2) capture 対象情報（case-close 委譲の learning/intake capture で使用）

### Step 6: 複数REQ対応

req-save 委譲の出力から複数 REQ doc または scale:large を検出した場合、case-auto は case-open の Issue 構造ルールを使用（G13）。req-save から case-open への状態引き継ぎ時、複数 REQ doc の保存結果をフィルタリング・再評価なしでそのまま渡す（G14）。Epic Issue 化の判定には関与しない（G21）。case-open の判定結果に従う

### Step 7: 停止条件の検出

以下のいずれかを検出した場合、実行を停止し停止理由・現在地点・再開可能な次コマンドを報告する（REQ-0114-016、11項目）:

- (1) req-define合意要件からの逸脱（合意済み要件、対象外、受け入れ条件の変更、合意されていない機能要件または制約の追加、合意済み OU の欠落・統合・分割による要件の意味変更のみに限定）
- (2) 要件未合意のscope拡大
- (3) repo外実体変更の必要性
- (4) DB migration実行の必要性
- (5) deploy/applyの必要性
- (6) 認証、秘密、権限変更の必要性
- (7) CI/test/lint失敗がself-healing不能
- (8) コンフリクト解消モデル（後述）の Level 1〜3 すべてを試行しても解消不能なコンフリクト（REQ-0151-006、ADR-0132）。操作的定義: Level 2 のインライン case-run 再実行を上限回数（2回、元の並列実行を含む計3回の case-run 実行）試行してもコンフリクトが解消しない場合。機械的競合（Level 1 rebase で自動解決可能）は停止条件に含めない。remote hash 不一致は従来通り停止条件
- (9) 作成元不明branch / user-owned branch / 他作業branchの削除検出
- (10) 未コミット変更の帰属不明
- (11) command 契約・実装不整合（case-open または後続工程の契約と実装が整合しない場合、execution_unit へ分割可能であるにもかかわらず case-open が単一 Epic 子 Issue 上限により停止した場合を含む）

**停止時タイミング情報の追記**: 停止報告に `case_auto_started_at`（開始時刻）、停止時刻（JST、人間が読みやすい形式: 例 `2026-06-21 15:30:00 JST`）、経過時間（停止時刻 − 開始時刻、人間が読みやすい形式: 例 `12分34秒`、全体合計）、Step 4 で記録した工程別タイムスタンプ内訳（停止時点までの工程分）を含めること（REQ-0114-082/083/094、REQ-0151-008）

### Step 7-1: 停止理由分類（REQ-0114-016/108 拡張）

Step 7 の停止条件を検出した場合、停止理由を以下の分類で報告する（REQ-0114-108）。分類は再開コマンド選択とユーザー通知の精度向上が目的であり、HITL 境界の変更ではない。停止条件11項目（REQ-0114-016）を以下の分類軸へ整理する:

| 分類 | 対応停止条件 | 定義 |
|---|---|---|
| req-define 合意要件からの逸脱 | (1) | case-open または後続工程が合意済み要件、対象外、受け入れ条件を変更した場合、合意されていない機能要件または制約を追加した場合、合意済み OU を欠落・統合・分割して要件の意味を変更した場合 |
| command 契約・実装不整合 | (11) | execution_unit へ分割可能であるにもかかわらず case-open が単一 Epic 子 Issue 上限により停止した場合、case-open または後続工程の実装が契約へ整合していない場合、構成生成事前検証（REQ-0132-027）が実装されていない場合 |
| 要件未合意のスコープ拡大 | (2) | 合意されていないスコープが実行中に追加された場合 |
| repo 外実体変更 | (3)(4)(5)(6) | DB マイグレーション実行、デプロイ/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報変更が必要な場合 |
| CI/test/lint 失敗 | (7)(8) | コンフリクト解消モデル（ADR-0132）の Level 2 まで試行しても自己修復不能な場合 |
| branch 削除検出 | (9) | 作成元不明 branch / user-owned branch / 他作業 branch の削除を検出した場合 |
| 未コミット変更の帰属不明 | (10) | 変更の由来が不明で安全に続行できない場合 |

execution_unit 分割可能性があるにもかかわらず case-open が停止した場合、「req-define 合意要件からの逸脱」ではなく「command 契約・実装不整合」として報告する。これは case-open の契約・実装不整合であり、要件doc 側の問題ではない。

### Step 8: 完了報告

最終工程（case-close 委譲）の完了報告をそのまま出力する。Epic Issue を伴う Wave 反復実行時は、完了・blocked・failed 子Issue 一覧を含める（Epic Issue 本文ステータス追跡テーブルから読み取り、case-auto は書き込まない、G16）。停止時は完了済み OU・進行中 OU・未実行 OU・再開可能な次コマンドを報告する（REQ-0114-049/056）

**停止理由分類の完了報告テンプレート拡張（REQ-0114-108）**: Step 7 経由で停止した場合、停止報告（完了報告の停止時フォーマット）に Step 7-1 の停止理由分類を含める。停止報告テンプレートに以下の項目を拡張する:

- 停止理由分類（REQ-0114-016/108 拡張の7分類のいずれか）
- 該当停止条件番号（11項目のいずれか）
- 分類の根拠（具体的な発生状況、対象ファイル、対象 Issue 等の識別子）
- 再開コマンド候補（分類に基づく推奨再開手段）

**タイミング情報の追記**: 完了報告生成時刻（Step 8 開始時点）を JST で記録する。case-close の完了報告（テンプレート）は変更せず、case-auto が以下を追記すること:

- 開始時刻: Step 1 で記録した `case_auto_started_at`
- 終了時刻: 完了報告生成時刻
- 所要時間: 終了時刻 − 開始時刻（人間が読みやすい形式: 例 `12分34秒`、全体合計）
- **工程別タイムスタンプ内訳（L1）**: Step 4 で記録した工程別（req-save+spec-save 統合委譲 / case-open / case-run / case-close）の起動前後タイムスタンプ・工程別所要時間。スキップした工程（例: SPEC artifact_actions がない場合の spec-save スキップ時、統合委譲は req-save 単体で実行）は除外可。case-run の L2 内訳は case-run result から読み取って含める
- **インライン実行の記録（REQ-0114-100）**: case-run をインライン実行した旨を実行結果に記録

停止条件による中断時（Step 7 経由）の報告にも、上記と同じ形式で開始時刻・停止時刻・経過時間・工程別タイムスタンプ内訳を含めること（停止時刻を終了時刻として扱う、停止時点までの工程別内訳のみ）

**OU処理ループ**: Standard flow の case-close 完了後に未処理 OU が残存する場合は次 OU の処理を Step 2 から開始（OU処理順序は Step 4「OU処理順序」サブセクションに準拠）。全 OU の処理が完了した場合のみ全体完了報告を出力する（REQ-0114-065/066/067）。OU処理中に停止条件（Step 7）を検出した場合も完了済み OU・進行中 OU・未実行 OU・再開可能な次コマンドを報告する

**Phase 別結果・フォールバック理由・破棄回復記録（REQ-0114-102〜107、ADR-0138）**: 完了報告には Phase 1（case-open 順次実行）、Phase 2（case-run 並列実行）、Phase 3（case-close 順次実行）の各 Phase の実行結果を含める。Phase 2 を順次フォールバックで実行した場合はその理由を記録する。Phase 2 の bg task 破棄を検知して回復した場合は、検知した状態区分（commit 済みで PR 未作成、未コミット変更残存）と回復結果を記録する。

## コンフリクト解消モデル（3レベルエスカレーション）（REQ-0151, ADR-0132）

PR マージコンフリクト発生時（case-close Step 4-2 からのエスカレーション受領時）は、以下3レベルのエスカレーションで解消を図る。各レベルを試行しても解消できない場合のみ次のレベルへ進む。**機械的競合（rebase で自動解決可能）は停止条件に含まず**、Level 1 で case-close が解消する（Level 1 は case-close Step 4-2 の責務、本節では Level 2/3 の case-auto 責務を定義する）。

| Level | 実行主体 | 解消手法 | 失敗時 |
|---|---|---|---|
| Level 1 | case-close | `git rebase` による機械的解消。自動解決時は再マージ（REQ-0151-001） | case-auto へエスカレーション（REQ-0151-002） |
| Level 2 | case-auto | 両PRのdiffを読み取りコンフリクト箇所を特定し、コンフリクト文脈を付けてインライン case-run を再実行。最大2回（元の並列実行を含む計3回の case-run 実行、AG-005、REQ-0114-095、REQ-0151-003/004） | Level 3 へ |
| Level 3 | case-auto | マージ順序変更、blocked 単位の隔離（REQ-0148-015 拡張） | 停止 |

### Level 2: コンフリクト文脈付きインライン case-run 再実行（REQ-0151-003/004/005、AG-005）

case-close（Step 4-2）からのエスカレーションを受領した場合、以下を実行する:

1. **コンフリクト箇所特定**: コンフリクト発生した両PR（先にマージされたPR、コンフリクトしたPR）の diff を読み取り、コンフリクト箇所（ファイル、行、変更意図）を特定する
2. **コンフリクト文脈の構築**: コンフリクト箇所、両PRの変更意図、解消方向性のヒントを「コンフリクト文脈」として構築する。実装の正解を与えず、解消に必要な情報を提供する
3. **インライン case-run 再実行**: コンフリクト文脈を付けてインライン case-run を再実行する（case-run への再委譲ではなく、AG-005）。委譲 prompt にコンフリクト文脈を明示し、当該 Issue の再実装を実行担当サブエージェントへ委譲する
4. **再実行上限カウンタ**: 再実行回数をカウントする。**最大2回**（元の並列実行を含む計3回の case-run 実行）を上限とする（REQ-0151-004）。上限到達時は Level 3 へ進む

**発生元非依存（REQ-0151-005）**: case-auto はコンフリクト解消に対して常に全力で解消を図る。コンフリクトの発生元（同一 case-auto 内の並列実行、別 case-auto 跨ぎ）に関わらず、アクセス可能な文脈（両PRのdiff、Issue本文、PR本文、関連REQ/ADR/SPEC）を総動員してコンフリクト文脈を構築する

### Level 3: オーケストレーション級判断

Level 2 のインライン case-run 再実行を上限回数試行してもコンフリクトが解消しない場合、以下のオーケストレーション級判断を試みる:

- **マージ順序変更**: コンフリクトしている複数 PR のマージ順序を変更し、コンフリクトを回避できるか検討する
- **blocked 単位の隔離（REQ-0148-015 拡張）**: コンフリクト解消不能な execution_unit を blocked として隔離し、他の ready execution_unit は継続実行する

### 停止条件の段階化（REQ-0151-006）

Level 1（case-close rebase）→ Level 2（case-auto インライン case-run 再実行、最大2回）→ Level 3（オーケストレーション級判断）の順に試行し、**すべてを試行しても解消できない場合のみ停止**する。操作的定義: Level 2 のインライン case-run 再実行を上限回数（2回）試行してもコンフリクトが解消しない場合。Level 1 で解消できる機械的競合は case-auto の停止条件から除外する（Step 7(8) の停止条件参照）

## ガードレール

### 自走境界
- G01: 自走対象はrepoにファイルとして残る変更に限定する
- G02: 以下は自走対象外とする: DB migration実行、deploy/apply、クラウドリソース操作、外部SaaS設定変更、課金、権限、認証情報に関わる変更、repo外の実データ操作、通知送信
- G03: migrationファイル、IaCファイルの作成、修正は対象とし、migration実行、IaC applyは対象外とする
- G04: GitHub Issue/ PR/ comment/ merge/ close は自走対象とする
- G05: remote branch削除は当該case-auto/ case-runが作成したbranchに限定する
- G06: docs/ REQ/ ADR/ SPEC/ command reference/ guide の更新を自走対象に含める

### 委譲・参照制約
- G07: case-auto は委譲工程（req-save/ spec-save/ case-open/ case-close）を各コマンドの委譲契約に従って委譲起動する。各工程は対応するコマンド定義を authoritative source として実行する（手順の case-auto 定義内再実装は回避）。case-run はインライン実行する（標準動作、AG-001、ADR-0137）。**委譲起動不能時**（REQ-0162-003/004、AG-004）: Step 4「委譲起動判定」に従い `delegation-unavailable` として報告する。委譲工程のインライン実行への切替えは行わない。genuine blocker（実装上の問題、スコープ外操作等）は Step 7 停止条件として扱い、`delegation-unavailable` 対象外とする。case-run インライン実行時の実行担当サブエージェントへの委譲失敗は case-run result 契約に従い処理し、本 `delegation-unavailable` 停止条件には該当しない
- G08: 工程固有の詳細手順とcase-auto定義が矛盾する場合、工程固有処理は既存コマンド定義を優先し、自走境界、入力解決、工程間制御はcase-auto定義を優先する。各工程の実行は対応するコマンド定義に従う（case-run インライン実行時も case-run.md に従う）
- G09: 既存のreq-save/ spec-save/ case-open/ case-run/ case-closeの責務を変更しない。委譲起動、インライン実行は起動方式の変更であり、各コマンドの責務、ガードレール、成果物を変更しない
- G13: case-auto は Issue 階層決定ロジックを持ってはならない。複数 REQ doc または scale:large の場合は case-open の Issue 構造ルールに委譲する
- G14: case-auto は req-save 委譲から case-open 委譲への状態引き継ぎ時、複数 REQ doc の保存結果をフィルタリングまたは再評価してはならない。保存結果をそのまま渡す
- G15: case-auto は Epic Wave 実行時、Wave 反復制御、現在 Wave の ready 子Issue 選択、子Issue 並列委譲（最大5件、REQ-0130-026 踏襲）を直接担当する（AG-003、REQ-0114-097）。case-run(#epic) への委譲は行わない。各子Issue ごとにインライン case-run を実行する。Wave 境界のクローズは case-close(#epic) に委譲する
- G16: case-auto は独自の操作単位ステータス追跡を持ってはならない。Epic Issue のステータス追跡テーブルを使用する。**Epic Issue 本文の書き込みは case-close の単一書き手責務。case-auto は読み取るのみで書き込まない**
- G18: case-auto は操作単位キューの管理、制御のみを担い、OU 本文の抽出、変換、REQ 操作解釈を行わないこと
- G19: case-auto は req-save 段階（case-open 完了前）のみ draft を OU 情報の SSoT として扱うこと。case-open 完了後は子Issue（Epic Issue のステータス追跡テーブル含む）が SSoT となること。クリーンアップ検証ゲート（ドラフト削除検証）は case-open 完了後に実行すること。独自の OU 状態管理を持たないこと
- G20: OU 間依存は queue dependency として扱い、依存関係があるだけでは Epic Issue 化しないこと
- G21: case-auto は Epic Issue 化の判定に関与しないこと。case-open の判定結果に従うこと
- G27: 各工程の起動は工程別契約（Step 4 の契約表）に従うこと。inputs に指定された情報のみを渡し、output_contract に指定された結果のみを受領する
- G28: case-auto は委譲工程の完了結果（Issue/PR番号、pass/warn/fail）のみを親コンテキストに保持し、委譲工程内部の調査過程、中間ログ、読解メモを親コンテキストに累積しないこと（REQ-0114-085）。case-run インライン実行時のコンテキスト管理は harness の機能で対応し、REQ-0114-073（親コンテキスト非累積）は case-run インライン実行時の例外として取り扱う（REQ-0114-100）
- G29: case-auto の所有対象は入力解決、auto_gate確認、artifact_actions基準工程決定、入力引き渡し、永続状態再読込、継続停止再開判定、完了進行未実行報告、壁時計時間計測、case-run インライン実行時の準備/クリーンアップフェーズのオーケストレーション手順、Phase 分離（REQ-0114-102）、Phase 2 の固定並列数（REQ-0114-106）、bg task の状態管理、破棄検知（REQ-0114-105）、状態別回復、Phase 1 と Phase 3 の直列集約（REQ-0114-104）に限定する。bg task API、実行エージェント選定、実行担当サブエージェント内部の推論、context 管理、retry、heartbeat、エラー解析は harness の責務とする（REQ-0114-101、REQ-0162-002 の case-auto 適用、ADR-0138）
- G30: subagent 委譲時の category 選定は委譲先 command の責務と category 名の意味的距離を評価して決定すること。事務的手続き（Issue 作成、VERIFY、状態遷移等）には `unspecified-high` を推奨し、`writing` category は執筆作業（docs 記述、REQ/ ADR/ SPEC 本文執筆等）のみに限定すること（REQ-0163-001）
- G31: 全ての subagent 委譲 prompt に MUST NOT DO セクションを必須とすること。スコープ外作業（当該 command 責務外のファイル作成、REQ/ SPEC/ src の直接修正、文書監査、capture 境界を超える `.agentdev/` 直接変更等）を明示的に列挙し、subagent がスコープ境界を推定せずに従えるようにすること（REQ-0163-002）
- G32: case-auto は Phase 2 だけで case-run を並列起動する（REQ-0114-102/106）。Phase 1 と Phase 3 で case-run を並列起動せず、並列実行を利用できない場合だけ順次フォールバックへ切り替える（REQ-0114-107、ADR-0138）

### 出力制約
- G10: 成果物本文（Issue本文、PR本文、commit message、保存対象ファイル本文、テンプレート成果物）はverbatimで返す。判定結果、調査過程、中間ログ、読解メモは要約、成果物パス、根拠、親判断事項、capture候補へ圧縮して返す

### Capture 整合制約
- G17: case-auto は構成コマンド（case-run/ case-close）の capture 責務境界に従い、各工程の責務を継承する（SPEC `docs/specs/workflows/capture-boundaries.md` 準拠）。case-auto 固有の capture 振る舞いは持たない。capture 境界の詳細は `agentdev-workflow-orchestration` 参照

### 実行時パス制約
- G11: 既存コマンド定義を読み込む際、source path を実行時パスに読み替えてはならない。コマンド定義内のパス参照は記述された通りに解釈し、source path を実行時参照先として使用しない
- G12: 委譲先コマンドの実行時 Read/ Glob に source path 固定参照を含めない



