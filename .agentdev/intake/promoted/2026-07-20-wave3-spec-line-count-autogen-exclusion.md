# Wave 3 SPEC 行数計測の AUTOGEN ブロック除外仕様

## 観測内容

Wave 3（PR #1630）で `spec-health-metrics.md` へ SPEC 計測例テーブルを新設し AUTOGEN 化する際、SPEC 行数計測の対象範囲について設計判断を要した。

`spec-health-metrics.md` 自身が SPEC であるため、SPEC 行数計測で AUTOGEN ブロック（HTML コメントで囲まれた自動生成領域）を含めると、計測 → AUTOGEN 更新 → 行数増加 → 再計測という自己増幅ループが発生し、べき等性が破綻する。実際には AUTOGEN ブロック除外を採用したため自己増幅は発生せず、べき等性テスト（TS-017）は PASS した。

`spec-health-metrics.md` L22「SPEC 行数: frontmatter、HTML コメントを除く本文行数」の定義が、AUTOGEN ブロック（`<!-- AUTOGEN:BEGIN:id=xxx --> ... <!-- AUTOGEN:END -->`）を含むか除外するか明示していない。AUTOGEN ブロック内側のテーブル行は Markdown 本文とみなせるため、解釈が分かれる。

- 由来 PR: #1630
- 由来 Issue: #1625
- Epic: #1622 Wave 3
- Wave 2: PR #1629（verifyAutogenBlocksInFile ヘルパー新設、AUTOGEN ブロック形式確立）

## 影響

重要度: low。動作は正しく（Wave 3 で AUTOGEN ブロック除外を実装済み）、SPEC 文面の明記のみが未実施。ただし自己増幅ループ防止の根拠が文書化されないため、再実装時に誤って AUTOGEN ブロックを計測対象に含めるとべき等性破綻を生じる余地が残る。

## 課題

`spec-health-metrics.md` L22 の「SPEC 行数」計測定義が、AUTOGEN ブロックの除外を明示していない。実装と SPEC 文面の間に解釈の揺らぎがある。

## 既存要件・仕様との関連

- `spec-health-metrics.md` L22「SPEC 行数」定義: AUTOGEN ブロック除外が未明示（陳腐化・曖昧さ）。
- SC-002（`docs/specs/integrity/index-auto-generation.md`）: 索引類自動生成の際、計測対象 SPEC 自体に AUTOGEN ブロックが含まれる場合の取り扱いが未記載（差分）。

## 対応方針の方向性

1. `spec-health-metrics.md` L22 の計測定義を明確化: 「SPEC 行数: frontmatter、HTML コメント、AUTOGEN ブロックを除く本文行数」とし、AUTOGEN ブロックも除外対象であることを明記。
2. SC-002 SPEC（index-auto-generation.md）への補足: 計測対象 SPEC 自体に AUTOGEN ブロックが含まれる場合、自己増幅ループを防止するため計測対象から AUTOGEN ブロックを除外する仕様を明文化（必須ではない）。
3. generate_indexes.ts の countSpecBodyLines 関数のコメントに、AUTOGEN ブロック除外の理由（自己増幅防止、べき等性確保）を明記（任意）。

1行追記で完結する小修正。Wave 5 Phase E 全索引展開時、または別の spec-save 機会で処理可能。
