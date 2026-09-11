# integrity suite 既存 warning 6件の後続処置候補（Epic 2734 W5 集約観察）

## 観測内容

- 発生源: PR 2751（Issue 2739 / Epic 2734 W5）の Findings/intake 記録を回収
- capture 元: case-close Epic Wave 5 最終 Wave 境界（Epic 2734、delegation DEL-2734-close-w5）
- captured_at: 2026-09-10

integrity suite（source profile）で検出されていた既存 warning 6件。いずれも main 627def84 既出で、Epic 2734 ケースの変更由来ではない。2026-09-11 時点の現行突合により、4件は解消済み、1件は別成果物へ集約済み、1件のみ有効:

| # | 対象 | 検出 check | 現行状態（2026-09-11 突合） |
|---|---|---|---|
| 1 | docs/designs/foundations/design-principles.md | accepted-adr-only-citation | 解消済み: DEC-022 は accepted 昇格済み（decisions/README.md） |
| 2 | docs/designs/integrity/verification-scope-catalog.md | accepted-adr-only-citation | 解消済み: DEC-027 は accepted 昇格済み（同上） |
| 3 | src/opencode/skills/agentdev-workflow-case-run/references/single.md | gh-direct-invocation | 別成果物へ集約済み: 2026-09-09-docs-raw-gh-cli-notation-normalization-candidates と同一対象（IR-053 除外候補判断をそちらで保持） |
| 4 | docs/designs/authoring/dependency-version-compatibility.md | draft-spec-staleness | 解消済み: 当該ファイルは現行で不存在を確認 |
| 5 | docs/designs/foundations/decision-lifecycle.md | draft-spec-staleness | 解消済み: frontmatter status が accepted へ昇格済み |
| 6 | src/opencode/skills/agentdev-artifact-validation/SKILL.md | obsolete-vocabulary-current-use | 有効: L53 に obsolete 語彙（「REQ/ADR/」形式、`kind(req\|adr\|decision)` 引数記述）が現存 |

## 影響・課題

- 有効な残課題は #6 の obsolete 語彙置換のみ
- W5 実行時点（2026-09-10）の検出であり、Epic 2734 の完了判定（拒否対象違反ゼロ）には影響しない（いずれも warning 区分）

## 後続判断に残る選択肢

- #6 の置換: 「REQ/ADR/Decision 横断」を文書種別責務の用語政策準拠の現行形式へ置換する

## 既存要件・契約との関連

- REQ-053（文書と配布物の文章品質契約）
- docs/designs/responsibilities/document-type-responsibilities.md（用語政策）
- docs/designs/authoring/vocabulary-registry.md
