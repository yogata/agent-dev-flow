# DOC-MAP に SPEC status 追跡機構が不在

## 観測内容

`docs/DOC-MAP.md` の全 SPEC テーブル（横断 SPEC / command SPEC / skill SPEC / 基盤 SPEC いずれも）に status 列が存在しない。
SPEC lifecycle（ADR-0123）は draft / accepted を管理するが、DOC-MAP からは個別 SPEC の status が確認できない。
skill SPEC セクション（DOC-MAP L103-108）は `specs/skills/` ディレクトリ配下（27件）へのポインタのみで個別 SPEC 行を持たない。

## 影響

- SPEC lifecycle の進行が DOC-MAP から視認できず、draft SPEC の放置（RU-0001 と同種）が再発する可能性がある
- inspect-docs / docs-check が SPEC status を横断検査する際の参照元が DOC-MAP に存在しない

## 課題

DOC-MAP または SPEC index で SPEC status を追跡可能にし、draft 放置を機械的に検出する。

## 既存要件との関連

- Issue #1113、PR #1123（merged, squash）
- ADR-0123（SPEC lifecycle: draft / accepted）
- RU-0001（draft 放置の先例）
- 候補 SPEC: `docs/DOC-MAP.md`、`docs/specs/README.md`

## 対応方針の方向性

- DOC-MAP へ status 列を追加する（全 SPEC テーブル構造変更）
- 代替として SPEC index（`docs/specs/README.md`）へ status 列を追加する
- 機械検査（`check_integrity.ts`）へ SPEC status 一貫性ルールを追加する
