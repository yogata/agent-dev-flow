# thin Command の workflow 節順序ラベル様式の authoring 基準欠落

## 観測内容

thin Command の workflow 節における順序ラベル様式（`### Step N` / `STEP-N` / `工程-N` の3変種）が 16 Workflow Skill で混在しており、統一基準や記述量基準が authoring/command-file-format.md へ反映されていない。

## 影響

- 新規 Command/Skill 作成時に様式選択が属人的判断に委ねられる
- 機械検査・横断参照の前提が定まらない

## 課題

順序ラベル様式の統一基準または使い分け基準を authoring/command-file-format.md へ規定する。既存16 Workflow Skill の3変統の扱い（統一 or 使い分け許容）も併せて決定する。

## 既存要件・成果物との関連

- 対象: docs/specs/authoring/command-file-format.md
- 関連: 16 Workflow Skill、agentdev-command-authoring

## 出典

- 発生日: 2026-08-15
- 取得元: authoring 観点の診断・観測
- 元 item: intake-2026-08-15-command-workflow-order-label-style-authoring.md
