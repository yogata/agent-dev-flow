# quality-gates 配布物の case-revise --review-ng 表記と case-revise command interface の不整合

## 概要

quality-gates 配布物（`agentdev-quality-gates/SKILL.md` 37・76 行、`references/qg-3-implementation-deviation.md` 145-147・169 行）が `case-revise --review-ng` フラグ付き経路を QG-3 不合格時の案内として記述しているが、case-revise command 定義（`src/opencode/commands/agentdev/case-revise.md`）は `--review-ng` フラグを定義していない。配布物間の公開 interface 不整合。

## 内容

- 整理候補: (a) case-revise command へ `--review-ng` フラグを正式定義する、(b) quality-gates 側の表記をフラグなしの case-revise → case-ready → case-run（再開）経路へ除去・統一する
- 判断材料: routing references（review-ng.md / next-command-rules.md）は PR #2820 でフラグなし経路へ現行化済み。quality-gates 側のみ旧表記が残存（6 箇所）
- 旧3コマンド名（req-save / design-save / case-update）を含まないため、旧参照横断 grep（PR #2820 の完了条件検証）の対象外だった

## 根拠

- 観測元: case 2811（PR #2820）本文 Design確定候補、case-close Design 状態評価（棚卸し制、2026-09-15）で不整合を確認。評価結果は見送り（command 公開 interface の変更を伴うため case-close の対象外）
