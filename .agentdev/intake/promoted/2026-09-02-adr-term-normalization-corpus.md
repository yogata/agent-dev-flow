# 配布物横断の「ADR」機能用語残存の棚卸し・現行化

## 観測内容

REQ-057 OU-001（PR #2525）で docs/配布物の「ADR」機能用語の正規化を agentdev-doc-writing SKILL.md のみ実施した。検出器語彙、テンプレートセクション名、履歴言及を除く配布物・docs の残存 ADR 機能用語の棚卸しが未完了。個別 34件のリストは intake promoted 原文消化時に消失し再現不可。

OU-001 の対象範囲は REQ-057-001/002/003 の参照・表記整合であり、ADR 用語の全面棚卸しは対象外。残存箇所の機械的列挙が現時点でないため、本 item が棚卸し作業の起点となる。

2026-09-03 現行確認: 現行 main の git grep で「ADR」を含む Markdown は src/opencode 配下 77 ファイル、docs 配下 66 ファイルに存在（検出器語彙・テンプレートセクション名・履歴言及・retired 文書を含む総数。除外規則適用後の正味残存は棚卸し作業で確定する）。

## 影響

配布物・docs に「ADR」旧機能用語が残存し、新規利用者への用語混乱の可能性が残る。

## 課題（レビューで決めること）

- 配布物・docs の残存 ADR 機能用語の機械的棚卸し（検出器語彙・履歴言及の除外規則）の実施要否
- 正規化の適用範囲（docs/**、src/opencode/**、.agentdev/extensions/**）

## 既存要件・契約との関連

- REQ-057（docs corpus 整合・現行化バッチ）の OU-001 成果、DEC-009（ADR から Decision への正規成果物モデル移行）に由来する用語正規化、agentdev-doc-writing SKILL.md の正規化済み語彙。

## 根拠

- PR #2525 本文「Findings/ Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2525 ）
- 2026-09-03 機械確認: git grep（src/opencode 配下 77 ファイル、docs 配下 66 ファイルに「ADR」言及）
