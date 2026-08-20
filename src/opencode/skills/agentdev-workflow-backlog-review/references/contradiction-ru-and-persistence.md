# STEP 詳細: 矛盾検出 / RU 生成・成果物削除 / Git 永続化・完了報告（backlog-review）

> 本 reference は `agentdev-workflow-backlog-review` SKILL.md の Control Plane STEP-6〜STEP-8 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は各 STEP の実行詳細を提供する。

## 目次

- STEP-6: 矛盾検出・追加判断
- STEP-7: RU 生成・成功成果物削除
- STEP-8: Git 永続化・完了報告

## STEP-6: 矛盾検出・追加判断

### Purpose

採用済み成果物間の矛盾を検出し、検出された場合のみユーザーに追加判断を求める。

### Input Resolution

- STEP-5 で承認確定した RU 構成案（中断時は promoted/ 実ファイルから再構築する）
- 矛盾検出ロジック、出力形式は `agentdev-backlog-integration` の公開操作契約に従う
- STEP-4 の review で指摘された矛盾は本 STEP へ引き継がれる（矛盾の判定、partial success 扱い、ユーザー追加判断への委ねは本 STEP の既存ロジックが正）

### Preconditions

- 承認確定済み（STEP-5 完了）

### Procedure

1. RU 構成案に含まれる採用済み成果物間の矛盾を検出する
2. 矛盾が検出されない場合: そのまま STEP-7 へ進む（単一承認で RU 生成扱い。追加の HITL は不要）
3. 矛盾が検出された場合のみ、ユーザーに追加判断を求める。
矛盾する artifact を RU 化せずユーザーに確認する。
自動解決しない
4. 矛盾しない artifact は通常通り RU 化する（partial success）

### Result

- 矛盾検出結果（なし / あり + ユーザー追加判断結果、partial success 扱いの確定）

### Evidence

- 矛盾検出結果、追加判断の対話記録（検出時）

### Completion Verification

- 矛盾検出の実行結果が記録されていること
- 検出時に自動解決していないこと（ユーザー判断を経ていること）

### Resume-Idempotency

- promoted/ 実ファイルから矛盾検出を再実行できる。不可逆処理を含まないため再実行に副作用がない

## STEP-7: RU 生成・成功成果物削除

### Purpose

RU を生成し、RU 生成が成功した採用済み成果物のみを削除する。

### Input Resolution

- STEP-5 で承認確定した RU 構成案、STEP-6 の矛盾検出結果（durable state: promoted/ 実ファイル、RU-ID）
- RU 生成ルール、frontmatter スキーマ、depends_on 検証は `agentdev-backlog-integration` の公開操作契約に従う
- session由来RU の生成形式は一時成果物ライフサイクル要件と artifact-contracts Design「RU アーティファクト契約（session由来RU）」セクションを正規原本とする

### Preconditions

- 承認確定、矛盾処理完了であること
- 矛盾により除外された成果物がある場合は、ユーザーの追加判断が確定していること

### Procedure

1. RU 構成案に基づき `.agentdev/backlog/req-units/RU-*.md` を生成する（frontmatter: `source_type`, `generated_by`, `generated_at`, `status`, `depends_on`, `tentative_classification`, `sources` / 本文: Sources, Source Summary, 統合理由, 要件化の方向）
2. session由来RU（`source_type: chat`、`generated_by: session`）の場合は、正規原本（一時成果物ライフサイクル要件、artifact-contracts Design「RU アーティファクト契約（session由来RU）」）へ委譲した要件（二段階承認、frontmatter 必須フィールド、`agreement_confirmed_at`、session 論理URI、RU 本文必須8セクション、永続ID 採番）に従う
3. depends_on 検証を実行する（RU-ID のみ許容、unresolved、循環の検証）
4. RU 生成が成功した採用済み成果物のみを削除する。
削除条件は当該成果物が RU に取り込まれ、RU ファイルの生成が確認できた場合のみ。
RU 化に失敗した成果物、矛盾により除外された成果物は残置する
5. 削除結果を記録する

### Result

- `.agentdev/backlog/req-units/RU-*.md`
- RU 化成功成果物の削除、残置成果物の記録

### Evidence

- 生成済み RU のファイルパス一覧、削除/ 残置の成果物一覧

### Completion Verification

- RU 構成案の全 RU について RU ファイルが生成されていること（矛盾除外分を除く）
- RU 生成成功分の成果物のみが削除されていること

### Resume-Idempotency

- 生成済みの RU は再生成しない。req-units/ と promoted/ の実ファイル状態から削除未完了の成果物を特定し、残処理のみ実行する
- RU 実ファイルの存在が承認・生成証跡となる

## STEP-8: Git 永続化・完了報告

### Purpose

`.agentdev/` 配下の変更を commit / push し、完了報告を出力して workflow を終了する。

### Input Resolution

- STEP-7 の結果（durable state: req-units/、promoted/ 実ファイル）
- ドメイン状態永続化プロシージャは `agentdev-git-worktree` に従う

### Preconditions

- RU 生成・削除が完了していること

### Procedure

1. `git diff --name-only` で `.agentdev/` 配下の変更を確認する
2. 変更なし時は commit/push せず完了報告で「変更なし」と報告する
3. 変更あり時、並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い明示パスでステージする。
生成した RU は `.agentdev/backlog/req-units/` 配下、削除した採用済み成果物は `.agentdev/{intake,learning,inspect}/promoted/` 配下の各パスを `git add <path>`/ `git rm <path>` で明示的にステージする。
`.agentdev/` 全体の一括 `git add` は禁止
4. commit message は `chore(agentdev): generate requirement units via backlog-review` とする
5. `git commit -- <paths>`（--only pathspec 形式）を実行し、`git push` を行う。失敗時は構造化エラーメッセージを表示して停止する
6. 完了報告をテンプレート別に出力する。
全て成功時は `.opencode/commands/agentdev/templates/backlog-review/standard.md`、partial success（矛盾あり）時は `partial.md`、採用済み成果物なし時は `zero-promoted.md` に従う。
RU 生成結果、git 永続化結果を含め、次のコマンド（`/agentdev/req-define`）を提示する

### Result

- commit/push 済み（変更あり時）
- 完了報告（テンプレート別）

### Evidence

- commit hash、push 成否、完了報告の出力

### Completion Verification

- RU 生成結果と git 永続化結果が完了報告に含まれていること
- partial success 時に該当テンプレートを使用していること

### Resume-Idempotency

- commit 済みの変更は再コミットしない。`git diff --name-only` の結果から未永続化の変更を特定し、残処理のみ実行する
- 報告は出力のみのため再実行に副作用がない
