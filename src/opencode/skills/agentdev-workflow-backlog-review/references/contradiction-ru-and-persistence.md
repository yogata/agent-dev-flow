# STEP 詳細: 矛盾検出 / RU 生成・成果物削除 / Git 永続化・完了報告（backlog-review）

> 本 reference は `agentdev-workflow-backlog-review` SKILL.md の Control Plane STEP-6〜STEP-8 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は各 STEP の実行詳細を提供する。

## 目次

- STEP-6: 矛盾検出・追加判断
- STEP-7: RU 生成・知識文書保存・成功成果物削除
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

## STEP-7: RU 生成・知識文書保存・成功成果物削除

### Purpose

RU を生成し、承認済みの docs/knowledge/ 知識文書保存を実行し、RU 生成または知識文書保存が成功した採用済み成果物のみを削除する。

### Input Resolution

- STEP-5 で承認確定した RU 構成案、STEP-6 の矛盾検出結果（durable state: promoted/ 実ファイル、RU-ID）
- RU 生成ルール、frontmatter スキーマ、depends_on 検証は `agentdev-backlog-integration` の公開操作契約に従う
- learning 由来のルーティング処置の実行境界は `agentdev-backlog-integration` の昇華先ルーティング契約に従う
- docs/knowledge/ 直接保存手順の正規原本は backlog-review Design「learning 由来プロジェクト知識の docs/knowledge/ 直接保存」節、操作種別判定基準は `agentdev-backlog-integration` の昇華先ルーティング契約に従う
- session由来RU の生成形式は一時成果物ライフサイクル要件と artifact-contracts Design「RU アーティファクト契約（session由来RU）」セクションを正規原本とする

### Preconditions

- 承認確定、矛盾処理完了であること
- 矛盾により除外された成果物がある場合は、ユーザーの追加判断が確定していること
- docs/knowledge/ 知識文書保存の処置がある場合は、操作種別（新規、更新、置換、削除）ごとの変更内容が STEP-5 で承認済みであること

### Procedure

1. RU 構成案に基づき `.agentdev/backlog/req-units/RU-*.md` を生成する（frontmatter: `source_type`, `generated_by`, `generated_at`, `status`, `depends_on`, `tentative_classification`, `sources` / 本文: Sources, Source Summary, 統合理由, 要件化の方向）
2. session由来RU（`source_type: chat`、`generated_by: session`）の場合は、正規原本（一時成果物ライフサイクル要件、artifact-contracts Design「RU アーティファクト契約（session由来RU）」）へ委譲した要件（二段階承認、frontmatter 必須フィールド、`agreement_confirmed_at`、session 論理URI、RU 本文必須8セクション、永続ID 採番）に従う
3. depends_on 検証を実行する（RU-ID のみ許容、unresolved、循環の検証）
 4. docs/knowledge/ 知識文書保存処置を実行する。STEP-5 で承認済みの操作種別（新規、更新、置換、削除）に従い、整形済み知識文書（1知識1ファイル、kebab-case slug、必須内容5項目）を docs/knowledge/ へ書き込む。承認なしの docs/knowledge/ 書き込みは行わない（REQ-{NNNN}-{NNN}）。知識文書の保存が確認できた採用済み成果物を promoted から削除する（REQ-{NNNN}-{NNN}）
5. RU 生成が成功した採用済み成果物のみを削除する。
削除条件は当該成果物が RU に取り込まれ、RU ファイルの生成が確認できた場合のみ。
RU 化に失敗した成果物、矛盾により除外された成果物は残置する
6. ルーティング処置のうち削除処置は、STEP-5 で明示承認済みの場合に限り該当採用済み成果物を promoted から削除する。保留、指示出力型の処置（Issue 修正指示、ガードレール移管指示、Project Extension 接続更新指示）の成果物は promoted に残置する
7. 削除結果、知識文書保存結果、ルーティング処置の実行結果を記録する

### Result

- `.agentdev/backlog/req-units/RU-*.md`
- 承認済み docs/knowledge/ 知識文書の保存
- RU 化成功成果物、知識文書保存成功成果物の削除、ルーティング削除処置の実行、残置成果物の記録

### Evidence

- 生成済み RU のファイルパス一覧、docs/knowledge/ 知識文書の保存結果（操作種別と対象ファイル）、削除/ 残置の成果物一覧、ルーティング処置別の実行結果

### Completion Verification

- RU 構成案の全 RU について RU ファイルが生成されていること（矛盾除外分を除く）
- docs/knowledge/ 知識文書の書き込みが承認済み操作種別に一致していること。承認なしの書き込みが 0件であること
- RU 生成成功分、知識文書保存成功分の成果物のみが削除されていること
- ルーティングの削除処置が明示承認済みのものに限られていること

### Resume-Idempotency

- 生成済みの RU は再生成しない。req-units/、docs/knowledge/、promoted/ の実ファイル状態から削除未完了の成果物を特定し、残処理のみ実行する
- RU 実ファイルと docs/knowledge/ の知識文書実ファイルの存在が承認・生成・保存証跡となる

## STEP-8: Git 永続化・完了報告

### Purpose

`.agentdev/` 配下の変更を commit / push し、完了報告を出力して workflow を終了する。

### Input Resolution

- STEP-7 の結果（durable state: req-units/、docs/knowledge/、promoted/ 実ファイル）
- ドメイン状態永続化プロシージャは `agentdev-git-worktree` に従う

### Preconditions

- RU 生成・知識文書保存・削除が完了していること

### Procedure

1. `git diff --name-only` で `.agentdev/` 配下と `docs/knowledge/` 配下の変更を確認する
2. 変更なし時は commit/push せず完了報告で「変更なし」と報告する
3. 変更あり時、並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い明示パスでステージする。
生成した RU は `.agentdev/backlog/req-units/` 配下、保存・更新・置換・削除した知識文書は `docs/knowledge/` 配下、削除した採用済み成果物は `.agentdev/{intake,learning,inspect}/promoted/` 配下の各パスを `git add <path>`/ `git rm <path>` で明示的にステージする。
`.agentdev/` 全体の一括 `git add` は禁止
4. commit message は `chore(agentdev): generate requirement units via backlog-review` とする
5. `git commit -- <paths>`（--only pathspec 形式）を実行し、`git push` を行う。失敗時は構造化エラーメッセージを表示して停止する
6. 完了報告をテンプレート別に出力する。
全て成功時は `.opencode/commands/agentdev/templates/backlog-review/standard.md`、partial success（矛盾あり）時は `partial.md`、採用済み成果物なし時は `zero-promoted.md` に従う。
RU 生成結果、知識文書保存結果、ルーティング処置結果、git 永続化結果を含め、次のコマンド（`/agentdev/req-define`）を提示する。
docs/knowledge/ に知識文書を保存した場合は保存結果（操作種別と対象ファイル）を完了報告に含める。
昇華先が project-local 資産である処置は、書き込み先の実行前提（git 管理境界）を明示した指示を完了報告に含める

### Result

- commit/push 済み（変更あり時）
- 完了報告（テンプレート別）

### Evidence

- commit hash、push 成否、完了報告の出力

### Completion Verification

- RU 生成結果と git 永続化結果が完了報告に含まれていること
- learning 由来のルーティング処置結果、docs/knowledge/ 知識文書の保存結果が完了報告に含まれていること
- partial success 時に該当テンプレートを使用していること

### Resume-Idempotency

- commit 済みの変更は再コミットしない。`git diff --name-only` の結果から未永続化の変更を特定し、残処理のみ実行する
- 報告は出力のみのため再実行に副作用がない
