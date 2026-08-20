# STEP 詳細: HITL / persistence / destructive handling / 完了報告（intake-promote）

> 本 reference は `agentdev-workflow-intake-promote` SKILL.md の Control Plane STEP-3〜STEP-6 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は各 STEP の実行詳細を提供する。

## 目次

- STEP-3: HITL（ユーザー確認・分類承認）
- STEP-4: persistence（採用 item 整形・promoted 保存）
- STEP-5: destructive handling（振り分け・削除・git 永続化）
- STEP-6: 完了報告

## STEP-3: HITL（ユーザー確認・分類承認）

### Purpose

ユーザー判断が必要な item のみを提示し、明示的な承認を得て分類を確定する（判断の確定）。
自律確定済み item（STEP-1 の自律確定候補判定、STEP-2 の review 経由確定を含む）は確定内容の報告にとどめ、再承認を求めない。

### Input Resolution

- STEP-2 の暫定分類と自律確定候補/ユーザー判断必要の判定（runtime artifact。中断時は inbox 実ファイルから STEP-1 を再構築して導出する）
- ユーザー確認手続き、承認フローは `agentdev-intake-pipeline` の公開操作契約に従う
- 自律確定可否の詳細判定表は横断契約Design（extension 経由で解決）「promote系判断確定とHITL境界」節を正とし、本 reference は重複保持しない

### Preconditions

- 暫定分類と自律確定候補判定が完了していること（STEP-1 完了、STEP-2 skip または反映済み）
- ユーザー判断必要 item が残存すること。全 item が自律確定済みの場合は本 STEP の HITL 提示を省略し、確定内容の報告から STEP-4（採用 item なし時は STEP-5）へ進む

### Procedure

1. 自律確定済み item は確定内容（分類、主要根拠、HITL不要理由）を報告にとどめる
2. ユーザー判断が必要な item のみ分類と理由を提示する（部分自律確定: 未決項目に依存しない item は先行確定済みであり、HITL 待ちにしない）
3. ユーザーの追加コンテキスト、分類の修正指示を受け付ける。自律確定済み item への修正指示があった場合は分類を修正し、以降の当該 item をユーザー判断による確定として扱う
4. ユーザー判断必要 item は、ユーザーの明示的な承認なしに保存、移動へ進まない
5. ユーザー判断必要 item の分類が確定するまで対話を継続する。ユーザーが「確定」を明示的に指示してから次 STEP に進む
6. 破壊的変更（inbox 大量削除、重要 item の誤分類是正等）は本 STEP の分類承認とは別に明示承認を得る。明示承認そのものを安全境界と要求する契約は自律確定によって迂回しない

### Result

- 分類確定（自律確定 item は根拠に基づく確定、ユーザー判断必要 item はユーザー承認済み）。確定後、STEP-4〜STEP-5 は追加確認なしで自動実行する

### Evidence

- 自律確定 item: 分類、主要根拠、HITL不要理由（既存の分類結果、実行報告で記録し、新規永続成果物を必須としない）
- ユーザー判断必要 item: 分類提示とユーザー承認の対話記録（確定した分類結果）

### Completion Verification

- 全 item が自律確定（根拠とHITL不要理由つき）またはユーザー承認済みのいずれかに分類されていること

### Resume-Idempotency

- 確定状態は単独では durable state に記録されない。promoted 実ファイル（STEP-4 の成果物）を承認証跡として扱い、証跡がない場合は未確定と解釈して前 STEP からやり直す。承認前の再実行に副作用はない

## STEP-4: persistence（採用 item 整形・promoted 保存）

### Purpose

採用と判定された item を backlog-review 向けに整形し、`.agentdev/intake/promoted/` に保存する。

### Input Resolution

- STEP-3 で確定した採用 item（durable state は inbox 実ファイル。中断再開時、promoted 実ファイルの存在が承認済み証跡となる）
- 整形、保存の判定基準は `agentdev-intake-pipeline` の公開操作契約に従う

### Preconditions

- 分類確定済み（STEP-3 完了、または STEP-1/STEP-2 での自律確定。全 item 自律確定時は STEP-3 の HITL 提示を省略した報告のみで本 STEP に進む）
- 採用 item が存在する（保留・却下のみ確定時は本 STEP を省略する）

### Procedure

1. 観測内容、影響、課題を整理する
2. backlog-review が分析しやすい形式に構造化する（観測内容、影響、課題、既存要件との関連）
3. 複数 item を束ねる場合は統合内容を整理する
4. `.agentdev/intake/promoted/` が存在しない場合は作成する
5. ファイル名は `YYYY-MM-DD-{topic-slug}.md` とする（元 item 名を維持するか、束ねた内容に応じた名前にする）
6. 成果物を `.agentdev/intake/promoted/` 直下にフラット配置する。frontmatter に route や status を記録しない

### Result

- `.agentdev/intake/promoted/` 配下の採用済み成果物

### Evidence

- 保存済み成果物のファイルパス一覧

### Completion Verification

- 採用 item 全てについて promoted 配下に成果物が存在すること
- 整形結果に frontmatter、重複排除キー、後続成果物参照が含まれていないこと

### Resume-Idempotency

- 保存済みの成果物は再保存しない（ファイル名重複時は連番付与）。promoted 実ファイルの存在から本 STEP 完了を再構成できる

## STEP-5: destructive handling（振り分け・削除・git 永続化）

### Purpose

確定した分類に基づいて item を振り分け、inbox 元ファイルの削除（不可逆処理）と git 永続化を実行する。

### Input Resolution

- STEP-3 で確定した分類、STEP-4 の採用済み成果物（durable state: inbox / promoted 実ファイル）
- 保存と振り分け、Git 永続化の判定基準は `agentdev-intake-pipeline` の公開操作契約に従う
- ドメイン状態永続化プロシージャは `agentdev-git-worktree` に従う

### Preconditions

- 分類確定済み（STEP-3 のユーザー承認、または STEP-1/STEP-2 での自律確定）。採用 item がある場合は採用済み成果物の保存が確認できていること
- 破壊的変更に該当する場合は明示承認済みであること

### Procedure

1. 採用 item の元 inbox item を削除する（`.agentdev/intake/archive/promoted/` への移動は廃止）
2. 保留 item は `.agentdev/intake/inbox/` に残す
3. 却下 item は即時削除する（`.agentdev/intake/archive/rejected/` への移動は廃止）
4. `git pull --ff-only` を実行する。失敗時は構造化エラーメッセージを表示して停止する（自動解消しない）
5. `git diff --name-only` で `.agentdev/intake/` 配下の変更ファイルを確認する。変更なしの場合は commit/push せず完了報告で「変更なし」と報告する
6. `git add` は `.agentdev/intake/` 配下の変更ファイルのみを対象とする（明示パス指定）
7. commit message は `chore(agentdev): review and promote intake items`（Conventional Commits 形式）。reject item を含む場合は当該 item の却下理由を commit message に含める（監査証跡の補強）
8. `git push` を実行する。push 失敗時は構造化エラーメッセージを表示し、完了扱いにしない

### Result

- inbox 振り分け完了（採用削除・保留残置・reject 即時削除）
- commit/push 済み（変更あり時）

### Evidence

- 振り分け結果（削除ファイル、残置ファイルの一覧）
- commit hash、push 成否

### Completion Verification

- 採用 item の inbox 元ファイルが削除済みであること
- 保留 item が inbox に残置されていること
- 却下 item が削除済みで、reject を含む commit message に却下理由が記録されていること

### Resume-Idempotency

- 削除済み item は再削除しない。inbox / promoted 実ファイルの残置・削除状態から未完了の振り分けを特定し、残処理のみ実行する
- commit 未実行の削除がある場合は git 永続化（手順 4〜8）から再開する

## STEP-6: 完了報告

### Purpose

分類結果と git 永続化結果を報告して workflow を終了する。

### Input Resolution

- STEP-3〜STEP-5 の結果（durable state: inbox / promoted 実ファイル、commit hash）

### Preconditions

- 振り分け・永続化が完了していること（または変更なしと確認済みであること）

### Procedure

1. 完了報告 template（`.opencode/commands/agentdev/templates/intake-promote/standard.md`）に従って出力する
2. 分類結果（採用、保留、却下の件数、一覧。自律確定 item は主要根拠とHITL不要理由を含む）と git 永続化結果（変更有無、ファイル一覧、commit hash、push 成否）を含める
3. 次ステップ（`/agentdev/backlog-review`）の提示のみを行い、自動起動しない

### Result

- 完了報告

### Evidence

- 完了報告の出力

### Completion Verification

- 分類結果と git 永続化結果が完了報告に含まれていること
- 自律確定 item の主要根拠とHITL不要理由が報告から確認できること

### Resume-Idempotency

- 報告は出力のみのため再実行に副作用がない
