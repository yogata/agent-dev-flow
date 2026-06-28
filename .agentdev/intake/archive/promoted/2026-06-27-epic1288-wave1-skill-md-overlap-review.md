# 各 SKILL.md の概要節と機能節の重複 per-file 查読

## 観察

PR #1300（Issue #1293「docs/guides + src/opencode/skills 既存規範横展開」）は REQ-0140-031（SKILL.md役割分担）の適用状況を確認し、27/27 SKILL.md が description + 機能節構造を持つことを確認した。ただし各 SKILL.md の概要節と機能節の重複（REQ-0140-031 が查読対象とする重複）の詳細な per-file 查読は本 Issue の対象外とし、構造の存在確認に留めた。

## 修正されなかった理由

本 Issue（#1293）は規範適用状況の確認とトレーサビリティ参照追記が主目的。27 SKILL.md の per-file 重複查読は large 規模の作業であり、agentdev-doc-writing スキルの継続的静的查読で段階的に実施する対象とした。

## 課題

- 27 SKILL.md 各ファイルの概要節（description frontmatter）と機能節（## セクション群）の重複抽出
- 重複度合いに応じた改善優先度付け
- agentdev-doc-writing スキルでの段階的查読スケジューリング

## 根拠

PR #1300 本文（Findings / Capture候補）より引用:

> 各 SKILL.md の概要節と機能節の重複（REQ-0140-031 が查読対象とする重複）について、詳細な per-file 查読は本 Issue の対象外（agentdev-doc-writing スキルの静的查読で段階的に実施）。本 Issue では構造の存在確認に留めた。

## 観測元

- PR #1300
- Issue #1293
- Epic #1288（OU-004, Wave 1）
