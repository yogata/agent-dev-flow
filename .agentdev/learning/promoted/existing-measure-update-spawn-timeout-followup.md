# spawnSync 型回帰テスト timeout の影響範囲確認（check_integrity.test.ts 15000ms）

## 背景

check_integrity.test.ts の spawn 系回帰テスト（IR-055 実修復 ×2・NG21 N16/N17 ×2）の timeout 15秒固定値（15000ms）が、checker 実行時間の増加（配布物追加・環境負荷）で超過し、単独 suite 内でも fail する事象が継続観測されている。RA-012（Case #3355）が timeout 引上げ修正の管理 Case であり、本知見はその影響範囲確認事項の追加である。

## 問題

IR-055×2・NG21 N16×1 が 15000ms timeout で fail（15047〜15266ms 実測）。check_integrity.test.ts 内の timeout 値（15000ms）自体も spawn 型テストの挙動に影響するが、RA-012 の影響範囲に含まれているかの確認が推奨される。

## 望ましい変更

RA-012（#3355）の timeout 引上げ修正の影響範囲確認事項として、check_integrity.test.ts 内 timeout 値（15000ms）の包含確認を追加する。既存知識文書（docs/knowledge/windows-bun-test-spawn-timeout-classification.md）が由来分類・再現手順を所有するため、同文書への追記でもよい。

## 対象範囲

### 対象

- `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts`（timeout 15000ms）
- docs/knowledge/windows-bun-test-spawn-timeout-classification.md（既存の由来分類知識）
- RA-012（Case #3355）の影響範囲確認事項

### 対象外

- timeout 値の直接的な変更（RA-012 対象のため本成果物では実施しない）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/windows-bun-test-spawn-timeout-classification.md | 影響範囲確認事項（test 内 timeout 値）の追記候補 |
| その他 | RA-012（Case #3355）の対応範囲 | 影響範囲への包含確認 |

## 既存対策確認

- **確認結果**: 既存対策あり（修正は未解決）
- **該当ファイル**: docs/knowledge/windows-bun-test-spawn-timeout-classification.md（由来分類・再現手順を所有）
- **ギャップ分類**: application miss
- **ギャップ詳細**: timeout 値調整は RA-012 で管理中だが、test ファイル内 timeout 値の影響範囲包含確認が明示されていない

## 制約

- 前回 promote 判定（deferred の再評価条件「timeout 設定方針の処分確定時」）との整合を維持し、値の確定は RA-012 に委ねる

## 受け入れ条件

- [ ] RA-012 の影響範囲確認事項に test 内 timeout 値が含まれる

## 元learning item / 根拠

- **要約**: spawnSync 型 timeout 境界の環境変動が suite fail 由来分類を複雑化（1件・前回 PC-3 系の継続観測）
- **根拠**: Case #3342・OU-013・PR #3383（15047〜15266ms 実測 fail・RA-012 管理中の確認）
- **再発条件**: checker 実測所要時間が 15秒を超える環境・時点で suite を実行する場合
- **横展開可能性**: spawn 系回帰テスト全般・環境性能差

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, test
- **関連Issue**: なし（Case #3355 が管理中）
