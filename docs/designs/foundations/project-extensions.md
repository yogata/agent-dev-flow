---
title: Project Extensions
status: accepted
created: 2026-07-04
updated: 2026-08-20
---
<!-- ADF-COVERS(implementation): REQ-002-030, REQ-002-031 -->
<!-- ADF-COVERS(implementation): REQ-002-030, REQ-002-031, REQ-044-001, REQ-044-002, REQ-044-005 -->

# Project Extensions

実行時のプロジェクト固有追加・拡張機構としての project extensions を定義する（関連: DEC-006 inspect 3-command 構成への正規化）。
配布 command/skill 本文をプロジェクト非依存とし、プロジェクト固有の文脈、規約、検査、受け入れゲート、禁止事項を .agentdev/extensions/** 経由で追加・拡張する仕組みを規定する。
従来の .agentdev/doc-inputs/**（参照リスト機構）に替わる設定層である。

## 背景、目的

AgentDevFlow 配布 command/skill 本文（src/opencode/commands/**, src/opencode/skills/**）は、AgentDevFlow 本体固有の Decision/REQ/Design への具体参照を持つと、利用先プロジェクトで解決不能な参照が混入する。

project extensions 機構は、プロジェクト固有の追加・拡張を配布コードから分離し、プロジェクト別に与える。
実装本文はプロジェクト非依存・単体利用可能とし、Decision/REQ/Design の具体ID、具体パス、固定URLを持たない。
extensions（.agentdev/extensions/**）はプロジェクト固有情報を対象とし、そのプロジェクトの Decision/REQ/Design を具体的に参照してよい。

## 標準配置

```text
.agentdev/extensions/skills/{workflow-skill-name}.yaml
.agentdev/extensions/skills/{workflow-skill-name}/internal.yaml
.agentdev/extensions/skills/{capability-skill-name}.yaml
```

配置と kind literal の対応は「旧kind からの移行（breaking migration）」節の Extension kind enum（公式）が正規定義する。

## Extension 種別

Extension を workflow / capability responsibility 中心の3種へ再編する（DEC-012）。

### Workflow Extension

公開Workflow Skill への追加・拡張。
internal workflow / STEP 全体を拘束する。
配置: .agentdev/extensions/skills/{workflow-skill-name}.yaml。

### internal Workflow Extension

Workflow Skill の内部動作への追加・拡張。
Workflow Skill のみが読む。
command は直接読まない。
配置: .agentdev/extensions/skills/{workflow-skill-name}/internal.yaml。

### Capability Skill Extension

Capability Skill への追加・拡張。
配置: .agentdev/extensions/skills/{capability-skill-name}.yaml。

### 適用順序

Workflow Extension → internal Workflow Extension → Capability Skill Extension。
public Workflow Extension が Capability Skill extension へ暗黙コピーしない。
後方互換性のためだけの二重extension model を正規状態として残存させない（DEC-012）。

### 旧kind からの移行（breaking migration）

旧kind（command-extension / skill-extension）は完全廃止。
runtime後方互換なし。
consumer プロジェクトも新kindへの移行対象。旧kind残存時は deterministic check で検出し
migration-required として停止（silent ignore しない）。

#### Extension kind enum（公式）

Extension 種別は以下の3値のみを machine-readable `kind` literal として許可する。
本 enum は runtime resolver / deterministic checker / 全 consumer が正規入力として扱う。

| kind literal                  | 概念名                      | 配置                                                               |
|-------------------------------|-----------------------------|--------------------------------------------------------------------|
| `workflow-extension`          | Workflow Extension          | `.agentdev/extensions/skills/{workflow-skill-name}.yaml`           |
| `internal-workflow-extension` | internal Workflow Extension | `.agentdev/extensions/skills/{workflow-skill-name}/internal.yaml`  |
| `capability-skill-extension`  | Capability Skill Extension  | `.agentdev/extensions/skills/{capability-skill-name}.yaml`         |

上記3値以外の `kind` はすべて無効値である。

#### id binding

- `workflow-extension` の `id` は対象 Workflow Skill 名と一致すること（必須）。
- `internal-workflow-extension` の `id` は親ディレクトリの Workflow Skill 名と一致すること（必須）。単独の別 `id` 体系を作らないこと。
- `capability-skill-extension` の `id` は対象 Capability Skill 名と一致すること（必須）。

#### mapping 表

| 旧kind | 新kind literal | 備考 |
|---|---|---|
| command-extension | workflow-extension | 公開Workflow Skill への追加・拡張 |
| skill-extension（workflow skill対象） | workflow-extension / internal-workflow-extension | Workflow Skill への追加・拡張 |
| skill-extension（capability skill対象） | capability-skill-extension | Capability Skill への追加・拡張 |

#### 状態分類と停止条件（UC-001 案1）

extension 読込時の状態分類と runtime resolver の動作を以下に定める。
deterministic checker は malformed を NG として報告してよいが、runtime resolver の契約は以下の通りである（REQ-002-031 準拠、fail-open）。

| 状態 | runtime resolver 動作 | 備考 |
|---|---|---|
| extension 不在 | 標準動作継続 | 正常状態 |
| YAML 構文エラー / 必須field欠落 / kind判定以前の破損 | エラー表示 + 当該extension無視 + 標準動作継続 | fail-open（REQ-002-031 準拠） |
| `kind: command-extension` / `kind: skill-extension`（旧kind） | migration-required + stop | silent ignore しない |
| 構文上有効だが `kind` が公式3値以外（未知kind） | schema violation + stop | fail-open しない |
| 有効な新kind | 通常処理 | — |

extension missing と legacy extension exists は別状態であり、前者は標準動作継続、後者は migration-required として停止する。

## 実行時読み込み契約

command/skill は実行時に自分に対応する extension だけを読む。

- Workflow Skill は .agentdev/extensions/skills/{workflow-skill-name}.yaml（kind: workflow-extension）を対象とする。
- Workflow Skill は必要に応じて .agentdev/extensions/skills/{workflow-skill-name}/internal.yaml（kind: internal-workflow-extension）を追加で読む。command は internal Workflow Extension を直接読まない。
- Capability Skill は .agentdev/extensions/skills/{capability-skill-name}.yaml（kind: capability-skill-extension）を対象とする。
- 対応 extension が存在しない場合は標準動作で続行する。
- 対応 extension が破損している場合（YAML 構文エラー、必須field 欠落等）はエラーを表示し、当該 extension を無視して標準動作で続行する（REQ-002-031 準拠、fail-open）。
- 旧kind（command-extension / skill-extension）を検出した場合は migration-required として停止する。
- 構文上有効な未知kind を検出した場合は schema violation として停止する。
- extension は標準 command/skill の上書きではなく、追加・拡張としてのみ扱う。

対応 extension が存在しない command/skill は正常動作であり、異常状態ではない。
command が project 非依存で単体動作する正当な状態である。
例として `/agentdev/inspect-skills` は Design 直接参照を持たず project 非依存で動作するため extension 不要である。

### 状態機械の共有実装

Extension 読込の状態機械（不在、破損、旧kind、未知kind、有効の各状態とその遷移）は、runtime resolver と deterministic checker（check_extensions.ts）が同一実装を共有する。
runtime resolver は fail-open 契約（REQ-002-031）を、deterministic checker は NG 報告契約をそれぞれ担う。
状態分類の正規入力となる kind enum は本 Design「Extension kind enum（公式）」が定める。
共有実装の変更は runtime と checker の両契約へ同時に反映する。

### YAML 解析と構造検証の実装契約

YAML 構文解析と構造検証は、ADF 固有の状態意味論と責務を分離して次のとおり構成する。

- YAML 構文解析は `Bun.YAML.parse` に委譲する。`Bun.YAML.parse` の例外は ADF の状態（malformed 等）へ変換し、実行時処理を直接異常終了させない。独自の YAML 構文解析実装（parseSimpleYaml 相当）を残存させない
- 構造検証は Zod に限定して採用する。検証対象は `version`、`kind`、`id`、`context`、`rules`、`checks`、`acceptance_gates`、`must_not` および各配列要素の構造とする。Zod は構造検証のみを所有し、状態意味論を所有しない
- ADF が保証する YAML 機能は、本 Design のスキーマを表現するために必要な次の範囲に限定する: マッピング、配列、文字列、数値、真偽値、null、入れ子構造、通常のクォート文字列。anchor、alias、カスタムタグ、複数ドキュメントは保証対象外とする
- `missing`、`malformed`、`migration-required`、`schema-violation`、`valid` の判定、および旧kind・未知kind の意味判定は ADF 側に残留する。kind enum は本 Design「Extension kind enum（公式）」が定める
- 状態機械の共有実装（runtime resolver と deterministic checker の同一実装共有）は維持する。共有実装の配置は配布側（agentdev-project-extensions skill）を基点とし、repo-local checker から配布側実装を参照する方向とする。配布側実装から producer 内部成果物（repo-local 実装）への依存を作らない
- YAML 解析結果の型差異（数値・真偽値・null の解釈差を含む）は構造検証または必要最小限の正規化で吸収し、既存有効 extension の状態分類と外部挙動を維持する
- 回帰検証は、YAML 構文エラー、必須フィールド欠落、旧kind、未知kind、有効 extension の各ケースに加え、空入力、型不正、クォート内のコロン・`#`、CRLF、入れ子、配列を含む

## project-local skill 委譲

rules/checks は skill: に具体的な project-local skill 名を記述し、その skill に実行を委譲する。

初期契約では action, required, fail_on は採用しない。
呼び出された skill は extension entry の id, when, skill および周辺文脈をもとに判断する。

AgentDevFlow 標準は skill: 構文を定義するが、委譲先 skill の中身には関与しない。
各適用プロジェクトが project-local skill を用意し、rules/checks の中身を定義する。

例:

```yaml
rules:
  - id: <rule-id>
    when: <条件>
    skill: <project-local-skill-name>

checks:
  - id: <check-id>
    when: <条件>
    skill: <project-local-skill-name>
```

## command/skill 本文の参照禁止

command/skill 本文には、Decision/REQ/Design の具体ID、具体パス、固定URLを記述しない。

禁止対象は文書種別名としての ADR, REQ, Design ではなく、プロジェクト固有文書を直接指す具体参照である。

.agentdev/extensions/** は、そのプロジェクトの Decision/REQ/Design 参照を許可する。
REQ/Decision/Design 本文内の参照も許容する。

## 検査、診断

extension 検査は DEC-006（inspect 3-command 構成への正規化）に基づき、deterministic check、semantic diagnosis、finding disposition の3層へ分離される。
各層は重複しない。

| 層 | 正規所有者 | 検査内容 |
|---|---|---|
| deterministic check | IR-056 / `/repo/docs-check`（self-hosting）、`/agentdev/case-run`・`/agentdev/case-close` の changed-path routing（consumer） | extension 一覧化、YAML 構文、必須セクションと field、kind と配置、ID と対象 command/skill の対応、context path 実在、委譲先 skill 実在、旧 `.agentdev/doc-inputs/**` 残存 |
| semantic diagnosis | `/agentdev/inspect-skills` | extension 責務境界、標準 command/skill を上書きする意図の意味診断 |
| finding disposition | `/agentdev/inspect-promote` | finding の promote、defer、reject |

AgentDevFlow 標準の inspect 責務は上記構造確認・path 実在確認・skill 存在確認までとする。
command/skill 本文の Decision/REQ/Design 具体参照禁止の持続的検査は、各適用プロジェクトが project-local skill により実装する（AgentDevFlow 標準の対象外）。
agent-dev-flow リポジトリ自身は適用プロジェクトの1つとして repo-local skill により検査を実装するが、これは標準仕様ではなくローカル運用である。
`/agentdev/inspect-docs` へ extension の意味診断を追加しない（三層非重複）。

## ハイブリッド方式

extension 原本は各プロジェクトが所有する。
AgentDevFlow 本体は初期テンプレート、schema、検査（`/repo/docs-check`、`/agentdev/inspect-skills`、`/agentdev/inspect-promote` の3層）を提供し、consumer はテンプレートを初期値として取り込みカスタマイズする。
AgentDevFlow 本体リポジトリの .agentdev/extensions/** には本体固有 Design パスを記述してよい。

## 配布物参照境界の責務分担

配布成果物と producer 内部成果物の間の意味依存境界の正規所有は REQ-029 および `integrity/distribution-boundary.md` が担う。
本 Design は Project Extensions の schema、配置、読込、標準診断、責務境界を所有し、配布 command/skill 本文の具体 ID、具体パス、固定 URL に対する検知パターン、exemption、severity、false-positive 条件は IR-059 個別文書が所有する。

配布物参照境界の検出結果は generic 表記への是正へ接続する。
extension はトレーサビリティを補完する手段の一つであり得るが、意味境界の唯一の解決手段ではない（REQ-029-003、REQ-029-004）。
extension 機構自体は追加・拡張・非上書き原則を維持して残置する。
## 関連

- DEC-006: inspect 3-command 構成への正規化（extension 検査の3層責務分離を確定）
- REQ-001: 実行時独立性（本 Design は具体化機構を提供）

