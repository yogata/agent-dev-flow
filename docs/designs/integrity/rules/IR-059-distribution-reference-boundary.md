---
title: "IR-059: distribution-reference-boundary"
status: accepted
created: 2026-08-20
updated: 2026-08-20
---

# IR-059: distribution-reference-boundary

配布テキスト成果物に含まれるプロジェクト固有の具体ID、具体パス、固定URLを検出する。
本IR文書を検知パターン、exemption、severity、false-positive条件の正本とする。
意味モデルと検出パイプラインの正規参照先は `distribution-boundary.md` である。

| Field | Value |
|---|---|
| rule_id | IR-059 |
| description | 配布テキスト成果物の具体ID、具体パス、固定URLを検出する |
| severity | strict |
| category | canonical-conflict |
| detection_method | 具体ID、具体パス、固定URLのパターン検出と generic/template 許容、個別承認例外判定 |
| affected_artifacts | `src/opencode/commands/**`, `src/opencode/skills/**`, template, script ソースなど配布対象テキスト成果物全般 |
| related_req | REQ-029 |
| related_spec | `distribution-boundary.md`, `foundations/project-extensions.md`, `integrity-rule-catalog.md` |
| gate_level | full-audit |
| false_positive_risk | テンプレートプレースホルダー、検査対象宣言、索引参照を exemption で抑制する |
| regression_test | 具体ID、具体パス、固定URL、各 exemption、generic/template 許容、個別承認例外の正常・異常 fixture を検証する |
| finding_route | intake |
| triage_action | generic 表記へ是正し、traceability を extension で補完する |

## 検知対象

- 具体ID: `ADR-NNNN`、`REQ-NNNN`、`REQ-NNNN-NNN`
- 具体パス: `docs/decisions/`、`docs/requirements/`、`docs/specs/`配下の具体ファイル
- 固定URL: 特定owner/repositoryを含むGitHub blob、raw URL

## exemption

- `{NNNN}`、`<NNNN>`、`<existing-spec>`、`<domain>`、`<command>`、`<spec>`、`<rule>`等のテンプレートプレースホルダー
- 検査対象を説明するためのパターン定義と検査対象path宣言
- 索引として許可されたREADME参照
- producer 内部へ解決しない generic または template 参照（REQ-029-004）

個別承認例外は特定の検出事項に付与する承認であり、ルールレベルの許容とは区別する。
個別承認例外はルール一般を書き換えず、最終状態で件数0を受け入れ条件とする。

## IR-056との関係

IR-056はProject Extensions構造と配置を検査し、IR-059は配布テキスト成果物の具体参照を検査する。
両者は独立した検出対象である。
DEC-006が確立したinspect 3-command正規化とIR-056のProject Extensions検査分離を維持しつつ、DEC-014がIR-059の affected_artifact 範囲と source/save/complete/release の各 enforcement 経路を変更する後続決定である。
DEC-006全体を置換せず、IR-059をIR-056へ統合しない。
