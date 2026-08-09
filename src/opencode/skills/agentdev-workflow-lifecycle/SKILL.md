---
name: agentdev-workflow-lifecycle
description: Provides development workflow phase definitions, SSoT transitions, work_type classification (bugfix/feature/maintenance/docs_chore), scale assessment, command mappings, and docs structure for the agentdev command pipeline. USE FOR: determining workflow phases, work_type classification and scale assessment, resolving command dependencies, or understanding docs/ directory layout. DO NOT USE FOR: specific command execution logic, requirement analysis, or compliance checking.
---

# AgentDevFlow ライフサイクルスキル

agentdev系コマンドのフェーズ定義、SSoT遷移、work_type 判定基準、コマンド関連を提供する。

## 原本（SSoT）

本スキルの原本仕様は `agentdev-workflow-lifecycle` SPEC である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

---

## USE FOR

- ライフサイクル判定
- ワークフローフェーズ判定（マクロ/マイクロ）
- work_type 分類（bugfix/feature/maintenance/docs_chore）
- スケール判定（standard/large）
- 前工程からの引き継ぎ判定、停止条件（`references/upstream-handoff.md`）
- SSoT 遷移に関する共通判断
- ラベル体系

## DO NOT USE FOR

- Issue本文生成
- Issue作成
- Epic/child Issue生成
- RU削除後処理
- Intake パイプライン（期間解釈、データ取得、構造検出、LLM解析、item生成）
- inspect-docs診断（REQ参照ID整合性、第一参照導線、現行/廃止境界、6観点診断、未処理成果物確認）
- backlog-review統合手順（Artifact読込分析、統合分割判定、矛盾検出、RU生成）
- command固有Step番号、command固有実行順序、command固有Phase名
- 特定コマンドの実行ロジック、手順記述
- 要件分析手法や壁打ちメソドロジー（`agentdev-req-analysis`参照）
- 仕様適合性検出、ループバック判定（`agentdev-quality-gates`、`agentdev-workflow-routing`参照）
- Decision/REQファイルの具体的作成、更新操作（`agentdev-decision-file-manager`/`agentdev-req-file-manager`参照）
- レビューNG時の対応フロー（`agentdev-workflow-routing`参照）
- 完了報告フォーマット、チェックボックス更新

## 対象コマンド

全 agentdev コマンドの一覧、入出力リファレンスは command README（`commands/agentdev/README.md`）を参照。
本 skill は全 agentdev コマンドからフェーズ定義、work_type 判定基準の参照元として使用される。

## work_type とコマンド経路

work_type は工程分岐の参照軸である。
全 work_type が GitHub Issue と PR を経由する標準経路をとる。Issue/PR をスキップする直接完了経路は存在しない。

`workflow-contracts` SPEC は bugfix, maintenance, docs_chore を `direct_case` に分類する。`direct_case` は req-save と spec-save を経由しないことを指し、Issue/PR を経由しないことを指さない。

### 経路一覧

| work_type | scale | コマンド経路 |
|---|---|---|
| bugfix | - | req-define → case-open → case-run → case-close |
| maintenance | - | req-define → case-open → case-run → case-close |
| docs_chore | - | req-define → case-open → case-run → case-close |
| feature | standard | req-define →（req-save → spec-save）→ case-open → case-run → case-close |
| feature | large | req-define → req-save →（spec-save）→ case-open → case-run → case-close（OU/ 子Issue 構成） |

各コマンドの正式名は `/agentdev/<name>` である（例: `/agentdev/req-define`）。一覧は command README 参照。

feature が経由する req-save と spec-save は req_draft の `artifact_actions` により動的判定する。該当 entry がない場合は case-open から開始する。feature large の OU/ 子Issue 構成は `agentdev-workflow-orchestration` 参照。

### docs_chore 経路の要素

docs_chore は bugfix, maintenance と同一経路をとる。本節は docs_chore に特有の要素を明記する。

- 入力: ユーザー要件、修正対象ドキュメント
- SSoT 遷移: req_draft → Issue 本文 → PR 本文 → マージ済み PR + クローズ済み Issue
- 承認: req-define の要件合意、case-close の完了前検証
- 完了証拠: マージ済み PR + クローズ済み Issue
- 停止条件: `agentdev_handoff: true` 検出時、req-define 合意要件からの逸脱、リポジトリ外操作の必要性

docs_chore は REQ, ADR, SPEC を生成しないことが多いため req-save と spec-save を経由しないが、case-open, case-run, case-close は必ず経由する。docs 更新責務は全 work_type 共通である。

## スケール判定基準

feature のスケール（standard/ large）判定基準。
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


