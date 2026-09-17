---
name: agentdev-workflow-case-open
description: "case-open command の workflow 実装本体。合意済み要件doc からの Root Case 確立、Definition Package 生成と Root Case 関連付け、実変更判定と Definition PR 作成（実変更時のみ、Case 単位 1 件）、冪等再実行（既存 Root Case / 既存 Definition PR の再利用、不足分のみ処理）、STEP-5 横断依存検査（draft の artifact_actions と未クローズ Case 群の機械的比較、同一パス重複時の警告提示）、deviation capture（Split Rule 分類）を所有する。USE FOR: case-open 実行時の workflow 制御（Root Case 確立・Definition Package 生成・実変更判定と Definition PR 作成・冪等再実行・横断依存検査・deviation capture）。DO NOT USE FOR: 単独起動（対応する /agentdev/* コマンド経由で利用すること）、execution contract 確定・Standard / Epic 最終確定・Child Issue / Wave 作成・RU 削除・proposed Decision 受理評価（case-ready 側の責務）。"
---

<!-- ADF-COVERS(implementation): REQ-030-001, REQ-030-002, REQ-030-003, REQ-030-004, REQ-030-005, REQ-030-006, REQ-030-007, REQ-030-008, REQ-030-009, REQ-030-010, REQ-030-011, REQ-030-012, REQ-030-013, REQ-030-014, REQ-030-015, REQ-021-024, REQ-083-003 -->

# case-open workflow スキル

case-open command の workflow 実装本体である。
合意済み要件doc（構造化 `draft-data`）から Root Case 確立、Definition Package 生成と Root Case 関連付け、実変更判定と Definition PR 作成、冪等再実行、deviation captureまでの制御構造を所有する。
execution contract の確定、Standard / Epic の最終確定、Child Issue / Wave の作成、RU 削除、proposed Decision の受理評価は行わない（case-ready 実行契約 REQ へ移管）。

case-open command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが workflow 実装本体を提供する（DEC-{N}、REQ-{NNNN}-{NNN}）。

## 入力

- case-open command から渡される要件doc（構造化 `draft-data` 形式、`agreed_items` / `artifact_actions` / `operation_units` / `realization_actions` / `review_dispositions` / `case_open_hints` / `auto_gate` / `conflict_resolutions`）

## 出力

- Root Case GitHub Issue。ラベル付き、対象 REQ 番号埋め込み、状態 open
- Definition Package（要件doc から生成し Root Case に関連付ける。構成は definition-readiness Design。）
- Definition PR（canonical Definition に実変更がある場合のみ。Case 単位で 1 件。）
- 完了報告（Root Case テンプレート）

## 副作用

- Root Case 作成、Definition PR 作成（Custom Tool `agentdev_gh` 経由。VERIFY は Tool 内部）
- deviation capture 保存: 自工程で実観測した deviation を `agentdev-learning-capture` skill または `agentdev-intake-pipeline` へ委譲し、capture 境界 Design の Split Rule に従い `.agentdev/intake/` または `.agentdev/learning/` へ保存する。git 永続化は明示パス指定（並列実行安全ステージング）で行う
- 当該 Workflow Skill は worktree root 配下以外を編集しない（case-open command の worktree 隔離に従う）
- 行わない副作用: draft / RU 削除、Decision ファイルの status 変更、execution contract 確定と Standard / Epic 最終確定と Child Issue / Wave 作成

## 制御平面（STEP 一覧）

case-open workflow は次の6 STEP で構成する。
各 STEP は再開ポイント（resume point）を持つ（DEC-{N}、`<workflows/step-reference-contract>` Design）。
会話コンテキストに依存せず、永続状態（draft-data、Root Case Issue、Definition PR）から再開点を再構成する。

| STEP | 名称 | 開始条件 | 結果 | 詳細 reference |
|---|---|---|---|---|
| STEP-1 | 引き継ぎ判定 | 要件doc 受領 | 引き継ぎ停止判定完了（継続 / consumer 停止） | [references/handoff.md](references/handoff.md) |
| STEP-2 | Root Case 確立 | STEP-1 継続確定 + adversarial-review 完了（skip 含む） | Root Case GitHub Issue 作成済み（対象 REQ 番号埋め込み、状態 open） | [references/root-case-and-definition-package.md](references/root-case-and-definition-package.md) |
| STEP-3 | Definition Package 生成 | Root Case 確立 | Definition Package 生成・Root Case 関連付け済み。REQ 行追加を伴う場合はトレーサビリティポリシー追随確認済み | [references/root-case-and-definition-package.md](references/root-case-and-definition-package.md) |
| STEP-4 | 実変更判定と Definition PR 作成 | Definition Package 確定 | 実変更時: Definition PR 作成済み（Case 単位 1 件）。実変更なし: 作成しない | [references/definition-pr-and-idempotency.md](references/definition-pr-and-idempotency.md) |
| STEP-5 | 冪等再実行確認 | STEP-4 完了 | 既存 Root Case・既存 Definition PR 再利用済み、重複生成なし、不足分のみ処理済み、横断依存検査実施済み（警告提示記録または検出不能報告） | [references/definition-pr-and-idempotency.md](references/definition-pr-and-idempotency.md) |
| STEP-6 | deviation capture・完了報告 | STEP-5 完了 | deviation 保存（Split Rule 分類）、完了報告出力 | [references/capture-and-completion.md](references/capture-and-completion.md) |

### STEP 間の依存と分岐

- **基本順序**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 → STEP-6
- **実変更なし分岐**: STEP-4 で canonical Definition との差分が空と判定した場合、Definition PR を作成せず STEP-5 へ進む。空の PR を作成しない
- **冪等分岐**: 再実行時、既存 Root Case または既存 Definition PR を検出した場合はそれを再利用し、不足分だけを処理する。2件目の Root Case、2件目の Definition PR を重複生成しない
- **adversarial-review 挿入**: Root Case 本文候補と Definition Package 構成案確定後、STEP-2 の Root Case 作成（最初の GitHub Issue 作成）の前に挿入する。詳細は [references/adversarial-review-integration.md](references/adversarial-review-integration.md)

### 再開プロトコル（resume protocol）

- 再開点は永続状態から再構成する: draft-data（`status`、`auto_gate`）、Root Case Issue の存在と状態、Definition PR の存在と状態、capture 成果物
- 再実行時は冪等キー（definition-readiness Design）で既存 Root Case / 既存 Definition PR を検出し、会話コンテキストの記憶に依存せず再利用する

### 終了条件（termination）

- 正常終了: deviation capture・完了報告 STEP の完了報告出力まで
- 停止終了: 要件が曖昧で Root Case を確立できない場合、`auto_gate.auto_ready` が false、未解決質問、未解決衝突、repo 外操作、停止理由が残る場合、adversarial-review 由来の unresolved ユーザー判断事項、引き継ぎ停止（consumer リポジトリ）、canonical Definition との実変更判定不能

## 主要 Capability Skill 連携

本スキルは次の Capability Skill を名レベルで参照する。

- `agentdev-issue-management`: Issue 操作の安全手続き、テンプレート充足、委譲接続点
- `agentdev-workflow-templates`: Issue/PR/コメントテンプレート選定、実行識別情報セクション形式、レビュー判断セクション形式
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
- 対象要件行に Design 対応が未成立でも Root Case の確立を妨げない。Design 対応の成立判定（トレーサビリティ完全性ゲート）は case-ready が所有する
- 引き継ぎ情報に欠落があり実行契約候補の構成が不能な場合は、req-define へ差し戻す

## 共通制約

- **draft-data 入力**: 本スキルは構造化 `draft-data` を入力として読み取る。機能要件、非機能要件、制約、対象外、受け入れ条件は新規に作成せず合意済み入力を反映する。`conflict_resolutions` に記録済みの衝突は再確認しない
- **Root Case 状態**: Root Case 確立後の状態は open とし、実装開始を許可しない。ready への遷移は case-ready が実行する
- **Definition PR**: canonical Definition に実変更がある場合のみ、Case 単位で 1 件の Definition PR を作成する。実変更判定不能時は作成せず停止する。冪等キーは definition-readiness Design に従う
- **トレーサビリティポリシー追随確認**: REQ 行追加を伴う Definition Package 生成時は、トレーサビリティポリシー（検証対応を任意とする要件行の明示登録）更新の追随要否を工程上明示し、必要な policy エントリ追加を Definition Package の構成要素として含める。policy 編集は当該要件行の変更と同一の Definition 変更として扱い、Definition PR 経由以外の適用経路を取らない（対象要件行、STEP-3）
- **Decision 非遷移**: 新規 Decision は proposed のままとし、accepted への状態遷移を実行しない
- **横断依存検査の警告非阻止**: STEP-5 の横断依存検査は警告の提示のみを行い、Root Case の確立を自動阻止しない。検出源の取得不能時は比較を省略せず検出不能として報告する。警告時の判断は投入者（HITL）への選択肢提示により行い、case-auto 配下では decision_context による親判断解決へ委譲する
- **実行識別情報の記録**: Root Case 本文に実行識別情報セクション（対象 Case、実行単位、前工程で確定した事項）を構造化形式で記録する。形式は `agentdev-workflow-templates` の実行識別情報セクション規約に従う。機械的解析は同セクションの key-value 行を正とし、自由文中の ID に依存しない。識別情報の一部が取得不能でも停止せず「N/A」を記録する。作成時点で番号が確定しない自己参照値は Issue 作成後に埋め戻す。既存 Issue への遡及適用は行わない
- **本文 verbatim**: Root Case 本文、PR 本文は Custom Tool `agentdev_gh` の操作引数としてそのまま渡す（文字コード・一時ファイルの実装詳細は Tool 内部）（`POL-gh-io-delegation`）

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者
- **`<workflows/step-reference-contract>` Design**: STEP reference 構造、resume point
- **`<workflows/definition-readiness>` Design**: Definition Package 構成、Definition PR lifecycle、冪等キー
- **`docs/decisions/DEC-{N}.md`**: Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則
- **`docs/decisions/DEC-{N}.md`**: STEP resume point と会話記憶非依存
- **case-open command**: 本スキルの呼出元（公開 interface・ガードレール・dispatch を所有）
- **case-ready command**: 後続コマンド（Definition 受入と実行準備完了。execution contract 確定と構成確定を所有）
