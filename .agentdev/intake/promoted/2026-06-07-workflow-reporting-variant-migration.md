---
discovered_at: 2026-06-07
source: intake-promote inbox scan（19件一括処理）
tags: [intake, variant-migration, deprecated-skill]
---

# workflow-reporting 廃止後の variant 移行未完了

## 内容

agentdev-workflow-reporting スキル廃止時に、completion-reports/ 内の variant ファイルを command-local template に移行することが完了条件に含まれていたが、子 Issue #563 での対応として残されたままクローズされている。Issue 側（#562）と PR 側（#568）の両方で同一の未チェック項目が残存している。

- completion-reports/ 内の variant ファイルが command-local template に移行されていない
- 子 Issue #563 で対応予定として残されている

**根拠**: Issue #562、PR #568
