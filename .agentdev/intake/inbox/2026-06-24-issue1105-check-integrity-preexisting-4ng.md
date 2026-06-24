# check_integrity.ts の既存 4 NG（本スコープ外）が docs-check ノイズとして残留

## 発生源

- Issue: #1105
- PR: #1108 (merged, squash 1fc14a18)
- 発生日: 2026-06-24

## 観測

`bun run check_integrity.ts --json` の出力に 4 件の NG が安定して存在する。PR #1108 の SPEC 変更前後で ok 294 / ng 4 / warning 10 は同一（リグレッションなし）。

検出されている 4 NG:

1. case-run-execution-adapter reference path
2. japanese-tech-writing skill prefix
3. project-docs-and-specs REQ 範囲表記
4. case-close duty keyword

## 今回扱わない理由

PR #1108 のスコープは docs-check / command file format SPEC 周辺の未確定設計論点 3 件（AG-001〜AG-003）と AG-004（ADR-0113 切り出し）の境界確定であり、実装ファイル（`.ts`）の変更を含まない。既存 4 NG は AG-001〜AG-004 のいずれにも該当せず、本 PR が対応すべき対象ではない。E2E 検証で「変更前同一」を確認済みで、本 PR 由来のリグレッションではない。

## 影響

docs-check 出力に継続的に 4 件の NG が現れ、新規 SPEC 変更時のリグレッション検出ノイズとなる。本来 ok 判定すべき PR の CI で NG が混在するため、人手で pre-existing か新規かを判別する負荷が発生する。

## レビューで決めること

- 既存 4 NG を REQ-0144（docs-check/integrity 運用是正）のスコープとして個別 Issue 化するか
- 4 NG それぞれを是正するか、検出ルール側を調整するか（false positive 判定）
- pre-existing NG を docs-check 出力で除外・マークする仕組みを導入するか

## 根拠

PR #1108 本文「Findings / Capture候補」セクションの intake 候補（REQ-0144 スコープとして言及）。同 PR の E2E 検証結果: `bun run check_integrity.ts --json` → ok 294 / ng 4 / warning 10（変更前同一）。
