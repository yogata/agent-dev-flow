# intake: local/ 配下 Design 文書の現行化未着手（Case #3316 Epic Wave 3 Issue #3324 検出分）

- 観測元: Epic #3316（REQ-099 マルチホスト併存 実現面実行）Wave 3 Issue #3324 case-close（PR #3332・TS-011 残存検索の Findings 記録）
- 記録日: 2026-10-02

## 発見事象

1. **`docs/designs/local/runtime-package-boundary.md`**: REQ-009 時代の接続構成を本文の主部に保持している（現行の src/common + src/opencode + src/senpi 構成との記述乖離）
2. **`docs/designs/local/third-party-skill-management.md`**: 旧 skill-projection-manifest 時代の記述を含む
3. **対応しなかった理由**: 文書全体の現行化は意味判断を伴うため、PR #3332 ではパス文字列の同値置換（文意不変）までを実施し、本文構成の現行化は Findings 記録として分類

## 修正対象候補

- runtime-package-boundary.md の本文を現行の共通正本 + ホスト接続領域構成へ現行化（multi-host-canonical-model Design〔accepted〕との責務分担を確認のうえ）
- third-party-skill-management.md の旧 manifest 記述の現行化
- いずれも Design 編集を伴うため REQ/Design の意味判断を含む。backlog-review 経由の RU 化が自然な経路
