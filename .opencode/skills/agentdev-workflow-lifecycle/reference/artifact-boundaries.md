# アーティファクト責務境界

Anchored Developmentモデル、アーティファクトの責務境界、docs/構造、スキル間依存関係を定義する。

## Anchored Development モデル

agentdev系ワークフローはAnchored Developmentモデルに基づく。4つの相互接続アーティファクトで構成される。

| アーティファクト | 役割 | 格納先 |
| ---------------- | ---- | ------ |
| REQ（要件doc） | ユーザー視点の要件（目的/要件/適用範囲） | `docs/requirements/REQ-{NNNN}.md` |
| コード | 実装そのもの | ソースコード |
| テスト | 振る舞い仕様 | テストファイル |
| ADR | アーキテクチャ判断 | `docs/adr/ADR-*.md` |

これに加えて、システムの現在の姿を表す2つの「生きた仕様」を維持する。

| 仕様 | 役割 | 格納先 |
| ---- | ---- | ------ |
| system.md | システム全体の現在の仕様 | `docs/specs/system.md` |
| patterns.md | 実装パターン・規約 | `docs/specs/patterns.md` |

## ワークフロー

```
REQ → Issue → Work Plan（動的）→ TDD実装 → specs更新
```

- **Work Plan**: case-run で生成・実行。Issue単位で動的に変化する。
- **specs更新**: case-run で実装中に system.md/patterns.md を更新し、case-close で更新内容を検証する。

## アーティファクト責務境界

Command・Skill・Template・Scriptの4種類アーティファクトは以下の責務境界に従う。

| アーティファクト | 格納先 | 責務 |
|------------------|--------|------|
| **Command** | `.opencode/commands/` | 公開APIと高レベル実行骨格（Input/Output/Steps + Skill/Script参照）。原則100行以内、Steps 5〜12個 |
| **Skill** | `.opencode/skills/` | 再利用可能な判断基準と大きな状態機械（判定基準・フォーマット・ポリシー・状態遷移） |
| **Template** | 責任範囲に基づく分散配置（下記参照） | 出力構造とプレースホルダー（変数置換で使用、ロジックは含まない） |
| **Script** | Skill配下 `scripts/` または共通場所 | 決定的でテスト可能な処理（validation・transformation・generation・formatting） |

### Command

**置くもの**:
- ユーザー向け入口
- Input / Output
- 高レベル Steps（5〜12個）
- 使用する Skill（frontmatter load_skills + Steps 内参照）
- 成果物の読み書き対象
- command 固有 Guardrails

**置かないもの**:
- 大きな状態機械
- 詳細な判定表
- schema
- template
- script
- 共通安全手順
- 複数 command で使う workflow protocol

### Skill

**置くもの**:
- 再利用可能な判断基準
- domain knowledge
- workflow protocol
- safety protocol
- テンプレート選定ルール
- owner artifact の構造定義

### Template

**置くもの**:
- 出力構造
- 見出し
- 必須/任意マーカー
- プレースホルダー

### Script

**置くもの**:
- 採番
- validation
- INDEX 生成
- Markdown 更新
- 整合性チェック

### Orchestration skill 作成判断基準

以下のいずれかを満たす場合にのみ orchestration skill 化を認める:

- 大きな状態機械を持つ
- 再開ポイント検出が必要
- CI loop を含む
- Wave scheduling を含む
- サブエージェント protocol を含む

---

- Commandは手続きを記述し、Skillは宣言的知識を提供する。CommandがSkillを参照し、その逆は不可。
- Scriptは独立した単体テストが可能な純粋関数・決定的処理に限定する。非決定的な処理（API呼び出し・ユーザー対話）はScriptに含めない。
- `1 command = 1 orchestration skill` は原則とはしない。大きな状態機械・再開ポイント・CI loop・Wave scheduling・サブエージェント protocol を持つ場合にのみ orchestration skill 化を認める。
- TemplateはIssue/PR本文の生成にのみ使用し、ロジックは含まない。
- テンプレートは責任範囲に基づいて配置される:

| テンプレート種別 | 配置先 | 所有スキル |
|---|---|---|
| Issue/コメント系（12種） | `.opencode/skills/agentdev-workflow-templates/templates/` | `agentdev-workflow-templates` |
| REQ（`doc_requirement.md`） | `.opencode/skills/agentdev-req-file-manager/templates/` | `agentdev-req-file-manager` |
| ADR（`doc_adr.md`） | `.opencode/skills/agentdev-adr-file-manager/templates/` | `agentdev-adr-file-manager` |
| 乖離検出（`report_spec_compliance.md`） | `.opencode/skills/agentdev-spec-compliance/templates/` | `agentdev-spec-compliance` |
| PR説明（`pr_desc.md`） | `.opencode/skills/agentdev-workflow-templates/templates/` | `agentdev-workflow-templates` |

### 生きた仕様（Living Specs）

アーティファクトとは別に、システムの現在の姿を表す「生きた仕様」を維持する。

| 仕様 | 格納先 | 役割 |
|------|--------|------|
| system.md | `docs/specs/system.md` | システム全体の現在の仕様 |
| patterns.md | `docs/specs/patterns.md` | 実装パターン・規約 |
| design-principles.md | `docs/specs/design-principles.md` | 設計判断の根拠・指針 |
| quality-specs.md | `docs/specs/quality-specs.md` | 品質基準・検証ルール |

- 生きた仕様は`case-run`で更新・`case-close`で検証される。

## docs/ 構造（4区分）

agentdev系ワークフローで操作する docs/ の4区分構造。

| 区分 | パス | 役割 | 自動操作コマンド |
|------|------|------|----------------|
| guides/ | 開発ガイド（参照のみ） | setup.md, api-reference.md, testing-and-debugging.md | — |
| requirements/ | 要件管理（目的/要件/適用範囲） | README.md + INDEX.md（generated）+ core.md（暫定area）+ {area}.md + REQ-{NNNN}.md（移行対象） | req-save(CREATE), case-open(READ), case-update(UPDATE) |
| adr/ | ADR | README.md + ADR-{NNNN}.md | agentdev-adr-guidelines(CREATE) |
| specs/ | システム仕様 | system.md, patterns.md | case-run(READ+WRITE), case-close(VERIFY) |

learning（`.agentdev/learning/`）と integrity（`.agentdev/integrity/`）の domain state は [domain-state-lifecycle](../../../docs/guides/domain-state-lifecycle.md) を参照。

## スキル間依存関係

agentdev-workflow-lifecycle は他の専門スキルが提供する知識を概念的に参照する。

| スキル名           | 提供する知識                                                   |
| ------------------ | -------------------------------------------------------------- |
| `agentdev-req-analysis`     | 要件分析手法（要件の展開観点、壁打ちメソドロジー）   |
| `agentdev-spec-compliance`    | 仕様適合性検出（実装と要件の乖離基準、ループバック判定）        |
| `agentdev-adr-file-manager` | ADRファイルの作成・追記・更新操作とバリデーション               |
| `agentdev-adr-guidelines`   | ADR作成の必要性判定基準・ライフサイクル定義                     |
| `agentdev-req-file-manager` | REQファイルの作成・追記・更新操作とバリデーション               |

**実行時依存**: agentdev-workflow-lifecycleは一方向依存であり、他スキルの実行時にimport/requireされることはない。ただし、他スキルのSee Alsoセクションから概念的に参照されることはある（例: `agentdev-adr-file-manager` のSee Alsoにagentdev-workflow-lifecycleが含まれる）。

## 参照

- **SSoT遷移ルール**: [`reference/ssot-transitions.md`](./ssot-transitions.md)
- **コマンド関連マップ**: [`reference/command-map.md`](./command-map.md)
- **Pattern Registry**: [`reference/pattern-registry.md`](./pattern-registry.md)