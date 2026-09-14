# quality-gates 配布物の case-revise --review-ng 表記と case-revise command interface の不整合

## 観測内容

quality-gates 配布物（`agentdev-quality-gates/SKILL.md` 37・76 行、`references/qg-3-implementation-deviation.md` 145-147・169 行の計 6 箇所）が `case-revise --review-ng` フラグ付き経路を QG-3 不合格時の案内として記述しているが、case-revise command 定義（`src/opencode/commands/agentdev/case-revise.md`）は `--review-ng` フラグを定義していない。配布物間の公開 interface 不整合。

本 promoted 成果物の生成時点（2026-09-15）で再検証済み:

- `src/opencode/skills/agentdev-quality-gates/` 配下の `--review-ng` 表記: 6 箇所（SKILL.md 2 箇所、references/qg-3-implementation-deviation.md 4 箇所）
- `src/opencode/commands/agentdev/case-revise.md`: `--review-ng` 定義なし
- `docs/designs/quality/quality-gates.md`: 表記なし（残存は配布 skill 側のみ）

## 影響

- QG-3 不合格時に routing skill が案内する `case-revise --review-ng` 経路が command 定義に存在せず、レビュー拒否後の正規フロー（QG-3 結果の消費）が機構上つながらない
- quality-gates と case-revise の間で公開 interface の記述が分裂しており、配布物間の整合性契約（command interface と参照側の一致）を崩している

## 課題（対応候補と判断材料）

対応候補は 2 つ。command 公開 interface の変更判断を含むため、対応方針の決定は後続工程（backlog-review → RU → req-define）で行う:

- (a) case-revise command へ `--review-ng` フラグを正式定義する — command 公開 interface の変更を伴い、REQ-062（case-revise 実行契約）・DEC レベルの判断が必要
- (b) quality-gates 側の表記をフラグなしの case-revise → case-ready → case-run（再開）経路へ除去・統一する — 配布物の表記修正のみ

判断材料:

- routing references（review-ng.md / next-command-rules.md）は PR #2820 でフラグなし経路へ現行化済み。quality-gates 側のみ旧表記が残存（6 箇所）— 現行の正規経路はフラグなし側に寄っている
- 旧3コマンド名（req-save / design-save / case-update）を含まないため、旧参照横断 grep（PR #2820 の完了条件検証）の対象外だった
- case-close の Design 状態評価（棚卸し制、2026-09-15）では、command 公開 interface の変更を伴うため case-close の対象外として見送り済み

## 既存要件との関連

- REQ-062（case-revise 実行契約）: (a) を選ぶ場合の command interface 変更の対象 REQ
- REQ-032（case-close 実行契約）: レビュー拒否（review NG）後の再合意・再実行フローの起点に関連
- REQ-053 / REQ-002 系の配布物整合性契約: 配布物間の interface 記述一致の観点

## 根拠

- 観測元: case 2811（PR #2820）本文 Design確定候補、case-close Design 状態評価（棚卸し制、2026-09-15）で不整合を確認
- 評価結果は見送り（command 公開 interface の変更を伴うため case-close の対象外）
- intake-promote（2026-09-15）で表記残存 6 箇所と command 側未定義を機械検証（grep）により再確認し、採用を確定
