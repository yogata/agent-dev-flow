# STEP 詳細: 判定確定 / 永続化 / 完了報告（learning-promote）

> 本 reference は `agentdev-workflow-learning-promote` SKILL.md の制御平面（STEP 一覧）STEP-5〜STEP-7 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は各 STEP の実行詳細を提供する。

## 目次

- STEP-5: 判定確定（自律確定・HITL）
- STEP-6: 永続化（成果物生成・deferred 移動・prune・commit/push）
- STEP-7: 完了報告

## STEP-5: 判定確定（自律確定・HITL）

### Purpose

各問題クラスについて自律確定可否を判定し、取得可能な根拠で処置を一意に確定できる項目をユーザー承認なしで確定する。ユーザー判断が必要な項目のみを提示し、確認、修正の機会を経て明示的な承認を得て確定する（判断の確定）。

### Input Resolution

- STEP-2〜STEP-4 の評価・判定結果（中断時は evaluation-report.md と inbox.md 実ファイルから再構築する）
- 自律確定可否の詳細判定表（自律確定可能要件、HITL移送条件、判定と運用の共通規則）は横断契約Design `<workflows/workflow-contracts>`「promote系判断確定とHITL境界」節が集約所有する（extension 経由で解決）。本 reference は判定表を複製しない
- 提示形式、承認フローは `agentdev-learning-pipeline` の公開操作契約に従う

### Preconditions

- STEP-3 完了、STEP-4 skip または反映済みであること
- unresolved な本質的争点またはユーザー判断事項が残っていないこと（残る場合は本 STEP の判定確定へ進まない）

### Procedure

1. **自律確定判定**: 各問題クラスごとに、評価結果（問題クラス分類、8軸評価、廃棄判定、昇華可能性、既存対策照合）から処置を一意に確定できるかを横断契約Design の詳細判定表に従って判定する。モデルの自己申告による確信度や固定パーセンテージのみで可否を判定しない
2. **自律確定の実行**: 一意に確定できる項目はユーザー承認なしで確定する（promote/defer/reject/duplicate）。自律確定はユーザー承認の擬制ではない。deferred・未処理項目を自動削除しない既存の安全境界は自律確定によって迂回しない
3. **部分自律確定**: 自律確定可能項目とユーザー判断必要項目が混在する場合、未決項目に依存しない自律確定可能項目を先行確定する。自律確定可能項目を HITL 待ちにしない
4. **HITL 提示（ユーザー判断必要項目のみ）**: 横断契約Design の HITL移送条件に該当する項目のみを対象に、廃棄判定結果、8軸評価スコアを提示する
5. **ユーザーの確認、修正**: ユーザーによる確認、修正を受け付ける。判定の変更指示があれば廃棄判定、既存対策確認を再実行する
6. **証跡記録**: 自律確定項目の判定結果、主要根拠、HITL 不要と判断した理由を evaluation-report.md に記録する（既存成果物を優先利用し、新規永続成果物を必須としない）
7. **全項目自律確定時**: ユーザー判断必要項目が残らない場合、HITL を発生させず STEP-6 へ進む
8. **破壊的変更の明示承認**: 破壊的変更（inbox.md 全体強制クリア、大量エントリ一括削除等）は本 STEP の確定とは別に明示承認を維持する

### Result

- 判定確定（promote/defer/reject/duplicate）。自律確定分はユーザー承認なし、ユーザー判断必要分はユーザー承認済み。STEP-6 は追加確認なしで自動実行する（prune も判定確定と同時に承認済みとみなす）

### Evidence

- 自律確定項目: evaluation-report.md の自律確定記録（判定結果、主要根拠、HITL 不要理由）
- HITL 対象項目: 判定提示とユーザー承認の対話記録（確定した判定結果）

### Completion Verification

- 全問題クラスの判定が確定済みであること（自律確定またはユーザー承認のいずれか）
- 自律確定分の証跡（判定結果、主要根拠、HITL 不要理由）が evaluation-report.md から確認できること

### Resume-Idempotency

- 承認状態は単独では durable state に記録されない。promoted/ 成果物、inbox.md クリア、deferred.md 追記のいずれかを承認証跡として扱い、証跡がない場合は未承認と解釈して本 STEP をやり直す。自律確定分は evaluation-report.md の自律確定記録と永続化成果物の双方から再構成できる。承認前の再実行に副作用はない

## STEP-6: 永続化（成果物生成・deferred 移動・prune・commit/push）

### Purpose

判定確定に基づいて採用済み成果物を生成し、deferred 移動（原子的操作）、prune、git 永続化を実行する。

### Input Resolution

- STEP-5 で確定した判定（durable state: inbox.md / deferred.md / promoted/ 実ファイル）
- 採用済み成果物スキーマ、deferred 移動の原子的操作契約、prune 方針は `agentdev-learning-pipeline` の公開操作契約に従う
- ドメイン状態永続化プロシージャは `agentdev-git-worktree` に従う

### Preconditions

- 判定確定済み（STEP-5 完了。自律確定またはユーザー承認）
- 破壊的変更に該当する場合は明示承認済みであること

### Procedure

1. `git pull --ff-only` を実行する。失敗時は共通 template（`.opencode/commands/agentdev/templates/common/git-error-messages.md`）の該当形式で表示して停止する（自動解消しない）
2. 採用済み成果物を `.agentdev/learning/promoted/{disposal-category}-{name}.md` に生成する（staging 領域のみ。`.opencode/` 直接書込、`case-run` への直接受け渡し禁止）
3. deferred 移動（原子的操作）を実行する。
`agentdev-learning-pipeline` の deferred 移動操作契約（入力: inbox.md 全エントリと deferred.md、出力: 追記済み deferred.md とクリア済み inbox.md、停止条件: 検証失敗時は inbox.md を変更せずエラー内容を報告）に従い、全エントリの deferred.md 追記、書込検証、inbox.md クリア（ヘッダーのみ）を実行する。
データ喪失防止のため検証失敗時は inbox.md を変更しない
4. prune を実行する。
対象は staged（採用済み成果物生成済み）/ rejected / duplicate のエントリのみ。
deferred / 未処理のエントリは残す。
staged エントリ除去時に採用済み成果物の「元learning item/ 根拠」セクションに証拠を保存する。
追加確認なしで削除する（STEP-5 の判定確定と同時に承認済みとみなす）
5. `git diff --name-only` で `.agentdev/learning/` 配下の変更を確認する。変更なし時は commit/push せず STEP-7 で「変更なし」と報告する
6. 変更あり時、`git add` は `.agentdev/learning/` 配下のみを対象とする（明示パス指定、並列実行安全ステージングプロシージャ準拠）。
`git commit -- <paths>`（--only pathspec 形式）でコミットする。
`.agentdev/` 全体の一括スコープ、スイープ操作（`git add -A`/ `git add .` 等）は禁止
7. commit message は `chore(agentdev): promote learning findings` とする
8. `git push` を実行する。push 失敗時は共通 template の該当形式で表示して停止する（完了扱いにしない）

### Result

- 採用済み成果物（`.agentdev/learning/promoted/`）
- 追記済み deferred.md、prune 適用済み deferred.md、クリア済み inbox.md
- commit/push 済み（変更あり時）

### Evidence

- 生成済み成果物パス一覧、deferred 移動の検証結果、prune 結果、commit hash、push 成否

### Completion Verification

- 採用判定分の成果物が promoted/ に存在すること
- inbox.md がヘッダーのみにクリアされていること
- prune 対象外（deferred / 未処理）のエントリが deferred.md に残存していること

### Resume-Idempotency

- 生成済みの採用済み成果物は再生成しない。promoted/、deferred.md、inbox.md の実ファイル状態から未完了の処理を特定し、残処理のみ実行する
- deferred 移動は原子的操作であり、検証失敗時は inbox.md が変更されていないため再実行可能である
- commit 未実行の変更がある場合は git 永続化（手順 5〜8）から再開する

## STEP-7: 完了報告

### Purpose

8軸評価サマリ、判定結果、後続ルート、git 永続化結果を報告して workflow を終了する。

### Input Resolution

- STEP-5〜STEP-6 の結果（durable state: promoted/、deferred.md、inbox.md、commit hash）

### Preconditions

- 永続化が完了していること（または変更なしと確認済みであること）

### Procedure

1. 完了報告 template（`.opencode/commands/agentdev/templates/learning-promote/standard.md`）に従って出力する
2. 8軸評価サマリ、判定結果（promote/defer/reject/duplicate 件数、自律確定と HITL 確定の内訳）、後続ルート（`/agentdev/backlog-review`）、git 永続化結果（変更有無、ファイル一覧、commit hash、push 成否）を含める

### Result

- 完了報告

### Evidence

- 完了報告の出力

### Completion Verification

- 判定結果と git 永続化結果が完了報告に含まれていること

### Resume-Idempotency

- 報告は出力のみのため再実行に副作用がない
