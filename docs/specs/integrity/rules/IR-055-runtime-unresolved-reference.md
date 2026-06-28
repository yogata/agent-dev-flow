---
status: accepted
---

# IR-055: runtime-unresolved-reference（配布物内の導入先未解決参照検出）

| Field | Value |
|-------|-------|
| rule_id | IR-055 |
| description | 配布物（`src/opencode/commands/agentdev/**/*.md`、`src/opencode/skills/agentdev-*/**/*.md`、`references/` 配下、`SKILL.md` 含む）内の導入先未解決参照（REQ/ADR ID、`src/opencode/`、`docs/specs/`、`docs/guides/`、`/repo/*`、`repo-*`、本体 docs URL、line number 付き内部参照）を機械的パターンマッチングで検出すること（REQ-0108-263）。REQ-0103-079/080/081 で既に要件化された「配布物は導入先で解決可能な参照のみを含む」原則の機械検出であり、意味的診断（文意保持・構文健全性・責務整合）は対象外（3層検出構造: [integrity-contracts.md](../integrity-contracts.md)） |
| severity | strict（REQ/ADR ID、`src/opencode/`、`/repo/*`、`repo-*`）、heuristic または observation（`docs/specs/`、`docs/guides/`、本体 docs URL、line number 付き参照）。パターンごとの分類は後述「IR-055 検出パターンと severity」参照 |
| category | broken-reference |
| detection_method | 正規表現パターンマッチング（walkMarkdown / collectAgentdevSkillMarkdown による走査）。code block 内部、template placeholder（`{xxx}`）、vocabulary-registry.md / integrity-rule-catalog.md / rules/IR-055-*.md 自身等の正当使用例外パスは exemption 対象とする |
| affected_artifacts | [src/opencode/commands/agentdev/**/*.md, src/opencode/skills/agentdev-*/**/*.md, src/opencode/skills/agentdev-*/references/**/*.md, src/opencode/skills/agentdev-*/SKILL.md] |
| related_req | [REQ-0103-079, REQ-0103-080, REQ-0103-081, REQ-0108-056, REQ-0108-263, REQ-0108-264] |
| related_spec | [integrity-rule-catalog.md, integrity-contracts.md] |
| gate_level | full-audit, delta-guard, impact-guard |
| false_positive_risk | 中。code block 内部、template placeholder（`{xxx}`）、vocabulary-registry.md 等の正当使用例外パスは exemption 対象とする。`integrity-rule-catalog.md` 自身のルール記述も exemption 対象とする。exemption 設計を誤ると true positive が誤って免除される |
| regression_test | (未実装)。各検出パターン（REQ-NNNN、REQ-NNNN-NNN、ADR-NNNN、`src/opencode/`、`docs/specs/`、`docs/guides/`、`/repo/*`、`repo-*`、本体 docs URL、line number 付き参照）を含む fixture で検出されること、exemption 対象が報告されないことを検証する |
| baseline_status | new |
| finding_route | intake（既知違反の段階解消は別途処理） |
| triage_action | 新規検出時は baseline に追加し、delta guard で新規増加を fail 対象とする。既存違反の段階解消は docs-check report / intake / backlog 経由で処理する。baseline 0 到達後に full audit を fail gate 化する（REQ-0108-264） |
| last_verified | (新規登録時) |

## IR-055 検出パターンと severity（REQ-0108-263）

検出パターンごとの severity 分類を規定する。本節が SPEC 詳細の原本であり、docs-check 実装（`check_integrity.ts`）は本節に従う。

### strict（原則違反、即 NG）

| パターン | 根拠 |
|----------|------|
| REQ/ADR ID 固定参照（`REQ-\d{4}`、`REQ-\d{4}-\d{3}`、`ADR-\d{4}`） | REQ/ADR は agent-dev-flow 本体内部 ID であり、consumer 配布物に残らない（REQ-0103-079/080/081） |
| `src/opencode/` パス参照 | 原本側リポジトリパスであり、consumer 環境に存在しない |
| `/repo/*` 参照 | repo-local command 参照であり、consumer 環境に存在しない |
| `repo-*` 参照 | repo-local skill 参照であり、consumer 環境に存在しない |

### heuristic または observation（baseline 対象、warning）

| パターン | 根拠 |
|----------|------|
| `docs/specs/` 参照 | 本体内部 docs 参照。consumer 環境に存在しない可能性が高い |
| `docs/guides/` 参照 | 本体内部 docs 参照。consumer 環境に存在しない可能性が高い |
| 本体 docs への GitHub URL | 本体リポジトリ固有 URL。consumer 環境では参照先が異なる |
| line number 付き内部参照（`file.md#L\d+`） | 行番号は本体側の改修で容易に陳腐化する |

### exemption（検出対象外）

| 対象 | 理由 |
|------|------|
| code block 内部 | 例示、パターン説明は検出対象外（integrity-rule-catalog.md「対象ファイル設計」準拠） |
| template placeholder（`{xxx}`） | プレースホルダーは実参照ではない |
| `vocabulary-registry.md` / `integrity-rule-catalog.md` / `rules/IR-055-*.md` 自身 | 検出ルール自体の記述、正規語彙の対照表は正当使用 |

## 段階導入運用（REQ-0108-264）

本ルールは段階導入で運用する。既存違反が多数存在するため、full audit を即 fail gate 化せず、baseline 既知違反と新規違反を区別する（REQ-0108-145）。

| 層 | 動作 | baseline 0 到達前 | baseline 0 到達後 |
|----|------|-------------------|-------------------|
| full audit | 全ルール実行 | 報告のみ（fail なし） | fail gate 化 |
| delta guard | 変更関連ルール実行 | 新規増加は fail | 新規増加は fail |
| impact guard | 影響範囲ルール実行 | 新規増加は fail | 新規増加は fail |

baseline 0 到達後に full audit を fail gate 化できる状態にする（REQ-0108-264）。3層 guard の実行モデルは REQ-0108-153 に従う。
