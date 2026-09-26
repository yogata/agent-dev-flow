# 実行構造確定（STEP-5）

execution contract 確定後の Standard / Epic 確定、Child Issue / Wave / 依存構造の生成、構成検証の実行時詳細である。
OU / Epic / Wave / Issue 階層の語彙意味の正規所有は v4-standard-lifecycle Design「work_type / scale / Epic / Wave の v4 意味モデル」節、連結成分アルゴリズムと 3軸判断モデルの正規所有は case-open Design（運用主体。機械的判定手順は execution_unit 構成アルゴリズム参照）である。

## Standard / Epic 確定

- operation_units 群の依存グラフから連結成分（必須依存のみをエッジとする）を計算し、各連結成分を Epic 候補の出発点とする
- 依存強度、Epic サイズ、機能的一貫性の3軸で最終 Issue 構成を自律生成する。複数 Standard、複数 Epic、混在のいずれも作成できる
- 単独根（1 operation_unit だけの連結成分）は Epic 化せず Standard flow として扱い、Root Case 自身を単一 execution unit とする
- 無関係な operation_unit 群を単一 Epic へ機械的に集約しない
- Epic サイズ上限を実行安全境界として遵守する（数値の詳細は v4-runtime-execution-model Design「runtime 制御ループ」節）。Wave 構成は Epic 内の子 Issue 間の意味的依存関係のみから導出し、実行時の並列数・同時実行上限を Wave サイズや Wave 構成判断に適用しない

## Epic 確定時の生成物

- Child Issue を作成し、Root Case に Wave / 依存構造を確定する
- Epic Issue 本文に構成推論の根拠を記録する
- Epic Issue 本文の Wave テーブルに各子 Issue の実行方法（並列、直列）を技術的依存関係に基づいて明記する
- Wave 構成時に同一 Wave 候補の子 Issue 間で変更対象ファイル集合の重複をファイル単位で前置検出し、検出結果を実行・統合時の競合リスク情報（一時直列化・変更対象の調整・merge 順序・rebase・衝突解消担当の判断に利用）として Epic Issue 本文・Wave 記録へ記録・引き渡す。重複時の処置は変更対象分割・重複許容（衝突解消の担当とマージ順序の事前記録を含む）とし、ファイル重複のみを理由とした Wave 分離を処置に含めない。依存ヒント（同一ファイル衝突の抑制ヒント）は競合リスク信号であり Wave 分離の判断材料としない。成果の成立順序への依存（一方が作成する成果を他方が利用する等）が確認された場合は、それを意味的依存として Wave 構成に反映する。比較対象の変更対象集合が取得不能またはファイル粒度に展開不能な子 Issue がある場合は比較を省略せず検出不能として報告し、無重複扱いしない
- 既存オープン Issue とのスコープ重複を検知し、重複する子 Issue 生成をスキップまたはユーザー確認する
- 初期 status は原則 pending とする

## Standard 確定時の制約

- Child Issue を作成しない（儀式的な Child Issue を作る経路は存在しない）
- Root Case 自身を単一 execution unit とし、execution contract を Root Case 本文から読み取って case-run へ引き渡す

## SSoT 分離

- Epic Case では Root Case を Case 全体、Definition 参照、対象範囲、全体制約、Issue 分解、Wave / 依存関係、全体進捗の orchestration SSoT とする
- 各 Child Issue を各 case-run が消費する execution contract の execution SSoT とし、親 Root Case の自由記述に依存せず、その Issue 単独で対象範囲、関連 REQ / Decision / Design、変更対象成果物、実現方針、完了条件、test strategy を取得できる自足構成にする
- 完了条件と事前状態の記載は識別子中心とし、変動しやすい実測値スナップショットは補助値とする
- 完了条件を Issue 本文に展開する前に最新状態を再確認し、差異がある場合は最新状態を優先する

## review_dispositions の Epic / 子 Issue への転記

- draft-data の review_dispositions を、Epic 構成確定後に Epic Issue / 子 Issue 本文の「レビュー判断」セクションへ転記する
- 転記対象 disposition がない場合は「該当なし」と記載する。Root Case への転記は case-open が完了しており、重複転記しない

## 構成検証（GitHub Issue 作成前）

- 構成確定後かつ GitHub Issue 作成前に構成検証（上限、依存維持、全割当）を実行する
- 上限超過または構成不備を検出した場合は停止する（Issue を作成しない）
- 検証項目: Epic サイズ上限、必須依存（意味的依存 DAG 整合）の維持、全 operation_unit の Wave 割当完了。「Wave 同時実行上限」の検査項目は Wave 構成純度の原則により存在しない

## Child Issue 本文の構成

- 子 Issue 本文は単独自足の execution contract 要件を満たす（対象範囲、関連 REQ / Decision / Design、変更対象成果物、実現方針、完了条件、test strategy）
- Epic Issue 本文、子 Issue 本文のテンプレート選定は `agentdev-workflow-templates` の選定ルールに従う（Epic Issue 本文、子 Issue 本文テンプレート）
- 実行識別情報セクション（対象 Case、実行単位）を含める。形式は `agentdev-workflow-templates` の実行識別情報セクション規約に従う
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

- 利用可否は `AI_GATEWAY_API_KEY` の設定有無で決まる（デフォルト有効、feature flag や opt-in 手続きは不要）。未設定時は API を呼び出さず構造化失敗（not_configured）を返し、観測を生成せず従来 LLM 経路のみで本 STEP を完了する
- Jev API 失敗（timeout、429、5xx、network error、response validation error）時は自動 retry せず即座に従来 LLM 経路へ fallback し、失敗観測に失敗分類と最小 diagnostic が記録される。正規状態を破損しない
- 観測は 1 semantic evaluation = 1 observation（1 JSON）で `.agentdev/jev-observations/` に保存する。confidence は evaluation 単位の一次事実であり、provider が返した場合のみ保存する。質問単位への複製・確率分布からの代替生成を行わない。観測書込み失敗時は本 STEP の success を維持し、完了報告に識別可能な warning を明示する。rollback・再実行・擬似再生成を行わない
- 再構成可能な判断入力は判断入力全文を保存せず、評価リクエストの digest と参照で保持する。再構成不能な入力のみ最小 snapshot を渡す
- 操作契約（入力、出力、失敗分類）の正は `docs/designs/responsibilities/custom-tool-contracts.md`「Jev 先行評価」節である

### 適用位置と判断単位割当て

適用位置: 本 STEP（実行構造確定）の Standard / Epic 確定、Wave 構成判断、既存オープン Issue とのスコープ重複判定に適用する。構成検証（GitHub Issue 作成前の上限・依存維持・全割当）は決定的検証であり適用対象外とする。

判断単位割当て（適用対象19件のうち本 Workflow が所有する3件）:

| 判断単位 | 経路 | 質問形式 |
|---|---|---|
| Standard / Epic 確定（3軸判断の総合帰属） | 逐次経路（基本判断経路） | choice（Standard・Epic）+ score（依存強度・Epic サイズ・機能的一貫性の各水準） |
| Wave 構成判断（並列/ 直列、重複時の処置） | 逐次経路（基本判断経路） | boolean（並列可否）+ choice（変更対象分割・重複許容） |
| 既存オープン Issue とのスコープ重複判定 | 逐次経路（基本判断経路） | boolean（重複の有無）+ choice（スキップ・ユーザー確認） |

### choice 形式質問の候補完備性規約（REQ-{NNNN}-{NNN}）

choice 形式質問を構成する際は、次の規約に従う。

- **正解クラス網羅**: 正解となり得る操作クラス（REQ 操作なし等の非操作正解クラスを含む）を候補集合が網羅するように構成する。正解となり得るクラスを候補に含めないまま質問を確定しない
- **NULL 候補の明示判断**: NULL 候補（該当なし等）を候補集合へ含めるか否かを質問構成時に明示判断する。含めないと判断した場合はその判断を明示して質問を確定する。要否を暗黙に決めない
- **候補欠落由来是正の分類**: 候補集合の欠落に由来する判断是正は質問構成側の欠陥として分類し、判断器精度の劣化要因として集計しない。最終判断の観測反映時に差異理由（evaluation_input_defect）として記録された是正のうち候補構造欠落由来と判明したものは、判断器精度評価の集計から除外する

