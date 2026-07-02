# inspect-skills / inspect-promote SPEC の Step 番号表現形式統一

## 観測内容

PR #1326（SPEC ↔ command 定義 Step 番号オフセット解消、REQ-0143-004）の全 SPEC 照合において、`docs/specs/commands/inspect-skills.md` と `docs/specs/commands/inspect-promote.md` の「現在の動作」セクションは Step 番号を持たず、単純リスト表現で記述されている（対応する command 定義は Step 1-9, Step 1-10 を持つ）。REQ-0143-004 の「Step 番号構成は一致すること」への適合という観点では、SPEC が Step 番号を持たないことは厳密には「一致確認不可」の状態である。

## 影響

- SPEC と command 定義間で Step 番号表現形式が不一致
- REQ-0143-004 の「Step 番号構成は一致すること」への適合確認ができない状態

## 課題

- inspect-skills.md / inspect-promote.md の「現在の動作」セクションを Step 番号付き表現へ統一するか、REQ-0143-004 の適用対象（Step 番号構成を持たない記述形式）を明文化する
- 表現形式統一は別 Issue として扱う（U2 ユーザー合意）

## 既存要件との関連

- REQ-0143-004: SPEC ↔ command 定義の Step 番号オフセット解消、Step 番号構成は一致すること
- 本 item は `2026-06-28-req0143-004-ir044-exemption-boundary.md` と同じ REQ-0143-004 に関連し、統合推奨

## 観測元

- Issue #1325
- PR #1326
- work_type: docs_chore
