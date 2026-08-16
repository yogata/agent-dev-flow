# Intake Item: generate_indexes.ts が DOC-MAP 更新セクションの process.exit により全面起動不能

## 発生源

- PR: #2172 (Issue #2163 / OU-006, Epic #2162 Wave 1)
- 発生 phase: case-run 検証（AUTOGEN 再生成可否の確認）
- capture 分類: intake（再生不能な既存障害の記録）

## 問題

generate_indexes.ts は DOC-MAP 更新セクション（docmap-reference-audit.md 参照39-43、分類 DEAD-FN）の `process.exit(EXIT_ERROR)` により、現行 repo で全面起動不能な状態にある。このため AUTOGEN ブロック（README 件数カウント、retired 表、req-health-metrics 計測例等）の再生成は Phase 1 除去（監査記録 docmap-reference-audit.md が追跡する後続 Issue）まで不可能になっている。

## 推奨対応

後続 Issue（監査記録が追跡する integrity スクリプト残存参照の Phase 1 除去）の実行時に、当該 process.exit の除去または迂回を含める。Epic #2162 Wave 2（#2167）は AUTOGEN 再生成を担うため、#2167 の実行時に本障害へ到達した場合は #2167 の範囲で対処するか、後続 Issue への切り出しを判断する。

## 関連

- Issue: #2163 (CLOSED), Epic: #2162, Wave 2 Issue: #2167 (OPEN)
- PR: #2172 (Findings / Capture候補 セクション intake 2件目)
- 監査記録: docs/specs/integrity/references/docmap-reference-audit.md（参照39-43、DEAD-FN 分類）
