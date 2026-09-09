---
title: "IR-065: obsolete-vocabulary-current-use"
status: accepted
created: 2026-08-22
updated: 2026-09-09
---

# IR-065: obsolete-vocabulary-current-use

| Field | Value |
|-------|-------|
| rule_id | IR-065 |
| description | 現行概念として使用される廃止語彙（旧 ADR 表記等）を検出する。対象は bare `ADR-NNN` 識別子（v2: プレフィックスなし）、`docs/adr/` パス、`（ADR）` 種別注記、`REQ/ADR/` 種別列挙、`Artifact Graph` 呼称、`DOC-MAP` 呼称。許容された歴史的識別子（`v2:ADR-0123` 等）は誤検出しない（REQ-010-066） |
| severity | heuristic（`（ADR）` 注記は strict） |
| category | obsolete-structure |
| detection_method | `check_integrity.ts` による行単位走査。検出パターンはスクリプト内 `IR065_VOCAB_PATTERNS` 定数、許容条件の運用データ（existence_probe、exemption_files、否定文脈語）は `data/obsolete-vocabulary-map.yaml` が宣言する |
| affected_artifacts | [docs/designs/**, docs/requirements/*.md, docs/decisions/*.md, docs/guides/*.md, src/opencode/**, .opencode/commands/**, .agentdev/extensions/**]（詳細は yaml scope） |
| related_req | [REQ-010-066, REQ-010-068] |
| related_design | [../integrity-rule-catalog.md, data/obsolete-vocabulary-map.yaml] |
| gate_level | full-audit |
| false_positive_risk | 中。行レベル履歴マーカー（旧/移行/廃止/履歴 等、`hasLineLevelHistoryMarker`）、retired 系見出し配下、superseded Decision、否定文脈語、exemption_files、existence_probe で歴史文脈を許容する。`REQ/ADR/` 種別列挙は Wave 2 の正規化対象外領域に 34 件残存するため baseline で管理する |
| regression_test | `check_integrity.test.ts` describe "IR-065/IR-066 obsolete-vocabulary & legacy-path"。正常例・違反例・境界例・許容例・再現例（Wave 2 F-001（ADR）注記）の 5 種 fixture |
| finding_route | intake |
| triage_action | `（ADR）` 注記の新規検出は即時是正（Wave 2 #2371 で解消済みの回帰）。他語彙の新規検出は現行語彙（Decision、`docs/decisions/` 等）への置換または履歴注記化。既知 34 件（`REQ/ADR/` 列挙）は NG baseline（provenance `issue-2372-ir065-initial-baseline`）で管理 |
| last_verified | 2026-08-22 |

## 検査項目

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | bare `ADR-NNN` 識別子が現行文書で種別参照として使用されないこと（`v2:` プレフィックス付きは許容） | heuristic fail |
| 2 | `docs/adr/` パス参照が残存しないこと | heuristic fail |
| 3 | `（ADR）` 種別注記が残存しないこと（Wave 2 #2371 で解消済み。再発防止） | strict fail |
| 4 | `REQ/ADR/` 種別列挙が現行種別列挙として使用されないこと（現行は `REQ/Decision/`） | heuristic fail |
| 5 | `Artifact Graph`、`DOC-MAP` 呼称が現行概念として使用されないこと | heuristic fail |

### 検出パターンのスペース正規化仕様

検出照合は、語彙内への半角・全角スペース（U+0020/U+3000）挿入の有無に依存しない照合とする
（REQ-010-066）。実現方式は共通ヘルパー方式とし、照合時にのみ語彙・対象行を正規化し、
検出報告は原文行を対象とする（正規化後の行を報告・証跡化しない）。

- 正規化対象語彙は正規化の適用対象として一覧管理し、新規語彙を必要に応じて追加する
- 語彙の追加・変更は `check_integrity.ts` パターン定数（IR065_VOCAB_PATTERNS / IR066_VOCAB_PATTERNS）と
  `data/obsolete-vocabulary-map.yaml` vocabulary[] の同一 PR 同期を必須とする（REQ-047-004、drift 検査 strict fail 連動）
- 正規化照合は既存の行全体マッチ統一規約（checker-execution-contracts「パターンマッチ・網羅検査設計の標準規約」）と協調し、
  行単位走査モデルを維持する。行の照合時正規化を導入するものであり、行全体マッチ規約を置き換えない

## exemption（許容条件）

許容条件の運用データは `data/obsolete-vocabulary-map.yaml` が宣言する（検出シグナルの正規表現は本ルールの checker 実装が所有）。

| 対象 | 理由 |
|------|------|
| `v2:ADR-NNNN` プレフィックス付き識別子 | 許容された歴史的識別子（DEC-009 決定11、REQ-010-066 文言） |
| 行レベル履歴マーカーを含む行（旧/移行/廃止/履歴/経緯/legacy/deprecated 等） | 歴史経緯の記述（IR-057 `hasLineLevelHistoryMarker` と同一規則） |
| retired 系見出し（「## 廃止済み要件」等）配下 | retired/ ディレクトリと同種の履歴領域 |
| `status: superseded` の Decision | 履歴文書 |
| exemption_files（DEC-009、DEC-017、DEC-019、decisions/README.md、designs/README.md） | 移行経緯・索引の正規記録 |
| 否定文脈語を含む行（廃止/含めない/とせず 等） | 廃止機能を「使わないこと」を定める現行契約の記述 |
| existence_probe 先が実在する語彙 | 現行機能として存在するため検出対象外 |
| code block / code span 内 | 例示・様式説明 |
| `docs/requirements/retired/`、`docs/decisions/retired/`、`docs/reports/`、検出基盤配下（scripts/references/data/baselines、repo-agentdev-integrity/SKILL.md） | 履歴領域・検出基盤許容（IR-057 と同一） |

### 構造的除外の宣言仕様

スペース正規化の導入に伴う誤検知（語彙引用・記録領域の検出）の除外は、語彙を引用・記録する領域を
経路・領域ベースで構造的に除外する方式とする（REQ-010-066）。個別出現箇所の allow 条件列挙で
代替しない。

- 除外対象と理由は既存の宣言構造（`data/obsolete-vocabulary-map.yaml`）に理由付きで記録する
- 除外領域の宣言は構造マーカー（見出し、frontmatter、コードブロック等の領域境界）を錨とし、行番号や
  行内容の列挙を錨としない。行内容列挙は個別出現箇所の allow 列挙に該当するため採用しない
- 広域 glob による検出回避と検出無効化は許容しない（NG 隠蔽禁止原則、checker-execution-contracts「検出対象除外規定」と同一規定）
- 既存の行レベル免除（行レベル履歴マーカー、否定文脈語、retired 見出し配下）は存続する。これらは
  「個別出現箇所の allow 列挙」ではなく、行の意味的分類（履歴文脈・否定文脈・履歴領域）による構造的
  免除であり、構造的除外宣言の対象に含まれない旨を整理する

## baseline 運用

導入時点（Issue #2372、2026-08-22）の既知違反は `REQ/ADR/` 種別列挙 34 件（配布スキル本文・extensions）。Wave 1 監査の観点V1 は種別列挙を検出対象に含まず、Wave 2 の正規化対象外だった領域である。NG baseline additions manifest（provenance `issue-2372-ir065-initial-baseline`）で管理し、`REQ/Decision/` 列挙への一括正規化は intake 経由で判断する。

## See Also

- [IR-066-legacy-path-removed-name.md](IR-066-legacy-path-removed-name.md)
- [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- [rule-ownership.md](../rule-ownership.md)
- `docs/reports/integrity/normalizations/req-046-normalization-20260822.md`（C-01〜C-02）
