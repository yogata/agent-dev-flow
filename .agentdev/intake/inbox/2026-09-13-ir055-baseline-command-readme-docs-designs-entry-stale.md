# IR-055 baseline の src/opencode/commands/agentdev/README.md エントリが表現解消後に陳腐化

## 概要

IR-055 baseline（src/opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json）の src/opencode/commands/agentdev/README.md エントリ（pattern: docs/designs/、count: 1）は、PR 2792 で該当表現（design-save 行出力欄の docs/designs/ 参照）を解消したため陳腐化している。baseline ファイルは当該 Case 変更対象外のため未更新。

## 内容

- baseline エントリ（src/opencode/commands/agentdev/README.md、pattern: docs/designs/、count: 1）は PR 2792 で該当表現を解消済み
- baseline ファイル自体は当該 Case 変更対象外のため未更新
- 次回 baseline 再生成（--update-ir055-baseline）時に当該エントリを除去すること

## 根拠

- 観測元: PR 2792（case 2791 / issue 2792、`## Findings / Capture候補` intake セクション。IR-055 baseline 鮮度確認 TS-009 で検出）、case-close（2026-09-13）で回収
- 元テキスト: 「IR-055 baseline（src/opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json）の src/opencode/commands/agentdev/README.md エントリ（pattern: docs/designs/、count: 1）は本 PR で該当表現を解消したため陳腐化。baseline ファイルは本 Case 変更対象外のため未更新。次回 baseline 再生成（--update-ir055-baseline）時に除去すること」
