---
name: agentdev-workflow-case-ready
description: "case-ready workflow 本体。Definition PR 受入、canonical Definition 再取得、Decision 受理、execution contract と Standard/Epic 構造確定、traceability gate、ready 遷移、draft/RU 削除、冪等再実行を制御する。USE FOR: case-ready の工程制御。DO NOT USE FOR: 単独起動（case-auto 内部段階）、Root Case/Definition PR 作成（case-open）、実装（case-run）、PR 完了判定（case-close）。"
---

# case-ready workflow スキル

case-ready command の workflow 実装本体である。Definition 確定境界として、REQ / Decision / Design の保存実体は Capability Skill へ委譲する（保存手続きを実装しない）。Wave 構成の導出は実行上限の数値に依存しない。v5 有限実行モードでの設計確定独立終了は references/readiness-and-cleanup.md 参照（該当時のみ読む）。

case-ready command は公開 interface（入出力契約・ガードレール）と本スキルへの dispatch のみを持ち、本スキルが実装本体を提供する（責務3層分化の Decision）。

## 入力

- Root Case（Issue 番号または URL、状態 open）
- 関連する req_draft（存在する場合。draft-data の構造化項目一式）
- 設計PR / 設計修正PR（存在する場合）

## 出力

- ready 状態の Root Case
- 確定済み実行契約（Root Case 本文へ確定。独立章は生成しない）
- 実行構造（Standard: Root Case 自身。Epic: Child Issue と Wave / 依存構造）
- 完了報告（case-ready 完了報告テンプレート）

## 副作用

- 設計PR merge、Epic / 子 Issue 作成、Root Case 本文更新、コメント追加（`agentdev_gh` 経由。VERIFY は Tool 内部）
- Decision の proposed → accepted 遷移（委譲）、draft / RU の削除（成功時のみ。失敗・中断時は保持）
- deviation capture 保存: 実観測した deviation を委譲スキル経由で Split Rule に従い `.agentdev/intake/` または `.agentdev/learning/` へ保存（git 永続化は明示パス指定）
- 行わない副作用: Epic 実行構成表更新（単一書き手は case-close）、実装実行、完了条件チェックボックス評価

## 制御平面（STEP 一覧）

7 STEP 構成。STEP-1 は Root Case 受領を開始条件とし、以降は前 STEP 完了を開始条件とする。各 STEP は再開ポイントを持ち、会話コンテキストに依存せず永続状態から再開点を再構成する（`<foundations/durable-state-and-recovery>` Design）。

| STEP | 名称 | 結果 | reference |
|---|---|---|---|---|
| STEP-1 | 設計PR受入 | 自動 merge / 実変更なし継続 / HITL 停止 / CI 失敗停止 | [definition-acceptance](references/definition-acceptance.md) |
| STEP-2 | canonical 再取得 | canonical 再取得・検査機械実行（不正時は case-open へ差し戻し） | [definition-acceptance](references/definition-acceptance.md) |
| STEP-3 | Decision 受理評価 | accepted 遷移 / 受理不能停止 / 0 件継続 | [decision-acceptance](references/decision-acceptance.md) |
| STEP-4 | execution contract 確定 | Root Case 本文へ確定済み | [execution-contract](references/execution-contract.md) |
| STEP-5 | 実行構造確定 | Standard / Epic 確定。Epic 時は Child Issue / Wave 作成・構成検証合格 | [execution-structure](references/execution-structure.md) |
| STEP-6 | 検証ゲートと ready 遷移 | 完全性ゲート・QG-2。横断依存検査は ready 遷移判定を変更しない | [readiness-and-cleanup](references/readiness-and-cleanup.md) |
| STEP-7 | draft / RU 削除と同期確認 | 削除済み、main 同期確認済み | [readiness-and-cleanup](references/readiness-and-cleanup.md) |

### STEP 間の依存と分岐

- **差し戻し分岐（STEP-2）**: traceability check で missing-design または policy 不正を検出した場合は case-open へ差し戻し、ready へ遷移せず停止（完全性ゲートの所有は STEP-6 のまま）
- **実変更なし分岐（STEP-1）**: 設計PR不在時は現行 main を canonical Definition とし、空の設計PRを作成しない
- **HITL 分岐（STEP-1）**: 人間に留保された判断の新規確定または安全境界の操作承認を要する場合は停止し、既存 PR を保持してユーザー判断を求める（詳細は references/definition-acceptance.md）
- **CI 失敗分岐（STEP-1）**: CI / 品質検査失敗時は ready へ遷移せず、既存 PR を保持して停止（修復後に再実行）
- **Draft 状態分岐（STEP-1）**: merge 前に pr_read の isDraft を確認し、true は pr_merge を実行せず blocked 停止（復旧操作は存在しない）
- **Epic 分岐（STEP-5）**: Standard 確定時は Child Issue を作成しない
- **冪等分岐（全体）**: 再実行時、merge 済み Definition、既存 Child Issue、既存 Wave / 依存構造、Decision 受理記録を再利用し、不足分だけを処理する

### 再開プロトコル（resume protocol）

- 再開点は永続状態から再構成し、merge 済み設計PR検出後は merge を巻き戻さず、canonical Definition（merge 済み main の docs 永続文書）を基準として再開する
- 冪等キー（case-open / case-ready Design）で既存成果物を検出し再利用する

### 終了条件（termination）

- 正常終了: STEP-7 の完了報告出力まで
- 停止終了: 各分岐の停止条件（HITL・CI 失敗・Draft・差し戻し・受理不能 Decision・構成検証不合格・完全性ゲート不正残存・main 同期不一致）への到達（8原因区別へ対応させる）

## 主要 Capability Skill 連携

- `agentdev-req-file-manager` / `agentdev-decision-file-manager` / `agentdev-design-file-manager`（保存実体委譲先）、`agentdev-artifact-validation`（frontmatter id↔filename 整合等の公開検証契約）
- `agentdev-issue-management`（Issue 操作）、`agentdev-workflow-templates`（テンプレート選定）、`agentdev-workflow-lifecycle`（work_type・ラベル判定）、`agentdev-workflow-orchestration`（capture Split Rule）、`agentdev-traceability`（ゲート判定）、`agentdev-quality-gates`（QG-2 基準）
- `agentdev_gh`: GitHub I/O 境界（issue_read / issue_update / issue_create / pr_read / pr_merge / comment_create）
- `agentdev-learning-capture` / `agentdev-intake-pipeline`（capture 委譲）、`agentdev-git-worktree`（並列安全ステージング）、`agentdev-project-extensions`（共有領域解決、fail-open）
- 横断依存検査エンジン（case-open スキル配下）: 検証ゲート横断比較の単一実装を STEP-5 と共有（重複実装禁止）

## トレーサビリティ能力の利用

トレーサビリティ完全性ゲートで、対象要件行の Design 対応 1 件以上の存在とトレーサビリティポリシーの有効性を ready 遷移の必要条件として確認する。

- check で確認し、missing-design 残存行または verification policy 不正時は ready へ遷移させない
- required 行の verification 対応欠落（missing-verification）は本ゲートの ready 拒否条件に含めない（作成・更新は case-run、最終検査は case-close の QG-4）
- STEP-2 でも機械実行し、不正時は case-open へ差し戻す（0 件・不正残存時は ready へ遷移させず、停止理由と該当行一覧を報告）
- 問い合わせ結果は候補提供であり最終判断としない。機能不在・失敗・空結果時は README 索引等の代替探索で継続（fail-open）

## 重要変更の通知と結果説明

Decision 受理（STEP-3）と execution contract 確定（STEP-4）に正規成果物への重要変更が含まれる場合を識別する。識別は変更の意味と影響に基づく case-ready 自身の判断責務であり、変更ファイル数や変更行数のみから重要性を決定しない。

重要変更を識別した場合は、保存の実行より前に、変更する理由、想定される影響を実行出力へ通知し、通知を出力した事実を Root Case Issue のコメント（タイムスタンプ付き）へ記録する。キュー登録だけの状態や、変更確定後に初めてまとめて提示した状態を事前通知として扱わない。

通知と承認を区別し、合意と委任された裁量の範囲内の反映は通知後に追加承認なしで継続する。人間に留保された判断が必要な場合は通知しただけで承認済みと扱わず、既存の HITL 分岐に従う。未反映の重要変更は正規反映の前に、反映済みの内容は反映済みである事実を区別して通知する。完了報告には、確定した重要事項、事前の見込みと実績の違い、未完了事項を含める。

## 共通制約

- **内蔵ツール使用規律**: ファイル検索・内容検索・列挙は内蔵ツールを使用し、bash 内蔵コマンドを標準手順としない（script・git 等本来 bash が必要な処理は対象外）
- **機械工程の script 呼び出し**: 受入検査・overlap 突合・AUTOGEN 差分検出・traceability check・canonical 再取得 / draft-RU 削除は、script `scripts/src/accept_definition_checks.ts`（acceptance-checks / canonical-and-cleanup）で実行する。報告 JSON の意味レビューと I/O はモデルが担う
- **execution contract 投影と realization_actions**: 機能要件等は合意済み Definition を投影（新規作成しない）。realization_actions は実現方針・完了条件へ投影し、内部属性は転記しない。runtime-only 判断は case-run が担う
- **Standard / Epic 確定**: 連結成分・依存強度・Epic サイズ・機能的一貫性で自律生成し、単独根は Standard flow
- **Decision 受理の冪等**: 既に accepted の Decision に重複する状態遷移や承認記録を生成しない
- **本文 verbatim とファイル経由**: Root Case 本文・Issue 本文は `agentdev_gh` の操作引数としてそのまま渡し（`POL-gh-io-delegation`）、長文は一時ファイル経由で Markdown 行構造を保持する

## See Also

- **`<workflows/workflow-skill-model>` Design**: Workflow Skill 固有契約の正規所有者（タイトル書式は `<workflows/issue-title-policy>` Design 参照）
- **case-open / case-ready Design**: Definition Package、設計PR lifecycle、冪等キー、execution_unit 構成
- **case-open workflow スキル / case-run workflow スキル**: 前工程 / 後続工程
