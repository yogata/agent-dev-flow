# IR-044 テストファイル責務境界の曖昧さ（scripts/check_integrity.test.ts vs scripts/tests/check_integrity.test.ts）

## 発生源

- Issue: #1111
- PR: #1121 (merged, squash 4eb008b6)
- 発生日: 2026-06-24

## 観測

Issue #1111 の本文がテスト対象パスとして `scripts/tests/check_integrity.test.ts` を指定していたが、当該ファイルは Issue #657 の regression 専用（fixture drift detection）であり、IR-044 の正規テストスイートは `scripts/check_integrity.test.ts` に存在する（`buildIr044Fixture`、既存の `isDelegationContext` predicate テスト、IR-044 describe block が既存）。PR #1121 では正規ファイル側にテストを追加した。

## 今回扱わない理由

本 Issue のスコープは IR-044 exoneration 条件の実装とテスト追加であり、テストファイルの責務境界整理（SPEC への明文化、またはファイル名のリネーム）は別作業。実装の一貫性を優先するため、既存 IR-044 スイートが存在する正規ファイルへ追加した。

## 影響

Issue 本文と実際のテスト配置が一致しない場合、後続エージェントが誤ったファイルを編集するリスクがある。`scripts/tests/check_integrity.test.ts`（Issue #657 regression 専用）と `scripts/check_integrity.test.ts`（IR-044 他の正規スイート）の責務が SPEC 上明文化されていないため、両者の使い分けが暗黙知に依存している。

## レビューで決めること

- 両テストファイルの責務を SPEC（`docs/specs/integrity-rule-catalog.md` または `docs/specs/commands/docs-check.md`）へ明文化するか
- ファイル名を責務が分かる形でリネームするか（例: `check_integrity.ir044.test.ts` / `check_integrity.regression.test.ts`）
- 既存 intake `2026-06-24-issue1109-check-integrity-test-preexisting-5fail.md`（5 fail の根は共通 test suite 構造に起因）との統合可否

## 根拠

PR #1121 本文「Findings / Capture候補」セクションの intake 候補 #1。実装時に Issue #1111 指定パスと実際のテスト配置が不一致であることを検出。
