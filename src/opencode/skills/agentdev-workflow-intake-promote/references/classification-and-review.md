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

## Jev 先行評価の逐次経路（REQ-{NNNN}、DEC-{NNN}）

閉じた意味判断ごとに、次の逐次経路を実行できる。Jev は最終判断者ではなく、後段の LLM 推論への追加情報として扱う（Stage 1: 観測可能化）。

1. **Jev 先行評価**: Custom Tool `agentdev_jev` の `evaluate` に、本 Workflow が構成した閉じた判断入力（state、指示、基準、質問群。日本語。repository 全文を渡さない）を渡す
2. **LLM 推論**: Jev 結果と confidence を情報として含み、従来の判断材料（item 本文、Review 観点、横断契約 Design の判定表、既存要件との関連）も参照して推論する。Jev 結果だけで判断しない
3. **LLM 最終判断**: 従来経路と同一の判断基準で最終判断を確定する。Jev 結果・confidence は最終判断を確定させない
4. **unchanged/corrected 記録**: Jev 結果に対して LLM が判断を変更しなかったか（unchanged）/変更したか（corrected）を観測事実として記録する。評価カテゴリを混入させない

共通契約:

- 利用可否は `AI_GATEWAY_API_KEY` の設定有無で決まる（デフォルト有効、feature flag や opt-in 手続きは不要）。未設定時は呼び出さず `not_configured` を観測に記録し、従来 LLM 経路のみで本 Workflow を完了する
- Jev API 失敗（timeout、429、5xx、network error、response validation error）時は自動 retry せず即座に従来 LLM 経路へ fallback し、失敗分類を観測に記録する。正規状態を破損しない
- 観測は 1 Workflow 実行 = 1 JSON で `.agentdev/jev-observations/` に保存する（`agentdev_jev` の `observation_write`）。判断単位の confidence と llm_treatment は独立した一次観測値とし、閾値依存の分類結果を含めない。観測書込み失敗時は本 Workflow の success を維持し、完了報告に識別可能な warning を明示する。rollback・再実行・擬似再生成を行わない
- 再構成可能な判断入力は判断入力全文を保存せず、評価リクエストの digest と参照で保持する。再構成不能な入力のみ最小 snapshot を渡す
- 操作契約（入力、出力、失敗分類）の正は `docs/designs/responsibilities/custom-tool-contracts.md`「Jev 先行評価」節である

適用位置: STEP-1 の item 評価と暫定分類、STEP-2 の発動条件判定に適用する。

初期割当て（適用対象19件のうち本 Workflow が所有する3件）:

| 判断単位 | 質問形式 |
|---|---|
| item 評価（Review 観点ごとの妥当性・影響・緊急度） | score（観点ごとの水準） |
| 暫定分類（採用/ 保留/ 却下） | choice（採用・保留・却下） |
| adversarial-review 発動条件判定 | boolean（発動/ skip。skip 条件該当の有無） |

choice 形式質問の候補完備性規約（REQ-{NNNN}-{NNN}）:

choice 形式質問を構成する際は、次の規約に従う。

- **正解クラス網羅**: 正解となり得る操作クラス（REQ 操作なし等の非操作正解クラスを含む）を候補集合が網羅するように構成する。正解となり得るクラスを候補に含めないまま質問を確定しない
- **NULL 候補の明示判断**: NULL 候補（該当なし等）を候補集合へ含めるか否かを質問構成時に明示判断する。含めないと判断した場合はその判断を明示して質問を確定する。要否を暗黙に決めない
- **候補欠落由来是正の分類**: 候補集合の欠落に由来する判断是正（最近似候補への高確率張り付きと LLM 是正の組合せ）は質問構成側の欠陥として分類し、判断器精度の劣化要因として集計しない。unchanged/corrected 記録時に候補構造欠落由来と判明した是正は、判断器精度評価の集計から除外する

適用可否を本 Case 内で確定した判断（REQ-{NNNN}-{NNN}）:

- **自律確定候補/ユーザー判断必要の判定（STEP-1 Procedure 4）: Jev を適用しない。**
  理由: 本判断の現行契約は「モデルの自己申告による確信度や固定パーセンテージのみで可否を判定しない」と明示しており、判定基準は横断契約 Design の詳細判定表（自律確定可能要件、HITL移送条件）の適用である。Jev の confidence は確信度情報であり、本判断へ情報として与えることはこの禁じ手と競合し得る。また本判断の結論は HITL 境界（ユーザー判断の要否）の確定へ直接影響するため、Stage 1 の観測のみの段階で確率情報を混入させず、判定表適用による現行経路を維持する。将来の適用は観測結果（Issue B）を踏まえ、confidence を与えない質問形式（判定表要素の boolean/choice 化）でのみ再評価する。

