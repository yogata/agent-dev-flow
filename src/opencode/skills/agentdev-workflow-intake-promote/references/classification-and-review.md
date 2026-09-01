# STEP 詳細: classification / review（intake-promote）

> 本 reference は `agentdev-workflow-intake-promote` SKILL.md の制御平面（STEP 一覧）STEP-1 / STEP-2 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は各 STEP の実行詳細を提供する。

## 目次

- STEP-1: classification（inbox 確認・item 読込・評価・暫定分類提示）
- STEP-2: review（adversarial-review）

## STEP-1: classification（inbox 確認・item 読込・評価・暫定分類提示）

### Purpose

inbox 内の intake item を読み込み、評価し、暫定分類（採用/ 保留/ 却下）を提示する。

### Input Resolution

- `.agentdev/intake/inbox/` 内の intake item ファイル群（durable state 最優先。SSoT 再構成）
- inbox 確認、item 読込、Review 観点、分類提示形式の判定基準は `agentdev-intake-pipeline` の公開操作契約に従う

### Preconditions

- intake-promote command が起動されている
- inbox に item が存在する（空の場合は対象なしとして正常終了する）

### Procedure

1. `.agentdev/intake/inbox/` 内のファイル一覧を取得し、item 数をカウントする。空の場合はその旨を報告して終了する（HITL を発生させない）
2. 各 intake item を読み込み、内容を把握する
3. 各 item を Review 観点（観測内容の妥当性・重要性、影響、緊急度・優先度、既存要件との関連、対応方針、intake と learning の振り分け）で評価する
4. 横断契約Design（extension 経由で解決）「promote系判断確定とHITL境界」節の詳細判定表（自律確定可能要件、HITL移送条件）に照らし、各 item が取得可能な根拠から採用・保留・却下を一意に確定できるか（自律確定候補）、ユーザー判断が必要かを判定する。モデルの自己申告による確信度や固定パーセンテージのみで可否を判定しない
5. 暫定分類を「## Findings / Capture候補」見出しの分類表（番号、タイトル、分類、後続、備考）として提示する。各 item に自律確定候補/ユーザー判断必要の判定を併記する

### Result

- 暫定分類表（各 item の採用/ 保留/ 却下、変更種別、根拠、自律確定候補/ユーザー判断必要の判定）

### Evidence

- inbox 一覧と各 item の読込結果
- 暫定分類表（分類と根拠を含む）
- 各 item の自律確定候補/ユーザー判断必要の判定とその根拠

### Completion Verification

- inbox 内の全 item が暫定分類表に含まれていること
- 各 item に分類と根拠が付与されていること
- 各 item に自律確定候補/ユーザー判断必要の判定が付与されていること

### Resume-Idempotency

- inbox 実ファイルから暫定分類を再構築できる。読み取りのみのため再実行に副作用がない

## STEP-2: review（adversarial-review）

### Purpose

暫定分類の意味的決定を adversarial-review で検証し、accepted finding を暫定分類へ反映する。
発動条件判定と review 呼出を分離して実施する。
自律確定候補のうち対論型レビューが必要な item は、review を経た後に確定する。

### Input Resolution

- STEP-1 の暫定分類表（runtime artifact。中断時は inbox 実ファイルから STEP-1 を再構築して導出する）
- 発動条件判定、候補判断基準、内部手続きは `agentdev-intake-pipeline` の公開操作契約に従う
- 共通 caller integration 契約の正規所有者は adversarial-review Design である

### Preconditions

- STEP-1 で暫定分類表が生成済みであること
- 挿入境界、発動条件、順序の正は intake-promote command Design「adversarial-review 挿入境界（intake-promote）」節である

### Procedure

1. **発動条件判定**: 暫定分類の意味的決定が存在する場合に発動する（default-on）。
skip 条件（inbox 項目が1件のみで暫定分類が自明、または inbox 空）該当時は省略して従来フローを継続する。
skip 判断のためだけの新規 HITL、承認点は追加しない。
ユーザー明示指定時は skip 条件の該当にかかわらず必ず発動する（起動時引数、対話中の指示、extension の rules により表明される）
2. **review 呼出**: 発動と判定された場合のみ `agentdev-adversarial-review` を起動する。
審議対象は暫定分類（各 item の採用/保留/却下、変更種別、根拠）。
呼出タイミングはユーザー提示（STEP-3）開始前
3. **結果反映**: accepted finding を得た場合、呼出元（本 workflow）が暫定分類へ finding を反映し、反映後の分類を STEP-3 へ渡す。adversarial-review 自身は反映を行わない
4. **自律確定候補の確定**: 対論型レビューが必要な自律確定候補は review 完了後に確定する。unresolved な本質的争点が残る item、HITL移送条件に該当する item は自律確定せず、STEP-3 の HITL 対象とする
5. **unresolved 扱**: unresolved な本質的争点が残る場合、既存 HITL（STEP-3）経由で扱い、保存、inbox 削除等の不可逆処理へは進まない
6. **呼出失敗時**: silent skip を禁止し、利用不能を報告した上で従来フローと既存 QG/HITL を維持する

### Result

- review 経由を要する自律確定候補は review 完了後（unresolved 残存時を除く）に確定済み
- review 結果反映済み暫定分類（skip 時、呼出失敗時は STEP-1 の暫定分類をそのまま継承）

### Evidence

- 発動条件判定結果（発動/ skip と根拠）
- review 呼出記録、accepted finding と反映結果（発動時）

### Completion Verification

- 発動条件判定が記録されていること（発動・skip いずれも）
- 発動時は accepted finding の反映結果が暫定分類へ反映済みであること
- review を要する自律確定候補について、確定または HITL 対象への振分けが判定済みであること

### Resume-Idempotency

- review 未実施で中断した場合、STEP-1 から暫定分類を再構築して発動条件判定をやり直す。review 自体は書き込み禁止型（`semantic_review`）のため再呼出に副作用がない
