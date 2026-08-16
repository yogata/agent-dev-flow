# Intake Item: 一文一行機械判定違反の未是正残存（src/opencode 配布物側 716 違反行）

## 発生源

- PR: #2154 (Issue #2143 / OU-009, Epic #2134 Wave 3)
- 発生 phase: case-run 検証（ReportOnly 機械判定による計測）
- capture 分類: intake（横断是正の後続候補。対象範囲宣言と配布物精査の整理が別途必要）

## 問題

X-4 一文一行機械判定で src/opencode/**（配布 command/skill）に 716 違反行が残存する。
OU-009 の対象範囲宣言は docs であり、配布物側は本 Issue の対象外とした。
ただし配布物側は過去の配布物精査（PR 2111 等）と機械判定の適用範囲の整理が別途必要な状態にある。

## 推奨対応

配布 command/skill への一文一行機械是正の適用可否（配布物精査 PR 2111 系との重複・担当整理を含む）を判断した上で、是正単位を分割して実施する。

## 関連

- Issue: #2143 (CLOSED), Epic: #2134
- PR: #2154 (Findings / Capture候補 セクション intake 1 の配布物側)
