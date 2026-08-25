# OU-07 実行前提: ISL-001 の REQ-049-030 参照は docs/issue-list 削除で解消する

## 観測

トレーサビリティ check（case-run、case-close 独立再検査とも）で unknown-req-refs 1件（docs/issue-list/ISL-001.md の REQ-049-030 参照）が残存する。また bun test の tim_declarations_contract.test.ts が同一参照により fail 1件（RU-0001 AC-008）。ともに Wave 2 実装起因ではなく pre-existing。

## 今回扱わない理由

docs/issue-list/ の物理削除と ISL-001 移行起票は Epic 2436 の子Issue OU-07（Issue 2438、Wave 3）の担当スコープ。Wave 2 クローズ時点で解消しない（Wave 構成の責務境界維持）。

## 影響

OU-07 実行まで traceability check の unknown-req-refs 1件と bun test の fail 1件が継続する（いずれも対象要件行の完了判定には無影響、由来分類済み）。

## レビューで決めること

- なし（OU-07 は Epic の Wave 3 として実行予定。ISL-001 は REQ-049-018 の移行情報性質（現在有効な論点のみ）に従い移行起票する）

## 根拠

- PR 2441 本文「Findings / Capture候補」intake 2件目
- case-close トレーサビリティ独立再検査（.agentdev/tmp 証跡 close-w2-trace-req049.json、unknown-req-refs 1件）
