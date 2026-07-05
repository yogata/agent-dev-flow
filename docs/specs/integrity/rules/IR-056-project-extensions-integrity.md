---
status: accepted
---

# IR-056: project-extensions-integrity

| Field | Value |
|-------|-------|
| rule_id | IR-056 |
| description | project extensions 機構の整合性検査（ADR-0135、REQ-0160）。`.agentdev/extensions/{commands,skills}/*.yaml` の schema 適合（frontmatter `version: 1`/`kind: command-extension\|skill-extension`/`id`、5セクション `context`/`rules`/`checks`/`acceptance_gates`/`must_not` が配列、各 entry の `id` 文字列）、kind と配置の整合（command-extension は commands/、skill-extension は skills/）、id とファイル名の対応、`context.paths` の実在、`rules.skill`/`checks.skill` に記述された project-local skill の存在、旧 `.agentdev/doc-inputs/**` 残存の不在、extension が上書き意図（「置き換える」「default を変更」等）を持たないこと、配布コード（`src/opencode/commands/agentdev/**/*.md`, `src/opencode/skills/agentdev-*/SKILL.md`, `src/opencode/skills/agentdev-*/references/**/*.md`）に AgentDevFlow 本体固有 `docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**` 直接参照が残存しないことを検査する |
| severity | strict |
| category | broken-reference |
| detection_method | `check_extensions.ts` による extension YAML schema 検証、frontmatter (`version`/`kind`/`id`) 検証、5セクション配列検証、kind/配置整合検証、id/ファイル名対応検証、`context.paths` 実在確認、`rules.skill`/`checks.skill` project-local skill 存在確認（warning）、旧 `.agentdev/doc-inputs/**` 残存検出（warning）、上書き意図検出（warning、ヒューリスティック）、配布コード `docs/specs/**` 直接参照正規表現パターンマッチング。SPEC パス例示、検査対象パス指定、テンプレート例（`<existing-spec>.md` 等）は exemption 対象とする。`inspect-extensions.md` が検査対象として宣言する `.agentdev/doc-inputs/**` は residual 検出対象宣言であるため exemption |
| affected_artifacts | [.agentdev/extensions/commands/*.yaml, .agentdev/extensions/skills/*.yaml, src/opencode/commands/agentdev/**/*.md, src/opencode/skills/agentdev-*/SKILL.md, src/opencode/skills/agentdev-*/references/**/*.md] |
| related_req | [REQ-0160-001, REQ-0160-002, REQ-0160-003, REQ-0124-022, REQ-0108-263] |
| related_spec | [../foundations/project-extensions.md, integrity-rule-catalog.md] |
| gate_level | full-audit, delta-guard, impact-guard |
| false_positive_risk | 低。SPEC パス例示（`<existing-spec>.md` 等のテンプレート表記）、検査対象パス指定（診断コマンドが検査対象と明示するパス、`inspect-extensions.md` の `.agentdev/doc-inputs/**` 宣言等）は exemption 対象とする。上書き意図検出はヒューリスティックであるため warning 扱い |
| regression_test | `check_extensions.test.ts` が統合テストとして存在。正常系: doc-inputs → extensions 移行済みリポジトリの既存 extensions で `ok=true` を確認済み。検査項目それぞれについて正常ケースと異常ケースの fixture 拡充予定（project-local skill 委譲、上書き意図検出等） |
| baseline_status | migrated |
| finding_route | intake（既知違反の段階解消は別途処理） |
| triage_action | 新規検出時は baseline に追加し、delta guard で新規増加を fail 対象とする。doc-inputs → extensions 移行完了後は extensions 機構の full audit を fail gate 化する |
| last_verified | 2026-07-04（Issue #1406 移行完了時） |

## 検査項目

`check_extensions.ts` が以下を検査する。

| # | 検査項目 | 失敗時 |
|---|----------|--------|
| 1 | `.agentdev/extensions/{commands,skills}/*.yaml` の一覧化 | 情報（fail 対象外） |
| 2 | 各 extension の schema 適合（frontmatter `version: 1`/`kind`/`id`、5セクション `context`/`rules`/`checks`/`acceptance_gates`/`must_not` が配列、各 entry の `id` 文字列） | strict fail |
| 3 | `kind` と配置の整合（`command-extension` は `commands/`、`skill-extension` は `skills/`） | strict fail |
| 4 | `id` とファイル名の対応（command: `/agentdev/<filename>`、skill: `<filename>`） | strict fail |
| 5 | `context.paths` で参照されるファイルパスの実在 | strict fail |
| 6 | `rules.skill`/`checks.skill` に記述された project-local skill の存在（`src/opencode/skills/`、`.opencode/skills/` の既知位置で確認） | warning |
| 7 | 旧 `.agentdev/doc-inputs/**` の残存不在 | warning |
| 8 | extension 本文の上書き意図検出（「置き換える」「default を変更」等のヒューリスティック） | warning |
| 9 | `src/opencode/commands/agentdev/**/*.md` に本体固有 `docs/specs/**` 直接参照が残っていないこと | strict fail |
| 10 | `src/opencode/skills/agentdev-*/SKILL.md` と `references/**/*.md` に同一の直接参照が残っていないこと | strict fail |

## exemption（検出対象外）

| 対象 | 理由 |
|------|------|
| SPEC パス例示（`<existing-spec>.md` 等のテンプレート表記） | 例示は実参照ではなく、consumer が独自パスに置換する前提 |
| 検査対象パス指定（診断コマンドが検査対象として明示するパス） | 検査対象の宣言は参照ではなく、検査システムが扱う対象 |
| `inspect-extensions.md` の `.agentdev/doc-inputs/**` 宣言 | 旧機構残存検出（検査7）のスキャン対象宣言であり、実参照ではない |
| 配布コード外（`.opencode/skills/repo-agentdev-integrity/` 等、repo-local） | 配布対象外領域 |

## 移行経緯

本ルールは元来 project doc-inputs 機構の整合性検査として `check_doc_inputs.ts` が担っていた。Issue #1406 で project extensions 機構（ADR-0135、REQ-0160）へ一括移行され、`check_doc_inputs.ts` は `check_extensions.ts` へ改名・再実装された。検査項目は拡張され、extension schema 検証（5セクション構造）、kind/配置/id 対応検証、project-local skill 存在確認、上書き意図検出、旧 doc-inputs 残存検出を含む。`allowed_discovery` 運用契約、DOC-MAP/README 探索可能性要件は旧機構固有であり、extensions 移行で廃止された。

## 関連

- [project-extensions.md](../../foundations/project-extensions.md): Project Extensions SPEC
- [integrity-rule-catalog.md](../integrity-rule-catalog.md): 整合性ルールカタログ
