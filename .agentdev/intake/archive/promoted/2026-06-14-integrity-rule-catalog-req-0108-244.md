# REQ-0108-244 の integrity-rule-catalog entry が未記載

## 観測

PR #754（command/skill参照境界の正規化）で REQ-0108-244（skill-internal-section-reference 検出観点）が新規追加され、`repo-agentdev-integrity/SKILL.md` に検出観点が定義された。しかし、`docs/specs/integrity-rule-catalog.md` に対応する catalog entry が未記載。「follow-up で追加することを推奨」と明記されている。

### 対象

- ファイル: `docs/specs/integrity-rule-catalog.md`
- 追記対象: REQ-0108-244 の catalog entry（検出観点名、目的、検出条件）

## 今回扱われなかった理由

PR #754 のスコープが参照境界ルールの実装（command/skill修正）に限定されており、catalog の追記は follow-up として明示的に切り出された。

## 影響

integrity-rule-catalog.md と実際の検出観点に不整合が生じる。catalog を一次情報として参照するエージェントやレビュワーが、REQ-0108-244 の検出観点を認識できない。

## 根拠

- 観測元: PR #754 body「Findings / Capture候補」セクション
- 元テキスト: 「`docs/specs/integrity-rule-catalog.md` に REQ-0108-244 の catalog entry が未記載。follow-up で追加することを推奨。」
- PR クローズ日: 2026-06-13
