# REQ-006-089 の case-run internal lifecycle 非複製明記

## 観測内容

REQ-006-089 は case-auto の orchestration stage モデルを定めるが、case-run internal lifecycle を複製しないことを明記していない。
TS-002 の pass criteria は明示記載を要求する。
非複製原則は責務境界 SPEC と配布 command に存在するため機能的欠陥ではないが、正規 REQ 所有位置が自己完結していない。

## 影響

REQ-006-089 だけを読んだ場合、case-auto と case-run の責務境界を確認できない。

## 課題

SPEC と配布 command にある非複製原則を正規 REQ へ反映する必要がある。

## 既存要件、仕様との関連

- `docs/requirements/REQ-006.md` の REQ-006-089
- `docs/specs/responsibilities/responsibility-boundary-purification.md` L78-79
- PR #1827、Issue #1822、Epic #1821

## 対応方向

REQ-006-089 の orchestration stage 契約へ「case-run internal lifecycle を複製しないこと」を追記する。
REQ-011 相互参照の補完と同じ req-save UPDATE で処理できる。

## 発生源

PR #1827 の TS-002 検証。
