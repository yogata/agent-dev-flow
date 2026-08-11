---
status: accepted
---

# IR-059: distribution-reference-boundary

配布command/skill本文に含まれるプロジェクト固有の具体ID、具体パス、固定URLを検出する。本IR文書を検知パターン、exemption、severity、false-positive条件の正本とする。

| Field | Value |
|---|---|
| rule_id | IR-059 |
| description | 配布command/skill本文の具体ID、具体パス、固定URLを検出する。意味境界の正規所有は REQ-029、検出モデルは distribution-boundary.md |
| severity | strict |
| category | canonical-conflict |
| detection_method | 具体ID、具体パス、固定URLのパターン検出とテンプレートプレースホルダーexemption判定。意味境界の分類値と判定パイプラインは distribution-boundary.md が正規所有 |
| affected_artifacts | `src/opencode/commands/**`, `src/opencode/skills/**` を含む配布テキスト成果物全般（REQ-029-002） |
| related_req | REQ-029 |
| related_spec | `distribution-boundary.md`, `foundations/project-extensions.md`, `integrity-rule-catalog.md` |
| gate_level | full-audit |
| false_positive_risk | テンプレート例、検査対象宣言、索引参照、generic/template 参照（REQ-029-004 許容）をexemptionで抑制する |
| regression_test | 具体ID、具体パス、固定URL、各exemption、generic/template 許容の正常・異常fixtureを検証する |
| finding_route | intake |
| triage_action | generic表記へ是正する。traceabilityはextensionで補完し得るが意味境界の唯一解ではない（REQ-029-003、REQ-029-004） |

## 検知対象

- 具体ID: `ADR-NNNN`、`REQ-NNNN`、`REQ-NNNN-NNN`
- 具体パス: `docs/decisions/`、`docs/requirements/`、`docs/specs/`配下の具体ファイル
- 固定URL: 特定owner/repositoryを含むGitHub blob、raw URL

検知対象の意味境界（producer 内部依存と consumer 解決可能依存の区別、配布テキスト成果物の対象範囲）は `distribution-boundary.md` が正規所有する。本ルールはその構文的検出代理であり、意味境界の全てをカバーしない（CR-001、DEC-014 背景）。

## exemption

- `{NNNN}`、`<NNNN>`、`<existing-spec>`、`<domain>`、`<command>`、`<spec>`、`<rule>`等のテンプレートプレースホルダー
- 検査対象を説明するためのパターン定義と検査対象path宣言
- 索引として許可されたREADME参照
- producer 内部へ解決しない generic または template 参照（REQ-029-004、`distribution-boundary.md`「generic と template 許容」）

個別承認例外（individual accepted exception）はルールレベル許容とは別物として運用し、最終状態で件数=0を受け入れ条件に含める（`distribution-boundary.md`「ベースラインと個別承認例外の区別」、CR-007）。

## IR-056との関係

IR-056はProject Extensions構造と配置を検査し、IR-059は配布物本文の具体参照を検査する。両者は独立した検出対象である。DEC-014（配布依存境界の多層 enforcement）は DEC-006 の inspect 3-command 正規化と IR-056 の Project Extensions 検査分離を維持しつつ、IR-059 の affected_artifact 範囲と source/save/complete/release の各 enforcement 経路を変更する後続決定である。DEC-006 全体を置換せず、IR-059 を IR-056 へ統合しない。
