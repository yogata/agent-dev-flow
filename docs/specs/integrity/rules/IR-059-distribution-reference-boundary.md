---
status: accepted
---

# IR-059: distribution-reference-boundary

配布command/skill本文に含まれるプロジェクト固有の具体ID、具体パス、固定URLを検出する。本IR文書を検知パターン、exemption、severity、false-positive条件の正本とする。

| Field | Value |
|---|---|
| rule_id | IR-059 |
| description | 配布command/skill本文の具体ID、具体パス、固定URLを検出する |
| severity | strict |
| category | canonical-conflict |
| detection_method | 具体ID、具体パス、固定URLのパターン検出とテンプレートプレースホルダーexemption判定 |
| affected_artifacts | `src/opencode/commands/**`, `src/opencode/skills/**` |
| related_req | REQ-0160 |
| related_spec | `foundations/project-extensions.md`, `integrity-rule-catalog.md` |
| gate_level | full-audit |
| false_positive_risk | テンプレート例、検査対象宣言、索引参照をexemptionで抑制する |
| regression_test | 具体ID、具体パス、固定URL、各exemptionの正常・異常fixtureを検証する |
| finding_route | intake |
| triage_action | generic表記へ是正し、traceabilityをextensionで補完する |

## 検知対象

- 具体ID: `ADR-NNNN`、`REQ-NNNN`、`REQ-NNNN-NNN`
- 具体パス: `docs/adr/`、`docs/requirements/`、`docs/specs/`配下の具体ファイル
- 固定URL: 特定owner/repositoryを含むGitHub blob、raw URL

## exemption

- `{NNNN}`、`<NNNN>`、`<existing-spec>`、`<domain>`、`<command>`、`<spec>`、`<rule>`等のテンプレートプレースホルダー
- 検査対象を説明するためのパターン定義と検査対象path宣言
- 索引として許可されたREADME参照

## IR-056との関係

IR-056はProject Extensions構造と配置を検査し、IR-059は配布物本文の具体参照を検査する。両者は独立した検出対象である。
