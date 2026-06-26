# frontmatter status なし SPEC への status 付与

## 発生源

- Issue: #1185 (CLOSED, COMPLETED)
- PR: #1188 (merged, squash 54a1b47b)
- 発生日: 2026-06-26

## 観測内容

PR #1188 で「REQ-0154 の対象外とした『frontmatter `status` なし SPEC の status 付与』は別課題」と明記した。

REQ-0154 が定めた SSoT（`docs/specs/README.md`）は SPEC frontmatter の `status` フィールドが存在する SPEC のみを追跡対象とし、frontmatter 自体がない、または frontmatter に `status` を持たない SPEC は SSoT 表で `-` 表示となる。IR-054 の draft 放置検出も frontmatter `status: draft` がある SPEC のみを対象とし、`status` なし SPEC は検出対象外。

現状、一部の古い SPEC またはメタデータ不備の SPEC が `status` なし（`-` 表示）で残存しており、lifecycle 進行が視認・検出不可能。

## 影響

- `status` なし SPEC の lifecycle 進行（draft→accepted）が視認・検出不可能

## 課題

- frontmatter `status` なし SPEC の一覧を抽出（SSoT 表の `-` 表示エントリを機械的に収集）
- 各 SPEC の ADR-0123 lifecycle 上の位置（draft / accepted）を個別判定
- frontmatter `status` を付与する一括是正 PR、または個別 SPEC 改訂として扱うかの方針決定
- 一括是正後、IR-054 の検出対象が `status` なし SPEC を含むかの取り扱いを改訂するか

## 既存要件との関連

- REQ-0154-002（draft status の SPEC 放置検出、`status` なし SPEC は明示的対象外）
- IR-054（draft 放置検出、frontmatter `status: draft` のみ対象）
- ADR-0123（SPEC lifecycle）

## 対応方針候補

- データ整備作業として、`status` なし SPEC に status を付与する一括是正を実施する
