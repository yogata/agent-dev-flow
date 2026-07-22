# inspect 系コマンドでのドリフト検出機構導入検討結果（AG-004）

## 観測内容

Issue #1554（OU-002, AG-004）の完了条件 AG-004-1/2/3 として、inspect 系コマンドへ「廃止コマンド参照の README listing 要求・エンコーディング不整合等の同種ドリフト」を finding 化する仕組みの導入可否を検討した。発生源は当該 case-run（OU-002）の AG-004 検討。

Issue 本文 AG-004-1 には「inspect-commands, inspect-skills 等」と記載されていたが、実際の inspect 系コマンドは inspect-docs.md, inspect-extensions.md, inspect-promote.md, inspect-skills.md の4件である（inspect-commands.md は存在しない、stale-reference）。本検討では実際の4件を対象とした。

AG-004-1 調査結果: inspect-docs と inspect-skills は `docs-spec-rebuild-integrity` SPEC extension 経由の配布物整合性検査を既に持ち、本 extension に検査パターンを追加すれば両コマンドへ一括拡張できる。inspect-extensions は責務範囲が明示的に「検査1-6まで」と限定されており、本件ドリフト検出追加には責務範囲拡張の判断が別途必要。inspect-promote は分類・採用コマンドであり本件スコープ外。

AG-004-2 検出対象: 廃止コマンド参照（README listing・リポジトリルート README.md で存在しないコマンドを listing、コマンド本文内の相互参照で存在しないコマンドを指す）、エンコーディング不整合（UTF-8 BOM 付きファイル、CRLF/LF 改行コード混在）。

## 影響

廃止コマンド参照（stale-reference）や BOM/CRLF 混在が自動検出されず、手動発見に頼る状態が継続する。重要性は中。発生頻度は、コマンドの廃止・リネーム時や Windows 環境でのファイル編集時に発生する。現状の docs-check（check_integrity.ts / check_distribution_boundary.ts）は一部を検出するが、README listing 突き合わせや BOM/CRLF 検出は持たない。

## 課題

廃止コマンド参照とエンコーディング不整合を自動検出する機構が不在である。検査パターンが分散しており、inspect-docs/inspect-skills の既存の配布物整合性検査フローに乗せることで重複実装を回避できる状態にある。

## 既存要件・仕様との関連

- `docs-spec-rebuild-integrity` SPEC extension: 推奨実装方針 A の拡張先。inspect-docs Step 11 と inspect-skills Step 3 が経由する配布物整合性検査フロー。
- 関連 intake item: `intake-2026-07-18-distribution-reference-boundary-violations.md`（配布物参照境界違反）。本 item と一部重複するが別問題（具体 REQ/ADR ID・パス参照の除去 vs コマンド存在・エンコーディング検出）。

## 対応方針の方向性

- (A) 推奨: `docs-spec-rebuild-integrity` SPEC extension へ「廃止コマンド参照検出」「エンコーディング不整合検出」の2パターンを追加する。既存の配布物整合性検査フローに乗り、重複実装を回避し、inspect-docs/inspect-skills 両方へ一括拡張できる。デメリットは SPEC extension の検査項目肥大化可能性。
- (B) inspect-extensions の8項目リストへ検査9/10を追加する。「標準責務範囲は検査1-6まで」との整合性調整が必須。A 採用時は不要。
- (C) 新規コマンド新設（inspect-distribution 等）。スコープ分離できるが、inspect-docs/skills の配布物整合性検査と重複し、保守コストが増大する。非推奨。

推定作業規模（A 採用時）: SPEC extension への検査データ追加（2種）約0.5日、inspect-docs/inspect-skills での参照確認約0.5日、テスト・検証約0.5日。合計約1.5日、standard スケール。
