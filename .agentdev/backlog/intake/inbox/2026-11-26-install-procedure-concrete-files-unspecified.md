---
id: 2026-11-26-install-procedure-concrete-files-unspecified
created_at: 2026-11-26T22:50:00+09:00
source: case-open (Root Case #4227 の自工程 deviation capture)
status: unreviewed
---

# Definition の導入手順記述が実装対象の具体ファイルを特定していない

- **課題**: Root Case #4227 の draft の導入手順関連記述（案内・ガイド系の内容規定）が、実装対象の具体ファイル（README-INSTALL.md、docs/guides/consumer-project-setup.md、docs/guides/multi-host-operations.md 等）を特定していない。対象特定が実装段階（case-run）に暗黙に委ねられる
- **期待する処分**: Definition 側で対象ファイルを明示するか、実装時特定で十分と判断するかを決める（PR #4228 のレビューまたは case-ready の Definition 受入時に判断するのが自然）
- **出典**: Root Case #4227 の case-open 実行（2026-11-26、draft の artifact_actions 構成確認）
- **実証根拠**: draft の編集対象 18 ファイルが docs/designs/**、docs/requirements/**、docs/decisions/** に限定されており、導入案内系ファイルが Definition 変更対象に含まれないこと
