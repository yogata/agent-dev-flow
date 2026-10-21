---
name: agentdev-workflow-case-open
description: "case-open workflow 本体。Root Case と Definition Package を確立し、変更判定、Case ごとの設計PR、冪等再実行、横断依存検査、deviation capture を制御する。USE FOR: case-open の工程制御。DO NOT USE FOR: 単独起動（case-auto 内部段階）、execution contract、Standard/Epic と子Issue/Wave の確定、RU 削除、Decision 受理（case-ready の責務）。"
---


# case-open workflow スキル

case-open command の workflow 実装本体である。
合意済み要件doc（構造化 `draft-data`）から Root Case 確立、Definition Package 生成と Root Case 関連付け、実変更判定と設計PR作成、冪等再実行、deviation captureまでの制御構造を所有する。
execution contract の確定、Standard / Epic の最終確定、Child Issue / Wave の作成、RU 削除、proposed Decision の受理評価は行わない（case-ready 実行契約 REQ へ移管）。
Root Case 確立は価値がある有限作業における Issue の必要時利用であり、case-open 自身は要求・設計の正規情報を再所有しない（合意済み入力の反映に限定する）。

case-open command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}）。

## 入力

- case-open command から渡される要件doc（構造化 `draft-data` 形式、`agreed_items` / `artifact_actions` / `operation_units` / `realization_actions` / `review_dispositions` / `case_open_hints` / `auto_gate` / `conflict_resolutions`）

## 出力

- Root Case GitHub Issue。ラベル付き、対象 REQ 番号埋め込み、状態 open
- Definition Package（要件doc から生成し Root Case に関連付ける。構成は case-open / case-ready Design。）
- 設計PR（canonical Definition に実変更がある場合のみ。Case 単位で 1 件。）
- 完了報告（Root Case テンプレート）

## 副作用

- Root Case 作成、設計PR作成（Custom Tool `agentdev_gh` 経由。VERIFY は Tool 内部）
- 前提整備の commit（Root Case 作成前）: 入力 RU・要件doc draft・および当該要件定義に伴い生成された git 管理契約の状態記録（jev 観測等）に未追跡分がある場合、Root Case 作成に先立って明示パス指定で commit し git 管理状態へ置く（手順は references/root-case-and-definition-package.md「前提整備の commit（Root Case 作成前）」節。対応関係は repository top-level `traceability/` 配下 sidecar を参照）
- deviation capture 保存: 自工程で実観測した deviation を `agentdev-learning-capture` skill または `agentdev-intake-pipeline` へ委譲し、capture 境界 Design の Split Rule に従い `.agentdev/intake/` または `.agentdev/learning/` へ保存する。git 永続化は明示パス指定（並列実行安全ステージング）で行う
- 当該 Workflow Skill は worktree root 配下以外を編集しない（case-open command の worktree 隔離に従う）
- 行わない副作用: draft / RU 削除、Decision ファイルの status 変更、execution contract 確定と Standard / Epic 最終確定と Child Issue / Wave 作成

## 制御平面（STEP 一覧）

case-open workflow は次の6 STEP で構成する。
各 STEP は再開ポイント（resume point）を持つ（DEC-{N}、`<foundations/v4-durable-state-and-recovery>` Design）。
会話コンテキストに依存せず、永続状態（draft-data、Root Case Issue、設計PR）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 引き継ぎ判定 | 要件doc 受領 | 引き継ぎ停止判定完了（継続 / consumer 停止） | [references/handoff.md](references/handoff.md) |
| STEP-2 | Root Case 確立 | STEP-1 継続確定 + adversarial-review 完了（skip 含む）+ preflight 設定検証の実施と警告報告（GitHub Issue/PR 使用リポジトリ種別。設定理由では停止しない） | Root Case GitHub Issue 作成済み（対象 REQ 番号埋め込み、状態 open） | [references/root-case-and-definition-package.md](references/root-case-and-definition-package.md) |
| STEP-3 | Definition Package 生成 | Root Case 確立 | Definition Package 生成・Root Case 関連付け済み。REQ 行追加を伴う場合はトレーサビリティポリシー追随確認済み。既存行の意味変更を含む場合は design 対応事前確認（coverage --req 実査・欠落時 artifact_actions 組込み）実施済み | [references/root-case-and-definition-package.md](references/root-case-and-definition-package.md) |
| STEP-4 | 実変更判定と設計PR作成 | Definition Package 確定 | 実変更時: 設計PR作成済み（Case 単位 1 件。機械工程〔worktree 作成、REQ 行編集、generate_indexes、check_integrity、traceability check、明示パス指定 stage・commit〕は工程別 script `scripts/src/prepare_definition_pr.ts` 1 回の呼び出しで実行）。実変更なし: 作成しない | [references/definition-pr-and-idempotency.md](references/definition-pr-and-idempotency.md) |
| STEP-5 | 冪等再実行確認 | STEP-4 完了 | 既存 Root Case・既存設計PR再利用済み、重複生成なし、不足分のみ処理済み、横断依存検査実施済み（警告提示記録または検出不能報告） | [references/definition-pr-and-idempotency.md](references/definition-pr-and-idempotency.md) |
| STEP-6 | deviation capture・完了報告 | STEP-5 完了 | deviation 保存（Split Rule 分類）、完了報告出力 | [references/capture-and-completion.md](references/capture-and-completion.md) |

### STEP 間の依存と分岐

- **基本順序**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 → STEP-6
- **実変更なし分岐**: STEP-4 で canonical Definition との差分が空と判定した場合、設計PRを作成せず STEP-5 へ進む。空の PR を作成しない
- **冪等分岐**: 再実行時、既存 Root Case または既存設計PRを検出した場合はそれを再利用し、不足分だけを処理する。2件目の Root Case、2件目の設計PRを重複生成しない。STEP-5 の冪等検出（既存 Root Case・既存設計PR検出、横断依存検査の未クローズ Case 群取得）で issue_list を使用する場合、search トークンは検索対象を実効的に絞り込める選択性を持つ語（冪等キー語、REQ 番号、topic_slug 等）を用い、同一バッチ兄弟 Case 本文に頻出する相互参照トークン（兄弟 Case の RU 番号等）を単独の絞り込み根拠にしない（`agentdev-issue-management` の issue-operation-safety.md「issue_list の絞り込み規律と上限到達時 contingency」節の search トークン選択性指針参照）
- **adversarial-review 挿入**: Root Case 本文候補と Definition Package 構成案確定後、STEP-2 の Root Case 作成（最初の GitHub Issue 作成）の前に挿入する。詳細は [references/adversarial-review-integration.md](references/adversarial-review-integration.md)

### 再開プロトコル（resume protocol）

- 再開点は永続状態から再構成する: draft-data（`status`、`auto_gate`）、Root Case Issue の存在と状態、設計PRの存在と状態、capture 成果物
- 再実行時は冪等キー（case-open / case-ready Design）で既存 Root Case / 既存設計PRを検出し、会話コンテキストの記憶に依存せず再利用する

### 終了条件（termination）

- 正常終了: deviation capture・完了報告 STEP の完了報告出力まで
- 停止終了: 要件が曖昧で Root Case を確立できない場合、`auto_gate.auto_ready` が false、未解決質問、未解決衝突、repo 外操作、停止理由が残る場合、adversarial-review 由来の unresolved ユーザー判断事項、引き継ぎ停止（consumer リポジトリ）、canonical Definition との実変更判定不能。preflight 設定検証の「設定無効」・「設定照会不能」は区別した警告として報告され、当該設定理由だけでは停止しない（実操作の認証・権限等の成立を確認できない場合は既存の安全契約に従って停止する）

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する。

- `agentdev-issue-management`: Issue 操作の安全手続き、テンプレート充足、委譲接続点
- `agentdev-workflow-templates`: Issue/PR/コメントテンプレート選定（Issue 本文テンプレートは新形式〔目的・対象範囲・対象外・完了条件・進行状況〕。実行識別情報セクションは PR テンプレートのみ）
- `agentdev-workflow-lifecycle`: 引き継ぎ停止判定（runtime-package-boundary）、work_type 判定、ラベル付与
- Custom Tool `agentdev_gh`: GitHub I/O 境界（issue_create、pr_create、comment_create。VERIFY は Tool 内部）
- `agentdev-adversarial-review`: case-open の review 呼出
- `agentdev-learning-capture` / `agentdev-intake-pipeline`: deviation capture 委譲（STEP-6 で実観測時）
- `agentdev-git-worktree`: 並列実行安全ステージングプロシージャ（capture 成果物の git 永続化）
- `agentdev-project-extensions`: project extension 読込（5セクション、fail-open）
- 横断依存検査エンジン（本スキル配下 `scripts/src/inspect_cross_dependencies.ts`）: STEP-5 横断依存検査の機械的比較の単一実装。case-ready トレーサビリティ完全性ゲートも同一実装を共有する（比較手続きの重複実装禁止）

## トレーサビリティ能力の利用

case-open は、上流工程（req-define）で確定した対象要件を実行契約候補（realization_actions 等の Definition Package 構成要素）として Root Case へ引き継ぐ。

- req-define と重複して一般的な変更影響探索や依存関係探索を行い、対象範囲を再決定しない
- 対象要件行の設計根拠対応が未成立でも Root Case の確立を妨げない。設計根拠対応の成立判定（トレーサビリティ完全性ゲート）は case-ready が所有する
- 引き継ぎ情報に欠落があり実行契約候補の構成が不能な場合は、req-define へ差し戻す
- 実行契約候補（Definition Package 構成要素）の構成では、実装対象と未決事項との関係を意味的な依存関係に基づいて判断し、利用者の未決判断に依存する正式実装を当該判断が成立するまで保留として区別して記録する（不足している判断と対象範囲を明示）。未決事項の存在だけを理由に依存しない作業を実行契約候補から除外しない。利用者が明示的に許可した試作は、正式採用・正規成果物の確定・本番適用と区別して実行契約へ明示記録し、試作の実施、成果物の存在、試験の成功を当該候補の正式採用や未決事項の解決として扱わない。未決の設計候補について試作として実施するには利用者の明示的な指示または許可を要し、明示的な指示・許可がない試作を開始しない（明示的な指示・許可がない限り、当該部分は未決判断に依存する実装として保留する）。保留した判断の追跡は既存の未決事項管理（追跡Issue）を利用して接続し、新たな管理機構を設けない

## 共通制約

- **前提整備の commit（Root Case 作成前）**: 入力 RU・要件doc draft・および当該要件定義に伴い生成された git 管理契約の状態記録（jev 観測等）に未追跡分がある場合、Root Case 作成に先立って commit して git 管理状態へ置く。前提整備の commit は明示パス指定とし、スイープ操作（`.agentdev/` 全体の一括 add 等の無差別取り込み）を行わない。手順は references/root-case-and-definition-package.md「前提整備の commit（Root Case 作成前）」節
- **内蔵ツール使用規律**: ファイル検索・内容検索・ディレクトリ列挙は実行基盤の内蔵ツール（ファイル検索、内容検索、読み取り）を使用し、bash 内蔵コマンド（grep、ls 等）を標準手順としない。bash 実行が本来必要な処理（script 呼び出し、git 操作等）は本規律の対象外とする（workflow-skill-model Design「workflow skill 本文における内蔵ツール使用規律」節）
- **draft-data 入力**: 本スキルは構造化 `draft-data` を入力として読み取る。機能要件、非機能要件、制約、対象外、受け入れ条件は新規に作成せず合意済み入力を反映する。`conflict_resolutions` に記録済みの衝突は再確認しない
- **実行対象構成の採用根拠照合**: 実行対象構成（`operation_units`、`artifact_actions`、`realization_actions` から導出する Root Case・Definition Package・Case 構成）を確定する際も、正式な採用の根拠を、利用者の明示判断または有効な正規決定という既存の採用基準に照合して扱う。作業の継続指示、エージェントによる提案や具体化の存在、形式的に受理された採用指定を、利用者に留保された仕様判断の採用根拠として扱わない。明示採用された範囲を超えて関連する別候補や未決の設計事項を一括して確定せず、採用対象・内容・範囲が一意に解決できない部分は Root Case・Definition Package の確定対象から保留し、確認対象として報告する。根拠照合の不足による保留は、既存の停止終了経路（要件が曖昧で Root Case を確立できない場合）および req-define への差し戻し経路に接続する
- **Definition Package の非本文化**: Definition Package を独立した Issue 本文物項目として生成しない（Issue Execution Contract REQ「Definition Package を独立した Issue 本文物項目として生成しない」条項。case-open 実行契約 REQ）。Root Case への関連付けと所在は canonical 成果物関係（設計PR、case-ready の canonical 再取得経路）から相関する
- **Root Case 状態**: Root Case 確立後の状態は open とし、実装開始を許可しない。ready への遷移は case-ready が実行する。Definition Package 生成では合意済み入力の確定事項、未決事項、採用判断の区別を維持して実行契約候補へ引き継ぎ、未決事項を無断で解決済みにせず、採用判断を未採用へ変化させない（工程駆動経路の実装開始境界の前置であり、境界での照合は case-run STEP-S2 が case-ready 確定後の実行契約に対して行う）
- **設計PR**: canonical Definition に実変更がある場合のみ、Case 単位で 1 件の設計PRを作成する。実変更判定不能時は作成せず停止する。冪等キーは case-open / case-ready Design に従う
- **トレーサビリティポリシー追随確認**: REQ 行追加を伴う Definition Package 生成時は、トレーサビリティポリシー（検証対応を任意とする要件行の明示登録）更新の追随要否を工程上明示し、必要な policy エントリ追加を Definition Package の構成要素として含める。policy 編集は当該要件行の変更と同一の Definition 変更として扱い、設計PR経由以外の適用経路を取らない（対象要件行、STEP-3）
- **design 対応事前確認（STEP-2 / STEP-3）**: Definition Package の生成・転記は、対象要件行のうち既存行の意味変更を含む場合、`agentdev-traceability` の coverage --req による当該行の design 対応有無の事前確認を実施する。design 対応が欠落する意味変更行を検出した場合は、当該行の design 対応を artifact_actions（artifact: design）へ組込んだ上で合意を完了する。事前確認を省略した Case は case-ready の lifecycle gate completeness（fail-closed）で停止し得る（missing-design 0 件ゲートが増分ベース〔新規行のみ〕であることへの予防手順）。正規所有は case-open Design「意味変更行の design 対応事前確認」節、詳細手順は references/root-case-and-definition-package.md
- **Decision 非遷移**: 新規 Decision は proposed のままとし、accepted への状態遷移を実行しない
- **横断依存検査の警告非阻止**: STEP-5 の横断依存検査は警告の提示のみを行い、Root Case の確立を自動阻止しない。検出源の取得不能時は比較を省略せず検出不能として報告する。警告時の判断は投入者（HITL）への選択肢提示により行い、case-auto 配下では decision_context による親判断解決へ委譲する
- **実行識別情報の非記録（Issue 本文）**: Issue 本文には実行識別情報セクションを設けない（agentdev-workflow-templates Design「実行識別情報・検証差分のテンプレートセクション形式」節）。Case・実行単位・前工程確定事項は Definition Package・設計PR・canonical 成果物関係から相関でき、本文へ一覧化しない。実行識別情報セクションは PR テンプレートのみが持つ
- **Root Case タイトル**: Root Case の起票時のタイトル書式は `<workflows/issue-title-policy>` Design（Issue タイトル記述規則）を参照する（Root Case は Case 接頭辞書式。合意済みの対象・目的から主題を生成する）。本スキルは書式を複製しない
- **本文 verbatim**: Root Case 本文、PR 本文は Custom Tool `agentdev_gh` の操作引数としてそのまま渡す（文字コード・一時ファイルの実装詳細は Tool 内部）（`POL-gh-io-delegation`）

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<foundations/v4-durable-state-and-recovery>` Design**: STEP reference 構造、resume point
- **case-open / case-ready Design**: Definition Package 構成、設計PR lifecycle、冪等キー
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **case-open command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
- **case-ready command**: 後続コマンド（Definition 受入と実行準備完了。execution contract 確定と構成確定を所有）
