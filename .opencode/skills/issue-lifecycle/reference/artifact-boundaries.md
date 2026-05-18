# アーティファクト責務境界

Anchored Developmentモデル、アーティファクトの責務境界、docs/構造、スキル間依存関係を定義する。

## Anchored Development モデル

issue-*ワークフローはAnchored Developmentモデルに基づく。4つの相互接続アーティファクトで構成される。

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

- **Work Plan**: issue-work で生成・実行。Issue単位で動的に変化する。
- **specs更新**: issue-work で実装中に system.md/patterns.md を更新し、issue-close で更新内容を検証する。

## アーティファクト責務境界

Command・Skill・Template・Scriptの4種類アーティファクトは以下の責務境界に従う。

| アーティファクト | 格納先 | 責務 |
|------------------|--------|------|
| **Command** | `.opencode/commands/` | 公開APIと高レベル実行骨格（Input/Output/Steps + Skill/Script参照）。原則100行以内、Steps 5〜12個 |
| **Skill** | `.opencode/skills/` | 再利用可能な判断基準と大きな状態機械（判定基準・フォーマット・ポリシー・状態遷移） |
| **Template** | 責任範囲に基づく分散配置（下記参照） | 出力構造とプレースホルダー（変数置換で使用、ロジックは含まない） |
| **Script** | Skill配下 `scripts/` または共通場所 | 決定的でテスト可能な処理（validation・transformation・generation・formatting） |

- Commandは手続きを記述し、Skillは宣言的知識を提供する。CommandがSkillを参照し、その逆は不可。
- Scriptは独立した単体テストが可能な純粋関数・決定的処理に限定する。非決定的な処理（API呼び出し・ユーザー対話）はScriptに含めない。
- `1 command = 1 orchestration skill` は原則とはしない。大きな状態機械・再開ポイント・CI loop・Wave scheduling・サブエージェント protocol を持つ場合にのみ orchestration skill 化を認める。
- TemplateはIssue/PR本文の生成にのみ使用し、ロジックは含まない。
- テンプレートは責任範囲に基づいて配置される:

| テンプレート種別 | 配置先 | 所有スキル |
|---|---|---|
| Issue/コメント系（12種） | `.opencode/skills/issue-template-manager/templates/` | `issue-template-manager` |
| REQ（`doc_requirement.md`） | `.opencode/skills/req-file-manager/templates/` | `req-file-manager` |
| ADR（`doc_adr.md`） | `.opencode/skills/adr-file-manager/templates/` | `adr-file-manager` |
| 乖離検出（`report_spec_compliance.md`） | `.opencode/skills/spec-compliance/templates/` | `spec-compliance` |
| PR説明（`pr_desc.md`） | `.opencode/commands/issue/templates/` | なし（Command局所） |

### 生きた仕様（Living Specs）

アーティファクトとは別に、システムの現在の姿を表す「生きた仕様」を維持する。

| 仕様 | 格納先 | 役割 |
|------|--------|------|
| system.md | `docs/specs/system.md` | システム全体の現在の仕様 |
| patterns.md | `docs/specs/patterns.md` | 実装パターン・規約 |
| design-principles.md | `docs/specs/design-principles.md` | 設計判断の根拠・指針 |
| quality-specs.md | `docs/specs/quality-specs.md` | 品質基準・検証ルール |

- 生きた仕様は`issue-work`で更新・`issue-close`で検証される。

## docs/ 構造（5区分）

issue-*ワークフローで操作する docs/ の5区分構造。

| 区分 | パス | 役割 | 自動操作コマンド |
|------|------|------|----------------|
| guides/ | 開発ガイド（参照のみ） | setup.md, api-reference.md, testing-and-debugging.md | — |
| requirements/ | 要件管理（目的/要件/適用範囲） | README.md + REQ-{NNNN}.md | issue-save-req(CREATE), issue-create(READ), issue-update(UPDATE) |
| adr/ | ADR | README.md + ADR-{NNNN}.md | adr-guidelines(CREATE) |
| specs/ | システム仕様 | system.md, patterns.md | issue-work(READ+WRITE), issue-close(VERIFY) |
| tips/ | 学び | inbox.md + *.md | tips-add(UPDATE), tips-refactor(CREATE) |

## スキル間依存関係

issue-lifecycle（旧issue-guide-phases）は他の専門スキルが提供する知識を概念的に参照する。

| スキル名           | 提供する知識                                                   |
| ------------------ | -------------------------------------------------------------- |
| `req-analysis`     | 要件分析手法（要件の展開観点、壁打ちメソドロジー）   |
| `spec-compliance`    | 仕様適合性検出（実装と要件の乖離基準、ループバック判定）        |
| `adr-file-manager` | ADRファイルの作成・追記・更新操作とバリデーション               |
| `adr-guidelines`   | ADR作成の必要性判定基準・ライフサイクル定義                     |
| `req-file-manager` | REQファイルの作成・追記・更新操作とバリデーション               |

**実行時依存**: issue-lifecycleは一方向依存であり、他スキルの実行時にimport/requireされることはない。ただし、他スキルのSee Alsoセクションから概念的に参照されることはある（例: `adr-file-manager` のSee Alsoにissue-lifecycleが含まれる）。

## 参照

- **SSoT遷移ルール**: [`reference/ssot-transitions.md`](./ssot-transitions.md)
- **コマンド関連マップ**: [`reference/command-map.md`](./command-map.md)
- **Pattern Registry**: [`reference/pattern-registry.md`](./pattern-registry.md)