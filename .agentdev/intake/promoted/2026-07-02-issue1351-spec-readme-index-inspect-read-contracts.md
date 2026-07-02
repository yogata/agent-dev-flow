# docs/specs/README.md の command SPEC 一覧に inspect-read-contracts.md が未登録

## 観測内容

PR #1352 で新設した command SPEC `docs/specs/commands/inspect-read-contracts.md`（status: draft）が、SPEC status の単一追跡情報源である `docs/specs/README.md` の command SPEC 一覧表に登録されていない。`docs/specs/README.md` は PR #1352 の変更対象外であり、新規 SPEC 追加に伴う index 更新が漏れた。

## 影響

- `docs/specs/README.md` が SPEC status（draft / accepted）の単一追跡情報源（REQ-0154-001）であるため、未登録 SPEC は整合性検査で盲点となる
- IR-054（draft 放置検出）等の検査で未検出リスク

## 課題

- `docs/specs/README.md` の command SPEC 一覧表に `inspect-read-contracts.md`（status: draft、責務: `/agentdev/inspect-read-contracts`）の行を追加する
- 同種の「新規 SPEC 追加時に SPEC README index を更新する」手順が spec-save / case-close で明文化されているか確認する（REQ-0154-001 の更新タイミング記述との整合）

## 既存要件との関連

- REQ-0154-001: `docs/specs/README.md` を SPEC status（draft / accepted）の単一追跡情報源と定めている
- IR-054: draft 放置検出。index 未登録により盲点となる可能性

## 観測元

- Issue #1351（Project Read Contract Migration）
- PR #1352（squash merge 0002cee2）
- 新規 SPEC: docs/specs/commands/inspect-read-contracts.md
