# retired-in-active-index: 廃止REQが現行索引で参照されている

## 経緯

OU-002 Wave 3 (#1021 / PR #1025) の横断検出過程で、`/repo/docs-check` の事前存在 NG findings に `retired-in-active-index` カテゴリの違反が含まれていた。本 Wave の constraint「Do NOT edit REQ/ADR files」により未修正。PR #1025 Findings に列挙されたが、case-close での intake 化が漏れていたため、事後収集する。

## 影響

- 廃止REQ（REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122）が、現行文書の索引・導線・相互参照で適切な履歴マーキングなしに参照されている可能性がある。
- REQ-0101-016（廃止REQ参照は履歴参照と現行参照を区別）への準拠状況が不完全。
- `/repo/docs-check` が継続して NG を報告し続ける。

## レビューで決めること

- `retired-in-active-index` 違反の該当ファイル・箇所を `/repo/docs-check` で特定し、REQ-0101-016 準拠の履歴マーキングを付与するか。
- 機械判定ルールの exemption 条件を見直す必要があるか。

## 根拠

- PR #1025 Findings: https://github.com/yogata/agent-dev-flow/pull/1025
- 違反基準: REQ-0101-016（廃止REQ参照の歴史参照と現行参照の区別）
- 来源: OU-002 Wave 3 横断検出の事前存在 NG（本パイプライン由来ではない）
- 関連 Epic: OU-002 #1018 Wave 3
