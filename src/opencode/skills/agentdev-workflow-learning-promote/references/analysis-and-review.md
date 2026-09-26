# STEP 詳細: 入力読込・正規化 / 評価 / 判定 / review（learning-promote）

> 本 reference は `agentdev-workflow-learning-promote` SKILL.md の制御平面（STEP 一覧）STEP-1〜STEP-4 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は各 STEP の実行詳細を提供する。

## 目次

- STEP-1: 入力読込・正規化
- STEP-2: 評価（分類・8軸・evaluation-report）
- STEP-3: 判定（廃棄判定・既存対策確認）
- STEP-4: review（adversarial-review）

## STEP-1: 入力読込・正規化

### Purpose

inbox.md の学びエントリを読み込み、旧フォーマットを正規化する。
deferred.md はインデックススキャン → 候補エントリ本文読込の2フェーズで読み込む。

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
3. deferred.md をインデックススキャンする（存在すれば。不存在は空として扱う）。
grep により `^## ` 見出し行とタグ行を抽出し、{見出し, タグ, 位置} の候補一覧を構成する。
分離インデックスファイルは作らず、毎回現ファイルから計算する（grep on read）
4. 各 inbox エントリについて候補一覧から候補を選択し、候補エントリ本文を読み込む。
候補選択は過剰包含（recall 向上フィルタ）とし、次のいずれかで候補に加える: a) タグ1つでも一致、b) 見出しトークンが問題事象の固有名詞と一致、c) 常に直近20エントリ。
候補選択は duplicate 判定そのものを行わず、判定は候補エントリ本文読込後の突合で行う。
全面読みは既定経路から除外し、次の3類型の inbox エントリは deferred.md 全面読みへフォールバックする: 候補0件の inbox エントリ、タグ・見出しトークンのいずれでもマッチせず候補に上がらない inbox エントリ、候補本文読込後も判定が曖昧な inbox エントリ。
旧フォーマット正規化の対象区分は inbox.md が全面読込・正規化、deferred.md が候補本文のみ解析対象である（解析時のみ。元ファイルは不変）

### Result

- 正規化済みエントリ群、deferred.md の候補一覧と候補エントリ本文

### Evidence

- inbox.md のエントリ数、インデックススキャンによる候補数と候補本文読込分量、正規化の適用結果

### Completion Verification

- inbox.md の全エントリが読み込まれ、正規化済みであること
- deferred.md は候補選択と候補エントリ本文読込が完了していること（3類型フォールバック対象を除く）

### Resume-Idempotency

- inbox.md / deferred.md 実ファイルからインデックススキャン・候補選択・読込・正規化を再構築できる。元ファイルを変更しないため再実行に副作用がない

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
3. 禁止条件フィルタリングゲートを適用する（Decision 候補除外。`agentdev-decision-guidelines` の除外基準を必須適用）
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

各問題クラスの処分区分（7カテゴリ + duplicate）を判定し、既存対策と照合し、昇華可能性を評価する。

### Input Resolution

- STEP-2 の evaluation-report.md（durable state。実ファイルから再取得する）
- STEP-1 で構成した deferred.md の候補一覧と候補エントリ本文（中断時は deferred.md 実ファイルから STEP-1 を再構築して導出する）
- 処分区分、既存対策照合、prune 方針の判定基準は `agentdev-learning-pipeline` の公開操作契約に従う

### Preconditions

- evaluation-report.md が生成・更新済みであること

### Procedure

1. 廃棄判定（7カテゴリ + duplicate）を行う。
deferred.md 既存エントリとの突合は、STEP-1 で選択した候補エントリ本文に対して行う。
全面読みは既定経路から除外されており、STEP-1 の3類型フォールバック（候補0件・候補に上がらないエントリ・判定曖昧）の inbox エントリのみ deferred.md 全面読みの対象となる
2. 昇華可能性評価を行う。
8軸評価スコア、禁止条件フィルタリングゲート、既存対策照合を基に昇華可否を判定する。
無条件の自動REQ化は禁止する。
既存対策照合は、STEP-1 と同じ deferred.md 候補集合（候補エントリ本文）に対して行う
3. 既存対策確認を行い、既存事実の整備状況を確定する（実現先の選択は行わない）
4. 昇華不能な知見（deferred 判定、情報が断片的、出現回数が少ない等）は deferred.md の living pool で維持する対象として確定する

### Result

- 処分区分判定結果、既存対策照合結果、昇華可能性評価

### Evidence

- 判定結果（promote/defer/reject/duplicate 候補と根拠）

### Completion Verification

- 全問題クラスに処分区分が付与されていること
- 既存対策との照合結果が記録されていること

### Resume-Idempotency

- 判定は evaluation-report.md と inbox.md / deferred.md 実ファイルから再構築できる。不可逆処理を含まないため再実行に副作用がない

## STEP-4: review（adversarial-review）

### Purpose

evaluation-report.md を adversarial-review で検証し、accepted finding を判定対象へ反映する。
発動条件判定と review 呼出を分離して実施する。

### Input Resolution

- STEP-2 / STEP-3 の結果が反映された evaluation-report.md（durable state）
- learning-promote の候補判断、呼出タイミング、evaluation-report 戻しループの実行詳細は `agentdev-learning-pipeline` の公開操作契約に従う
- 共通 caller integration 契約の正規所有者は adversarial-review Design である

### Preconditions

- evaluation-report.md が STEP-2 で生成・更新済みであり、STEP-3（廃棄判定）と既存対策確認の結果が反映されていること
- 挿入境界、発動条件の正は learning-promote command Design の adversarial-review 挿入境界節である

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
6. **unresolved 扱い**: unresolved な本質的争点またはユーザー判断事項が残る場合、STEP-5（判定確定）、STEP-6（deferred 移動、prune、commit/push）等の不可逆処理へ進まない。unresolved は既存の HITL（STEP-5 のユーザー承認）または blocker 扱いへ振り向ける
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

## Jev 先行評価の逐次経路（REQ-{NNNN}、DEC-{NNN}）

閉じた意味判断ごとに、次の基本判断経路（逐次経路）を実行できる。Jev は最終判断者ではなく、後段の LLM 推論への追加情報として扱う（Stage 1: 観測可能化）。

1. **Jev 先行評価**: Custom Tool `agentdev_jev` の `evaluate` に、本 Workflow が構成した閉じた判断入力（state、指示、基準、質問群。日本語。repository 全文を渡さない）を渡す。evaluator 成功後・LLM 推論へ進む前に、当該評価の観測（1 semantic evaluation = 1 observation）が `.agentdev/jev-observations/` へ永続化される
2. **LLM 推論**: Jev 結果・候補別確率分布・取得できた confidence を情報として含み、従来の判断材料（inbox / deferred 実ファイル、問題クラス分類基準、8軸評価ディメンション、処分区分基準、既存対策照合結果）も参照して推論する。Jev 結果だけで判断しない
3. **LLM 最終判断**: 従来経路と同一の判断基準で最終判断を確定する。Jev 結果・confidence は最終判断を確定させない
4. **最終判断の観測反映**: Custom Tool `agentdev_jev` の `observation_write` で、evaluator 成功観測へ最終判断結果（final result）を追記する。evaluator 返却結果と最終判断が異なる場合のみ、差異理由の分類（evaluation_input_defect / semantic_disagreement / deterministic_override / unknown）を記録する

共通契約:

- 利用可否は `AI_GATEWAY_API_KEY` の設定有無で決まる（デフォルト有効、feature flag や opt-in 手続きは不要）。未設定時は API を呼び出さず構造化失敗（not_configured）を返し、観測を生成せず従来 LLM 経路のみで本 Workflow を完了する
- Jev API 失敗（timeout、429、5xx、network error、response validation error）時は自動 retry せず即座に従来 LLM 経路へ fallback し、失敗観測に失敗分類と最小 diagnostic が記録される。正規状態を破損しない
- 観測は 1 semantic evaluation = 1 observation（1 JSON）で `.agentdev/jev-observations/` に保存する。confidence は evaluation 単位の一次事実であり、provider が返した場合のみ保存する。質問単位への複製・確率分布からの代替生成を行わない。観測書込み失敗時は本 Workflow の success を維持し、完了報告に識別可能な warning を明示する。rollback・再実行・擬似再生成を行わない
- 再構成可能な判断入力は判断入力全文を保存せず、評価リクエストの digest と参照で保持する。再構成不能な入力のみ最小 snapshot を渡す
- 操作契約（入力、出力、失敗分類）の正は `docs/designs/responsibilities/custom-tool-contracts.md`「Jev 先行評価」節である

適用位置: STEP-2 の問題クラス分類と 8軸評価、STEP-3 の廃棄判定と昇華可能性評価、STEP-4 の発動条件判定に適用する。

初期割当て（適用対象19件のうち本 Workflow が所有する5件）:

| 判断単位 | 質問形式 |
|---|---|
| 問題クラス分類（根本原因 + 再発条件 + 予防策が同じ単位への帰属） | choice（既存問題クラス候補 + 新規クラス） |
| 8軸評価スコアリング（軸ごとの水準） | score ×8（各軸の水準） |
| 廃棄判定（7カテゴリ + duplicate の処分区分） | choice（7カテゴリ + duplicate） |
| 昇華可能性評価 | boolean（昇華可能/不能。禁止条件・既存対策照合を基準に含む） |
| adversarial-review 発動条件判定 | boolean（発動/ skip。skip 条件該当の有無） |

choice 形式質問の候補完備性規約（REQ-{NNNN}-{NNN}）:

choice 形式質問を構成する際は、次の規約に従う。

- **正解クラス網羅**: 正解となり得る操作クラス（REQ 操作なし等の非操作正解クラスを含む）を候補集合が網羅するように構成する。正解となり得るクラスを候補に含めないまま質問を確定しない
- **NULL 候補の明示判断**: NULL 候補（該当なし等）を候補集合へ含めるか否かを質問構成時に明示判断する。含めないと判断した場合はその判断を明示して質問を確定する。要否を暗黙に決めない
- **候補欠落由来是正の分類**: 候補集合の欠落に由来する判断是正（最近似候補への高確率張り付きと LLM 是正の組合せ）は質問構成側の欠陥として分類し、判断器精度の劣化要因として集計しない。最終判断の観測反映時に差異理由（evaluation_input_defect）として記録された是正のうち候補構造欠落由来と判明したものは、判断器精度評価の集計から除外する
