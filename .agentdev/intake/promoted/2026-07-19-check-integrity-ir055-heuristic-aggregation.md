# check_integrity.ts IR-055 heuristic の行内複数パターン集計仕様の精査

## 観測内容

`check_integrity.ts` の IR-055 heuristic は行内の複数パターン（`docs/specs/`, `docs/guides/`, `docs/adr/` 等）を検出する際、行単位の集計件数が揺れている疑いがある。SPEC `docs/specs/foundations/harness-separation-model.md` baseline リスト11件と `check_integrity.ts --json` warning level 出力は整合しているが、行レベルで不一致が観察される。

具体事例（Issue #1564 TS-002 検証時）:

- `src/opencode/commands/agentdev/req-save.md` L262 は実際のコンテンツで `docs/guides/` と `docs/specs/` 両方を含むが、SPEC baseline（`check_integrity.ts` warning 出力に基づく）は `docs/guides/` のみ1件としている。
- 一方 `src/opencode/commands/agentdev/req-save.md` L272 は両パターン（`docs/specs/`, `docs/guides/`）を2件として扱っている。

本事象は baseline の抽出元（`check_integrity.ts`）に起因し、SPEC 記載内容は抽出元と整合しているため SPEC 側の不備ではない。

## 影響

baseline 総件数は整合しているため機能的破壊はないが、行レベルの再現性と監査精度が揺らぐ。発生頻度は、行内に複数パターンを含む行が存在する場合に限られる。

## 課題

IR-055 heuristic の行内複数パターンマッチの集計仕様（最初の1件のみ、全件、パターン種別単位のいずれか）を明文化し、行レベルの集計規則を統一する必要がある。既存 baseline（harness-separation-model.md 11件）との整合性を保ったまま統一することが求められる。

## 既存要件・仕様との関連

- IR-055（runtime-unresolved-reference, heuristic）: 集計仕様の精査対象となる検査ルール。
- REQ-0108-263/264: IR-055 の段階導入要件。
- `docs/specs/foundations/harness-separation-model.md` baseline 既知違反サブセクション: 件数定義 + baseline リスト11件。抽出元（`check_integrity.ts`）と整合しており、heuristic 側の精査結果次第では SPEC 側の改訂を要しない可能性が高い。
- Epic #1515（配布物浄化バッチ）: 本件は配布物浄化の対象外（検査スクリプト本体の改修）。

## 対応方針の方向性

1. `check_integrity.ts` の IR-055 heuristic 実装で、行内複数パターンマッチの集計方式を精査・明文化。
2. 既存 baseline との整合性を保ったまま、行レベルの集計規則を統一。
3. SPEC 側の baseline リスト記載形式（`ファイルパス:行番号:違反内容:検出ルール`）が行内複数パターンを表現できるか確認。必要なら同一行の複数パターンを別エントリとして列挙する表現拡張を検討。
