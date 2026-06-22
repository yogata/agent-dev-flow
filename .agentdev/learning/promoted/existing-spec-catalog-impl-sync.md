# SPEC catalog↔実装双方向同期運用の明文化

## 背景

IR-044 検出関数が commit a27a8e56 で「3層ゲート自動化と共に削除」されたが、catalog 定義（IR-044）は維持された。SPEC catalog と実装の間に乖離が生じた。今回の再実装で catalog と実装を一致させたが、今後 SPEC catalog ↔ 実装の削除・復活時には双方向同期を必須とする運用が文書化されていない。

## 問題

SPEC catalog（integrity-rule-catalog.md の IR 定義）と実装（check_integrity.ts の検出関数）の間で、削除・復活時の双方向同期運用が SPEC 化されていない。baseline_status フィールド（known/new/resolved）と IR-020 は定義済みだが、catalog定義削除時の手順（実装も削除/baseline_status を resolved に変更等）が未文書化。

## 望ましい変更

SPEC catalog ↔ 実装の双方向同期運用を integrity-rule-catalog.md に明文化する:
- catalog定義を削除する場合: 対応する実装も削除する（または baseline_status を resolved に変更）
- 実装を削除する場合: 対応する catalog定義の baseline_status を resolved に変更する
- 実装を復活する場合: 対応する catalog定義の baseline_status を new に戻す

## 対象範囲

### 対象
- `docs/specs/integrity-rule-catalog.md`（catalog↔実装同期運用手順）

### 対象外
- 既存の baseline_status フィールド定義（known/new/resolved）の変更
- IR-020（baseline-known と新規 finding の区別）の変更
- check_integrity.ts の機能変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/integrity-rule-catalog.md` | catalog↔実装双方向同期運用手順（削除時・復活時の baseline_status 変更ルール）を追加 |

## 既存対策確認

- **確認結果**: あり（部分的）
- **該当ファイル**: `docs/specs/integrity-rule-catalog.md`（baseline_status フィールド L26: enum known/new/resolved, IR-020 L413-431: baseline-known と新規 finding の区別）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: baseline_status フィールドと IR-020 は定義済み。しかし catalog定義↔実装の削除・復活時の同期運用手順（どちらを削除した時に他方をどうするか）が未文書化。

## 制約

- 既存の baseline_status enum は維持
- IR-020 の定義は維持
- check_integrity.ts の機能変更は含めない

## 受け入れ条件

- [ ] catalog定義削除時の実装同期手順が明文化されている
- [ ] 実装削除時の catalog baseline_status 変更手順が明文化されている
- [ ] 実装復活時の catalog baseline_status 復元手順が明文化されている

## 元learning item / 根拠

- **要約**: SPEC catalog と実装の削除・復活時の双方向同期運用が SPEC 化されていない
- **根拠**: IR-044 検出関数が削除されたが catalog定義は維持され、乖離が発生。今回の再実装で一致させたが運用自体が未文書化。
- **再発条件**: integrity rule の削除・復活を実施する際
- **横展開可能性**: 中。integrity catalog 全般で発生し得る

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: PR #976 Issue #972 (バッチD 記録・検出精度), commit a27a8e56 (IR-044 削除)
