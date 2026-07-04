---
name: agentdev-project-extensions
description: Resolves project-specific extensions (.agentdev/extensions/**) for a given command or skill at runtime. Handles extension discovery, absence/corruption fallback, 5-section reading (context/rules/checks/acceptance_gates/must_not), additive-not-override treatment, and project-local skill delegation target extraction. USE FOR: resolving project extensions for a command or skill, reading extension context/rules/checks, extracting project-local skill delegation targets. DO NOT USE FOR: defining extension schema, diagnosing extension structure, modifying distribution command/skill bodies, implementing project-local skills.
---

# Project Extensions

実行時に自分に対応する project extension を読み込み、プロジェクト固有の文脈、規約、検査、受け入れゲート、禁止事項を解決する。
配布 command/skill 本文はプロジェクト非依存であり、プロジェクト固有情報は `.agentdev/extensions/**` 経由で実行時に与えられる。

## 担当、非担当

### 担当

| 責務 | 内容 |
|------|------|
| extension 探索 | 対応 extension ファイル（1件）の特定と読み込み |
| extension 不在時の扱い | 空 extension として扱い、標準動作で続行 |
| extension 破損時の扱い | エラー表示と無視、標準動作で続行 |
| 5セクション読み取り | context/rules/checks/acceptance_gates/must_not の読み取り |
| 上書きでないことの扱い | extension は追加・拡張であり、標準動作を置き換えない |
| 委譲対象抽出 | rules/checks から project-local skill 委譲対象の抽出 |

### DO NOT USE FOR

- extension schema の定義（本機構を定義する基盤 SPEC の責務）
- extension 構造の診断、検査（保守診断 command の責務）
- 配布 command/skill 本文の変更
- project-local skill の実装（各適用プロジェクトの責務）
- extension 自体の作成、編集（プロジェクト側の責務）

## 標準配置

extension は以下の配置を持つ。command と skill で対応ディレクトリが異なる。

```text
.agentdev/extensions/commands/<command>.yaml
.agentdev/extensions/skills/<skill>.yaml
```

## extension の基本構造

extension は以下の基本構造を持つ。

```yaml
version: 1
kind: command-extension  # または skill-extension
id: /agentdev/<command>  # または <skill>

context: []
rules: []
checks: []
acceptance_gates: []
must_not: []
```

acceptance_gates は受け入れ条件ではなく、完了判定本体でもない。command/skill extension によって追加される実行完了前ゲートである。

## 責務ごとの手順

### 1. 対応 extension ファイルの探索

- command は `.agentdev/extensions/commands/<command>.yaml` を対象とする
- skill は `.agentdev/extensions/skills/<skill>.yaml` を対象とする
- 当該 extension ファイルのみを読み、自分に対応しない extension は読まない

### 2. extension 不在時の空 extension 扱い

対応 extension ファイルが存在しない場合は、空 extension として扱い標準動作で続行する。extension 不在はエラーではなく、配布 command/skill 単体で動作する通常状態である。

### 3. extension 破損時のエラー表示と無視

対応 extension ファイルが破損している場合（YAML 構文エラー、必須フィールド欠落等）は以下の手順をとる:

1. エラーメッセージを表示する（対象 extension ファイルパスと破損理由を含む）
2. 当該 extension を無視する
3. 空 extension として扱い、標準動作で続行する

破損 extension により処理全体を停止しない。利用者はエラーメッセージから拡張設定の修正を判断できる。

### 4. 5セクション読み取り

extension が持つ以下の5セクションを読み取る。

| セクション | 意味 |
|---|---|
| context | command/skill に追加で与える文脈 |
| rules | command/skill に追加で守らせる規約 |
| checks | command/skill に追加で実行させる検査 |
| acceptance_gates | command/skill extension が追加する実行完了前ゲート |
| must_not | command/skill に追加で課す禁止事項 |

各セクションは配列であり、複数の entry を持てる。entry は空配列でもよい。

### 5. 上書きでなく追加・拡張であることの扱い

extension の内容は配布 command/skill 本文の動作に**追加**され、既存動作を**置き換えない**。

- extension の context は、配布 command/skill が持つ文脈に追加される
- extension の rules、checks は、配布 command/skill の手順に追加で課される
- extension の must_not は、配布 command/skill の禁止事項に追加される
- extension の acceptance_gates は、配布 command/skill の完了判定の前に追加で実行される

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

初期契約では `action`, `required`, `fail_on` は採用しない。呼び出された skill は extension entry の `id`, `when`, `skill` および周辺文脈をもとに判断する。

AgentDevFlow 標準は `skill:` 構文を定義するが、委譲先 skill の中身には関与しない。各適用プロジェクトが project-local skill を用意し、rules/checks の中身を定義する。

## ハイブリッド方式

extension 原本は各プロジェクトが所有する。AgentDevFlow 本体は初期テンプレート、schema、検査、保守 command を提供し、consumer はテンプレートを初期値として取り込みカスタマイズする。

## ガードレール

- G01: extension は標準 command/skill の上書きではなく、追加・拡張のみ。配布 command/skill 本文の動作を置き換えない
- G02: 自分に対応する extension（1件）のみを読み、他の command/skill の extension は読まない
- G03: 破損 extension で処理全体を停止しない（エラー表示 + 無視 + 標準動作で続行）
- G04: 委譲先 project-local skill の中身には関与しない。委譲先の実装は各適用プロジェクトの責務
- G05: 配布 command/skill 本文にプロジェクト固有文書の具体参照（具体ID、具体パス、固定URL）を持たせない。プロジェクト固有参照は extension 経由でのみ与える

## See Also

- 本機構を定義する基盤 SPEC（extension schema、配置、実行時読み込み契約、project-local skill 委譲、配布物参照境界）
- 保守診断 command（extension 一覧化、構造確認、path 実在確認、skill 存在確認、旧参照リスト機構残存検出を担う）
