# Intake Item: case-open.md SPEC L239-240 の REQ-006-089/093 参照文脈ズレ確認

## 発生源

- PR: #1826 (Issue #1824 / OU-003, Epic #1821 Wave 1)
- 発生 phase: case-run pre-existing Phase 残渣・dangling REQ 整理時の副産
- capture 分類: intake（具体的修正対象、積み残し作業候補）

## 問題

`docs/specs/commands/case-open.md` L239-240 に「REQ-006-089」「REQ-006-093」参照があるが、その文脈（子Issue 本文案作成・検査・Issue 作成の並列化、Epic Issue 作成の直列集約）が、REQ-006-089（orchestration stage モデル）/ REQ-006-093（bg task 破棄時回復）の正規定義と一部ズレる可能性がある。

req-save / spec-save 工程の並列化契約は REQ-006-089〜093（case-auto orchestration stage モデル）とは別文脈（command SPEC 固有の並列化契約）かもしれず、単純な dangling 参照ではなく意味論的再検討が必要。本 PR（#1826）は case-open.md SPEC の精査をスコープ外として整理したため、別途確認を要する。

## 推奨修正対象

`docs/specs/commands/case-open.md` L239-240 の REQ-006-089, REQ-006-093 参照。

- 修正候補1: 参照先を正規 REQ へ修正（dangling 参照の場合）
- 修正候補2: 参照そのものを別の適切な REQ または SPEC 箇所へ置換（文脈が異なる場合）
- 修正候補3: 参照を維持しつつ文脈注記を付与（意図的参照の場合）

## 推奨対応

別 inspect-docs / spec-save で case-open.md SPEC L239-240 の参照妥当性を精査し、上記いずれの修正候補が適切か判断する。本 PR スコープ外（case-open.md SPEC は別 Issue で精査すべき）のため、本 intake 経由で次工程へ委ねる。

## 関連

- references: docs/specs/commands/case-open.md (L239-240)
- 正規 REQ: docs/requirements/REQ-006.md (L109 REQ-006-089, L113 REQ-006-093)
- Issue: #1824 (CLOSED/COMPLETED), Epic: #1821 (CLOSED/COMPLETED)
- PR: #1826 (Findings / Capture候補 セクション「intake 候補」)
