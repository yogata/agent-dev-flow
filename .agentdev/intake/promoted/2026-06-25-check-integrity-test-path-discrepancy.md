# IR-044 テストファイル責務境界の曖昧さ（check_integrity.test.ts 2 系統）

## 観測内容

Issue #1111 の本文がテスト対象パスとして `scripts/tests/check_integrity.test.ts` を指定していたが、当該ファイルは Issue #657 の regression 専用（fixture drift detection）である。
IR-044 の正規テストスイートは `scripts/check_integrity.test.ts` に存在する（`buildIr044Fixture`、既存の `isDelegationContext` predicate テスト、IR-044 describe block が既存）。
PR #1121 では正規ファイル側にテストを追加した。

## 影響

Issue 本文と実際のテスト配置が一致しない場合、後続エージェントが誤ったファイルを編集するリスクがある。
`scripts/tests/check_integrity.test.ts`（Issue #657 regression 専用）と `scripts/check_integrity.test.ts`（IR-044 他の正規スイート）の責務が SPEC 上明文化されていないため、両者の使い分けが暗黙知に依存している。

## 課題

両テストファイルの責務を SPEC 上明文化する、または責務が分かる形でリネームする。

## 既存要件との関連

- Issue #1111、PR #1121（merged, squash 4eb008b6）
- Issue #657（regression 専用 test suite の起点）
- 候補 SPEC: `docs/specs/integrity-rule-catalog.md` または `docs/specs/commands/docs-check.md`

## 対応方針の方向性

- 両テストファイルの責務を SPEC へ明文化する
- ファイル名を責務が分かる形でリネームする（例: `check_integrity.ir044.test.ts` / `check_integrity.regression.test.ts`）
- 関連 intake「check_integrity.test.ts 既存 5 fail」との統合可否を検討する（5 fail の根は共通 test suite 構造に起因する可能性）
