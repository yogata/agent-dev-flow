# STEP-4/5/6: fan-in 判定、stage 3 実行、完了報告（fan-in-and-reporting）

> 本 reference は `agentdev-workflow-backlog-auto` SKILL.md の制御平面（STEP 一覧）STEP-4, STEP-5, STEP-6 詳細である。
> fan-in 判定（backlog-review 開始条件）、stage 3（backlog-review 実行）、完了報告（工程別結果、停止理由、再開コマンド提示、一気通貫実行結果）を提供する。

## 目次

- STEP-4: fan-in 判定
- STEP-5: stage 3: backlog-review 実行
- STEP-6: 完了報告

## STEP-4: fan-in 判定

### Purpose

stage 2 の系統別結果状態から backlog-review の開始可否を判定する。

### Input Resolution

1. SSoT 再構成: 系統別結果状態（STEP-3 の結果）、各 `promoted/` の実ファイル状態
2. identifier 保持: 系統識別子（learning-promote / intake-promote / inspect-promote）
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-3 で全系統が終了している、または再構成時に未完了系統が残っている

### Procedure

判定表に従って backlog-review の開始可否を判定する。

| 条件 | 判定 | 次遷移 |
|---|---|---|
| 3系統すべてが正常完了または対象なし終了 | 開始可 | STEP-5 |
| 1系統でも blocked、failed、未完了 | 開始不可 | STEP-6（停止報告） |

新規 promoted が0件かどうかは判定に影響しない。
全系統が正常終了していれば、`promoted/` が空の場合でも backlog-review を開始する（実行前から存在する promoted の処理と、対象0件時の扱いは backlog-review の公開契約どおり）。

未完了（中断残り）の系統は開始不可の条件に含める。
再構成の結果、全系統が正常完了または対象なし終了と確定できた場合は開始可とする。

### Result

- backlog-review 開始可否と判定根拠（系統別結果状態の一覧）

### Evidence

- 系統別結果状態、各 `promoted/` の観測結果

### Completion Verification

- 3系統すべてが正常完了または対象なし終了の場合のみ開始可と判定されていること

### Resume-Idempotency

- 判定は durable state（系統別 durable state と結果報告）から再実行可能であり、副作用を持たない

## STEP-5: stage 3: backlog-review 実行

### Purpose

backlog-review を実行し、採用済み成果物の分析、統合、ユーザー承認を経た RU 生成を行う。
工程内部の手続きは `agentdev-workflow-backlog-review` が正規の処理主体である。

### Input Resolution

1. SSoT 再構成: `.agentdev/intake/promoted/*.md`、`.agentdev/learning/promoted/*.md`、`.agentdev/inspect/promoted/*.md`、`.agentdev/backlog/req-units/` の `RU-*.md`
2. identifier 保持: なし
3. 最小 scalar: stage 3 の開始時刻、終了時刻
4. runtime artifact: なし

### Preconditions

- STEP-4 で backlog-review 開始可と判定されている

### Procedure

`agentdev-workflow-backlog-review` を権威情報源として backlog-review を実行する（引数なし、全ディレクトリの採用済み成果物が対象。実行前から存在する promoted を含む）。

backlog-review の HITL（RU 作成承認）、矛盾検出時のユーザー指示待機、破壊的変更の明示承認を backlog-review 側の所有する境界として維持する。
stage 3 は単独実行であるため直列化キューは使用しない。

結果の分類と遷移:

- 正常完了（RU 生成と完了報告の受領）→ 承認確定 RU 一式の存在確認を行い、1 件以上存在する場合は STEP-7 へ（一気通貫実行の継続。set-state 初期化・基準点確定）、0 件の場合は STEP-6 へ（完了報告。一式不在の旨を含める）
- blocked / failed → STEP-6 へ（停止報告）

### Result

- stage 3 実行結果（正常完了 / blocked / failed）と一式 RU の存在有無

### Evidence

- 生成された `RU-*.md` のパス一覧、成功成果物削除結果、blocked / failed 時はその理由

### Completion Verification

- backlog-review が公開契約どおりに完了していること（完了報告の受領）
- 一式 RU の存在有無に応じて STEP-7 または STEP-6 へ遷移していること

### Resume-Idempotency

- 再開点の再構成は `agentdev-workflow-backlog-review` の既存 STEP model 再開契約（promoted/ 残存成果物、RU 実ファイルと frontmatter）に委譲する

## STEP-6: 完了報告

### Purpose

工程別結果、停止理由、再開コマンド提示、一気通貫実行結果（実行された場合）を含む backlog-auto 全体の実行結果報告を出力する。
共通実行契約形式に従う。

### Input Resolution

1. SSoT 再構成: 各 stage の結果状態、`backlog_auto_started_at`、系統別の起動時刻・終了時刻（活動区間）、直列化キューの実行記録、set-state（一気通貫実行を実行した場合の全体完了判定結果、リリース結果または保留理由）
2. identifier 保持: 系統識別子、一式識別子（一気通貫実行時）
3. 最小 scalar: 終了時刻（`backlog_auto_started_at` からの所要時間）
4. runtime artifact: なし

### Preconditions

- 全工程完了または停止条件の検出（一気通貫実行時は STEP-11 完了後、または stage 4〜7 のいずれかの停止条件検出後）

### Procedure

全体完了時（stage 3 正常完了後の一式 RU 不存在時、または stage 6〜7 完了後）は次を報告する:

- 工程別結果（stage 1、stage 2 系統別、stage 3、実行された場合は stage 4〜7）。stage 2 には系統別の起動時刻・終了時刻（活動区間）と直列化キューの実行記録（操作要求、発行と抑止、実行順序、解除、結果回収を含む）を含める
- 生成成果物サマリ（検出事項、採用済み成果物、RU）
- 一気通貫実行結果（実行された場合）: 全体完了判定結果（完遂 / 未完遂と突合根拠）、リリース結果または保留理由（版番号、タグ名、対象コミット、公開成果物の確認情報。保留時は理由）、一式識別子
- 所要時間（`backlog_auto_started_at` からの差分）
- 次アクション（RU がある場合の案内、リリース保留時は backlog-auto 再実行によるリリース段階からの再開案内）

一気通貫実行の完遂判定と最終報告は一気通貫実行の REQ が所有し、backlog 整理サイクル部分の完了扱い・全体報告とは分離して報告する。

停止時は次を報告し、全体完了扱いにしない:

- 停止理由（どの工程、系統が blocked、failed、未完了か、その理由。基準点確定不能、全体完遂不成立、リリース保留、公開途中失敗を含む）。系統の失敗・停止を含む場合は投入済み操作要求の排他解除と結果回収の実施結果を含める
- 再開点（完了済み工程と再開対象。一気通貫実行時は set-state 上の stage 別進捗）
- 再開可能な次コマンド（`/agentdev/backlog-auto` 再実行、または対象子コマンドの単独実行。stage 5 停止時は case-auto 単独の再開入口に加えて一式再開経路（backlog-auto 再実行）を併記）

報告には工程別結果の内訳を含め、系統別の詳細は子ワークフロー自身の完了報告と durable state を参照させる。

### Result

- backlog-auto 全体の実行結果報告（共通実行契約形式）

### Evidence

- 報告本文（工程別結果、停止理由、再開コマンド、一気通貫実行結果）

### Completion Verification

- 停止時に全体完了が報告されておらず、再開点と再開可能な次コマンドが明示されていること
- 全体完了時に系統別の起動時刻・終了時刻（活動区間）と直列化キューの実行記録が報告に含まれ、活動区間の重なりから並列実行の成立を確認できること
- 一気通貫実行を実行した場合、全体完了判定結果とリリース結果または保留理由が報告に含まれていること

### Resume-Idempotency

- 報告は durable state から再構成した工程進行に基づいて出力する。報告自体は副作用を持たない
