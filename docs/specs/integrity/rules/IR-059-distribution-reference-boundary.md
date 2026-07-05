---
status: accepted
---

# IR-059: distribution-reference-boundary

配布 command/skill 本文の具体ID、具体パス、固定URL検出。配布物参照境界の検知パターンと exemption 条件は [../../foundations/project-extensions.md](../../foundations/project-extensions.md)「配布物参照境界の検知パターン」セクションを正とする（REQ-0160）。

| Field | Value |
|-------|-------|
| rule_id | IR-059 |
| description | 配布 command/skill 本文（`src/opencode/commands/**`, `src/opencode/skills/**`）に含まれる具体ID（ADR-NNNN, REQ-NNNN, REQ-NNNN-NNN）、具体パス（`docs/(adr\|requirements\|specs)/<file>.md`）、固定URL（`github.com/<owner>/<repo>/(blob\|raw)/`, `raw.githubusercontent.com/<owner>/<repo>/`）を検出する。文書種別名としての ADR/REQ/SPEC は対象外。テンプレートプレースホルダー行は exemption |
| severity | strict |
| category | canonical-conflict |
| detection_method | 正規表現パターンマッチ（具体ID/具体パス/固定URL + exemption 条件判定）。exemption 条件: 行内にテンプレートプレースホルダー（`{NNNN}`, `<NNNN>`, `<existing-spec>`, `<domain>`, `<command>`, `<spec>`, `<rule>`）を含む場合は具体ID/具体パス検査をスキップ |
| affected_artifacts | [src/opencode/commands/**, src/opencode/skills/**] |
| related_req | [REQ-0160] |
| related_spec | [../foundations/project-extensions.md, integrity-rule-catalog.md] |
| gate_level | full-audit |
| false_positive_risk | テンプレートプレースホルダー誤検知。exemption 条件で抑制。README.md は索引として許容 |
| regression_test | (未実装) |
| baseline_status | new |
| finding_route | intake |
| triage_action | generic 表記への是正を推奨。traceability は extension 経由で再設定 |
| last_verified | 2026-07-05 |

## 検知対象詳細

検知パターンの詳細は [../../foundations/project-extensions.md](../../foundations/project-extensions.md)「配布物参照境界の検知パターン」セクションを正とする。

### 検知対象

- 具体ID: ADR-NNNN, REQ-NNNN (4桁数字), REQ-NNNN-NNN (サブ要件番号)。文書種別名としての ADR/REQ/SPEC は対象外。
- 具体パス: `docs/(adr|requirements|specs)/<file>.md`。README.md は索引として許容。テンプレート表記 `{}`, `<>`, `*` は許容。
- 固定URL: `github.com/<owner>/<repo>/(blob|raw)/`, `raw.githubusercontent.com/<owner>/<repo>/`。

### exemption 条件

テンプレートプレースホルダー（`{NNNN}`, `<NNNN>`, `<existing-spec>`, `<domain>`, `<command>`, `<spec>`, `<rule>`）を行内に含む場合は具体ID/具体パス検査をスキップする。

## IR-056 との関係

IR-056（project-extensions-integrity）は extensions 機構の構造検査が対象であり、配布物本文の具体参照検出とは対象領域が異なる。IR-059 は IR-056 とは独立した検出対象とする。

## 関連

- [../../foundations/project-extensions.md](../../foundations/project-extensions.md): Project Extensions SPEC（配布物参照境界の検知パターン正）
- [../integrity-rule-catalog.md](../integrity-rule-catalog.md): 整合性ルールカタログ
