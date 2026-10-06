# REQ 行改番時の旧参照スイープ対象に prose 括弧書き言及を含める

## 背景

Case 3457（Epic・Wave 1 子 Issue 3459）の REQ 行 ID 改番（重複 REQ-010-070 解消、新規検査クラス追加行の REQ-010-080 採番）に伴う旧参照追随で、Definition 適用（PR 3458）と事前検証 GAP-1 で計3件を修正した後も、case-close の QG-4 完了条件独立再評価で IR-068 description 内の括弧書き言及と IR-070 related_req 第3項の2件（GAP-3）が残存していた（commit 78cf5df4 で解消）。

## 問題

行 ID 改番の追随スイープが related_req フィールド（AUTOGEN 起点）と README 索引に偏り、ルール文書 description 本文中の行 ID 括弧書き言及、および related_req の意味論（旧番号が別行として生存している場合の参照先判別）まで確認対象になっていない。旧番号が現行でも別行として生存する場合、機械的な行 ID 存在性検査（broken-req-ref・unknown-req-refs）では陳腐化参照を検出できない。

## 望ましい変更

行採番規律（numbering-policy.md）へ改番時のスイープ対象として (a) related_req フィールド、(b) ルール文書・Design 本文中の行 ID prose 言及（括弧書き含む）、(c) 旧番号で生存する行との意味論的参照先判別（作成時点の git 履歴照合）の3点を明示する。改番を伴う Case の完了条件展開時に prose 言及の残存確認を検証方法へ織り込む。

## 対象範囲

### 対象

- `docs/designs/foundations/numbering-policy.md`（行採番規律。旧 learning 記載の「numbering-and-validation.md」は当該規律の旧名称と解釈）
- 完了条件テンプレート側の検証方法展開（改番を伴う Case の AG-005 完了条件の検証方法具体化）

### 対象外

- broken-req-ref・unknown-req-refs の機械検査拡張（prose 内行 ID 言及と related_req の整合 checker は中期的検討課題として本成果物には記録のみ）
- REQ 採番規則自体の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/foundations/numbering-policy.md | 改番時スイープ対象3点（related_req・prose 言及・意味論判別）の明示 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: AG-005 完了条件「改名行を指す旧参照の grep 残存 0 件」、check_integrity の行 ID 存在性検査
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 完了条件の grep は存在するが、prose 括弧書き言及と旧番号生存行の意味論判別（作成時点履歴照合）が検証方法として具体化されていない

## 制約

- checker 拡張（prose 言及の機械検査）は本変更の対象外（構造検査の検討課題として記録に留める）

## 受け入れ条件

- [ ] numbering-policy.md に改番時のスイープ対象3点が明記される
- [ ] prose 言及の残存確認に作成時点履歴照合が含まれる

## 元learning item / 根拠

- **要約**: REQ 行改番の旧参照追随は related_req と prose 括弧書きの2層で漏れる。旧番号生存行では存在性検査が無効（1件）
- **根拠**: Issue 3459・PR 3480（commit 78cf5df4・squash merge fecca28d）、Epic 3457・Definition PR 3458、GAP-3 の2件（IR-068 description 括弧書き・IR-070 related_req 第3項）
- **再発条件**: REQ 行の改番・行 ID リネーム・行統合を伴う Definition 変更の適用時
- **横展開可能性**: 改番・リネームを伴う全 Definition 適用 Case

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
