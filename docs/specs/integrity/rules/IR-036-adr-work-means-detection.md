# IR-036: ADR-work-means-detection

| Field | Value |
|-------|-------|
| rule_id | IR-036 |
| description | 承認済み ADR（frontmatter `status: accepted`）のタイトル、本文に作業手段（削除、廃止、移行、完全削除、統合、再構築）の混入を検出すること（REQ-0108-249）。作業手段を主題とする ADR は作成不可であるため、承認済み ADR にこれらが主題として含まれていないかを検査する。`deprecated`、`superseded` 等の非承認ステータス ADR は frontmatter `status` フラグにより機械的に除外する（REQ-0101-043/044 は承認済み ADR のみを対象とするため） |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | (1) frontmatter `status` field 抽出 → `status: accepted` のみ検査対象とし、`deprecated`/`superseded`/`proposed` 等は機械的除外。(2) 承認済み ADR のタイトル、Decision セクションから作業手段キーワード（削除、廃止、移行、完全削除、統合、再構築）を検出し、主題か背景記述かを判定 |
| affected_artifacts | [accepted ADR（frontmatter `status: accepted` のみ。`deprecated`/`superseded` は status flag で除外）] |
| related_req | [REQ-0108-249, REQ-0101-043, REQ-0101-044, REQ-0101-045] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 高。Context（背景）セクションでの作業手段言及は許容されるため、Decision セクションの主題判定に注意。非承認ステータス ADR（例: ADR-0113 `status: deprecated`）は frontmatter `status` フラグで確実に除外されるため、当該 ADR の作業手段言及は検出対象外となる（履歴参照として扱う） |
| regression_test | (追加予定)。`status: deprecated` ADR が除外されること、`status: accepted` ADR の作業手段主題が検出されることを検証する |
| baseline_status | new |
| finding_route | req-define |
| triage_action | 作業手段を主題とする ADR を retire/supersede または REQ/case へ移管 |
| last_verified | 2026-06-24 |

## IR-036 適用範囲（deprecated ADR 除外判定）

IR-036 は REQ-0101-043/044（承認済み ADR の記述対象制約）の機械検査として機能する。
REQ-0101-043/044 は「承認済み ADR」を対象とするため、IR-036 の検査対象も frontmatter `status: accepted` の ADR に限定する。

**除外判定（機械的）**:

| frontmatter `status` 値 | IR-036 適用 | 根拠 |
|--------------------------|-------------|------|
| `accepted` | 適用（検査対象） | REQ-0101-043/044 の対象 |
| `deprecated` | 除外 | 当該 ADR の決定内容は現行基盤に反映されていない（履歴参照）。作業手段言及が残っていても現行判断ではないため検出不要 |
| `superseded` | 除外 | 後継 ADR に置き換え済み。旧 ADR の Decision は歴史記録 |
| `proposed` | 除外 | 未承認のため現行判断ではない |

**代表例**: ADR-0113（`status: deprecated`、diagnostics → inspect 改名により現行根拠として非適用）。Decision セクションに「完全削除」等の作業手段言及が残存するが、当該 ADR は非承認ステータスのため IR-036 の検査対象外となる。ADR-0113 ファイル自体の編集（`retired/` 移動、Decision セクション再分類）は ADR 整理フロー（別 RU）で扱い、本ルールの機械的除外判定とは独立させる。
