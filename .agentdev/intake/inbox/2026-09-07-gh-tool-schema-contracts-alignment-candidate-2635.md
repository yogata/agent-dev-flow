---
id: intake-20260907-gh-tool-schema-contracts-alignment-candidate-2635
title: agentdev_gh Tool 表示スキーマ記述と契約型 contracts.ts の整合改善（issue_list labels・search 型、issue_create labels 必須性表示）
created: 2026-09-07
status: inbox
---

## 概要
- PR: #2646（Issue #2635・Epic #2633 Wave 1・OU-002 agentdev_gh Custom Tool 呼出制約4点の標準呼出形式化）
- 発見経路: case-close の Capture 回収（PR 本文「Findings / Capture候補」セクション由来）

## 内容

`agentdev_gh` の Tool 表示スキーマ記述と実契約型 `contracts.ts`（`GhToolRequest.issue_list` の `labels`・`search` パラメータ型、`issue_create` の `labels` 必須性表示）の間に整合改善の余地がある。Issue #2635 対象範囲の付帯情報区分に基づき別課題として区別されており、Tool 実装コード（READ-ONLY 境界）への変更は PR #2646 には含めなかった。PR 本文では課題化が提案されている。

## 変更候補

- `contracts.ts` の `GhToolRequest` 型と Custom Tool の表示スキーマ（description・parameter 定義）の差分を確認し、`issue_list` が role 単位列挙のみ受け付ける旨、`labels`・`search` が invalid-input になる旨を表示側に反映する
- `issue_create` の `labels` 必須性（ラベルなし時 `labels: []` 明示）を表示スキーマの required 定義・description へ反映するか検討する
- 変更は Tool 実装（`src/opencode/tools/agentdev-gh/`、`src/opencode/plugins/agentdev-gh-tool/`）に触れるため、READ-ONLY 境界と実装変更の区分を確認したうえで着手する

## 関連
- Issue #2635（クローズ済み。OU-002。完了条件の標準呼出形式反映は PR #2646 で実施済み）
- PR #2646（merge commit 0a7d30d7）
- `src/opencode/tools/agentdev-gh/contracts.ts`（GhToolRequest 型）
- Issue #2635 対応記録コメント（case-close・2026-09-07・Epic #2633）
