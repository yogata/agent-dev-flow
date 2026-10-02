# 廃止語彙「spec」の残存（ガイド + 正本 schema 一体・adversarial-review 実測補強）

- **分類**: inspect finding promote（F-11・severity low・confidence: finding 時点 low → review 実測で確定度上昇）
- **由来**: inspect-docs finding 20261002T154006Z（backlog-auto stage 1）。adversarial-review（inspect-promote STEP-5）での正本突合により defer から promote に変更

## 観測（evidence・review 中実測追加）

- `docs/guides/intake-learning-backlog-flow.md:86-87`「13項目形式で記録する。問題事象、発生局面、検知方法、根本原因、自律対応内容、ユーザー確認有無、**Decision/REQ/spec 影響**、横展開観点、再発条件、予防策候補、想定反映先、関連、タグ。」
- 正本側にも同語彙が残存（review 実測で発見）: `src/common/skills/agentdev-learning-pipeline/references/inbox-and-evaluation-schema.md:27`「**Decision/REQ/spec影響**: ...」、:58「ADR/REQ/spec影響」
- 「spec」は v3→v4 移行で Design に統合された廃止文書種別。REQ-038.md（Learning 要件の正契約）に「spec」の記述なし

## 影響課題

当初 finding は「REQ-038 正本との突合が必要」として confidence low だったが、review 中の実測で (a) REQ-038 は spec を使用しない、(b) ガイドの列挙は learning-pipeline schema（運用正本）に由来し、正本側自体が廃止語彙を維持している、が確定。ガイド単独でなく正本 schema を含む一括語彙是正が必要。

## 対応候補

- `src/common/skills/agentdev-learning-pipeline/references/inbox-and-evaluation-schema.md` :27/:58 の「spec」を現行文書種別体系（REQ/Decision/Design）へ更新
- `docs/guides/intake-learning-backlog-flow.md:87` の「Decision/REQ/spec 影響」を正本更新後の表現へ同期

## 既存要件関連

v4 文書種別体系（REQ/Decision/Design）が正。REQ-038（Learning 固有契約・spec 不使用）。

## 統合注記（backlog-review での統合判定候補）

- intake promoted `2026-10-02-3316`（用語掃除）と同主題系統。統合を backlog-review で判定。
- learning-promote 由来の用語掃除系 promoted が存在する場合も同様に統合判定候補。
