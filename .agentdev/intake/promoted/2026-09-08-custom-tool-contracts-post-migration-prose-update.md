# custom-tool-contracts.md の移行期間前提記述の現行状態への整合更新

## 観測内容

`docs/designs/responsibilities/custom-tool-contracts.md` の「対象操作の境界（初期セット）」Comment 操作節および issue_comment 廃止節に、移行期間（issue_comment 温存）を前提とした記述が残存している。Epic #2686 Wave 2 の完了（PR #2693 マージ、commit 8d6b9665）により呼出元移行と issue_comment 廃止は完了しており、当該記述は現行の16操作カタログ（issue_comment 廃止済み）と乖離している。

## 影響

- 正規所有 Design の現行記述として、読み手が移行途中の状態と誤認する
- issue_comment は操作カタログから除去済みのため、Design の操作境界記述と実装（contracts.ts の16操作）の間に文書レベルの不整合が存在する状態が継続する

## 変更候補

- 同一ファイル内の移行期間前提記述（Comment 操作節・廃止節）を移行完了後の現行状態（16操作、issue_comment 廃止済み）へ整合させる（design-save 経由の Design 更新）
- 廃止節は履歴記述として保持するか、現行状態記述へ置き換えるかは Design 更新時の判断事項

## 既存要件・成果物との関連

- `docs/designs/responsibilities/custom-tool-contracts.md`（正規所有 Design、status: accepted）
- REQ-011-022（16操作カタログ）の確定状態
- 同日実施の inspect-docs 検出事項 F-05（custom-tool-contracts.md:35 移行期間条項残置）と同根。backlog-review での統合対象

## 出所

- 元 intake item: `2026-09-08-custom-tool-contracts-migration-period-prose-2693.md`（PR #2693 Findings/Capture候補由来、Issue #2689・Epic #2686 Wave 2）
