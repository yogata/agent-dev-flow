# checker-execution-contracts.md frontmatter の updated キー欠落

## 対象

`docs/designs/integrity/checker-execution-contracts.md` の frontmatter（L5）。

## 観測された不整合

L5 が ` 2026-09-17` の日付のみの行であり、`updated:` キーが欠落している（`created: 2026-08-15` の直後にキーなしで日付が存在）。

```
---
title: checker 実行契約と検出基盤規則
status: accepted
created: 2026-08-15
 2026-09-17
---
```

## 発見経路と証跡

- case-open Case #2954（Definition PR #2955）の実行中、ACT-DESIGN-003 適用時の frontmatter updated 更新を試みた際に `updated:` 行が実在しないことを検出（edit ツールの fail-closed 検証が不一致を検知）。
- main 由来の事前存在欠陥であることを `git show main:docs/designs/integrity/checker-execution-contracts.md` で確認（main f8ba612e 時点で同一状態）。
- 本欠陥は Case #2954 の draft artifact_actions の対象外であるため Definition PR では修復していない。

## 影響候補

- frontmatter パーサ（docs-check 系 validator、Design インデックス status 集約、IR-054 の frontmatter 欠落扱い判定等）が `updated` を読めない可能性。
- 同種の frontmatter キー欠落を機械検出する checker 観点の欠如の可能性（validator 観点の追加候補）。

## 提案（修正候補）

- L5 を `updated: 2026-09-17` へ修復する（キー復元）。
- frontmatter の必須キー構造（title / status / created / updated）を検証する checker 観点の追加要否を検討する。

## 出典

- case-open Case #2954 / Definition PR #2955 の検証差分（2026-09-18、case-auto stage 1 委譲実行）
- 発見時の canonical 基準 commit: f8ba612e
