# epic-wave workflow: Epic Wave 実行（epic-wave）

> 本 reference は `agentdev-workflow-case-run` SKILL.md の epic-wave workflow 詳細である。
> `case-run #epic` 受領時に現在 ready な Wave の子Issue を並列実行する制御（STEP-W1〜W5）を所有する。
> 子Issue ごとの委譲・result 処理は [references/delegation-and-result.md](delegation-and-result.md) の STEP-S4/S5 と同一契約で並列適用する。

## 目次

- STEP-W1: Epic Issue 解析・Wave 選択
- STEP-W2: fan-out 準備
- STEP-W3: fan-out 並列委譲
- STEP-W4: fan-in・結果集約
- STEP-W5: Wave 完了報告・return

## STEP-W1: Epic Issue 解析・Wave 選択

### Purpose

Epic Issue 本文から現在 ready な Wave の子Issue 群を特定する。

### Input Resolution

1. SSoT 再構成: Epic Issue 本文（ステータス追跡テーブル、Wave 構成、子Issue 状態）
2. identifier 保持: Epic Issue番号、子Issue番号群
3. 最小 scalar: なし
4. runtime artifact: なし

### Preconditions

- STEP-S1 で epic-wave 実行モードが確定している（引数が Epic Issue 番号）

### Procedure

Epic Issue 本文を読み込み（`agentdev-epic-tracker` 参照）、現在 ready な Wave の子Issue を特定する。
1 Wave の実行（PR作成まで）で return し、Wave 境界（マージ）は扱わない。
同一コマンド再実行で次 Wave に進む（べき等、Epic Issue 本文から進行状況判定）。

**Epic 実証判定（統合先確定）**: Epic Issue 本文の実証Case識別情報から、Epic 実証の場合は共有評価ブランチ（当該 Epic の統合先）を特定する。実証Case識別情報がない場合は通常 Epic として main（既定）を統合先とする。Epic 実証では全 Wave が同一の評価ブランチを統合先として継承する（評価ブランチ継承の実行詳細は epic-wave-model Design 参照）。

**Epic Issue の入力ソース**: Epic Issue は本来の Epic flow（マルチREQ、`scale: large`）に加え、Standard flow 起因の独立 OU 自動 Epic 化（case-open が `depends_on` 空、L0 相当の独立 OU を検出して Epic 化）によるものも含む。
入力ソースを区別せず、Epic Wave モデル（ADR、最大5件並列委譲）で一様に処理する。
いずれのモードでも他Issue の実装履歴や Epic 全体の実装過程を前提としない。

### Result

- 現在 ready な Wave の子Issue 群（子Issue番号、状態）確定、Epic の統合先確定（通常 Epic は main、Epic 実証は共有評価ブランチ）

### Evidence

- Epic Issue 本文読取結果、Wave 選択の根拠（子Issue 状態一覧）、Epic 実証判定結果（実証Case識別情報の有無と共有評価ブランチ）

### Completion Verification

- 対象 Wave の子Issue が Epic Issue 本文のステータス追跡テーブルと一致していること。ready 子Issue が0件の場合は完了報告で通知して終了

### Resume-Idempotency

- Wave 選択は Epic Issue 本文（durable state）からの読取であり副作用を持たない。再実行時は最新のテーブルから同一ロジックで Wave を選択する

## STEP-W2: fan-out 準備

### Purpose

子Issue 並列委譲の前提（fetch、worktree 群、前置 gate 群）を整える。

### Input Resolution

1. SSoT 再構成: 子Issue 本文群、Epic Issue 本文
2. identifier 保持: 子Issue番号群、各ブランチ名
3. 最小 scalar: L2 タイムスタンプ（子Issue ごとの worktree 設置）
4. runtime artifact: なし

### Preconditions

- STEP-W1 で Wave 子Issue 群が確定している

### Procedure

- `git fetch origin` を実行し統合先（STEP-W1 で確定した Epic の統合先）の鮮度を確認する（Wave 実行時、PR merge 後再開時は必須）
- 子Issue ごとに worktree とブランチを作成する（`agentdev-git-worktree` 参照。作成元は当該 Epic の統合先を明示的に指定する。通常 Epic は従来どおり main を起点とし、Epic 実証は共有評価ブランチを起点とする。Epic 後続 Wave の作業起点も同一の統合先を参照。べき等チェック: 既存時はスキップ）
- 子Issue ごとに前置 gate 群（single.md STEP-S3 の STEP-S3-2〜S3-6 と同一契約: worktree precondition gate、QG-3 前置 staleness check、docs/** 変更時 targeted docs guard、配布依存境界 事前 gate、AUTOGEN 索引再生成 前置 gate）を適用する
- 子Issue ごとの worktree 設置の L2 タイムスタンプを記録する

### Result

- 全子Issue の worktree+ブランチ準備完了（べき等）、前置 gate 群の判定結果、L2 タイムスタンプ

### Evidence

- worktree・ブランチの存在確認結果、各 gate 実行結果、L2 タイムスタンプ

### Completion Verification

- 全子Issue について precondition gate が合格していること（不合格の子Issue は当該子Issue のみ起動停止とし、他子Issue へ伝播させない）

### Resume-Idempotency

- worktree・ブランチ既存時は作成をスキップする。一部子Issue のみ準備済みの再開では未準備分のみ作成する

## STEP-W3: fan-out 並列委譲

### Purpose

Wave 内子Issue を実行担当サブエージェントへ最大5件並列委譲する（3つの「5件」文脈の (1)）。

### Input Resolution

1. SSoT 再構成: 子Issue 本文群（委譲先が再取得）
2. identifier 保持: 子Issue番号、worktree root（相対パス）、ブランチ名
3. 最小 scalar: 並列数（最大5件）、L2 タイムスタンプ（子Issue ごとの委譲起動直前・直後）
4. runtime artifact: なし

### Preconditions

- STEP-W2 の前置 gate 群が合格している（対象子Issue 分）

### Procedure

各子Issue を [references/delegation-and-result.md](delegation-and-result.md) STEP-S4 と同一契約で実行担当サブエージェントへ委譲する（adapter skill 読込、委譲 prompt 内で実行 command 指定、worktree root 相対パス引き渡し、経路G 含む）。
並列数は最大5件とし、超過分は完了順に起動する。
子Issue ごとに委譲起動直前・直後の L2 タイムスタンプを記録する。

### Result

- 全子Issue の委譲起動（並列、最大5件）、L2 タイムスタンプ

### Evidence

- 委譲起動記録（子Issue × 起動時刻）、並列数

### Completion Verification

- Wave 内全子Issue の委譲が起動済みであること（起動失敗は result 契約の delegation-unavailable として処理）

### Resume-Idempotency

- PR 未作成かつ result 未確定の子Issue は委譲フェーズから再開できる。完了済み子Issue は再委譲しない（PR 存在で判定）

## STEP-W4: fan-in・結果集約

### Purpose

全委譲の完了を待機し、子Issue ごとの result を独立して集約する（partial result 許容）。

### Input Resolution

1. SSoT 再構成: 各子Issue の委譲 result、PR URL、Issue コメント（blocked/failed SSoT）、各 worktree の git status
2. identifier 保持: 子Issue番号、PR番号群
3. 最小 scalar: L2 タイムスタンプ（子Issue ごと）
4. runtime artifact: なし

### Preconditions

- STEP-W3 の全委譲が完了（または異常検知）

### Procedure

- 全委譲完了を待機し、各子Issue の result を4状態契約（delegation-and-result.md STEP-S5 と同一処理）で収集する
- **partial result**: 一部の子Issue が blocked / failed / delegation-unavailable でも、完了済み子Issue の PR は有効として保持する。blocked/failed 子Issue を次 Wave へ進めない、`completed` に上書きしない
- **child task recovery**: 子 task 異常終了・bg task 破棄検知時は worktree の git status と残留変更で帰属を確認し、個別に blocked / failed へ分離する。帰属が確認できない場合は強制 commit せず当該子 task を blocked とする
- **compaction 復元**: 会話コンテキスト喪失後は、子 task 状態を Harness から復元し、完了済み子Issue 状態を durable domain state（PR・Issue コメント・Epic Issue 本文）と再構成して fan-in 判定を行う

### Result

- 子Issue ごとの result 一覧（4状態、PR番号）、partial result 保持、回復記録

### Evidence

- result 別子Issue 一覧、PR URL 群、Issue コメント参照、回復処理の記録

### Completion Verification

- Wave 内全子Issue が4状態のいずれかに分類されていること

### Resume-Idempotency

- 集約は durable state（PR、Issue コメント）からの再構成で冪等である。再実行時は既分類の子Issue を再処理しない

## STEP-W5: Wave 完了報告・return

### Purpose

1 Wave 分の結果を集約報告し、Wave 境界を扱わず return する。

### Input Resolution

1. SSoT 再構成: STEP-W4 の集約結果、Epic Issue 本文（読取のみ）
2. identifier 保持: Epic Issue番号、子Issue番号群、PR番号群
3. 最小 scalar: L2 タイムスタンプ内訳
4. runtime artifact: なし

### Preconditions

- STEP-W4 の結果集約が完了している

### Procedure

**tmp/ 残存確認**: 当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないことを確認する。残存時は `agentdev-gh-cli` の cleanup 規定に従って処理し、残存ファイルと対応結果を完了報告に明示する。

完了報告 template に従い、result 状態別（completed-pr / blocked / failed / delegation-unavailable）の子Issue 一覧と PR番号、L2 タイムスタンプ内訳を出力する。
Epic Issue 本文ステータス追跡テーブルの更新は行わない（case-close 単一書き手）。
`completed-pr` となった子Issue を次 Wave へ進めるためには、case-close でマージ後に再度 `case-run #epic` を実行する（べき等）。

### Result

- 1 Wave 分の完了報告（tmp/ 残存確認結果を含む）、return（PR 作成まで）

### Evidence

- 完了報告出力（result 別一覧、tmp/ 残存確認結果、L2 内訳）

### Completion Verification

- 完了報告に全子Issue の result 状態と PR番号が含まれていること
- 当該実行で `.agentdev/tmp/` に作成した一時ファイルが残存していないこと（残存時は対応結果を報告済みであること）

### Resume-Idempotency

- 報告のみで副作用を持たない。Wave 進行状態は Epic Issue 本文（durable state）が正である

## 関連 STEP

- 前: STEP-S1（single.md、実行モード分岐）
- 次: なし（Wave 境界は case-close、複数 Wave 制御は case-auto の責務）

## 関連 Capability Skill

- `agentdev-epic-tracker`: Epic Issue 本文読込、Wave 子Issue 特定、子Issue 状態 enum
- `agentdev-case-run-execution-adapter`: 子Issue ごとの委譲契約
- `agentdev-git-worktree`: 子Issue worktree 群の作成
- `agentdev-workflow-orchestration`: fan-out/fan-in、child task recovery の状態管理

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（単一 Wave のみ処理、1 Wave の実行で PR 作成まで return、最大5件並列委譲）
- G24（完了条件チェックボックスの評価・更新は case-close QG-4 の責務）
- 不変条件（blocked/failed の SSoT は Issue コメント、completed の SSoT は PR 本文）
