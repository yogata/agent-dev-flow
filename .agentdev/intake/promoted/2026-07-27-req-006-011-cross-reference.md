# REQ-006 から REQ-011 への相互参照

## 観測内容

REQ-011-017 は external execution boundary を正規所有し、REQ-011-018 は harness execution mechanism を AgentDevFlow の規範所有対象外と定める。
責務境界 SPEC では REQ-006 と REQ-011 の関係が確立されたが、`docs/requirements/REQ-006.md` の目的節と対象外節には REQ-011 への導線がない。
TS-005 は既存参照が削除されていないという保存解釈で PASS したため、新しい関係の欠落は検出対象外だった。

## 影響

REQ-006 の読者が external execution boundary と harness execution mechanism の正規所有位置を追跡しにくい。

## 課題

SPEC で確立した責務関係を REQ 間の参照へ反映する必要がある。

## 既存要件、仕様との関連

- `docs/requirements/REQ-006.md` の目的節と対象外節
- REQ-011-017
- REQ-011-018
- `docs/specs/responsibilities/responsibility-boundary-purification.md` L66、L72-74
- RU-0025

## 対応方向

REQ-006 の目的節または対象外節へ、二つの用語の正規所有者が REQ-011 であることを追記する。
REQ-006-089 の補完と同じ req-save UPDATE で処理できる。

## 発生源

PR #1827、Issue #1822、Epic #1821 Wave 1 の TS-005 検証。
