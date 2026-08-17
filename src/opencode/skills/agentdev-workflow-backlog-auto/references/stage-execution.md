# STEP-1/2/3: 開始時刻記録、stage 1、stage 2 実行（stage-execution）

> 本 reference は `agentdev-workflow-backlog-auto` SKILL.md の Control Plane STEP-1, STEP-2, STEP-3 詳細である。
> 開始時刻記録と進行状態初期化、stage 1（inspect-docs 単独直列実行）、stage 2（昇格3系統の並行実行と直列化契約）を提供する。

## 目次

- STEP-1: 開始時刻記録・進行状態初期化
- STEP-2: stage 1: inspect-docs 実行
- STEP-3: stage 2: 昇格3系統実行
- 直列化キュー
- 系統別結果状態の読み替え

## STEP-1: 開始時刻記録・進行状態初期化

### Purpose

実行開始時刻を記録し、durable state から工程進行を再構成する。

### Input Resolution

1. SSoT 再構成: 各子コマンドの durable state（learning は `.agentdev/learning/` 配下の `inbox.md` / `deferred.md` / `evaluation-report.md` / `promoted/`、intake は `.agentdev/intake/inbox/` と `.agentdev/intake/promoted/`、inspect は `.agentdev/inspect/inbox/` と `.agentdev/inspect/promoted/`、backlog-review は各 `promoted/` と `.agentdev/backlog/req-units/`）
2. identifier 保持: なし
3. 最小 scalar: `backlog_auto_started_at`（JST）
4. runtime artifact: なし

### Preconditions

- backlog-auto command から起動されている（引数なし）

### Procedure

実行開始時刻を JST で記録し `backlog_auto_started_at` に保持する。
STEP-6（完了報告）での所要時間算出の基準として使用する。

再実行時（進行状態の再構成が必要な場合）は次の表で工程進行を再構成する。

| 工程 | 再構成に使う durable state | 判定 |
|---|---|---|
| stage 1（inspect-docs） | 下流工程の進行痕跡、直近実行の完了証跡（`.agentdev/inspect/inbox/` の検出事項ファイル群または検出事項なし完了） | 下流工程に進行痕跡がある、または完了証跡が確定できる場合は完了。確定できない場合は未完了扱いで先頭から再実行 |
| stage 2 learning 系統 | `inbox.md`（ヘッダーのみへのクリア）、`evaluation-report.md`、`promoted/`、`deferred.md` | 系統内の再開点の再構成は `agentdev-workflow-learning-promote` の既存 STEP model 再開契約に委譲 |
| stage 2 intake 系統 | `.agentdev/intake/inbox/` と `.agentdev/intake/promoted/` の実ファイル状態、分類確定状態 | `agentdev-workflow-intake-promote` の既存再開契約に委譲 |
| stage 2 inspect 系統 | `.agentdev/inspect/inbox/`、`.agentdev/inspect/promoted/`、auto-promote-log | `agentdev-workflow-inspect-promote` の既存再開契約に委譲 |
| stage 3（backlog-review） | 各 `promoted/` 残存成果物、`.agentdev/backlog/req-units/` の `RU-*.md` 実ファイルと frontmatter | `agentdev-workflow-backlog-review` の既存再開契約に委譲 |

初回起動（未実行）と判定した場合は stage 1 から開始する。

### Result

- `backlog_auto_started_at` 記録
- 工程進行の再構成結果（各 stage の完了 / 未完了、stage 2 の系統別状態）

### Evidence

- `backlog_auto_started_at` の値、工程進行の再構成根拠（durable state の観測内容）

### Completion Verification

- 工程進行が一意に再構成されていること（確定不能な工程は未完了扱いであること）

### Resume-Idempotency

- 読取と記録のみで副作用を持たない。進行状態は各 STEP の実行で durable state に反映される子コマンド成果物から常に再構成できる

## STEP-2: stage 1: inspect-docs 実行

### Purpose

inspect-docs を単独直列実行し、docs 全体の意味整合診断の検出事項を `.agentdev/inspect/inbox/` へ出力する。
工程内部の手続きは `agentdev-workflow-inspect-docs` が正規の処理主体である。

### Input Resolution

1. SSoT 再構成: なし（inspect-docs はコマンド実行時に全対象成果物を自動スキャンする）
2. identifier 保持: なし
3. 最小 scalar: stage 1 の開始時刻、終了時刻
4. runtime artifact: なし

### Preconditions

- STEP-1 で開始時刻記録と進行状態再構成が完了している
- stage 1 が未完了と判定されている（完了済みの場合は STEP-3 へ進む）

### Procedure

`agentdev-workflow-inspect-docs` を権威情報源として inspect-docs を実行する（引数なし、単独直列）。

結果の分類:

- 正常終了（検出事項ファイル群の生成、または検出事項0件の完了）→ stage 2 開始条件成立、STEP-3 へ
- blocked / failed → 下流工程（stage 2、stage 3）を開始せず STEP-6 へ（停止報告）

inspect-docs の既存ガードレール（診断専用、検出事項ファイル生成以外の副作用禁止）を変更しない。

### Result

- stage 1 実行結果（正常終了 / blocked / failed）

### Evidence

- 検出事項ファイル群のパス一覧または検出事項0件の完了報告、blocked / failed 時はその理由

### Completion Verification

- inspect-docs が公開契約どおりに完了していること（完了報告の受領）
- blocked / failed 時に下流工程が開始されていないこと

### Resume-Idempotency

- inspect-docs は STEP model 対象外である。実行途中の中断時は先頭から再実行する（診断専用であるため再実行の副作用は検出事項ファイルの再生成に限定される）

## STEP-3: stage 2: 昇格3系統実行

### Purpose

learning-promote、intake-promote、inspect-promote の3系統を、系統相互の先行依存なしに実行する。
競合する処理のみ直列化キューで排他する。
各系統内部の手続きは各子 Workflow Skill が正規の処理主体である。

### Input Resolution

1. SSoT 再構成: 各系統の durable state（STEP-1 と同じ）
2. identifier 保持: 系統識別子（learning-promote / intake-promote / inspect-promote）
3. 最小 scalar: 系統別の開始時刻、終了時刻、結果状態
4. runtime artifact: なし（系統内部の過程は親コンテキストに累積しない）

### Preconditions

- stage 1 が正常終了している（検出事項0件の完了を含む）

### Procedure

3系統を起動する。
系統相互に先行依存を設けない。
並行実行を利用できる場合は並行し、利用できない場合は順次インターリーブ実行とする（いずれの場合も系統間の待ち合わせとブロッキングを行わない）。

各系統は対応する Workflow Skill を権威情報源として実行する:

- learning 系統: `agentdev-workflow-learning-promote`
- intake 系統: `agentdev-workflow-intake-promote`
- inspect 系統: `agentdev-workflow-inspect-promote`（通常実行で起動し `--auto` は渡さない。`--auto` は利用者が inspect-promote を単独実行して明示的に opt-in した場合のみ有効化される）

競合する処理は「直列化キュー」の規則に従って排他する。
ユーザー対話（HITL、確認、承認）は直列化し、対話の冒頭で対象系統を識別表示する（例: `[learning-promote]`）。

1系統の blocked、failed を検出しても他系統を連鎖停止しない。
全系統が終了（正常完了、対象なし終了、blocked、failed のいずれか）を待って STEP-4 へ進む。
親コンテキストには系統別の結果状態と次アクションのみ保持する。

系統の結果状態の読み替えは「系統別結果状態の読み替え」の表に従う。

### Result

- 系統別結果状態（正常完了 / 対象なし終了 / blocked / failed）と系統別成果物サマリ

### Evidence

- 系統別の完了報告（結果状態、出力パス、次アクション）、blocked / failed 時はその理由、直列化キューの実行記録（操作種別、対象系統、順序）

### Completion Verification

- 全系統がいずれかの結果状態で終了していること
- 競合する Git 操作、共有成果物書き込み、ユーザー対話が同時実行されていないこと
- ユーザー対話に系統識別が付されていること

### Resume-Idempotency

- 各系統の再開点は子 Workflow Skill の既存 STEP model 再開契約（durable state から再構成）に従う。本 STEP は系統別の起動と結果受領のみを管理する

## 直列化キュー

直列化の対象と規則を示す。

| 直列化対象 | 規則 |
|---|---|
| Git 同期、commit、push | 系統が Git 操作を開始する時点でキューへ投入し、先着順に排他実行する。実行単位は子ワークフローが定義する永続化ポイント（commit 単位）とする |
| 共有成果物への競合書き込み | 同一パスへの同時書き込みが競合しうる場合（git インデックス、`.agentdev/` 配下の同一ファイル）に排他する |
| ユーザー対話（HITL、確認、承認） | 複数系統が判断待ちとなった場合に直列化し、対話の冒頭で対象系統を識別表示する |

直列化対象以外の処理（読取、分析、整形、報告書作成）は待機しない。
キューは実行中の系統処理を中断しない（投入済みの非競合処理は継続する）。

## 系統別結果状態の読み替え

子コマンドの終了報告を本 workflow の系統別結果状態へ読み替える。
子コマンドの動作と公開契約は変更しない（オーケストレーション側の結果分類である）。

| 系統 | 正常完了 | 対象なし終了 | blocked / failed |
|---|---|---|---|
| learning-promote | HITL 承認を経た永続化と完了報告の受領 | `inbox.md` に未処理エントリなし。`inbox.md` 不在時の子コマンドのエラー報告（`agentdev-learning-capture` 案内）も、処理対象が存在しないことを意味するため対象なし終了として扱い、案内内容は完了報告に付記する | 子コマンドの blocked / failed 報告 |
| intake-promote | 分類確定と永続化の完了報告の受領 | `.agentdev/intake/inbox/` に item なし | 同上 |
| inspect-promote | 分類確定と処理実行の完了報告の受領 | `.agentdev/inspect/inbox/` に検出事項なし（子ワークフロー STEP-1 の「対象なし」終了と同一判定） | 同上 |

対象なし終了は正常終了として扱い、一括処理の失敗としない。
新規 promoted が0件かどうかは fan-in 判定（STEP-4）に影響しない。
