# ng-baseline の REQ/ADR 起源エントリ陳腐化

## 観測内容
OU-020 で src 側の REQ/ADR 表記を現行化した後も、`ng-baseline.json` の provenance `issue-2372-ir065-initial-baseline` エントリが残っている。

## 影響
解消済み表記が baseline に残り、検出状態と baseline 管理の実態が乖離する。

## 課題
src 側で解消済みのエントリを削除するかを確認し、削除後に `check_integrity` を再実行して demote 解除を検証する。

## 既存要件・正規成果物との関連
PR #2593、Issue #2570、IR-065、`.opencode/skills/repo-agentdev-integrity/baselines/ng-baseline.json`。
