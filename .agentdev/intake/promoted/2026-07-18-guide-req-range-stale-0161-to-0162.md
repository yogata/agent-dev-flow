# docs/guides/project-docs-and-specs.md の REQ 範囲記述が旧値（REQ-0161）

## 観測内容
- `check_integrity.ts` の Canonical 検査が `docs/guides/project-docs-and-specs.md:26` の記述「REQ-0101 から REQ-0161 までの 52 件」を NG として検出
- REQ が 0162 まで増えているのに 0161 のまま更新漏れ

## 影響
- ドキュメントの doc drift（整合性喪失）
- ガイド読者に誤った現状認識を与える

## 課題
- 同ガイドの REQ 範囲・件数表記を現行（REQ-0162 まで）に更新する

## 既存要件との関連
- REQ-0101: 文書・REQ 管理基準

## 対応方針の方向性
- `docs/guides/project-docs-and-specs.md:26` の数値を修正
- 同ガイド内に同種の範囲記述がないか全文確認
- 修正後に `check_integrity.ts` で該当 NG が解消したことを確認

## 出典
- 元 intake item: intake-2026-07-18-1337-guide-req-range-stale-0161-to-0162.md
