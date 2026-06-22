# doc-language-quality: ドキュメント日本語品質の事前存在 NG

## 経緯

OU-002 Wave 3 (#1021 / PR #1025) の横断検出過程で、`/repo/docs-check` の事前存在 NG findings に `doc-language-quality` カテゴリの違反が含まれていた。docs 配下の自然言語記述において、英語混じり表現・カタカナ語の不適切使用・文体不統一等の品質問題が残存している。本 Wave の constraint により未修正。PR #1025 Findings に列挙されたが、case-close での intake 化が漏れていたため、事後収集する。

## 影響

- REQ-0101-061（docs配下の文書は英語語句を文意に基づく自然な日本語に書き直す）への準拠が不完全。
- docs-check IR-045 が継続して NG/WARNING を報告し続ける。
- 文書の可読性・一貫性が損なわれている箇所がある。

## レビューで決めること

- `doc-language-quality` 違反の該当ファイル・箇所を `/repo/docs-check` または IR-045 で特定し、REQ-0101-061 準拠の修正対象をリストアップするか。
- 修正を一括 case として扱うか、文書種別ごとに分割するか。
- `agentdev-doc-writing` スキールの査読観点（REQ-0140-003: 日本語本文の自然性判定）で検出可能な範囲を確認するか。

## 根拠

- PR #1025 Findings: https://github.com/yogata/agent-dev-flow/pull/1025
- 違反基準: REQ-0101-061（英語語句の自然な日本語化）、REQ-0140-003（日本語本文の自然性判定）
- 検出元: `/repo/docs-check` IR-045（docs 日本語表現・文意整合検査）
- 来源: OU-002 Wave 3 横断検出の事前存在 NG（本パイプライン由来ではない）
- 関連 Epic: OU-002 #1018 Wave 3
