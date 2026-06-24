# DOC-MAP に SPEC status 追跡機構が不在

## 発生源

- Issue: #1113
- PR: #1123 (merged, squash)
- 発生日: 2026-06-24

## 観測

`docs/DOC-MAP.md` の全 SPEC テーブル（横断 SPEC / command SPEC / skill SPEC / 基盤 SPEC いずれも）に status 列が存在しない。SPEC lifecycle（ADR-0123）は draft / accepted を管理するが、DOC-MAP からは個別 SPEC の status が確認できない。skill SPEC セクション（DOC-MAP L103-108）は `specs/skills/` ディレクトリ配下（27件）へのポインタのみで個別 SPEC 行を持たない。

## 今回扱わない理由

#1113 のスコープは agentdev-gh-cli SPEC 本文の整合性確認と DOC-MAP 当該行の accepted 反映（AG-001/AG-002）。DOC-MAP 全体の構造変更（status 列新設）は別 Issue の検討対象。

## 影響

- SPEC lifecycle の進行が DOC-MAP から視認できず、draft SPEC の放置（今回の RU-0001 と同種）が再発する可能性がある。
- inspect-docs / docs-check が SPEC status を横断検査する際の参照元が DOC-MAP に存在しない。

## レビューで決めること

- DOC-MAP へ status 列を追加するか（全 SPEC テーブル構造変更）
- 代替として SPEC index（`docs/specs/README.md`）へ status 列を追加するか
- 機械検査（check_integrity.ts）へ SPEC status 一貫性ルールを追加するか

## 根拠

PR #1123 本文「Findings / Capture候補」セクションの intake 候補 #1。AG-002 検証時に DOC-MAP への accepted 反映箇所が存在しないことを検出。
