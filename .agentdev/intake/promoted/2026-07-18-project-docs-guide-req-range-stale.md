# docs/guides/project-docs-and-specs.md の REQ 範囲記載陳腐化

## 観測内容

2026-07-18 の docs-check（検査スクリプト: `check_integrity.ts` Canonical / req-range-staleness、検査ルート: intake）で検出。

`docs/guides/project-docs-and-specs.md` は「REQ-0101 から REQ-0161」までの範囲と記載する。実際の active REQ ファイルは REQ-0162 まで存在する（53ファイル）。REQ-0162 追加時に同ガイドの範囲記載が更新されなかった。

- 対象ファイル: `docs/guides/project-docs-and-specs.md`
- 記載: `REQ-0101 から REQ-0161`
- 実態: 最終 active REQ は `REQ-0162`（53ファイル）
- 検出元レポート: `.agentdev/integrity/reports/2026-07-18-integrity-report-2.md`（Canonical セクション）

## 影響

docs 整合性のズレ。`check_integrity.ts` が安定 NG を検出し続ける。機能破壊はなく表示のみ。修正は1ファイル1行変更。新規 REQ 採番ごとに再発する可能性がある。

## 課題

ガイドの REQ 範囲記載を実態（REQ-0162）へ更新する。

## 既存要件・仕様との関連

- REQ-0101（文書・REQ管理基準）: 当該ガイドが管理基準として参照する範囲記載の SSoT 性に関わる。
- REQ-0162（最新 active REQ）: 追加時にガイドが追従しなかった原因 REQ。
- 関係: ガイドの静的記載が実 REQ 状態より1件古い（陳腐化）。

## 対応方針の方向性

`docs/guides/project-docs-and-specs.md` の REQ 範囲記載を `REQ-0161` → `REQ-0162` へ更新する（1ファイル1行変更）。

予防策（REQ 新規採番時のガイド範囲自動更新仕組み）は別 item「req-0144-018 自動更新仕組みが未実装」で扱う。
