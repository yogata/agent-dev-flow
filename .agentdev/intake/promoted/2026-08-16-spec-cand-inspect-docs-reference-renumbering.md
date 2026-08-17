# inspect-docs 各 reference の手順節採番の工程単位再整理（SPEC確定候補）

## 観測内容

agentdev-workflow-inspect-docs の各 reference の手順節ヘッダは旧 Command 手順の通し番号（scan-and-doc-diagnostics.md が Step 1〜10、distribution-check-and-output.md が Step 11〜17）をファイル分割で引き継いでいた。PR #2153（OU-010）はこれら reference に STEP-N-M 形式の変換を適用済み（Step 1〜10 → STEP-2-1〜2-9 等）のため、本体の再採番は完了している。残る論点は手順節の採番体系を SPEC に正規記載するか否かである。

## 影響

- 採番体系が SPEC 未規定のため、今後の reference 分割・追加時の採番判断が裁量に委ねられる

## 課題

PR #2153 の変換結果（merge commit fb0a5ac5）を踏まえ、手順節採番の正規契約を spec-save 経由で確定するか、現状運用（工程表+節名参照）で十分と判断するかを協議する。agentdev-doc-diagnostics からの参照は節名ベースのため再採番の影響を受けない。

## 既存要件・成果物との関連

- 対象: agentdev-workflow-inspect-docs references（scan-and-doc-diagnostics.md、distribution-check-and-output.md）
- 変換実績: PR #2153 (Issue #2144, CLOSED)、PR #2150 (Issue #2142, CLOSED)

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2150 (Issue #2142 / OU-008, Epic #2134 Wave 2) SPEC確定候補 セクション
- 元 item: intake-2026-08-16-spec-cand-inspect-docs-reference-renumbering.md
