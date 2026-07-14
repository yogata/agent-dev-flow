---
title: inspect-docs 検出事項 promote（意味整合性）
source_finding: inspect-docs-finding-20260715-081722.md
classified_at: 2026-07-15
classification: promote
---

# inspect-docs 検出事項 promote 成果物

## 成果物群

- **F-01: DRIFT — docs/README.md REQ件数不整合**
  - docs/README.md L6 に「REQ-0101 から REQ-0160 までの 51 件」と記載。実際は53件（〜REQ-0162）。UPDATE。
- **F-02: DRIFT — DOC-MAP.md REQ/SPEC 未掲載**
  - DOC-MAP.md に REQ-0161, REQ-0162 未掲載。3 SPEC（harness-separation-model, responsibility-boundary-purification, spec-health-metrics）未掲載。UPDATE。
- **F-03: DRIFT — REQ-0157 不在（存在しないファイルへの参照）**
  - REQ-0161-001 と REQ-0144 が存在しない `docs/requirements/retired/REQ-0157.md` を参照。UPDATE。
- **F-04: MOVE — REQ-0158 Phase 1-6 実装計画の要件本体残留**
  - REQ-0158.md L176-210 に Phase 1-6 実装計画、スキーマフィールド列挙、SPEC配置計画が残留（SPEC分離基準違反、シグナル3）。MOVE。
- **F-06: MOVE — 配布物 ID 汚染（内部IDの配布物残留）**
  - src/opencode/ 配下19ファイルに37件以上の内部ID（REQ-XXXX, ADR-XXXX, IR-XX）が本文行に残留。MOVE。
- **F-07: UPDATE — 配布物 壊れた括弧（ID除去残骸）**
  - src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md L121 に `（/ 005）`（ID除去残骸）。UPDATE。

## 詳細

### F-01: DRIFT — docs/README.md REQ件数不整合

- **対象**: docs/README.md L6
- **根拠**: 「REQ-0101 から REQ-0160 までの 51 件」と記載。実際は REQ-0101〜REQ-0162 の 53 件。REQ-0161（config.yaml削除）、REQ-0162（配布物ハーネス境界浄化）が追加された際にインデックスが未更新。requirements/README.md は「53件」と正しく記載。
- **確信度**: high
- **推奨アクション**: UPDATE（docs/README.md の REQ 件数と範囲を 53 件 / REQ-0162 までに修正）

### F-02: DRIFT — DOC-MAP.md REQ/SPEC 未掲載

- **対象**: docs/DOC-MAP.md
- **根拠**: (1) 現行 REQ 表が REQ-0160 まで（51件）。REQ-0161, REQ-0162 が未掲載。(2) 基盤 SPEC 表に3件の未掲載 SPEC: `foundations/harness-separation-model.md`（draft, REQ-0162, ADR-0136）、`responsibilities/responsibility-boundary-purification.md`（accepted, ADR-0136）、`quality/spec-health-metrics.md`（accepted, REQ-0156-007）。specs/README.md には登録済み。
- **確信度**: high
- **推奨アクション**: UPDATE（DOC-MAP.md に REQ-0161/0162 と3 SPEC を追加）

### F-03: DRIFT — REQ-0157 不在（存在しないファイルへの参照）

- **対象**: REQ-0161（L12,22,23,25,41）、REQ-0144（L50）
- **根拠**: REQ-0161-001 が `docs/requirements/retired/REQ-0157.md` を削除対象として明記。REQ-0144 の broken-reference リストにも REQ-0157 を含む。しかし `docs/requirements/retired/REQ-0157.md` は存在しない。REQ-0157 は現行にも廃止にも存在しない。
- **確信度**: high
- **推奨アクション**: UPDATE（REQ-0161, REQ-0144 から REQ-0157 への参照を削除または「削除済み」に修正）

### F-04: MOVE — REQ-0158 Phase 1-6 実装計画の要件本体残留

- **対象**: docs/requirements/REQ-0158.md L176-210
- **根拠**: SPEC分離基準違反シグナル3種: (1) Phase番号残留（Phase 1〜6）, (2) スキーマフィールド列挙（TargetedDocsReport必須フィールドリスト）, (3) SPEC配置計画。
- **確信度**: high
- **推奨アクション**: MOVE（Phase 1-6 計画を SPEC または移行ドキュメントへ移送）

### F-06: MOVE — 配布物 ID 汚染（内部IDの配布物残留）

- **対象**: src/opencode/commands/agentdev/（7ファイル）、src/opencode/skills/agentdev-*/（12ファイル）
- **根拠**: 内部ID（REQ-XXXX-XXX, ADR-XXXX, IR-XX）が配布物本文行にトレーサビリティ注記として残留（OU-009 原則違反）。37件以上。主な検出: case-run.md（12件）、case-auto.md（4件）、case-close.md（3件）、req-save.md（4件）、spec-save.md（3件）、case-run-execution-adapter（4件）等。
- **確信度**: high
- **推奨アクション**: MOVE（内部IDを機能的記述へ置換）

### F-07: UPDATE — 配布物 壊れた括弧（ID除去残骸）

- **対象**: src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md L121
- **根拠**: `（/ 005）` — 全角括弧内がスラッシュと数字のみ。内部ID除去後の残骸。
- **確信度**: high
- **推奨アクション**: UPDATE（壊れた参照を修復または除去）
