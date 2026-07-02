# inspect-skills / inspect-promote SPEC の Step 番号表現形式統一

## 観測

PR #1326（SPEC ↔ command 定義 Step 番号オフセット解消、REQ-0143-004）の全 SPEC 照合において、`docs/specs/commands/inspect-skills.md` と `docs/specs/commands/inspect-promote.md` の「現在の動作」セクションは Step 番号を持たず、単純リスト表現で記述されている（対応する command 定義は Step 1-9, Step 1-10 を持つ）。これは表現形式の違いであり、Issue #1325 の対象（U2 ユーザー合意: 表現形式の統一は別件）から除外された。

ただし REQ-0143-004 の「Step 番号構成は一致すること」への適合という観点では、SPEC が Step 番号を持たないことは厳密には「一致確認不可」の状態である。表現形式統一を別途扱う際の入力とする。

## 根拠

PR #1326 本文 `## Findings / Capture候補`:

> - `docs/specs/commands/inspect-skills.md` と `docs/specs/commands/inspect-promote.md` の「現在の動作」セクションは Step 番号を持たず、単純リスト表現で記述されている（command 定義は Step 1-9, Step 1-10 を持つ）。これは表現形式の違いであり、本 Issue の対象（U2 ユーザー合意: 表現形式の統一は別件）から除外した。ただし REQ-0143-004 の「Step 番号構成は一致すること」への適合という観点では、SPEC が Step 番号を持たないことは厳密には「一致確認不可」の状態。表現形式統一を別 Issue で扱う際の入力とすること。

## 出処

- Issue: #1325
- PR: #1326
- work_type: docs_chore
- capture 元: case-close Step 10（PR 本文 `## Findings / Capture候補` セクションから分離回収）

## 想定対応

inspect-skills.md / inspect-promote.md の「現在の動作」セクションを Step 番号付き表現へ統一するか、あるいは REQ-0143-004 の適用対象（Step 番号構成を持たない記述形式）を明文化する。表現形式統一は別 Issue として扱う（U2 ユーザー合意）。
