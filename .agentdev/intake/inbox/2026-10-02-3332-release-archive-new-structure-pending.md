# intake: release archive 一式の新構造対応未着手（Case #3316 Epic Wave 3 Issue #3324 検出分）

- 観測元: Epic #3316（REQ-099 マルチホスト併存 実現面実行）Wave 3 Issue #3324 case-close（PR #3332・TS-011 残存検索の Findings 記録）
- 記録日: 2026-10-02

## 発見事象

1. **archive 構築対象の旧構造前提**: `scripts/self/release/package-release-archive.ps1` が src/opencode 前提の収集・boundary check のまま（実装は動作するが旧構造 archive を生成する）
2. **同系統の同梱内容と記述**: `scripts/consumer/archive/install.ps1` と `README-INSTALL.md` の同梱内容、`docs/designs/integrity/integrity-contracts.md` の archive レイアウト節も同系統の旧構造前提
3. **対応の一体性**: 新構造（src/common + src/opencode + src/senpi + src/third-party）への対応は収集対象と boundary check の再設計を伴うため、PR #3332 では対応せず Findings 記録として分類

## 修正対象候補

- `package-release-archive.ps1` の収集対象定義と boundary check の新構造対応
- `scripts/consumer/archive/install.ps1`、`README-INSTALL.md` 同梱内容、`integrity-contracts.md` archive レイアウト節の追従更新（一体実施）
- 既存 intake item `2026-10-02-3330-archive-installer-projection-gates-pending.md` および `2026-10-02-3318-wave1-remainder-installer-projection-and-archive-gates.md` と同一主題系統。統合判定は intake-promote で実施
