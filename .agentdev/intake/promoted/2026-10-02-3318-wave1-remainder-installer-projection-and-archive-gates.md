# intake: installer 投影対象の旧 src/opencode 前提残存・archive projection 系 gate の新構成未対応・REQ-099-001/002 恒常 checker 整備見送り

## 分類

採用（backlog-review へ引き渡す変更候補）

## 観測内容

1. **installer の投影対象が旧 src/opencode 前提のまま**: `scripts/install.ps1`・`scripts/self-sync.ps1`・`scripts/consumer/common.ps1` は usable checkout 判定と junction 対象が `src/opencode/**` 前提で、共通正本 `src/common/**` への投影対応が未実施。`docs/guides/consumer-project-setup.md` の投影モデル説明（14・17・45-47・82-83・268-275 行等）も installer 対応と一体で更新が必要（PR #3326 では broken link 1 件のみ解消し投影説明は現状記述を維持）
2. **archive projection 系 gate の新構成対応未着手**: `trusted-distribution-gate/`（manifest・archive-installed-verifier・launcher fixture）と `package-release-archive.test.ts` は archive レイアウトが `src/opencode/**` 前提。archive 構築（`scripts/self/release/package-release-archive.ps1`）の対象定義変更と一体でないと更新できないため PR #3326 では未着手
3. **REQ-099-001/002 の恒常 checker 整備を Issue #3318 で見送り**: 本 Issue の対応は検査基盤の走査先・fallback・参照の追随であり、REQ-099-001/002（host 間の業務等価性・共通正本分離）を検証する恒常的検証手段は検査基盤追随の性質を超え、Epic 後続 Wave の REQ-099 検証整備（投影突合等）に属する。無理な verification 宣言の付与は対応関係を汚すため実施しない判断を記録

## 影響・課題

- installer・archive 系が旧構造前提のままのため、REQ-099（マルチホスト併存）の実現面が src/common 共通正本構成に完全追従していない
- consumer 環境での投影・archive が旧構成で動作し続ける

## 既存要件・成果物との関連

- REQ-099（マルチホスト併存）・REQ-099-001/002（業務等価性・共通正本分離）
- Design multi-host-canonical-model（投影モデルの正規所有者）
- scripts/install.ps1・scripts/self-sync.ps1・scripts/consumer/common.ps1
- docs/guides/consumer-project-setup.md

## 対応候補

- 上記1は installer 投影対象の新構成対応とガイド更新を一体実施
- 上記2は archive 構築対象定義の変更と trusted-distribution-gate / package-release-archive.test.ts の新構成対応を一体実施
- 上記3は Epic 後続の REQ-099 検証整備で恒常 checker（投影突合等）として整備

## 統合・関連 item

- 2026-10-02-3332-release-archive-new-structure-pending.md（同一主題系統: release archive 一式の新構造対応。要素2と範囲が重複し、backlog-review での統合判定候補）

## 元 item

- 観測元: Epic #3316（REQ-099 マルチホスト併存 実現面実行）Wave 1 Issue #3318 case-close（PR #3326）
- 記録日: 2026-10-02
