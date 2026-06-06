# Retired REQ の非 retired 文書での参照

## 観測
integrity-check により、retired（引退済み）REQ が非 retired 文書から参照されている事例が合計43件（LinkIntegrity 22件 + LifecycleBoundary 21件、内容はほぼ重複）検出された。

**主な参照元ファイルと retired REQ:**

| 参照元 | retired REQ |
|--------|------------|
| `docs/adr/ADR-0003.md` | REQ-0007 |
| `docs/adr/ADR-0004.md` | REQ-0004 |
| `docs/adr/ADR-0005.md` | REQ-0017 |
| `docs/adr/ADR-0006.md` | REQ-0020 |
| `docs/adr/ADR-0007.md` | REQ-0004 |
| `docs/adr/ADR-0008.md` | REQ-0004 |
| `docs/adr/ADR-0009.md` | REQ-0001, REQ-0040, REQ-0023, REQ-0039, REQ-0041 |
| `docs/adr/README.md` | REQ-0016, REQ-0007, REQ-0004, REQ-0017, REQ-0020, REQ-0035, REQ-0041 |
| `docs/specs/patterns.md` | REQ-0001 |
| `docs/specs/system.md` | REQ-0001 |
| `docs/guides/project-docs-and-specs.md` | REQ-0001 |

## 今回扱わない理由
初期 ADR（ADR-0001〜0009）は歴史的文書であり、元の REQ が引退しても ADR 自体の意図は不変。修正の優先度判断が必要。

## 影響
- ADR の歴史的参照先として明確であれば実害は低い
- README や specs での retired REQ 参照は、読者が現行要件と誤認する可能性がある

## レビューで決めること
- ADR 内の retired REQ 参照を「歴史的参照」として残すか、注記を追加するか
- ADR README から retired REQ を削除するか
- specs/guides 内の retired REQ 参照（REQ-0001 等）を現行 REQ に置換するか

## 根拠
- integrity-check カテゴリ: LinkIntegrity / retired-req-as-current, LifecycleBoundary / retired-req-primary-ref
- 分類: `document-drift`
- ルート: `intake`
- 検出元: `.agentdev/integrity/reports/2026-06-04-integrity-report.md`
