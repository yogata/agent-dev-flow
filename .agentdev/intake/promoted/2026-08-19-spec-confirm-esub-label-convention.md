# SPEC確定候補: E 系サブステップラベルの形式規約の明文化

## 観測内容

epic-wave-close.md は `STEP-E1〜E6` の独立ラベル空間を持ち、そのサブステップは `E4-1` 形式を用いる。command-file-format SPEC「順序ラベル様式」節は `STEP-N-M` 形式を規定するが、E 接頭辞系（Epic ルート）のラベル空間と `STEP-N-M` 規約の関係（`E4-1` を STEP-E4 のサブステップ M=1 と解釈するか、E 系を独立様式として例示するか）は明文でない。

PR #2264（Issue #2225）は E4-0 の振り直し判断と SPEC (a)(b)(c) の確認がスコープで、E 系ラベル規約の確定は別議論とされた。

## 影響

`E5b` のような lettered suffix 混在の判定根拠が SPEC に存在しない（様式例外の判定が属人的になる）。

## 課題（レビューで決めること）

- E 系ラベル空間と `STEP-N-M` 規約の関係の確定内容（E 系を独立様式として例示するか、STEP-E4-M 形式へ統一するか）
- 次回の様式関連 Issue での確定（PR 本文の推奨）を採用するか

## 既存要件・契約との関連

- command-file-format Design（docs/designs/authoring/command-file-format.md）「順序ラベル様式」節と epic-wave-close の STEP-E 系ラベル空間の整合。

## 根拠

- PR 2264 本文「SPEC確定候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2264 ）
