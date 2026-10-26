# applySection-blank-line-preservation

## 背景

case-close STEP-5-2 の Case Issue 本文結果セクション更新で applySection（record-comments.ts）を用いたところ、置換対象セクションの直前に空行があっても `before` 末尾の改行が剥ぎ取られ、`## 進行状況`・`## 結果` の見出しが前文行へ直接接続した（Root Case #3820、commit 1968b0ac 済み本文の更新。GitHub 描画は成立するが Markdown 構造が崩れる）。issue_update 前の適用後本文の目視確認（glued headings の機械チェック）で検出され、適用後の空行補完後処理で書込み前に回避した。

## 問題

record-comments.ts の applySection は、セクション置換時に置換対象セクションの直前の空行を保持しない。実測（2026-10-27 learning-promote・コード読取）:

- L320: `before` を構築する際に末尾の連続改行をすべて除去（`replace(/\n+$/, "")`）
- L322: 置換分岐の連結（`${before}\n${sectionMarkdown...}`）は単一 `\n` のみを挿入するため、「前文」と「見出し」の間の空行が 1 行の改行へ崩壊する
- L325-326: 追記分岐（base 末尾への append）も同様に末尾改行除去後の単一 `\n` 連結で、追記した見出しの直前空行が保証されない

テスト（record-comments.test.ts L412-508）は本文の包含のみを検証し、見出し直前の空行構造は検証対象外のため、欠陥は検出されないまま。applySection は SKILL.md L120・delegation-and-result.md L116 が定める本番経路（Case Issue 本文更新）で使用されるため、再発条件は常に成立し得る。修正は未実施（現行 HEAD でも L320/L322/L325-326 の挙動は不変）。

## 望ましい変更

applySection の連結前に `before` 末尾へ空行 1 行（改行 2 個相当）を保証する修正。置換分岐（L320-322）と追記分岐（L325-326）の両方を対象とする。修正時に record-comments.test.ts へ見出し直前空行の検証を追加する。

## 対象範囲

### 対象

- src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts（applySection）
- src/common/skills/agentdev-workflow-case-run/scripts/tests/record-comments.test.ts（空行構造の検証追加）

### 対象外

- applyEpicChildStatusUpdates（行内置換で空行問題の影響なし）
- agentdev_gh の issue_update 操作契約・VERIFY 契約
- セクション構築関数（buildProgressSection 等）の出力形式

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布script | src/common/skills/agentdev-workflow-case-run/scripts/record-comments.ts | applySection の連結前 before 末尾空行保証（L320-326） |
| 配布script | src/common/skills/agentdev-workflow-case-run/scripts/tests/record-comments.test.ts | 見出し直前空行の回帰検証追加 |

## 既存対策確認

- **確認結果**: 対策なし（script 欠陥・後処理による回避のみ）
- **該当ファイル**: なし
- **ギャップ分類**: fix gap
- **ギャップ詳細**: E11 の自律対応（適用後の空行補完後処理）は書込み前の個別回避であり、恒久修正は未実施。現行 HEAD の applySection は空行を保証しない（実測）。Issue 本文崩壊系の既知対策（LF 圧縮・見出し消失の修復〔REQ-0132-024/025/026・REQ-0149-010〕）は本文全体の LF/見出し検証であり、applySection の置換時空行崩壊は対象外

## 制約

- applySection のヘッダー抽出（L301: sectionMarkdown 先頭行から見出しを抽出）は sectionMarkdown が `## ...` で始まることを前提とするため、空行の付与は before 側（連結前）で行うこと（sectionMarkdown 側の先頭空行付与は契約を壊す）
- GitHub 描画への実害は限定的（ATX 見出しは段落を中断する）だが、Markdown 構造契約・目視確認コストの観点で修正価値がある
- Epic 本文更新（applyEpicChildStatusUpdates）は行内置換であり本件の対象外

## 受け入れ条件

- [ ] applySection の置換分岐・追記分岐のいずれでも、見出しの直前に空行 1 行が保証される
- [ ] record-comments.test.ts に見出し直前空行の回帰検証が追加されている
- [ ] 既存のセクション構築・適用の契約（sectionMarkdown 先頭行が見出しであること等）は不変である

## 元learning item / 根拠

- **要約**: applySection のセクション置換で直前空行が消え見出しが前文に接続する。連結前の before 末尾空行保証の恒久修正（1 行規模）
- **根拠**: E11（Root Case #3820。適用後本文の目視確認〔glued headings 機械チェック〕で検出・空行補完後処理で書込み前に回避）。コード実測: L320 の末尾改行全除去 + L322 の単一 `\n` 連結（置換）・L325-326（追記）が空行崩壊の原因。テストは包含のみ検証で空行構造未検証。横展開: applySection 経由の Case Issue 本文更新全般
- **再発条件**: applySection で既存セクションを置換した場合、または body 末尾へセクションを追記した場合（新規追加時は base 末尾に空行が付くため不成立とされる E11 申告に対し、append 経路も単一 `\n` 連結であることを実測で確認）
- **横展開可能性**: record-comments.ts を使用する全 Issue 本文更新（case-close STEP-5-2 等の本番経路）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: Root Case #3820（対応記録コメント）
