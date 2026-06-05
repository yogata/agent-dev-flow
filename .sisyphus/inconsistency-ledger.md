# Inconsistency Ledger

> Temporary artifact for systematic inconsistency classification. Not canonical domain state (`.agentdev/`), not REQ source of truth.

## Categories

| Category | Definition | Route |
|----------|-----------|-------|
| strict_mechanical | Broken links, missing paths, frontmatter mismatches, template path mismatches | RU-0002 (Issue #584) |
| canonical_drift | DOC-MAP drift, stale cross-references, outdated indices, stale counts/ranges | RU-0002 or RU-0004 |
| legacy_terminology | Old command names, old pattern labels, old directory names, bare slash forms | RU-0003 (Issue #585) |
| semantic_conflict | Documents contradicting each other, wrong SoT priority, internal REQ contradictions | RU-0004 (Issue #583) |
| boundary_violation | Commands with judgment, skills with text, .agentdev/.sisyphus confusion, REQ defining workflow states | RU-0005 (Issue #582) |
| prevention_gap | Missing checks, no regression tests, no vocabulary registry | RU-0006 (Issue #586) |

## Statistics

| Category | Count |
|----------|-------|
| strict_mechanical | 5 |
| canonical_drift | 5 |
| legacy_terminology | 4 |
| semantic_conflict | 6 |
| boundary_violation | 5 |
| prevention_gap | 4 |
| **Total** | **29** |

## Integrity Check Baseline

- **Run date**: 2026-06-05
- **Result**: 156 OK, 40 NG, 47 Warning, 1 Info
- **Report**: `.agentdev/integrity/reports/2026-06-05-integrity-report.md`

---

## Entries

---

### INC-0001: Broken link — REQ-NNNN.md placeholder in REQ-0108

| Field | Value |
|-------|-------|
| id | INC-0001 |
| category | strict_mechanical |
| severity | high |
| status | open |
| evidence | `docs/requirements/REQ-0108.md` — link target `REQ-NNNN.md` does not exist |
| current_text_or_behavior | REQ-0108 contains a markdown link `REQ-NNNN.md` which is a placeholder, not a real file |
| expected_source_of_truth | All markdown links in active REQ must resolve to existing files (REQ-0101-010, REQ-0108) |
| recommended_route | RU-0002 |
| target_ru | RU-0002 |
| prevention_candidate | integrity-check should flag placeholder-style links (`REQ-NNNN`, `ADR-NNNN`, etc.) in active REQ/SPEC |

---

### INC-0002: Broken link — capture-boundaries.md does not exist

| Field | Value |
|-------|-------|
| id | INC-0002 |
| category | strict_mechanical |
| severity | high |
| status | open |
| evidence | `docs/specs/system.md:195` — `[capture-boundaries.md](../../.opencode/skills/agentdev-workflow-lifecycle/references/capture-boundaries.md)` |
| current_text_or_behavior | system.md links to `.opencode/skills/agentdev-workflow-lifecycle/references/capture-boundaries.md` which does not exist |
| expected_source_of_truth | SPEC links must resolve. The file was likely part of old `reference/` structure. If content migrated, link target must update (ADR-0017, REQ-0108) |
| recommended_route | RU-0002 |
| target_ru | RU-0002 |
| prevention_candidate | integrity-check link resolution should cover SPEC→skill reference paths |

---

### INC-0003: Missing reference files in multiple commands

| Field | Value |
|-------|-------|
| id | INC-0003 |
| category | strict_mechanical |
| severity | high |
| status | open |
| evidence | `check_integrity.ts` ReferencePath results: 8 NG entries for `references/git-common-procedures.md` and `references/capture-boundaries.md` in case-close.md, case-run.md, integrity-check.md, req-define.md |
| current_text_or_behavior | Commands reference `references/git-common-procedures.md` (3× in case-close, 1× in integrity-check) and `references/capture-boundaries.md` (1× in case-close, 1× in case-run) and `templates/doc_requirement.md` (1× in req-define) — none exist |
| expected_source_of_truth | Command reference paths must resolve to existing files (REQ-0103-013, REQ-0108-117~119) |
| recommended_route | RU-0002 |
| target_ru | RU-0002 |
| prevention_candidate | Reference path existence check already implemented; ensure CI blocks on NG |

---

### INC-0004: Legacy bare slash command forms in commands and specs

| Field | Value |
|-------|-------|
| id | INC-0004 |
| category | legacy_terminology |
| severity | medium |
| status | open |
| evidence | Integrity check reports 22 NG for `legacy-namespace` and `expanded-legacy-namespace`: bare slash forms `/case-run`, `/case-open`, `/case-close`, `/case-update`, `/req-define`, `/req-save` found in `.opencode/commands/agentdev/case-auto.md`, `case-close.md`, `case-open.md`, `case-update.md`, `req-define.md`, `req-save.md`, `.opencode/skills/agentdev-workflow-orchestration/SKILL.md`, `docs/specs/system.md` |
| current_text_or_behavior | Non-retired files use legacy bare slash command forms instead of `/agentdev/` namespace |
| expected_source_of_truth | All command references must use `/agentdev/*` namespace (ADR-0005, REQ-0108-016) |
| recommended_route | RU-0003 |
| target_ru | RU-0003 |
| prevention_candidate | integrity-check legacy namespace detection already covers this; fix the actual references |

---

### INC-0005: issue-* terminology in active skills

| Field | Value |
|-------|-------|
| id | INC-0005 |
| category | legacy_terminology |
| severity | medium |
| status | open |
| evidence | `.opencode/skills/agentdev-adr-guidelines/SKILL.md:56` — `issue-*ワークフロー統括ハブ`; `.opencode/skills/agentdev-req-analysis/SKILL.md:256` — `issue-*ワークフロー統括ハブ` |
| current_text_or_behavior | Two active skills describe agentdev-workflow-lifecycle using legacy `issue-*` prefix |
| expected_source_of_truth | Active skill descriptions must use current terminology `agentdev-*` (ADR-0005, AGENTS.md) |
| recommended_route | RU-0003 |
| target_ru | RU-0003 |
| prevention_candidate | integrity-check should scan SKILL.md text for `issue-*` / `tips-*` patterns in non-retired context |

---

### INC-0006: req-backlog references in active REQ and ADR

| Field | Value |
|-------|-------|
| id | INC-0006 |
| category | legacy_terminology |
| severity | medium |
| status | open |
| evidence | `docs/requirements/REQ-0105.md:54-55,70,73` — req-backlog deletion/abolition requirements; `docs/adr/ADR-0003.md:41` — `promoted artifact → req-backlog（RU 生成）→ issue-req → ...`; `docs/adr/ADR-0009.md:15` — `req-backlog/RU削除モデル` |
| current_text_or_behavior | Active REQ-0105 contains req-backlog references in the context of its deletion, but ADR-0003 (accepted) and ADR-0009 (deprecated) still describe the old req-backlog workflow as a current flow |
| expected_source_of_truth | req-backlog is abolished (REQ-0105-038). ADR-0003's migration table should be historical. ADR-0009 is deprecated and should not be cited as authority (REQ-0101-016, AGENTS.md) |
| recommended_route | RU-0003 |
| target_ru | RU-0003 |
| prevention_candidate | REQ-0108-112 requires req-backlog residual detection — not yet implemented in check_integrity.ts |

---

### INC-0007: lint_skills.ts includes `reference/` in resource patterns

| Field | Value |
|-------|-------|
| id | INC-0007 |
| category | legacy_terminology |
| severity | low |
| status | open |
| evidence | `.opencode/skills/agentdev-integrity/scripts/lint_skills.ts:187` — `const resourcePatterns = ["scripts/", "reference/", "templates/"];` |
| current_text_or_behavior | Resource pattern check includes obsolete `reference/` alongside canonical `references/` |
| expected_source_of_truth | `references/` is canonical. `reference/` is obsolete (REQ-0103-013, REQ-0108-039~040) |
| recommended_route | RU-0003 |
| target_ru | RU-0003 |
| prevention_candidate | lint_skills.ts should check for `references/` (canonical) and flag `reference/` as obsolete, not include it as a valid resource pattern |

---

### INC-0008: AGENTS.md stale REQ range

| Field | Value |
|-------|-------|
| id | INC-0008 |
| category | canonical_drift |
| severity | high |
| status | open |
| evidence | `AGENTS.md:17` — `Active REQ: docs/requirements/REQ-0101.md through docs/requirements/REQ-0111.md.` |
| current_text_or_behavior | AGENTS.md states active REQ range as REQ-0101~0111 (11 REQs), but actual range is REQ-0101~0114 (14 REQs) |
| expected_source_of_truth | Source-of-truth priority (AGENTS.md itself) must reflect actual active REQ set. DOC-MAP, docs/README.md, and docs/requirements/README.md correctly show REQ-0114 |
| recommended_route | RU-0002 |
| target_ru | RU-0002 |
| prevention_candidate | integrity-check should verify AGENTS.md REQ range matches actual REQ file count |

---

### INC-0009: system.md stale REQ range and old classification terms

| Field | Value |
|-------|-------|
| id | INC-0009 |
| category | canonical_drift |
| severity | high |
| status | open |
| evidence | `docs/specs/system.md:213` — `旧REQ群（REQ-0001〜0040）を現行仕様基準として再構成した新基準REQ群（REQ-0101〜0109）を主参照とする。旧REQは履歴として保持し、分類（retained / partially superseded / superseded）に基づき扱う。` |
| current_text_or_behavior | system.md references REQ-0101~0109 (9 REQs) but actual count is 14 (through REQ-0114). Also uses old classification terms `retained / partially superseded / superseded` which are retired REQ concepts |
| expected_source_of_truth | SPEC should reflect current state. Active REQ set is REQ-0101~0114. Old classification terms are from retired REQ-0045 and replaced by `migrated / retired-no-successor / historical-only` in mapping-table.md (REQ-0109, REQ-0101-013) |
| recommended_route | RU-0002 |
| target_ru | RU-0002 |
| prevention_candidate | integrity-check should verify SPEC REQ ranges match actual REQ inventory |

---

### INC-0010: project-docs-and-specs.md stale REQ count

| Field | Value |
|-------|-------|
| id | INC-0010 |
| category | canonical_drift |
| severity | high |
| status | open |
| evidence | `docs/guides/project-docs-and-specs.md:25` — `現行の active REQ は REQ-0101 から REQ-0111 までの 11 件`; lines 33-43 list only 11 REQs (missing REQ-0112, REQ-0113, REQ-0114) |
| current_text_or_behavior | Guide says "11件" and lists only REQ-0101~0111, missing 3 active REQs |
| expected_source_of_truth | Active REQ set is 14 REQs (REQ-0101~0114) per docs/DOC-MAP.md, docs/requirements/README.md (REQ-0101-006, REQ-0101-012) |
| recommended_route | RU-0004 |
| target_ru | RU-0004 |
| prevention_candidate | integrity-check should verify guide REQ counts match actual inventory |

---

### INC-0011: REQ-0101 references non-existent workflow-overview guide

| Field | Value |
|-------|-------|
| id | INC-0011 |
| category | canonical_drift |
| severity | high |
| status | open |
| evidence | `docs/requirements/REQ-0101.md:30` (REQ-0101-014) — `docs/guides/ は README.md（入口）と 10 ガイド（quickstart, command-selection, req-case-flow, intake-learning-backlog-flow, diagnostics-and-maintenance, artifacts-and-state, project-docs-and-specs, troubleshooting, glossary, workflow-overview）で構成する`; `docs/requirements/REQ-0101.md:41` (REQ-0101-025) — `旧 3 ガイド（workflow-overview, artifact-model, domain-state-lifecycle）は削除すること（SHALL）` |
| current_text_or_behavior | REQ-0101-014 lists `workflow-overview` as one of 10 guides, but REQ-0101-025 says `workflow-overview` should be deleted. File does not exist. Only 9 actual guide files exist. Also, guides/README.md lists only 9 guides (no workflow-overview). Internal REQ contradiction between -014 and -025 |
| expected_source_of_truth | REQ-0101-014 and REQ-0101-025 cannot both be true simultaneously — if workflow-overview is deleted per -025, then -014's 10-guide list is stale. Either REQ-0101-014 needs updating to 9 guides without workflow-overview, or workflow-overview needs to exist (REQ-0101 self-consistency) |
| recommended_route | RU-0004 |
| target_ru | RU-0004 |
| prevention_candidate | integrity-check should verify REQ internal consistency (guide count vs guide list vs actual files) |

---

### INC-0012: integrity-check command deprecated but in README inventory

| Field | Value |
|-------|-------|
| id | INC-0012 |
| category | canonical_drift |
| severity | low |
| status | open |
| evidence | Integrity check reports: `cmd-deprecated-in-inventory: Command 'integrity-check' is marked deprecated but listed in command README inventory` |
| current_text_or_behavior | The `integrity-check` command is marked deprecated in its frontmatter but still appears in the command README active inventory |
| expected_source_of_truth | Deprecated commands should be removed from active inventory or clearly marked (REQ-0103) |
| recommended_route | RU-0002 |
| target_ru | RU-0002 |
| prevention_candidate | integrity-check should flag deprecated commands in active inventory |

---

### INC-0013: REQ-0101 internal contradiction on workflow-overview

| Field | Value |
|-------|-------|
| id | INC-0013 |
| category | semantic_conflict |
| severity | high |
| status | open |
| evidence | `docs/requirements/REQ-0101.md:30` (REQ-0101-014) mandates 10 guides including `workflow-overview`; `docs/requirements/REQ-0101.md:35` (REQ-0101-019) mandates `workflow-overview` content structure; `docs/requirements/REQ-0101.md:41` (REQ-0101-025) mandates deletion of `workflow-overview` |
| current_text_or_behavior | Same REQ simultaneously requires workflow-overview to exist (014, 019) and be deleted (025) |
| expected_source_of_truth | Active REQ must be internally consistent. If -025 supersedes -014's workflow-overview reference, -014 and -019 must be updated to remove workflow-overview and adjust guide count (REQ-0101-006 APPEND/UPDATE principle) |
| recommended_route | RU-0004 |
| target_ru | RU-0004 |
| prevention_candidate | integrity-check should detect intra-REQ contradictions where same entity is both required and prohibited |

---

### INC-0014: Unaccepted ADRs cited in active REQ-0112

| Field | Value |
|-------|-------|
| id | INC-0014 |
| category | semantic_conflict |
| severity | medium |
| status | open |
| evidence | `docs/requirements/REQ-0112.md` — cites ADR-0004 (status: superseded), ADR-0009 (status: deprecated), ADR-0014 (status: superseded) |
| current_text_or_behavior | Active REQ-0112 references non-accepted ADRs as basis for requirements |
| expected_source_of_truth | Only accepted ADRs should be cited as current authority. Non-accepted ADRs may be cited as historical context with clear marking (AGENTS.md source-of-truth priority, REQ-0101-008) |
| recommended_route | RU-0004 |
| target_ru | RU-0004 |
| prevention_candidate | integrity-check accepted-adr-only-citation check exists but should escalate to NG for active REQ citing non-accepted ADRs |

---

### INC-0015: Unaccepted ADR-0001 (proposed) cited in patterns.md

| Field | Value |
|-------|-------|
| id | INC-0015 |
| category | semantic_conflict |
| severity | medium |
| status | open |
| evidence | `docs/specs/patterns.md` — cites ADR-0001 (status: proposed) |
| current_text_or_behavior | SPEC file cites a proposed (not accepted) ADR as reference |
| expected_source_of_truth | SPEC should cite only accepted ADRs as authoritative basis (AGENTS.md source-of-truth priority) |
| recommended_route | RU-0004 |
| target_ru | RU-0004 |
| prevention_candidate | integrity-check should flag SPEC citations of non-accepted ADRs |

---

### INC-0016: Retired REQ referenced as current authority in ADR files

| Field | Value |
|-------|-------|
| id | INC-0016 |
| category | semantic_conflict |
| severity | medium |
| status | open |
| evidence | Integrity check reports 23 `retired-req-as-current` warnings: ADR-0003 (REQ-0007), ADR-0004 (REQ-0004), ADR-0005 (REQ-0017), ADR-0006 (REQ-0020), ADR-0007 (REQ-0004), ADR-0008 (REQ-0004), ADR-0009 (REQ-0001, REQ-0040, REQ-0023, REQ-0039, REQ-0041), ADR README (REQ-0016, REQ-0007, REQ-0004, REQ-0017, REQ-0020, REQ-0035, REQ-0041), patterns.md (REQ-0001), system.md (REQ-0001), project-docs-and-specs.md (REQ-0001) |
| current_text_or_behavior | Accepted ADRs and non-retired docs reference retired REQ numbers without marking them as historical |
| expected_source_of_truth | Retired REQ references must be clearly marked as historical, not current authority (REQ-0101-016, AGENTS.md). `mapping-table.md` migration references are exempt per REQ-0101-016 |
| recommended_route | RU-0004 |
| target_ru | RU-0004 |
| prevention_candidate | integrity-check retired-req-as-current detection exists (WARNING level); consider requiring historical annotation for non-exempt references |

---

### INC-0017: system.md stale REQ range contradicts DOC-MAP and README

| Field | Value |
|-------|-------|
| id | INC-0017 |
| category | semantic_conflict |
| severity | high |
| status | open |
| evidence | `docs/specs/system.md:213` — `REQ-0101〜0109` (9 REQs); `docs/DOC-MAP.md` — lists REQ-0101~0114 (14 REQs); `docs/README.md` — lists REQ-0101~0114 (14 REQs) |
| current_text_or_behavior | system.md (SPEC, higher authority) says 9 active REQs while DOC-MAP and docs/README (lower authority) correctly show 14. SPEC contradicts the actual state |
| expected_source_of_truth | Source-of-truth priority: active REQ > accepted ADR > SPEC > guides. SPEC should reflect current state accurately (REQ-0101-009, AGENTS.md) |
| recommended_route | RU-0004 |
| target_ru | RU-0004 |
| prevention_candidate | integrity-check should cross-verify SPEC REQ ranges against actual REQ file inventory |

---

### INC-0018: Guides contain MUST/SHALL references

| Field | Value |
|-------|-------|
| id | INC-0018 |
| category | semantic_conflict |
| severity | low |
| status | open |
| evidence | `docs/guides/project-docs-and-specs.md:80` — `MUST/SHALL 表現を含まない（ADR-0017）`; `docs/guides/README.md:5` — `MUST/SHALL 等の規範表現を含まず` |
| current_text_or_behavior | Guides contain the literal strings "MUST" and "SHALL" in meta-statements about their own non-normative nature. While the intent is to declare non-normative status, this technically violates REQ-0101-027 which prohibits MUST/SHALL in guides without exception |
| expected_source_of_truth | REQ-0101-027: "ガイド内に MUST/SHALL 規範表現、load_skills / implementation_pattern / Pattern 詳細、REQ番号注記を含めないこと（SHALL）" |
| recommended_route | RU-0004 |
| target_ru | RU-0004 |
| prevention_candidate | Integrity check should detect MUST/SHALL in guide files. Consider adding exception for meta-statements about guide nature (may require REQ clarification) |

---

### INC-0019: REQ-0105 contains workflow status management

| Field | Value |
|-------|-------|
| id | INC-0019 |
| category | boundary_violation |
| severity | high |
| status | resolved_annotated |
| resolved_by | #582 |
| resolution | Clarifying annotation added to REQ-0105 (Design Notes section): `status: reviewed` / `status: saved` are lightweight document lifecycle annotations for backlog-review drafts, not a workflow state management model. The integrity check false positives are caused by regex matching "backlog-review" (contains "review") alongside "status", and "requirement-unit" + "domain-state" in tags. The actual 6 NG hits are all false positives from the detection pattern |
| evidence | Integrity check reports 6 NG for `workflow-status-prohibition`: `docs/requirements/REQ-0105.md:6,57,58,59,60,65` — tags include workflow phases, requirements reference `status: reviewed`, `status: saved`, and 6 micro-phase state management |
| current_text_or_behavior | REQ-0105 defines `status: reviewed`, `status: saved` workflow states and references 6 micro-phase state management (requirement/analyzed/created/in_progress/review/done) |
| expected_source_of_truth | REQ/SPEC must not define workflow status state management per REQ-0108-123. Workflow states are implementation concerns, not requirements-level specifications (REQ-0103, ADR-0013) |
| recommended_route | RU-0005 |
| target_ru | RU-0005 |
| prevention_candidate | integrity-check workflow-status-prohibition check exists and correctly detects this; fix the underlying REQ content |

---

### INC-0020: REQ-0108 contains self-referential workflow status detection

| Field | Value |
|-------|-------|
| id | INC-0020 |
| category | boundary_violation |
| severity | medium |
| status | resolved_fixed |
| resolved_by | #582 |
| resolution | Added self-exemption clause to REQ-0108-123: replaced literal 6 micro-phase terms with abstracted reference "本要件（REQ-0108-123）が列挙する 6 種のマイクロフェーズ" and added explicit self-exemption "本要件自体（REQ-0108-123）は検出対象から除外する（自己参照免除）" |
| evidence | `docs/requirements/REQ-0108.md:139` (REQ-0108-123) — `integrity-check は REQ/SPEC に workflow status が追加されている記述、または 6 マイクロフェーズ（requirement/analyzed/created/in_progress/review/done）を状態管理モデルとして扱う記述の検出を禁止すること（SHALL）` |
| current_text_or_behavior | REQ-0108 itself contains the forbidden 6 micro-phase terms in the detection requirement. The integrity check correctly flags this as NG |
| expected_source_of_truth | REQ should define what to detect without containing the forbidden terms itself, or should self-exempt (REQ-0108 self-consistency) |
| recommended_route | RU-0005 |
| target_ru | RU-0005 |
| prevention_candidate | integrity-check should allow self-referential detection rules or use abstracted references to forbidden patterns |

---

### INC-0021: patterns.md references workflow status field prohibition

| Field | Value |
|-------|-------|
| id | INC-0021 |
| category | boundary_violation |
| severity | medium |
| status | resolved_false_positive |
| resolved_by | #582 |
| resolution | False positive confirmed. patterns.md:53 PROHIBITS status fields (`status および scale フィールドは持たない`). The integrity check regex matches because "created" (a REQ frontmatter field name listed in the prohibition) is also a 6-micro-phase term. The SPEC text is correct — no change needed. integrity-check detection needs refinement to distinguish prohibition statements (e.g., "持たない", "のみ") from usage statements. Recommend adding negative context matching for prohibition keywords |
| evidence | `docs/specs/patterns.md:53` — `フィールドは id, title, created, updated, tags のみ。status および scale フィールドは持たない` |
| current_text_or_behavior | SPEC correctly prohibits status fields, but integrity check detects this as workflow-status-prohibition NG because the detection pattern matches the prohibition text itself |
| expected_source_of_truth | SPEC should describe format rules. The detection may need refinement to distinguish "prohibiting status" from "using status" (REQ-0108-123) |
| recommended_route | RU-0005 |
| target_ru | RU-0005 |
| prevention_candidate | integrity-check workflow-status detection should distinguish prohibition statements from usage statements |

---

### INC-0022: Commands with embedded judgment logic beyond thin command principle

| Field | Value |
|-------|-------|
| id | INC-0022 |
| category | boundary_violation |
| severity | medium |
| status | documented |
| resolved_by | #582 |
| resolution | Documented in #582 PR description with specific line ranges and extraction recommendations. Full extraction deferred to a separate issue — too invasive for this PR. See PR description for detailed analysis |
| evidence | `case-open.md:29-78` (Epic vs Standard flow branching with Wave scheduling); `case-run.md:33-114` (state machine with multi-issue/Epic/single-issue branches, self-healing loop logic); `req-save.md:31-47` (APPEND/UPDATE/SPLIT classification gate with user interaction handling); `case-close.md:25-29` (達成判定プロトコル with 5-condition evaluation and self-resolution classification) |
| current_text_or_behavior | Multiple commands contain complex conditional logic, multi-step decision trees, and detailed judgment protocols that should be in skills per "commands thin" principle |
| expected_source_of_truth | REQ-0103: commands should be thin (public API, inputs, outputs, guardrails, high-level steps). Reusable judgment belongs in skills (ADR-0013, AGENTS.md editing guardrails) |
| recommended_route | RU-0005 |
| target_ru | RU-0005 |
| prevention_candidate | integrity-check should measure command complexity (line count, steps count, conditional density) and flag commands exceeding thresholds |

---

### INC-0023: Hardcoded completion report fields across skills

| Field | Value |
|-------|-------|
| id | INC-0023 |
| category | boundary_violation |
| severity | low |
| status | documented |
| resolved_by | #582 |
| resolution | Documented in #582 PR description with scope analysis. ~39 skill/command files hardcode 6 completion report field names. Full centralization deferred to a separate issue. Recommend creating a completion report template in `.opencode/skills/agentdev-workflow-templates/templates/` and having skills reference it |
| evidence | Multiple skill files hardcode the 6 completion report field names (完了コマンド, 対象, 結果, 検証結果, git 永続化, 次のコマンド). Found in ~39 skill/command files. `agentdev-gh-cli/SKILL.md:180-189` hardcodes "検証結果" field format |
| current_text_or_behavior | Completion report field names and formats are duplicated across skills instead of being centralized in templates or vocabulary registry |
| expected_source_of_truth | REQ-0103: "fixed wording in templates". REQ-0107 defines completion report format. Should be single-sourced from template (REQ-0103, ADR-0013) |
| recommended_route | RU-0005 |
| target_ru | RU-0005 |
| prevention_candidate | Create completion report template with canonical field names. integrity-check should verify field name consistency |

---

### INC-0024: Missing integrity checks for Pattern A/B/C/D and req-backlog residual

| Field | Value |
|-------|-------|
| id | INC-0024 |
| category | prevention_gap |
| severity | high |
| status | open |
| evidence | `check_integrity.ts` — REQ-0108-111 (Pattern A/B/C/D residual detection) not implemented; REQ-0108-112 (req-backlog residual detection) not implemented; REQ-0108-126/127 (abolished skill reference detection for agentdev-workflow-reporting) not implemented |
| current_text_or_behavior | Three REQ-mandated integrity check categories are not implemented in the integrity check script |
| expected_source_of_truth | REQ-0108-111, REQ-0108-112, REQ-0108-126~127 mandate these checks (SHALL) |
| recommended_route | RU-0006 |
| target_ru | RU-0006 |
| prevention_candidate | Implement missing check categories. Add regression tests per REQ-0108-049 |

---

### INC-0025: No vocabulary registry for canonical terminology

| Field | Value |
|-------|-------|
| id | INC-0025 |
| category | prevention_gap |
| severity | high |
| status | open |
| evidence | No dedicated vocabulary registry file exists in the repository. Terminology (work_type values, completion report field names, namespace conventions, artifact path patterns) is scattered across REQ, SPEC, skills, and commands |
| current_text_or_behavior | No single source of truth for valid terms, names, and field labels. Each file hardcodes its own copy |
| expected_source_of_truth | REQ-0103 (canonical paths and names), REQ-0107 (completion report fields), ADR-0005 (namespace) define terminology but it is not centrally registered |
| recommended_route | RU-0006 |
| target_ru | RU-0006 |
| prevention_candidate | Create vocabulary registry (e.g., `.opencode/skills/agentdev-integrity/references/vocabulary.md`). integrity-check should validate adherence to registry |

---

### INC-0026: Missing regression tests for known inconsistency types

| Field | Value |
|-------|-------|
| id | INC-0026 |
| category | prevention_gap |
| severity | medium |
| status | open |
| evidence | 12 test files exist for integrity scripts, but no regression tests for: Pattern A/B/C/D residual, req-backlog residual, abolished skill references, SPEC REQ range staleness, guide count mismatch, AGENTS.md REQ range |
| current_text_or_behavior | Regression test coverage exists for reference paths, command structure, template structure, skill structure, and legacy namespace detection — but not for several REQ-mandated check categories |
| expected_source_of_truth | REQ-0108-049: "integrity-check の検査ルール変更には regression fixture / test を含めること（SHALL）" |
| recommended_route | RU-0006 |
| target_ru | RU-0006 |
| prevention_candidate | Add regression test fixtures and test cases for all REQ-0108-mandated check categories |

---

### INC-0027: No integrity check for REQ range staleness in AGENTS.md and SPEC

| Field | Value |
|-------|-------|
| id | INC-0027 |
| category | prevention_gap |
| severity | medium |
| status | open |
| evidence | AGENTS.md:17 states "REQ-0101 through REQ-0111" but actual is REQ-0101~0114. system.md:213 states "REQ-0101〜0109" but actual is REQ-0101~0114. No integrity check category validates that textual REQ ranges match actual REQ file inventory |
| current_text_or_behavior | Documents containing stale REQ ranges are not detected by integrity check |
| expected_source_of_truth | REQ-0108 mandates comprehensive integrity checking. Stale ranges in AGENTS.md and SPEC are a form of canonical drift that should be detected (REQ-0108-001 scan targets include AGENTS.md, SPEC) |
| recommended_route | RU-0006 |
| target_ru | RU-0006 |
| prevention_candidate | Add REQ range consistency check: scan AGENTS.md, SPEC, guides for "REQ-NNNN" range patterns and verify against actual REQ file inventory |

---

### INC-0028: DOC-MAP REQ table stale — lists only 8 SPEC files

| Field | Value |
|-------|-------|
| id | INC-0028 |
| category | canonical_drift |
| severity | low |
| status | open |
| evidence | `docs/DOC-MAP.md` Specifications section lists 8 SPEC files. `docs/specs/README.md` lists 8 SPEC files. Actual SPEC files in `docs/specs/` match. This entry is informational — DOC-MAP SPEC section is current. However, DOC-MAP does not cross-reference REQ-0101~0114 guide requirement (10 guides) vs actual (9 guides + README) |
| current_text_or_behavior | DOC-MAP SPEC section is current, but guide section lists 10 guides (including implicit workflow-overview expectation from REQ-0101-014) while only 9 actual guide files exist |
| expected_source_of_truth | DOC-MAP is navigation layer. Guide section should reflect actual files (REQ-0101-010, REQ-0101-024~025) |
| recommended_route | RU-0002 |
| target_ru | RU-0002 |
| prevention_candidate | integrity-check should verify DOC-MAP entries against actual file inventory |

---

### INC-0029: Retired REQ references in ADR-0003 and ADR-0009 describe req-backlog as current flow

| Field | Value |
|-------|-------|
| id | INC-0029 |
| category | semantic_conflict |
| severity | medium |
| status | open |
| evidence | `docs/adr/ADR-0003.md:41` — `promoted artifact → req-backlog（RU 生成）→ issue-req → issue-save-req → issue-create → issue-work の流れが確立`; `docs/adr/ADR-0009.md:15` — `REQ-0039 (retired)（req-backlog/RU削除モデル）の間で promoted artifact の扱いが衝突` |
| current_text_or_behavior | Accepted ADR-0003 describes the old req-backlog → issue-req workflow as an established current flow. ADR-0009 (deprecated) references the conflict. Neither is updated to reflect that req-backlog is abolished and commands are renamed |
| expected_source_of_truth | ADR-0003 is accepted and should either be updated to reflect current state or marked as partially historical. ADR-0009 is deprecated and should not be cited as current authority (AGENTS.md, REQ-0101-016) |
| recommended_route | RU-0004 |
| target_ru | RU-0004 |
| prevention_candidate | integrity-check should flag accepted ADRs that describe abolished workflows without historical annotation |
