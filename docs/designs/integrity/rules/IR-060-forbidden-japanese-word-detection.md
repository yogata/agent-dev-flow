---
title: "IR-060: forbidden Japanese word detection"
status: accepted
created: 2026-08-20
updated: 2026-09-09
---

# IR-060: forbidden Japanese word detection

現行 Markdown 本文における、固定置換できる禁止表現の機械検出。
一般文章の表層検査は textlint 共通基盤が所有し、本ルールは移管対象と移管対象外の責務境界を記録する。
履歴文脈、廃止語彙、旧パス、識別子に関わる検査は IR-065 / IR-066 等の既存 integrity checker が所有する。

| Field | Value |
|-------|-------|
| rule_id | IR-060 |
| description | 固定置換できる forbidden 表現を textlint の prh 標準辞書で完全一致検出する |
| severity | heuristic |
| category | document-drift |
| detection_method | `src/opencode/plugins/agentdev-textlint-guard/rules/default-prh.yml` の prh 規則による完全一致検出。textlint の Markdown parser が backticks 内、fenced code block 内、frontmatter を散文から除外する |
| affected_artifacts | [docs/**/*.md（docs/requirements/retired/, docs/decisions/retired/ を除く）, src/opencode/{commands,skills}/**/*.md] |
| related_req | [REQ-053-007, REQ-053-035, REQ-036-023, REQ-010-071] |
| related_design | [../../quality/textlint-quality-runtime.md, ../../responsibilities/document-type-responsibilities.md, ../integrity-rule-catalog.md] |
| gate_level | delta-guard |
| false_positive_risk | prh の Markdown 構造除外によりコード値と frontmatter を検出しない。文脈で推奨訳が変わる語と lifecycle / artifact-integrity 語彙は本規則へ追加しない |
| regression_test | `src/opencode/plugins/agentdev-textlint-guard/tests/standard-dictionary.test.ts`（正常、違反、境界、許容、過去再現） |
| finding_route | req-define |
| triage_action | prh の replacement を修正指針として提示し、固定置換可能な表現だけを是正する。文脈判断を要する表現は専用規則へ戻さず、成果物固有の意味品質能力へ委譲する |
| last_verified | 2026-09-09 |

## 検知対象

標準辞書 [default-prh.yml](../../../../src/opencode/plugins/agentdev-textlint-guard/rules/default-prh.yml) が所有する固定置換可能な語:

- 中国語簡体字・中国語由来: `而非`, `统一`, `陈述形式`, `候选`, `路径`, `来源`
- 文字化け・誤字: `破綾`, `監査証跠`, `成果成果物`, `本来件`, `進捰`
- 直訳独自語・誤記: `自己完束`
- 英語混在（識別子以外）: `source-of-trought`

`定位`、`一致性`、`測可能性`、`単独根`、`要件doc` は文脈依存または意味の復元が必要なため、標準辞書へ移管しない。

## exemption 条件

以下の文脈での辞書語出現は正当使用として検出対象外とする。

- backticks（`` ` ``）で囲まれた部分
- fenced code block（` ``` ` または `~~~`）の内部
- YAML frontmatter
- ファイルパス、enum 値、コマンド名、スキル名、YAML キー

## 既存 integrity checker との境界

IR-065 は廃止語彙の現行使用を、IR-066 は旧パス・削除済み名称・歴史的識別子を検査する。
これらは存在確認、履歴文脈、否定文脈を扱うため、textlint の一般文章辞書へ移管しない。
IR-060 は一般文章の固定置換だけを扱い、構造、参照、ライフサイクルの検査を重複実装しない。

## 関連

- [../../../../src/opencode/plugins/agentdev-textlint-guard/rules/default-prh.yml](../../../../src/opencode/plugins/agentdev-textlint-guard/rules/default-prh.yml): 移管済み標準辞書
- [../../responsibilities/document-type-responsibilities.md](../../responsibilities/document-type-responsibilities.md): 用語政策と責務境界
- [../integrity-rule-catalog.md](../integrity-rule-catalog.md): 整合性ルールカタログ
