# 監査台帳: governance-system-audit

## メタデータ

- 監査対象: AgentDevFlow 標準体系・統治境界
- 監査フェーズ: 第1フェーズ（one-time ライフサイクル）
- 監査日時: 2026-07-19 (JST)
- 関連 Issue: [#1596](https://github.com/yogata/agent-dev-flow/issues/1596)
- 監査ブランチ: `refactor/issue-1596`
- worktree root: `.worktrees/1596-refactor/`
- ライフサイクル: one-time（再編完了後または自動化機構移行完了後に廃棄）
- 4硬制約（計画 Section 1）遵守: 新規REQ/ADR原則追加不可 / 公開command動作不改 / 監査前の一括退役禁止 / 未決事項確定不可
- 本台帳の位置づけ: 一時的分析成果物（計画 Section 5.3、Section 10）。新しい永続 status 体系として扱わない

## 監査母集団（AG-001）

実ファイル列挙（glob パターン + 再帰列挙の交差検証）。集計日時: 2026-07-19 JST、commit `9683d53e`。

### 種別ごとの列挙結果

| 種別 | glob パターン | 実測件数 | 備考 |
|---|---|---|---|
| 現行 REQ | `docs/requirements/REQ-*.md` | 54 | REQ-0101〜0163（REQ-0111/0115/0116/0117/0118/0120/0121/0122 廃止、REQ-0157 欠番） |
| 廃止済み REQ | `docs/requirements/retired/REQ-*.md` | 58 | REQ-0001〜0050 (50) + REQ-0111/0115/0116/0117/0118/0120/0121/0122 (8) |
| ADR | `docs/adr/ADR-*.md` | 29 | ADR-0101〜0138（ADR-0133, 0115〜0122 欠番）。accepted 25 / proposed 1 / superseded 2 / deprecated 1 |
| 廃止済み ADR | `docs/adr/retired/ADR-*.md` | 23 | ADR-0001〜0023（README 記載と一致） |
| SPEC | `docs/specs/**/*.md` | 139 | README 1 + authoring 1 + commands 20 + foundations 7 + integrity 7 + integrity/rules 60 (IR-045 欠番) + local 3 + quality 4 + responsibilities 5 + skills 29 + workflows 5 + _template 2 件含む |
| 標準 command 定義 | `src/opencode/commands/agentdev/*.md` | 18 | 17 command + README.md |
| 標準 skill 定義 | `src/opencode/skills/agentdev-*/SKILL.md` | 28 | `agentdev-*` 28 件 |
| Project Extensions | `.agentdev/extensions/**/*` | 29 | skills 拡張 13 + commands 拡張 16 |
| 索引類 README | `docs/**/README.md` | 6 | docs/, docs/specs/, docs/requirements/, docs/requirements/retired/, docs/guides/, docs/adr/ |
| その他索引 | DOC-MAP.md, mapping-table.md | 2 | docs/DOC-MAP.md, docs/requirements/mapping-table.md |
| repo-local skill | `.opencode/skills/repo-agentdev-integrity/` | 1 (+ 補助) | repo-local ツール（SKILL.md + scripts/ + references/ + baselines/） |
| repo-local command | `.opencode/commands/repo/` | 2 | repo/docs-check.md + templates/docs-check/standard.md |

### 交差検証

- glob パターン列挙と PowerShell `Get-ChildItem -Recurse` 件数の一致を確認済み
- README 記載レンジとの照合結果は「定量不整合検出（AG-005）」セクションに集約
- ADR accepted 件数: README キャプション「24件」、現行基盤ビュー表行数「25」、実測 accepted ファイル「25」の3値で不整合（詳細は AG-005）

## 三軸分類の定義（共通参照）

計画 Section 5 が定義する分類。本台帳の三軸分類と11項目はすべて以下に従う。

1. 適用範囲・ライフサイクル軸
   - `standard`: 全プロジェクト共通の配布物要素
   - `repository-local`: 当該リポジトリ固有（`.opencode/`, `.agentdev/` 配下のプロジェクト拡張等）
   - `one-time`: 再編フェーズ限定の暫定成果物（本監査台帳自身を含む）

2. 検出観点軸
   - `SPLIT`: 1つの所有者が複数の関心を保持しており分割候補
   - `MERGE`: 複数の所有者が同一関心を重複保持しており統合候補
   - `MOVE`: 現所有者と正規所有者が異なり移送候補
   - `DUPLICATE`: 実質的に同一内容が複数箇所に存在
   - `RETIRE`: 廃止候補（旧版、参照切れ、歴史的成果物）
   - `DRIFT`: 索引・一覧と実体の定量ずれ、記載の陳腐化

3. 処置方針軸
   - `KEEP`: 現所有者・現位置を維持
   - `MERGE`: 他へ統合
   - `REFERENCE`: 他を正として参照に回す
   - `DERIVE`: 既存文書から機械的に導出可能（自動化候補）
   - `GENERATE`: ルール・契約から生成可能（自動化候補）
   - `RETIRE`: 廃止

混在許容: 1ファイル内で複数処置方針が混在する場合、原則として代表処置方針を記載しつつ「混在: X, Y」形式で併記する（計画 Section 6 準拠）。

## 三軸分類済み監査単位（AG-002, AG-003）

監査単位は「意味上の主張のカテゴリ」単位（Issue AG-002 が「ファイル単位に限定せず、機構/文書/セクション/表/要件行/ADR決定文/SPEC契約/command/skill規則/extension entry/検査ルール/意味上の主張を含む」と定める範囲）。各カテゴリに所属ファイル群を明示し、11 項目を記録する。「該当なし」項目は `N/A` と明示する。

### A. 基盤 SPEC（`docs/specs/foundations/`、7 件）

所属: `system.md`, `document-model.md`, `design-principles.md`, `patterns.md`, `workflow-contracts.md`, `harness-separation-model.md`, `project-extensions.md`

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | docs/specs/foundations/（基盤 SPEC 群） |
| 2 | 意味上の主張 | 配布物全体の設計原則・文書モデル・ソース/プロジェクション分離・harness 分離モデル・project-extensions 基盤契約 |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | DRIFT（workflow-contracts.md は workflows/workflow-contracts.md に縮小移行済み、 二重保持） / MOVE（project-extensions.md は responsibilities にも関連記述） |
| 5 | 処置方針 | KEEP（system, document-model, design-principles, patterns, harness-separation-model） / REFERENCE（workflow-contracts.md → workflows/workflow-contracts.md を正とし旧版は参照用途に縮小。docs/README.md に「縮小済み参照ファイル」明記済み） / MERGE（project-extensions 関連は responsibilities/artifact-contracts.md と重複あり、再編で統合判断） |
| 6 | 正規所有者候補 | foundations ディレクトリ（横断事項は workflows/ responsibilities/ に分離） |
| 7 | 移送または統合先 | workflow-contracts.md → docs/specs/workflows/workflow-contracts.md（参照関係の明文化のみ、物理統合は再編フェーズ判断） |
| 8 | 導出元 | N/A |
| 9 | 公開動作への影響 | 無（SPEC は実行時非依存、ADR-0104 宣言） |
| 10 | 未決事項 | project-extensions 関連の responsibilities/ との統合可否は再編フェーズ判断 |
| 11 | 判断根拠 | REQ-0156 が6ドメイン分類を定義。foundations は基盤契約の正規配置先 |

### B. 責務 SPEC（`docs/specs/responsibilities/`、5 件）

所属: `document-type-responsibilities.md`, `artifact-contracts.md`, `artifact-responsibilities.md`, `req-impact-map.md`, `responsibility-boundary-purification.md`

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | docs/specs/responsibilities/ |
| 2 | 意味上の主張 | 文書種別責務配置基準・アーティファクト契約・成果物責任表・REQ 影響マップ・責務境界浄化 |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | MERGE（document-type-responsibilities.md と artifact-responsibilities.md の一部が重複） / SPLIT（req-impact-map.md は REQ 索引側と両方に主張が分散） |
| 5 | 処置方針 | KEEP（document-type-responsibilities.md を正） / MERGE（artifact-responsibilities.md の主張で document-type と重複するものは document-type に集約） / REFERENCE（req-impact-map.md は requirements/mapping-table.md と連携、正規所有者は mapping-table） |
| 6 | 正規所有者候補 | document-type-responsibilities.md（配置基準 SSoT）/ mapping-table.md（REQ 移行表 SSoT） |
| 7 | 移送または統合先 | req-impact-map.md の一部主張 → requirements/mapping-table.md への参照関係強化 |
| 8 | 導出元 | N/A |
| 9 | 公開動作への影響 | 無 |
| 10 | 未決事項 | artifact-contracts.md と artifact-responsibilities.md の責務分割基準は再編フェーズ判断 |
| 11 | 判断根拠 | REQ-0156 責務ドメイン定義、AGENTS.md（doc-writing が document-type-responsibilities を原本と明示） |

### C. 品質 SPEC（`docs/specs/quality/`、4 件）

所属: `quality-gates.md`, `quality-specs.md`, `req-health-metrics.md`, `spec-health-metrics.md`

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | docs/specs/quality/ |
| 2 | 意味上の主張 | 品質ゲート QG-1〜QG-4、品質 SPEC 全般、REQ/SPEC 健全性メトリクス |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | SPLIT（quality-gates SPEC と agentdev-quality-gates SKILL で QG 規定を二重保持） / MOVE（req-health-metrics は REQ 体系、spec-health-metrics は SPEC 体系との密接、現位置維持で妥当） |
| 5 | 処置方針 | KEEP（quality-specs.md を正）/ REFERENCE（quality-gates.md は SKILL.md の agentdev-quality-gates/references/ と参照関係、SPEC が契約・SKILL が運用ビュー） / DERIVE（req-health-metrics / spec-health-metrics は実ファイルから導出可能項目を多く含む） |
| 6 | 正規所有者候補 | quality-specs.md（品質 SPEC 正）、agentdev-quality-gates SKILL（運用ビュー正） |
| 7 | 移送または統合先 | N/A（現位置で妥当） |
| 8 | 導出元 | req-health-metrics / spec-health-metrics の数値項目は実ファイル列挙結果から導出可能 |
| 9 | 公開動作への影響 | 無（QG は LLM 解釈時参照、公開コマンド動作は不变） |
| 10 | 未決事項 | メトリクス自動化の最終判断は再編フェーズ |
| 11 | 判断根拠 | REQ-0140（文書品質ゲート）、REQ-0156（品質ドメイン定義） |

### D. 整合性 SPEC（`docs/specs/integrity/`、7 件 + rules/）

所属: `integrity-contracts.md`, `integrity-rule-catalog.md`, `rule-ownership.md`, `validator-split-criteria.md`, `backticks-identifier-threshold.md`, `targeted-docs-guard-implementation.md`, `docs-spec-rebuild-integrity.md` + `rules/IR-*.md` 60 件（IR-045 欠番）

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | docs/specs/integrity/ |
| 2 | 意味上の主張 | 整合性契約・検査ルールカタログ・ルール所有権マトリクス・検証器分割基準・識別子閾値・targeted docs guard・docs/specs 再編整合性 |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | DRIFT（IR-045 欠番、カタログと実体の整合確認が必要） / MOVE（rule-ownership.md は検査ルールごとの所有権マトリクス、IR-* と双方向参照） / DUPLICATE（integrity-rule-catalog と rule-ownership の重複記述） |
| 5 | 処置方針 | KEEP（integrity-contracts.md を正）/ REFERENCE（catalog → IR-* 個別ファイル、rule-ownership → IR-* の所有権列挙）/ DERIVE（catalog は IR-* から機械生成可能、AG-006 候補） |
| 6 | 正規所有者候補 | integrity-contracts.md（契約正）/ 各 IR-*.md（個別ルール正） |
| 7 | 移送または統合先 | catalog と rule-ownership の重複は再編フェーズで catalog を DERIVE 生成物に変更（個別 IR-* を SSoT） |
| 8 | 導出元 | integrity-rule-catalog.md のエントリは各 IR-*.md の frontmatter から導出可能（AG-006 候補） |
| 9 | 公開動作への影響 | 無（docs-check 実行時の挙動は不变、公開コマンド動作は不变） |
| 10 | 未決事項 | IR-045 欠番の経緯確認、catalog の GENERATE 化（再編フェーズ判断） |
| 11 | 判断根拠 | REQ-0144 / REQ-0145（docs-check/integrity 運用是正・検出設計改善）、REQ-0158（Targeted Docs Guard） |

### D-rules. 整合性ルール個別（`docs/specs/integrity/rules/IR-*.md`、60 件）

代表例: IR-001, IR-011, IR-017, IR-038, IR-042, IR-053, IR-060（欠番 IR-045 を含む集団）。他の IR も同パターン。

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | docs/specs/integrity/rules/IR-{NNN}-*.md 各ファイル |
| 2 | 意味上の主張 | 個別整合性検査ルール（frontmatter 形式、参照妥当性、配布境界、日本語検出等） |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | DRIFT（IR-045 欠番、catalog との番号整合要確認） / MOVE（IR-038/039 は ADR/REQ 索引との一貫性、IR-042 は hardcoded req count 検出で README 側の件数記載と相関） |
| 5 | 処置方針 | KEEP（個別ルールは SSoT）/ DERIVE（catalog エントリは IR-* から生成） |
| 6 | 正規所有者候補 | 各 IR-*.md（ルール本文が SSoT） |
| 7 | 移送または統合先 | N/A |
| 8 | 導出元 | catalog が IR-* から導出される側（IR-* が SSoT） |
| 9 | 公開動作への影響 | 無（docs-check は公開コマンド動作に非該当、/repo/docs-check は repo-local） |
| 10 | 未決事項 | IR-045 欠番の取り扱い（廃止か未採番か再編で確認） |
| 11 | 判断根拠 | REQ-0145（検出設計改善）、integrity-contracts.md |

### E. ローカル SPEC（`docs/specs/local/`、3 件）

所属: `local-case-file.md`, `local-generation.md`, `runtime-package-boundary.md`

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | docs/specs/local/ |
| 2 | 意味上の主張 | ローカル版 Case ファイル運用、ローカル版 OpenCode 生成、実行時パッケージ境界 |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | MOVE（local-generation は ADR-0131 で link mode 統一済み、生成方式は廃止） / DRIFT（link mode 移行後の記載陳腐化の恐れ） |
| 5 | 処置方針 | KEEP（local-case-file, runtime-package-boundary） / REFERENCE（local-generation は ADR-0131 の link mode を正とし、生成方式記述は歴史参照に縮小） |
| 6 | 正規所有者候補 | docs/specs/local/ |
| 7 | 移送または統合先 | local-generation → ADR-0131 を正 |
| 8 | 導出元 | N/A |
| 9 | 公開動作への影響 | 無（ローカル版固有、配布物コマンド動作に影響しない） |
| 10 | 未決事項 | local-generation の記載縮小範囲は再編フェーズ判断 |
| 11 | 判断根拠 | REQ-0141（ローカル版導入）、ADR-0131（link mode 統一） |

### F. オーサリング SPEC（`docs/specs/authoring/`、1 件）

所属: `command-file-format.md`

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | docs/specs/authoring/command-file-format.md |
| 2 | 意味上の主張 | command 定義ファイルフォーマット標準 |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | SPLIT（REQ-0143 と command-file-format SPEC で主張分散） |
| 5 | 処置方針 | KEEP（SPEC が運用詳細、REQ が要件） |
| 6 | 正規所有者候補 | command-file-format.md（運用 SSoT） |
| 7 | 移送または統合先 | N/A |
| 8 | 導出元 | N/A |
| 9 | 公開動作への影響 | 無 |
| 10 | 未決事項 | N/A |
| 11 | 判断根拠 | REQ-0143（Command 定義ファイルフォーマット標準化）、IR-049 が機械検出 |

### G. command SPEC（`docs/specs/commands/`、20 件 = 17 command + _template + 2 補助）

所属: `_template.md` + `backlog-review.md`, `case-auto.md`, `case-close.md`, `case-open.md`, `case-run.md`, `case-update.md`, `inspect-docs.md`, `inspect-extensions.md`, `inspect-promote.md`, `inspect-skills.md`, `intake-capture.md`, `intake-from-github.md`, `intake-promote.md`, `learning-promote.md`, `req-define.md`, `req-save.md`, `spec-save.md`

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | docs/specs/commands/*.md（command ごと） |
| 2 | 意味上の主張 | 各 `/agentdev/*` command の SPEC 契約（入出力、フロー、QG） |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | MOVE（command SPEC と src/opencode/commands/agentdev/*.md の二重参照、SPEC が契約・command 定義が手順） / SPLIT（case-auto SPEC は REQ-0114 と主張分散） |
| 5 | 処置方針 | KEEP（SPEC が契約 SSoT）/ REFERENCE（command 定義ファイル → 対応 SPEC を参照） |
| 6 | 正規所有者候補 | docs/specs/commands/{command}.md（契約）+ src/opencode/commands/agentdev/{command}.md（手順） |
| 7 | 移送または統合先 | N/A（二重保持は仕様、REQ-0103 責務分界） |
| 8 | 導出元 | N/A |
| 9 | 公開動作への影響 | 無（SPEC 変更は公開コマンド動作を直接変更しない、契約維持で公開動作不改制約遵守） |
| 10 | 未決事項 | command SPEC と command 定義の記載粒度差の整備は再編フェーズ判断 |
| 11 | 判断根拠 | REQ-0103（Artifact 責任分界）、ADR-0123（SPEC lifecycle）、各 REQ-0130〜0133（case-* command 要件） |

### H. skill SPEC（`docs/specs/skills/`、29 件 = 28 skill + _template）

所属: `_template.md` + `agentdev-adr-file-manager.md`, `agentdev-adr-guidelines.md`, `agentdev-architecture-advisory.md`, `agentdev-backlog-integration.md`, `agentdev-case-run-execution-adapter.md`, `agentdev-command-authoring.md`, `agentdev-command-creator.md`, `agentdev-conventional-commits.md`, `agentdev-doc-map.md`, `agentdev-doc-writing.md`, `agentdev-epic-tracker.md`, `agentdev-gh-cli.md`, `agentdev-git-worktree.md`, `agentdev-inspect-skills.md`, `agentdev-intake-pipeline.md`, `agentdev-issue-management.md`, `agentdev-learning-capture.md`, `agentdev-learning-pipeline.md`, `agentdev-project-extensions.md`, `agentdev-quality-gates.md`, `agentdev-req-analysis.md`, `agentdev-req-file-manager.md`, `agentdev-req-structure-diagnostics.md`, `agentdev-skill-authoring.md`, `agentdev-workflow-lifecycle.md`, `agentdev-workflow-orchestration.md`, `agentdev-workflow-routing.md`, `agentdev-workflow-templates.md`

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | docs/specs/skills/agentdev-*.md |
| 2 | 意味上の主張 | 各 `agentdev-*` skill の SPEC 契約（責務、手続き、契約） |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | SPLIT（agentdev-quality-gates.md SPEC と references/* と SKILL.md で三重保持）/ MOVE（agentdev-doc-writing SPEC と japanese-tech-writing スキルが原本関係） |
| 5 | 処置方針 | KEEP（SPEC が契約）/ REFERENCE（SKILL.md → SPEC、references → SPEC の運用ビュー）/ DERIVE（doc-writing 系は japanese-tech-writing を原本として参照関係明文化、AG-006 候補） |
| 6 | 正規所有者候補 | docs/specs/skills/agentdev-{name}.md |
| 7 | 移送または統合先 | N/A |
| 8 | 導出元 | doc-writing 関連の查読観点は japanese-tech-writing スキル（原本）から DERIVE |
| 9 | 公開動作への影響 | 無 |
| 10 | 未決事項 | SKILL.md と SPEC の記載粒度ガイドライン（SKILL.md 構造查読、優先度 Wave 1/2/3）は再編フェーズ判断 |
| 11 | 判断根拠 | REQ-0156（skills SPEC ドメイン）、ADR-0123（SPEC lifecycle） |

### I. workflow SPEC（`docs/specs/workflows/`、5 件）

所属: `workflow-contracts.md`, `delegation-contracts.md`, `capture-boundaries.md`, `epic-wave-model.md`, `backlog-artifact-lifecycle.md`

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | docs/specs/workflows/ |
| 2 | 意味上の主張 | 横断ワークフロー契約・委譲契約・キャプチャ境界・Epic/Wave モデル・RU 群 lifecycle |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | MOVE（foundations/workflow-contracts.md の旧版と workflows/workflow-contracts.md の新版の二重保持、docs/README で「縮小済み」と明示） / MERGE（delegation-contracts と capture-boundaries の一部主張重複） |
| 5 | 処置方針 | KEEP（workflows/* を正）/ REFERENCE（foundations/workflow-contracts.md → workflows/workflow-contracts.md を正として参照関係維持） |
| 6 | 正規所有者候補 | docs/specs/workflows/* |
| 7 | 移送または統合先 | foundations/workflow-contracts.md の残余主張 → workflows/ へ集約（再編フェーズ判断） |
| 8 | 導出元 | N/A |
| 9 | 公開動作への影響 | 無 |
| 10 | 未決事項 | delegation-contracts / capture-boundaries の記載分割基準は再編判断 |
| 11 | 判断根拠 | REQ-0146（実行契約・委譲・プロセス設計）、REQ-0139（外部エージェント統合契約） |

### J. REQ（`docs/requirements/REQ-*.md`、54 件）

代表: REQ-0101（文書管理基準）、REQ-0102（要件定義・保存）、REQ-0103（Artifact 責任分界）、REQ-0104（Workflow）、REQ-0108（docs-check）、REQ-0114（case-auto）、REQ-0119（責務分界）、REQ-0136（REQ/SPEC 責務分離）、REQ-0140（文書品質ゲート）、REQ-0156（基盤 SPEC ドメイン）、REQ-0162（harness 境界）、REQ-0163（subagent 委譲プロトコル）。他 42 件も同パターン。

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | docs/requirements/REQ-{NNNN}.md（54 件、REQ-0157 欠番） |
| 2 | 意味上の主張 | 現行要件 54 件の各主張（文書・REQ管理、Workflow、Case実行、配布基盤、整合性、委譲 等） |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | SPLIT（REQ-0102 は79要件行で肥大化、CR-004 で SPLIT 検討指摘済み） / MOVE（REQ-0157 欠番、番号管理の drift） / DRIFT（README 記載 54 件と実測 54 件は一致） |
| 5 | 処置方針 | KEEP（原則） / RETIRE（不可、4硬制約「監査前の一括退役禁止」） / REFERENCE（REQ-0157 欠番は requirements/README の記載と矛盾せず、欠番として維持） |
| 6 | 正規所有者候補 | 各 REQ ファイル（要件は SSoT） |
| 7 | 移送または統合先 | REQ-0102 の肥大化解消は再編フェーズ（CR-004） |
| 8 | 導出元 | N/A |
| 9 | 公開動作への影響 | 無（REQ 変更は仕様契約変更だが、本監査は不変） |
| 10 | 未決事項 | REQ-0157 欠番の扱い（採番ミスか廃止か、再編で確認）。REQ-0102 SPLIT は再編判断 |
| 11 | 判断根拠 | 4硬制約（新規REQ/ADR原則追加不可、監査前退役禁止）、CR-004（REQ-0102 SPLIT 指摘） |

### K. ADR（`docs/adr/ADR-*.md`、29 件）

代表: ADR-0101（namespace 統一）、ADR-0102（runtime/authoring 分離）、ADR-0107（責任分界）、ADR-0112（委譲一般化）、ADR-0123（SPEC lifecycle）、ADR-0128（case-run 実行モデル）、ADR-0131（link mode）、ADR-0135（project-extensions）、ADR-0136（harness 境界浄化）、ADR-0137（case-run インライン実行）、ADR-0138（case-auto 制御集約）。他 18 件も同パターン。

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | docs/adr/ADR-{NNNN}.md（29 件） |
| 2 | 意味上の主張 | accepted 25 + proposed 1 + superseded 2 + deprecated 1 の各意思決定 |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | DRIFT（README 現行基盤ビュー表キャプション「24件」vs 表実測 25行 vs accepted 実測 25件、ADR-0137 accepted 一覧欠落） / RETIRE（superseded/deprecated 4 件は現行根拠から分離済み、歴史参照） |
| 5 | 処置方針 | KEEP（accepted 25 / proposed 1） / RETIRE（superseded 2 / deprecated 1 は現行根拠から除外、ファイル自体は歴史参照で保持） / REFERENCE（README のキャプション数値は ADR-0137 追加時に更新漏れ、再編で修正） |
| 6 | 正規所有者候補 | 各 ADR ファイル（意思決定 SSoT） |
| 7 | 移送または統合先 | N/A（superseded は後継 ADR への参照关系を README Decision Map で明示済み） |
| 8 | 導出元 | N/A |
| 9 | 公開動作への影響 | 無 |
| 10 | 未決事項 | ADR-0137 のステータス別ビュー「承認済み」リストへの追加、README キャプションの「24件 → 25件」修正（再編フェーズ、索引類不整合として AG-005 に集約） |
| 11 | 判断根拠 | 4硬制約（監査前退役禁止）、CR-003（再編決定の新規 ADR 化なし、既存 UPDATE で吸収） |

### L. 標準 command 定義（`src/opencode/commands/agentdev/`、18 件）

所属: 17 command（`backlog-review.md`, `case-auto.md`, `case-close.md`, `case-open.md`, `case-run.md`, `case-update.md`, `inspect-docs.md`, `inspect-extensions.md`, `inspect-promote.md`, `inspect-skills.md`, `intake-capture.md`, `intake-from-github.md`, `intake-promote.md`, `learning-promote.md`, `req-define.md`, `req-save.md`, `spec-save.md`） + `README.md`

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | src/opencode/commands/agentdev/*.md |
| 2 | 意味上の主張 | 各 command の手順・Steps・Guardrails・出力契約 |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | MOVE（command 定義と command SPEC の二重参照、設計通り） / DUPLICATE（README.md と docs/specs/commands/_template.md の一部重複） |
| 5 | 処置方針 | KEEP（公開動作不改制約、4硬制約） / REFERENCE（command 定義 → command SPEC を契約として参照） |
| 6 | 正規所有者候補 | src/opencode/commands/agentdev/{command}.md（手順 SSoT）+ docs/specs/commands/{command}.md（契約 SSoT） |
| 7 | 移送または統合先 | N/A |
| 8 | 導出元 | N/A |
| 9 | 公開動作への影響 | 有（command 定義変更は公開動作に直結）。本監査では編集しない（4硬制約「公開command動作不改」） |
| 10 | 未決事項 | N/A |
| 11 | 判断根拠 | 4硬制約（公開command動作不改）、REQ-0103（Artifact 責任分界） |

### M. 標準 skill 定義（`src/opencode/skills/agentdev-*/SKILL.md`、28 件）

所属: `agentdev-adr-file-manager`, `agentdev-adr-guidelines`, `agentdev-architecture-advisory`, `agentdev-backlog-integration`, `agentdev-case-run-execution-adapter`, `agentdev-command-authoring`, `agentdev-command-creator`, `agentdev-conventional-commits`, `agentdev-doc-map`, `agentdev-doc-writing`, `agentdev-epic-tracker`, `agentdev-gh-cli`, `agentdev-git-worktree`, `agentdev-inspect-skills`, `agentdev-intake-pipeline`, `agentdev-issue-management`, `agentdev-learning-capture`, `agentdev-learning-pipeline`, `agentdev-project-extensions`, `agentdev-quality-gates`, `agentdev-req-analysis`, `agentdev-req-file-manager`, `agentdev-req-structure-diagnostics`, `agentdev-skill-authoring`, `agentdev-workflow-lifecycle`, `agentdev-workflow-orchestration`, `agentdev-workflow-routing`, `agentdev-workflow-templates`

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | src/opencode/skills/agentdev-{name}/SKILL.md |
| 2 | 意味上の主張 | 各 skill の運用知識・手続き・查読観点 |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | SPLIT（SKILL.md 本文と docs/specs/skills/agentdev-{name}.md SPEC と references/*.md で三重保持、REQ-0140 SKILL.md 重複查読の優先度基準 Wave 1/2/3 が指摘済み） / MOVE（doc-writing SKILL と japanese-tech-writing が原本関係、ADR-0134/REQ-0159-001） |
| 5 | 処置方針 | KEEP（公開動作不改制約） / REFERENCE（SKILL.md → SPEC、references → SPEC） / DERIVE（SKILL.md 概要節と機能節の重複は SPEC を正として DERIVE 可能、AG-006 候補） |
| 6 | 正規所有者候補 | docs/specs/skills/agentdev-{name}.md（契約）+ SKILL.md（運用ビュー） |
| 7 | 移送または統合先 | N/A（4硬制約で編集しない） |
| 8 | 導出元 | SKILL.md 機能節の一部は SPEC から DERIVE 可能（優先度 Wave 1/2/3 に従い段階処置、再編フェーズ） |
| 9 | 公開動作への影響 | 有（SKILL.md 変更は LLM 解釈に影響）。本監査では編集しない |
| 10 | 未決事項 | SKILL.md 重複查読の段階的処置（Wave 1/2/3）は再編フェーズ判断 |
| 11 | 判断根拠 | 4硬制約、REQ-0140（文書品質ゲート、SKILL.md 重複查読基準） |

### N. Project Extensions（`.agentdev/extensions/`、29 件）

所属: skills 拡張 13（`agentdev-workflow-orchestration`, `agentdev-skill-authoring`, `agentdev-req-structure-diagnostics`, `agentdev-req-file-manager`, `agentdev-req-analysis`, `agentdev-quality-gates`, `agentdev-learning-capture`, `agentdev-inspect-skills`, `agentdev-epic-tracker`, `agentdev-doc-writing`, `agentdev-doc-map`, `agentdev-command-authoring`, `agentdev-backlog-integration`） + commands 拡張 16（`spec-save`, `req-save`, `req-define`, `learning-promote`, `intake-promote`, `intake-from-github`, `intake-capture`, `inspect-skills`, `inspect-promote`, `inspect-docs`, `case-update`, `case-run`, `case-open`, `case-close`, `case-auto`, `backlog-review`）

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | .agentdev/extensions/skills/*.yaml, .agentdev/extensions/commands/*.yaml |
| 2 | 意味上の主張 | 標準 SKILL/command に対する project 固有 extension（doc パス解決等） |
| 3 | 適用範囲 | repository-local |
| 4 | 検出観点 | MOVE（extension と SKILL.md の記載が重複する場合、extension は上書き・補完位置） / DRIFT（SKILL.md 変更時に extension の追従漏れの恐れ、IR-056 が検出対象） |
| 5 | 処置方針 | KEEP（project-extensions 機構は ADR-0135 で確立） / REFERENCE（extension は SKILL.md を正として補完） |
| 6 | 正規所有者候補 | .agentdev/extensions/**（プロジェクト固有 SSoT）+ src/opencode/skills/**（標準 SSoT） |
| 7 | 移送または統合先 | N/A |
| 8 | 導出元 | extension は標準 SKILL.md を前提として補完 |
| 9 | 公開動作への影響 | 無（extension は配布物ではなくプロジェクト固有） |
| 10 | 未決事項 | extension と SKILL.md の記載重複解消は再編フェーズ判断 |
| 11 | 判断根拠 | ADR-0135（project-extensions 機構）、REQ-0160、IR-056（project-extensions integrity） |

### O. 索引類（README 群 + DOC-MAP + mapping-table、8 件）

所属: `docs/README.md`, `docs/DOC-MAP.md`, `docs/requirements/README.md`, `docs/requirements/mapping-table.md`, `docs/adr/README.md`, `docs/specs/README.md`, `docs/guides/README.md`, `docs/requirements/retired/README.md`

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | docs 直下および各サブディレクトリ |
| 2 | 意味上の主張 | 各階層の索引・案内・件数表明・移行表 |
| 3 | 適用範囲 | standard |
| 4 | 検出観点 | DRIFT（README 群の件数・一覧と実体のずれ。AG-005 に集約） / DUPLICATE（docs/README.md と各 README の重複記述） |
| 5 | 処置方針 | KEEP（索引類の存在意義は ADR-0110 で確立） / DERIVE（件数・一覧は実ファイルから GENERATE 可能、AG-006 候補） / REFERENCE（DOC-MAP.md は補助索引、基準は REQ/ADR/SPEC） |
| 6 | 正規所有者候補 | 実ファイル群（REQ/ADR/SPEC/command/skill）が SSoT、README は索引 |
| 7 | 移送または統合先 | docs/DOC-MAP.md と docs/README.md の重複は DOC-MAP を探索経路インデックス・docs/README をハブとして整理（再編フェーズ判断） |
| 8 | 導出元 | 件数表明列は実ファイル列挙から GENERATE 可能 |
| 9 | 公開動作への影響 | 無 |
| 10 | 未決事項 | README 件数の GENERATE 化範囲（再編フェーズ） |
| 11 | 判断根拠 | ADR-0110（DOC-MAP 採用）、agentdev-doc-map スキル（DOC-MAP は補助索引の位置づけ） |

### P. repo-local ツール（`.opencode/` 配下）

所属: `.opencode/skills/repo-agentdev-integrity/SKILL.md` + scripts/* (lint_skills.ts, check_integrity.ts, check_extensions.ts, check_distribution_boundary.ts, check_command_format.ts, check_changed_docs.ts, check_templates.ts 等) + references/* + baselines/* + `.opencode/commands/repo/docs-check.md` + `.opencode/commands/repo/templates/docs-check/standard.md`

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | .opencode/skills/repo-agentdev-integrity/（自己ホストリポジトリ専用ツール） |
| 2 | 意味上の主張 | docs-check 検証スクリプト群・IR-* ルールの機械実装・baseline 管理 |
| 3 | 適用範囲 | repository-local |
| 4 | 検出観点 | MOVE（IR-* SPEC ルールと scripts/*.ts の実装が 1:1 で対応、正規所有者は SPEC） / DRIFT（baseline JSON と実検出結果の同期） |
| 5 | 処置方針 | KEEP（repo-local は自己ホスト専用、ADR-0106 で /repo/* namespace 確立） / REFERENCE（scripts は IR-* SPEC を正として実装） |
| 6 | 正規所有者候補 | docs/specs/integrity/rules/IR-*.md（ルール SSoT）+ .opencode/skills/repo-agentdev-integrity/scripts/*.ts（実装 SSoT） |
| 7 | 移送または統合先 | N/A |
| 8 | 導出元 | scripts の検出結果は baseline JSON として保持、SPEC ルールから GENERATE 可能な検出器実装は再編フェーズ判断 |
| 9 | 公開動作への影響 | 有（/repo/docs-check は公開 repo-local command）。本監査では編集しない |
| 10 | 未決事項 | IR-* 追加時の scripts 拡張自動化（再編フェーズ） |
| 11 | 判断根拠 | ADR-0106（/repo/* namespace）、REQ-0144/0145（docs-check/integrity 運用是正） |

### Q. 監査台帳自身（本ファイル）

| # | 項目 | 値 |
|---|---|---|
| 1 | 現在の所有者 | .agentdev/drafts/audit-ledger-governance-system-audit.md |
| 2 | 意味上の主張 | 第1フェーズ監査成果物（AG-001〜AG-006 + 4硬制約遵守） |
| 3 | 適用範囲 | one-time |
| 4 | 検出観点 | RETIRE（再編完了後または自動化機構移行完了後に廃棄、計画 Section 5.3 + Section 10） |
| 5 | 処置方針 | RETIRE（条件付き。廃棄条件は下部「廃棄条件」セクションに明記） |
| 6 | 正規所有者候補 | 本監査フェーズ（継続所有者なし、廃棄後は参照なし） |
| 7 | 移送または統合先 | N/A（廃棄後は再編フェーズの入力として参照した後に破棄） |
| 8 | 導出元 | 本台帳は実ファイル列挙 + README 索引類から DERIVE された分析成果物 |
| 9 | 公開動作への影響 | 無 |
| 10 | 未決事項 | 廃棄時期の明確化（再編フェーズ完了 or 自動化移行完了、いずれか早い方） |
| 11 | 判断根拠 | 計画 Section 5.3（one-time 定義）、Section 10（恒久手作業管理機構化禁止）、CR-002（自動化移行で廃棄） |

## 正規所有者マップ（AG-004）

「一つの意味、契約、状態、判断基準に一つの正規所有者」（計画 Section 4）原則に照らした移送候補。

| 意味・契約 | 現所有者 | 正規所有者 | 処置 | 備考 |
|---|---|---|---|---|
| ワークフロー横断契約 | docs/specs/foundations/workflow-contracts.md（旧版縮小）+ docs/specs/workflows/workflow-contracts.md（新版） | docs/specs/workflows/workflow-contracts.md | REFERENCE | 旧版は docs/README.md で「縮小済み参照ファイル」明示済み。物理統合は再編判断 |
| QG-1〜QG-4 契約 | docs/specs/quality/quality-gates.md（SPEC）+ src/opencode/skills/agentdev-quality-gates/SKILL.md + references/* | docs/specs/quality/quality-gates.md（契約正）+ agentdev-quality-gates SKILL（運用ビュー） | KEEP（二重保持は仕様、SPEC が契約・SKILL が運用） | REQ-0140 が分割を定義 |
| 整合性ルールカタログ | docs/specs/integrity/integrity-rule-catalog.md + 各 IR-*.md | 各 IR-*.md（個別ルール SSoT） | DERIVE | catalog は IR-* から GENERATE 可能（AG-006 候補） |
| ADR 索引・件数 | docs/adr/README.md | 各 ADR-*.md（実体 SSoT） | DERIVE + REFERENCE | README 件数表記は実体から GENERATE 可能。キャプション「24件」は ADR-0137 追加時の更新漏れ（AG-005 不整合 #1） |
| REQ 索引・件数 | docs/requirements/README.md | 各 REQ-*.md（実体 SSoT） | DERIVE + REFERENCE | README 54 件表記は実測と一致 |
| DOC-MAP | docs/DOC-MAP.md | 実ファイル配置（REQ/ADR/SPEC） | REFERENCE | agentdev-doc-map スキルが「DOC-MAP は補助索引、基準は実ファイル」と明示 |
| doc-writing 查読規範 | src/opencode/skills/agentdev-doc-writing/SKILL.md + japanese-tech-writing SKILL（AGENTS.md 経由参照） | japanese-tech-writing スキル（原本） | REFERENCE | ADR-0134 / REQ-0159-001 で配布物依存スキルの src 昇格方針 |
| コマンド手順・契約 | src/opencode/commands/agentdev/{command}.md（手順）+ docs/specs/commands/{command}.md（契約） | 各ファイルが役割 SSoT | KEEP（二重保持は設計、REQ-0103） | command 定義 = 手順 SSoT、command SPEC = 契約 SSoT |
| ローカル版導入方式 | docs/specs/local/local-generation.md（生成方式記述）+ ADR-0131（link mode） | ADR-0131 | REFERENCE | local-generation の生成方式記述は歴史参照に縮小（再編判断） |
| project-extensions 機構 | docs/specs/foundations/project-extensions.md + docs/specs/responsibilities/artifact-contracts.md | docs/specs/foundations/project-extensions.md | KEEP（foundations を正、responsibilities は参照） | 再編で主張重複解消を判断 |
| REQ-0157 番号 | （不在） | docs/requirements/REQ-*.md 番号体系 | 未決（欠番として維持か再利用か再編で確認） | 実測: REQ-0156 → REQ-0158（REQ-0157 は root/retired いずれにも不在） |
| IR-045 番号 | （不在） | docs/specs/integrity/rules/IR-*.md 番号体系 | 未決（欠番として維持か再利用か再編で確認） | 実測: IR-044 → IR-046（IR-045 は不在） |

## 定量不整合検出（AG-005）

実ファイル列挙結果（AG-001）と索引類の記載を照合した結果。既知3不整合を初期データとして含み、横断的に検出した追加不整合も記録する。

### 不整合 #1: ADR README 現行基盤ビュー表キャプション「accepted 24件」（既知）

- 対象ファイル: `docs/adr/README.md`
- 箇所: L7「承認済みステータス（accepted）の ADR-01XX **24件**が、現在のアーキテクチャ判断の基盤である。」
- 実測1（同 README の現行基盤ビュー表 L13-37 の行数）: 25 行
  - 内訳: ADR-0101, 0102, 0103, 0104, 0105, 0106, 0107, 0108, 0109, 0110, 0112, 0114, 0123, 0124, 0125, 0127, 0128, 0129, 0130, 0131, 0132, 0135, 0136, 0137, 0138（25 件）
- 実測2（`docs/adr/ADR-*.md` の `status:` frontmatter が `accepted` の件数）: 25 件
- 整合: キャプション（24件）≠ 表行数（25）≠ 実測 accepted（25）
- 根拠: ADR-0137 追加時にキャプションを更新せず、表とステータス別ビューのみ追記した可能性が高い
- 処置（再編フェーズ判断）: キャプション「24件 → 25件」に修正

### 不整合 #2: ADR README ステータス別ビュー「承認済み」リストに ADR-0137 欠落（既知）

- 対象ファイル: `docs/adr/README.md`
- 箇所: L44-69「ステータス別ビュー > 承認済み（accepted）」リスト
- 実測: リストは 24 件（ADR-0101〜ADR-0138 のうち ADR-0137 を除く accepted 25-1=24 件）
- 整合: accepted 実測 25 件 vs リスト 24 件 = ADR-0137 が リストから欠落
- 補足: ADR-0137 は「現行基盤ビュー」表（L36）には掲載済み、Decision Map（L202）にも ADR-0138 からの relates-to で掲載済み、関連 REQ 表（L237）には ADR-0138 経由で間接掲載。唯一「承認済み（accepted）」ステータス別リストから脱落している
- 処置（再編フェーズ判断）: 「承認済み（accepted）」リストへ ADR-0137 を追加

### 不整合 #3: REQ-0157 未使用番号（既知）

- 対象: `docs/requirements/REQ-0157.md`（root）, `docs/requirements/retired/REQ-0157.md`（retired）
- 実測: 両パスともファイル不在
- 関連記載: `docs/requirements/README.md` は REQ-0101〜0163 の 54 件を列挙、REQ-0157 を飛ばして REQ-0156 → REQ-0158 と連番。`docs/README.md` L3「REQ-0101 から REQ-0163 までの 54 件」も 54 件で一致（欠番含まず）
- 整合: 0101-0163 の範囲で欠番 7 個（0111, 0115, 0116, 0117, 0118, 0120, 0121, 0122 = 廃止済み、retired 移動済み）+ 0157 = 計 8 個の欠番。0101-0163 は 63番号、63 - 8 = 55 だが実測 54 件のため、廃止 8 個のうち REQ-0111 は retired にある（0111, 0115-0118, 0120-0122 の 8 件はすべて retired に存在確認済み）。よって 0157 は純粋な未使用番号
- 処置（再編フェーズ判断）: 欠番として維持するか、採番管理で言及するか判断。本監査では確定しない（4硬制約「未決事項確定不可」）

### 追加不整合 #4: IR-045 未使用番号（新規検出）

- 対象: `docs/specs/integrity/rules/IR-045-*.md`
- 実測: ファイル不在（IR-044 の次は IR-046）
- 関連記載: `docs/specs/integrity/integrity-rule-catalog.md` の記載との整合要確認
- 処置（再編フェーズ判断）: 欠番として維持するか、採番管理で言及するか判断。本監査では確定しない

### 追加不整合 #5: ADR README のトピック別ビューから ADR-0137 欠落

- 対象ファイル: `docs/adr/README.md`
- 箇所: L109-119「トピック別ビュー > ワークフロー」
- 実測: トピック別ビューのワークフロー分類に ADR-0137 が含まれない（ADR-0138 は含まれる）
- 整合: ADR-0137（case-auto における case-run インライン実行）はワークフロー系 ADR だが、トピック別ビューに未分類
- 処置（再編フェーズ判断）: トピック別ビューへの追加を検討

### 追加不整合 #6: docs/README.md の ADR README リンク欠落可能性

- 対象ファイル: `docs/README.md`
- 実測: docs/README.md の ADR セクション（L142 付近「ADR」セクション）は `[ADR インデックス](adr/README.md)` のみ。SPEC セクションに比べ詳細分類なし
- 整合: docs/README.md は SPEC を詳細列挙するが ADR は単一リンク。これは設計（ADR README が詳細ビューを担う）で不整合ではない
- 処置: KEEP（設計通り、不整合とは扱わない）

### 索引類ごとの照合サマリ

| 索引ファイル | 記載件数 | 実測件数 | 整合結果 |
|---|---|---|---|
| docs/requirements/README.md | 54 件（REQ-0101〜0163、欠番 8 個） | 54 件（同様） | 整合 |
| docs/requirements/README.md (retired) | 旧REQ 50 + α | 58 件（0001-0050 + 0111, 0115-0118, 0120-0122） | 整合（README の「50件 + 8 件 = 58 件」と実測一致） |
| docs/adr/README.md キャプション | accepted 24 件 | accepted 25 件 | 不整合（#1） |
| docs/adr/README.md 現行基盤ビュー表 | 25 行 | accepted 25 件 | 整合（表は正しい） |
| docs/adr/README.md ステータス別 accepted リスト | 24 件 | accepted 25 件 | 不整合（#2、ADR-0137 欠落） |
| docs/adr/README.md 廃止済み履歴 | ADR-0001〜0023 の 23 件 | retired 23 件 | 整合 |
| docs/README.md | REQ 54 件、SPEC 3層構造 | REQ 54、SPEC 139（3層 + 基盤） | 整合 |
| docs/specs/README.md | （未照合、再編フェーズで追加確認） | docs/specs/**/*.md 139 件 | 未決（照合保留） |
| docs/DOC-MAP.md | （DOC-MAP は補助索引、件数表明は実ファイル優先） | 実ファイルと矛盾しない範囲で整合 | 整合（補助索引のため） |
| docs/requirements/mapping-table.md | 旧REQ 50 件の移行判定 | retired 58 件（0001-0050 + 8 件）の移行判定 | 整合（mapping-table は 0001-0050 が主対象、0111-0122 は別途記載） |

## 自動化・導出化候補（AG-006）

処置方針が DERIVE または GENERATE と分類された項目の抽出。各候補に導出元と生成方法を記録する。自動化移行の最終判断・実装は再編フェーズまたは後続作業の対象（本監査では候補抽出まで）。

| # | 候補 | 導出元 | 生成方法 | 現所有者 | 備考 |
|---|---|---|---|---|---|
| 1 | 整合性ルールカタログ（integrity-rule-catalog.md）のエントリ | 各 `docs/specs/integrity/rules/IR-*.md` の frontmatter（id, title, status 等） | スクリプトが IR-* を走査し、frontmatter から catalog を再生成。`integrity-rule-catalog.md` を DERIVE 生成物に変更 | docs/specs/integrity/integrity-rule-catalog.md | docs-check 拡張。AGENTS.md に「DRIFT を catalog が検出」とあるが、catalog 自身が drift する可能性を作らないためにも GENERATE 化が有効 |
| 2 | ADR README 件数・一覧 | 各 `docs/adr/ADR-*.md` の frontmatter（status, title, date） | スクリプトが ADR-* を走査し、status 別・トピック別に README のリストを再生成 | docs/adr/README.md | 不整合 #1, #2, #5 を根絶。生成物とすれば ADR-0137 のような追記漏れが起きない |
| 3 | REQ README 件数・一覧 | 各 `docs/requirements/REQ-*.md` の frontmatter（id, title） | スクリプトが REQ-* を走査し、README の表を再生成 | docs/requirements/README.md | 現状整合しているが、今後の追記漏れ防止に有効 |
| 4 | rule-ownership.md のルール所有権マトリクス | 各 IR-*.md の所有者情報 + 各スキルの責務宣言 | IR-* と SKILL.md を突合して所有権マトリクスを再生成 | docs/specs/integrity/rule-ownership.md | DUPLICATE 削減 |
| 5 | req-health-metrics / spec-health-metrics の数値項目 | 実ファイル REQ/SPEC 件数、検証結果、整合性スコア | metrics 計算スクリプトが週次等で再生成 | docs/specs/quality/req-health-metrics.md, spec-health-metrics.md | REQ-0144/0145 の docs-check 運用是正と親和 |
| 6 | doc-writing 查読観点の重複部分 | japanese-tech-writing スキル（原本） | doc-writing SKILL.md の「原本は japanese-tech-writing」と明示されている部分を、japanese-tech-writing から REFERENCE で参照する形式に縮小 | src/opencode/skills/agentdev-doc-writing/SKILL.md | AGENTS.md で既に原本関係を明示。REFERENCE 強化 |
| 7 | SKILL.md 概要節と機能節の重複 | docs/specs/skills/agentdev-{name}.md（契約 SSoT） | REQ-0140 SKILL.md 重複查読の優先度基準 Wave 1/2/3 に従い、SPEC を正として SKILL.md の重複部分を DERIVE 生成物に変更 | src/opencode/skills/agentdev-*/SKILL.md | 再編フェーズ段階処置（Wave 1 高優先度から） |
| 8 | DOC-MAP の一部記載 | 実ファイル配置（REQ/ADR/SPEC のパスと存在） | DOC-MAP は「探索経路インデックス」に徹し、件数・一覧は実ファイルから GENERATE | docs/DOC-MAP.md | ADR-0110 で DOC-MAP を補助索引と確立済み |

## 未決事項一覧

本監査では「未決事項確定不可」（4硬制約）に従い、以下を確定せず列挙のみ。

| ID | 未決事項 | 再編フェーズでの検討事項 |
|---|---|---|
| U-001 | REQ-0157 欠番の扱い | 採番ミスか意図的予約か。欠番維持か再利用か（不整合 #3） |
| U-002 | IR-045 欠番の扱い | 採番ミスか意図的予約か。欠番維持か再利用か（不整合 #4） |
| U-003 | ADR README キャプション「24件」の修正 | 「25件」への修正（不整合 #1） |
| U-004 | ADR-0137 のステータス別ビュー accepted リスト追加 | リストへ追加（不整合 #2） |
| U-005 | ADR-0137 のトピック別ビュー分類 | ワークフロー分類への追加（不整合 #5） |
| U-006 | REQ-0102 SPLIT 可否 | 79 要件行で肥大化。CR-004 指摘。SPLIT または UPDATE の内容分割 |
| U-007 | foundations/workflow-contracts.md と workflows/workflow-contracts.md の物理統合 | 現状は縮小参照关系。物理統合するか参照关系維持か |
| U-008 | catalog / rule-ownership の GENERATE 化範囲 | 自動化候補 #1, #4 の最終判断 |
| U-009 | SKILL.md 重複查読の段階的処置（Wave 1/2/3） | REQ-0140 基準に従う優先度順の処理計画 |
| U-010 | local-generation.md の記述縮小範囲 | ADR-0131 link mode 移行後の生成方式記述の歴史参照化 |
| U-011 | project-extensions 関連の foundations/responsibilities 統合 | 重複主張の集約先 |
| U-012 | extension と SKILL.md の記載重複解消 | extension の補完範囲と SKILL.md の標準範囲の境界 |
| U-013 | 監査台帳の廃棄時期 | 再編フェーズ完了時か自動化移行完了時か、いずれか早い方を確定 |
| U-014 | command SPEC と command 定義の粒度差整備 | どちらに何を載せるかの運用ガイドライン |
| U-015 | ADR README の docs/specs/README.md との照合 | 本監査では照合保留、再編フェーズで追加確認 |

## 廃棄条件

本監査台帳は one-time ライフサイクル（計画 Section 5.1, 5.3 + Section 10 + CR-002）の中間成果物である。以下のいずれかを満たした時点で廃棄する。

1. **再編フェーズ完了時**: 再編フェーズ（別セッション）で処置割当（KEEP/MERGE/REFERENCE/DERIVE/GENERATE/RETIRE）が確定し、各処置が実行された後
2. **自動化機構移行完了時**: AG-006 候補の自動化機構への移行が完了し、本台帳の役割が完了した後

廃棄は台帳ファイル（`.agentdev/drafts/audit-ledger-governance-system-audit.md`）の削除で行う。恒久的な手作業管理機構として残さない（計画 Section 10「監査台帳と照合表を新しい恒久的な手作業管理機構として残してはならない」準拠）。

## 4硬制約遵守状況（計画 Section 1）

| 制約 | 遵守状況 | 証跡 |
|---|---|---|
| 新規REQ/ADR原則追加不可 | 遵守 | 本監査は REQ/ADR/SPEC ファイルを一切作成・変更・削除していない（成果物は `.agentdev/drafts/` 配下のみ） |
| 公開command動作不改 | 遵守 | `src/opencode/commands/agentdev/*.md`, `src/opencode/skills/agentdev-*/SKILL.md`, `.opencode/commands/repo/*.md`, `.opencode/skills/repo-agentdev-integrity/**` を一切編集していない |
| 監査前の一括退役禁止 | 遵守 | 監査対象ファイルの退役・削除を行っていない。RETIRE 処置方針は台帳の記録のみ（未決事項 U-001〜U-015 を確定せず列挙） |
| 未決事項確定不可 | 遵守 | 未決事項一覧（U-001〜U-015）を確定せず列挙のみ。処置方針・正規所有者は「候補」として記録、最終判断は再編フェーズに委譲 |

## See Also

- 計画本文: Issue #1596（第1フェーズ定義、4硬制約、CR-001〜008）
- 計画 Section 5（三軸分類定義）、Section 6（11項目台帳定義）、Section 10（恒久管理機構化禁止）
- 関連 ADR: ADR-0110（DOC-MAP 採用）、ADR-0123（SPEC lifecycle）、ADR-0135（project-extensions）、ADR-0136（harness 境界浄化）
- 関連 REQ: REQ-0103（Artifact 責任分界）、REQ-0140（文書品質ゲート）、REQ-0144/0145（docs-check 運用）、REQ-0156（基盤 SPEC ドメイン）、REQ-0160（project-extensions）、REQ-0162（harness 境界）、REQ-0163（subagent 委譲プロトコル）
- 関連 SPEC: docs/specs/foundations/document-model.md、docs/specs/responsibilities/document-type-responsibilities.md、docs/specs/integrity/integrity-contracts.md
- 関連スキル: agentdev-doc-map（DOC-MAP 補助索引の位置づけ）、agentdev-doc-writing（文書品質ゲート）、agentdev-quality-gates（QG-3 実施）
