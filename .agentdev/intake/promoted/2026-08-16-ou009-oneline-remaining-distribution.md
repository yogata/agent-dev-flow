# 一文一行機械判定違反の未是正残存（src/opencode 配布物側 716 違反行）

## 観測内容

X-4 一文一行機械判定で src/opencode/**（配布 command/skill）に 716 違反行が残存する。OU-009 の対象範囲宣言は docs であり、配布物側は本 Issue の対象外とした。ただし配布物側は過去の配布物精査（PR 2111 等）と機械判定の適用範囲の整理が別途必要な状態にある。

## 影響

- 配布物 716 違反行が未整備のまま残り、機械判定適用範囲の設計判断（配布物精査との重複・担当整理）が未解決である

## 課題

配布 command/skill への一文一行機械是正の適用可否（配布物精査 PR 2111 系との重複・担当整理を含む）を判断した上で、是正単位を分割して実施する。

## 既存要件・成果物との関連

- SPEC: mechanical-replacement-rules.md §4
- 関連: 2026-08-16-ou009-oneline-remaining-docs-req-dec.md（docs 側 57 違反行、統合候補）
- 前提整理: 配布物精査 PR 2111 系

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2154 (Issue #2143 / OU-009, Epic #2134 Wave 3) Findings / Capture候補 セクション intake 1 の配布物側
- 元 item: intake-2026-08-16-ou009-oneline-remaining-distribution.md
