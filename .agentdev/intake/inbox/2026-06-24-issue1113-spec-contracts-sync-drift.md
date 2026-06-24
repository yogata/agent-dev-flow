# SPEC 操作契約テーブルと contracts.md の同期漏れ

## 発生源

- Issue: #1113
- PR: #1123 (merged, squash)
- 発生日: 2026-06-24

## 観測

`docs/specs/skills/agentdev-gh-cli.md` の操作契約テーブルは `references/contracts.md` の要約であるが、Issue close 操作の `close 理由` 列が SPEC のみ欠落していた（contracts.md 行74、標準版 SKILL.md 行42 には存在）。#1123 で SPEC 側を補正したが、両者の同期を保つ機構が存在しない。

## 今回扱わない理由

#1113 のスコープは SPEC 本文補正（2件）。同期機構の恒久化は別 Issue の検討対象。

## 影響

- contracts.md 更新時に SPEC 操作契約テーブルの追従漏れが再発するリスクがある。
- inspect-skills 検査が SPEC ↔ references 間のフィールド欠落を検出対象としていない（現在はファイル参照妥当性中心）。

## レビューで決めること

- inspect-skills 検査対象へ「SPEC 操作契約テーブル ↔ contracts.md フィールド一致」を追加するか
- contracts.md と SPEC テーブルの単一情報源化（一方を生成元にする等）を検討するか

## 根拠

PR #1123 本文「Findings / Capture候補」セクションの intake 候補 #2。AG-001 検証中に SPEC テーブルと contracts.md のフィールド不一致を検出。
