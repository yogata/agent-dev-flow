# intake: installer 投影対象の旧 src/opencode 前提残存・archive projection 系 gate の新構成未対応・REQ-099-001/002 恒常 checker 整備見送り（Case #3316 Epic Wave 1 Issue #3318 検出分）

- 観測元: Epic #3316（REQ-099 マルチホスト併存 実現面実行）Wave 1 Issue #3318 case-close（PR #3326）
- 記録日: 2026-10-02

## 発見事象

1. **installer の投影対象が旧 src/opencode 前提のまま**: `scripts/install.ps1`・`scripts/self-sync.ps1`・`scripts/consumer/common.ps1` は usable checkout 判定と junction 対象が `src/opencode/**` 前提で、共通正本 `src/common/**` への投影対応が未実施。`docs/guides/consumer-project-setup.md` の投影モデル説明（14・17・45-47・82-83・268-275 行等）も installer 対応と一体で更新が必要（PR #3326 では broken link 1 件のみ解消し投影説明は現状記述を維持）。後続 Wave（RA-002・Issue #3322）の対応対象
2. **archive projection 系 gate の新構成対応未着手**: `trusted-distribution-gate/`（manifest・archive-installed-verifier・launcher fixture）と `package-release-archive.test.ts` は archive レイアウトが `src/opencode/**` 前提。archive 構築（`scripts/self/release/package-release-archive.ps1`）の対象定義変更と一体でないと更新できないため PR #3326 では未着手。後続 Wave の対応対象
3. **REQ-099-001/002 の恒常 checker 整備を Issue #3318 で見送り**: 本 Issue の対応は検査基盤の走査先・fallback・参照の追随であり、REQ-099-001/002（host 間の業務等価性・共通正本分離）を検証する恒常的検証手段は検査基盤追随の性質を超え、Epic 後続 Wave の REQ-099 検証整備（投影突合等）に属する。無理な verification 宣言の付与は対応関係を汚すため実施しない判断を記録

## 修正対象候補

- 上記1は Wave 2 RA-002（Issue #3322）で installer 投影対象の新構成対応とガイド更新を一体実施
- 上記2は archive 構築対象定義の変更と trusted-distribution-gate / package-release-archive.test.ts の新構成対応を一体実施（Wave 割当要確認）
- 上記3は Epic 後続 Wave の REQ-099 検証整備で恒常 checker（投影突合等）として整備
