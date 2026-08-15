# doc-diagnostics 内部2ファイルの旧 Command 手順番号への陳腐化参照

## 観測内容

agentdev-doc-diagnostics 内部の2ファイル（diagnostic-categories.md、diagnostic-routing.md）が、Workflow Skill 移行により Command 本文側から削除された旧手順番号（旧 Command Step 番号）を参照している。

## 影響

- 読む agent が存在しない手順番号を辿って誤誘導される可能性がある
- Workflow Skill 移行後の参照構造と旧参照が混在する

## 課題

旧 Command 手順番号への参照を、Workflow Skill の工程名・節名への参照へ decoupling する。

## 既存要件・成果物との関連

- 対象: agentdev-doc-diagnostics references/diagnostic-categories.md、diagnostic-routing.md
- 関連: thin Command 化（Workflow Skill 移行）

## 出典

- 発生日: 2026-08-15
- 取得元: inspect 系診断・観測
- 元 item: intake-2026-08-15-doc-diagnostics-stale-step-number-refs.md
