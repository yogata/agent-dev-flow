---
title: Project Extensions
status: accepted
created: 2026-07-04
updated: 2026-08-10
---

# Project Extensions

実行時のプロジェクト固有追加・拡張機構としての project extensions を定義する（関連: DEC-006 inspect 3-command 構成への正規化）。
配布 command/skill 本文をプロジェクト非依存とし、プロジェクト固有の文脈、規約、検査、受け入れゲート、禁止事項を .agentdev/extensions/** 経由で追加・拡張する仕組みを規定する。
従来の .agentdev/doc-inputs/**（参照リスト機構）に替わる設定層である。

## 背景、目的

AgentDevFlow 配布 command/skill 本文（src/opencode/commands/**, src/opencode/skills/**）は、AgentDevFlow 本体固有の Decision/REQ/SPEC への具体参照を持つと、利用先プロジェクトで解決不能な参照が混入する。

project extensions 機構は、プロジェクト固有の追加・拡張を配布コードから分離し、プロジェクト別に与える。実装本文はプロジェクト非依存・単体利用可能とし、Decision/REQ/SPEC の具体ID、具体パス、固定URLを持たない。extensions（.agentdev/extensions/**）はプロジェクト固有情報を対象とし、そのプロジェクトの Decision/REQ/SPEC を具体的に参照してよい。

## 標準配置

```text
.agentdev/extensions/commands/<command>.yaml
.agentdev/extensions/skills/<skill>.yaml
```

## Extension 種別

Extension を workflow / capability responsibility 中心の3種へ再編する（DEC-012）。

### Workflow Extension

公開Workflow Skill への追加・拡張。internal workflow / STEP 全体を拘束する。
配置: .agentdev/extensions/skills/{workflow-skill-name}.yaml。

### internal Workflow Extension

Workflow Skill の内部動作への追加・拡張。Workflow Skill のみが読む。command は直接読まない。
配置: .agentdev/extensions/skills/{workflow-skill-name}/internal.yaml。

### Capability Skill Extension

Capability Skill への追加・拡張。
配置: .agentdev/extensions/skills/{capability-skill-name}.yaml。

### 適用順序

Workflow Extension → internal Workflow Extension → Capability Skill Extension。
public Workflow Extension が Capability Skill extension へ暗黙コピーしない。
後方互換性のためだけの二重extension model を正規状態として残存させない（DEC-012）。

### 旧kind からの移行（breaking migration）

旧kind（command-extension / skill-extension）は完全廃止。runtime後方互換なし。
consumer プロジェクトも新kindへの移行対象。旧kind残存時は deterministic check で検出し
migration-required として停止（silent ignore しない）。

#### mapping 表

| 旧kind | 新kind | 備考 |
|---|---|---|
| command-extension | Workflow Extension | 公開Workflow Skill への追加・拡張 |
| skill-extension（workflow skill対象） | Workflow Extension / internal Workflow Extension | Workflow Skill への追加・拡張 |
| skill-extension（capability skill対象） | Capability Skill Extension | Capability Skill への追加・拡張 |

#### migration-required 検出

extension 読込時に旧kind を検出した場合、migration-required エラーとして停止する。
エラーメッセージは mapping 表へ誘導し、新kind への移行手順を提示する。

## 実行時読み込み契約

command/skill は実行時に自分に対応する extension だけを読む。

- command は .agentdev/extensions/commands/<command>.yaml を対象とする。
- skill は .agentdev/extensions/skills/<skill>.yaml を対象とする。
- 対応 extension が存在しない場合は標準動作で続行する。
- 対応 extension が破損している場合はエラーを表示し、当該 extension を無視して標準動作で続行する。
- extension は標準 command/skill の上書きではなく、追加・拡張としてのみ扱う。

対応 extension が存在しない command/skill は正常動作であり、異常状態ではない。command が project 非依存で単体動作する正当な状態である。例として `/agentdev/inspect-skills` は SPEC 直接参照を持たず project 非依存で動作するため extension 不要である。

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

command/skill 本文には、Decision/REQ/SPEC の具体ID、具体パス、固定URLを記述しない。

禁止対象は文書種別名としての ADR, REQ, SPEC ではなく、プロジェクト固有文書を直接指す具体参照である。

.agentdev/extensions/** は、そのプロジェクトの Decision/REQ/SPEC 参照を許可する。
REQ/Decision/SPEC 本文内の参照も許容する。

## 検査、診断

extension 検査は DEC-006（inspect 3-command 構成への正規化）に基づき、deterministic check、semantic diagnosis、finding disposition の3層へ分離される。各層は重複しない。

| 層 | 正規所有者 | 検査内容 |
|---|---|---|
| deterministic check | IR-056 / `/repo/docs-check`（self-hosting）、`/agentdev/case-run`・`/agentdev/case-close` の changed-path routing（consumer） | extension 一覧化、YAML 構文、必須セクションと field、kind と配置、ID と対象 command/skill の対応、context path 実在、委譲先 skill 実在、旧 `.agentdev/doc-inputs/**` 残存 |
| semantic diagnosis | `/agentdev/inspect-skills` | extension 責務境界、標準 command/skill を上書きする意図の意味診断 |
| finding disposition | `/agentdev/inspect-promote` | finding の promote、defer、reject |

AgentDevFlow 標準の inspect 責務は上記構造確認・path 実在確認・skill 存在確認までとする。
command/skill 本文の Decision/REQ/SPEC 具体参照禁止の持続的検査は、各適用プロジェクトが project-local skill により実装する（AgentDevFlow 標準の対象外）。
agent-dev-flow リポジトリ自身は適用プロジェクトの1つとして repo-local skill により検査を実装するが、これは標準仕様ではなくローカル運用である。
`/agentdev/inspect-docs` へ extension の意味診断を追加しない（三層非重複）。

## ハイブリッド方式

extension 原本は各プロジェクトが所有する。AgentDevFlow 本体は初期テンプレート、schema、検査（`/repo/docs-check`、`/agentdev/inspect-skills`、`/agentdev/inspect-promote` の3層）を提供し、consumer はテンプレートを初期値として取り込みカスタマイズする。AgentDevFlow 本体リポジトリの .agentdev/extensions/** には本体固有 SPEC パスを記述してよい。

## 配布物参照境界の責務分担

本SPECはProject Extensionsのschema、配置、読込、標準診断、責務境界を所有する。配布command/skill本文の具体ID、具体パス、固定URLに対する検知パターン、exemption、severity、false-positive条件はIR-059個別文書が所有する。

配布物参照境界の検出結果はgeneric表記への是正とextensionによるtraceability補完へ接続する。
## 関連

- DEC-006: inspect 3-command 構成への正規化（extension 検査の3層責務分離を確定）
- REQ-001: 実行時独立性（本 SPEC は具体化機構を提供）

