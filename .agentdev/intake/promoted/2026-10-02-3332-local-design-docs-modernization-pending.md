# intake: local/ 配下 Design 文書の現行化未着手

## 分類

採用（backlog-review へ引き渡す変更候補）

## 観測内容

1. **`docs/designs/local/runtime-package-boundary.md`**: REQ-009 時代の接続構成を本文の主部に保持している（現行の src/common + src/opencode + src/senpi 構成との記述乖離）
2. **`docs/designs/local/third-party-skill-management.md`**: 旧 skill-projection-manifest 時代の記述を含む
3. **対応しなかった理由**: 文書全体の現行化は意味判断を伴うため、PR #3332 ではパス文字列の同値置換（文意不変）までを実施し、本文構成の現行化は Findings 記録として分類

## 影響・課題

- local/ Design が現行構成（共通正本 + ホスト接続領域）と乖離したまま残存し、参照時に誤解の源泉になる
- inspect-docs でも DS-NEW-3（third-party-skill-management.md:81-82 の cli.ts 配置が src/common 実配置と乖離）として検出されており、現行化債務が複数の診断で確認されている

## 既存要件・成果物との関連

- docs/designs/local/runtime-package-boundary.md・docs/designs/local/third-party-skill-management.md
- Design multi-host-canonical-model（accepted。現行構成の正規所有者との責務分担確認が必要）
- REQ-099（マルチホスト併存）

## 対応候補

- runtime-package-boundary.md の本文を現行の共通正本 + ホスト接続領域構成へ現行化（multi-host-canonical-model Design〔accepted〕との責務分担を確認のうえ）
- third-party-skill-management.md の旧 manifest 記述の現行化
- いずれも Design 編集を伴うため REQ/Design の意味判断を含む。backlog-review 経由の RU 化が自然な経路

## 元 item

- 観測元: Epic #3316（REQ-099 マルチホスト併存 実現面実行）Wave 3 Issue #3324 case-close（PR #3332・TS-011 残存検索の Findings 記録）
- 記録日: 2026-10-02
