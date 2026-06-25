# frontmatter status なし SPEC への status 付与（REQ-0154 対象外の別課題）

## 発生源

- Issue: #1185（CLOSED, COMPLETED, case-close 完了）
- PR: #1188（merged, squash 54a1b47b）
- 発生日: 2026-06-26

## 内容

PR #1188 の Findings セクションで「REQ-0154 の対象外とした『frontmatter `status` なし SPEC の status 付与』は別課題。本 PR では SSoT 表で `-` 表示とし、放置検知の対象外とした（IR-054 設計通り）」と明記。

REQ-0154 が定めた SSoT（`docs/specs/README.md`）は SPEC frontmatter の `status` フィールドが存在する SPEC のみを追跡対象とし、frontmatter 自体がない、または frontmatter に `status` を持たない SPEC は SSoT 表で `-` 表示となる。IR-054 の draft 放置検出も frontmatter `status: draft` がある SPEC のみを対象とし、`status` なし SPEC は検出対象外。

現状、一部の古い SPEC またはメタデータ不備の SPEC が `status` なし（`-` 表示）で残存しており、これらの lifecycle 進行が視認・検出不可能。

## 推奨対応先

別 Issue として切り出すことを推奨。作業候補:

- frontmatter `status` なし SPEC の一覧を抽出（SSoT 表の `-` 表示エントリを機械的に収集）
- 各 SPEC の ADR-0123 lifecycle 上の位置（draft / accepted）を個別判定
- frontmatter `status` を付与する一括是正 PR、または個別 SPEC 改訂として扱うかの方針決定（RU 化候補）
- 一括是正後、IR-054 の検出対象が `status` なし SPEC を含むか（設計上は含まない）の取り扱いを改訂するか否かを SPEC 側で決定

## 現在の追跡状態

- PR #1188 SPEC確定候補: IR-054 閾値設計節は「見送り」（新規 SPEC ファイルの draft→accepted ライフサイクルイベントではなく、既存カタログへの規則追記のため）
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
- 本 intake の SPEC 確定候補: なし（frontmatter `status` 付与は SPEC 改訂ではなくデータ整備作業）

## 備考

REQ-0154-002 の AG-002 合意事項は「draft status の SPEC が放置されることを機械的検査で検出」であり、`status` なし SPEC の扱いは明示的に対象外。本 intake は REQ-0154 の対象範囲を逸脱するものではなく、REQ-0154 完了後に残された別課題として位置付けられる。
