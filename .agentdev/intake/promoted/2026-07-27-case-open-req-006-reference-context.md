# case-open SPEC が参照する REQ-006-089/093 の文脈適合性確認

## 観測内容

`docs/specs/commands/case-open.md` L239-240 に `REQ-006-089` と `REQ-006-093` への参照が存在する。
該当箇所の文脈は「子Issue 本文案作成・検査・Issue 作成の並列化、Epic Issue 作成の直列集約」を記述している。
一方で正規定義 `docs/requirements/REQ-006.md`（L109 REQ-006-089: orchestration stage モデル、L113 REQ-006-093: bg task 破棄時回復）と、参照先の意味が一部ズレる可能性がある。
PR #1826 は case-open.md SPEC の精査をスコープ外として整理したため、参照妥当性は未確定のまま残置されている。

## 影響

実害は確認されていない。
ただし参照文脈と正規定義がズレている場合、SPEC 読者への誘導ミス、後続 spec-save での契約不整合の原因になり得る。
優先度は低〜中。直ちに実行時品質を損なうものではない。

## 課題

`docs/specs/commands/case-open.md` L239-240 の REQ-006-089/093 参照の意味論的再検討を inspect-docs または spec-save で実施する。
選択肢は下記のいずれか。
- 参照先を正規 REQ 定義へ修正（dangling 参照の場合）
- 参照を別の適切な REQ または SPEC 箇所へ置換（文脈が異なる場合）
- 参照を維持しつつ文脈注記を付与（意図的参照の場合）

## 既存要件との関連

- 対象 SPEC: `docs/specs/commands/case-open.md` L239-240
- 正規 REQ: `docs/requirements/REQ-006.md`（REQ-006-089 L109、REQ-006-093 L113）
- Issue: #1824（CLOSED/COMPLETED）
- Epic: #1821（CLOSED/COMPLETED）
- PR: #1826（Findings / Capture候補「intake 候補」）

## 出典

- inbox 元ファイル: `intake-2026-07-27-case-open-req-006-reference-context.md`
- 発生日: 2026-07-27
- PR: #1826（Issue #1824 / OU-003, Epic #1821 Wave 1）
