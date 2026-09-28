# check_changed_docs.ts case-run profile の appliesTo が docs/knowledge/**・traceability を対象外とする構造の是正候補

- 元 item: .agentdev/intake/inbox/2026-09-28-3231-check-changed-docs-case-run-profile-appliesto-exclusion.md
- 観測元: case-close Issue #3231（REQ-094 Wave 3・PR #3232 merge 9ed77a73）の Capture 回収（docs-integrity finding）
- 対象: .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts:282-294（2026-09-28 現行確認済み: case-run profile の appliesTo は docs/designs|reports|requirements|decisions|guides + AGENTS.md + README.md + docs/DOC-MAP.md + docs/README.md のみ。case-close・docs-check は appliesTo: true の全件対象）

## 課題

docs/knowledge 変更を含む実行単位で case-run 工程から targeted docs guard を実行すると files_checked 0（TARGET-EMPTY）となり guard が静かに空振りする。REQ-094 Wave 3 では全件適用の docs-check profile へ切替えて合格（機械実測: case-run profile files_checked 0 / docs-check profile files 17・failures 0）。

## 是正候補

- docs 横断是正バッチ（docs/knowledge・traceability 変更を含む実行単位）での guard 実行契約として、case-run profile の appliesTo 対象拡大、または docs-check profile 実行の明文化
- TARGET-EMPTY 検知条件（files_checked 空時の確認手順）の運用補強

## 既存要件との関連

- 対象 Design: docs/designs/integrity/targeted-docs-guard-implementation.md 系（guard 実行契約）+ check_changed_docs.ts 実装（repo-local）。既存品質ゲートへの影響なし。

## route 提示（backlog-review 判断用）

- Design 修正 + checker 実装の小規模 Case 化（方式選択含む）。
