# 配布 skill 文言追記の機械検査 3 系統同時衝突（concrete ID・repo-* 用語・宣言マーカー形状）

## 背景

配布物（src/opencode/skills/**）への文言追記 1 件が、既存の機械検査 3 系統に同時に引っかかった: (1) 配布スキル配下の concrete 要件行 ID（REQ-021-028 形式。完全性テスト + IR-055 delta）、(2) repo-* 接頭辞用語（repo-local、IR-055 runtime-unresolved-reference）、(3) 対応宣言マーカー形状の文字列（distribution purity check）。case-run（DEL-2954-1）実装中、delegation-and-result.md への ADF-COVERS 宣言付与の正の義務追記時に 3 系統すべてを経験した。

## 問題

配布物は配布依存境界で repo 固有の concrete ID・repo-local 用語・宣言マーカー形状の持ち込みが禁止されている。初稿がこの契約に触れる書き方になっていると、独立に走る 3 系統の機械検査で順次 fail し、1 系統の修正が別系統を解消しないため往復修正が発生する。既存の知識文書（docs/knowledge/distribution-concrete-id-placement.md）は concrete ID の記載位置（ADF-COVERS 宣言コメント位置への集約）のみをカバーし、repo-* 用語・宣言マーカー形状の 2 系統と「3 系統が独立に走る」知見を扱っていない。

## 望ましい変更

docs/knowledge/distribution-concrete-id-placement.md（または後続の配布物編集知識）へ、配布物編集時の初稿チェック観点として次を追記する:

1. concrete ID は概念名への一般化表現に置換する（既存知識の適用拡張）
2. repo-* 接頭辞用語（repo-local 等）を本文に書かない（自己ホストリポジトリ固有などの配布物向け表現を使う）
3. 対応宣言マーカー（ADF-COVERS 等）と同一形状の文字列を本文に書かない（マーカー形状の文字列は検査対象になる）
4. 3 系統は独立に走るため、1 系統の修正で別系統は解消しない（全系統の再実行が必要）

## 対象範囲

### 対象

- docs/knowledge/distribution-concrete-id-placement.md（既存知識の拡張）
- 配布物（src/opencode/skills/**、src/opencode/commands/**）の編集場面

### 対象外

- 検査 3 系統の実装（完全性テスト・IR-055・distribution purity check は不変）
- docs/ 配下の正規成果物（concrete-id 検査の適用外領域）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | docs/knowledge/distribution-concrete-id-placement.md | concrete ID に加え repo-* 用語・宣言マーカー形状の回避と「3 系統独立」の知見を追記 |
| 配布skill | src/opencode/skills/agentdev-skill-authoring/（執筆規約 reference） | 配布 skill 新規作成・文言追記時の初稿チェックリスト候補 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: docs/knowledge/distribution-concrete-id-placement.md（2026-09-13、発生4件相当の集約）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存知識は concrete ID の記載位置（宣言コメント位置への集約・本文は概念名参照）をカバーするが、repo-* 接頭辞用語と宣言マーカー形状の文字列という残る 2 系統、および「3 系統が独立に走るため全系統の再実行が必要」という運用知見を未カバー（当該知識文書を grep 検証し repo-/マーカー/系統の記述なしを確認済み）

## 制約

- 検査 3 系統の契約（配布依存境界）は不変。知識の拡張のみ
- 知識文書の更新は backlog-review の利用者承認経由で行う（learning-promote は docs/ を直接編集しない）
- 宣言マーカー自体を配布物に持つべきか否か（正の義務としての宣言コメント）は traceability 契約が所有し、本知識と衝突しない（本文 prose にマーカー形状を書かない、が本旨）

## 受け入れ条件

- [ ] 配布物編集時の初稿チェック観点に concrete ID 一般化・repo-* 用語回避・マーカー形状回避の 3 点が揃っていること
- [ ] 3 系統が独立に走るため全系統の再実行が必要である旨が記載されていること
- [ ] 既存の distribution-concrete-id-placement.md との重複なく拡張されていること（concrete ID 部は既存知識を参照する形でもよい）

## 元learning item / 根拠

- **要約**: 配布 skill への文言追記は concrete ID・repo-* 用語・宣言マーカー形状の 3 検査系統に同時衝突し得る。3 系統は独立に走るため、初稿から 3 点を回避し、修正時は全系統を再実行する
- **根拠**: Case #2954（DEL-2954-1、2026-09-18）。delegation-and-result.md への ADF-COVERS 宣言付与の正の義務追記時に 3 系統すべての検査（bun test 分割① integrity suite・IR-055 delta・distribution purity check）で fail → concrete ID の一般化・repo-* 用語回避・マーカー形状回避へ文言修正し fix-and-reverify で全検査合格
- **再発条件**: 配布 skill 文言に concrete REQ 行 ID、repo-* 用語、または対応宣言マーカーと同一形状の文字列を直接書いた場合
- **横展開可能性**: 配布物（skill・command・template）を編集する全場面で発生し得る

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation, knowledge
- **関連Issue**: Case #2954、PR #2957、delegation-and-result.md
