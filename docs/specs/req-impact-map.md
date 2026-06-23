# REQ 影響マップ

各現行 REQ が影響する整合性ルールとアーティファクトを記載するマップ（REQ-0108-152）。10 以上の現行 REQ をカバーする。

## 影響マトリックス（Impact Matrix）

| REQ | タイトル | 影響する Rule IDs | 影響する Artifact |
|-----|---------|------------------|------------------|
| REQ-0101 | 文書・REQ 管理基準 | IR-001, IR-002, IR-003, IR-004, IR-017, IR-018, IR-022 | REQ, REQ index, DOC-MAP |
| REQ-0103 | Artifact 責任分界 | IR-006, IR-008, IR-014, IR-016, IR-024 | commands, skills, templates, SPEC |
| REQ-0108 | Integrity/Validation/Tests | IR-001~IR-024 (全件) | 全アーティファクト |
| REQ-0107 | Reporting/Writing Quality | IR-013, IR-019 | templates, guides |
| REQ-0104 | Workflow/Command Protocol | IR-006, IR-024 | commands |
| REQ-0105 | RU lifecycle / Requirement Unit 管理 | IR-016 | ドメイン状態 |
| REQ-0106 | Case 実行オーケストレーション / Epic・Wave | IR-006, IR-013, IR-016 | commands, templates |
| REQ-0109 | REQ 再構成運用 | IR-004, IR-011, IR-015 | REQ, mapping-table, 廃止 REQ |
| REQ-0112 | ADR status 正規化 | IR-005, IR-010 | ADR, ADR index |
| REQ-0113 | Skill References SPEC 分離 | IR-008, IR-014 | skills, skill references |
| REQ-0114 | case-auto 最大自走モード | IR-006, IR-016 | commands |
| REQ-0119 | コマンド・スキル・サブエージェント責務分界の再基準化 | IR-006, IR-008, IR-014, IR-024 | commands, skills |
| REQ-0123 | workflow-lifecycle 宣言的純化とコマンド固有手順の目的別スキル移管 | IR-006, IR-008, IR-014 | commands, skills |
| REQ-0124 | AgentDevFlow inspect-* 検出コマンド群と inspect lifecycle | IR-006, IR-024 | commands |
| REQ-0125 | inspect-skills / Command/Skill 参照妥当性検出 | IR-008, IR-014 | commands, skills |
| REQ-0126 | inspect-promote / 検出事項分類・昇格 | IR-016 | ドメイン状態 |
| REQ-0127 | Intake command 群 (capture / from-github / promote) | IR-016 | ドメイン状態 |
| REQ-0128 | Learning-promote | IR-016 | ドメイン状態 |
| REQ-0129 | Backlog-review | IR-016 | ドメイン状態 |
| REQ-0130 | case-run / 実装パイプライン | IR-006, IR-013, IR-016 | commands, templates |
| REQ-0131 | case-close / 完了処理 | IR-006, IR-013, IR-016 | commands, templates |
| REQ-0132 | case-open / Issue 作成 | IR-006 | commands |
| REQ-0133 | case-update / Issue 更新 | IR-006 | commands |
| REQ-0110 | Git worktree cleanup 信頼性 | — (infrastructure) | — |
| REQ-0102 | 要件定義・保存 | IR-001, IR-002 | REQ |
| REQ-0134 | 配布基盤: source/projection・sync・repo type・consumer install | IR-006, IR-016, IR-046 | commands, skills, ドメイン状態 |
| REQ-0135 | Drafts 配置・Draft Type Registry | IR-016 | ドメイン状態 |
| REQ-0136 | REQ/SPEC 責務分離の徹底と新ワークフロー（spec-save 新設・req-define 強化） | IR-008, IR-044 | REQ, SPEC, commands |
| REQ-0137 | 並列実行安全 git 操作規律 | — (infrastructure) | — |
| REQ-0138 | 構造化 req_draft 契約 | IR-016 | ドメイン状態 |
| REQ-0139 | 外部エージェント統合契約 | IR-006, IR-024 | commands, skills |
| REQ-0140 | 文書品質ゲート | IR-013, IR-045 | docs, SPEC, document-type-responsibilities.md |
| REQ-0141 | ローカル版 OpenCode 生成方式とローカル Case ファイル運用 | IR-016, IR-046, IR-047, IR-048 | src/opencode-local/, .opencode/commands/agentdev/, .opencode/skills/agentdev-*/, .agentdev/cases/, SPEC, guides |
| REQ-0148 | RU群バッチ処理と複数 execution_unit 並列実行 | IR-006, IR-016 | commands |

## 要件行影響（Requirement-Line Impact）

特定要件行が影響するアーティファクト・スキル・コマンド（REQ-0109-047）。REQ 全体ではなく要件行粒度で境界基準・検出観点の影響を追跡する必要がある場合に使用する。これらの要件行はすべて IR-044（REQ/SPEC 境界違反検出）を通じてカタログに紐づく。

| 要件行 | 影響するアーティファクト / スキル / コマンド | 経由 |
|--------|-------------------------------------|------|
| REQ-0101-067〜069 | document-model.md, agentdev-req-analysis skill, agentdev-quality-gates skill, docs-check command (REQ-0108-260 経由), inspect-docs command (REQ-0109-047 経由) | IR-044 |
| REQ-0102-053〜055 | agentdev-req-analysis skill, agentdev-quality-gates skill | IR-044 |
| REQ-0108-260 | integrity-rule-catalog.md (IR-044 定義), integrity-contracts.md (ReqSpecBoundary category, canonical-conflict subcategory 注記) | IR-044 |
| REQ-0109-047 | req-impact-map.md (本節), agentdev-req-structure-diagnostics skill | IR-044 |

## 影響カテゴリ（Impact Categories）

### 高影響（5+ ルール）
- **REQ-0108**: 全整合性ルールに影響 (IR-001~IR-024)
- **REQ-0101**: REQ 管理基準として広範囲に影響 (7 ルール)
- **REQ-0103**: アーティファクト配置規約として広範囲に影響 (5 ルール)

### 中影響（3-4 ルール）
- **REQ-0109**: REQ 再構成運用 (3 ルール)
- **REQ-0119**: コマンド・スキル・サブエージェント責務分界 (4 ルール)
- **REQ-0104**: Command protocol (2 ルール)
- **REQ-0106**: Case 実行オーケストレーション (3 ルール)
- **REQ-0107**: Reporting (2 ルール)
- **REQ-0141**: ローカル版 OpenCode 生成方式とローカル Case ファイル運用 (4 ルール: IR-016, IR-046, IR-047, IR-048)

### 低影響（1-2 ルール）
- **REQ-0102**, **REQ-0105**, **REQ-0112**, **REQ-0113**, **REQ-0114**, **REQ-0123**, **REQ-0124**, **REQ-0125**, **REQ-0126**, **REQ-0127**, **REQ-0128**, **REQ-0129**, **REQ-0130**, **REQ-0131**, **REQ-0132**, **REQ-0133**, **REQ-0134**, **REQ-0135**, **REQ-0136**, **REQ-0138**, **REQ-0139**, **REQ-0140**, **REQ-0148**

### 直接影響なし
- **REQ-0110**: Git worktree cleanup 信頼性（インフラストラクチャ層）
- **REQ-0137**: 並列実行安全 git 操作規律（インフラストラクチャ層）

## 再発トリアージ（Recurrence Triage）

再発検出事項検出時の対応ループ:

1. **検出**: 検出事項が基準既知（baseline-known）に存在するか確認
2. **分類**: known (基準済み) vs new
3. **再発判定**: known 検出事項が再度検出された場合:
   - ルール・検出器の誤検知 → ルールを修正（false positive）
   - 真の再発 → 検出器を強化、または検出ルールを追加
   - 基準判定ミス → 基準（baseline）を更新
4. **改善ループ**: ルールカタログ / 基準 / 影響マップ / 例外を更新
5. **記録**: トリアージ結果を整合性レポートに記録
