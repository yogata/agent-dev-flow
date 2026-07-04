---
title: Project Extensions
status: draft
created: 2026-07-04
updated: 2026-07-04
---

# Project Extensions

実行時のプロジェクト固有追加・拡張機構としての project extensions を定義する（ADR-0135: Project Extensions Architecture）。
配布 command/skill 本文をプロジェクト非依存とし、プロジェクト固有の文脈、規約、検査、受け入れゲート、禁止事項を .agentdev/extensions/** 経由で追加・拡張する仕組みを規定する。
従来の .agentdev/doc-inputs/**（参照リスト機構）に替わる設定層である。

## 背景、目的

AgentDevFlow 配布 command/skill 本文（src/opencode/commands/**, src/opencode/skills/**）は、AgentDevFlow 本体固有の ADR/REQ/SPEC への具体参照を持つと、利用先プロジェクトで解決不能な参照が混入する。

project extensions 機構は、プロジェクト固有の追加・拡張を配布コードから分離し、プロジェクト別に与える。実装本文はプロジェクト非依存・単体利用可能とし、ADR/REQ/SPEC の具体ID、具体パス、固定URLを持たない。extensions（.agentdev/extensions/**）はプロジェクト固有情報を対象とし、そのプロジェクトの ADR/REQ/SPEC を具体的に参照してよい。

## 標準配置

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

各セクションの意味:

| セクション | 意味 |
|---|---|
| context | command/skill に追加で与える文脈 |
| rules | command/skill に追加で守らせる規約 |
| checks | command/skill に追加で実行させる検査 |
| acceptance_gates | command/skill extension が追加する実行完了前ゲート |
| must_not | command/skill に追加で課す禁止事項 |

acceptance_gates は REQ の受け入れ条件ではなく、case-close / QG 本体でもない。command/skill extension によって追加される実行完了前ゲートである。

## 実行時読み込み契約

command/skill は実行時に自分に対応する extension だけを読む。

- command は .agentdev/extensions/commands/<command>.yaml を対象とする。
- skill は .agentdev/extensions/skills/<skill>.yaml を対象とする。
- 対応 extension が存在しない場合は標準動作で続行する。
- 対応 extension が破損している場合はエラーを表示し、当該 extension を無視して標準動作で続行する。
- extension は標準 command/skill の上書きではなく、追加・拡張としてのみ扱う。

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

command/skill 本文には、ADR/REQ/SPEC の具体ID、具体パス、固定URLを記述しない。

禁止対象は文書種別名としての ADR, REQ, SPEC ではなく、プロジェクト固有文書を直接指す具体参照である。

.agentdev/extensions/** は、そのプロジェクトの ADR/REQ/SPEC 参照を許可する。
REQ/ADR/SPEC 本文内の参照も許容する。

## 検査、診断

/agentdev/inspect-extensions は読み取り専用診断コマンドとして以下を検査する。

1. .agentdev/extensions/** の一覧化
2. extension YAML の構造確認
3. kind と配置の整合確認
4. id と対象 command/skill の対応確認
5. context.paths の実在確認
6. rules.skill / checks.skill に記述された project-local skill の存在確認
7. 旧 .agentdev/doc-inputs/** の残存検出
8. extension が標準 command/skill の上書きとして記述されていないことの確認

AgentDevFlow 標準の inspect 責務は上記構造確認・path 実在確認・skill 存在確認までとする。
command/skill 本文の ADR/REQ/SPEC 具体参照禁止の持続的検査は、各適用プロジェクトが project-local skill により実装する（AgentDevFlow 標準の対象外）。
agent-dev-flow リポジトリ自身は適用プロジェクトの1つとして repo-local skill により検査を実装するが、これは標準仕様ではなくローカル運用である。

## ハイブリッド方式

extension 原本は各プロジェクトが所有する。AgentDevFlow 本体は初期テンプレート、schema、検査、/agentdev/inspect-extensions コマンドを提供し、consumer はテンプレートを初期値として取り込みカスタマイズする。AgentDevFlow 本体リポジトリの .agentdev/extensions/** には本体固有 SPEC パスを記述してよい。

## 関連

- ADR-0135: Project Extensions Architecture
- ADR-0104: 実行時独立性（本 SPEC は具体化機構を提供）
