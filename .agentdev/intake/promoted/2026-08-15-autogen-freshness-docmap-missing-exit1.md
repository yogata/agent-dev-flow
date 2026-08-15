# check_autogen_freshness.ts が削除済み DOC-MAP.md を前提とし EXIT 1

## 観測内容

`check_autogen_freshness.ts` が block_id=docmap-inventory で `docs/DOC-MAP.md` を前提としており EXIT 1 を返す。DOC-MAP.md は REQ-013 で意図削除済みであり、検査ツールが削除後の docs 構成に追随できていない。

## 影響

- freshness gate が恒常的に失敗し、freshness 検査の信頼性を損なう
- 本来検出すべき陳腐化と区別できなくなる

## 課題

docmap-inventory block 検査の除去、または DOC-MAP.md 不在時の skip 構成へ変更する。削除済み成果物を前提とする検査項目の棚卸しを併せて行う。

## 既存要件・成果物との関連

- 対象: repo-agentdev-integrity 配下 check_autogen_freshness.ts
- 関連: REQ-013（DOC-MAP.md 削除）

## 出典

- 発生日: 2026-08-15
- 取得元: 検査スクリプト実行時の観測
- 元 item: intake-2026-08-15-autogen-freshness-docmap-missing-exit1.md
