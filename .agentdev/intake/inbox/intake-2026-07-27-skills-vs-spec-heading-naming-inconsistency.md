# Intake Item: skills 英語訳参照 vs SPEC 日本語見出しの命名不一致（既存、本 Epic 由来ではない）

## 発生源

- PR: #1848 (Issue #1847 / OU-001, Epic #1845 Wave 1)
- 発生 phase: case-run 検証（src/opencode/skills/** の document-model.md 参照 handoff 整合確認時）
- capture 分類: intake（参考記録、既存の命名不一致）

## 問題

`src/opencode/skills/**` の一部のスキルが document-model.md のセクション見出しを英語訳で参照する一方、document-model.md の実見出しは日本語である。これにより英語参照から日本語見出しへの grep 等での直接検索が困難になる。

## 実例

| 参照元スキルファイル | 英語参照 | document-model.md 日本語見出し |
|---|---|---|
| `agentdev-req-analysis/references/req-define-detailed-gates.md` | Document Classification Policy | `## 文書分類ポリシー` (L303) |
| `agentdev-req-file-manager/references/req-save-procedure.md` | Document Classification Policy | `## 文書分類ポリシー` (L303) |
| `agentdev-quality-gates/references/qg-1-definition-integrity.md` | Document Classification Policy | `## 文書分類ポリシー` (L303) |
| `agentdev-quality-gates/references/qg-4-final-acceptance.md` | Document Classification Policy | `## 文書分類ポリシー` (L303) |
| `agentdev-doc-diagnostics/references/diagnostic-categories.md` | SPEC Separation Criteria | `### SPEC 分離基準` (L76) |
| `agentdev-req-structure-diagnostics/references/req-structure-review.md` | SPEC Separation Criteria | `### SPEC 分離基準` (L76) |

## 性質と判定

- **時期**: L580「## 恒久基準と非規範情報の整理」追加前から存在する既存の不一致。本 Epic #1845 由来ではない
- **影響**: 機能的影響なし。各スキルは SPEC レベルで参照しており、セクション見出しの直接 grep に依存しない
- **優先度**: 低。本 Intake Item は参考記録としての保存であり、直ちに対応を要求しない

## 推奨対応

別途 `/agentdev/inspect-promote` で採用判断を行う。対応を採用する場合は、スキル側から英語参照を削除し日本語見出しへ統一する、または document-model.md 側へ各見出しに英語 alias を併記する、のいずれかが候補。

## 関連

- references: docs/specs/foundations/document-model.md (L76, L303)
- Issue: #1847 (CLOSED), Epic: #1845 (CLOSED)
- PR: #1848 (Findings / Capture候補 セクション F-3)
- commit: 6eeedabf（spec-save）、025a20a1（OU-001 case-close）
- source finding: 「Skill handoff 結果」F-3
