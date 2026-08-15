# commands_e2e.test.ts が削除済み docs/adr/README.md を要求し失敗

## 観測内容

commands_e2e.test.ts の「ADR README.md exists」検査が、DEC-009 移行により削除された docs/adr/README.md の存在を要求しており、base ブランチから失敗している。

## 影響

- pre-existing failure として新規失敗との判別ノイズになる
- テストスイートの信頼性が低下する

## 課題

テスト期待値を docs/decisions/README.md へ更新するか、当該検査の意義を再評価する。

## 既存要件・成果物との関連

- 対象: commands_e2e.test.ts
- 関連: DEC-009（ADR→Decision 移行）、REQ-0030-011（後述 pre-existing failure 群と一部重複の可能性）

## 出典

- 発生日: 2026-08-15
- 取得元: テスト実行時の観測
- 元 item: intake-2026-08-15-commands-e2e-adr-readme-stale-expectation.md
