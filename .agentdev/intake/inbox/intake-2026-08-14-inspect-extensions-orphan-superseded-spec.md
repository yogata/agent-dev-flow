# intake: inspect-extensions.md が孤児 superseded SPEC として残存（対応コマンド不存在）

## 発生日

2026-08-14

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2110（Issue 2100、OU-000 current-state inventory）の Findings / Capture候補 セクション

## 問題事象

`docs/specs/commands/inspect-extensions.md` は DEC-006 により superseded 済み（extension 検査は docs-check / inspect-skills / inspect-promote の3層責務分離へ移管）だが、16 Command のいずれにも対応するコマンドが存在しない孤児 SPEC として残存している。baseline commit `49f4db17` から存在し、`docs/specs/README.md` の一覧では superseded 登録済みの既知廃止文書である。

## 影響

- SPEC 一覧上は登録済みのため docs-check の登録漏れ検査には引っかからないが、superseded 文書の保持ポリシー（歴史参照として残置するか、アーカイブするか）が明示されていない
- remediation 移行 OU（OU-002 以降）での SPEC 同期対象選定時に孤児文書がノイズになる可能性

## 発生局面

検証（OU-000 baseline 抽出における両ソースファイル突合）

## 検知方法

全16 Command の Command SPEC（`docs/specs/commands/*.md`）と Command 定義（`src/opencode/commands/agentdev/*.md`）の突合（baseline commit `49f4db17` 時点、`git show 49f4db17:<path>` による抽出）。

## 想定される対応方向

- (a) superseded SPEC の歴史参照残置を DEC-013 AG-008 履歴担保原則の適用事例として明文化し現状維持する
- (b) アーカイブ運用（別ディレクトリ移動等）を導入する
- (a)/(b) の選定は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2100（OU-000）, PR: 2110
- 対象文書: `docs/specs/commands/inspect-extensions.md`（superseded、DEC-006 由来）
- 類似: `docs/specs/local/artifact-graph.md`（DEC-007 由来の superseded、歴史記述として false-positive 分類済み）

## 出典引用

PR 2110 本文 Findings / Capture候補（intake）より:

> `docs/specs/commands/inspect-extensions.md` は superseded 済みだが、16 Command のいずれにも対応するコマンドが存在しない孤児 SPEC として残存（baseline から存在。docs/specs/README.md の一覧では superseded 登録済みの既知廃止文書）。発見元: Issue #2100 baseline 抽出（両ソース ファイル突合）

## タグ

#intake #superseded-spec #orphan-document #inspect-extensions #epic-2099
