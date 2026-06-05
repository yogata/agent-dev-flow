---
discovered_at: 2026-06-06
source: case-auto Epic #580 PR #587 Findings回収
tags: [intake, thin-command, architecture]
---

# Epic #580 Findings回収 — Thin Command 原則違反 (INC-0022)

## 内容

4つのコマンドが「thin command」原則に違反し、判断ロジックを埋め込んでいる。Wave 2 (#582 Runtime Boundary) では document-only とし、修正は行わなかった（変更が広範囲に及ぶため）。

### 該当コマンド

judgment logic を直接含むコマンド（具体的なファイルは台帳 INC-0022 を参照）。

**発見元**: PR #587 (#581 台帳作成) で特定、PR #589 (#582 Runtime Boundary) で document-only 判定
**分類**: intake
**優先度**: 中（アーキテクチャ改善だが、機能的な問題ではない）
**影響範囲**: コマンドの保守性・テスト容易性
