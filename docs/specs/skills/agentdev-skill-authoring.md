---
title: `agentdev-skill-authoring` SPEC
status: accepted
created: 2026-06-21
updated: 2026-08-10
---

# `agentdev-skill-authoring` SPEC

## 目的

OpenCode SKILL.md の作成における品質基準とベストプラクティスを提供する。
5評価軸と4チェックプロトコルを定義する。

## 適用対象

- 新規 Skill 作成、既存 Skill 改善
- 品質レビュー、構造設計
- トリガー記述（USE FOR / DO NOT USE FOR）
- 段階的開示（progressive disclosure）設計

## 提供する判断、操作

- 5軸評価基準（明確性、完全性等）
- 500行ガバナンス（超過時 `references/` 抽出が必須、400行超で推奨）
- トリガー設計（USE FOR / DO NOT USE FOR、description へのトリガー埋め込み）
- 段階的開示
- Frontmatter 規約
- 複雑構造の扱い
- See Also 規約
- アンチパターン検出

## 参照する references

- なし（SKILL.md 本文に集約）

## 現在の動作

- 簡潔さ優先
- 500行超で `references/` 抽出が必須、400行超で推奨
- description にトリガー埋め込み（USE FOR / DO NOT USE FOR）
- 実行時パス（`.opencode/skills/`）と source path（`src/opencode/skills/`）の区別
- サブエージェント編集安全性
- スキル本文と references の project docs 参照は skill extension に集約する（SPEC `../foundations/project-extensions.md`）
  - スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
  - 実行時に読むべき docs は `.agentdev/extensions/skills/<skill>.yaml` の `context` へ移す
  - skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
  - スキルは呼び出し元コマンドから渡された解決済み文脈を優先し、skill extension は不足分の追加文脈として扱う

## project docs 参照

スキル本文と references の project docs 参照は skill extension（`.agentdev/extensions/skills/<skill>.yaml`）に集約する（REQ-002、SPEC `../foundations/project-extensions.md`）。各 SKILL.md には extension 参照方針（4項目）を配置する:

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）のみを前提とし、`docs/specs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/<skill>.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 対象外

- コマンド定義作成（`agentdev-command-authoring` 担当）
- 一般的なコーディング
- 単純なドキュメント修正

## 検証観点

- 行数制限（500行上限、400行超で `references/` 推奨）
- トークン予算
- トリガー精度（USE FOR / DO NOT USE FOR）
- 構造チェック
- アンチパターン検出

## See Also

- [agentdev-command-authoring.md](agentdev-command-authoring.md)
- [agentdev-inspect-skills.md](agentdev-inspect-skills.md)
- v2:REQ-0113（Skill References SPEC 分離基準）
- REQ-003（コマンド、スキル、サブエージェント責務分界）

## Workflow Skill と Capability Skill

Skill authoring は Workflow Skill と Capability Skill の責務差を区別する（DEC-010）。
Workflow Skill の SKILL.md は control plane（STEP transition・STEP間参照）を所有する。
STEP reference は references/ 配下に配置し、resume point として自足する（DEC-011）。
Capability Skill は複数workflow 共通能力を所有し、workflow 固有STEP と混在させない（REQ-002-018）。

## Workflow Skill Soft Guard（REQ-027-002）

Workflow Skill は workflow 実装本体であり、Command が所有する公開interface（入出力契約・ガードレール）を持たない（DEC-010）。そのため Command を経由せず Workflow Skill を直接起動すると、入力検証・前提条件確認・クリーンアップを欠いた状態で workflow が実行されるリスクがある。本節は Workflow Skill の意図しない discovery / invocation を抑制する soft guard 仕様を定義する。

### OpenCode 1.18.15 実現可能性分析

OpenCode 1.18.15（V1系）の skill discovery モデルは以下の前提に立つ。分析は OpenCode 公式ドキュメントおよび 1.18.15 ソースコード（`packages/opencode/src/skill/index.ts`、`packages/opencode/src/session/system.ts`）に基づく。

- **description-based discovery**: OpenCode は system prompt へ skill の `name` と `description` のみを注入する（progressive disclosure）。model は `description` を読み、`skill` tool で明示的に読み込む対象を決定する。`description` を持たない skill は discovery から除外される。このため `description` の記述が discovery / invocation 意思決定における事実上の制御点となる。
- **frontmatter による discovery 制御は不存在**: 1.18.15 が frontmatter で検証するのは `name` と `description` のみ。`license` / `compatibility` / `metadata` は任意フィールドとして受理されるが、V1 では解釈されず portability 用の保持に留まる。`hidden` / `disable-model-invocation` / `metadata.opencode/autoinvoke` の各フィールドは 1.18.15 時点で未実装である（`autoinvoke` は V2 で計画）。未知の frontmatter フィールドは無視される。
- **permission による harder 制御は存在**: `opencode.json` の `permission.skill` で `allow` / `deny` / `ask` を pattern match で指定できる。`deny` は当該 agent の system prompt から skill を完全に隠す。ただし Command と Workflow Skill は同一 agent 上で動作するため、Workflow Skill を `deny` すると Command の dispatch も遮断され、運用に支障する。

### 採用する soft guard

OpenCode 1.18.15 で runtime に有効かつ Command dispatch を破壊しない soft guard は **description による guard** のみである。Workflow Skill の `description` の DO NOT USE FOR に直接起動抑制句を付与し、model が当該 skill を単独起動しないよう誘導する。本方式は model の description 解釈に依存する「soft」な抑制であり、hard な強制排除ではない。

**guard 句（日本語 description）**:
`、直接起動（Workflow Skill。対応する /agentdev/* command の工程経由で利用し、単独の skill 起動は REQ-027-002 soft guard で抑制）`

**guard 句（英語 description）**:
`, direct invocation (Workflow Skill; consume via the corresponding /agentdev/* command stages — standalone skill launch is discouraged by the REQ-027-002 soft guard)`

frontmatter フィールドは従来規約（`name` / `description` のみ、review-protocol 5.1）を維持し、soft guard 用の拡張フィールドは追加しない。1.18.15 で未解釈の `metadata` 等を guard 用に使っても runtime 効果がないためである。

### 適用対象

soft guard は workflow 実装本体 および workflow pipeline 内部知識を所有する `agentdev-workflow-*` skill に適用する。純粋な Capability Skill（例: `agentdev-workflow-templates` は template 選択・読込の独立能力）は対象外とする。適用済み skill:

- `agentdev-workflow-case-open`（case-open workflow 実装本体）
- `agentdev-workflow-case-close`（case-close workflow 実装本体）
- `agentdev-workflow-case-auto`（case-auto workflow 実装本体）
- `agentdev-workflow-auto-orchestration`（case-auto orchestration 実装）
- `agentdev-workflow-orchestration`（case-run orchestration 知識ベース）
- `agentdev-workflow-lifecycle`（workflow pipeline 内部知識: work_type・phase 定義）
- `agentdev-workflow-routing`（workflow pipeline 内部知識: review 拒絶 routing）

### consumer 側 harder opt-in

consumer が soft guard より強い制御を望む場合、`opencode.json` の `permission.skill` で Workflow Skill を `ask` に設定し、直接起動時に利用者確認を要求できる。`deny` は Command dispatch も遮断するため既定では推奨しない。本設定は consumer project 側の運用判断であり、配布物（`src/opencode/`）には含めない。

```json
{
  "permission": {
    "skill": {
      "agentdev-workflow-case-*": "ask",
      "agentdev-workflow-auto-orchestration": "ask"
    }
  }
}
```

## skill authoring 段階的開示基準

skill 段階的開示の基準（SKILL.md は目的/USE FOR/入出力/副作用/責任境界/不変条件/判断順序/reference 選択条件/script-template 入口を保持、詳細 schema/判定表/正規表現/具体例/例外回復/harness 起動は references へ分離、原則200行以内、reference 選択表の必須配置、通常経路で全 reference 無条件読込しない）を REQ-002-014/015 と整合して明記する。詳細 normative は移行計画 §9.2, §9.3, §9.5, §9.6。

