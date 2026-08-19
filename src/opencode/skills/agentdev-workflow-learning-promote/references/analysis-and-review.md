# STEP 詳細: 入力読込・正規化 / 評価 / 判定 / review（learning-promote）

> 本 reference は `agentdev-workflow-learning-promote` SKILL.md の Control Plane STEP-1〜STEP-4 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は各 STEP の実行詳細を提供する。

## 目次

- STEP-1: 入力読込・正規化
- STEP-2: 評価（分類・8軸・evaluation-report）
- STEP-3: 判定（廃棄判定・既存対策確認）
- STEP-4: review（adversarial-review 経路D）

## STEP-1: 入力読込・正規化

### Purpose

inbox.md の学びエントリと deferred.md を読み込み、旧フォーマットを正規化する。

### Input Resolution

- `.agentdev/learning/inbox.md`（必須。durable state 最優先）
- `.agentdev/learning/deferred.md`（任意。不存在は空として扱う）
- 正規化ルール、entry schema は `agentdev-learning-pipeline` の公開操作契約に従う

### Preconditions

- learning-promote command が起動されている
- inbox.md が存在する（不存在時はエラー終了。「先に `agentdev-learning-capture` skill で学びを追加してください」）

### Procedure

1. inbox.md を読み込む。ファイルなしの場合はエラー終了する
2. `---` 区切りエントリをカウントする。0件の場合は「分析対象の学びがありません」と終了する
3. deferred.md を読み込む（存在すれば。不存在は空として扱う）
4. 全エントリを読み込み、旧フォーマット正規化を行う（解析時のみ。元ファイルは不変）

### Result

- 正規化済みエントリ群、deferred.md の既存エントリ

### Evidence

- inbox.md のエントリ数、正規化の適用結果

### Completion Verification

- 全エントリが読み込まれ、正規化済みであること

### Resume-Idempotency

- inbox.md / deferred.md 実ファイルから読込・正規化を再構築できる。元ファイルを変更しないため再実行に副作用がない

## STEP-2: 評価（分類・8軸・evaluation-report）

### Purpose

正規化済みエントリを問題クラスへ分類し、8軸評価でスコアリングし、evaluation-report.md を生成・更新する。

### Input Resolution

- STEP-1 の正規化済みエントリ群（中断時は inbox.md 実ファイルから STEP-1 を再構築して導出する）
- 問題クラス分類基準、8軸評価ディメンション、evaluation-report schema は `agentdev-learning-pipeline` の公開操作契約に従う

### Preconditions

- STEP-1 完了（正規化済みエントリ確定）

### Procedure

1. 問題クラス分類を行う（根本原因 + 再発条件 + 予防策が同じ単位、最小2エントリ）
2. 8軸評価スコアリングを行う（加重合計 /40）
3. 禁止条件フィルタリングゲートを適用する（ADR 候補除外。`agentdev-decision-guidelines` の除外基準を必須適用）
4. evaluation-report.md を生成・更新する（毎回上書き。履歴蓄積しない）

### Result

- 問題クラス分類、8軸評価スコア、evaluation-report.md

### Evidence

- evaluation-report.md（生成・更新済み）

### Completion Verification

- 全エントリが問題クラスへ分類され、8軸評価が付与されていること
- evaluation-report.md に評価根拠が反映されていること

### Resume-Idempotency

- evaluation-report.md は毎回上書きされるため、再実行は冪等である。 inbox.md 実ファイルから評価を再構築できる

## STEP-3: 判定（廃棄判定・既存対策確認）

### Purpose

各問題クラスの処分区分（11カテゴリ + duplicate）を判定し、既存対策と照合し、昇華可能性を評価する。

### Input Resolution

- STEP-2 の evaluation-report.md（durable state。実ファイルから再取得する）
- 処分区分、反映先マッピング、既存対策照合、prune 方針の判定基準は `agentdev-learning-pipeline` の公開操作契約に従う

### Preconditions

- evaluation-report.md が生成・更新済みであること

### Procedure

1. 廃棄判定（11カテゴリ + duplicate）を行う
2. 昇華可能性評価を行う。
8軸評価スコア、禁止条件フィルタリングゲート、既存対策照合を基に昇華可否を判定する。
無条件の自動REQ化は禁止する
3. 既存対策確認を行う（「新規X化」より「既存Xへ反映」を優先）
4. 昇華不能な知見（deferred 判定、情報が断片的、出現回数が少ない等）は deferred.md の living pool で維持する対象として確定する

### Result

- 処分区分判定結果、既存対策照合結果、昇華可能性評価

### Evidence

- 判定結果（promote/defer/reject/duplicate 候補と根拠）

### Completion Verification

- 全問題クラスに処分区分が付与されていること
- 既存対策との照合結果が記録されていること

### Resume-Idempotency

- 判定は evaluation-report.md と inbox.md 実ファイルから再構築できる。不可逆処理を含まないため再実行に副作用がない

## STEP-4: review（adversarial-review 経路D）

### Purpose

evaluation-report.md を adversarial-review で検証し、accepted finding を判定対象へ反映する。
発動条件判定と review 呼出を分離して実施する。

### Input Resolution

- STEP-2 / STEP-3 の結果が反映された evaluation-report.md（durable state）
- 経路D の候補判断、呼出タイミング、evaluation-report 戻しループの実行詳細は `agentdev-learning-pipeline` の公開操作契約に従う
- 共通 caller integration 契約の正規所有者は adversarial-review SPEC である

### Preconditions

- evaluation-report.md が STEP-2 で生成・更新済みであり、STEP-3（廃棄判定）と既存対策確認の結果が反映されていること
- 挿入境界、発動条件の正は learning-promote command SPEC の経路D 節である

### Procedure

1. **発動条件判定**: 次のいずれも満たす場合に発動する（default-on）。
evaluation-report.md 反映済み、skip 条件非該当。
skip 条件は inbox.md エントリが1件のみで既存対策との重複が確実（新規性なし、廃棄判定確定）、または inbox.md 空。
skip 判断のためだけの新規 HITL、承認点は追加しない
2. **ユーザー明示指定時**: skip 条件の該当にかかわらず必ず発動する。ただし evaluation-report.md 反映済みは引き続き必須とする
3. **review 呼出**: 発動と判定された場合のみ `agentdev-adversarial-review` を起動する。
review 対象は evaluation-report.md のみとする（正規化結果、問題クラス分類、8軸評価スコア、廃棄判定、既存対策照合結果）。
inbox → deferred 移動、prune、commit/push 等の不可逆処理は未実行であることを確認する
4. **accepted finding 反映**: 本 workflow が責任を持って判定対象へ反映する。adversarial-review 自身は反映を行わない
5. **evaluation-report 戻しループ**: review 反映時（review 対象の意味内容が変更された場合）は STEP-2 へ戻り、STEP-2（evaluation-report 生成・更新）→ STEP-3（廃棄判定）→ STEP-4 発動条件判定 → 再 review 発動条件（新たな本質的争点が生じ得る場合）を満たす場合のみ再 review、の順で再実行する。
停止条件（4点）を満たした時点でループを離脱し STEP-5 へ進む。
新証拠、新前提、異なる failure condition、未評価範囲のいずれも伴わない同一 finding の再起票を禁止する
6. **unresolved 扱い**: unresolved な本質的争点またはユーザー判断事項が残る場合、STEP-5（判定結果提示）、STEP-6（deferred 移動、prune、commit/push）等の不可逆処理へ進まない。unresolved は既存の HITL（STEP-5 ユーザー承認）または blocker 扱いへ振り向ける
7. **呼出失敗時**: silent skip を禁止し、利用不能を報告した上で従来フロー（STEP-5 以降）と既存 HITL を維持する

### Result

- review 結果反映済み evaluation-report.md（skip 時、呼出失敗時は従来フローを継承）

### Evidence

- 発動条件判定結果（発動/ skip と根拠）、review 呼出記録、accepted finding と反映結果（発動時）

### Completion Verification

- 発動条件判定が記録されていること（発動・skip いずれも）
- 発動時は accepted finding の反映結果が evaluation-report.md へ反映済みであること
- ループ離脱時に unresolved が残っていないこと（残る場合は不可逆処理へ進んでいないこと）

### Resume-Idempotency

- review は書き込み禁止型（`semantic_review`）のため再呼出に副作用がない。evaluation-report.md 実ファイルから反映状態を再構築できる
