# IR-055 baseline・配布物内部参照の段階解消（統合残課題・対象選定材料）

※ 統合成果物: 3 intake item（ir055-baseline-command-readme-docs-designs-entry-stale、distribution-boundary-pre-existing-req-draft-dec-003、ir055-baseline-staged-remediation）を同一運用系統（baseline・配布物内部参照の段階解消）として整理

## 観測内容

3 系統の観測が同一の段階解消運用に属する:

1. **baseline エントリ陳腐化**: IR-055 baseline（`src/opencode/skills/repo-agentdev-integrity/baselines/ir-055-baseline.json`）の `src/opencode/commands/agentdev/README.md` エントリ（pattern: `docs/designs/`、count: 1）は、PR 2792 で該当表現（design-save 行出力欄の docs/designs/ 参照）を解消したため陳腐化。baseline ファイルは当該 Case 変更対象外のため未更新
2. **baseline 残置検出**: IR-055 baseline 残置 83 検出（43 エントリ・34 ファイル。case 2766 で 90 → 83 まで解消進行）。特に `docs/designs/` 参照 45 行は Design 名＋節名表現への機械的置換が見込まれる一方、design-save / req-save 等 workflow コマンドの保存先パス指示は動作仕様記述であり一般化の方針を要する
3. **配布依存境界 pre-existing**: `src/opencode/commands/agentdev/templates/req-define/req-draft.md` L118 の concrete-id 参照（matched=DEC-003、snippet「欠落時に後続工程は draft を拒否しない（soft contract、DEC-003）」）。main root（38f0cae5・ワークツリー変更ゼロ環境）で同一 failure の再現を機械確認済み（base 由来）

本 promoted 成果物の生成時点（2026-09-15）での補足:

- 旧3コマンド名（req-save / design-save / case-update）の参照は PR #2820 で解消済み（src/opencode・docs/designs とも grep 0 件を再確認）。観測 2 の「design-save / req-save 系の保存先パス指示」に由来する baseline 検出も同時に解消された可能性があり、段階解消 case の対象選定時に baseline の再突合が必要

## 影響

- baseline 陳腐化エントリ・残置検出・配布物内部 concrete-id 参照が未解消のまま残り、IR-055 / 配布依存境界検査の残課題となっている

## 課題（対応候補と判断材料）

- 陳腐化エントリは次回 baseline 再生成（`--update-ir055-baseline`）時に除去する
- req-draft.md L118 の concrete-id（DEC-003）を、配布物として consumer 側で解決可能な一般化表現（契約名・節名参照等）へ置換する
- 段階解消 case の対象選定材料として baseline 突合結果を利用する。語彙選択時の検出器パターン事前突合（case 2766 で置換後語彙自体が検出パターンに該当した学び）を踏襓すること

## 既存要件との関連

- IR-055 baseline 運用: 残置検出の管理者
- 配布依存境界 gate（check_distribution_boundary.ts）: concrete-id 検出の正規検査
- DEC-003（soft contract）: 一般化対象の契約参照

## 根拠

- 観測元: PR 2792（case 2791・TS-009 IR-055 baseline 鮮度確認で検出）、PR 2767（case 2766・baseline 突合結果 90 → 83）、PR 2772（case 2771・case-close 最終 gate で検出）、それぞれ case-close（2026-09-13 / 2026-09-11 / 2026-09-11）で回収
- 処分経緯: intake-promote（2026-09-15）で同一運用系統と判定して統合し、採用を確定（統合・採用ともユーザー承認）
