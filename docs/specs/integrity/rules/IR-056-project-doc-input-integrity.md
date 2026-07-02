---
status: accepted
---

# IR-056: project-doc-input-integrity

| Field | Value |
|-------|-------|
| rule_id | IR-056 |
| description | project doc-inputs 機構の整合性検査（ADR-0133、REQ-0157）。`.agentdev/config.yaml` の存在と schema 適合（`version`, `kind`, `roots`, `doc_inputs` のみ）、`roots` パス存在、`doc_inputs.commands` と `doc_inputs.skills` ディレクトリ存在、公開コマンドごとの command doc-input 存在、各 doc-input の schema 適合（フロントマタ `version`/`kind`/`id`、command doc-input の `must_read{path,purpose}`/`conditional_read{id,when,paths,purpose}` オブジェクト構造、skill doc-input の `conditional_read` オブジェクト構造、`allowed_discovery`/`forbidden`/`read_completion` が説明文字列リストであること）、doc-input の paths 存在、paths の DOC-MAP/README 探索可能性、配布コード（`src/opencode/commands/agentdev/**/*.md`, `src/opencode/skills/agentdev-*/SKILL.md`, `src/opencode/skills/agentdev-*/references/**/*.md`）に AgentDevFlow 本体固有 `docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**` 直接参照が残存しないこと、`.agentdev/doc-inputs/**` 内の `docs/specs/**` 参照は正当な参照として扱うことを検査する |
| severity | strict |
| category | broken-reference |
| detection_method | `check_doc_inputs.ts` による YAML schema 検証、フロントマタ (`version`/`kind`/`id`) 検証、`must_read`/`conditional_read` オブジェクト構造検証、ファイル存在確認、正規表現パターンマッチング（walkMarkdown による走査）。SPEC パス例示、検査対象パス指定、テンプレート例（`<existing-spec>.md` 等）は exemption 対象とする。code block 内部も対象とするが、テンプレート例示に分類されるパスは exemption とする |
| affected_artifacts | [.agentdev/config.yaml, .agentdev/doc-inputs/commands/*.yaml, .agentdev/doc-inputs/skills/*.yaml, src/opencode/commands/agentdev/**/*.md, src/opencode/skills/agentdev-*/SKILL.md, src/opencode/skills/agentdev-*/references/**/*.md] |
| related_req | [REQ-0157-001, REQ-0157-002, REQ-0157-003, REQ-0108-263] |
| related_spec | [../foundations/project-doc-inputs.md, integrity-rule-catalog.md] |
| gate_level | full-audit, delta-guard, impact-guard |
| false_positive_risk | 低。SPEC パス例示（`<existing-spec>.md` 等のテンプレート表記）、検査対象パス指定（診断コマンドが検査対象と明示するパス）は exemption 対象とする。exemption 設計を誤ると true positive が誤って免除される |
| regression_test | `check_doc_inputs.test.ts` が統合テストとして存在。正常系: 7/2 移行済みリポジトリの既存 doc-inputs で `ok=true` を確認済み。異常系: AG-005 で8種 fixture（allowed_discovery 非配列/空文字含む、command id 形式違反、skill id ファイル名不一致、must_read[].path 不在、conditional_read[].paths[] 不在、skill doc-input の must_read 持ち、command doc-input の5項目欠落）を追加済み。検査項目それぞれについて正常ケースと異常ケースの fixture を用意し、`check_doc_inputs.ts` が正しく fail/pass を報告することを検証する |
| baseline_status | new |
| finding_route | intake（既知違反の段階解消は別途処理） |
| triage_action | 新規検出時は baseline に追加し、delta guard で新規増加を fail 対象とする。doc-inputs 機構は新規導入のため baseline 0 で開始し、full audit を即 fail gate 化する |
| last_verified | (新規登録時) |

## 検査項目（REQ-0157-004）

`check_doc_inputs.ts` が以下を検査する。

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | `.agentdev/config.yaml` の存在と schema 適合（`version`, `kind`, `roots`, `doc_inputs` のみ） | strict fail |
| 2 | `roots` に定義されたパスの存在 | strict fail |
| 3 | `doc_inputs.commands` と `doc_inputs.skills` ディレクトリの存在 | strict fail |
| 4 | 公開コマンドごとの command doc-input の存在 | warning（欠落時） |
| 5 | 各 doc-input の schema 適合（フロントマタ `version: 1`/`kind`/`id`、command doc-input の `must_read{path,purpose}`/`conditional_read{id,when,paths,purpose}` オブジェクト構造、skill doc-input の `conditional_read` オブジェクト構造、`allowed_discovery`/`forbidden`/`read_completion` が説明文字列リスト） | strict fail |
| 6 | doc-input の paths の存在 | strict fail |
| 7 | doc-input の paths が `docs/DOC-MAP.md` または docs 配下 README から探索可能であること | warning |
| 8 | `src/opencode/commands/agentdev/**/*.md` に本体固有 `docs/specs/**` 直接参照が残っていないこと | strict fail |
| 9 | `src/opencode/skills/agentdev-*/SKILL.md` と `references/**/*.md` に同一の直接参照が残っていないこと | strict fail |

`.agentdev/doc-inputs/**` 内の `docs/specs/**` 参照は正当な参照として扱う（ハイブリッド方式、ADR-0133）。

## exemption（検出対象外）

| 対象 | 理由 |
|------|------|
| SPEC パス例示（`<existing-spec>.md` 等のテンプレート表記） | 例示は実参照ではなく、consumer が独自パスに置換する前提 |
| 検査対象パス指定（診断コマンドが検査対象として明示するパス） | 検査対象の宣言は参照ではなく、検査システムが扱う対象 |
| 配布コード外（`.opencode/skills/repo-agentdev-integrity/` 等、repo-local） | 配布対象外領域 |

## 段階導入運用

本ルールは doc-inputs 機構の新規導入に伴うものであり、baseline 0 で開始する。full audit を即 fail gate 化する（REQ-0157-004）。

## allowed_discovery 運用契約（REQ-0157 APPEND）

`allowed_discovery` は command または skill が DOC-MAP または docs 配下 README 経由で探索を必要とする paths を明示するフィールドである。

- **空配列の許容条件**: `allowed_discovery` が空配列の場合は「探索不要」を意味する。DOC-MAP または docs 配下 README から探索可能な paths を持たない command または skill（must_read, conditional_read が空、または固定パスのみ）の場合のみ空配列を許容する。
- **探索許可記述条件**: `allowed_discovery` に DOC-MAP または docs 配下 README 経由の探索許可を記述した場合、当該 command または skill はその経路で探索可能な paths を持つことを要件とする。空配列でない `allowed_discovery` を持つ command または skill が DOC-MAP/README 経由で到達可能な paths を持たない場合は検査 fail とする。
- **検査対象 command**: req-define, req-save, spec-save, case-close, inspect-docs, inspect-doc-inputs は、必要最小限の探索許可（DOC-MAP および docs 配下 README 経由）を `allowed_discovery` に記述する。spec-save は `document-model.md` 確認を明示的に許可する。
