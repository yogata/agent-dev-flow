# intake: release archive 一式の新構造対応未着手

## 分類

採用（backlog-review へ引き渡す変更候補）

## 観測内容

1. **archive 構築対象の旧構造前提**: `scripts/self/release/package-release-archive.ps1` が src/opencode 前提の収集・boundary check のまま（実装は動作するが旧構造 archive を生成する）
2. **同系統の同梱内容と記述**: `scripts/consumer/archive/install.ps1` と `README-INSTALL.md` の同梱内容、`docs/designs/integrity/integrity-contracts.md` の archive レイアウト節も同系統の旧構造前提
3. **対応の一体性**: 新構造（src/common + src/opencode + src/senpi + src/third-party）への対応は収集対象と boundary check の再設計を伴うため、PR #3332 では対応せず Findings 記録として分類

## 影響・課題

- release archive が旧構造で生成され続け、REQ-099 新構成の配布物としての整合性が保たれない
- trusted-distribution-gate・package-release-archive.test.ts も旧構造前提で、検証資産が対象と乖離

## 既存要件・成果物との関連

- REQ-099（マルチホスト併存）
- scripts/self/release/package-release-archive.ps1・scripts/consumer/archive/install.ps1・README-INSTALL.md
- docs/designs/integrity/integrity-contracts.md（archive レイアウト節）
- trusted-distribution-gate/・package-release-archive.test.ts

## 対応候補

- `package-release-archive.ps1` の収集対象定義と boundary check の新構造対応
- `scripts/consumer/archive/install.ps1`、`README-INSTALL.md` 同梱内容、`integrity-contracts.md` archive レイアウト節の追従更新（一体実施）

## 統合・関連 item

- 2026-10-02-3318-wave1-remainder-installer-projection-and-archive-gates.md（同一主題系統: installer 投影対象と archive gate。要素が相互依存し、backlog-review での統合判定候補）
- 2026-10-02-3330-archive-installer-projection-gates-pending.md（本 item の Wave 2 追従記録。scripts/consumer/archive/install.ps1 が Wave 2 時点でも未対応であることを確認した記録であり、本成果物の要素2に包含されるため統合して本成果物で処理）

## 元 item

- 観測元: Epic #3316（REQ-099 マルチホスト併存 実現面実行）Wave 3 Issue #3324 case-close（PR #3332・TS-011 残存検索の Findings 記録）
- 記録日: 2026-10-02
