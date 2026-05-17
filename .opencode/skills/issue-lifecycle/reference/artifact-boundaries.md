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

Command・Skill・SPEC・Templateの4種類アーティファクトは以下の責務境界に従う。

| アーティファクト | 格納先 | 責務 |
|------------------|--------|------|
| **Command** | `.opencode/commands/` | 実行手順・ワークフロー定義（Input/Output/Steps + Skill参照） |
| **Skill** | `.opencode/skills/` | 知識ベース・宣言的定義（判定基準・フォーマット・ポリシー） |
| **SPEC** | `docs/specs/` | システム仕様の現在状態（system.md, patterns.md） |
| **Template** | `.opencode/commands/issue/templates/` | Issue/PR本文のひな形（変数置換で使用） |

- Commandは手続きを記述し、Skillは宣言的知識を提供する。CommandがSkillを参照し、その逆は不可。
- SPECは`issue-work`で更新・`issue-close`で検証される生きた仕様。
- TemplateはIssue/PR本文の生成にのみ使用し、ロジックは含まない。

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
| `req-analysis`     | 要件分析手法（要件の展開観点、壁打ちメソッドロジー）   |
| `spec-compliance`    | 仕様適合性検出（実装と要件の乖離基準、ループバック判定）        |
| `adr-file-manager` | ADRファイルの作成・追記・更新操作とバリデーション               |
| `adr-guidelines`   | ADR作成の必要性判定基準・ライフサイクル定義                     |
| `req-file-manager` | REQファイルの作成・追記・更新操作とバリデーション               |

**実行時依存**: issue-lifecycleは一方向依存であり、他スキルの実行時にimport/requireされることはない。ただし、他スキルのSee Alsoセクションから概念的に参照されることはある（例: `adr-file-manager` のSee Alsoにissue-lifecycleが含まれる）。

## 参照

- **SSoT遷移ルール**: [`reference/ssot-transitions.md`](./ssot-transitions.md)
- **コマンド関連マップ**: [`reference/command-map.md`](./command-map.md)
- **Pattern Registry**: [`reference/pattern-registry.md`](./pattern-registry.md)