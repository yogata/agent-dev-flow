---
status: accepted
spec_logical_division: behavior
canonical_owner: IR-056
---

# IR-056: project-extensions-integrity

Project Extensionsのschema、配置、ID、参照path、委譲先skill、上書き意図、旧機構残存を検査する。
本IR文書を検知詳細、exemption、severity、false-positive条件の正本とする。

| Field | Value |
|---|---|
| rule_id | IR-056 |
| description | `.agentdev/extensions/{commands,skills}/*.yaml`の構造、配置、ID、path、委譲先skill、上書き意図、旧機構残存を検査する |
| severity | strict |
| category | broken-reference |
| detection_method | `check_extensions.ts`によるschema検証、配置・ID整合、path実在、委譲先skill存在、旧機構残存、上書き意図の検査 |
| affected_artifacts | `.agentdev/extensions/commands/*.yaml`, `.agentdev/extensions/skills/*.yaml` |
| related_req | REQ-002 |
| related_spec | `foundations/project-extensions.md`, `integrity-rule-catalog.md` |
| gate_level | full-audit, delta-guard, impact-guard |
| false_positive_risk | テンプレート例、検査対象宣言、repo-local領域をexemptionで抑制する |
| regression_test | `check_extensions.test.ts`で各検査項目の正常・異常・exemption fixtureを検証する |
| finding_route | intake |
| triage_action | severityとgate契約に従ってfailまたはwarningとして処理する |
| last_verified | 検証実行日を記録する |

## 検査項目

1. extensionファイルの一覧化
2. frontmatterと5セクションのschema適合
3. kindと配置の整合
4. IDと対象command/skillの対応
5. `context.paths`の実在
6. `rules.skill`と`checks.skill`の委譲先skill存在
7. 旧`.agentdev/doc-inputs/**`の残存
8. 標準command/skillの上書き意図

## exemption

- テンプレートプレースホルダー
- 検査対象を説明するpath宣言
- repo-local検査実装

## IR-059との関係

IR-056はProject Extensions構造を検査し、IR-059は配布物本文の具体参照を検査する。
両者は独立した検出対象である。

## IR-056 起動契約（self-hosting と consumer）

IR-056（project-extensions integrity）は次の2経路で起動する（REQ-010、DEC-006: inspect-command-normalization）。

### self-hosting full audit

- docs-check が self-hosting full audit で .agentdev/extensions/{commands,skills}/*.yaml を走査する
- 走査対象は全 extension ファイル（*.yaml）
- 検査内容は IR-056 の検出項目（extension一覧、YAML構文、必須セクションとfield、kindと配置、IDと対象command/skill対応、context path実在、委譲先skill実在、旧.agentdev/doc-inputs/** 残存）

### consumer changed-path routing

- case-run と case-close の changed-path routing が .agentdev/extensions/** 変更を検出した場合、IR-056 を起動する
- 変更ファイルが .agentdev/extensions/{commands,skills}/*.yaml に該当する場合に起動する
- 検査結果は PR 本文の Findings セクションへ記録する

### 検出事項の処分

- IR-056 / docs-check の検出事項（deterministic check 群）は機械的検査結果として報告する
- 検出事項の意味診断（extension 責務境界、上書き意図）は inspect-skills へ委譲する
- 検出事項の promote、defer、reject は inspect-promote へ委譲する
