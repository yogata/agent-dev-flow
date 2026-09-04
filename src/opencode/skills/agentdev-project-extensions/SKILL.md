---
name: agentdev-project-extensions
description: Resolves project-specific extensions (.agentdev/extensions/skills/**) for Workflow and Capability Skills at runtime. USE FOR: extension discovery, load-time state classification (missing/malformed/migration-required/unknown), reading extension context/rules/checks, extracting project-local delegation targets. DO NOT USE FOR: defining extension schema, diagnosing/inspecting extension structure, modifying distribution command/skill bodies, implementing project-local skills, creating/editing extensions, migrating legacy extensions.
---

# Project Extensions

実行時に自分に対応する project extension を読み込み、プロジェクト固有の文脈、規約、検査、受け入れゲート、禁止事項を解決する。
配布 command/skill 本文はプロジェクト非依存であり、プロジェクト固有情報は `.agentdev/extensions/**` 経由で実行時に与えられる。
extension の読み取り主体は Workflow Skill と Capability Skill である（各読み取り主体の対応 extension 種別は「責務ごとの手順」参照）。

## 担当

| 責務 | 内容 |
|------|------|
| extension 探索 | 対応 extension ファイル（1件）の特定と読み込み |
| 読込時の状態分類 | 不在 / 破損（malformed）/ 旧 kind（migration-required）/ 未知 kind（schema violation）/ 有効 の判定と、各状態に対応する停止条件の適用 |
| 5セクション読み取り | context/rules/checks/acceptance_gates/must_not の読み取り |
| 上書きでないことの扱い | extension は追加・拡張であり、標準動作を置き換えない |
| 委譲対象抽出 | rules/checks から project-local skill 委譲対象の抽出 |

## 標準配置

extension は以下の配置を持つ。
読み取り主体（Workflow Skill / Capability Skill）と kind literal の対応で決まる。

```text
.agentdev/extensions/skills/{workflow-skill-name}.yaml
.agentdev/extensions/skills/{workflow-skill-name}/internal.yaml
.agentdev/extensions/skills/{capability-skill-name}.yaml
```

旧配置 `.agentdev/extensions/commands/**` は廃止済みである。
runtime は旧配置を後方互換で読まない。

## Extension kind enum（公式）

Extension 種別は以下の3値のみを machine-readable `kind` literal として許可する。

| kind literal | 概念名 | 配置 |
|---|---|---|
| `workflow-extension` | Workflow Extension | `.agentdev/extensions/skills/{workflow-skill-name}.yaml` |
| `internal-workflow-extension` | internal Workflow Extension | `.agentdev/extensions/skills/{workflow-skill-name}/internal.yaml` |
| `capability-skill-extension` | Capability Skill Extension | `.agentdev/extensions/skills/{capability-skill-name}.yaml` |

上記3値以外の `kind` はすべて無効値である。
旧 kind（`command-extension` / `skill-extension`）は完全廃止済みであり、検出時は migration-required として停止する。

### id binding

- `workflow-extension` の `id` は対象 Workflow Skill 名と一致すること（必須）。
- `internal-workflow-extension` の `id` は親ディレクトリの Workflow Skill 名と一致すること（必須）。単独の別 `id` 体系を作らないこと。
- `capability-skill-extension` の `id` は対象 Capability Skill 名と一致すること（必須）。

## 状態分類と停止条件

extension 読込時の状態分類と本スキル（runtime resolver）の動作は以下のとおり。

| 状態 | runtime resolver 動作 | 備考 |
|---|---|---|
| extension 不在 | 標準動作継続 | 正常状態 |
| YAML 構文エラー / 必須 field 欠落 / kind 判定以前の破損 | エラー表示 + 当該 extension 無視 + 標準動作継続 | fail-open |
| 旧 kind（`command-extension` / `skill-extension`） | migration-required + stop | silent ignore しない |
| 構文上有効だが `kind` が公式3値以外（未知 kind） | schema violation + stop | fail-open しない |
| 有効な新 kind | 通常処理 | - |

extension missing と legacy extension exists は別状態であり、前者は標準動作継続、後者は migration-required として停止する。
旧 kind / 未知 kind について silent ignore する実装を採らない。

## extension の基本構造

extension は以下の基本構造を持つ。

```yaml
version: 1
kind: workflow-extension  # または internal-workflow-extension / capability-skill-extension
id: <対象 skill 名（id binding 参照）>

context: []
rules: []
checks: []
acceptance_gates: []
must_not: []
```

acceptance_gates は受け入れ条件ではなく、完了判定本体でもない。
extension によって追加される実行完了前ゲートである。

## 責務ごとの手順

### 1. 対応 extension ファイルの探索

- Workflow Skill は `.agentdev/extensions/skills/{workflow-skill-name}.yaml`（kind: workflow-extension）を対象とする
- Workflow Skill は必要に応じて `.agentdev/extensions/skills/{workflow-skill-name}/internal.yaml`（kind: internal-workflow-extension）を追加で読む。command は internal Workflow Extension を直接読まない
- Capability Skill は `.agentdev/extensions/skills/{capability-skill-name}.yaml`（kind: capability-skill-extension）を対象とする
- 当該 extension ファイルのみを読み、自分に対応しない extension は読まない

### 2. 読込時の状態判定

対応 extension ファイルを次の順序で判定する。

1. ファイルが存在しない場合は missing として扱う。
空 extension として標準動作で続行する。
extension 不在はエラーではなく、配布 skill 単体で動作する通常状態である
2. YAML 構文エラー、必須 field（`version` / `kind` / `id` / 5セクション）の欠落・型違反、kind 判定以前の破損の場合は malformed として扱う。
エラーメッセージを表示し（対象 extension ファイルパスと破損理由を含む）、当該 extension を無視し、空 extension として標準動作で続行する（fail-open）。
破損 extension により処理全体を停止しない
3. `kind` が旧 kind（`command-extension` / `skill-extension`）の場合は migration-required として処理を停止する。silent ignore しない
4. `kind` が公式3値以外の有効な値（未知 kind）の場合は schema violation として処理を停止する。fail-open しない
5. 有効な新 kind の場合は通常処理（5セクション読み取り）へ進む

### 3. 5セクション読み取り

extension が持つ以下の5セクションを読み取る。

| セクション | 意味 |
|---|---|
| context | command/skill に追加で与える文脈 |
| rules | command/skill に追加で守らせる規約 |
| checks | command/skill に追加で実行させる検査 |
| acceptance_gates | extension が追加する実行完了前ゲート |
| must_not | command/skill に追加で課す禁止事項 |

各セクションは配列であり、複数の entry を持てる。
entry は空配列でもよい。

### 4. 上書きでなく追加・拡張であることの扱い

extension の内容は配布 command/skill 本文の動作に**追加**され、既存動作を**置き換えない**。

- extension の context は、配布 command/skill が持つ文脈に追加される
- extension の rules、checks は、配布 command/skill の手順に追加で課される
- extension の must_not は、配布 command/skill の禁止事項に追加される
- extension の acceptance_gates は、配布 command/skill の完了判定の前に追加で実行される

### 5. 適用順序と暗黙伝播の禁止

- 適用順序は Workflow Extension → internal Workflow Extension → Capability Skill Extension である
- public Workflow Extension を Capability Skill extension へ暗黙コピーしない
- Capability Skill は workflow-extension を読まず、Workflow Skill は capability-skill-extension を読まない

### 6. 委譲対象の抽出

rules/checks の entry に `skill:` フィールドで具体的な project-local skill 名が記述されている場合、それを委譲対象として抽出する。

extension entry の形式:

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

初期契約では `action`, `required`, `fail_on` は採用しない。
呼び出された skill は extension entry の `id`, `when`, `skill` および周辺文脈をもとに判断する。

AgentDevFlow 標準は `skill:` 構文を定義するが、委譲先 skill の中身には関与しない。
各適用プロジェクトが project-local skill を用意し、rules/checks の中身を定義する。

## ハイブリッド方式

extension 原本は各プロジェクトが所有する。
AgentDevFlow 本体は初期テンプレート、schema、検査、保守 command を提供し、consumer はテンプレートを初期値として取り込みカスタマイズする。

## 公開契約宣言と詳細契約の分離

16の agentdev command は、対応する project extension を Workflow Skill が読み込む旨の同一宣言を持つ。
この宣言は「公開契約宣言」（command 公開契約の宣言部分）と「詳細契約」（extension の context/rules/checks 等の中身）に分離できる。
分離の判断基準は artifact-responsibilities Design「重複許容基準 適用例集」適用パターン1（project extensions boilerplate）に準拠する。

### 公開契約宣言

対応 extension を Workflow Skill が読み込む旨を宣言する部分。
配布 command 本文に直接記載を許容する。
許容範囲は宣言文（1行）とそれに続く boilerplate 4行（リスト形式）で構成される。

- 宣言文: 対応 extension を Workflow Skill が読み込む旨の1行
- boilerplate 行1: extension の5セクション名（`context` / `rules` / `checks` / `acceptance_gates` / `must_not`）と追加・拡張であること（上書きでないこと）の宣言
- boilerplate 行2: extension が存在しない場合の標準動作継続宣言
- boilerplate 行3: extension が破損している場合のエラー表示・無視・標準動作継続宣言
- boilerplate 行4: 詳細な読み込み契約は本 SKILL 参照との宣言

「4行上限」は boilerplate リスト部分の4行を指す（Design 適用パターン1「上限: 宣言4行まで」）。
本範囲は16 command の公開契約（extension 読込宣言）の一部として許容判定された事例に該当する。

### 詳細契約

公開契約宣言の範囲を超える内容は詳細契約とし、本 SKILL 参照へ集約する。
該当する内容は以下のとおり。

- 5セクション読み取りの詳細手順（「責務ごとの手順」セクション）
- 上書きでなく追加・拡張であることの扱いの詳細
- 委譲対象（project-local skill）抽出の契約
- extension 探索、読込時の状態判定（不在・malformed・旧 kind・未知 kind）と停止条件の内部手順

詳細契約を command 本文に再定義した場合は同一契約再定義抑止の原則違反として扱う。

## boilerplate 重複検出時の判定マトリクス

inspect-skills が複数 command 間で同一文言の重複を検出した場合、次の表で許容・違反を判定する。

| 重複内容 | 公開契約宣言の範囲 | 判定 | 根拠 |
|---|---|---|---|
| 対応 extension を Workflow Skill が読み込む旨の宣言 | 範囲内 | 許容 | 重複許容基準 適用パターン1 |
| 5セクション名の列挙と追加・拡張の宣言 | 範囲内 | 許容 | 重複許容基準 適用パターン1 |
| 不在時・破損時の標準動作継続宣言 | 範囲内 | 許容 | 重複許容基準 適用パターン1 |
| 詳細は skill 参照の宣言 | 範囲内 | 許容 | 重複許容基準 適用パターン1 |
| 5セクション読み取りの詳細手順 | 範囲外 | 違反 | 同一契約再定義抑止の原則 |
| 上書きでないことの扱いの詳細 | 範囲外 | 違反 | 同一契約再定義抑止の原則 |
| 委譲対象抽出の契約 | 範囲外 | 違反 | 同一契約再定義抑止の原則 |
| extension schema の定義内容 | 範囲外 | 違反 | 同一契約再定義抑止の原則 |

許容と判定された重複は、各 command が「詳細な読み込み契約は本 SKILL 参照」の行（boilerplate 行4）を持つことを前提とする。
違反と判定された場合は generic 表記または本 SKILL 参照へ是正する。

## 不変条件

工程上の選好を反映した肯定形の不変条件:

- extension は標準 command/skill 動作への追加・拡張として適用する（動作の置き換えは行わない）
- 読込対象は自分に対応する extension（1件）に限定する
- 読込時の状態分類は「不在は標準動作継続、malformed は fail-open、旧 kind は migration-required として停止、未知 kind は schema violation として停止」に従う
- 委譲先 project-local skill の実装は各適用プロジェクトの責務であり、本スキルは委譲先の中身に関与しない
- 適用順序は Workflow Extension → internal Workflow Extension → Capability Skill Extension とする

## ガードレール

否定規則は配布物参照境界・廃止 state 保護の硬い境界に限定する:

- 配布 command/skill 本文にプロジェクト固有文書の具体参照（具体ID、具体パス、固定URL）を持たせない。プロジェクト固有参照は extension 経由でのみ与える
- 旧配置（`.agentdev/extensions/commands/**`）の extension を後方互換で読まない。旧 kind を検出した場合は migration-required として停止する

## See Also

- 本機構を定義する基盤 Design（extension schema、配置、実行時読み込み契約、project-local skill 委譲、配布物参照境界）
- 保守診断 command（extension 一覧化、構造確認、path 実在確認、skill 存在確認、旧参照リスト機構残存検出を担う）
