# artifact_actions update content の節全含原则と適用前差分突合を契約へ明示する

## 背景

draft（RU-0161 由来）の ACT-DESIGN-006 content が target_area「### repo-local Plugin の配布・投影契約」節の現行内容の一部（outside-root 判定段落）を含んでいなかった。content で節全体を置換すると合意に含まれない既存内容が黙示的に削除される状態だった（Issue 3486・PR 3489）。case-open STEP-3 の適用前検証（target_area 節の実取得と draft content の突合）で検出し、既存段落を保持した最小追加へ適用方式を変更して回避した。

## 問題

req-define の artifact_actions 生成契約に「update 操作の content は target_area 節の現行内容を全含する、または削除対象行を明示する」規律がなく、部分差分 content と節置換（update 操作種別）の組合せで削除リスクが暗黙化している。case-open の適用前検証（target_area 実取得・read 突合）は今回機能したが、手順 1.5 に節内容差分突合として明文化されていない。

## 望ましい変更

artifact-contracts.md の req_draft 出力構造（artifact_actions 形式）へ「update 操作の content は target_area 節の現行内容を全含する、または削除対象行を明示する」を規定する。case-open の適用前検証手順へ節内容の差分突合（現行節と content の対応行なし段落の検出）を明文化する。

## 対象範囲

### 対象

- `docs/designs/responsibilities/artifact-contracts.md`（req_draft 出力構造・artifact_actions 形式）
- `src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md`（手順 1.5 の適用前検証）

### 対象外

- req-define の draft 生成実装（契約文言の追加が対象。生成ロジックの変更は req-define 側の判断）
- target_area 節置換の操作種別 semantics（update=節置換は現行どおり）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/responsibilities/artifact-contracts.md | update content の節全含原则または削除対象行明示の規定 |
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md | 適用前検証への節内容差分突合の明文化 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: case-open STEP-3 適用前検証（target_area 実取得・read 突合、今回機能）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 生成契約側の規律と、適用前検証の節内容差分突合が手順として明示されていない

## 制約

- update=節置換の操作種別 semantics は現行どおり
- draft スキーマの互換性を壊す変更は行わない（文言規律の追加に留める）

## 受け入れ条件

- [ ] artifact-contracts.md に update content の節全含原则または削除対象行明示が規定される
- [ ] case-open 手順 1.5 に節内容差分突合が明記される

## 元learning item / 根拠

- **要約**: artifact_actions の update content が節を全含しない場合、節置換は合意外の既存内容を黙示的に削除する。適用前の差分突合で回避可能（1件）
- **根拠**: RU-0161、Issue 3486・PR 3489（ACT-DESIGN-006 の outside-root 判定段落欠落を適用前検出、最小追加へ変更）
- **再発条件**: req-define が update 操作の content を部分差分として生成し、後続工程が target_area 置換を機械的に実行する場合
- **横展開可能性**: artifact_actions の update 操作を伴う全 draft（部分差分→置換のリスクパターンは汎用）

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
