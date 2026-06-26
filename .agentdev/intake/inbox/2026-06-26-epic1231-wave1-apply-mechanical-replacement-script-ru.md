# apply-mechanical-replacement.ps1 の RU化（新規共用スクリプト）

## 発生源

- Epic: #1231 (Wave 1)
- PR: #1243 (子Issue #1233), #1244 (子Issue #1234), #1245 (子Issue #1232)
- 発生日: 2026-06-26

## 内容

Wave 1 PR群（#1243, #1244, #1245）で機械置換アルゴリズム（`mechanical-replacement-rules.md` 準拠）を一括適用するための PowerShell スクリプト `scripts/apply-mechanical-replacement.ps1` を新設した。本スクリプトは Wave 1 PR群には含めず（別途管理）、Wave 2（#1237, #1238, #1239）でも共用可能。

現状ではスクリプトが各 PR 作成時に手動で参照・適用されており、REQ/SPEC 上の位置付けが未確定（RU化未実施）。`scripts/` 配下の新規ツールとして整理し、REQ-0140-026（文書品質準拠）の実行手段として明文化するかを検討する必要がある。

## 推奨対応先

- RU化候補: `scripts/apply-mechanical-replacement.ps1` を REQ-0140-026 の実行手段として REQ/SPEC へ位置付ける
- 配置・命名規約の確認: `scripts/` 配下のツール管理体制（メンテナ、適用範囲、廃止基準）
- Wave 2 実行前に本スクリプトの取扱を確定することで再利用性を担保

## 現在の追跡状態

- PR #1243 Findings セクションに記録済み
- PR #1244, #1245 SPEC確定候補セクションに記録済み（RU化検討）
- Wave 2（#1237/#1238/#1239）実行時にも共用予定
