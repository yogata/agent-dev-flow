---
discovered_at: 2026-06-06
source: case-auto Epic #580 PR Findings回収
tags: [intake, residual-cleanup, legacy-terminology]
---

# Epic #580 Findings回収 — Wave 2-3で未修正の残存参照

## 内容

Wave 2 (#585) および Wave 3 (#586) の integrity check 拡張で検出されたが、対象外としてスキップされた残存参照の修正候補。

### 1. req-backlog 残存参照 (4件)

Wave 3 の `check-req-backlog-residual` で新たに検出された4件の req-backlog 参照。Wave 2 (#585) では主要な参照を修正したが、テンプレートパスや実行コンテキスト内の参照が残存。

**発見元**: PR #592 (#586 Prevention Gates)
**対象ファイル**: case-run.md 等
**分類**: intake

### 2. agentdev-workflow-reporting 参照 (3件)

Wave 3 の `check-abolished-skill-reference` で検出された3件の `agentdev-workflow-reporting` 参照。廃止済みスキルへの参照。

**発見元**: PR #592 (#586 Prevention Gates)
**対象**: 該当ファイル
**分類**: intake

### 3. pattern-residual case-run.md work_type 検出除外

`check-pattern-residual` が case-run.md で work_type の明示値を Pattern 残存として誤検出。case-run.md は work_type を条件分岐に使用しているため、除外検討が必要。

**発見元**: PR #592 (#586 Prevention Gates)
**対象**: check_integrity.ts の exempt 設定
**分類**: intake
