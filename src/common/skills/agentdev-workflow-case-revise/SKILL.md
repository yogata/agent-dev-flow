---
name: agentdev-workflow-case-revise
description: "内部 lifecycle 段階 case-revise の workflow 実装本体。再合意済み Definition 変更の受入確認（未合意変更の req-define 差し戻し）、canonical Definition との実変更判定（実変更なし時は Definition Amendment PR 不作成で case-ready 引き継ぎ）、冪等キーによる既存 Definition Amendment PR の検出と再利用、設計修正PR作成、Epic 完了済み Issue の影響再評価（巻き戻し禁止）、合意変更の受領確認経路（記録・受領・適用の区別）、Case 関連 Issue 本文更新、case-ready 引き継ぎ、中断済み成果物の再利用による収束を所有する。USE FOR: case-revise 実行時の workflow 制御。DO NOT USE FOR: 新しい要求・Decision・対象範囲の決定と Definition の意味判断（req-define 側の責務）、execution contract / execution structure の再確定（case-ready 側の責務）、実装実行（case-run 側の責務）、単独起動（case-auto の内部 lifecycle orchestration から起動される内部段階である）。"
---


# case-revise workflow スキル

case-revise command の workflow 実装本体である。
req-define で再合意済みの Definition 変更の既存 Case への反映、設計修正PRの冪等作成、Epic 完了済み Issue の影響再評価、case-ready への引き継ぎまでの制御構造を所有する。
case-revise は新しい要求、Decision、対象範囲を自身では決定せず、意味判断は req-define が所有する。
上流の問題は上流の無断書換えではなく正規改訂と影響再評価へ接続する。

case-revise command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}）。

## 入力

- case-revise command から渡される Root Case（Issue 番号または URL）
- req-define で再合意済みの Definition 変更（draft。req-define が合意した内容をそのまま投影する）

## 出力

- 設計修正PR（canonical Definition に実変更がある場合のみ）
- 再評価対象と判定した Issue のマーキング（影響があるもののみ）
- 影響対象ごとの継続・停止・再実行の判断（影響対象特定の結果として）
- 最新条件の引き渡し（影響対象の作業担当へ）と担当による適用方針報告の確認
- case-ready への引き継ぎ
- 完了報告（case-revise 完了報告テンプレート）

## 副作用

- 設計修正PRの作成（実変更がある場合のみ。Custom Tool `agentdev_gh` 経由。VERIFY は Tool 内部）
- 影響再評価対象 Issue の本文更新・マーキング（影響があるもののみ。`agentdev-workflow-templates` のテンプレート構造維持規約に従う）
- 行わない副作用: Epic Issue 本文の実行構成表更新（単一書き手は case-close）、execution contract / execution structure の再確定（case-ready）、Case 状態モデルの新設・拡張、実装実行、完了条件チェックボックスの評価と更新

## 制御平面（STEP 一覧）

case-revise workflow は次の5 STEP で構成する。
各 STEP は再開ポイント（resume point）を持つ（DEC-{N}、`<foundations/v4-durable-state-and-recovery>` Design）。
会話コンテキストに依存せず、永続状態（Root Case Issue、設計修正PR、REQ / Decision / Design、Epic Issue、子 Issue）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 再合意内容の受入確認 | Root Case と再合意内容の受領 | 再合意済み確認完了（未合意変更は req-define へ差し戻して停止） | [references/definition-revision.md](references/definition-revision.md) |
| STEP-2 | 実変更判定と冪等検索 | STEP-1 完了 | 実変更の有無と既存の設計修正PRの有無を判定済み（実変更なし時は case-ready 引き継ぎへ、既存 PR あり時は再利用して STEP-4 へ） | [references/definition-revision.md](references/definition-revision.md) |
| STEP-3 | 設計修正PR作成 | STEP-2 で実変更ありかつ既存 PR なし | 設計修正PR作成済み | [references/definition-revision.md](references/definition-revision.md) |
| STEP-4 | 影響再評価 | STEP-2（再利用時）または STEP-3（新規作成時）完了 | Epic の完了済み Issue を含む影響有無判定済み、影響ある Issue のみマーキング済み、影響対象ごとの継続・停止・再実行の判断済み | [references/impact-reassessment.md](references/impact-reassessment.md) |
| STEP-5 | Issue 本文更新と case-ready 引き継ぎ | STEP-4 完了 | Case 関連 Issue 本文更新済み（テンプレート構造維持）、影響対象の作業担当への最新条件引き渡し済み、適用方針報告の確認済み、case-ready 引き継ぎ完了、完了報告出力済み | [references/handoff-and-update.md](references/handoff-and-update.md) |

### STEP 間の依存と分岐

- **基本順序**: STEP-1 → STEP-2 →（実変更ありかつ既存 PR なし: STEP-3）→ STEP-4 → STEP-5
- **未合意分岐（STEP-1）**: 再合意済みでない変更の反映要求は受け付けず、req-define へ差し戻して停止する
- **実変更なし分岐（STEP-2）**: canonical Definition との差分が空の場合は設計修正PRを作成せず、execution contract / execution structure の再確定を case-ready へ引き継ぐ（空の PR を作る経路は存在しない。case-revise 専用の Case 状態は追加しない）
- **冪等分岐（STEP-2）**: 同じ再合意内容に対応する既存設計修正PRを検出した場合は再利用し、STEP-3 を省略して STEP-4 へ進む（重複生成しない）
- **影響なし分岐（STEP-4）**: 影響なしと確認できた完了済み Issue は巻き戻さず、完了状態のまま維持する。影響しない進行中の作業は停止せず継続し、通常の進行状況更新のみで対応する（目的・対象範囲・完了条件は変更しない）

### 再開プロトコル（resume protocol）

- 再開点は永続状態から再構成する: Root Case Issue の状態、設計修正PRの存在と状態（既存 PR が open か merge 済みかを含む）、Epic Issue / 子 Issue の本文、完了報告の有無
- 冪等キー（case-open / case-ready Design）で既存の設計修正PRを検出し、会話コンテキストの記憶に依存せず再利用する
- 中断済み成果物を原則として巻き戻さず、既存成果物を再利用して正しい最終状態へ収束する

### 終了条件（termination）

- 正常終了: STEP-5 の完了報告出力まで（実変更なし時は設計修正PR不作成のまま case-ready 引き継ぎ完了まで）
- 停止終了: 再合意済みでない変更の反映要求（req-define へ差し戻し）、既存の設計修正PRと同じ再合意内容と判定しない限り重複 PR を作らない契約の判定不能、影響再評価の判定材料不足

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する。

- `agentdev-req-file-manager` / `agentdev-decision-file-manager` / `agentdev-design-file-manager`: 設計修正PRに含める REQ / Decision / Design 変更の保存実体の委譲先。case-revise 自身は意味判断をしない
- `agentdev-artifact-validation`: REQ / Decision frontmatter id↔filename 整合、README entry 存在、変更範囲検証の公開検証契約
- `agentdev-issue-management`: Issue 操作の安全手続き、Issue 更新時の前後内容比較、テンプレート構造維持の確認
- `agentdev-workflow-templates`: Issue 本文 / PR 本文 / 完了報告テンプレート選定、実行識別情報セクション形式、【必須】セクション維持
- `agentdev-workflow-lifecycle`: work_type 判定基準
- `agentdev-workflow-orchestration`: capture 境界の Split Rule、deviation capture 委譲
- `agentdev-traceability`: coverage / impact による Definition 変更の影響再評価候補の確認（fail-open。候補提供であり最終判断ではない）
- Custom Tool `agentdev_gh`: GitHub I/O 境界（issue_read、issue_update、issue_create、pr_read、pr_create、comment_create。VERIFY は Tool 内部）
- `agentdev-learning-capture` / `agentdev-intake-pipeline`: deviation capture 委譲（実観測時）

## トレーサビリティ能力の利用

影響再評価（STEP-4）で `agentdev-traceability` の coverage / impact を利用し、Definition 変更（REQ / Decision / Design）と既存成果物・Issue の対応関係から影響候補を確認できる。

- 問い合わせ結果は候補提供であり最終判断としない。新規の依存関係、実行構成、Wave 構成、実行順序の設計には使用しない
- 機能の不在、実行失敗、空結果、候補過多の場合は README 索引、正規成果物の直接読取、`rg` 等の代替探索で継続する（fail-open）
- 影響なしと確認できた完了済み Issue を巻き戻さない判断は、候補の不在を根拠にしない（候補不在は影響なしの証明ではない）

## 共通制約

- **合意変更の受領確認（記録・受領・適用の区別）**: 合意変更は記録、受領、実行への適用を区別して扱う。記録は req-define の合意記録と判断変更時の記録コメント（撤回対象を必須項目とする）、受領は STEP-1 の受入確認と STEP-4 の影響対象特定（継続・停止・再実行の判断を含む）、適用は STEP-5 の Case 関連 Issue 本文更新と影響対象の作業担当への最新条件引き渡しである。引き渡し後、作業担当による作業への適用方針の報告を確認するまで case-ready 引き継ぎへ進まない。影響しない作業を一律停止せず、通常の進行状況更新によって目的・対象範囲・完了条件を変更しない
- **意味判断の非所有**: 新しい要求、Decision、対象範囲を自身では決定しない。再合意済みでない変更の反映要求は req-define へ差し戻す
- **設計修正PRの冪等**: 同じ再合意内容に対応する既存設計修正PRを重複生成しない（冪等キーは case-open / case-ready Design が所有）。既存 PR を検出した場合は再利用する
- **中断済み成果物の再利用**: 中断済み成果物を原則として巻き戻さず、既存成果物を再利用して正しい最終状態へ収束する
- **再確定の委譲**: execution contract / execution structure の再確定は case-ready が行う。case-revise 完了後は case-ready を経由し、case-revise 専用の Case 状態は追加しない
- **本文 verbatim**: Root Case 本文、Issue 本文は Custom Tool `agentdev_gh` の操作引数としてそのまま渡す（文字コード・一時ファイルの実装詳細は Tool 内部）（`POL-gh-io-delegation`）
- **Issue 本文のテンプレート構造維持**: Case 関連 Issue 本文を更新する際、作成時のテンプレート構造と必須セクションを維持する（Markdown 行構造（LF、セクション間空行、インデント）の byte 単位保持を含む）
- **capture 境界**: 自工程で実観測した deviation は `agentdev-learning-capture` skill または `agentdev-intake-pipeline`（自動capture向け item 生成操作）へ委譲して保存する（保存先は Split Rule（`agentdev-workflow-orchestration` 参照）に従う）。実行担当サブエージェントではなく本 workflow 自身が `.agentdev/intake/`、`.agentdev/learning/` を直接変更しない

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<foundations/v4-durable-state-and-recovery>` Design**: STEP reference 構造、resume point
- **case-open / case-ready Design**: Definition Package、設計修正PRの lifecycle、canonical Definition 判定、冪等キー
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **case-revise command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
- **req-define workflow スキル**: 上流工程（Definition の意味判断と再合意。case-revise は未合意変更を本工程へ差し戻す）
- **case-ready workflow スキル**: 後続工程（設計修正PR受入と execution contract / execution structure 再確定）
