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
4. **deferred エントリの反映先実在性確認**: deferred 候補エントリの `想定反映先`（skill 名、docs パス等の反映先候補）について、実在性を実測（grep・ファイル存在確認等）で確認する。実測コマンドと結果を判定根拠として記録し、推定で消滅と判定しない。反映先が消滅している場合は、現行の恒久所有先・現行配布物への現行化、または廃棄判定（prune）のいずれかへ処理する
5. 昇華不能な知見（deferred 判定、情報が断片的、出現回数が少ない等）は deferred.md の living pool で維持する対象として確定する

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
2. **ユーザー明示指示時**: ユーザーが review の実施を明示的に指示した場合は通常のユーザー指示としてその場で実行する（専用の検出・フラグ・保存・伝播・skip 条件の専用上書き処理を持たない）。ただし evaluation-report.md 反映済みは引き続き必須とする
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

- 利用可否は `CLOUDFLARE_ACCOUNT_ID` と `CLOUDFLARE_API_TOKEN` の設定有無で決まる（デフォルト有効、feature flag や opt-in 手続きは不要）。未設定時は API を呼び出さず構造化失敗（not_configured）を返し、観測を生成しない
- 評価器障害（not_configured、timeout、429、5xx、network error、response validation error 等）で評価が成立しない場合、LLM 推論へ fallback して判定を継続せず、当該判定を未確定として扱い、当該判定に依存する後続の副作用および状態遷移を開始しない。判定未確定を不合格または非該当へ変換せず、依存しない独立処理を一律に停止せず、評価器障害だけを理由に人間判断へ移行しない。判定未確定の停止（停止条件と再開条件を含む）を報告し、状態記録は証跡として残す。契約の正は v4-responsibility-boundaries Design「閉じた意味評価の障害時契約」節（runtime 面の適用は v4-runtime-execution-model Design「判定未確定時の依存後続抑止」節）
- Jev API 失敗時は自動再試行せず、失敗観測に失敗分類と最小 diagnostic が記録される。正規状態を破損しない
- 評価器復旧後は、正規の再実行・再開経路で評価を再実行する。再開前に入力・規則・成果物・証拠への変更影響を確認し、影響する古い判定を再利用せず、成功済み副作用を重複実行せず、影響しない証拠は再利用する。修復・再試行・設定等の運用介入を判定方式の代替または新規規範の確定と混同しない。再開契約の正は v4-durable-state-and-recovery Design「評価器復旧後の評価再開契約」節
- 観測は 1 semantic evaluation = 1 observation（1 JSON）で `.agentdev/jev-observations/` に保存する。confidence は evaluation 単位の一次事実であり、provider が返した場合のみ保存する。質問単位への複製・確率分布からの代替生成を行わない。観測書込み失敗時は本 Workflow の success を維持し、完了報告に識別可能な warning を明示する。rollback・再実行・擬似再生成を行わない
- 再構成可能な判断入力は判断入力全文を保存せず、評価リクエストの digest と参照で保持する。再構成不能な入力のみ最小 snapshot を渡す
- 条件付き評価の発動制御（REQ-{NNNN}-{NNN}）: 親となる判断の結果によって後続判断の必要性が決まる場合、親判断の最終確定結果が発動条件を満たした場合だけ後続の意味評価を生成する。Jev による親判断の先行評価結果のみをもって後続評価を発動しない。発動条件が成立しない場合は後続質問自体を生成せず、後続の意味評価に対応する観測記録（非該当等を表すためだけのものを含む）も生成しない
- 観測識別子の安定性（REQ-{NNNN}-{NNN}）: 同じ意味判断を継続する場合は観測識別子（workflow、evaluationKind、questionId）を維持する。判断対象、結果範囲または判断基準の意味が変わり変更前後を同一の意味判断として比較できなくなる場合、および複数の判断を統合した場合は新しい questionId を使用する。入力および契約の版の違いは sourceRevision、requestDigest 等の既存の観測項目で区別する。既存の観測記録に対して移行、書換え、識別子の付替えを行わない
- 操作契約（入力、出力、失敗分類）の正は `docs/designs/responsibilities/custom-tool-contracts.md`「Jev 先行評価」節である

適用位置: STEP-2 の問題クラス分類と 8軸評価、STEP-3 の廃棄判定と昇華可能性評価、STEP-4 の発動条件判定に適用する。

初期割当て（適用対象19件のうち本 Workflow が所有する5件）:

| 判断単位 | 質問形式 |
|---|---|
| 問題クラス分類（根本原因 + 再発条件 + 予防策が同じ単位への帰属） | choice（既存問題クラス候補 + 新規クラス） |
| 8軸評価スコアリング（軸ごとの水準） | score ×7（発生件数軸を除く各軸の水準。発生件数軸は deterministic 境界により機械導出し評価対象外） |
| 廃棄判定（7カテゴリ + duplicate の処分区分） | choice（7カテゴリ + duplicate） |
| 昇華可能性評価 | boolean（昇華可能/不能。禁止条件・既存対策照合を基準に含む） |
| adversarial-review 発動条件判定 | boolean（発動/ skip。skip 条件該当の有無） |

choice 形式質問の候補完備性規約（REQ-{NNNN}-{NNN}）:

choice 形式質問を構成する際は、次の規約に従う。

- **正解クラス網羅**: 正解となり得る操作クラス（REQ 操作なし等の非操作正解クラスを含む）を候補集合が網羅するように構成する。正解となり得るクラスを候補に含めないまま質問を確定しない
- **NULL 候補の明示判断**: NULL 候補（該当なし等）を候補集合へ含めるか否かを質問構成時に明示判断する。含めないと判断した場合はその判断を明示して質問を確定する。要否を暗黙に決めない
- **候補欠落由来是正の分類**: 候補集合の欠落に由来する判断是正（最近似候補への高確率張り付きと LLM 是正の組合せ）は質問構成側の欠陥として分類し、判断器精度の劣化要因として集計しない。最終判断の観測反映時に差異理由（evaluation_input_defect）として記録された是正のうち候補構造欠落由来と判明したものは、判断器精度評価の集計から除外する

判断単位ごとの閉じた判断入力構成（REQ-{NNNN}-{NNN}）:

各判断単位の評価入力は、当該評価入力だけで判断可能な形に閉じて構成する。score 形式は重複のない離散 scale と各 level の意味境界を評価入力に明示し、boolean 形式は true / false の判断条件を評価入力のみから解釈可能に記録する。choice 形式の NULL 候補含否は前節の規約に従い、判断単位ごとに次の明示判断を記録する。表中の「─」は当該質問形式を使用しない単位であることを示す。

| 判断単位 | score scale（重複のない離散水準と各 level の意味境界） | boolean の true / false 条件 | choice の NULL 候補含否の明示判断 |
|---|---|---|---|
| 問題クラス分類 | ─ | ─ | 含めない。新規クラス候補が「既存問題クラスのいずれにも該当しない」場合の帰属先を網羅するため、NULL 候補を加えると意味が重複する。構成時に含めないと判断して確定する |
| 8軸評価スコアリング（発生件数軸を除く7軸） | 軸ごとに 1〜5 の5水準（重複なし、1 が最低水準）。各 level の意味境界は「8軸評価ディメンション」の軸別スコア基準（1〜5 の対応づけ済み判定基準）を評価入力へそのまま転記する | ─ | ─ |
| 廃棄判定 | ─ | ─ | 含めない。7カテゴリ + duplicate が処分区分の閉集合を網羅し、いずれにも帰属しない入力は存在しないと構成時に判断する |
| 昇華可能性評価 | ─ | true = 昇華可能（禁止条件に非該当、かつ既存対策との重複がない）。false = 昇華不能（禁止条件に該当、または既存対策との重複がある） | ─ |
| adversarial-review 発動条件判定 | ─ | true = 発動（evaluation-report.md 反映済み、かつ skip 条件〔inbox 空、または inbox 1件のみで既存対策との重複が確実〕に非該当）。false = skip（skip 条件に該当） | ─ |

deterministic 境界の適用判定（REQ-{NNNN}-{NNN}）:

境界判定基準「モデル推論なしで一意に導出できること」を各判断単位に適用した結果を次に記録する。対象外とした部分の導出結果は後続の semantic evaluation の state として利用し、deterministic に確定した結果を Jev で再判定させない。評価後に判明した deterministic な確定は差異理由 deterministic_override として処理する。境界判定が確定できない部分は、閉じた意味評価の閉包条件（REQ-{NNNN}。判別基準の正典は `<foundations/v4-responsibility-boundaries>` Design「閉じた意味評価の閉包条件」節が集約所有する）によって判定し、「決定的処理として確定できない」という理由のみで評価対象に分類しない。

| 判断単位 | 対象外とした部分 | 根拠 |
|---|---|---|
| 問題クラス分類 | なし | 正規化済みエントリの文脈解釈を要する意味判断であり、モデル推論なしで一意に導出できる部分を含まない |
| 8軸評価スコアリング | 発生件数軸の水準判定 | 同一問題クラス内のエントリ数の計数と区間対応（1件=1, 2件=2, 3〜4件=3, 5〜7件=4, 8件以上=5）で一意に導出できる。機械導出値を残り7軸の評価入力 state として渡し、Jev に再判定させない |
| 廃棄判定 | 既存対策との重複照合の実施 | 照合は検索による事実確認であり、照合結果（一致の有無と該当対策の特定）は一意に導出できる。照合結果を state として渡し、処分区分の帰属判断のみを質問する |
| 昇華可能性評価 | 禁止条件フィルタリングゲートの適合確認 | ゲート適合は除外基準の判定表適用であり一意に判定できる。判定結果を state として渡し、昇華可否の意味判断のみを質問する |
| adversarial-review 発動条件判定 | skip 条件の件数計数（inbox 空・1件のみの確認） | 件数計数はモデル推論なしで一意に導出できる。計数結果を state として渡す。既存対策との重複が「確実」かの判定は文脈解釈を要するため semantic evaluation の対象として残す |

## 閉じた意味評価の全件監査結果（REQ-{NNNN}）

導入時に割当てられた本 Workflow の判断単位（5件）を存続を前提とせず全件監査し、各判断に「維持」「決定的処理への移行」「条件付き化」「統合」「削除」「T1（正規判断主体の再設計）への持ち越し」のいずれかの処置を確定した。閉じた意味評価の閉包条件（REQ-{NNNN}。判別基準の正典は `<foundations/v4-responsibility-boundaries>` Design「閉じた意味評価の閉包条件」節）の6条件を各判断単位に適用した。現行の質問数・質問構造の維持を監査の制約としない。

| 判断単位 | 閉包条件適用結果 | 処置 | 根拠 |
|---|---|---|---|
| 問題クラス分類 | 適格（6条件すべて充足） | 維持 | 正規化済みエントリの文脈解釈を要する意味判断であり、判断基準・結果空間（既存問題クラス候補 + 新規クラス）・入力閉包が確定している |
| 8軸評価スコアリング（発生件数軸を除く7軸） | 適格（6条件すべて充足） | 維持 | 判定基準（軸別スコア基準）を評価入力へ転記済みであり、scale は重複のない離散5水準。意味解釈を要する水準判定として適格 |
| 廃棄判定（7カテゴリ + duplicate の処分区分） | 適格（6条件すべて充足） | 維持 | 7カテゴリ + duplicate が結果空間の閉集合。既存対策照合結果を state として渡す入力閉包が確定している |
| 昇華可能性評価 | 適格（6条件すべて充足） | 維持 | boolean の true / false 条件が評価入力のみから解釈可能。禁止条件・既存対策照合を基準に含む |
| adversarial-review 発動条件判定 | 適格（6条件すべて充足） | 条件付き化 | 暫定分類・evaluation-report 反映完了を親判断とする後続評価である。親判断の最終確定結果が発動条件（反映済みかつ skip 条件非該当）を満たした場合だけ評価を生成し、skip 条件該当時は後続質問・観測記録を生成しない。判断対象・質問形式・判断基準の意味は変更しないため観測識別子（workflow、evaluationKind、questionId）は維持する |

既知問題5構造（正解となり得る選択肢の欠落、機械的に確定できる事実・判定の Jev への混入、親条件不成立時の後続質問生成、評価尺度の水準間での意味境界の重複、実際の評価対象と固定された適用一覧の不一致）の横断点検を実施した。候補完備性規約と NULL 候補明示判断により正解クラス網羅を確認済み、deterministic 境界判定により機械的確定の混入なし、本節の条件付き化により親条件不成立時の後続質問生成なし、score scale は重複のない離散水準、本節により適用一覧を実態と一致させて更新済みであり、本 Workflow の判断単位に同構造の残存はない。T1（正規判断主体の再設計）への引継ぎ事項は発生しなかった。

### 判断単位別の機械化不採用と評価器適格性根拠（監査追記）

正規モデル全面収束要件の Wave-3 完了訂正において、決定的処理不採用理由の具体と評価器適格性根拠の記録水準に対応して、本 Workflow の判断単位ごとの代表例・反例・判定不能例と機械化不採用案を追記する。引用する観測 ID は .agentdev/jev-observations/ 配下の永続観測であり、失敗観測は failure.kind 付きの構造化保存として記録され、評価不能の合格化・非該当化は発生していない。

| 判断単位 | 代表例（成功観測・実値） | 反例（機械化すると誤判定になる実例） | 判定不能例（評価不能の実測） | 機械化不採用案（候補・負担・崩れ方） |
|---|---|---|---|---|
| 問題クラス分類 | 20261002T155352Z-9da3（「単独（いずれのクラスとも根本原因を共有しない）」=NULL 相当の実測）・20260929T171404Z-208e | 根本原因の語面照合規則は、表層に共通語を含んでも根因が異なるエントリ（インフラ系 timeout と test 前提欠落の timeout 等）を誤統合する | 本レーンの失敗観測 0 件（失敗観測 9 件は 2026-09-27 期に req-define 4・case-ready 3・backlog-review 1・case-close 1 に集中。障害時契約は workflow 共通契約であり恒常 test で担保） | キーワード/正規表現マッチによる根因グルーピング（実装低・根本原因の言い回し多様性への追随負担。表層共通語で誤統合する） |
| 8軸評価スコアリング（発生件数軸を除く7軸） | 20261006T152331Z-8603（c1-影響度=2・c3-影響度=1 の同軸異水準を実測） | 20261006T152331Z-8603 の水準差は影響範囲の文脈的重み付けでありエントリ長・語数とは非相関。計数規則は同文長ペアで水準を逆転させる。発生件数軸は本節の deterministic 対象外化済み | 本レーンの失敗観測 0 件（前項に同じ） | 語数/文字数計数の区間対応（実装低・軸基準が自然言語のため計数式の再設計が発生）。基準例との埋め込み距離→水準写像（実装中・7軸×5水準の基準例整備と境界再調整が恒常化） |
| 廃棄判定（7カテゴリ + duplicate の処分区分） | 20261006T152753Z-4d26（A=promote）・20260929T171526Z-fe70（「5 既存対策の更新」を含む） | 既存対策照合は本節の deterministic 対象外化済み。残る処分判断を照合一致数へ機械写像すると「一致ありでも内容が廃止済み対策」の候補を誤る | 本レーンの失敗観測 0 件（前項に同じ） | 照合一致数による機械導出（実装低・対策の現行有効性という意味判定が残り崩れる） |
| 昇華可能性評価 | 20260929T173230Z-27bc（u1〜u4=false）と 20261006T152829Z-c203（11 単位=true）の両値を実測 | 20260929T173230Z-27bc は同一 promote 候補群内で u1〜u4=false・u5/u7/u8=true が混在し、候補種別からの機械導出（promote 候補=true 等）は種別では保存しない。禁止条件フィルタは本節の deterministic 対象外化済み | 本レーンの失敗観測 0 件（前項に同じ） | 候補種別からの機械導出（実装低・恒久契約への適合性という文脈判断が残り崩れる） |
| adversarial-review 発動条件判定 | 20261006T153052Z-88b8（q1-review-trigger=true）・20260929T141655Z-6dc6 | 件数計数による機械 skip は本節の deterministic 対象外化（inbox 空・1件のみ）を超える部分で正解と衝突する。反映済みかつ本質的争点存否は文脈解釈 | 本レーンの失敗観測 0 件（前項に同じ） | 件数計数による機械 skip（実装低・本質的争点存否の文脈解釈が残る） |
