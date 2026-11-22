---
name: agentdev-workflow-case-open
description: "case-open workflow 本体。Root Case と Definition Package を確立し、変更判定、Case ごとの設計PR、冪等再実行、横断依存検査、deviation capture を制御する。USE FOR: case-open の工程制御。DO NOT USE FOR: 単独起動（case-auto 内部段階）、execution contract、Standard/Epic と子Issue/Wave の確定、RU 削除、Decision 受理（case-ready の責務）。"
---

# case-open workflow スキル

case-open command の workflow 実装本体である。合意済み要件doc（構造化 `draft-data`）から Root Case 確立、Definition Package 生成と関連付け、実変更判定と設計PR作成、冪等再実行、deviation capture までを所有する。Root Case 確立は有限作業における Issue の必要時利用であり、要求・設計の正規情報を再所有しない（合意済み入力の反映に限定）。

**非対象**: execution contract の確定、Standard / Epic の最終確定、Child Issue / Wave の作成、RU 削除、proposed Decision の受理評価は行わない。
case-open command は公開 interface と本スキルへの dispatch のみを持ち、本スキルが実装本体を提供する（Command / Workflow Skill / Capability Skill 責務3層分化の Decision）。

## 入力

- case-open command から渡される要件doc（構造化 `draft-data` 形式、`agreed_items` / `artifact_actions` / `operation_units` / `realization_actions` / `review_dispositions` / `case_open_hints` / `auto_gate` / `conflict_resolutions`。`conflict_resolutions` 記録済みの衝突は再確認しない）

## 出力

- Root Case GitHub Issue（ラベル付き、対象 REQ 番号埋め込み、open）
- Definition Package（要件doc から生成し Root Case に関連付け。構成は case-open / case-ready Design）
- 設計PR（実変更時のみ。Case 単位 1 件）
- 完了報告（Root Case テンプレート）

## 副作用

- Root Case 作成、設計PR作成（Custom Tool `agentdev_gh` 経由。VERIFY は Tool 内部）
- 前提整備の commit（Root Case 作成前）: 未追跡分は明示パス指定で commit（スイープ禁止）。手順は references/root-case-and-definition-package.md（sidecar 対応関係は top-level `traceability/` 配下）
- deviation capture 保存: 実観測した deviation を `agentdev-learning-capture` / `agentdev-intake-pipeline` へ委譲し、Split Rule に従い `.agentdev/intake/` または `.agentdev/learning/` へ保存（git 永続化は明示パス指定）
- worktree root 配下以外を編集しない（case-open command の worktree 隔離に従う）

## 制御平面（STEP 一覧）

6 STEP 構成。各 STEP は再開ポイント（resume point）を持ち、会話コンテキストに依存せず永続状態から再開点を再構成する（STEP resume point と会話記憶非依存の Decision、`<foundations/durable-state-and-recovery>` Design）。

| STEP | 名称 | 開始条件 | 結果 | reference |
|---|---|---|---|---|
| STEP-1 | 引き継ぎ判定 | 要件doc 受領 | 引き継ぎ停止判定完了（継続 / consumer 停止） | [handoff](references/handoff.md) |
| STEP-2 | Root Case 確立 | STEP-1 継続確定 + adversarial-review 完了（skip 含む）+ preflight 設定検証の実施と警告報告 | Root Case Issue 作成済み | [root-case-and-definition-package](references/root-case-and-definition-package.md) |
| STEP-3 | Definition Package 生成 | Root Case 確立 | 生成・関連付け済み。REQ 行追加時は policy 追随確認、既存行の意味変更時は design 対応事前確認済み | [root-case-and-definition-package](references/root-case-and-definition-package.md) |
| STEP-4 | 実変更判定と設計PR作成 | Definition Package 確定 | 実変更時: 設計PR作成済み（機械工程は `scripts/src/prepare_definition_pr.ts` 1 呼出）。実変更なし: 作成しない | [definition-pr-and-idempotency](references/definition-pr-and-idempotency.md) |
| STEP-5 | 冪等再実行確認 | STEP-4 完了 | 既存再利用・重複なし。横断依存検査と警告提示記録（検出不能時は報告） | [definition-pr-and-idempotency](references/definition-pr-and-idempotency.md) |
| STEP-6 | deviation capture・完了報告 | STEP-5 完了 | deviation 保存（Split Rule 分類）、完了報告出力 | [capture-and-completion](references/capture-and-completion.md) |

### STEP 間の依存と分岐

- **基本順序**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 → STEP-6
- **実変更なし分岐**: STEP-4 で差分が空の場合、設計PRを作成せず STEP-5 へ進む。空の PR を作成しない
- **冪等分岐**: 既存 Root Case / 既存設計PRは再利用し不足分だけ処理（2件目を重複生成しない）。issue_list search トークン選択性の規律は上記 reference「issue_list の絞り込み規律」節（該当時のみ読む）
- **adversarial-review 挿入**: Root Case 本文候補と Definition Package 構成案確定後、STEP-2 の最初の GitHub Issue 作成前に挿入。詳細は [adversarial-review-integration](references/adversarial-review-integration.md)

### 再開プロトコル（resume protocol）

- 再開点は永続状態（draft-data、Root Case Issue、設計PR、capture 成果物）から再構成し、再実行時は冪等キー（case-open / case-ready Design）で既存を検出して再利用する

### 終了条件（termination）

- 正常終了: STEP-6 の完了報告出力まで
- 停止終了: 要件が曖昧で Root Case を確立できない、`auto_gate.auto_ready` が false、未解決質問、未解決衝突、repo 外操作、停止理由が残る、adversarial-review 由来の unresolved ユーザー判断事項、引き継ぎ停止（consumer）、実変更判定不能。preflight の「設定無効」・「設定照会不能」は区別した警告として報告され、当該設定理由だけでは停止しない（実操作の認証・権限が確認できない場合は既存の安全契約に従い停止）

## 主要 Capability Skill 連携

- `agentdev-issue-management`（Issue 操作安全手続き）、`agentdev-workflow-templates`（テンプレート選定）、`agentdev-workflow-lifecycle`（引き継ぎ停止判定・work_type・ラベル付与）
- Custom Tool `agentdev_gh`: GitHub I/O 境界（issue_create、pr_create、comment_create）
- `agentdev-adversarial-review`（review 呼出）、`agentdev-learning-capture` / `agentdev-intake-pipeline`（deviation capture 委譲）、`agentdev-git-worktree`（並列実行安全ステージング）、`agentdev-project-extensions`（extension 読込、fail-open）
- 横断依存検査エンジン（`scripts/src/inspect_cross_dependencies.ts`）: STEP-5 比較の単一実装。case-ready 完全性ゲートも同一実装を共有（重複実装禁止）
- 検証用一時資材の後片付け責任: 配置規則と権限に従い作成・利用し、終了時に安全条件が成立する範囲で回収し、結果・根拠・未処理事項を作業記録経路へ返す（詳細は references/traceability-and-open-dependency.md。該当時のみ読む）

## トレーサビリティ能力の利用

- 対象要件行の設計根拠対応が未成立でも Root Case の確立を妨げない。設計根拠対応の成立判定（トレーサビリティ完全性ゲート）は case-ready が所有する
- 探索非重複、構成不能時の req-define 差し戻し、未決依存の保留と試作の区別は references/traceability-and-open-dependency.md を参照（該当時のみ読む）

## 共通制約

- **内蔵ツール使用規律**: ファイル検索・内容検索・列挙は内蔵ツールを使用し、bash 内蔵コマンドを標準手順としない（script・git 等の本来 bash が必要な処理は対象外。workflow-skill-model Design）
- **実行対象構成の採用根拠照合**: 正式な採用の根拠は利用者の明示判断または有効な正規決定に限り、範囲を超える一括確定を行わない。詳細は references/traceability-and-open-dependency.md「実行対象構成の採用根拠照合」節（該当時のみ読む）
- **Definition Package の非本文化**: Definition Package を独立した Issue 本文物項目として生成しない。所在は設計PR・case-ready の canonical 再取得経路から相関する
- **Root Case 状態**: 確立後は open とし、実装開始を許可しない（ready 遷移は case-ready）。生成では確定・未決・採用判断の区別を維持し、未決の無断解決・採用判断の変化をしない（境界での照合は case-run STEP-S2）
- **トレーサビリティポリシー追随確認**: REQ 行追加時は policy 追随要否を工程上明示し、必要な policy エントリ追加を Definition Package 構成要素に含める。policy 編集は当該要件行の変更と同一の Definition 変更として扱い、設計PR経由のみ
- **design 対応事前確認（STEP-2 / STEP-3）**: 既存行の意味変更時は coverage --req で design 対応有無を事前確認し、欠落行の design 対応を artifact_actions（artifact: design）へ組込む（省略時は case-ready lifecycle gate completeness で停止し得る。詳細は上記 reference）
- **Decision 非遷移**: 新規 Decision は proposed のまま（accepted へ遷移しない）
- **横断依存検査の警告非阻止**: STEP-5 検査は警告提示のみで Root Case 確立を自動阻止しない。取得不能時は省略せず検出不能として報告（警告時の判断は投入者への選択肢提示、case-auto 配下では decision_context による親判断解決へ委譲）
- **実行識別情報の非記録（Issue 本文）**: Issue 本文に実行識別情報セクションを設けない（PR テンプレートのみが持つ。agentdev-workflow-templates Design）
- **Root Case タイトル**: タイトル書式は `<workflows/issue-title-policy>` Design を参照（Case 接頭辞書式）
- **本文 verbatim**: Root Case 本文、PR 本文は Custom Tool `agentdev_gh` の操作引数としてそのまま渡す（`POL-gh-io-delegation`）

## See Also

- **case-open / case-ready Design**: Definition Package 構成、設計PR lifecycle、冪等キー
- **case-open command / case-ready command**: 呼出元と後続（execution contract 確定を所有）
