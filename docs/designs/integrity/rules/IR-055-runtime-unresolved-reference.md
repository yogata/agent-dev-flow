---
title: "IR-055: runtime-unresolved-reference（配布物内の導入先未解決参照検出）"
status: accepted
created: 2026-08-20
updated: 2026-08-20
---

# IR-055: runtime-unresolved-reference（配布物内の導入先未解決参照検出）

| Field | Value |
|-------|-------|
| rule_id | IR-055 |
| description | 配布物（`src/opencode/commands/agentdev/**/*.md`、`src/opencode/skills/agentdev-*/**/*.md`、`references/` 配下、`SKILL.md` 含む）内の導入先未解決参照（REQ/Decision ID、`src/opencode/`、`docs/designs/`、`docs/guides/`、`/repo/*`、`repo-*`、本体 docs URL、line number 付き内部参照）を機械的パターンマッチングで検出すること。REQ-002-079/080/081 で既に要件化された「配布物は導入先で解決可能な参照のみを含む」原則の機械検出であり、意味的診断（文意保持・構文健全性・責務整合）は対象外（3層検出構造: [integrity-contracts.md](../integrity-contracts.md)）。Decision ID は現行 `DEC-\d{3}` 命名を検出する。旧 `ADR-\d{4}` 参照は Decision 移行漏れ（residual）として検出する（DEC-009 AG-016）。履歴参照 `v2:ADR-\d{4}` は AG-010 保護対象であり検出対象外 |
| severity | strict（REQ/Decision ID、`src/opencode/`、`/repo/*`、`repo-*`）、heuristic または observation（`docs/designs/`、`docs/guides/`、本体 docs URL、line number 付き参照）。パターンごとの分類は後述「IR-055 検出パターンと severity」参照 |
| category | broken-reference |
| detection_method | 正規表現パターンマッチング（walkMarkdown / collectAgentdevSkillMarkdown による走査）。Decision ID は `DEC-\d{3}`、旧形式 residual は `ADR-\d{4}` を検出。code block 内部、template placeholder（`{xxx}`）、vocabulary-registry.md / integrity-rule-catalog.md / rules/IR-055-*.md 自身等の正当使用例外パスは exemption 対象とする。`v2:ADR-\d{4}` は履歴参照保護（AG-010）のため `v2:` prefix ありは検出対象外 |
| affected_artifacts | [src/opencode/commands/agentdev/**/*.md, src/opencode/skills/agentdev-*/**/*.md, src/opencode/skills/agentdev-*/references/**/*.md, src/opencode/skills/agentdev-*/SKILL.md] |
| related_req | [REQ-002-079, REQ-002-080, REQ-002-081, REQ-028-009] |
| related_design | [integrity-rule-catalog.md, integrity-contracts.md] |
| gate_level | full-audit, delta-guard, impact-guard |
| false_positive_risk | 中。code block 内部、template placeholder（`{xxx}`）、vocabulary-registry.md 等の正当使用例外パスは exemption 対象とする。`integrity-rule-catalog.md` 自身のルール記述も exemption 対象とする。exemption 設計を誤ると true positive が誤って免除される |
| regression_test | check_integrity.test.ts。各検出パターン（REQ-NNNN、REQ-NNNN-NNN、DEC-NNN、residual ADR-NNNN、`src/opencode/`、`docs/designs/`、`docs/guides/`、`/repo/*`、`repo-*`、本体 docs URL、line number 付き参照）を含む fixture で検出されること、exemption 対象が報告されないことを検証する |
| finding_route | intake（既知違反の段階解消は別途処理） |
| triage_action | 新規検出時は baseline に追加し、delta guard で新規増加を fail 対象とする。既存違反の段階解消は docs-check report / intake / backlog 経由で処理する。baseline 0 到達後に full audit を fail gate 化する（REQ-010-007） |
| last_verified | 2026-08-10 |

## IR-055 検出パターンと severity（REQ-002-079〜081）

検出パターンごとの severity 分類を規定する。
本節が SPEC 詳細の原本であり、docs-check 実装（`check_integrity.ts`）は本節に従う。

### strict（原則違反、即 NG）

| パターン | 根拠 |
|----------|------|
| REQ/Decision ID 固定参照（`REQ-\d{4}`、`REQ-\d{4}-\d{3}`、`DEC-\d{3}`） | REQ/Decision は agent-dev-flow 本体内部 ID であり、consumer 配布物に残らない（REQ-002-079/080/081） |
| Residual ADR 参照（`ADR-\d{4}`、`v2:` prefix なし） | DEC-009 で Decision へ移行済み。現行 docs 配下の non-v2 ADR 参照は移行漏れ（residual）であり、AG-010 履歴参照保護対象外 |
| `src/opencode/` パス参照 | 原本側リポジトリパスであり、consumer 環境に存在しない |
| `/repo/*` 参照 | repo-local command 参照であり、consumer 環境に存在しない |
| `repo-*` 参照 | repo-local skill 参照であり、consumer 環境に存在しない |

### heuristic または observation（baseline 対象、warning）

| パターン | 根拠 |
|----------|------|
| `docs/designs/` 参照 | 本体内部 docs 参照。consumer 環境に存在しない可能性が高い |
| `docs/guides/` 参照 | 本体内部 docs 参照。consumer 環境に存在しない可能性が高い |
| 本体 docs への GitHub URL | 本体リポジトリ固有 URL。consumer 環境では参照先が異なる |
| line number 付き内部参照（`file.md#L\d+`） | 行番号は本体側の改修で容易に陳腐化する |

### exemption（検出対象外）

| 対象 | 理由 |
|------|------|
| code block 内部 | 例示、パターン説明は検出対象外（integrity-rule-catalog.md「対象ファイル設計」準拠） |
| template placeholder（`{xxx}`） | プレースホルダーは実参照ではない |
| `v2:ADR-\d{4}` 履歴参照 | AG-010 履歴参照保護。`v2:` prefix ありは検出対象外 |
| `vocabulary-registry.md` / `integrity-rule-catalog.md` / `rules/IR-055-*.md` 自身 | 検出ルール自体の記述、正規語彙の対照表は正当使用 |

## 段階導入運用（REQ-010-007）

本ルールは段階導入で運用する。
既存違反が多数存在するため、full audit を即 fail gate 化せず、baseline 既知違反と新規違反を区別する（REQ-010-007）。

| 層 | 動作 | baseline 0 到達前 | baseline 0 到達後 |
|----|------|-------------------|-------------------|
| full audit | 全ルール実行 | 報告のみ（fail なし） | fail gate 化 |
| delta guard | 変更関連ルール実行 | 新規増加は fail | 新規増加は fail |
| impact guard | 影響範囲ルール実行 | 新規増加は fail | 新規増加は fail |

baseline 0 到達後に full audit を fail gate 化できる状態にする（REQ-010-007）。
3層 guard の実行モデルは REQ-010-005 に従う。

## ルール本文と正規表現

IR-055 の正規表現は Decision 移行後の現行命名 `DEC-\d{3}` を検出する。
あわせて Decision 移行漏れ（residual）である `ADR-\d{4}`（`v2:` prefix なし）を
検出する。
履歴参照 `v2:ADR-\d{4}` は AG-010 履歴参照保護対象であり検出対象外。
ルールの意味論的責務（未解決参照の検出）は維持する。
