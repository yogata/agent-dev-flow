# intake: archive installer と archive projection 系 gate の新構成対応未着手（Case #3316 Epic Wave 2 Issue #3322 検出分）

- 観測元: Epic #3316（REQ-099 マルチホスト併存 実現面実行）Wave 2 Issue #3322 case-close（PR #3330）
- 記録日: 2026-10-02

## 発見事象

1. **archive installer と archive projection 系 gate の新構成対応は未着手**: `scripts/consumer/archive/install.ps1`、`trusted-distribution-gate/`（manifest・archive-installed-verifier・launcher fixture）、`package-release-archive.test.ts` が archive レイアウト `src/opencode/**` 前提のまま。archive レイアウトの対象定義変更（`scripts/self/release/package-release-archive.ps1`）と一体でないと対応できないため、PR #3330 では対応していない（本 PR では挙動を変更していない。sidecar の宣言集約のみ）

## 修正対象候補

- 上記1は archive 構築対象定義の変更（`package-release-archive.ps1`）と trusted-distribution-gate / package-release-archive.test.ts / consumer/archive/install.ps1 の新構成対応を一体実施する
- 既存 intake item `2026-10-02-3318-wave1-remainder-installer-projection-and-archive-gates.md` の発見事象2と同一主題であり、その追従記録。後続 Wave（Wave 3 以降の検証整備・レイアウト対象定義変更）の対応対象
