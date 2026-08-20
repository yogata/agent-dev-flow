# 共通委譲・result 処理（delegation-and-result）

> 本 reference は `agentdev-workflow-case-run` SKILL.md の共通 STEP 詳細である。
> STEP-S4（実行担当サブエージェント委譲）と STEP-S5（result 処理・配布依存境界 最終 gate）を所有する。
> single workflow から直接参照され、epic-wave workflow からは子Issue ごとの委譲契約として並列適用される。

## 目次

- STEP-S4: 実行担当サブエージェント委譲（経路G 含む）
- STEP-S5: result 処理・配布依存境界 最終 gate

## STEP-S4: 実行担当サブエージェント委譲（経路G 含む）

### Purpose

実装実行を adapter skill を読み込んだ実行担当サブエージェントへ委譲し、委譲の壁時計時間を計測する。

### Input Resolution

1. SSoT 再構成: Issue 本文（実行契約）、REQ/Decision/Design/docs/repository context（委譲先が再取得）
2. identifier 保持: Issue番号、worktree root（相対パス、`.worktrees/{N}-{type}/`）、ブランチ名、PR base（当該 Case の統合先）
3. 最小 scalar: L2 タイムスタンプ（委譲起動直前・直後、JST）
4. runtime artifact: なし（外部実行ハーネスの plan artifact 等は永続成果物としない）

### Preconditions

- STEP-S3（single）または STEP-W2（epic-wave）の前置 gate 群が合格していること（worktree 内検証済み）

### Procedure

- 実装実行を adapter skill（`agentdev-case-run-execution-adapter`）を読み込んだ実行担当サブエージェントへ委譲する（委譲 prompt 内で実行 command を指定）。起動手段は AGENTS.md および references/<harness>.md 参照。adapter protocol は同 skill 参照
- **L2 タイムスタンプ計測**: 委譲起動直前・直後に壁時計タイムスタンプ（JST）を記録し、実行担当サブエージェント実行時間を計測する。併せて STEP-S3（worktree 設置）と STEP-S6（クリーンアップ）の開始・終了時刻を記録する
- 委譲プロンプト、staleness check 結果の引き渡し、test strategy 項目の test-fix ループ、実行担当サブエージェントの責務（目標分解、各 criterion に observable evidence を要求、品質ゲートの実行、test-fix ループ）、委譲起動失敗・異常終了時の扱い（即 `failed` とせず実装完了・検証未完了として扱う）の詳細は `agentdev-case-run-execution-adapter` スキルを参照
- **引き渡し**: 割り当てられた1 Issue の Issue番号、worktree root（相対パス指定、worktree 内制約）、ブランチ名、PR base（当該 Case の統合先。通常Caseは main、実証Caseは評価ブランチ。rebase・同期基準も同一の統合先を参照）
- **実証Caseの委譲指示**: 実証Caseの場合、委譲プロンプトに評価ブランチを作業起点および PR base とすることと、評価ブランチ上で必要な実証手段の準備、実行、測定、観察、証拠生成、評価を行うことを含める。コード作成が不要な実証も許容し、実証コード・評価基盤・評価用データのみを変更対象とする PR、検証のみの PR を通常の Case と同一の経路で扱う（検証のみの PR は verification-only PR の既存経路に従う）。評価契約と test strategy は分離されており、test strategy は実証手段・計測手段・実証環境が正常に動作したかの検証を担う。実行側の自律判断で評価契約を変更しない
- **実証Caseの PR 本文記録要素**: 実行担当サブエージェントが PR 本文に実際の実行条件、測定結果、観察結果、証拠、評価結果を記録するよう委譲プロンプトで指示する。評価ブランチ削除後も Issue/PR から必要な結果と証拠を追跡できる形式とする
- **PR URL 受領**: 実行担当サブエージェントが直接 PR 作成を行い、PR URL を委譲 result として返却する（PR URL フォールバック検索は使用しない）
- **case-run 本体は実装方針を生成・審査しない**: 実装方針の形成、adversarial-review 呼出、結果反映は委譲内で adapter の委譲契約に従い、最初の実装変更前に実施する。case-run 本体が実装方針を生成、保持、審査するステップを新設しない。委譲 result（4状態）のみで委譲内の結果を受領する
- **経路G（adapter 委譲内 adversarial-review）**: 発動条件判定と review 呼出は adapter 委譲内で実行担当サブエージェントが分離して実施する。default-on、skip 条件（実装方針が自明の場合）該当時は省略して従来フローを継続、ユーザー明示指定時は強制発動。実装方針限定、blocked 遷移（(1) 既確定文書の変更・追加・撤回が必要、(2) 要件・仕様問題の検出、(3) unresolved な本質的争点またはユーザー判断事項が残る）の詳細は `agentdev-case-run-execution-adapter` 参照

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

- **result 4状態処理**（`agentdev-case-run-execution-adapter` の result 契約）:
  - **completed-pr**: 実装完了、PR作成済み。PR番号を受け取り最終 gate（後述）へ。成功成果は PR 作成である
  - **blocked**: 回答可能な blocker。詳細本文は Issue コメントに SSoT として記録済み（実行担当サブエージェント責務）。エラー処理に従い停止、ユーザー報告
  - **failed**: repository context で回答不能な blocker。詳細本文は Issue コメントに構造化して記録済み。エラー処理に従い停止、ユーザー報告
  - **delegation-unavailable**: 実行インフラが委譲を起動できなかった状態。実行未試行のため `pending` に戻す
- **L2 タイムスタンプ受け渡し**: result 状態（completed-pr/blocked/failed）にかかわらず、STEP-S3（worktree 設定）、STEP-S4（実行担当サブエージェント実行）で計測した L2 タイムスタンプを result に含める。case-auto は本 L2 内訳を case-run 委譲の L1 壁時計時間の内訳として読み取る
- **STEP-S5-1: 配布依存境界の最終変更経路 gate（実装後、command 公開順序の STEP-S5 に対応）**: result が `completed-pr` の場合、STEP-S6 に進む前に、実装後の実際の worktree HEAD に対して最終 gate を行う（実装担当サブエージェントが追加した変更も含めて検査する）
  - 実行条件: result が `completed-pr` であり、PR 対象ファイルに `src/opencode/{commands,skills}/**` 変更を含む場合。当該変更を含まない PR（docs のみ等）ではスキップする
  - 実行コマンド: `bun run .opencode/skills/<integrity-detector-skill>/scripts/check_distribution_boundary.ts --profile source --json`。現在の worktree（実装後 HEAD）の配布物ソースツリーを検査する
  - **checker コマンドの stdout 退避形式**: 本 gate の checker コマンドは exit code が意味を持つコマンド（非ゼロ exit = 違反検出）であるため、実行と stdout 取得は `agentdev-gh-cli` READ 手続きの「exit code が意味を持つコマンドの stdout 退避形式」に従う（`spawnSync` による status/ stdout 分離取得 + `fs.writeFileSync` の UTF‑8 明示書き出し）。非ゼロ exit 時も JSON 実行結果（Evidence）を保持する
  - 検出結果の分類: 検査エラー（読込不能、未分類エントリ、adapter 起動失敗）は全て gate-not-passed として扱う。clean として通過させない
  - 違反検出時の停止契約（adapter result `blocked` とは区別）: 違反検出時は PR 本文の `## Findings / Capture候補` セクションに `### distribution-boundary` 小見出しで記録し、STEP-S6 へ進まず case-run を停止する。adapter result は `completed-pr` のまま変更せず、adapter result 契約の `blocked` へ上書きしない。停止理由は「配布依存境界 最終 gate 違反（PR 本文記録済み）」と報告し、SSoT は PR 本文とする。next action は同一 Issue で case-run を再実行し違反を修正する（worktree+ブランチ存活時は STEP-S3 をスキップし STEP-S4 から再開、べき等）。case-close へは進めない

### Result

- result 処理結果（4状態別）、最終 gate 判定（合格 / 違反停止 / スキップ）、L2 受け渡し

### Evidence

- result 状態と PR URL または Issue コメント、最終 gate の JSON 実行結果

### Completion Verification

- 4状態いずれかの処理が完了していること。completed-pr + src/opencode 変更時は最終 gate 合格（または違反記録済み停止）であること

### Resume-Idempotency

- 最終 gate は worktree HEAD に対する読取検査であり再実行可能。違反修正後の再実行で合格すれば同一 result（completed-pr）から STEP-S6 へ進む

## 関連 STEP

- 前: STEP-S3（single.md）/ STEP-W2（epic-wave.md）
- 次: STEP-S6（single.md）/ epic-wave では STEP-W4 で集約

## 関連 Capability Skill

- `agentdev-case-run-execution-adapter`: adapter protocol、result 契約、経路G、異常終了時事後処理
- `agentdev-workflow-orchestration`: 障害伝播、capture 境界
- integrity checker skill（repo 固有）: check_distribution_boundary.ts（--profile source）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（単一 Issue または単一 Wave のみ処理、実装実行の委譲、result 4状態契約）
- G24（完了条件チェックボックスの評価・更新は case-close QG-4 の責務）
- 不変条件（blocked/failed の SSoT は Issue コメント、completed の SSoT は PR 本文）
- 不変条件（外部実行ハーネス中間成果物の非扱い、PR URL 受領）
- 不変条件（Design確定候補は PR 本文の別セクションに記録）
