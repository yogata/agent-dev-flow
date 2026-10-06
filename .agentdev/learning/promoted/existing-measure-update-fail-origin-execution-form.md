# 検証 fail の実行形態依存由来分類と正規形遵守を検証契約へ統合する

## 背景

fail がコード内容ではなく実行形態に依存する3事象が発生した。(1) 並行実行時の bun test フル suite で corpus 系低速テストが per-test timeout 5000ms 超で回転的に fail（Issue 3454・PR 3481。単独再実行・baseline 対照で負荷依存と分類）。(2) `bunx tsc --noEmit` を default target(es5) 形で実行した変更前後対照が TS2802 ヒストグラム 1 件差に見えたが、package 正規型（ES2022・tsconfig 指定）では完全一致（Issue 3484・PR 3491。実行形態アーティファクトと判明）。(3) worktree での repo 全体 `bun test ./` 単一実行（正規形外）で textlint 一時 dictionary 競合疑いの fail 38 件、正規形 3 分割実行では非再現（Issue 3485・PR 3490。原因確定は未実施・正規形下非再現の運用分類）。

## 問題

fail 由来分類証跡手順（QG-4）と bun test フル suite 正規形契約は存在するが、(a) 実行形態依存 fail の分類事例（timeout 回転性・前回退避ログ比較・baseline 対照）、(b) typecheck 対照の実行形態一致（tsconfig・target・オプションの実行コマンド証跡明記）、(c) 正規形外実行の fail を由来分類対象外とする基準が、検証契約・検証差分セクション規約に断片的にしか存在しない。

## 望ましい変更

QG-4 の fail 由来分類節へ実行形態依存 fail の分類事例を補遺する。checker 実行契約 Design へ typecheck 対照の実行形態一致規約（実行コマンド・オプション明示の証跡標準項目化）と、bun test 正規形遵守確認の前置・正規形外 fail の無効分類基準を規定する。

## 対象範囲

### 対象

- `src/common/skills/agentdev-quality-gates/references/`（QG-4 fail 由来分類節・検証差分セクション規約）
- `docs/designs/integrity/checker-execution-contracts.md`（tsc 実行形態・bun test 実行形態契約節）

### 対象外

- 各テストの per-test timeout 設計・timeout オプション指定の実装（本変更は分類・証跡の規律化が対象。実装は別案）
- textlint 一時 dictionary 競合の原因確定（未実施・正規形下非再現のため対象外。確定時は別件として扱う）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-quality-gates/references/ 配下の QG-4 該当 reference | 実行形態依存 fail の分類事例補遺（timeout 回転性・退避ログ比較） |
| Design | docs/designs/integrity/checker-execution-contracts.md | tsc 実行形態一致規約・実行コマンド証跡明記・正規形外 fail の無効分類基準 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: agentdev-quality-gates の QG-4 fail 由来分類証跡手順、bun test フル suite 正規形（3 分割実行・./ prefix・cwd 統一）契約
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 分類手順・正規形契約は存在するが、実行形態依存事例の類型（timeout・tsc 対照・正規形外）と tsc 実行形態一致規約・証跡明記が design として統合されていない

## 制約

- 由来分類の証跡手順（単独再実行・baseline 対照・退避ログ比較）は現行どおり
- corpus 系テストの timeout 設計・オプション指定は本成果物の対象外（必要時は別案）

## 受け入れ条件

- [ ] QG-4 fail 由来分類節に実行形態依存の分類事例が補遺される
- [ ] checker 実行契約 Design に tsc 実行形態一致と実行コマンド証跡明記、正規形外 fail の無効分類基準が規定される

## 元learning item / 根拠

- **要約**: fail が実行形態（並行負荷・tsconfig/target 差・正規形外単一実行）に依存する場合、由来分類と実行形態一致対照で誤判定を防ぐ（3件）
- **根拠**: Issue 3454・PR 3481（timeout 2件を負荷依存と分類、単独再実行176/176合格・baseline フル実行 timeout なし）、Issue 3484・PR 3491（default target 形 TS2802 57→58 が正規型で完全一致）、Issue 3485・PR 3490（単一実行 38 fail が正規形 3595 tests/0 fail で非再現）
- **再発条件**: 複数セッションでの bun test 並行実行、tsconfig を持たない package 配下での tsc オプションなし実行対照、worktree での正規形外 bun test 単一実行
- **横展開可能性**: テスト・typecheck 運用全般。実行形態証跡は再現比較の前提

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
