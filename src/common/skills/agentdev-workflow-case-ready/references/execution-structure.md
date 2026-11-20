# 実行構造確定（STEP-5）

execution contract 確定後の Standard / Epic 確定、Child Issue / Wave / 依存構造の生成、構成検証の実行時詳細である。
OU / Epic / Wave / Issue 階層の語彙意味の正規所有は standard-lifecycle Design「work_type / scale / Epic / Wave の意味モデル」節、連結成分アルゴリズムと 3軸判断モデルの正規所有は case-open Design（運用主体。機械的判定手順は execution_unit 構成アルゴリズム参照）である。

## Standard / Epic 確定

- operation_units 群の依存グラフから連結成分（必須依存のみをエッジとする）を計算し、各連結成分を Epic 候補の出発点とする
- 依存強度、Epic サイズ、機能的一貫性の3軸で最終 Issue 構成を自律生成する。複数 Standard、複数 Epic、混在のいずれも作成できる
- 単独根（1 operation_unit だけの連結成分）は Epic 化せず Standard flow として扱い、Root Case 自身を単一 execution unit とする
- 無関係な operation_unit 群を単一 Epic へ機械的に集約しない
- Epic サイズ上限を実行安全境界として遵守する（数値の詳細は runtime-execution-model Design「runtime 制御ループ」節）。Wave 構成は Epic 内の子 Issue 間の意味的依存関係のみから導出し、実行時の並列数・同時実行上限を Wave サイズや Wave 構成判断に適用しない
- Wave 割当は単一 Wave 前提とトポロジカルレベル割当として意味的依存 DAG から決定的に導出する（case-ready 実行契約の Wave 割当決定的導出条項）。各子 Issue の Wave 番号は前提列 DAG における最長経路深さと一致し、必須依存エッジが存在しない子 Issue 集合はすべて同一 Wave へ割り当てる。Wave 構成判断はこの導出結果の確認であり、その判断基準に主題的グルーピングを含めない。主題的近さ・ファイル重複・マージ順序の望ましさを Wave 分割理由としない。導出手順の正は `<workflows/references/execution-unit-construction>` Design「Wave 構成のトポロジカルレベル割当」節である

## Epic 確定時の生成物

- Child Issue を作成し、Root Case に Wave / 依存構造を確定する
- Epic Issue 本文に構成推論の根拠を記録する
- Epic Issue 本文の実行構成表（`| Wave | Issue | 前提 | 状態 |` の一表）に各子 Issue の所属 Wave と意味的依存（前提列）を技術的依存関係に基づいて明記する。前提列は意味的依存のみを記載し、ファイル重複・マージ順序等の競合調整事項を前提として記載しない（競合リスク情報として Wave 記録へ記録する）
- Issue タイトルは `<workflows/issue-title-policy>` Design（Issue タイトル記述規則）に従う。Epic 確定時は Root Case の接頭辞を `Epic:` へ更新し、子 Issue には `[Epic #<親番号>] Wave-N: 主題` 書式を付与する（`Task:` 接頭辞は廃止）。書式の具体と Wave 投影・構成変更時の同期の規則は同 Design「役割別書式」「Wave 投影」節を参照する（本手順では書式を複製しない）。Epic 本文の実行構成表と子 Issue タイトルの一致を維持する。構成変更時の同期では、同期後に読み戻しで一致を確認し、不一致・更新失敗を同期完了としない（Design「付与と更新の場面」節の同期契約）
- Wave 構成時に同一 Wave 候補の子 Issue 間で主な変更対象（子 Issue が実行単位として所有する宣言）の重複を前置検出し、検出結果を実行・統合時の競合リスク情報（一時直列化・変更対象の調整・merge 順序・rebase・衝突解消担当の判断に利用）として Epic Issue 本文・Wave 記録へ記録・引き渡す。重複時の処置は変更対象分割・重複許容（衝突解消の担当とマージ順序の事前記録を含む）とし、ファイル重複のみを理由とした Wave 分離を処置に含めない。依存ヒント（同一ファイル衝突の抑制ヒント）は競合リスク信号であり Wave 分離の判断材料としない。成果の成立順序への依存（一方が作成する成果を他方が利用する等）が確認された場合は、それを意味的依存として Wave 構成に反映する。比較対象の主な変更対象が取得不能な子 Issue がある場合は比較を省略せず検出不能として報告し、無重複扱いしない（case-ready 実行契約の Wave 重複前置検出条項。契約の正は case-ready Design「v3 epic-wave-model Design からの吸収」節）
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
- 最小性検査（case-ready 実行契約の Wave 最小性検査条項）: 各子 Issue の Wave 番号が前提列 DAG における最長経路深さと一致することを検査する。依存エッジ 0 件の子 Issue 集合から複数 Wave が生成される構成、および辺を保存しながらレベルを超えて分割する構成（同一最長経路深さの子 Issue を別 Wave へ割り当てる構成。主題的近さ・ファイル重複・マージ順序の望ましさを理由とした分割を含む）は不一致として検出する。不一致を検出した場合は構成不備として fail-closed で停止し、Child Issue を作成しない。検査の回帰条件を機械検査として保持するスクリプトの所在は case-ready Design「v3 epic-wave-model Design からの吸収」節が所有する

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
