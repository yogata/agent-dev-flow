# Wave 3 SPEC 行数計測の AUTOGEN ブロック除外仕様

## 問題事象

Wave 3（PR #1630）で spec-health-metrics.md へ SPEC 計測例テーブルを新設 + AUTOGEN 化する際、SPEC 行数計測の対象範囲について設計判断を要する事象が発生。

spec-health-metrics.md 自身が SPEC であるため、SPEC 行数計測で AUTOGEN ブロック（HTML コメントで囲まれた自動生成領域）を含めると、計測 → AUTOGEN 更新 → 行数増加 → 再計測 という自己増幅ループが発生し、べき等性が破綻する。

## 発生局面

実装（case-run Wave 3 #1625 PR #1630、generate_indexes.ts の SPEC metrics 生成関数 `countSpecBodyLines` 実装時）

## 検知方法

実装検証。べき等性テスト（TS-017）で、1回目の generate_indexes.ts 実行後に spec-health-metrics.md の行数が増加し、2回目実行で "no changes" にならない事象を想定して検証。実際には AUTOGEN ブロック除外を採用したため、自己増幅は発生せず、TS-017 は PASS。

## 根本原因

spec-health-metrics.md L22「SPEC 行数: frontmatter、HTML コメントを除く本文行数」の定義が、AUTOGEN ブロック（HTML コメントで囲まれた自動生成領域）を含むか除外するか明示していない。AUTOGEN ブロックは HTML コメント形式（`<!-- AUTOGEN:BEGIN:id=xxx --> ... <!-- AUTOGEN:END -->`）だが、その内側のテーブル行は Markdown 本文とみなせるため、解釈が分かれる。

## 提案内容

1. **spec-health-metrics.md L22 の計測定義を明確化**: 「SPEC 行数: frontmatter、HTML コメント、AUTOGEN ブロックを除く本文行数」とし、AUTOGEN ブロック（HTML コメントで囲まれた自動生成領域）も除外対象であることを明記

2. **SC-002 SPEC（index-auto-generation.md）への補足**: 索引類自動生成の際、計測対象 SPEC 自体に AUTOGEN ブロックが含まれる場合の取り扱いを明記。自己増幅ループを防止するため、計測対象から AUTOGEN ブロックを除外する仕様を明文化

3. **countSpecBodyLines 実装の仕様書き**: generate_indexes.ts の countSpecBodyLines 関数のコメントに、AUTOGEN ブロック除外の理由（自己増幅防止、べき等性確保）を明記

## 対象ファイル

- `docs/specs/quality/spec-health-metrics.md`（L22 計測定義の明確化）
- `docs/specs/integrity/index-auto-generation.md`（SC-002 SPEC、自己増幅防止の補足 ※必須ではない）
- `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`（countSpecBodyLines コメントの補強 ※任意）

## 参照

- PR #1630, Issue #1625, Epic #1622 Wave 3
- spec-health-metrics.md L22「SPEC 行数」定義
- SC-002 SPEC（`docs/specs/integrity/index-auto-generation.md`）
- Wave 2: PR #1629（verifyAutogenBlocksInFile ヘルパー新設、AUTOGEN ブロック形式確立）

## 分類

SPEC 確定候補（spec-health-metrics.md L22 の計測定義明確化）。動作は正しく（Wave 3 で AUTOGEN ブロック除外を実装済み）、SPEC 文面の明記のみが未実施。

## 優先度

low（動作は正しい。spec-health-metrics.md L22 への1行追記で完結する小修正。Wave 5 Phase E 全索引展開時、または別の spec-save 機会で処理可）
