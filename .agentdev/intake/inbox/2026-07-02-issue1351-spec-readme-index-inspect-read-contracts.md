# docs/specs/README.md の command SPEC 一覧に inspect-read-contracts.md が未登録

## 観察

PR #1352 で新設した command SPEC `docs/specs/commands/inspect-read-contracts.md`（status: draft）が、SPEC status の単一追跡情報源である `docs/specs/README.md` の command SPEC 一覧表に登録されていない。`docs/specs/README.md` は PR #1352 の変更対象外であり、新規 SPEC 追加に伴う index 更新が漏れた。

REQ-0154-001 は `docs/specs/README.md` を SPEC status（draft / accepted）の単一追跡情報源と定めている。本 index に登録されない SPEC は status 追跡対象から漏れ、IR-054（draft 放置検出）等の整合性検査でも盲点となる。

## 修正されなかった理由

case-close Step 3-1（close 時 SPEC/commands/skills 更新漏れの局所確認）で検出したが、PR #1352 は既に squash merge 済みであり、PR スコープを拡張して index 登録を加えるには PR 再 push が必要になる。case-close の責務は機械的完了処理であり、PR 実装内容の拡張は case-close の範囲外（実装変更は case-run / driver の責務）。そのため本項を intake として記録し、後続の別 Issue で扱う。

## 課題

- `docs/specs/README.md` の command SPEC 一覧表に `inspect-read-contracts.md`（status: draft、責務: `/agentdev/inspect-read-contracts`）の行を追加する
- 同種の「新規 SPEC 追加時に SPEC README index を更新する」手順が spec-save / case-close で明文化されているか確認する（REQ-0154-001 の更新タイミング記述との整合）

## 根拠

case-close Step 3-1 検査（2026-07-02）:

```
=== inspect-read-contracts in SPEC README? ===
0
=== check other inspect commands registered (sanity) ===
1   # inspect-promote は登録済み
=== is docs/specs/README.md in PR? ===
    # PR files に含まれない（空）
```

新規 SPEC ファイル `docs/specs/commands/inspect-read-contracts.md` は存在し frontmatter status: draft を持つが、index 表には行がない。

## 観測元

- Issue #1351（Project Read Contract Migration）
- PR #1352（squash merge 0002cee2）
- 新規 SPEC: docs/specs/commands/inspect-read-contracts.md
