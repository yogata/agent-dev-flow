## 観測内容
PR #1300（Issue #1293「docs/guides + src/opencode/skills 既存規範横展開」）において、REQ-0140-031（SKILL.md役割分担）の適用状況を確認し、27/27 SKILL.md が description + 機能節構造を持つことを確認した。ただし各 SKILL.md の概要節と機能節の重複（REQ-0140-031 が查読対象とする重複）の詳細な per-file 查読は本 Issue の対象外とし、構造の存在確認に留めた。

## 影響
27 SKILL.md 各ファイルの概要節（description frontmatter）と機能節（## セクション群）の重複が未解決であり、ドキュメント品質および可読性に影響。

## 課題
- 27 SKILL.md 各ファイルの概要節と機能節の重複抽出
- 重複度合いに応じた改善優先度付け
- agentdev-doc-writing スキルでの段階的查読スケジューリング

## 既存要件との関連
- REQ-0140-031: SKILL.md 役割分担および概要節と機能節の重複を查読対象として規定
