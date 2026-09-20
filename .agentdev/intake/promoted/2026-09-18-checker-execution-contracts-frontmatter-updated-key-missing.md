# checker-execution-contracts.md frontmatter の updated キー欠落（修復候補）

## 観測

`docs/designs/integrity/checker-execution-contracts.md` の frontmatter L5 が ` 2026-09-17` の日付のみの行であり、`updated:` キーが欠落している（`created: 2026-08-15` の直後にキーなしで日付が存在）。

```
---
title: checker 実行契約と検出基盤規則
status: accepted
created: 2026-08-15
 2026-09-17
---
```

`docs/designs/foundations/patterns.md` L63「Design frontmatterは`title`、`status`、`created`、`updated`を基本とする」に違反する実欠陥である。2026-09-20 時点の現行 main（87d7c6a8）で現存を確認済み。

## 影響

- frontmatter パーサ系（docs-check 系 validator、Design インデックス status 集約、IR-054 の frontmatter 欠落扱い判定等）が `updated` を読めない可能性がある。
- 同種の frontmatter キー欠落を機械検出する checker 観点が存在しない（Knowledge frontmatter には `REQUIRED_FRONTMATTER_FIELDS`（`title`、`created`、`updated`）による必須性機械判定が既存だが、Design frontmatter への等価適用はない）。

## レビューで決めること

- L5 を `updated: 2026-09-17` へ修復する修正の実施（1 行のキー復元）。
- Design frontmatter の必須キー構造（`title` / `status` / `created` / `updated`）を検証する checker 観点の追加要否（既存 Knowledge frontmatter 機械判定の Design への拡張可否を含む）。観点追加は検討事項であり、採用判断は backlog-review 以降の正規経路が所有する。

## 根拠

- case-open Case #2954 / Definition PR #2955 の実行中に ACT-DESIGN-003 適用時の edit ツール fail-closed 検証で検出（2026-09-18、case-auto stage 1 委譲実行）。当該 Case の draft artifact_actions 対象外のため Definition PR では未修復。
- 発見時 canonical commit: f8ba612e。現行 main（87d7c6a8、2026-09-20 grep・read 検証）でも同一状態。

## intake-promote 確定注記（2026-09-20、adversarial-review 実施済み）

本 item は intake-promote の対論型レビューを経て「採用」で自律確定した。主要根拠: 現行 main 実ファイルで L5 欠陥が現存すること、および patterns.md L63 が Design frontmatter の `updated` を基本フィールドとして規定していることの 2 重根拠により、ユーザー承認済み処分方針「v4 で有効 → promote」の適用が自明であるため（HITL 不要）。checker 観点追加要否は本 item の分類確定を左右しない検討事項として成果物に含め、採用判断は backlog-review へ委譲する。
