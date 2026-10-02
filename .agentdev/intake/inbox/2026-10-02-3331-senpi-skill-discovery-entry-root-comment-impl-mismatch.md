# intake: senpi-skill-discovery.ts 先頭コメントの Entry root 記述と installer 投影実装の整合（Case #3316 Epic Wave 3 Issue #3323 検出分）

- 観測元: Epic #3316（REQ-099 マルチホスト併存 実現面実行）Wave 3 Issue #3323 case-close（PR #3331）
- 記録日: 2026-10-02

## 発見事象

1. **コメントと実装の整合**: `src/senpi/skill-discovery/senpi-skill-discovery.ts` 先頭コメントの「Entry root: <workspaceRoot>/.senpi/skills/ is the Senpi public entry projection (the installer populates it from the canonical skills).」に対し、現行 installer（scripts/install.ps1）の Senpi 投影は `src/senpi/` 配下の各サブディレクトリ（skill-discovery, tools, plugins）を `.senpi/` 直下へ個別 junction 投影する実装であり、`.senpi/skills/` への共通正本 skills 投影は存在しない
2. **現行動作への実害なし**: 公開入口 `.senpi/skills/` 優先・canonical `src/common/skills/` fallback の探索契約により、全公開 command 13件の Workflow Skill は canonical fallback で解決する（TS-002 静的展開確認で両ホスト到達を検証済み）。本 Issue は src/** を変更しないため記録のみ

## 修正対象候補

- `.senpi/skills/` 公開入口投影の整備（installer が `.senpi/skills/` へ共通正本 skills を投影するか、コメント側を現行実装（個別 junction 投影 + canonical fallback）に合わせて現行化するかの判断を含む）
- Design `multi-host-canonical-model.md`（Wave 3 case-close で accepted 昇格済み）の「投影モデル」節との整合確認は採用判断時に実施する
