---
title: "IR-075: ir-file-size"
status: accepted
created: "2026-11-18"
updated: "2026-11-18"
detection_method_class: machine-check
---

# IR-075: ir-file-size

巨大コマンド・スキル文書によるコンテキスト圧迫と指示遵守率低下（Lost in the Middle）を防ぐ
250 行上限の機械検査（DEC-065 決定5、REQ-122-011）。

本ルールの実装は Wave-4（REQ-122-011 の検証列 TS-011）で行う。本文書は Wave-2 における
新設文書準備であり、検出仕様を確定する。rules レジストリへの登録も Wave-4 で実施する
（Wave-2 時点のカタログは残存 24 構成を維持）。

## 検出対象

- AG-011 が列挙するコマンド・スキル文書（`src/common/commands/agentdev/**/*.md`、
  `src/common/skills/agentdev-*/SKILL.md`、`src/common/skills/agentdev-*/references/*.md`）

## 検出方法

1. 対象ファイルの YAML Frontmatter を含む総行数を算出する
2. 総行数が 250 行を超過する場合に違反とする
3. `**/references/**/*.md` は判定対象から除外する（DEC-065 決定5・AG-011）
4. バイト数のみの超過は違反としない（総行数 250 行超過が判定条件）
5. 違反メッセージには行数とバイト数の両方を出力する

## severity

strict（総行数の機械判定）

## exemption

- `**/references/**/*.md`（親 Design の補助資料。references/ 利用状況は DEC-065 決定5 の
  再評価条件として観察対象）
- YAML Frontmatter を含む総行数で判定するため、frontmatter 除外は行わない

## 関連

- Decision: `docs/decisions/DEC-065.md`（決定5）
- 関連 REQ: REQ-122-011（250行超過の巨大コマンド・スキル6ファイルの references/ 分割は REQ-122-012）
- 実装予定: `src/common/skills/repo-agentdev-integrity/rules/ir-075.ts`（Wave-4）
