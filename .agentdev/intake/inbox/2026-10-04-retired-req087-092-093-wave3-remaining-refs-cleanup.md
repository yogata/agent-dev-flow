# intake: 廃止済み REQ-087/092/093 の残存参照の Wave-3 参照更新候補（物理削除後の横断追随）

## 内容

Epic #3425 Wave 2（Case #3431・PR #3438）で REQ-092/093/087 を retired/ へ物理削除した後、 Wave-3（#3432）の「廃止REQ行を参照する他文書・テスト・checker の参照更新」スコープに含まる残存参照の一覧。traceability check の unknown-req-refs のうち REQ-087/092/093 系は 30 件（本変更由来の計画内残差）。

- `docs/designs/responsibilities/custom-tool-contracts.md` L106/L108: `REQ-092-003`・`REQ-093-004` 行 ID 参照（→ REQ-095-003 系・REQ-052-014/015 + issue-operation-safety.md 該当節への付け替え候補）
- `docs/designs/integrity/rules/IR-053-gh-direct-invocation-detection.md`: `REQ-092-003` 参照
- `docs/designs/integrity/rules/IR-069-req-number-gap-recorded.md`: frontmatter `related_req` の `REQ-087-002/003`（後継 REQ-010-070 併記済み）
- `docs/designs/integrity/rule-ownership.md`、`docs/designs/foundations/references/crosswalk-inventory.md`、`docs/requirements/REQ-082.md` L12: `REQ-087` 系参照
- `docs/guides/consumer-project-setup.md` L3: `REQ-093-002` 宣言参照
- `src/common/skills/agentdev-issue-management/references/issue-operation-safety.md` 冒頭コメントおよび `traceability/agentdev-issue-management.yaml`: `REQ-092-001〜005`・`REQ-093-001/004` 宣言参照
- `src/opencode/plugins/agentdev-gh-tool/README.md`・`tests/plugin.test.ts`、`src/common/tools/agentdev-gh/runner-cli.ts`・`tests/runner-cli.test.ts`: `REQ-093-002/003` 宣言参照
- `.opencode/skills/repo-agentdev-integrity/scripts/`: `check_integrity.ts`・`check_integrity.test.ts` の ADF-COVERS 宣言（`REQ-087-002/003/004`）、`regression_req092_issue_list_discipline.test.ts`（`REQ-092-001〜005` 宣言。既存 intake item `2026-10-04-retired-req092-repo-local-test-refs-cleanup.md` が本クラスを既に捕捉済み）
- `traceability/policy.yaml`・`traceability/agentdev-issue-management.yaml`・`traceability/consumer-project-setup.yaml`・`traceability/agentdev-gh-tool.yaml`・`traceability/agentdev-gh.yaml`: REQ-087/092/093 行への optional 列挙・coverage 宣言
- case-close E6-2 全文検索で追加確認した同クラス候補（機械検査未検出・説明文参照）: `.opencode/skills/repo-agentdev-integrity/SKILL.md` L80（IR-069 検査説明内の `REQ-087-002/003`）、`docs/knowledge/checker-fixture-import-share-adversarial-test-pattern.md` L35（`REQ-087-004` 実例言及）、`docs/requirements/REQ-095.md` L27・`docs/requirements/REQ-102.md` L24（対象外行の bare `REQ-092`/`REQ-093` 言及）
- `REQ-010-070` 行 ID 重複（pre-existing）: `docs/requirements/REQ-010.md` L43/L44 で `REQ-010-070` が重複（L43 = ギャップ検査行〔#3428 追記〕、L44 = 旧・新規検査クラス追加行）。機械検査の実在性判定には影響しないが採番管理上の ID 重複。REQ-010 本体編集は Wave-3 以降の修正候補

対応候補: Wave-3（#3432）の横断追随で retired 行 ID 宣言を後継 REQ 行（REQ-095-003 系・REQ-052-014/015・REQ-001-070・REQ-010-070）+ 使用手順文書へ付け替え。docs/decisions/README.md 関連REQ表の retired 実パス + 廃止注記（REQ-010-072 要求）も同時に確認。

## 根拠

- 観測元: PR #3438（Case #3431・Epic #3425 Wave 2）本文 Findings / Capture候補 intake セクション + case-close E6-2 廃止キーワード全文検索の追加分
- 元テキスト: 「Wave-3（#3432）参照更新対象の残存参照（本 PR では更新せず、既存どおり残置）」
- 備考: 欠番レジストリ（numbering-policy.md 3エントリ）と retired/*.md 自身・requirements/README.md retired テーブルの参照は廃止契約上の by-design であり更新対象外。docs-check 由来の phantom row NG 4件 + IR-069 related_req NG 2件は PR #3438 検証差分に記録済み
- captured_at_commit: 94a9f43ae139040da401c8f904a7edf2ac0f71f2
