## 観測内容
PR #1188（SPEC status SSoT and draft 放置検出）で、frontmatter `status` なし SPEC の status 付与を別課題と判断した。

本 PR では SSoT 表で `-` 表示とし、放置検出の対象外とした（IR-054 設計通り）。frontmatter `status` なし SPEC に対する status 付与は未実施。

## 影響
status 管理はドキュメントライフサイクルに重要だが、対象外化済みで機能不具合ではない。status なし SPEC の検出・追跡が不完全。

## 課題
frontmatter `status` なし SPEC に status を付与する。REQ-0154 の対象外とされた課題で、自動付与ロジックの実装または手動付与の docs_chore 作業が必要。

## 既存要件との関連
- IR-054（放置検出設計）
- REQ-0154（SPEC status SSoT）
