# agentdev-traceability Design の check 節へ分類状態導出の実装詳細反映

## 観測

PR #2423（Issue #2419、REQ-012-051）で agentdev-traceability の check へ分類状態導出が実装された（3値: unclassified / verification-present / catalog-registered。判定は宣言あり最優先、宣言とカタログ登録の併存行は verification-present で異常扱いしない）。実装詳細（3値の導出条件、判定優先順位、check レポート verificationClassification の報告仕様〔全現行要件行を knownReqIds 順、--req の対象限定の影響を受けない〕、missing-verification findings と unclassified 行集合の同一性・単一導出からの計上）が docs/designs/skills/agentdev-traceability.md へは未反映である（本 PR の Design 変更は implementation 宣言行の追記のみ）。

## 今回扱わない理由

case-close の Design 確定フローは status 昇格（draft → accepted）を責務とし、対象 Design は既に accepted のため本文記載の追加は case-close の変更範囲に含めない（STEP-3-2 処理パターン (c) 見送り、後続へ委ねる）。

## 影響

Design の check 節には導出契約の詳細がなく、SKILL.md・scripts/README.md と正本（traceability-model.md）のみが詳細を記述する状態。Design から導出仕様の全体像を得られない。

## レビューで決めること

- Design agentdev-traceability の check 節へ実装詳細（3値・優先順位・報告仕様・missing-verification との同一性）を反映するか、正本（traceability-model.md「対応関係の完全性規則」節）への参照のみで足すか

## 根拠

- PR #2423 本文「Design確定候補」1件目
- docs/designs/skills/agentdev-traceability.md（status accepted、PR #2423 マージ後 main）
- docs/designs/foundations/traceability-model.md「対応関係の完全性規則」節（commit 5cc32bb6）
