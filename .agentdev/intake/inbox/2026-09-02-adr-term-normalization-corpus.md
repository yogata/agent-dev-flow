# 配布物横断の「ADR」機能用語残存の棚卸し・現行化

## 観測

REQ-057 OU-001（PR #2525）で docs/配布物の「ADR」機能用語の正規化を agentdev-doc-writing SKILL.md のみ実施した。検出器語彙、テンプレートセクション名、履歴言及を除く配布物・docs の残存 ADR 機能用語の棚卸しが未完了。個別 34件のリストは intake promoted 原文消化時に消失し再現不可。

## 今回扱わない理由

OU-001 の対象範囲は REQ-057-001/002/003 の参照・表記整合であり、ADR 用語の全面棚卸しは対象外。残存箇所の機械的列挙が現時点でないため、本 item で棚卸し作業の起点とする。

## 影響

配布物・docs に「ADR」旧機能用語が残存し、新規利用者への用語混乱の可能性が残る。

## レビューで決めること

- 配布物・docs の残存 ADR 機能用語の機械的棚卸し（検出器語彙・履歴言及の除外規則）の実施要否
- 正規化の適用範囲（docs/**、src/opencode/**、.agentdev/extensions/**）

## 根拠

- PR #2525 本文「Findings/ Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2525 ）
