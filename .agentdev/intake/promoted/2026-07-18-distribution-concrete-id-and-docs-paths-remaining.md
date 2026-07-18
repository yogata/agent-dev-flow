# 配布 Command/Skill 本文の concrete ID 参照・docs/src 内部パス参照残存（IR-055 delta）

## 観測内容
- `check_integrity.ts` の RuntimeReference 検査が、配布 Command/Skill 本文に残存する concrete ID 参照・docs/src 内部パス参照を新規違反として検出
  - NG 218件
  - WARNING 10件

## 影響
- 配布物が consumers 環境で未解決参照となり、`check_distribution_boundary.ts` が EXIT=1 で完了
- `docs-check` 全体を fail にする主要因となっている

## 課題
- 残存する concrete ID 参照・docs/src 内部パス参照を配布本文から除去する
- 除去後も文意が保持されることを確認（REQ-0142）

## 既存要件との関連
- REQ-0142: 配布物 ID 除去後の文意保持
- REQ-0162: harness 実行制御分離
- REQ-0159-001/003: 配布物依存スキル
- ADR-0136

## 対応方針の方向性
- 影響範囲が広大（NG 218件）のため、command 群・skill 群ごとの分割 case として段階対応を推奨
- 各 case で対象 command/skill 群を限定し、IR-055 カタログの該当項目を順次解消
- REQ-0119 横断是正 残対応（別成果物）と対象領域が一部重複する可能性あり。backlog-review で関連 RU として束ねることを検討

## 出典
- 元 intake item: intake-2026-07-18-1337-distribution-concrete-id-and-docs-paths-remaining.md
