---
title: "IR-071: integrity-rule-related-req-existence"
status: accepted
created: 2026-09-24
updated: 2026-09-24
---

# IR-071: integrity-rule-related-req-existence

| Field | Value |
|-------|-------|
| rule_id | IR-071 |
| description | integrity rules（`docs/designs/integrity/rules/IR-*.md`）の related_req フィールドに記述された参照先 REQ の実在性を機械検査する。IR-067（docs 本文の REQ 行引用実在性）は isIntegrityRuleDescriptionFile で rules/IR-*.md 自身を免除するため IR frontmatter related_req は検出盲点であり、IR-055 のファントム参照（REQ-002-079/080/081）の再発防止として導入した（REQ-051-009） |
| severity | strict |
| category | document-drift |
| detection_method | `check_integrity.ts`（`checkIntegrityRuleRelatedReqExistence`）による走査。related_req の抽出は `generate_indexes.ts` `collectIrFiles`（IR-061 形式 frontmatter 優先、Field/Value 表 fallback）を再利用し、rule-ownership.md AUTOGEN 派生表（Related REQ 列）と単一情報源を維持する。実在性判定: 階層 ID（`REQ-NNN-NNN`）は IR-067 `buildReqRowIndex`（現行 + retired 要件行テーブル）、ファイルレベル ID（`REQ-NNN`）は `docs/requirements/REQ-NNN.md`（現行または retired）の存在で判定する |
| affected_artifacts | [docs/designs/integrity/rules/IR-*.md] |
| related_req | [REQ-051-009] |
| related_design | [../integrity-rule-catalog.md, ../checker-execution-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。検出対象を related_req フィールド値の ID 形式トークンに限定するため、ルール本文の例示 ID は検出しない。v2: プレフィックス付きは歴史識別子（IR-049 `v2:REQ-0143` 等の前例）として免除する。ID 形式に一致しない記述（注記セル `-（…）`、親 ID 省略形 `039`、プレースホルダー `REQ-010-NNN`）は検出対象外とする |
| regression_test | `check_integrity.test.ts` describe "IR-071 integrity-rule-related-req-existence (REQ-051-009)"。正常例（実在階層 ID・ファイルレベル ID）・違反例（ファントム階層 ID・ファントムファイルレベル ID）・境界例（v2: プレフィックス免除・注記セル・省略形）・再現例（IR-055 再アンカー後の related_req `[REQ-029-003]` 型実在行参照が誤検知しない）の fixture |
| finding_route | intake |
| triage_action | 新規検出時は当該 IR rule ファイルの related_req を実在する REQ 行または REQ ファイルへ再アンカーする（IR-055 再アンカー REQ-029-003 の前例）。要件行が削除済みの場合は参照の意図を確認し、後継要件行への付け替えまたは削除する |
| last_verified | 2026-09-24 |

## 検査項目

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | related_req フィールドの階層 ID（`REQ-NNN-NNN`）が docs/requirements の要件行テーブル（現行または retired）に実在すること | strict fail |
| 2 | related_req フィールドのファイルレベル ID（`REQ-NNN`）が docs/requirements の REQ ファイル（現行または retired）として実在すること | strict fail |
| 3 | related_req の抽出方法が rule-ownership.md AUTOGEN 派生表（`generate_indexes.ts`）と同一であること（単一情報源） | 設計要件 |

## exemption（許容条件）

| 対象 | 理由 |
|------|------|
| `v2:REQ-NNN-NNN` / `v2:REQ-NNN` プレフィックス付き | 歴史識別子（旧番号帯の正規参照形式、IR-067 v2: 許容と同一） |
| ID 形式に一致しない記述（注記セル `-（要件行レベルの正規所有者なし…）`、親 ID 省略形 `039` 等） | REQ ID として解決不能な記述は実在性判定の対象外（注記は rule-ownership 派生表の表示も継承） |
| プレースホルダー様式例示（`REQ-010-NNN` 等の非数字形式） | 正規表現上マッチしない（REQ-010-065 許容条件準拠） |
| related_req 未記述・空配列の IR | 実在性検査の対象フィールドが存在しない（IR-061 の `-` セル等） |

## baseline 運用

本ルールは strict で即時 fail とする（baseline 不要）。導入時点（REQ-051-009、Case #3119）で既知のファントム参照は IR-055 の再アンカー（fix → 検査導入の順序、CR-003）により解消済みであるため、導入直後の自己適用で既存違反は発生しない設計である。

## See Also

- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [rule-ownership.md](../rule-ownership.md)
- [IR-067-referenced-req-row-existence.md](IR-067-referenced-req-row-existence.md)（docs 本文側の REQ 行引用実在性検査。本ルールは IR frontmatter related_req 特化）
