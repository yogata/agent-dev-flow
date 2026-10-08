# REQ-031-027 と REQ-034-043 の Wave 内重複検出語彙の統合要否を判断する

統合元: 2026-10-07-case-3534-req-lexical-diff-031-034.md

## 観測内容

実行時の Wave 内重複検出の対象語彙が REQ 間で分かれている。

- REQ-031-027（docs/requirements/REQ-031.md:45）: 「同一 Wave 内の変更対象ファイル重複の実行時検出は case-auto の stage 3 実行制御が所有」（旧語彙「変更対象ファイル重複」）
- REQ-034-043（docs/requirements/REQ-034.md:59）: 「stage 3 の委譲前に同一 Wave 内の子 Issue 間で主な変更対象（子 Issue が実行単位として所有する宣言）の重複を実行時検出」（新語彙）

実装側は Wave 2-2（Issue 3534・merge 336095b6）で REQ-034-043 語彙へ統一済み（src/common/skills/agentdev-workflow-case-auto/references/execution-structure.md:21「主な変更対象（子 Issue が実行単位として所有する宣言）の重複を前置検出」、回帰テスト wave-composition-purity.test.ts も追随済み）。両 REQ とも case-auto stage 3 の所有を述べており、契約の実体は同一で語彙のみが乖離している。2026-10-08 時点で REQ-031-027 の旧語彙は残存（実測確認済み）。

## 影響

同一概念が REQ 間で異なる語彙のまま残るため、以後の同種の語彙整合変更が REQ 間差を生み続ける。REQ 変更を伴うため対象 Case（Issue 3534）では解消できなかった。今後 REQ-031 を参照する変更のたびに旧語彙が引用され続ける。

## 課題（backlog-review → req-define 向け）

REQ-031-027 側の語彙を REQ-034-043 語彙（主な変更対象（子 Issue が実行単位として所有する宣言）の重複）へ統一する REQ 変更の要否を判断する。語彙統合、または語彙差の意味（ファイル単位の実測比較 vs 宣言単位の前置検出といった判定粒度の違い）を明記して維持するかのいずれか。

REQ-031-027 の後段「変更対象集合が取得不能な場合は比較を省略せず検出不能として報告する責務を維持すること」は取得不能時の fail-closed 契約として独立の価値を持ち、統合時も保持する。

## 既存成果物との関連

- 回帰テスト pin の対称性: Wave 2-2 の語彙変更で case-ready-definition-readiness.test.ts の REQ-061-019 pin は追随済み（65 pass 実測）。REQ-031-027 を変更する場合は REQ-031 を pin 参照するテストの同時更新を要する
- learning promoted「traceability-gate-missing-design-status」とは別論点（本件は REQ 間語彙、learning 側は gate 判定粒度）

## 元 observation（参照）

- https://github.com/yogata/agent-dev-flow/pull/3540（Wave 2-2・Issue 3534・RA-002 Findings）
