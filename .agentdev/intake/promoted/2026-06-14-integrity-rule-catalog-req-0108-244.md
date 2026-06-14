# REQ-0108-244 の integrity-rule-catalog entry が未記載

## 観測

PR #754（command/skill参照境界の正規化）で REQ-0108-244（skill-internal-section-reference 検出観点）が新規追加され、`repo-agentdev-integrity/SKILL.md` に検出観点が定義された。しかし、`docs/specs/integrity-rule-catalog.md` に対応する catalog entry が未記載。

## 影響

- `integrity-rule-catalog.md` と実際の検出観点に不整合が生じる
- catalog を一次情報として参照するエージェントやレビュワーが REQ-0108-244 の検出観点を認識できない
- catalog ↔ 実装の同期が崩れる

## 課題

`docs/specs/integrity-rule-catalog.md` に REQ-0108-244 の catalog entry を追加する。entry内容: 検出観点名、目的（再発防止: 不存在ファイル推測・skill内部構造依存・command Step保持）、検出条件。

## 既存要件との関連

- REQ-0108-244: skill-internal-section-reference 検出観点の定義
- REQ-0108 の integrity check catalog 体系

## 対応方針

1. REQ-0108-244 の内容を確認（`repo-agentdev-integrity/SKILL.md` の検出観点定義）
2. `docs/specs/integrity-rule-catalog.md` に catalog entry を追加
3. catalog の他entryと形式を整合させる

## 根拠

- 元item: `.agentdev/intake/inbox/2026-06-14-integrity-rule-catalog-req-0108-244.md`
- 観測元: PR #754 body「Findings / Capture候補」セクション
- 元テキスト: 「`docs/specs/integrity-rule-catalog.md` に REQ-0108-244 の catalog entry が未記載。follow-up で追加することを推奨。」
