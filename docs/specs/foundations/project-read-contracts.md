---
status: accepted
---

# Project Read Contract

実行時 docs 参照の外部化機構としての project read contract を定義する（ADR-0133、REQ-0157）。
配布コマンド・スキル本文が AgentDevFlow 本体固有 `docs/specs/**` 内部パスを固定知識として持たず、プロジェクト別の read contract 経由で docs を解決する仕組みを規定する。

## 背景、目的

AgentDevFlow 配布コマンド・スキル本文（`src/opencode/commands/**`, `src/opencode/skills/**`）は、本来 AgentDevFlow 本体固有の `docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**` への直接参照を保持していた。
利用先プロジェクトはこの内部ディレクトリ構成を持たないため、配布コードが参照するパスが存在せず、コマンド・スキルが読むべき文書を解決できない問題があった。

project read contract 機構は、実行時 docs 参照を配布コードから分離し、プロジェクト別に解決可能にする（ADR-0133 Decision）。

## 3 層構造

read contract は3層で構成する。

### 第1層: `.agentdev/config.yaml`

プロジェクト共通のルート設定。保持するのは `version`, `kind`, `roots`, `read_contracts` のみ。

`roots` は配布コードが前提とする docs ルートパス（例: `docs/`）を指定する。
`read_contracts` は command と skill の read contract ディレクトリ位置を指定する。

`config.yaml` に文書分類、REQ 健全性、integrity rule catalog、command/skill 方針などの意味ロール名を共通キーとして置かない。これらは必要なコマンド・スキルの read contract から、プロジェクト固有の docs パスとして参照する。

### 第2層: `.agentdev/read-contracts/commands/<command>.yaml`

公開コマンドごとに1ファイルを置く。コマンド ID は frontmatter を持たないコマンド定義ファイル (`src/opencode/commands/agentdev/<command>.md`) のファイル名（拡張子除く）に対応する。

5項目を持つ。

| 項目 | 型 | 責務 |
|------|----|----|
| `must_read` | list[path] | 当該コマンドが常に読むべき docs パス |
| `conditional_read` | map[condition → list[path]] | 条件成立時に読むべき docs パス（条件はコマンドが定義する自由文字列キー） |
| `allowed_discovery` | list[path] | DOC-MAP/README 探索を経て必要に応じて参照してよい docs パス |
| `forbidden` | list[path] | 当該コマンドが読んでならない docs パス（明示禁止） |
| `read_completion` | list[path] | 当該コマンドの完了条件確認に必要な docs パス |

AgentDevFlow 本体リポジトリでは各 paths に現在の本体 SPEC パスを記述してよい。利用先プロジェクトでは同じコマンド ID の read contract が別パスを指してよい。

### 第3層: `.agentdev/read-contracts/skills/<skill>.yaml`

project docs 参照を持つスキルのみに1ファイルを置く。reference ごとの read contract は作らず、SKILL.md と `references/**/*.md` の project docs 依存をスキル単位で1ファイルに集約する。

スキルは呼び出し元コマンドから渡された解決済み文脈を優先し、skill read contract は不足分の追加文脈として扱う。

3項目を持つ（`must_read`, `read_completion` は持たない）。

| 項目 | 型 | 責務 |
|------|----|----|
| `conditional_read` | map[condition → list[path]] | 条件成立時に読むべき docs パス |
| `allowed_discovery` | list[path] | DOC-MAP/README 探索を経て必要に応じて参照してよい docs パス |
| `forbidden` | list[path] | 当該スキルが読んでならない docs パス |

スキルはコマンドから解決済み文脈を受け取る前提のため、`must_read` 相当の必読 docs はコマンド read contract 側で処理される。skill read contract はスキル固有の追加条件参照のみを持つ。

## ハイブリッド方式

read contract 原本は各プロジェクトが所有する。
agent-dev-flow 本体は初期テンプレート、schema、検査、`/agentdev/inspect-read-contracts` コマンドを提供し、consumer はテンプレートを初期値として取り込みカスタマイズする。

AgentDevFlow 本体リポジトリの `.agentdev/read-contracts/**` には本体固有 SPEC パスを記述してよい。禁止対象は「配布されるコードが本体固有パスを固定知識として持つこと」であり、本体リポジトリ内の read contract 原本が本体固有パスを指すことは正当な参照である。

## 利用先プロジェクトに要求する docs 構成

AgentDevFlow が利用先プロジェクトに要求する docs 構成は以下に限定する。

- `docs/requirements/`
- `docs/adr/`
- `docs/specs/`
- `docs/DOC-MAP.md`

`docs/specs/` 配下の内部ディレクトリ構成（`foundations`, `responsibilities` 等）は AgentDevFlow 本体リポジトリの内部構成であり、利用先プロジェクトに要求しない。

## 普遍手順（command 本文、skill 本文に置く共通記述）

各コマンド本文には共通の project read contract 手順（6歩）を置く。

1. `.agentdev/config.yaml` を読み込む
2. 当該コマンドに対応する `.agentdev/read-contracts/commands/<command>.yaml` を読み込む
3. `must_read` に列挙された paths を読み込む
4. `conditional_read` の条件が該当する場合のみ、当該 paths を読み込む
5. read contract に列挙されていない `docs/specs/**` 内部パスを固定知識として読みに行かない
6. read contract が存在しない場合は `config.yaml` の `roots` と明示入力のみを使う

各スキル SKILL.md には read contract 参照方針（4項目）を置く。

1. プロジェクト固有の `docs/specs/**` 内部構成を仮定しない
2. 呼び出し元コマンドから渡された解決済み文脈を優先する
3. 解決済み文脈がなく skill read contract が存在する場合のみ読む
4. read contract に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない

## 配布コード直接参照の禁止範囲

禁止: `src/opencode/commands/agentdev/**/*.md`, `src/opencode/skills/agentdev-*/SKILL.md`, `src/opencode/skills/agentdev-*/references/**/*.md` からの `docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**` 直接参照。

実行時に読むべき docs 文書への参照は command または skill read contract の `must_read`, `conditional_read`, `allowed_discovery` へ移す。

## 許可範囲（例外、移行対象外）

以下は配布コードからの docs 参照であっても許可する。

- SPEC パスの例示（SPEC 文書内で「SPEC は `docs/specs/...` に置く」等のパス表記例を示す場合）
- 検査対象パスの指定（「`docs/specs/integrity/integrity-rule-catalog.md` を検査する」等、検査コマンドが対象パスを明示する場合）
- 配布コード外（`.opencode/skills/repo-agentdev-integrity/` 等、repo-local で配布対象外の領域）
- `commands/templates/**/*.md` 等のテンプレート（例示目的のプレースホルダー）

## 明示入力と draft/artifact 対象パス

以下は docs/specs 直接参照ではなく、read contract 経由ではない参照として許可される。

- 明示入力: Issue URL、PR URL、draft ファイルパス（`.agentdev/drafts/**`）、RU ファイルパス（`.agentdev/backlog/**`）、domain state（`.agentdev/{intake,learning,inspect,backlog}/**`）
- artifact 対象パス: `docs/requirements/REQ-*.md`, `docs/adr/ADR-*.md`, `docs/DOC-MAP.md`（REQ/ADR/DOC-MAP はプロジェクト固有 ID を含むため、read contract ではなく各プロジェクトの実体を直接指す）

## DOC-MAP/README 探索の許可範囲

`allowed_discovery` に列挙された docs パスは、`docs/DOC-MAP.md` または `docs/` 配下の README から探索可能でなければならない。
コマンド・スキルは `allowed_discovery` の範囲内で DOC-MAP/README を経由して docs を探索してよい。

## read contract paths の探索可能性要件

`.agentdev/read-contracts/**` の全 paths は `docs/DOC-MAP.md` または docs 配下 README から探索可能でなければならない。

DOC-MAP は docs 配下文書の AI エージェント向け探索索引であり、read contract 原本ではない（ADR-0133）。
DOC-MAP にコマンド・スキル別の `must_read` / `conditional_read` 表を持たせない。

## 検査、診断

`check_read_contracts.ts`（`repo-agentdev-integrity` skill 配下、repo-local）が以下9点を検査する。

1. `.agentdev/config.yaml` の存在と schema 適合
2. `roots` に定義されたパスの存在
3. `read_contracts.commands` と `read_contracts.skills` ディレクトリの存在
4. 公開コマンドごとの command read contract の存在
5. 各 read contract の schema 適合
6. read contract の paths の存在
7. read contract の paths が `docs/DOC-MAP.md` または docs 配下 README から探索可能であること
8. `src/opencode/commands/agentdev/**/*.md` に本体固有 `docs/specs/**` 直接参照が残っていないこと
9. `src/opencode/skills/agentdev-*/SKILL.md` と `references/**/*.md` に同一の直接参照が残っていないこと

`.agentdev/read-contracts/**` 内の `docs/specs/**` 参照は正当な参照として扱う（ハイブリッド方式）。

`/agentdev/inspect-read-contracts` は読み取り専用診断コマンドとして検査結果を finding 出力する。

## 整合性ルール IR-056

IR-056（`docs/specs/integrity/rules/IR-056-project-read-contract-integrity.md`）が read contract 機構の整合性を strict に検査する。
検査項目は上記9点に加え、DOC-MAP 探索可能性、配布コマンド・スキル本文の固定直接参照排除を含む。

## 関連

- [ADR-0133](../../adr/ADR-0133.md): Read Contract Architecture
- [ADR-0104](../../adr/ADR-0104.md): 実行時独立性（本 SPEC は具体化機構を提供）
- [REQ-0157](../../requirements/REQ-0157.md): Project Read Contract Migration
- [command-file-format.md](../authoring/command-file-format.md): コマンド本文フォーマット規約
- [agentdev-skill-authoring.md](../skills/agentdev-skill-authoring.md): スキル執筆規約
- [IR-056](../integrity/rules/IR-056-project-read-contract-integrity.md): Project Read Contract Integrity
