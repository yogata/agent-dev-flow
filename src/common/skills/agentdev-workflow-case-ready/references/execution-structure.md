# 実行構造確定（STEP-5）

execution contract 確定後の Standard / Epic 確定、Child Issue / Wave / 依存構造の生成、構成検証の実行時詳細である。
OU / Epic / Wave / Issue 階層の語彙意味の正規所有は v4-standard-lifecycle Design「work_type / scale / Epic / Wave の v4 意味モデル」節、連結成分アルゴリズムと 3軸判断モデルの正規所有は case-open Design（運用主体。機械的判定手順は execution_unit 構成アルゴリズム参照）である。

## Standard / Epic 確定

- operation_units 群の依存グラフから連結成分（必須依存のみをエッジとする）を計算し、各連結成分を Epic 候補の出発点とする
- 依存強度、Epic サイズ、機能的一貫性の3軸で最終 Issue 構成を自律生成する。複数 Standard、複数 Epic、混在のいずれも作成できる
- 単独根（1 operation_unit だけの連結成分）は Epic 化せず Standard flow として扱い、Root Case 自身を単一 execution unit とする
- 無関係な operation_unit 群を単一 Epic へ機械的に集約しない
- Epic サイズ上限を実行安全境界として遵守する（数値の詳細は v4-runtime-execution-model Design「runtime 制御ループ」節）。Wave 構成は Epic 内の子 Issue 間の意味的依存関係のみから導出し、実行時の並列数・同時実行上限を Wave サイズや Wave 構成判断に適用しない
- Wave 割当は単一 Wave 前提とトポロジカルレベル割当として意味的依存 DAG から決定的に導出する（REQ-{NNNN}-{NNN}）。各子 Issue の Wave 番号は前提列 DAG における最長経路深さと一致し、必須依存エッジが存在しない子 Issue 集合はすべて同一 Wave へ割り当てる。Wave 構成判断はこの導出結果の確認であり、その判断基準に主題的グルーピングを含めない。主題的近さ・ファイル重複・マージ順序の望ましさを Wave 分割理由としない。導出手順の正は `<workflows/references/execution-unit-construction>` Design「Wave 構成のトポロジカルレベル割当」節である

## Epic 確定時の生成物

- Child Issue を作成し、Root Case に Wave / 依存構造を確定する
- Epic Issue 本文に構成推論の根拠を記録する
- Epic Issue 本文の実行構成表（`| Wave | Issue | 前提 | 状態 |` の一表）に各子 Issue の所属 Wave と意味的依存（前提列）を技術的依存関係に基づいて明記する。前提列は意味的依存のみを記載し、ファイル重複・マージ順序等の競合調整事項を前提として記載しない（競合リスク情報として Wave 記録へ記録する）
- Issue タイトルは `<workflows/issue-title-policy>` Design（Issue タイトル記述規則）に従う。Epic 確定時は Root Case の接頭辞を `Epic:` へ更新し、子 Issue には `Wave-N: 主題` 書式を付与する（`Task:` 接頭辞は廃止）。書式の具体と Wave 投影・構成変更時の同期の規則は同 Design「役割別書式」「Wave 投影」節を参照する（本手順では書式を複製しない）。Epic 本文の実行構成表と子 Issue タイトルの一致を維持する
- Wave 構成時に同一 Wave 候補の子 Issue 間で変更対象ファイル集合の重複をファイル単位で前置検出し、検出結果を実行・統合時の競合リスク情報（一時直列化・変更対象の調整・merge 順序・rebase・衝突解消担当の判断に利用）として Epic Issue 本文・Wave 記録へ記録・引き渡す。重複時の処置は変更対象分割・重複許容（衝突解消の担当とマージ順序の事前記録を含む）とし、ファイル重複のみを理由とした Wave 分離を処置に含めない。依存ヒント（同一ファイル衝突の抑制ヒント）は競合リスク信号であり Wave 分離の判断材料としない。成果の成立順序への依存（一方が作成する成果を他方が利用する等）が確認された場合は、それを意味的依存として Wave 構成に反映する。比較対象の変更対象集合が取得不能またはファイル粒度に展開不能な子 Issue がある場合は比較を省略せず検出不能として報告し、無重複扱いしない
- 既存オープン Issue とのスコープ重複を検知し、重複する子 Issue 生成をスキップまたはユーザー確認する
- 初期 status は原則 pending とする

## Standard 確定時の制約

- Child Issue を作成しない（儀式的な Child Issue を作る経路は存在しない）
- Root Case 自身を単一 execution unit とし、execution contract を Root Case 本文から読み取って case-run へ引き渡す

## SSoT 分離

- Epic Case では Root Case を Case 全体、Definition 参照、対象範囲、全体制約、実行構成（実行構成表の一表。分解表と実行順序表の二重保持を行わない）、Wave / 依存関係、全体進捗の orchestration SSoT とする
- 各 Child Issue を各 case-run が消費する execution contract の execution SSoT とし、親 Root Case の自由記述に依存せず、その Issue 単独で対象範囲、関連 REQ / Decision / Design、変更対象成果物、実現方針、完了条件、test strategy を取得できる自足構成にする
- 完了条件と事前状態の記載は識別子中心とし、変動しやすい実測値スナップショットは補助値とする
- 完了条件を Issue 本文に展開する前に最新状態を再確認し、差異がある場合は最新状態を優先する

## review_dispositions の Epic / 子 Issue への転記

- draft-data の review_dispositions は Epic Issue / 子 Issue 本文へ転記しない。採用内容は子 Issue 本文の該当章（対象範囲、実現方針、完了条件の検証方法）へ反映し、必要な採否理由だけをコメントへ残す
- 転記対象 disposition がない場合は「該当なし」と記載する。Root Case への転記は case-open が完了しており、重複転記しない

## 構成検証（GitHub Issue 作成前）

- 構成確定後かつ GitHub Issue 作成前に構成検証（上限、依存維持、全割当）を実行する
- 上限超過または構成不備を検出した場合は停止する（Issue を作成しない）
- 検証項目: Epic サイズ上限、必須依存（意味的依存 DAG 整合）の維持、全 operation_unit の Wave 割当完了、Wave 割当とトポロジカルレベル割当（最小性）の一致。「Wave 同時実行上限」の検査項目は Wave 構成純度の原則により存在しない
- 最小性検査（REQ-{NNNN}-{NNN}）: 各子 Issue の Wave 番号が前提列 DAG における最長経路深さと一致することを検査する。依存エッジ 0 件の子 Issue 集合から複数 Wave が生成される構成、および辺を保存しながらレベルを超えて分割する構成（同一最長経路深さの子 Issue を別 Wave へ割り当てる構成。主題的近さ・ファイル重複・マージ順序の望ましさを理由とした分割を含む）は不一致として検出する。不一致を検出した場合は構成不備として fail-closed で停止し、Child Issue を作成しない。検査の回帰条件は scripts/self/release/wave-composition-purity.test.ts が機械検査として保持する

## 受け入れ義務の実行構成への到達確認と投影不完全時の抑止

実行構造確定時に、execution contract 確定時の受け入れ義務対応付け（execution contract 確定の対応付け節）が、実際に構成された実行単位へ到達していることを確認する。

- 対応付けた各受け入れ義務について、対応先の実行単位（Standard Case では対象 Case、Epic では対応する Child Issue または Epic Issue 本文）へ義務の検証義務と検証手段が記録されていることを確認する
- 子実行単位へ未投影の義務は、Epic 横断最終検証義務として Epic Issue 本文へ保持する。保持されず対応先もない義務は投影不完全である
- **投影不完全時の抑止**: 対応先のない義務が存在する場合は実行構造確定を成立させず、実行準備完了（ready 遷移）へ遷移しない。ready 遷移手順そのものは readiness-and-cleanup（STEP-6）が所有し、実行準備条件の「実行構造確定」が本確認の成立を要求する。未対応義務の一覧と停止理由を報告し、対応付けの解消（子実行単位への投影追加、Epic 横断最終検証義務としての保持、または Definition 側修正のための case-open 差し戻し）後に再実行する
- 本確認は構成検証（GitHub Issue 作成前）の前提条件であり、投影不完全の解消前に Child Issue を作成しない

## Child Issue 本文の構成

- 子 Issue 本文は単独自足の execution contract 要件を満たす（対象範囲、関連 REQ / Decision / Design、変更対象成果物、実現方針、完了条件、test strategy）
- Epic Issue 本文、子 Issue 本文のテンプレート選定は `agentdev-workflow-templates` の選定ルールに従う（Epic Issue 本文、子 Issue 本文テンプレート）。本文テンプレートは Issue タイトルを規定せず、子 Issue タイトルの書式は `<workflows/issue-title-policy>` Design に従う
- 実行識別情報セクションを本文へ含めない（Issue 本文には実行識別情報セクションを設けない。Case・実行単位は 親Epic: #N 参照と実行構成表から相関する）
- Issue 作成は Custom Tool `agentdev_gh` の issue_create 経由で行う。Parent 行で Root Case（Epic flow では親 Epic Issue）を参照する
- 本文はファイル経由で扱い、Markdown 行構造を保持する

## Jev 評価経路（REQ-{NNNN}、DEC-{NNN}）

Epic/Wave 構成判断は case-ready が所有する正規判断である。本 Workflow が所有する3判断単位（Standard / Epic 確定、Wave 構成判断、既存オープン Issue とのスコープ重複判定）は、いずれも基本判断経路（Jev 先行評価 → LLM 推論 → LLM 最終判断）の逐次経路で処理する。confidence による LLM 推論の機械的省略・Jev 結果の直接確定は行わず、最終判断は常に reasoning model（LLM 推論）が下す。

### 基本判断経路（逐次経路）

閉じた意味判断ごとに、次の逐次経路を実行する。Jev は最終判断者ではなく、後段の LLM 推論への追加情報として扱う。

1. **Jev 先行評価**: Custom Tool `agentdev_jev` の `evaluate` に、本 Workflow が構成した閉じた判断入力（state、指示、基準、質問群。日本語。repository 全文を渡さない）を渡す。判断入力には機械的事実（operation_units 依存グラフ、連結成分の計算結果）を state に含める。evaluator 成功後・LLM 推論へ進む前に、当該評価の観測（1 semantic evaluation = 1 observation）が `.agentdev/jev-observations/` へ永続化される
2. **LLM 推論**: Jev 結果・候補別確率分布・取得できた confidence を情報として含み、従来の判断材料（operation_units 依存グラフ、3軸判断の判定結果、Wave 重複前置検出の結果、既存オープン Issue の検出結果）も参照して推論する。Jev 結果だけで判断しない
3. **LLM 最終判断**: 従来経路と同一の判断基準で最終判断を確定する。Jev 結果・confidence は最終判断を確定させない
4. **最終判断の観測反映**: Custom Tool `agentdev_jev` の `observation_write` で、evaluator 成功観測へ最終判断結果（final result）を追記する。evaluator 返却結果と最終判断が異なる場合のみ、差異理由の分類（evaluation_input_defect / semantic_disagreement / deterministic_override / unknown）を記録する

### 共通契約

- 利用可否は `CLOUDFLARE_ACCOUNT_ID` と `CLOUDFLARE_API_TOKEN` の設定有無で決まる（デフォルト有効、feature flag や opt-in 手続きは不要）。未設定時は API を呼び出さず構造化失敗（not_configured）を返し、観測を生成せず従来 LLM 経路のみで本 STEP を完了する
- Jev API 失敗（timeout、429、5xx、network error、response validation error）時は自動再試行せず即座に従来 LLM 経路へ fallback し、失敗観測に失敗分類と最小 diagnostic が記録される。正規状態を破損しない
- 観測は 1 semantic evaluation = 1 observation（1 JSON）で `.agentdev/jev-observations/` に保存する。confidence は evaluation 単位の一次事実であり、provider が返した場合のみ保存する。質問単位への複製・確率分布からの代替生成を行わない。観測書込み失敗時は本 STEP の success を維持し、完了報告に識別可能な warning を明示する。rollback・再実行・擬似再生成を行わない
- 再構成可能な判断入力は判断入力全文を保存せず、評価リクエストの digest と参照で保持する。再構成不能な入力のみ最小 snapshot を渡す
- 条件付き評価の発動制御（REQ-{NNNN}-{NNN}）: 親となる判断の結果によって後続判断の必要性が決まる場合、親判断の最終確定結果が発動条件を満たした場合だけ後続の意味評価を生成する。Jev による親判断の先行評価結果のみをもって後続評価を発動しない。発動条件が成立しない場合は後続質問自体を生成せず、後続の意味評価に対応する観測記録（非該当等を表すためだけのものを含む）も生成しない
- 観測識別子の安定性（REQ-{NNNN}-{NNN}）: 同じ意味判断を継続する場合は観測識別子（workflow、evaluationKind、questionId）を維持する。判断対象、結果範囲または判断基準の意味が変わり変更前後を同一の意味判断として比較できなくなる場合、および複数の判断を統合した場合は新しい questionId を使用する。入力および契約の版の違いは sourceRevision、requestDigest 等の既存の観測項目で区別する。既存の観測記録に対して移行、書換え、識別子の付替えを行わない
- 操作契約（入力、出力、失敗分類）の正は `docs/designs/responsibilities/custom-tool-contracts.md`「Jev 先行評価」節である

### 適用位置と判断単位割当て

適用位置: 本 STEP（実行構造確定）の Standard / Epic 確定、Wave 構成判断、既存オープン Issue とのスコープ重複判定に適用する。構成検証（GitHub Issue 作成前の上限・依存維持・全割当・最小性）は決定的検証であり適用対象外とする。

判断単位割当て（適用対象19件のうち本 Workflow が所有する3件）:

| 判断単位 | 経路 | 質問形式 |
|---|---|---|
| Standard / Epic 確定（3軸判断の総合帰属） | 逐次経路（基本判断経路） | choice（Standard・Epic）+ score（依存強度・機能的一貫性の各水準。Epic サイズは子 Issue 数から機械導出） |
| Wave 構成判断（並列/ 直列、重複時の処置） | 逐次経路（基本判断経路） | boolean（並列可否）+ choice（変更対象分割・重複許容） |
| 既存オープン Issue とのスコープ重複判定 | 逐次経路（基本判断経路） | boolean（重複の有無）+ choice（スキップ・ユーザー確認） |

### choice 形式質問の候補完備性規約（REQ-{NNNN}-{NNN}）

choice 形式質問を構成する際は、次の規約に従う。

- **正解クラス網羅**: 正解となり得る操作クラス（REQ 操作なし等の非操作正解クラスを含む）を候補集合が網羅するように構成する。正解となり得るクラスを候補に含めないまま質問を確定しない
- **NULL 候補の明示判断**: NULL 候補（該当なし等）を候補集合へ含めるか否かを質問構成時に明示判断する。含めないと判断した場合はその判断を明示して質問を確定する。要否を暗黙に決めない
- **候補欠落由来是正の分類**: 候補集合の欠落に由来する判断是正は質問構成側の欠陥として分類し、判断器精度の劣化要因として集計しない。最終判断の観測反映時に差異理由（evaluation_input_defect）として記録された是正のうち候補構造欠落由来と判明したものは、判断器精度評価の集計から除外する

判断単位ごとの閉じた判断入力構成（REQ-{NNNN}-{NNN}）:

各判断単位の評価入力は、当該評価入力だけで判断可能な形に閉じて構成する。score 形式は重複のない離散 scale と各 level の意味境界を評価入力に明示し、boolean 形式は true / false の判断条件を評価入力のみから解釈可能に記録する。choice 形式の NULL 候補含否は前節の規約に従い、判断単位ごとに明示判断を記録する。表中の「─」は当該質問形式を使用しない単位であることを示す。

| 判断単位 | score scale（重複のない離散水準と各 level の意味境界） | boolean の true / false 条件 | choice の NULL 候補含否の明示判断 |
|---|---|---|---|
| Standard / Epic 確定 | 依存強度: 3水準（関連 = 同じ領域だが実行依存なし、弱 = 実行順序の推奨はあるが並列可、必須 = 一方が他方なしでは成立しない）。機能的一貫性: 3水準（分散 = 共通主題なし、部分的 = 関連するが単一主題ではない、一貫 = 単一の機能的主題）。各 scale のラベルは重複させない。Epic サイズは子 Issue 数から機械導出した結果を state に含め、score 質問にはしない | ─ | 含めない。3軸判断完了後の帰属先は Standard・Epic の排他2クラスであり、いずれにも帰属しない入力は構成時に存在しないと判断した |
| Wave 構成判断 | ─ | true = 並列可（子 Issue 間に実行順序を固定する意味的な必須依存がない）。false = 並列不可（意味的な必須依存によって順序が固定される）。変更ファイルの重複だけでは false にしない | 含めない。変更対象分割・重複許容の choice は重複検出時の処置を問う閉集合（変更対象分割・重複許容）であり、非該当系は boolean 側が表現すると構成時に判断した |
| 既存オープン Issue とのスコープ重複判定 | ─ | true = 重複あり（既存オープン Issue の対象範囲と本 Case の対象範囲が交差する）。false = 重複なし | 含めない。処置 choice（スキップ・ユーザー確認）は重複ありの場合の処置のみを問う閉集合であり、非該当系は boolean 側が表現すると構成時に判断した |

deterministic 境界の適用判定（REQ-{NNNN}-{NNN}）:

境界判定基準「モデル推論なしで一意に導出できること」を各判断単位に適用した結果を次に記録する。対象外とした部分の導出結果は後続の semantic evaluation の state として利用し、deterministic に確定した結果を Jev で再判定させない。評価後に判明した deterministic な確定は差異理由 deterministic_override として処理する。境界判定が確定できない部分は、閉じた意味評価の閉包条件（REQ-{NNNN}。判別基準の正典は `<foundations/v4-responsibility-boundaries>` Design「閉じた意味評価の閉包条件」節が集約所有する）によって判定し、「決定的処理として確定できない」という理由のみで評価対象に分類しない。

| 判断単位 | 対象外とした部分 | 根拠 |
|---|---|---|
| Standard / Epic 確定 | operation_units 依存グラフ・連結成分の計算、Epic サイズ（子 Issue 数）の計数と上限判定 | グラフ計算と件数計数・上限10件の判定はモデル推論なしで一意に導出できる。結果を state として渡し、意味的な依存強度・機能的一貫性と帰属のみを質問する。単独根は Standard とし Jev で再判定しない |
| Wave 構成判断 | 必須依存エッジの有無の検出 | 依存グラフからの必須依存エッジ検出は決定的計算で一意に導出できる。検出結果を state として渡し、並列可否の意味判断のみを質問する |
| 既存オープン Issue とのスコープ重複判定 | 既存オープン Issue の一覧取得と候補検索 | 一覧取得とキーワード照合は検索による事実確認であり一意に導出できる。検索結果（候補一覧）を state として渡し、対象範囲の交差判断のみを質問する |

## 閉じた意味評価の全件監査結果（REQ-{NNNN}）

導入時に割当てられた本 Workflow の判断単位（3件）を存続を前提とせず全件監査し、各判断に「維持」「決定的処理への移行」「条件付き化」「統合」「削除」「T1（正規判断主体の再設計）への持ち越し」のいずれかの処置を確定した。閉じた意味評価の閉包条件（REQ-{NNNN}。判別基準の正典は `<foundations/v4-responsibility-boundaries>` Design「閉じた意味評価の閉包条件」節）の6条件を各判断単位に適用した。現行の質問数・質問構造の維持を監査の制約としない。

| 判断単位 | 閉包条件適用結果 | 処置 | 根拠 |
|---|---|---|---|
| Standard / Epic 確定（3軸判断の総合帰属） | 適格（6条件すべて充足） | 維持 | グラフ計算・件数計数を state として渡す入力閉包が確定しており、帰属先は Standard・Epic の排他閉集合。依存強度・機能的一貫性の水準判定は意味解釈を要し scale も重複のない離散水準 |
| Wave 構成判断（並列/ 直列、重複時の処置） | 適格（6条件すべて充足） | 条件付き化 | 親判断（Standard / Epic 確定）の最終確定結果が Epic である場合だけ Wave 構成判断を生成する。Standard と確定した場合は Wave 構成判断の質問自体を生成せず、対応する観測記録も生成しない。あわせて重複検出結果が空の場合は処置 choice（変更対象分割・重複許容）を生成しない。判断対象・質問形式・判断基準の意味は変更しないため観測識別子（workflow、evaluationKind、questionId）は維持する |
| 既存オープン Issue とのスコープ重複判定 | 適格（6条件すべて充足） | 条件付き化 | 重複ありと最終確定した場合に限り処置 choice（スキップ・ユーザー確認）を生成する。重複なしと確定した場合は処置 choice の質問自体を生成せず、対応する観測記録も生成しない。判断対象・質問形式・判断基準の意味は変更しないため観測識別子（workflow、evaluationKind、questionId）は維持する |

既知問題5構造（正解となり得る選択肢の欠落、機械的に確定できる事実・判定の Jev への混入、親条件不成立時の後続質問生成、評価尺度の水準間での意味境界の重複、実際の評価対象と固定された適用一覧の不一致）の横断点検を実施した。依存強度・機能的一貫性の scale ラベル重複なし、deterministic 境界判定によりグラフ計算等の機械的確定の混入なし、本節の条件付き化により親条件不成立時の後続質問生成なし、本節により適用一覧を実態と一致させて更新済みであり、本 Workflow の判断単位に同構造の残存はない。T1（正規判断主体の再設計）への引継ぎ事項は発生しなかった。
