# update 系 artifact_actions の見出し行置換範囲解釈を artifact 契約へ補足する

## 背景

Case #3530 Wave 1 の Design 保存で、update 系 artifact_actions の content 適用が対象セクションの見出し行（「**USE FOR**:」）を置換範囲に含めなかったため、適用後に見出しが重複した（適用後検査で検出・修正）。

## 問題

artifact-contracts.md は update の target_area 契約（L481）と content 完全性（L529「対象セクション・対象行の全文を含む」）を持つが、見出し行を置換範囲に含めるかの適用側解釈と、適用後の重複見出し検査が未規定。deferred L2466（update 適用の target_area 解釈は再発時に再評価）の再評価条件が今回の再発で発火した。

## 望ましい変更

artifact-contracts.md の update 契約へ「対象セクションの content はセクション見出し行を含む（見出しを含めない適用は重複見出しを生む）」という解釈規則と適用後の重複見出し検査を明記する。

## 対象範囲

### 対象
- docs/designs/responsibilities/artifact-contracts.md（update 適用の解釈規則）
- src/common/skills/agentdev-design-file-manager（適用側の参照）

### 対象外
- append 系の target_area/anchor 契約（既存のまま）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/responsibilities/artifact-contracts.md | update 適用の見出し行解釈と適用後検査の規定 |
| 配布skill | src/common/skills/agentdev-design-file-manager | 適用側の解釈参照 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: artifact-contracts.md（update 契約 L477-532）、deferred L2466
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 見出し行を含む置換範囲解釈と適用後重複見出し検査が未規定（実測確認済み）

## 制約

- なし（契約の明確化のみ）

## 受け入れ条件

- [ ] update 適用の見出し行解釈が契約へ明記される
- [ ] 適用後の重複見出し検査が規定される

## 元learning item / 根拠

- **要約**: update 系 content 適用の見出し行扱い（Case #3530 Wave 1）
- **根拠**: 「**USE FOR**:」見出し重複の実害、deferred L2466 再評価条件発火
- **再発条件**: update 系 artifact_actions で見出し行を含まない content を適用する変更
- **横展開可能性**: artifact_actions update を使う全 Definition 変更

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
