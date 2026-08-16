---
status: accepted
---

# IR-025: 廃止 Decision path 規則

| Field | Value |
|-------|-------|
| rule_id | IR-025 |
| description | v2 番号帯 ADR（v2:ADR-0001〜v2:ADR-0099）への不正参照を検出する。v2 参照は履歴参照として `v2:` プレフィックスで明示的に区別すること（REQ-001-047, 048） |
| severity | strict |
| category | obsolete-structure |
| detection_method | `docs/decisions/(ADR-\d{4}|DEC-\d{4,})\.md` パターンのファイル名確認（現行3桁ID `DEC-001〜DEC-{NNN}` のみ許容。4桁の v2:ADR-0000〜v2:ADR-0099 形式は禁止） |
| affected_artifacts | [Decision] |
| related_req | [REQ-001-047, REQ-001-048] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | なし。番号帯マッチングは確実 |
| regression_test | (未実装) |
| finding_route | intake |
| triage_action | v2 参照を `v2:` プレフィックス付き履歴参照形式へ修正、または現行3桁IDの Decision 参照へ置換 |
| last_verified | 2026-06-08 |

## detection_method

現行 Decision は3桁ID（`DEC-001〜DEC-{NNN}`）を使用する。
これらは `docs/decisions/` 直下に配置する。

v2 歴史的 ADR は4桁ID（`v2:ADR-0000〜v2:ADR-0099`）を使用し、履歴参照としてのみ扱う。
v2 参照は必ず `v2:` プレフィックスを付けて明示的に区別する（REQ-001-048）。

**適用範囲**:
- 現行 Decision: `DEC-001` 形式（3桁ID）。`docs/decisions/` 直下に配置。status は `accepted` / `deprecated` 等
- v2 歴史的 ADR: `v2:ADR-0001` 形式（4桁ID）。履歴参照用。ファイルは存在せず、tag `v2.11.0` で参照

本ルールは `docs/decisions/` 直下に4桁形式の ADR ファイルが残存していないことを検出する。
v2 参照を履歴として必要とする場合は、`v2:` プレフィックス付きで明示的に記述する。

IR-036 が status:deprecated を work-means 検出から除外する（履歴参照、現行判断ではない）。
