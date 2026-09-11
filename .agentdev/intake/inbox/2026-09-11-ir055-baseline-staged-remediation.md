# IR-055 baseline 段階解消の残課題（対象選定材料）

## 概要

IR-055 baseline 残置 83 検出（34 ファイル）が段階解消の残課題。case 2766（配布物内部参照の一般化・是正）で worktree-operations.md 7 件を完遂し、baseline 突合結果（90 → 83）まで確認済み。次回段階解消 case の対象選定材料として利用可能。

## 内容

- 特に `docs/designs/` 参照 45 行は Design 名＋節名表現への機械的置換が見込まれる
- 一方、design-save / req-save 等 workflow コマンドの保存先パス指示は動作仕様記述であり、一般化の方針を要する（機械的置換では不十分）
- case 2766 の一般化置換では、置換後の語彙自体が検出パターン（`repo-*` 等）に該当し新規違反になる事例が 1 件あった（学び inbox にも記録済み）。次回 case では語彙選択時の検出器パターン突合を事前に実施すること

## 根拠

- 観測元: PR 2767（case 2766 / issue 2766、`## Findings / Capture候補` intake セクション）、case-close（2026-09-11）で回収
- 元テキスト: 「IR-055 baseline 残置 83 エントリ（35 ファイル）が段階解消の残課題。特に `docs/designs/` 参照 45 行は Design 名＋節名表現への機械的置換が見込まれる一方、design-save / req-save 等 workflow コマンドの保存先パス指示は動作仕様記述であり一般化の方針を要する。次回段階解消 case の対象選定材料として本 PR の baseline 突合結果（90 → 83、worktree-operations.md 7 件完遂）を利用可能」
- 補足（case-close 再検証時の実測）: baseline ファイルは 47 → 43 エントリ（検出インスタンス数 90 → 83、対象ファイル 35 → 34）。PR 本文の「35 ファイル」は解消前（main 時点）の値
