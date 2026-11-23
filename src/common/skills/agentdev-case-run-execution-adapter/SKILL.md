---
name: agentdev-case-run-execution-adapter
description: "case-run external execution adapter. USE FOR: connecting case-run issue execution to 実行担当サブエージェント via adapter skill delegation, handling completed-pr/blocked/failed/delegation-unavailable results. DO NOT USE FOR: workflow state management, Issue completion checkbox evaluation."
---

# case-run 外部実行アダプター（External Execution Adapter）

case-run が1 Issue 単位の実装作業を実行担当サブエージェントへ接続する際のアダプタープロトコルを定義する。委譲起動に基づき、詳細は references/ へ分離し遅延読み込みする。Epic/Wave orchestration、worktree 管理、完了条件チェックボックス評価は対象外。

## 入力/出力/副作用と実行モデル

**入力**: case-run から引き渡される worktree root（相対パス）、ブランチ名、対象 Issue 番号、実行 command 指定。**出力**: result 契約の4状態いずれか（`completed-pr` は PR番号/ PR URL を伴う）。**副作用**: worktree root 配下でのみファイル編集。PR 作成・Issue コメント追加は実行担当が Custom Tool `agentdev_gh` 経由で実施。

case-run 本体は単一 Issue で実行担当サブエージェントを委譲起動し（委譲1件、Epic・Wave の実行制御は case-auto orchestration stage 3 が単一所有）、result を処理する。実装実行は行わない。実行担当サブエージェント（外部実行基盤〔AGENTS.md で選定〕のエージェント型、1 Issue あたり1起動、再解釈・再設計しないアダプター）は委譲 prompt 内で実行 command（harness 提供。success criteria へ分解・observable evidence 要求・品質ゲート実行）を起動する。外部実行基盤は I/O 境界 Design 正規所有で、中間成果物に依存せず PR URL で受領する（透明）。起動手段・用語境界・正規所有者は references/harness-delegation.md・references/execution-boundary-terms.md 参照（用語 SSoT: delegation-contracts Design「case 実行責務の 4 用語と委譲」）。

## 実行担当サブエージェントの責務

1. **Issue 読込と context 再確認**: Issue 本文・受け入れ基準を読み込み（実行 command が success criteria に分解）、Decision/ REQ/ Design/ docs/ repository context を再確認して矛盾を排除（詳細は references/execution-procedure-details.md 参照）
2. **実装、検証、PR 作成**: 実行 command に従い evidence-backed に実装し、品質ゲートを通して `agentdev_gh` の pr_create で PR を作成する
   - 対応宣言（実装・検証対応を sidecar または inline で明示、変更ファイル理由の自動対応付け禁止）等の詳細は references/execution-procedure-details.md 参照
   - PR 本文に実行識別情報セクションと検証差分セクション（5分類: 新規、修正済み、既出、撤回、無効）を記録する。形式は `agentdev-workflow-templates` の実行識別情報セクション規約・検証差分セクション規約に従い、各検証ごとに実行工程 case-run の行として記録する
   - PR 作成前に `agentdev-traceability` の check で対象要件を9検出項目（findings 種別）で検査する: `malformed-declarations`、`unknown-roles`、`unknown-req-refs`、`invalid-artifact-paths`、`missing-design`、`missing-implementation`、`missing-verification`、`policy-invalid`、`duplicate-inconsistencies`。Decision 対応の欠落は検出対象に含めない。対象範囲内なら修正して再検証し、それ以外が必要なら blocked で報告する
   - plan artifact 等の中間成果物は解釈せず PR URL で受領する。tsconfig 系（tsconfig*.json）変更検出時は意図した変更とコンパイラによるメタデータ書き戻しの区別を確認する警告として扱う（自動破棄しない）
   - 実装完了後、テスト戦略セクションの各項目（verification / pass_criteria / on_failure）を全項目処理まで反復: `verification` で検証し `pass_criteria` を確認、不合格時は `on_failure` に従い **fix-and-reverify**（合格まで反復）または **record-in-findings**（対応困難なら不合格理由とともに PR 本文の `## Findings / Capture候補` へ記録）
3. **blocker 処理と result 返却**: 回答可能な blocker は実行 command 内で再評価でき、result 契約に従い case-run へ返却する

## 報告契約（記録契機向け）と background 委譲の回復

取りまとめ（case-run）の記録反映用の報告で、記録反映自体は実行担当の責務外。報告要素は事実・結果、停止（再開条件を含む）、判断変更の影響対象。重要変更は判明時点で内容と影響とともに報告し、利用者に留保された判断が必要なら `blocked` で報告する。result 確定を待たない途中報告ができ、result の確定値は代替せず確定時に必ず返却する。本報告契約は result 4状態を追加・変更しない。background 委譲の起動消失時は durable state（worktree の git status・commit、PR の存在、Issue コメント）で帰属確認して回復する。詳細（委譲起動と実着手の区別、一時資材の回収・引継ぎ、docs-chore 委譲の参照追随）は references/recovery-and-step-model.md・references/execution-procedure-details.md 参照。

## Result 契約と3点ゲート

実行担当は `completed-pr`（実装完了、PR作成済み。**PR番号**を伴う。case-run の成功成果は PR 作成）、`blocked`（回答可能な blocker。詳細本文は **Issue コメント** に SSoT 記録）、`failed`（repository context で回答不能な blocker。詳細本文は **Issue コメント** に構造化記録）、`delegation-unavailable`（委譲起動不能。実行未試行のため `pending` に戻し case-run を停止）のいずれか1状態を返す。SSoT: 成功は **PR 本文**、blocked/ failed は **Issue コメント**。一時コンテキスト、ローカル変数、中間ファイルは SSoT としない。

case-run は4状態 result と状態別必須欄を検査する（`completed-pr`: commit hash、PR URL。停止: 理由と再開情報〔SSoT 記録先含む〕）。停止に PR URL・commit hash は不要。必須欄欠落の応答を `completed-pr` として扱わない。実装・検証の要約は3点検査の通過を代替しない。不足時は再開して欠落情報を求める。PR も carrier commit もない verify-only closure は SSoT コメントで判定し、不足扱いにしない。起動手段とインライン代替は references/harness-delegation.md、異常終了時は references/recovery-and-step-model.md を参照。

### 最終返却本文のサマリ上限（八項目・3〜4 KB・詳細退避）

case-run への最終返却本文（result の報告本文）は、ステータス（報告用 `completed` / `blocked` / `failed`）、副作用有無を含む判定要約、変更ファイルパス一覧、コミット SHA、Issue/PR 番号、テスト結果の pass/fail 件数、未達事項/ブロッカー、詳細成果物パスの八項目で構成し、UTF-8 本文の上限目安を 3〜4 KB 以内とする。該当のない項目はその旨を記し、未確認の結果を成功に置換しない。長大な詳細は退避し、返却本文には退避先のパス/URL 参照のみを含める。報告用ステータスは4状態を変更せず、サマリの `completed` から PR 完了やゲート合格を導出しない。`delegation-unavailable` は実行未試行のため実行担当のサマリ返却対象外。雛形と詳細は references/harness-delegation.md「返却サマリ雛形」を参照。

## 責務境界と worktree 隔離

workflow state 管理は case-run、Epic orchestration は case-auto/ case-run、チェックボックスの評価・更新と最終完了判定は case-close、req-define のアーキテクチャ確認は `agentdev-architecture-advisory` の責務。実行担当サブエージェント、外部実行基盤はチェックボックスを更新しない（case-close が別コンテキストで評価する）。実行担当サブエージェントは引き渡された worktree root（`.worktrees/{N}-{type}/` 相対パス）配下でのみ作業しメインリポジトリ等では編集しない。作業検知時は直ちに停止し `failed` を返却、詳細は Issue コメントに SSoT 記録。実装開始前に `agentdev-git-worktree` の検証ヘルパー（`worktree-operations.md`「worktree 内判定ヘルパー」参照）で自己検証し、メインリポジトリと判定された場合は開始せず `failed` を返却する。

## 配置契約と STEP model 連携、委譲抽象IF

- Findings/ Capture 候補は PR 本文の `## Findings / Capture候補` に記述する（capture 境界は `agentdev-workflow-orchestration` 参照）。`.agentdev/backlog/intake/`、`.agentdev/backlog/learning/` を直接変更しない
- Design レベルの詳細（schema、enum、判定表等）は PR 本文の `## Design確定候補` に記録する（`## Findings / Capture候補` とは別セクション）。case-close STEP-3 の入力
- 本スキルは case-run Workflow Skill の `execute` STEP から委譲起動され、委譲契約で接合する（STEP を所有しない。詳細は references/recovery-and-step-model.md 参照）。**委譲抽象IF**: 起動手段、実行制御パラメータ、具体実装と委譲起動失敗・異常終了時事後処理は AGENTS.md および references/harness-delegation.md 参照。実行計画方向性は参考情報。内蔵ツール規律は references/execution-procedure-details.md 参照

## adversarial-review 統合（case-run: adapter 委譲内）

実装方針形成、review 呼出、結果反映、blocked 遷移の実行時参照。正規原本は `agentdev-case-run-execution-adapter` Design「adversarial-review 統合（実装方針→review→結果反映）」節、実行手続の正本は references/adversarial-review-integration.md（本 SKILL.md は重複定義しない）。要点（正は Design と reference）: 最初の実装変更前に実施し、既確定文書を実現する内部選択として実装方針を形成（case-run 本体は形成しない、発動条件判定〔ユーザー明示指定〕と review 呼出は分離）。既確定文書の変更・追加・撤回が必要な場合、要件・仕様問題検出時、unresolved な争点が残る場合は blocked へ遷移（勝手に仕様変更しない）。非該当時・呼出失敗時は silent skip せず従来フローを維持し、accepted finding の反映は実行担当の責務（再発動は意味内容変更時のみ、同一 finding 再起票禁止）。副作用境界は `semantic_review`（書き込み禁止型）、新規 artifact 非生成。

## See Also

- **agentdev-workflow-orchestration**: サブエージェントプロトコル、capture 境界
- **Design `delegation-contracts.md`**: 委譲契約横断 Design
