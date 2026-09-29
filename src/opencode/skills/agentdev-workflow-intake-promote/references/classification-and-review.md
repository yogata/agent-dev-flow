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

閉じた意味判断ごとに、次の基本判断経路（逐次経路）を実行できる。Jev は最終判断者ではなく、後段の LLM 推論への追加情報として扱う（Stage 1: 観測可能化）。

1. **Jev 先行評価**: Custom Tool `agentdev_jev` の `evaluate` に、本 Workflow が構成した閉じた判断入力（state、指示、基準、質問群。日本語。repository 全文を渡さない）を渡す。evaluator 成功後・LLM 推論へ進む前に、当該評価の観測（1 semantic evaluation = 1 observation）が `.agentdev/jev-observations/` へ永続化される
2. **LLM 推論**: Jev 結果・候補別確率分布・取得できた confidence を情報として含み、従来の判断材料（item 本文、Review 観点、横断契約 Design の判定表、既存要件との関連）も参照して推論する。Jev 結果だけで判断しない
3. **LLM 最終判断**: 従来経路と同一の判断基準で最終判断を確定する。Jev 結果・confidence は最終判断を確定させない
4. **最終判断の観測反映**: Custom Tool `agentdev_jev` の `observation_write` で、evaluator 成功観測へ最終判断結果（final result）を追記する。evaluator 返却結果と最終判断が異なる場合のみ、差異理由の分類（evaluation_input_defect / semantic_disagreement / deterministic_override / unknown）を記録する

共通契約:

- 利用可否は `CLOUDFLARE_ACCOUNT_ID` と `CLOUDFLARE_API_TOKEN` の設定有無で決まる（デフォルト有効、feature flag や opt-in 手続きは不要）。未設定時は API を呼び出さず構造化失敗（not_configured）を返し、観測を生成せず従来 LLM 経路のみで本 Workflow を完了する
- Jev API 失敗（timeout、429、5xx、network error、response validation error）時は自動再試行せず即座に従来 LLM 経路へ fallback し、失敗観測に失敗分類と最小 diagnostic が記録される。正規状態を破損しない
- 観測は 1 semantic evaluation = 1 observation（1 JSON）で `.agentdev/jev-observations/` に保存する。confidence は evaluation 単位の一次事実であり、provider が返した場合のみ保存する。質問単位への複製・確率分布からの代替生成を行わない。観測書込み失敗時は本 Workflow の success を維持し、完了報告に識別可能な warning を明示する。rollback・再実行・擬似再生成を行わない
- 再構成可能な判断入力は判断入力全文を保存せず、評価リクエストの digest と参照で保持する。再構成不能な入力のみ最小 snapshot を渡す
- 条件付き評価の発動制御（REQ-{NNNN}-{NNN}）: 親となる判断の結果によって後続判断の必要性が決まる場合、親判断の最終確定結果が発動条件を満たした場合だけ後続の意味評価を生成する。Jev による親判断の先行評価結果のみをもって後続評価を発動しない。発動条件が成立しない場合は後続質問自体を生成せず、後続の意味評価に対応する観測記録（非該当等を表すためだけのものを含む）も生成しない
- 観測識別子の安定性（REQ-{NNNN}-{NNN}）: 同じ意味判断を継続する場合は観測識別子（workflow、evaluationKind、questionId）を維持する。判断対象、結果範囲または判断基準の意味が変わり変更前後を同一の意味判断として比較できなくなる場合、および複数の判断を統合した場合は新しい questionId を使用する。入力および契約の版の違いは sourceRevision、requestDigest 等の既存の観測項目で区別する。既存の観測記録に対して移行、書換え、識別子の付替えを行わない
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
- **候補欠落由来是正の分類**: 候補集合の欠落に由来する判断是正（最近似候補への高確率張り付きと LLM 是正の組合せ）は質問構成側の欠陥として分類し、判断器精度の劣化要因として集計しない。最終判断の観測反映時に差異理由（evaluation_input_defect）として記録された是正のうち候補構造欠落由来と判明したものは、判断器精度評価の集計から除外する

判断単位ごとの閉じた判断入力構成（REQ-{NNNN}-{NNN}）:

各判断単位の評価入力は、当該評価入力だけで判断可能な形に閉じて構成する。score 形式は重複のない離散 scale と各 level の意味境界を評価入力に明示し、boolean 形式は true / false の判断条件を評価入力のみから解釈可能に記録する。choice 形式の NULL 候補含否は前節の規約に従い、判断単位ごとに明示判断を記録する。表中の「─」は当該質問形式を使用しない単位であることを示す。

| 判断単位 | score scale（重複のない離散水準と各 level の意味境界） | boolean の true / false 条件 | choice の NULL 候補含否の明示判断 |
|---|---|---|---|
| item 評価（Review 観点ごとの妥当性・影響・緊急度） | 観点ごとに 3水準（低/ 中/ 高。重複なし）。低 = 対応判断に影響しない軽微な観測、中 = 判断材料として有用だが対応の優先度を上げない、高 = 採否・優先度の判断を左右する重要な観測 | ─ | ─ |
| 暫定分類（採用/ 保留/ 却下） | ─ | ─ | 含めない。保留が判断保留系、却下が不採用系を網羅し、いずれにも帰属しない入力は存在しないと構成時に判断した |
| adversarial-review 発動条件判定 | ─ | true = 発動（暫定分類に HITL 承認前の本質的争点が残り、review が判断の根拠を強化する）。false = skip（skip 条件〔inbox 項目が1件のみで暫定分類が自明、または inbox 空〕に該当） | ─ |

deterministic 境界の適用判定（REQ-{NNNN}-{NNN}）:

境界判定基準「モデル推論なしで一意に導出できること」を各判断単位に適用した結果を次に記録する。対象外とした部分の導出結果は後続の semantic evaluation の state として利用し、deterministic に確定した結果を Jev で再判定させない。評価後に判明した deterministic な確定は差異理由 deterministic_override として処理する。境界判定が確定できない部分は、閉じた意味評価の適格条件（REQ-{NNNN}-{NNN}。モデル推論なしでは一意に確定できず意味の解釈を必要とすること、判断に必要な事実を入力として与えられること、判断基準を明示できること、正解となり得る結果範囲を閉じられること、与えられた入力だけで判断できること、入力を閉じる過程に別の未解決な意味判断を隠していないこと）によって判定し、「決定的処理として確定できない」という理由のみで評価対象に分類しない。

| 判断単位 | 対象外とした部分 | 根拠 |
|---|---|---|
| item 評価 | learning 分岐条件（修正対象の不在・再発防止知見のみ）の適合確認 | 分岐条件は判定表適用であり一意に判定できる。判定結果を state として渡し、観点ごとの評価のみを質問する |
| 暫定分類 | inbox からの item 抽出・正規化の検証（ファイル存在・frontmatter 形式） | 機械検証で一意に判定できる。検証結果を state として渡し、採否の意味判断のみを質問する |
| adversarial-review 発動条件判定 | skip 条件の件数計数（inbox 空・1件のみの確認） | 件数計数はモデル推論なしで一意に導出できる。計数結果を state として渡す。「自明」かの判定は文脈解釈を要するため semantic evaluation の対象として残す |

適用可否を本 Case 内で確定した判断（REQ-{NNNN}-{NNN}）:

- **自律確定候補/ユーザー判断必要の判定（STEP-1 Procedure 4）: Jev を適用しない。**
  理由: 本判断の現行契約は「モデルの自己申告による確信度や固定パーセンテージのみで可否を判定しない」と明示しており、判定基準は横断契約 Design の詳細判定表（自律確定可能要件、HITL移送条件）の適用である。Jev の confidence は確信度情報であり、本判断へ情報として与えることはこの禁じ手と競合し得る。また本判断の結論は HITL 境界（ユーザー判断の要否）の確定へ直接影響するため、Stage 1 の観測のみの段階で確率情報を混入させず、判定表適用による現行経路を維持する。将来の適用は観測結果（Issue B）を踏まえ、confidence を与えない質問形式（判定表要素の boolean/choice 化）でのみ再評価する。
  全件監査の処置: **適用不採用の維持（暫定維持）**。判断自体は必要であり既存の判定表適用経路を暫定的に維持する。この維持を恒久的な正規判断主体の確定として扱わず、正規判断主体の再設計が必要になった場合は T1 への引継ぎ事項として明示する。

## 閉じた意味評価の全件監査結果（REQ-{NNNN}）

導入時に割当てられた本 Workflow の判断単位（3件）と適用不採用判断（1件）を存続を前提とせず全件監査し、各判断に「維持」「決定的処理への移行」「条件付き化」「統合」「削除」「T1（正規判断主体の再設計）への持ち越し」のいずれかの処置を確定した。閉じた意味評価の適格条件（REQ-{NNNN}-{NNN}）の6条件を各判断単位に適用した。現行の質問数・質問構造の維持を監査の制約としない。

| 判断単位 | 適格条件適用結果 | 処置 | 根拠 |
|---|---|---|---|
| item 評価（Review 観点ごとの妥当性・影響・緊急度） | 適格（6条件すべて充足） | 維持 | Review 観点ごとの判断基準と結果空間（低/ 中/ 高の離散3水準）が確定しており、分岐条件の適合確認を state として渡す入力閉包が成立 |
| 暫定分類（採用/ 保留/ 却下） | 適格（6条件すべて充足） | 維持 | 採用・保留・却下が結果空間の閉集合。機械検証結果を state として渡す入力閉包が確定している |
| adversarial-review 発動条件判定 | 適格（6条件すべて充足） | 条件付き化 | 暫定分類完了を親判断とする後続評価である。親判断の最終確定結果が発動条件（本質的争点が残り skip 条件非該当）を満たした場合だけ評価を生成し、skip 条件該当時は後続質問・観測記録を生成しない。判断対象・質問形式・判断基準の意味は変更しないため観測識別子（workflow、evaluationKind、questionId）は維持する |
| 自律確定候補/ユーザー判断必要の判定（STEP-1 Procedure 4。適用不採用判断） | 不適格（confidence 混入が自己申告確信度禁止と競合し、HITL 境界の確定へ直接影響） | 適用不採用の維持（暫定維持） | 前節の理由どおり。判断自体は必要であり既存の判定表適用経路を暫定的に維持する。恒久的な正規判断主体の確定として扱わない |

既知問題5構造（正解となり得る選択肢の欠落、機械的に確定できる事実・判定の Jev への混入、親条件不成立時の後続質問生成、評価尺度の水準間での意味境界の重複、実際の評価対象と固定された適用一覧の不一致）の横断点検を実施した。暫定分類の候補集合が保留・却下を含めて網羅済み、deterministic 境界判定により機械的確定の混入なし、本節の条件付き化により親条件不成立時の後続質問生成なし、item 評価の scale は重複のない離散3水準、本節により適用一覧を実態と一致させて更新済みであり、本 Workflow の判断単位に同構造の残存はない。T1（正規判断主体の再設計）への引継ぎ事項は発生しなかった。

