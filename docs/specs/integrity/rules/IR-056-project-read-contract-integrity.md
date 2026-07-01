---
status: accepted
---

# IR-056: project-read-contract-integrity

| Field | Value |
|-------|-------|
| rule_id | IR-056 |
| description | project read contract 機構の整合性検査（ADR-0133、REQ-0157）。`.agentdev/config.yaml` の存在と schema 適合、`roots` パス存在、`read_contracts.commands` と `read_contracts.skills` ディレクトリ存在、公開コマンドごとの command read contract 存在、各 read contract の schema 適合、read contract の paths 存在、paths の DOC-MAP/README 探索可能性、配布コード（`src/opencode/commands/agentdev/**/*.md`, `src/opencode/skills/agentdev-*/SKILL.md`, `src/opencode/skills/agentdev-*/references/**/*.md`）に AgentDevFlow 本体固有 `docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**` 直接参照が残存しないこと、`.agentdev/read-contracts/**` 内の `docs/specs/**` 参照は正当な参照として扱うことを検査する |
| severity | strict |
| category | broken-reference |
| detection_method | `check_read_contracts.ts` による YAML schema 検証、ファイル存在確認、正規表現パターンマッチング（walkMarkdown による走査）。SPEC パス例示、検査対象パス指定、テンプレート例（`<existing-spec>.md` 等）は exemption 対象とする。code block 内部も対象とするが、テンプレート例示に分類されるパスは exemption とする |
| affected_artifacts | [.agentdev/config.yaml, .agentdev/read-contracts/commands/*.yaml, .agentdev/read-contracts/skills/*.yaml, src/opencode/commands/agentdev/**/*.md, src/opencode/skills/agentdev-*/SKILL.md, src/opencode/skills/agentdev-*/references/**/*.md] |
| related_req | [REQ-0157-001, REQ-0157-002, REQ-0157-003, REQ-0108-263] |
| related_spec | [../foundations/project-read-contracts.md, integrity-rule-catalog.md] |
| gate_level | full-audit, delta-guard, impact-guard |
| false_positive_risk | 低。SPEC パス例示（`<existing-spec>.md` 等のテンプレート表記）、検査対象パス指定（診断コマンドが検査対象と明示するパス）は exemption 対象とする。exemption 設計を誤ると true positive が誤って免除される |
| regression_test | (未実装)。検査項目9点それぞれについて、正常ケースと異常ケースの fixture を用意し、`check_read_contracts.ts` が正しく fail/pass を報告することを検証する |
| baseline_status | new |
| finding_route | intake（既知違反の段階解消は別途処理） |
| triage_action | 新規検出時は baseline に追加し、delta guard で新規増加を fail 対象とする。read contract 機構は新規導入のため baseline 0 で開始し、full audit を即 fail gate 化する |
| last_verified | (新規登録時) |

## 検査項目9点（REQ-0157-004）

`check_read_contracts.ts` が以下9点を検査する。

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | `.agentdev/config.yaml` の存在と schema 適合 | strict fail |
| 2 | `roots` に定義されたパスの存在 | strict fail |
| 3 | `read_contracts.commands` と `read_contracts.skills` ディレクトリの存在 | strict fail |
| 4 | 公開コマンドごとの command read contract の存在 | warning（欠落時） |
| 5 | 各 read contract の schema 適合 | strict fail |
| 6 | read contract の paths の存在 | strict fail |
| 7 | read contract の paths が `docs/DOC-MAP.md` または docs 配下 README から探索可能であること | warning |
| 8 | `src/opencode/commands/agentdev/**/*.md` に本体固有 `docs/specs/**` 直接参照が残っていないこと | strict fail |
| 9 | `src/opencode/skills/agentdev-*/SKILL.md` と `references/**/*.md` に同一の直接参照が残っていないこと | strict fail |

`.agentdev/read-contracts/**` 内の `docs/specs/**` 参照は正当な参照として扱う（ハイブリッド方式、ADR-0133）。

## exemption（検出対象外）

| 対象 | 理由 |
|------|------|
| SPEC パス例示（`<existing-spec>.md` 等のテンプレート表記） | 例示は実参照ではなく、consumer が独自パスに置換する前提 |
| 検査対象パス指定（診断コマンドが検査対象として明示するパス） | 検査対象の宣言は参照ではなく、検査システムが扱う対象 |
| 配布コード外（`.opencode/skills/repo-agentdev-integrity/` 等、repo-local） | 配布対象外領域 |

## 段階導入運用

本ルールは read contract 機構の新規導入に伴うものであり、baseline 0 で開始する。full audit を即 fail gate 化する（REQ-0157-004）。
