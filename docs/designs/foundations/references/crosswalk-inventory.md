# v3 -> v4 処遇一覧（crosswalk inventory）

位置づけ: 本ファイルは v3-v4-crosswalk Design の references であり、現行 v3 成果物の
v4 処遇の完全一覧（正本）を所有する。列 schema と運用規則は親 Design を参照。

## REQ（現行 53）

| 対象 | 意味処遇 | 帰属 | 実行段階 | 確定状態 | 備考 |
|---|---|---|---|---|---|
| REQ-001 | redefine | ― | 3 | planned | 最小 UPDATE（行 ID 全て不変・行数不増） |
| REQ-002 | redefine | semantic Skill | 8 | planned | 三層・実装帰属確定後に再編 |
| REQ-003 | redefine | Adapter | 8 | planned | authority 格子（DEC-039）への一般化 |
| REQ-004 | redefine | ― | 4 | planned | req-define 入口の v4 入力意味 |
| REQ-005 | redefine | ― | 4 | planned | 内部 lifecycle 状態遷移への回収 |
| REQ-006 | redefine | ― | 4 | planned | 自走オーケストレーションの v4 再編 |
| REQ-007 | redefine | ― | 6 | planned | Quality/Verification/Evidence/Gate 分解 |
| REQ-008 | redefine | ― | 4 | planned | 一時成果物ライフサイクルの v4 整理 |
| REQ-009 | redefine | ― | 12 | planned | 配布基盤・導入の migration implementation |
| REQ-010 | redefine | deterministic code/tool | 6 | planned | 検証基盤の Gate モデル接続 |
| REQ-011 | redefine | Adapter | 11 | planned | I/O 境界の adapter 再編 |
| REQ-012 | redefine | ― | 7 | planned | Change/Evidence 再中心化（DEC-037） |
| REQ-014 | keep | ― | ― | planned | adversarial-review は v4 でも保持 |
| REQ-015 | keep | ― | ― | planned | 同上 |
| REQ-016 | keep | ― | ― | planned | 同上 |
| REQ-017 | redefine | ― | 4 | planned | Issue Execution Contract の v4 整理 |
| REQ-018 | keep | ― | ― | planned | worktree 構造制約は維持 |
| REQ-019 | keep | ― | ― | planned | テスト影響範囲 gate は維持 |
| REQ-021 | redefine | ― | 7 | planned | トレーサビリティのワークフロー統合 v4 版 |
| REQ-027 | redefine | semantic Skill | 8 | planned | Capability Skill 再分類 |
| REQ-029 | keep | ― | ― | planned | 配布依存境界は移行期間維持 |
| REQ-030 | redefine | ― | 4 | planned | case-open 内部状態への回収 |
| REQ-031 | redefine | ― | 4 | planned | case-run 内部状態への回収 |
| REQ-032 | redefine | ― | 4 | planned | case-close 内部状態への回収 |
| REQ-034 | redefine | ― | 4 | planned | case-auto の v4 再編 |
| REQ-035 | redefine | ― | 5 | planned | Epic/Wave 語彙の再定義 |
| REQ-036 | keep | ― | ― | planned | inspect 系診断は維持 |
| REQ-037 | redefine | ― | 9 | planned | Intake の継続コラボレーションループ化 |
| REQ-038 | redefine | ― | 9 | planned | Learning のループ化・7 系統振分 |
| REQ-039 | redefine | ― | 9 | planned | Backlog のループ化 |
| REQ-041 | redefine | ― | 9 | planned | backlog-auto のループ化 |
| REQ-044 | keep | ― | ― | planned | 標準API委譲の原則は維持 |
| REQ-045 | keep | ― | ― | planned | 網羅監査は第13段で実行 |
| REQ-046 | keep | ― | 13 | planned | 移行不変条件。第13段で retire 予約（v4 移行完了後に廃止判定） |
| REQ-047 | redefine | deterministic code/tool | 8 | planned | 規則所有権の semantic/deterministic 再編 |
| REQ-048 | keep | ― | ― | planned | 観測評価ループは維持 |
| REQ-049 | keep | ― | ― | planned | 追跡Issue管理は維持 |
| REQ-050 | keep | ― | ― | planned | scripts 公開入口は維持 |
| REQ-051 | redefine | deterministic code/tool | 8 | planned | ガードレール識別体系の再編 |
| REQ-052 | redefine | Adapter | 11 | planned | Custom Tool・Plugin 種別契約の adapter 再編 |
| REQ-053 | keep | ― | ― | planned | 文章品質契約は維持 |
| REQ-054 | keep | ― | ― | planned | 変更誘発境界リスク分析は維持 |
| REQ-055 | redefine | ― | 6 | planned | Verification/Evidence モデル接続 |
| REQ-056 | keep | ― | ― | planned | Project Knowledge は維持 |
| REQ-057 | keep | ― | ― | planned | docs corpus 整合は維持 |
| REQ-058 | keep | ― | ― | planned | 廃止時クリーンアップは維持 |
| REQ-059 | keep | ― | ― | planned | Decision/REQ 関連宣言管理は維持 |
| REQ-060 | keep | ― | ― | planned | bun test 実行形態は維持 |
| REQ-061 | redefine | ― | 4 | planned | case-ready 内部状態への回収 |
| REQ-062 | redefine | ― | 4 | planned | case-revise 内部状態への回収 |
| REQ-082 | keep | ― | ― | planned | 審議契約は維持 |
| REQ-083 | keep | ― | ― | planned | Definition PR 状態契約は維持 |
| REQ-087 | keep | ― | ― | planned | 採番例外記録は維持 |
| REQ-088 | create | ― | 3 | planned | 第3段新設（v4 基盤要件） |
| retired 12 件（REQ-013、020、022〜026、028、033、040、042、043） | keep | ― | ― | executed | retired 維持・識別子再利用禁止 |

## Decision（v3 側: DEC-001〜030、DEC-018 欠番。DEC-031〜039 は v4 側のため対象外）

| 対象 | 意味処遇 | 帰属 | 実行段階 | 確定状態 | 備考 |
|---|---|---|---|---|---|
| DEC-001 | keep | ― | ― | planned | 憲章。第13段 full validation で再確認 |
| DEC-002 | supersede | Adapter | 11 | planned | 配布・ソース分離の v4 再定義（adapter 境界） |
| DEC-003 | keep | ― | ― | planned | req_draft ソフトコントラクトは維持 |
| DEC-004 | keep | ― | ― | planned | I/O 境界原則は維持 |
| DEC-005 | keep | ― | ― | executed | superseded by DEC-006（履歴維持） |
| DEC-006 | keep | ― | ― | planned | inspect 3-command 構成は維持 |
| DEC-007 | keep | ― | ― | executed | superseded by DEC-017（履歴維持） |
| DEC-008 | keep | ― | ― | planned | bounded parent decision resolution は維持 |
| DEC-009 | keep | ― | ― | planned | Decision モデル移行は維持 |
| DEC-010 | redefine | semantic Skill | 8 | planned | 責務 3 層分化の v4 Skill 再編での再定義 |
| DEC-011 | keep | ― | ― | planned | STEP resume point は維持 |
| DEC-012 | redefine | Project Extension | 10 | planned | Extension の v4 semantic extension point 化 |
| DEC-013 | keep | ― | ― | planned | IR 登録モデル簡素化は維持 |
| DEC-014 | keep | ― | ― | planned | 配布依存境界は維持 |
| DEC-015 | supersede | ― | 8 | planned | 後継: DEC-036/038/039（責務分界の三層+権威モデルへの分解） |
| DEC-016 | keep | ― | ― | planned | 副作用ゼロ原則は維持 |
| DEC-017 | supersede | ― | 7 | planned | 後継: DEC-037（Change/Evidence 再中心化） |
| DEC-019 | keep | ― | ― | planned | 標準API委譲は維持 |
| DEC-020 | keep | ― | ― | planned | Issue 共通管理単位は維持 |
| DEC-021 | keep | ― | ― | planned | scripts 公開入口は維持 |
| DEC-022 | keep | ― | ― | planned | 実行定義層は維持 |
| DEC-023 | keep | ― | ― | planned | third-party Skill 管理は維持 |
| DEC-024 | keep | ― | ― | planned | 変更誘発境界リスク分析は維持 |
| DEC-025 | keep | ― | ― | planned | プロジェクト知識層は維持 |
| DEC-026 | keep | ― | ― | planned | realization_actions は維持 |
| DEC-027 | keep | ― | ― | planned | 観測ベース統制縮小は維持 |
| DEC-028 | keep | ― | ― | planned | 文章表層品質基盤は維持 |
| DEC-029 | supersede | ― | 4 | planned | 後継: DEC-033 + v4-standard-lifecycle（UX 2入口・内部 lifecycle） |
| DEC-030 | supersede | ― | 7 | planned | 後継: DEC-037（producer/consumer 境界の v4 再中心化） |

## Design（v3 側 accepted）

| 対象 | 意味処遇 | 帰属 | 実行段階 | 確定状態 | 備考 |
|---|---|---|---|---|---|
| designs/commands/*.md（19 件） | redefine | ― | 4 | planned | 公開 UX 2入口収斂・内部 lifecycle 回収に伴う再編 |
| designs/skills/*.md（34 件、_template 含む） | redefine | semantic Skill | 8 | planned | semantic/deterministic 再分類（DEC-036） |
| workflows/workflow-contracts.md | supersede | ― | 4 | planned | v4-lifecycle-state-machine へ吸収（result 契約の 1 権威+導出投影への再編を含む） |
| workflows/workflow-skill-model.md | redefine | semantic Skill | 8 | planned | 責務 3 層分化・1:N 分割・配置契約の v4 Skill 再編での再定義（DEC-010 実装詳細） |
| workflows/input-resolution-and-durable-state.md | supersede | ― | 4 | planned | v4-durable-state-and-recovery が一般化契約を承継 |
| workflows/step-reference-contract.md | supersede | ― | 4 | planned | 再開単位階層（STEP/処理単位/Case）の v4 再構成 |
| workflows/epic-wave-model.md | supersede | ― | 5 | planned | 階層合成+直列化単位への再編。語彙意味の再定義は第5段 |
| workflows/definition-readiness.md | supersede | ― | 4 | planned | Definition lifecycle 部分ビューと冪等経路への整理 |
| workflows/backlog-artifact-lifecycle.md | supersede | ― | 9 | planned | RU/draft 部分ビューとして継続ループへ整理 |
| workflows/delegation-contracts.md | supersede | ― | 8 | planned | 委譲単位の再開・result の v4 接続 |
| workflows/capture-boundaries.md | redefine | ― | 9 | planned | Intake/Learning 境界の v4 整理 |
| workflows/references/execution-unit-construction.md | supersede | ― | 5 | planned | execution_unit 構成の v4 再編（Wave モデル改訂に追随） |
| foundations/numbering-policy.md | keep | ― | ― | planned | 採番規則は v4 でも維持 |
| foundations/system.md | redefine | ― | 4 | planned | コマンドシステム構成の v4 再編 |
| foundations/document-model.md | redefine | ― | 3 | planned | 本段: モデル定義 Design 昇格条件と移行期間優先規則の最小 UPDATE |
| foundations/decision-lifecycle.md | redefine | ― | 4 | planned | 本段は権威移行注記のみ。Decision status 部分ビュー整理は第4段 |
| foundations/patterns.md | keep | ― | ― | planned | 共通フォーマット規約は維持 |
| foundations/design-principles.md | keep | ― | ― | planned | 設計原則は維持 |
| foundations/project-extensions.md | redefine | Project Extension | 10 | planned | semantic extension point 化 |
| foundations/harness-separation-model.md | redefine | Adapter | 11 | planned | adapter 境界の再編 |
| foundations/traceability-model.md | supersede | ― | 7 | planned | v4-traceability-model が承継（DEC-037） |
| foundations/references/concrete-abstraction.md | keep | ― | ― | planned | 具体抽象化参照は維持 |
| responsibilities/document-type-responsibilities.md | redefine | ― | 4 | planned | v4 中核文書モデルの執筆規約反映 |
| responsibilities/artifact-responsibilities.md | redefine | semantic Skill | 8 | planned | 成果物責任表の v4 再編 |
| responsibilities/artifact-contracts.md | redefine | semantic Skill | 8 | planned | アーティファクト契約の v4 再編 |
| responsibilities/req-impact-map.md | keep | ― | ― | planned | REQ 影響マップは維持 |
| responsibilities/responsibility-boundary-purification.md | redefine | Adapter | 11 | planned | 責務境界浄化の adapter 再編 |
| responsibilities/artifact-quality-control-routing.md | redefine | ― | 6 | planned | Gate モデル接続 |
| responsibilities/custom-tool-contracts.md | redefine | Adapter | 11 | planned | Custom Tool 操作契約・迂回防止の adapter 再編（REQ-052 対応 Design） |
| quality/quality-specs.md | redefine | ― | 6 | planned | Quality 5 概念への再編 |
| quality/quality-gates.md | supersede | ― | 6 | planned | v4-quality-gate-model が承継（DEC-035） |
| quality/req-health-metrics.md | keep | ― | ― | planned | REQ 健全性メトリクスは維持 |
| quality/design-health-metrics.md | keep | ― | ― | planned | Design 健全性メトリクスは維持 |
| quality/textlint-quality-runtime.md | keep | ― | ― | planned | textlint 基盤は維持 |
| integrity/*.md（14 件）+ integrity/rules/IR-NNN 群 | keep | deterministic code/tool | ― | planned | 検証基盤は v4 でも維持。個別再編が必要になった時点で個別行へ展開 |
| local/*.md（4 件） | redefine | Adapter | 11 | planned | backend 抽象・物理写像への整理 |
| authoring/command-file-format.md | redefine | ― | 8 | planned | コマンド執筆規約の v4 再編 |
| authoring/vocabulary-registry.md | redefine | ― | 5 | planned | 語彙直交性の再定義への接続 |

## その他（概念・実装資産）

| 対象 | 意味処遇 | 帰属 | 実行段階 | 確定状態 | 備考 |
|---|---|---|---|---|---|
| scripts/**（決定的ツール・検証スイート） | redefine | deterministic code/tool | 8 | planned | semantic/deterministic 再分類 |
| traceability/**（sidecar・policy 機構） | redefine | ― | 7 | planned | Change/Evidence 再中心化 |
| Command/Skill/Custom Tool/Plugin（概念） | redefine | ― | 8 | planned | 実装責務境界の再分類 |
| .agentdev/ 状態領域（概念） | redefine | Project Model | 9 | planned | durable state 5 分類への整理 |
| Intake/Learning/Backlog（概念） | redefine | ― | 9 | planned | 継続コラボレーションループ |
| work_type/scale/workflow_route（概念） | redefine | ― | 5 | planned | 語彙直交性への再定義 |
| Epic/Wave（概念） | redefine | ― | 5 | planned | 階層合成・実行スケジューリング |
| QG-1〜QG-4（概念） | redefine | Standard Operating Model | 6 | planned | Quality 5 概念分解・Gate 再導出 |
| 配布物・プロジェクション（概念） | redefine | ― | 12 | planned | migration implementation |
