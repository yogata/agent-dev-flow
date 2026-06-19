---
draft_type: req-draft
topic_slug: draft-model-agent-advisory-doc-quality
status: saved
created_at: 2026-06-19T00:00:00+09:00
source_rus:
  - RU-20260619-01-structured-draft-case-auto-spec-save
  - RU-20260619-02-oh-my-openagent-advisory-integration
  - RU-20260619-03-doc-language-quality-gate
---

## 全体目的

AgentDevFlowワークフロー基盤の3系統改善を統合要件定義として整理する。

1. **draft構造化（RU-01）**: `req-define`が生成するdraftを、人間向けMarkdownから後続コマンドが処理する構造化`draft-data`（YAML）へ再設計する。draftはAPI contractではなくsoft contract（LLM推論前提・厳格schemaなし）として扱い、`artifact_actions`の有無で後続工程の実行可否を判定する。これにより`work_type`固定分岐を廃止し、`case-auto`自走を最大化する。
2. **外部エージェント統合（RU-02）**: oh-my-openagentの`oracle`（アーキテクチャ助言）を`req-define`に、`momus`（実行計画確認）を`case-run`に組み込む。新規スキル`agentdev-architecture-advisory`を新設し、`agentdev-execution-backend`を`agentdev-case-run-execution-adapter`へ改名・スコープ限定する。
3. **文書表記・文意品質ゲート（RU-03）**: `docs/`配下の英語混じり・文意不明瞭表現（`read-only`, `advisor`, `architecture-affecting`等）を文脈ベースで是正し、再発防止のため`agentdev-no-ai-slop-writing`スキルに文書品質ゲートを追加する。新規integrityルールIR-045を新設する。

---

## OU-001: REQ-0138 CREATE — 構造化req_draft契約

### 目的

`req-define`のdraftを、後続コマンド（`req-save`, `spec-save`, `case-open`, `case-auto`, `case-run`, `case-close`）が処理するための構造化合意結果ファイルへ変更する。draftはsoft contract（producer-side standard・LLM推論前提・厳格schemaなし）として扱い、`artifact_actions`の有無で後続工程の実行可否を判定する。これにより`work_type`固定分岐を廃止する。

### 要件

| ID | 要件 |
|---|---|
| REQ-0138-001 | req_draftの正は人間向けMarkdown本文ではなく構造化されたdraft-dataであること |
| REQ-0138-002 | 人間向けsummaryや補足本文は任意であり、後続処理の正として扱われないこと |
| REQ-0138-003 | req_draftは最終合意の処理契約であり、検討経緯や採用しない方針を処理対象として残さないこと |
| REQ-0138-004 | req_draftはAPI contractではなく、後続エージェント推論を安定させるsoft contractとして扱うこと |
| REQ-0138-005 | req_draftには厳格なschema version・JSON Schema相当の型定義・旧version互換処理を導入しないこと |
| REQ-0138-006 | req-defineは主要フィールド名と分類単位を安定させたproducer-side standardに従ってdraftを出力すること |
| REQ-0138-007 | 後続コマンドは構造化フィールドを主入力として読み、不足・矛盾・未解決事項がある場合に停止理由を報告すること |
| REQ-0138-008 | req_draftの構造化データは項目数を増やして短い値を多数並べるのではなく、合意本文と成果物更新内容を必要十分な長文として保持すること |
| REQ-0138-009 | REQ/ADR/SPECへの保存対象は成果物別トップレベル配列に分散させず、標準モデルとして一つのartifact_actionsに統合すること |
| REQ-0138-010 | workflow_routeは派生値として扱い、req_draftに保存しないこと |
| REQ-0138-011 | req_draftの標準フィールドはauto_gate, agreed_items, artifact_actions, conflict_resolutions, operation_units, case_open_hintsを中心とすること |
| REQ-0138-012 | 後続コマンドの入力処理は厳格parser/schema validatorではなく、LLM推論による構造化フィールド解釈を前提とすること |
| REQ-0138-013 | auto_gate.auto_readyがfalse、または未解決質問・未解決衝突・repo外操作・停止理由が残る場合、後続コマンドは停止すること |
| REQ-0138-014 | conflict_resolutionsに記録済みの衝突について、後続コマンドは同じ内容をユーザーへ再確認しないこと |
| REQ-0138-015 | case-open成功後はIssue/EpicをSSoTとし、req_draftは削除されてよい一時成果物となること |
| REQ-0138-016 | case-open成功後のcase-run/case-close/case-autoはIssue/Epic側の永続状態をSSoTとすること |
| REQ-0138-017 | artifact_actionsの粒度はREQ-ID単位ではなく、1つのartifactに対する1つのまとまった編集意図（同一編集関心）単位とすること |

### 適用範囲

- **対象**: req-define, req-save, spec-save, case-open, case-auto, case-run, case-close, draft出力契約, SSoT遷移
- **対象外**: 実装コードの変更、GitHub Issue/PR階層の決定（case-open責務）、外部エージェントの実装・設定

---

## OU-002: REQ-0139 CREATE — 外部エージェント統合契約

### 目的

AgentDevFlowのワークフローに、OpenCodeプラグインとして別途導入される外部エージェント（oracle, momus）を組み込む。AgentDevFlow側は外部エージェントの実装を同梱せず、どの工程で・どの責務範囲で利用するかのワークフロー契約のみを定義する。

### 要件

| ID | 要件 |
|---|---|
| REQ-0139-001 | AgentDevFlow側はOpenCodeプラグインとして提供される外部エージェントの実装・設定・agent定義を同梱せず、ワークフロー上の契約のみを定義すること |
| REQ-0139-002 | 外部エージェントの出力はアーキテクチャ助言または実行計画確認の結果として扱い、外部エージェントが直接確定事項として扱う情報源としないこと |
| REQ-0139-003 | oracleは助言のみを返し、draft・REQ・ADR・SPEC・Issue・PRを直接更新しないこと。最終判断は親エージェントが保持すること |
| REQ-0139-004 | 親エージェントは外部アーキテクチャ助言を確定事項・推定事項・ユーザー確認事項・ブロッカーに分類し、裏付けのない内容を要件本文へ確定事項として混入させないこと |
| REQ-0139-005 | 外部助言エージェントが利用できない状態で助言確認が必要な条件に該当する場合、req-defineはブロッカーとして報告し、静かにスキップしないこと |
| REQ-0139-006 | momusは実装開始前の実行計画確認を担う外部エージェントであり、QG-3（実装差分確認）・QG-4（完了条件チェックボックス最終評価）のいずれの代替にもならないこと |
| REQ-0139-007 | AgentDevFlowの永続状態は既存のdraft/Issue/PR/REQ/ADR/SPECに限定し、外部実行手段の中間成果物の内部構造を永続状態として扱わないこと |
| REQ-0139-008 | case-runの実行担当サブエージェントは外部実行手段を呼び出して実装・検証・PR作成を進め、completed(pr)/blocked/failedのいずれか1状態をcase-runに返すこと |
| REQ-0139-009 | req-defineはアーキテクチャに影響する要件（既存REQ/ADR/SPECとの衝突可能性・ADR候補・責務境界変更・複数コマクト跨ぐ判断）で、ADR判断確定前に外部アーキテクチャ助言確認を行うこと |

### 適用範囲

- **対象**: req-define（oracle助言）, case-run（momus確認・実行担当サブエージェント）, 外部エージェント出力のSSoT境界
- **対象外**: oh-my-openagentの実装・設定・agent定義、QG-3/QG-4の評価・更新（case-close責務）、Issue完了条件チェックボックスの更新

---

## OU-003: REQ-0140 CREATE — 文書表記・文意品質ゲート

### 目的

`docs/`配下の現行文書に残る英語混じり・文意不明瞭な表現を是正するとともに、今後の再発を防止するため`agentdev-no-ai-slop-writing`スキルに文書表記・文意品質ゲートを追加する。このゲートはQG-1〜QG-4の主ゲート体系を置き換えず、docs作成・編集時に併用される付帯品質ゲートとして扱う。

### 要件

| ID | 要件 |
|---|---|
| REQ-0140-001 | agentdev-no-ai-slop-writingスキルは文書表記・文意品質ゲートを含むこと |
| REQ-0140-002 | 文書表記・文意品質ゲートはdocs配下の文書・REQ・ADR・SPEC・guides・DOC-MAP・README、およびdocsを生成・編集するcommand/skillの自然言語記述を対象とすること |
| REQ-0140-003 | ゲートは日本語本文の自然性、主体・対象・許可操作・禁止操作・出力先・最終判断者の明確性、英語混じり抽象語の説明なし残留を判定すること |
| REQ-0140-004 | read-onlyを「読み取り専用」と機械的に置換しないこと。文脈に応じて参照専用入力・対象を直接修正しない診断・保存更新を親に残す委譲・検出報告型へ分解すること |
| REQ-0140-005 | 実際に出力生成・commit・push・git永続化を行う処理を、コマンド全体としてread-onlyと表現しないこと |
| REQ-0140-006 | architecture-affecting・Architecture advisory gate・advisor・advisory型の表現を、ADR要否・判断主体・根拠提示・最終判断の責務へ分解すること |
| REQ-0140-007 | forbidden-phrases.mdの文意修正ルールは単なる語彙リストではなく、英語混じり表現を具体的な操作・責務・判断条件へ書き換える検出ルールとして構成すること |
| REQ-0140-008 | read-only系表現を用いる場合、何を変更しないか・何を読み取ってよいか・何を生成してよいか・commit/pushの可否・Issue/PR更新の可否・最終判断主体を明記すること |
| REQ-0140-009 | 対象を直接修正しない診断コマンドは、許可出力（検出結果・根拠・推奨処理先・レポート・intake item）と禁止操作（検査対象ファイル変更・許可範囲外commit/push・Issue/PR更新）を明記すること（WAS-REQ-0103） |
| REQ-0140-010 | サブエージェント委譲の共通契約は読解・検査・分類・候補抽出・根拠提示に限定し、保存・Issue/PR更新・commit・push・ユーザー確認・完了報告は親コマンドが保持すること（WAS-REQ-0103） |
| REQ-0140-011 | 委譲定義の副作用境界の許可操作にread_onlyを使用せず、具体的な許可操作（read_files, inspect_content, return_evidence等）で表現すること（WAS-REQ-0103） |
| REQ-0140-012 | architecture-affectingは「ADR判断が必要な変更」または「ADR要否確認が必要な変更」と表現し、「アーキテクチャに影響する」のみで使用しないこと |
| REQ-0140-013 | Architecture advisory gateは「ADR要否確認ゲート」と表現すること |
| REQ-0140-014 | docsを作成・編集するcommand（req-define, req-save, spec-save, case-run, case-close, case-auto, inspect-docs, docs-check）は文書表記・文意品質ゲートを通す、またはゲートへの参照を持つこと |
| REQ-0140-015 | docsを作成・編集するskillは文書表記・文意品質ゲートへの参照または適用条件を持つこと |
| REQ-0140-016 | 文書表記・文意品質ゲートはQG-1〜QG-4の主ゲート体系を置き換えず、docs作成・編集時に併用される付帯品質ゲートとして位置づけること |
| REQ-0140-017 | src/opencode/を原本・.opencode/を配置先として扱い、docsにおいてAgentDevFlow本体のcommand/skill/template/scriptの編集対象を説明する場合は原本を参照すること |

### 適用範囲

- **対象**: agentdev-no-ai-slop-writingスキル, docs配下の現行文書, docs作成・編集command/skill, forbidden-phrases.md, IR-045
- **対象外**: QG-1〜QG-4主ゲート体系の変更、docs/配下retired文書、実装コードの動作変更

---

## 既存REQ更新候補

### REQ-0102（UPDATE + APPEND）— RU-01/02

| 既存行 | 操作 | 変更内容 |
|---|---|---|
| REQ-0102-039〜042 | supersede | OU ID指定時の部分処理・複数OU存在時停止 → draft全体処理・OU数のみを理由とした停止廃止 |
| REQ-0102-045〜048 | supersede | work_type別draft消費パターン → artifact_actions有無ベースの消費判定 |
| (新規) | APPEND | req-defineは要件doc生成ステップをREQ文書風Markdown生成からreq_draft生成へ変更すること |
| (新規) | APPEND | req-defineはdraft-meta.spec-candidatesとSPEC候補セクションを正とする旧出力をやめ、artifact_actionsのartifact:specを正とすること |
| (新規) | APPEND | req-saveはdraft全体のREQ/ADR対象artifact_actionsを処理し、SPECを編集しないこと |
| (新規) | APPEND | req-defineはアーキテクチャに影響する要件でADR判断確定前にアーキテクチャ確認ステップを実行すること |

### REQ-0114（UPDATE）— RU-01

| 既存行 | 操作 | 変更内容 |
|---|---|---|
| REQ-0114-008/009/010 | supersede | work_type固定分岐（feature/bugfix別パイプライン） → artifact_actions有無ベース分岐 |
| REQ-0114-052/053/064/065 | supersede | OU逐次処理モデル → case-open前はdraft全体処理・case-open後は子Issue単位オーケストレーション |
| (新規) | APPEND | case-autoは開始時にauto_gateを確認し、auto_ready falseまたは未解決項目が残る場合停止すること |

### REQ-0136（UPDATE）— RU-01

| 既存行 | 操作 | 変更内容 |
|---|---|---|
| REQ-0136-009/010 | supersede | doc_requirement.md SPEC候補セクション分離 → artifact_actions(artifact:spec)ベース |
| REQ-0136-012/013/014 | supersede | spec-save feature専用・OU単位spec-create/spec-update → 全work_type・draft全体SPEC保存 |
| (新規) | APPEND | spec-saveはSPEC対象artifact_actionsが空の場合no-opとして完了できること |
| (新規) | APPEND | spec-saveはSPEC statusをacceptedにしないこと（draft→accepted昇格はcase-close責務） |

### REQ-0132（APPEND）— RU-01

| (新規) | APPEND | case-openは合意済みdraft全体を入力にEpic/Wave/Issue構造を作成し、要件・衝突結論を作り直さないこと |
| (新規) | APPEND | case-openは複数OUが存在することだけを理由に停止しないこと |
| (新規) | APPEND | case-openはIssue本文に合意事項・成果物更新結果・conflict_resolutions・operation_units・完了条件入力を反映すること |

### REQ-0130（APPEND）— RU-01/02

| (新規) | APPEND | case-runは実装時に判明したSPECレベル詳細をPR本文のSPEC確定候補セクションに記録すること |
| (新規) | APPEND | case-runはoh-my-openagent利用時・実行計画ファイル作成時に実装開始前にmomus確認を依頼すること |
| (新規) | APPEND | 実行担当サブエージェントは.agentdev/intake/・.agentdev/learning/を直接変更せずPR本文に記録すること |

### REQ-0108（APPEND）— RU-03

| (新規) | APPEND | IR-045はdocs日本語表現・文意整合検査として存在すること |
| (新規) | APPEND | IR-045は識別子として正当に残る場合を区別しNG/WARNING/OK分類を返すこと |
| (新規) | APPEND | docs-check/integrity-checkは厳格schema validationではなくテンプレート存在・主要フィールド名・旧記述残存のドリフト検出に留めること |

### REQ-0119（APPEND）— RU-02

| (新規) | APPEND | agentdev-architecture-advisoryはreq-defineのアーキテクチャ確認を担う公開スキルであり、case-run実行・momus確認・ファイル編集を対象外とすること |
| (新規) | APPEND | agentdev-case-run-execution-adapterはcase-runの外部実行手段接続に責務を限定する公開スキルであり、req-define architecture確認・ADR判断・workflow状態管理・Issue完了条件評価を対象外とすること |

---

## SPEC候補

- **SC-001**: req_draft標準データモデル（frontmatter構造・fenced YAML形式・各フィールドの意味・制約・template例）
  - 想定配置先SPEC: `docs/specs/artifact-contracts.md`
  - 分離根拠: schema field・template variant（REQ-0101-068 SPEC分離基準）
  - 元候補: RU-01 Section 4.1〜4.3

- **SC-002**: artifact_actions詳細構造（id, artifact, operation, target, target_area, source_items, content各フィールドの意味と許容値）
  - 想定配置先SPEC: `docs/specs/artifact-contracts.md`
  - 分離根拠: schema field・enum値一覧
  - 元候補: RU-01 Section 4.2

- **SC-003**: case-auto工程分岐判定表（artifact=req/adr→req-save, artifact=spec→spec-save, その後case-open...）
  - 想定配置先SPEC: `docs/specs/workflow-contracts.md`
  - 分離根拠: 判定表・route詳細
  - 元候補: RU-01 Section 10

- **SC-004**: 英語混じり表現→日本語修正方針 変換テーブル（read-only, advisor, source/projection等40+語彙）
  - 想定配置先SPEC: `src/opencode/skills/agentdev-no-ai-slop-writing/references/forbidden-phrases.md`
  - 分離根拠: 値一覧・判定表
  - 元候補: RU-03 RU-DOC-LANG-002/004/009

- **SC-005**: IR-045検出ロジック・対象ファイルパターン・NG/WARNING/OK分類表
  - 想定配置先SPEC: `docs/specs/integrity-rule-catalog.md`
  - 分離根拠: checker個別ルール・fixture detail
  - 元候補: RU-03 RU-DOC-LANG-008

- **SC-006**: 委譲定義副作用境界YAML推奨例（read_files, inspect_content, classify_candidates等）
  - 想定配置先SPEC: `docs/specs/workflow-contracts.md`, `src/opencode/skills/agentdev-command-authoring/references/command-authoring-standards.md`
  - 分離根拠: YAML例・fixture detail
  - 元候補: RU-03 RU-DOC-LANG-003

- **SC-007**: docs作成・編集command/skill別の品質ゲート接続詳細テーブル
  - 想定配置先SPEC: `docs/specs/workflow-contracts.md`
  - 分離根拠: 接続テーブル・内部パラメータ
  - 元候補: RU-03 RU-DOC-LANG-006/007

- **SC-008**: oracle呼び出し位置（Step 4-4）・oracleへ渡す情報項目・得たい助言観点の詳細リスト
  - 想定配置先SPEC: `docs/specs/workflow-contracts.md`
  - 分離根拠: Step番号・観点一覧
  - 元候補: RU-02 Section 1-1

- **SC-009**: 実行担当サブエージェントの責務詳細ステップ・実行モデル図・momus結果トークン個別アクション表
  - 想定配置先SPEC: `src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md`（スキル本文）
  - 分離根拠: 作業手順・図・enum値
  - 元候補: RU-02 Section 3-1

---

## 変更影響候補

### コマンド定義（原本: src/opencode/commands/agentdev/）

| ファイル | 変更種別 | OU |
|---|---|---|
| req-define.md | 大幅改定（draft生成形式・oracle Step追加） | OU-001/002 |
| req-save.md | 大幅改定（work_type停止廃止・artifact_actions処理） | OU-001 |
| spec-save.md | 大幅改定（全work_type化・feature-only制約撤廃） | OU-001 |
| case-open.md | 改定（draft全体入力・SSoT遷移） | OU-001 |
| case-auto.md | 改定（artifact_actions分岐・auto_gate preflight） | OU-001/002 |
| case-run.md | 改定（momus確認・実行担当SA・SPEC確定候補） | OU-001/002 |
| case-close.md | 参照更新（SPEC昇格・新draft契約） | OU-001 |
| inspect-docs.md | read-only表現修正 | OU-003 |
| inspect-skills.md | read-only表現修正 | OU-003 |

### テンプレート

| ファイル | 変更種別 | OU |
|---|---|---|
| templates/req-define/req-draft.md | **新設**（draft本文テンプレート） | OU-001 |
| templates/req-define/feature.md | 完了報告テンプレートとして維持・参照更新 | OU-001 |
| templates/req-define/feature-epic.md | 同上 | OU-001 |
| templates/req-define/lightweight.md | 同上 | OU-001 |

### スキル

| ファイル | 変更種別 | OU |
|---|---|---|
| agentdev-architecture-advisory/SKILL.md | **新設** | OU-002 |
| agentdev-case-run-execution-adapter/SKILL.md | **新設**（agentdev-execution-backendから改名・再構成） | OU-002 |
| agentdev-execution-backend/ | **廃止**（改名） | OU-002 |
| agentdev-no-ai-slop-writing/SKILL.md | 拡張（文書品質ゲート追加） | OU-003 |
| agentdev-no-ai-slop-writing/references/forbidden-phrases.md | 拡張（文意修正ルール追加） | OU-003 |
| agentdev-req-analysis/SKILL.md | 参照更新 | OU-003 |
| agentdev-command-authoring/references/command-authoring-standards.md | YAML例更新 | OU-003 |
| (他docs作成・編集スキル多数) | ゲート参照追加 | OU-003 |

### docs（SPEC/REQ/ADR/guides）

| ファイル | 変更種別 | OU |
|---|---|---|
| docs/specs/artifact-contracts.md | 大幅更新（req_draft出力構造追加） | OU-001 |
| docs/specs/workflow-contracts.md | 大幅更新（工程分岐・SSoT・接続契約） | OU-001/002/003 |
| docs/specs/document-model.md | 更新（draft位置づけ） | OU-001 |
| docs/specs/integrity-rule-catalog.md | 更新（IR-045追加） | OU-003 |
| docs/specs/integrity-contracts.md | 更新（Allowed Changes Profiles修正） | OU-003 |
| docs/requirements/REQ-0102.md | UPDATE+APPEND | OU-001/002 |
| docs/requirements/REQ-0114.md | UPDATE | OU-001 |
| docs/requirements/REQ-0136.md | UPDATE | OU-001 |
| docs/requirements/REQ-0132.md | APPEND | OU-001 |
| docs/requirements/REQ-0130.md | APPEND | OU-001/002 |
| docs/requirements/REQ-0108.md | APPEND | OU-003 |
| docs/requirements/REQ-0119.md | APPEND | OU-002 |
| docs/adr/ADR-0114.md | UPDATE（参照更新・momus追加） | OU-002 |
| docs/adr/ADR-0123.md | UPDATE確認（spec-save lifecycle変更の取扱い） | OU-001 |
| (他40+docsファイル) | 英語混じり表現修正 | OU-003 |

---

## ADR判断

### 新規ADR: draft soft-contract原則（RU-01）

**判定**: 新規ADR作成（Oracle照会結果に基づく）

**決定内容**: Inter-command draft handoff artifacts（req-defineが生成しreq-save/spec-save/case-open/case-auto/case-run/case-closeが消費）は、soft contract（producer-side semantic standard・LLM推論消費・厳格schemaなし）として設計する。

**根拠**:
- 7コマンドの統合結合モデルを決定する建築的判断
- 「soft contract + LLM推論」はI/O形式変更を超えた統合アーキテクチャ決定
- False Negative防止基準該当（将来の設計・運転・文書システムを制約）
- 既存ADRとの重複なし

**採用リスク（ユーザー承認済み・全面soft contract）**:
- auto_gate/operation_units等の運用フィールドがLLM推論で非決定的に解釈されるリスク
- 同じdraftでも実行/LLM versionごとにゲート判定が変動する可能性
- producer/consumer間のサイレントドリフト
- テスト困難性・デバッグ不透明性
- → 以上をADR Consequencesに明記し、受け入れ済み

**ADR-0123取扱い**: accepted ADRの不変性規則により、spec-save lifecycleのdecision変更がある場合はsupersede、detailsのみの変更はSPECで対応。要確認。

### ADR-0114 UPDATE（RU-02）

**判定**: ADR-0114 UPDATE（決定内容補強・方針変更なし）

**内容**: スキル名参照更新（agentdev-execution-backend → agentdev-case-run-execution-adapter）・momus実行計画確認の追加・外部中間成果物の永続状態除外

### ADR不要（RU-03）

**判定**: ADR不要

**根拠**: 表現是正と品質ゲート追加はSPEC/command/skill更新領域。ADR除外条件#4（命名規約）・#5（artifact contract）・#7（template変更）に該当。

---

## SPLIT予兆

```yaml
split-forecast:
  - target: REQ-0103
    metrics:
      lines: 84
      concern_categories: 2
      artifact_types: 3
    signals:
      lines: +2
      concerns: +1
      artifacts: +1
      spec_violation: 0
    total: 4
    recommended_action: SPLIT推奨
    user_decision: SPLIT実施（2026-06-19確認）
    note: >
      REQ-0103（Artifact責任分界、84行）のSPLITを決定。
      requirements-review-finding候補として扱い、本ドラフトの保存操作とは別管理。
      RU-03のREQ-0103関連要件（REQ-0140-009〜011、WAS-REQ-0103マーク）は
      REQ-0140へ集約。REQ-0103 SPLIT実施は別途req-define/req-saveで処理。

  - target: REQ-0102
    metrics:
      lines: 56
      concern_categories: 2
      artifact_types: 2
    signals:
      lines: +1
      concerns: +1
      artifacts: +0
    total: 2
    recommended_action: SPLIT検討
    note: >
      REQ-0102は56行（51-80範囲）。
      OU-001によるUPDATE（supersede 039-042, 045-048）で行数は増減するが、
      APPEND 4行で61行程度。SPLITシグナル2だが、supersedeによる行数削減効果あり。
      本ドラフトではAPPEND/UPDATEを実施し、SPLIT要否はreq-save後の実行で評価。

  - target: REQ-0114
    metrics:
      lines: 68
      concern_categories: 2
      artifact_types: 2
    signals:
      lines: +1
      concerns: +1
      artifacts: +0
    total: 2
    recommended_action: SPLIT検討
    note: >
      REQ-0114は68行（51-80範囲）。UPDATE中心（supersede多数）のため
      行数は増減する。本ドラフトではUPDATEを実施。

  - target: REQ-0138 (new)
    metrics:
      lines: 17
      concern_categories: 1
      artifact_types: 2
    signals:
      lines: +0
      concerns: +0
      artifacts: +0
    total: 0
    recommended_action: no-action

  - target: REQ-0139 (new)
    metrics:
      lines: 9
      concern_categories: 1
      artifact_types: 2
    signals: +0
    total: 0
    recommended_action: no-action

  - target: REQ-0140 (new)
    metrics:
      lines: 17
      concern_categories: 1
      artifact_types: 3
    signals:
      lines: +0
      concerns: +0
      artifacts: +1
    total: 1
    recommended_action: no-action
```

---

## 定量データ検証メモ（Step 3-1）

- AGENTS.md記載: "REQ-0101〜REQ-0136" — **REQ-0137が未反映（古い）**
- docs/README.md記載: "REQ-0101 から REQ-0137 までの 29 件" — 正しい
- 実ファイル: REQ-0101〜REQ-0137（29件）— 確認済み
- → AGENTS.mdのREQ範囲記載を更新する必要あり（本要件の付随作業または別途）

---

## draft-meta

```yaml
work_type: feature
req-operation:
  - create: [REQ-0138, REQ-0139, REQ-0140]
  - append: [REQ-0102, REQ-0132, REQ-0130, REQ-0108, REQ-0119]
  - update: [REQ-0102, REQ-0114, REQ-0136]
target-req: [REQ-0138, REQ-0139, REQ-0140, REQ-0102, REQ-0114, REQ-0136, REQ-0132, REQ-0130, REQ-0108, REQ-0119]
adr-required: true
adr-operations:
  - create: "新規ADR: draft soft-contract原則"
  - update: ADR-0114
  - review: ADR-0123
topic-slug: draft-model-agent-advisory-doc-quality
scale: large
status: saved
upstream_handoff: false
spec-candidates: [SC-001, SC-002, SC-003, SC-004, SC-005, SC-006, SC-007, SC-008, SC-009]
```

---

## operation_units

```yaml
operation_units:
  - ou_id: OU-001
    source_ru: RU-20260619-01-structured-draft-case-auto-spec-save
    target_req: REQ-0138
    target_spec:
      - docs/specs/artifact-contracts.md
      - docs/specs/workflow-contracts.md
      - docs/specs/document-model.md
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: case_open_decides
    result: {}

  - ou_id: OU-001-APPEND
    source_ru: RU-20260619-01
    target_req: [REQ-0102, REQ-0132, REQ-0130]
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: case_open_decides
    result: {}

  - ou_id: OU-001-UPDATE
    source_ru: RU-20260619-01
    target_req: [REQ-0102, REQ-0114, REQ-0136]
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: case_open_decides
    result: {}

  - ou_id: OU-002
    source_ru: RU-20260619-02-oh-my-openagent-advisory-integration
    target_req: REQ-0139
    target_spec:
      - docs/specs/workflow-contracts.md
    operation: create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: case_open_decides
    result: {}

  - ou_id: OU-002-APPEND
    source_ru: RU-20260619-02
    target_req: [REQ-0102, REQ-0130, REQ-0119]
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: case_open_decides
    result: {}

  - ou_id: OU-003
    source_ru: RU-20260619-03-doc-language-quality-gate
    target_req: REQ-0140
    target_spec:
      - src/opencode/skills/agentdev-no-ai-slop-writing/references/forbidden-phrases.md
      - docs/specs/integrity-rule-catalog.md
      - docs/specs/workflow-contracts.md
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: case_open_decides
    result: {}

  - ou_id: OU-003-APPEND
    source_ru: RU-20260619-03
    target_req: REQ-0108
    operation: append
    scale: standard
    depends_on: [OU-003]
    recommended_order: 2
    issue_policy: case_open_decides
    result: {}
```
