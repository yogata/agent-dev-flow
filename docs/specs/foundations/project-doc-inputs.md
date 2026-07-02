---
status: accepted
---

# Project Doc Inputs

実行時 docs 参照の外部化機構としての project doc-inputs を定義する（ADR-0133、REQ-0157）。
配布コマンド・スキル本文が AgentDevFlow 本体固有 `docs/specs/**` 内部パスを固定知識として持たず、プロジェクト別の doc-inputs 経由で docs を解決する仕組みを規定する。

## 背景、目的

AgentDevFlow 配布コマンド・スキル本文（`src/opencode/commands/**`, `src/opencode/skills/**`）は、本来 AgentDevFlow 本体固有の `docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**` への直接参照を保持していた。
利用先プロジェクトはこの内部ディレクトリ構成を持たないため、配布コードが参照するパスが存在せず、コマンド・スキルが読むべき文書を解決できない問題があった。

doc-inputs 機構は、実行時 docs 参照を配布コードから分離し、プロジェクト別に解決可能にする（ADR-0133 Decision）。
実装本文（`src/opencode/commands/**`, `src/opencode/skills/**`）はプロジェクト非依存・単体利用可能とし、`docs/**` への直接参照を持たない。doc-inputs（`.agentdev/doc-inputs/**`）はプロジェクト固有情報を対象とし、そのプロジェクトの adr, req, spec を具体的に参照してよい。

## 3 層構造

doc-inputs は3層で構成する。

### 第1層: `.agentdev/config.yaml`

プロジェクト共通のルート設定。保持するのは `version`, `kind`, `roots`, `doc_inputs` のみ。

`roots` は配布コードが前提とする docs ルートパス（例: `docs/`）を指定する。
`doc_inputs` は command と skill の doc-input ディレクトリ位置を指定する。

`config.yaml` に文書分類、REQ 健全性、integrity rule catalog、command/skill 方針などの意味ロール名を共通キーとして置かない。これらは必要なコマンド・スキルの doc-input から、プロジェクト固有の docs パスとして参照する。

### 第2層: `.agentdev/doc-inputs/commands/<command>.yaml`

公開コマンドごとに1ファイルを置く。コマンド ID は frontmatter の `id`（`/agentdev/<command>`）で識別し、コマンド定義ファイル (`src/opencode/commands/agentdev/<command>.md`) のファイル名（拡張子除く）に対応する。

command doc-input はフロントマタ（`version: 1`, `kind: command-doc-input`, `id: /agentdev/<command>`）と以下5項目を持つ。

| 項目 | 型 | 責務 |
|------|----|----|
| `must_read` | `list[{path, purpose}]` | 当該コマンドが常に読むべき docs パスと目的 |
| `conditional_read` | `list[{id, when, paths, purpose}]` | 条件成立時に読むべき docs パス（`when` は条件、`id` は条件識別子） |
| `allowed_discovery` | `list[str]` | DOC-MAP/README 探索を経て必要に応じて参照してよい docs（説明文字列） |
| `forbidden` | `list[str]` | 当該コマンドが読んでならない docs（説明文字列） |
| `read_completion` | `list[str]` | 当該コマンドの完了条件確認に必要な docs（説明文字列） |

`must_read`, `conditional_read` の各オブジェクトは `path` と `purpose` を持つ。`conditional_read` はさらに条件（`when`）と識別子（`id`）を持つ。`allowed_discovery`, `forbidden`, `read_completion` は説明文字列のリストである。

AgentDevFlow 本体リポジトリでは各 paths に現在の本体 SPEC パスを記述してよい。利用先プロジェクトでは同じコマンド ID の doc-input が別パスを指してよい。

### 第3層: `.agentdev/doc-inputs/skills/<skill>.yaml`

project docs 参照を持つスキルのみに1ファイルを置く。reference ごとの doc-input は作らず、SKILL.md と `references/**/*.md` の project docs 依存をスキル単位で1ファイルに集約する。

スキルは呼び出し元コマンドから渡された解決済み文脈を優先し、skill doc-input は不足分の追加文脈として扱う。

skill doc-input はフロントマタ（`version: 1`, `kind: skill-doc-input`, `id: <skill>`）と以下3項目を持つ（`must_read`, `read_completion` は持たない）。

| 項目 | 型 | 責務 |
|------|----|----|
| `conditional_read` | `list[{id, when, paths, purpose}]` | 条件成立時に読むべき docs パス |
| `allowed_discovery` | `list[str]` | DOC-MAP/README 探索を経て必要に応じて参照してよい docs（説明文字列） |
| `forbidden` | `list[str]` | 当該スキルが読んでならない docs（説明文字列） |

スキルはコマンドから解決済み文脈を受け取る前提のため、`must_read` 相当の必読 docs はコマンド doc-input 側で処理される。skill doc-input はスキル固有の追加条件参照のみを持つ。

### YAML 構文例

command doc-input の例:

```yaml
version: 1
kind: command-doc-input
id: /agentdev/req-save
must_read:
  - path: docs/requirements/README.md
    purpose: REQ インデックス確認
conditional_read:
  - id: has-adr
    when: artifact_actions に artifact: adr を含む
    paths:
      - docs/adr/README.md
    purpose: ADR インデックス確認
allowed_discovery:
  - "docs/DOC-MAP.md 経由で関連 SPEC を探索してよい"
forbidden:
  - "実装本文（src/opencode/**）は読まない"
read_completion:
  - "保存した REQ/ADR が docs/requirements/, docs/adr/ に存在すること"
```

skill doc-input の例:

```yaml
version: 1
kind: skill-doc-input
id: agentdev-req-file-manager
conditional_read:
  - id: on-create
    when: CREATE 操作時
    paths:
      - docs/requirements/README.md
    purpose: 採番済み REQ 一覧確認
allowed_discovery:
  - "docs/DOC-MAP.md 経由で REQ/ADR 関連 SPEC を探索してよい"
forbidden:
  - "実装本文（src/opencode/**）は読まない"
```

## ハイブリッド方式

doc-input 原本は各プロジェクトが所有する。
agent-dev-flow 本体は初期テンプレート、schema、検査、`/agentdev/inspect-doc-inputs` コマンドを提供し、consumer はテンプレートを初期値として取り込みカスタマイズする。

AgentDevFlow 本体リポジトリの `.agentdev/doc-inputs/**` には本体固有 SPEC パスを記述してよい。禁止対象は「配布されるコードが本体固有パスを固定知識として持つこと」であり、本体リポジトリ内の doc-input 原本が本体固有パスを指すことは正当な参照である。`.agentdev/doc-inputs/**` 内の `docs/specs/**` 参照は正当な参照として扱う。

## 利用先プロジェクトに要求する docs 構成

AgentDevFlow が利用先プロジェクトに要求する docs 構成は以下に限定する。

- `docs/requirements/`
- `docs/adr/`
- `docs/specs/`
- `docs/DOC-MAP.md`

`docs/specs/` 配下の内部ディレクトリ構成（`foundations`, `responsibilities` 等）は AgentDevFlow 本体リポジトリの内部構成であり、利用先プロジェクトに要求しない。

## 普遍手順（command 本文、skill 本文に置く共通記述）

各コマンド本文には共通の doc-inputs 手順（6歩）を置く。

1. `.agentdev/config.yaml` を読み込む
2. 当該コマンドに対応する `.agentdev/doc-inputs/commands/<command>.yaml` を読み込む
3. `must_read` に列挙された paths を読み込む
4. `conditional_read` の条件が該当する場合のみ、当該 paths を読み込む
5. doc-input に列挙されていない `docs/specs/**` 内部パスを固定知識として読みに行かない
6. doc-input が存在しない場合は `config.yaml` の `roots` と明示入力のみを使う

各スキル SKILL.md には doc-input 参照方針（4項目）を置く。

1. 前提とする固定知識の範囲: docs/ ディレクトリ構成（requirements/adr/specs）と DOC-MAP.md のみを前提とし、`docs/specs/**` 内部構成は仮定しない
2. doc-input の読込契約: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill doc-input（`.agentdev/doc-inputs/skills/<skill>.yaml`）を読む
3. `docs/specs/**` 内部パスの固定知識化の禁止: doc-input に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない
4. doc-input 未配置時の挙動: skill doc-input が存在しない場合は `config.yaml` の `roots` と明示入力のみを使い、推測で docs を読みに行かない

## 配布コード直接参照の禁止範囲

禁止: `src/opencode/commands/agentdev/**/*.md`, `src/opencode/skills/agentdev-*/SKILL.md`, `src/opencode/skills/agentdev-*/references/**/*.md` からの `docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**` 直接参照。

実行時に読むべき docs 文書への参照は command または skill doc-input の `must_read`, `conditional_read`, `allowed_discovery` へ移す。

## 許可範囲（例外、移行対象外）

以下は配布コードからの docs 参照であっても許可する。

- SPEC パスの例示（SPEC 文書内で「SPEC は `docs/specs/...` に置く」等のパス表記例を示す場合）
- 検査対象パスの指定（「`docs/specs/integrity/integrity-rule-catalog.md` を検査する」等、検査コマンドが対象パスを明示する場合）
- 配布コード外（`.opencode/skills/repo-agentdev-integrity/` 等、repo-local で配布対象外の領域）
- `commands/templates/**/*.md` 等のテンプレート（例示目的のプレースホルダー）

## 明示入力と draft/artifact 対象パス

以下は docs/specs 直接参照ではなく、doc-inputs 経由ではない参照として許可される。

- 明示入力: Issue URL、PR URL、draft ファイルパス（`.agentdev/drafts/**`）、RU ファイルパス（`.agentdev/backlog/**`）、domain state（`.agentdev/{intake,learning,inspect,backlog}/**`）
- artifact 対象パス: `docs/requirements/REQ-*.md`, `docs/adr/ADR-*.md`, `docs/DOC-MAP.md`（REQ/ADR/DOC-MAP はプロジェクト固有 ID を含むため、doc-inputs ではなく各プロジェクトの実体を直接指す）

## DOC-MAP/README 探索の許可範囲

`allowed_discovery` に列挙された docs パスは、`docs/DOC-MAP.md` または `docs/` 配下の README から探索可能でなければならない。
コマンド・スキルは `allowed_discovery` の範囲内で DOC-MAP/README を経由して docs を探索してよい。

## doc-input paths の探索可能性要件

`.agentdev/doc-inputs/**` の全 paths は `docs/DOC-MAP.md` または docs 配下 README から探索可能でなければならない。

DOC-MAP は docs 配下文書の AI エージェント向け探索索引であり、doc-input 原本ではない（ADR-0133）。
DOC-MAP にコマンド・スキル別の `must_read` / `conditional_read` 表を持たせない。

## 検査、診断

`check_doc_inputs.ts`（`repo-agentdev-integrity` skill 配下、repo-local）が以下を検査する。

1. `.agentdev/config.yaml` の存在と schema 適合（`version`, `kind`, `roots`, `doc_inputs` のみ）
2. `roots` に定義されたパスの存在
3. `doc_inputs.commands` と `doc_inputs.skills` ディレクトリの存在
4. 公開コマンドごとの command doc-input の存在
5. 各 doc-input の schema 適合（フロントマタ `version`/`kind`/`id`、`must_read`/`conditional_read` のオブジェクト構造）
6. doc-input の paths の存在
7. doc-input の paths が `docs/DOC-MAP.md` または docs 配下 README から探索可能であること
8. `src/opencode/commands/agentdev/**/*.md` に本体固有 `docs/specs/**` 直接参照が残っていないこと
9. `src/opencode/skills/agentdev-*/SKILL.md` と `references/**/*.md` に同一の直接参照が残っていないこと

`.agentdev/doc-inputs/**` 内の `docs/specs/**` 参照は正当な参照として扱う（ハイブリッド方式）。

`/agentdev/inspect-doc-inputs` は読み取り専用診断コマンドとして検査結果を finding 出力する。

## 整合性ルール IR-056

IR-056（`docs/specs/integrity/rules/IR-056-project-doc-input-integrity.md`）が doc-inputs 機構の整合性を strict に検査する。
検査項目は上記9点に加え、DOC-MAP 探索可能性、配布コマンド・スキル本文の固定直接参照排除、`.agentdev/doc-inputs/**` 内の `docs/specs/**` 参照の正当な取り扱いを含む。

## 関連

- [ADR-0133](../../adr/ADR-0133.md): Doc Inputs Architecture
- [ADR-0104](../../adr/ADR-0104.md): 実行時独立性（本 SPEC は具体化機構を提供）
- [REQ-0157](../../requirements/REQ-0157.md): Project Doc Inputs Migration
- [command-file-format.md](../authoring/command-file-format.md): コマンド本文フォーマット規約
- [agentdev-skill-authoring.md](../skills/agentdev-skill-authoring.md): スキル執筆規約
- [IR-056](../integrity/rules/IR-056-project-doc-input-integrity.md): Project Doc Input Integrity
