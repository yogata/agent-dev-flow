# docs/knowledge/ 知識文書保存と backlog 自体の処置（backlog-review）

backlog-review が promoted artifact を source type に依存しない共通モデルで分析し、docs/knowledge/ への知識文書保存、重複・陳腐化した知識の削除、現時点で反映不能なものの保留等の backlog 自体の処置を確定する契約である。
本 reference は `agentdev-backlog-integration` SKILL.md の当該節の詳細であり、docs/knowledge/ 直接保存の判定基準と実行境界を提供する。

## 適用対象

- docs/knowledge/ への知識文書保存へ処置すると判定した採用済み成果物（learning-promote が知識としての保存適否ありと判定して受け渡したものを含む。source type は問わない）を対象とする
- 処置判定の条件に source type を使用しない。intake / learning / inspect 由来を区別せず同一の判定基準を適用する

## backlog 自体の処置と境界

backlog-review が確定するのは、RU 化、docs/knowledge/ への知識文書保存、重複・陳腐化した知識の削除、現時点で反映不能なものの保留等の backlog 自体の処置である。

| 処置 | 内容 |
|---|---|
| docs/knowledge/ 知識文書保存 | 利用者承認を経て docs/knowledge/ へ直接書き込む正規昇華経路。RU 化を経ない |
| 重複・陳腐化した知識の削除 | docs/knowledge/ 配下の既存知識の操作種別「削除」、および昇華せず廃棄する知識候補の処置 |
| 保留 | 現時点で反映不能なものを昇華・削除せず保留し、次回実行の再評価対象とする |

REQ / Decision / Design 反映、ガードレール移管、Project Extension 接続、通常の Issue による修正等の具体的実現先へのルーティングは learning 由来を含めて行わない。システム変更を必要とするものは RU として req-define へ渡す。source type をルーティング条件にしない。

## docs/knowledge/ 直接保存の手順

docs/knowledge/ への知識文書保存は、利用者承認後に backlog-review が直接実行する正規昇華経路である。指示出力型の処置ではなく、保存までを本工程内で完結させる。
手順は次のとおりである（正規原本は backlog-review Design「learning 由来プロジェクト知識の docs/knowledge/ 直接保存」節）:

1. 知識候補の内容を知識文書契約（1知識1ファイル、kebab-case slug、必須内容5項目）へ整形する
2. 既存 docs/knowledge/ 配下ファイルとの重複・陳腐化を確認し、新規、更新、置換、削除の操作種別を判定する
3. 操作種別ごとの変更内容を利用者へ提示し、承認を得る。承認なしの書き込みは行わない
4. 承認後、docs/knowledge/ へファイルを書き込み、保存に成功した採用済み成果物を promoted から削除する

docs/knowledge/ は ADF リポジトリ内の git 管理対象（ドメイン状態の永続化対象）であり、当該書き込みは git 永続化対象の副作用である。保存の実行詳細は `agentdev-workflow-backlog-review`（backlog-review workflow 実装本体）が所有する。
構造整合性（正規配置、命名、必須内容）は docs-check 系の機械検査が担保し、意味的妥当性は機械で確定しない。
既存 REQ / Decision / Design への反映を含むシステム変更を必要とするものは、要件化の方向に実現の方向を明記した RU 生成により、承認を経た要件化経路（req-define）へ渡す。

## ADF リポジトリ外の project-local 資産

- ADF リポジトリ外の project-local 資産（Project Extension の接続定義等）への昇華は、backlog-review が当該資産を直接書き換えない。処置内容と書き込み先の実行前提を明示した指示を完了報告の出力へ含める
- Project Extension の接続定義は導入プロジェクト側資産である。指示には、書き込み先が導入プロジェクトの git 管理対象パスであること、導入先リポジトリの git 管理（commit / push）を経て変更を永続化するという実行前提を明示する
- project-local 側の資産と workflow の接続は、Project Knowledge の所有と workflow 利用を正規所有する要件群、および extension の発見と読込を提供するスキルが所有する契約に従う。本契約は機構を再定義せず名レベルで参照する

## ユーザー承認境界

- docs/knowledge/ 知識文書保存を含む RU 以外の処置は RU 生成承認と同じ承認工程で提示し、ユーザーの明示的な承認を経る
- 知識文書の新規、更新、置換、削除はいずれも利用者承認を経る。承認なしの docs/knowledge/ 書き込みは行わない
- docs/knowledge/ 知識文書保存を含む RU 以外への昇華も、バックログ統合の要件が正規所有する承認原則に準拠してユーザー承認を経る
- 未承認の処置は実行せず、当該成果物は promoted に残置する

## 成果物ライフサイクル

- docs/knowledge/ への知識文書保存に成功した採用済み成果物は、RU 生成成功時と同様に promoted から削除する
- RU 化に至らなかった成果物、承認を得られなかった処置の成果物は promoted に残置する
- docs/knowledge/ 知識の削除処置は、明示承認を経て実行し、該当採用済み成果物を promoted から削除する（破壊的変更の明示承認に従う）
- 保留の成果物と project-local 資産への昇華指示（指示出力型）の成果物は promoted に残置し、次回 backlog-review 実行の再評価対象とする。learning 側の deferred 管理ファイルは更新しない既存制約を維持する
- 指示出力の実行確認は本契約の対象外である

## docs/knowledge/ 以外の知識

- docs/knowledge/ への知識文書保存にも該当せず、システム変更を必要としない知識は保留として扱い、本契約の判断で新規の文書種別や保管先を導入しない

## 提供側との相互参照

- docs/knowledge/ の知識文書は docs/knowledge/ 直接保存の正規昇華経路を経由して流入し、判断の材料として使われる成長する資産として扱う（Project Knowledge の所有と workflow 利用を正規所有する要件群の所有面契約）
