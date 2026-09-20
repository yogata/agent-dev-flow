---
name: agentdev-workflow-lifecycle
description: Development workflow phase definitions, SSoT transitions, work_type classification, scale assessment, command mappings, and docs structure for the agentdev command pipeline. USE FOR: determining workflow phases, work_type classification and scale assessment, resolving command dependencies, understanding docs/ directory layout. DO NOT USE FOR: specific command execution logic, requirement analysis, compliance checking.
---

# AgentDevFlow ライフサイクルスキル

agentdev系コマンドのフェーズ定義、SSoT遷移、work_type 判定基準、コマンド関連を提供する。

## 対象コマンド

全 agentdev コマンドの一覧、入出力リファレンスは command README（`commands/agentdev/README.md`）を参照。
本 skill は全 agentdev コマンドからフェーズ定義、work_type 判定基準の参照元として使用される。

## STEP model 連携（REQ-{NNNN}-{NNN}、DEC-{N}）

本スキルは Workflow Skill として宣言的定義（ライフサイクル判定、work_type 判定、scale 判定、SSoT 遷移、上位への引き継ぎ判定）を提供する。
本スキル自身は workflow STEP を所有せず、各 command の Workflow Skill が所有する STEP から参照される（`<workflows/workflow-skill-model>` Design）。

### 宣言的定義と Input Resolution

本スキルが提供する宣言的定義は、各 STEP の Input Resolution において永続状態の優先順位の最上位（SSoT 再構成）に位置する。
優先順位の詳細は `<foundations/v4-durable-state-and-recovery>` Design 参照。

| 宣言的定義 | SSoT 配置 | 利用 STEP |
|---|---|---|
| work_type 判定基準 | 本スキル + `<workflows/v4-standard-lifecycle>` Design「work_type / scale / Epic / Wave の v4 意味モデル」節 | case-open / case-run `prepare` STEP |
| scale 判定基準 | 本スキル | req-define / case-open `prepare` STEP |
| SSoT 遷移定義 | 本スキル | 全 workflow の STEP transition |
| 上位への引き継ぎ判定 | 本スキル（`references/upstream-handoff.md`） | 全 workflow の `prepare` STEP |
| 工程間構造化文脈引き継ぎ | 本スキル（`references/structured-stage-handoff.md`） | 全 workflow の STEP transition、完了報告 |
| 参照先解決ポリシー（source / projection 目的判別） | 本スキル（`references/reference-resolution.md`） | 全 workflow の canonical_references 生成・消費、配布物参照の読み取り先解決 |

STEP reference 8 要素、STEP 識別子、永続状態復元契約は `<foundations/v4-durable-state-and-recovery>` Design に従う。
compaction 後の current STEP 復元、ToDo 使用、compaction 検出の実処理は harness 固有（AGENTS.md、harness reference）。

## work_type とコマンド経路

work_type は工程分岐の参照軸である。
全 work_type が GitHub Issue と PR を経由する標準経路をとる。
Issue/PR をスキップする直接完了経路は存在しない。

workflow_route（direct_case 等）は work_type 固定分類ではなく、Definition 構成（artifact_actions の有無等）から導出される値である。
`direct_case` は Definition 保存工程を別入口で実行しないことを指し、Issue/PR を経由しないことを指さない。
導出表の正は `<foundations/design-principles>` Design「実行経路の導出（Definition 構成一次）」節であり、`<workflows/v4-standard-lifecycle>` Design「work_type / scale / Epic / Wave の v4 意味モデル」節に整合する。

### 経路一覧

実行経路の一次表現は Definition 構成（artifact_actions の有無等）である。work_type と scale は Definition 構成決定の入力情報であり、経路を直接決定しない。

| Definition 構成（artifact_actions の有無等） | 導出結果ラベル（workflow_route） | 実行経路（内部 lifecycle 段階） | 典型的な work_type / scale |
|---|---|---|---|
| REQ 保存なし・Definition PR なし（Issue 本文で要件管理） | direct_case | req-define → case-open → case-run → case-close | bugfix、maintenance、docs_chore 等 |
| REQ 保存あり・Definition PR あり・Epic 構成なし | req_backed_case | req-define → case-open → case-ready → case-run → case-close | feature standard 等・Epic 構成なしの REQ 保存構成 |
| REQ 保存あり・Epic 構成あり | epic_case | req-define → case-open → case-ready → case-run → case-close（OU/ 子Issue 構成） | feature large・大規模 bugfix・maintenance 等 |

req-define は公開コマンド（`/agentdev/req-define`）である。case-* は内部 lifecycle 段階であり、起動入口は標準実行コマンド `/agentdev/case-auto` である。
一覧は command README 参照。

`artifact_actions` の Definition action は req_draft から case-ready に渡して動的適用する。
該当 entry がない場合も case-ready で Definition readiness を確定する。
Epic 構成の OU/ 子Issue 構成は `agentdev-workflow-orchestration` 参照。

### docs_chore 経路の要素

docs_chore は bugfix, maintenance と同一経路をとる。
本節は docs_chore に特有の要素を明記する。

- 入力: ユーザー要件、修正対象ドキュメント
- SSoT 遷移: req_draft → Issue 本文 → PR 本文 → マージ済み PR + クローズ済み Issue
- 承認: req-define の要件合意、case-close の完了前検証
- 完了証拠: マージ済み PR + クローズ済み Issue
- 停止条件: `agentdev_handoff: true` 検出時、req-define 合意要件からの逸脱、リポジトリ外操作の必要性

docs_chore は REQ, Decision, Design を生成しないことが多いが、Case 実行では case-open, case-ready, case-run, case-close を経由する。
docs 更新責務は全 work_type 共通である。

## スケール判定基準

scale（standard/ large）判定基準である。scale は全 work_type にわたって standard、large を設定できる。大規模 bugfix 等も scale/Epic 構成の対象になり得る（v4-standard-lifecycle Design）。
req-define Step 8 が参照する。

### standard

- 要件の複雑さが単一REQ、少数要件行に収まる
- 実装スコープシグナル（下記）の閾値を超えない

### large

以下のいずれかに該当する場合は large に昇格する:

1. **要件の複雑さ**: 複数REQにまたがる、または単一REQでも多数の要件行追加、修正を伴う
2. **実装スコープシグナル**: ドラフト内に以下のシグナルが存在する場合、要件の複雑さに関わらず large に昇格する:
 - 影響ファイル数が10ファイル超
 - 個別変更件数が30件超
 - シグナル対象: 修正候補リスト、検出事項カタログ、影響ファイル一覧等の実装詳細セクション

## See Also

- **agentdev-issue-management**: Issue作成、更新、リンク、確認の安全手順（操作用Skill）
- **agentdev-intake-pipeline**: intake抽出、promote review/分類/整形/振り分け基準
- **agentdev-backlog-integration**: backlog-review統合、分割判定、矛盾検出、RU生成
- **agentdev-req-structure-diagnostics**: inspect-docs/ REQ構造診断基準
- **agentdev-workflow-routing**: レビューNG時の対応フロー、次コマンド推論
- **agentdev-workflow-orchestration**: case-run状態機械、自律修正ループ
