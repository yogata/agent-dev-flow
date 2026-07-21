---
status: accepted
---

# IR-056: project-extensions-integrity

Project Extensionsのschema、配置、ID、参照path、委譲先skill、上書き意図、旧機構残存を検査する。本IR文書を検知詳細、exemption、severity、false-positive条件の正本とする。

| Field | Value |
|---|---|
| rule_id | IR-056 |
| description | `.agentdev/extensions/{commands,skills}/*.yaml`の構造、配置、ID、path、委譲先skill、上書き意図、旧機構残存を検査する |
| severity | strict |
| category | broken-reference |
| detection_method | `check_extensions.ts`によるschema検証、配置・ID整合、path実在、委譲先skill存在、旧機構残存、上書き意図の検査 |
| affected_artifacts | `.agentdev/extensions/commands/*.yaml`, `.agentdev/extensions/skills/*.yaml` |
| related_req | REQ-0160 |
| related_spec | `foundations/project-extensions.md`, `integrity-rule-catalog.md` |
| gate_level | full-audit, delta-guard, impact-guard |
| false_positive_risk | テンプレート例、検査対象宣言、repo-local領域をexemptionで抑制する |
| regression_test | `check_extensions.test.ts`で各検査項目の正常・異常・exemption fixtureを検証する |
| baseline_status | new |
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

IR-056はProject Extensions構造を検査し、IR-059は配布物本文の具体参照を検査する。両者は独立した検出対象である。
