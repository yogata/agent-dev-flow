# check_integrity.ts Report

- **実行日時**: 2026-06-04 14:13
- **スキャン対象**: REQ 13件、ADR 18件、Skill 21件、Command 16件、Guides 10件、Specs 9件、RetiredREQ 50件、DocMap 1件

## サマリ

| レベル | 件数 |
|--------|------|
| OK | 122 |
| NG | 32 |
| Warning | 47 |
| Info | 1 |

## 詳細

### Namespace
- **[NG]** legacy-namespace: Legacy pattern '/case-run (bare slash form)' found (.opencode/skills/agentdev-workflow-orchestration/SKILL.md)
- **[NG]** legacy-namespace: Legacy pattern '/case-close (bare slash form)' found (.opencode/commands/agentdev/case-close.md)
- **[NG]** legacy-namespace: Legacy pattern '/case-open (bare slash form)' found (.opencode/commands/agentdev/case-open.md)
- **[NG]** legacy-namespace: Legacy pattern '/case-update (bare slash form)' found (.opencode/commands/agentdev/case-update.md)
- **[NG]** legacy-namespace: Legacy pattern '/req-define (bare slash form)' found (.opencode/commands/agentdev/req-define.md)
- **[NG]** legacy-namespace: Legacy pattern '/req-save (bare slash form)' found (.opencode/commands/agentdev/req-save.md)
- **[NG]** expanded-legacy-namespace: Legacy pattern '/case-run (bare slash form)' found (.opencode/skills/agentdev-workflow-orchestration/SKILL.md)
- **[NG]** expanded-legacy-namespace: Legacy pattern '/case-close (bare slash form)' found (.opencode/commands/agentdev/case-close.md)
- **[NG]** expanded-legacy-namespace: Legacy pattern '/case-open (bare slash form)' found (.opencode/commands/agentdev/case-open.md)
- **[NG]** expanded-legacy-namespace: Legacy pattern '/case-update (bare slash form)' found (.opencode/commands/agentdev/case-update.md)
- **[NG]** expanded-legacy-namespace: Legacy pattern '/req-define (bare slash form)' found (.opencode/commands/agentdev/req-define.md)
- **[NG]** expanded-legacy-namespace: Legacy pattern '/req-save (bare slash form)' found (.opencode/commands/agentdev/req-save.md)
- **[NG]** expanded-legacy-namespace: Legacy pattern '/case-close (bare slash form)' found (docs/specs/system.md)
- **[NG]** expanded-legacy-namespace: Legacy pattern '/req-define (bare slash form)' found (docs/specs/system.md)

### LinkIntegrity
- **[NG]** broken-file-link: Link target does not exist: REQ-NNNN.md (docs/requirements/REQ-0108.md) → route: intake
  - evidence: `REQ-NNNN.md`
  - expected: `file must exist`
- **[WARNING]** retired-req-as-current: REQ-0007 is retired but referenced in non-retired file (docs/adr/ADR-0003.md) → route: intake
  - evidence: `REQ-0007`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0004 is retired but referenced in non-retired file (docs/adr/ADR-0004.md) → route: intake
  - evidence: `REQ-0004`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0017 is retired but referenced in non-retired file (docs/adr/ADR-0005.md) → route: intake
  - evidence: `REQ-0017`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0020 is retired but referenced in non-retired file (docs/adr/ADR-0006.md) → route: intake
  - evidence: `REQ-0020`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0004 is retired but referenced in non-retired file (docs/adr/ADR-0007.md) → route: intake
  - evidence: `REQ-0004`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0004 is retired but referenced in non-retired file (docs/adr/ADR-0008.md) → route: intake
  - evidence: `REQ-0004`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0001 is retired but referenced in non-retired file (docs/adr/ADR-0009.md) → route: intake
  - evidence: `REQ-0001`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0040 is retired but referenced in non-retired file (docs/adr/ADR-0009.md) → route: intake
  - evidence: `REQ-0040`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0023 is retired but referenced in non-retired file (docs/adr/ADR-0009.md) → route: intake
  - evidence: `REQ-0023`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0039 is retired but referenced in non-retired file (docs/adr/ADR-0009.md) → route: intake
  - evidence: `REQ-0039`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0041 is retired but referenced in non-retired file (docs/adr/ADR-0009.md) → route: intake
  - evidence: `REQ-0041`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0016 is retired but referenced in non-retired file (docs/adr/README.md) → route: intake
  - evidence: `REQ-0016`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0007 is retired but referenced in non-retired file (docs/adr/README.md) → route: intake
  - evidence: `REQ-0007`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0004 is retired but referenced in non-retired file (docs/adr/README.md) → route: intake
  - evidence: `REQ-0004`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0017 is retired but referenced in non-retired file (docs/adr/README.md) → route: intake
  - evidence: `REQ-0017`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0020 is retired but referenced in non-retired file (docs/adr/README.md) → route: intake
  - evidence: `REQ-0020`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0035 is retired but referenced in non-retired file (docs/adr/README.md) → route: intake
  - evidence: `REQ-0035`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0041 is retired but referenced in non-retired file (docs/adr/README.md) → route: intake
  - evidence: `REQ-0041`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0001 is retired but referenced in non-retired file (docs/specs/patterns.md) → route: intake
  - evidence: `REQ-0001`
  - expected: `retired REQs should not be referenced as current requirements`
- **[NG]** broken-file-link: Link target does not exist: ../../.opencode/skills/agentdev-workflow-lifecycle/references/capture-boundaries.md (docs/specs/system.md) → route: intake
  - evidence: `../../.opencode/skills/agentdev-workflow-lifecycle/references/capture-boundaries.md`
  - expected: `file must exist`
- **[WARNING]** retired-req-as-current: REQ-0001 is retired but referenced in non-retired file (docs/specs/system.md) → route: intake
  - evidence: `REQ-0001`
  - expected: `retired REQs should not be referenced as current requirements`
- **[WARNING]** retired-req-as-current: REQ-0001 is retired but referenced in non-retired file (docs/guides/project-docs-and-specs.md) → route: intake
  - evidence: `REQ-0001`
  - expected: `retired REQs should not be referenced as current requirements`

### LifecycleBoundary
- **[WARNING]** retired-req-primary-ref: REQ-0007 is retired but referenced in docs/adr/ADR-0003.md (docs/adr/ADR-0003.md) → route: intake
  - evidence: `REQ-0007`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0004 is retired but referenced in docs/adr/ADR-0004.md (docs/adr/ADR-0004.md) → route: intake
  - evidence: `REQ-0004`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0017 is retired but referenced in docs/adr/ADR-0005.md (docs/adr/ADR-0005.md) → route: intake
  - evidence: `REQ-0017`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0020 is retired but referenced in docs/adr/ADR-0006.md (docs/adr/ADR-0006.md) → route: intake
  - evidence: `REQ-0020`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0004 is retired but referenced in docs/adr/ADR-0007.md (docs/adr/ADR-0007.md) → route: intake
  - evidence: `REQ-0004`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0004 is retired but referenced in docs/adr/ADR-0008.md (docs/adr/ADR-0008.md) → route: intake
  - evidence: `REQ-0004`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0001 is retired but referenced in docs/adr/ADR-0009.md (docs/adr/ADR-0009.md) → route: intake
  - evidence: `REQ-0001`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0040 is retired but referenced in docs/adr/ADR-0009.md (docs/adr/ADR-0009.md) → route: intake
  - evidence: `REQ-0040`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0023 is retired but referenced in docs/adr/ADR-0009.md (docs/adr/ADR-0009.md) → route: intake
  - evidence: `REQ-0023`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0039 is retired but referenced in docs/adr/ADR-0009.md (docs/adr/ADR-0009.md) → route: intake
  - evidence: `REQ-0039`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0041 is retired but referenced in docs/adr/ADR-0009.md (docs/adr/ADR-0009.md) → route: intake
  - evidence: `REQ-0041`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0016 is retired but referenced in docs/adr/README.md (docs/adr/README.md) → route: intake
  - evidence: `REQ-0016`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0007 is retired but referenced in docs/adr/README.md (docs/adr/README.md) → route: intake
  - evidence: `REQ-0007`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0004 is retired but referenced in docs/adr/README.md (docs/adr/README.md) → route: intake
  - evidence: `REQ-0004`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0017 is retired but referenced in docs/adr/README.md (docs/adr/README.md) → route: intake
  - evidence: `REQ-0017`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0020 is retired but referenced in docs/adr/README.md (docs/adr/README.md) → route: intake
  - evidence: `REQ-0020`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0035 is retired but referenced in docs/adr/README.md (docs/adr/README.md) → route: intake
  - evidence: `REQ-0035`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0041 is retired but referenced in docs/adr/README.md (docs/adr/README.md) → route: intake
  - evidence: `REQ-0041`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0001 is retired but referenced in docs/specs/patterns.md (docs/specs/patterns.md) → route: intake
  - evidence: `REQ-0001`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0001 is retired but referenced in docs/specs/system.md (docs/specs/system.md) → route: intake
  - evidence: `REQ-0001`
  - expected: `retired REQs should not be primary references`
- **[WARNING]** retired-req-primary-ref: REQ-0001 is retired but referenced in docs/guides/project-docs-and-specs.md (docs/guides/project-docs-and-specs.md) → route: intake
  - evidence: `REQ-0001`
  - expected: `retired REQs should not be primary references`
- **[NG]** workflow-status-prohibition: Workflow status / 6 micro-phase state management pattern detected in REQ/SPEC (docs/requirements/REQ-0105.md:6) → route: intake
  - evidence: `tags: [intake, learning, backlog-review, backlog-save, requirement-unit, domain-state]`
  - expected: `REQ/SPEC must not define workflow status state management`
- **[NG]** workflow-status-prohibition: Workflow status / 6 micro-phase state management pattern detected in REQ/SPEC (docs/requirements/REQ-0105.md:57) → route: intake
  - evidence: `| REQ-0105-041 | `backlog-review` が生成する draft は `status: reviewed` を持つこと（SHALL） |`
  - expected: `REQ/SPEC must not define workflow status state management`
- **[NG]** workflow-status-prohibition: Workflow status / 6 micro-phase state management pattern detected in REQ/SPEC (docs/requirements/REQ-0105.md:58) → route: intake
  - evidence: `| REQ-0105-042 | `backlog-save` は `.sisyphus/drafts/backlog-review-{topic-slug}.md` を入力として読み込み、`status: reviewed` の draft のみを処理対象とすること（SHALL） |`
  - expected: `REQ/SPEC must not define workflow status state management`
- **[NG]** workflow-status-prohibition: Workflow status / 6 micro-phase state management pattern detected in REQ/SPEC (docs/requirements/REQ-0105.md:59) → route: intake
  - evidence: `| REQ-0105-043 | `backlog-save` は RU 生成、成功 artifact 削除、git commit/push が成功した後、当該 backlog-review draft の `status` を `saved` に更新すること（SHALL） |`
  - expected: `REQ/SPEC must not define workflow status state management`
- **[NG]** workflow-status-prohibition: Workflow status / 6 micro-phase state management pattern detected in REQ/SPEC (docs/requirements/REQ-0105.md:60) → route: intake
  - evidence: `| REQ-0105-044 | `backlog-save` は `status: saved` の backlog-review draft を再処理してはならない（MUST NOT） |`
  - expected: `REQ/SPEC must not define workflow status state management`
- **[NG]** workflow-status-prohibition: Workflow status / 6 micro-phase state management pattern detected in REQ/SPEC (docs/requirements/REQ-0105.md:65) → route: intake
  - evidence: `- **対象**: intake、learning、backlog-review、backlog-save、backlog-review ↔ backlog-save の受け渡し（`.sisyphus/drafts/backlog-review-*.md`）、RU lifecycle、session-sourced RU、`.agentdev/` domain state、`intake-review` の後続ルート提示・判定表・結果レポート・完了報告、`.agentdev/intake/accepted/` の状態意味、通常 intake と REQ再構成intake の後続ルート分離`
  - expected: `REQ/SPEC must not define workflow status state management`
- **[NG]** workflow-status-prohibition: Workflow status / 6 micro-phase state management pattern detected in REQ/SPEC (docs/requirements/REQ-0108.md:139) → route: intake
  - evidence: `| REQ-0108-123 | `integrity-check` は REQ/SPEC に workflow status が追加されている記述、または 6 マイクロフェーズ（requirement/analyzed/created/in_progress/review/done）を状態管理モデルとして扱う記述の検出を禁止すること（SHALL） |`
  - expected: `REQ/SPEC must not define workflow status state management`
- **[NG]** workflow-status-prohibition: Workflow status / 6 micro-phase state management pattern detected in REQ/SPEC (docs/specs/patterns.md:53) → route: intake
  - evidence: `- フィールドは `id`, `title`, `created`, `updated`, `tags` のみ。`status` および `scale` フィールドは持たない`
  - expected: `REQ/SPEC must not define workflow status state management`

### Implementation Pattern
- **[INFO]** command-map-consistency: [recommendation: no-action] No command patterns parsed from command-map.md

### Command
- **[WARNING]** cmd-deprecated-in-inventory: Command 'integrity-check' is marked deprecated but listed in command README inventory (.opencode/commands/agentdev/integrity-check.md) → route: intake
  - evidence: `integrity-check deprecated but in README`
  - expected: `deprecated commands should be removed from active inventory`

### ReferencePath
- **[NG]** reference-path-existence: Referenced path does not exist: references/git-common-procedures.md (.opencode/commands/agentdev/case-close.md:34) → route: intake
  - evidence: `references/git-common-procedures.md`
  - expected: `file must exist at references/git-common-procedures.md`
- **[NG]** reference-path-existence: Referenced path does not exist: references/git-common-procedures.md (.opencode/commands/agentdev/case-close.md:41) → route: intake
  - evidence: `references/git-common-procedures.md`
  - expected: `file must exist at references/git-common-procedures.md`
- **[NG]** reference-path-existence: Referenced path does not exist: references/git-common-procedures.md (.opencode/commands/agentdev/case-close.md:55) → route: intake
  - evidence: `references/git-common-procedures.md`
  - expected: `file must exist at references/git-common-procedures.md`
- **[NG]** reference-path-existence: Referenced path does not exist: references/capture-boundaries.md (.opencode/commands/agentdev/case-close.md:61) → route: intake
  - evidence: `references/capture-boundaries.md`
  - expected: `file must exist at references/capture-boundaries.md`
- **[NG]** reference-path-existence: Referenced path does not exist: references/git-common-procedures.md (.opencode/commands/agentdev/case-close.md:64) → route: intake
  - evidence: `references/git-common-procedures.md`
  - expected: `file must exist at references/git-common-procedures.md`
- **[NG]** reference-path-existence: Referenced path does not exist: references/capture-boundaries.md (.opencode/commands/agentdev/case-run.md:143) → route: intake
  - evidence: `references/capture-boundaries.md`
  - expected: `file must exist at references/capture-boundaries.md`
- **[NG]** reference-path-existence: Referenced path does not exist: references/git-common-procedures.md (.opencode/commands/agentdev/integrity-check.md:34) → route: intake
  - evidence: `references/git-common-procedures.md`
  - expected: `file must exist at references/git-common-procedures.md`
- **[NG]** reference-path-existence: Referenced path does not exist: templates/doc_requirement.md (.opencode/commands/agentdev/req-define.md:40) → route: intake
  - evidence: `templates/doc_requirement.md`
  - expected: `file must exist at templates/doc_requirement.md`

### ADR
- **[WARNING]** accepted-adr-only-citation: Non-accepted ADR ADR-0004 (status: superseded) cited in docs/requirements/REQ-0112.md (docs/requirements/REQ-0112.md) → route: intake
  - evidence: `ADR-0004`
  - expected: `only accepted ADRs should be cited as current basis`
- **[WARNING]** accepted-adr-only-citation: Non-accepted ADR ADR-0009 (status: deprecated) cited in docs/requirements/REQ-0112.md (docs/requirements/REQ-0112.md) → route: intake
  - evidence: `ADR-0009`
  - expected: `only accepted ADRs should be cited as current basis`
- **[WARNING]** accepted-adr-only-citation: Non-accepted ADR ADR-0014 (status: superseded) cited in docs/requirements/REQ-0112.md (docs/requirements/REQ-0112.md) → route: intake
  - evidence: `ADR-0014`
  - expected: `only accepted ADRs should be cited as current basis`
- **[WARNING]** accepted-adr-only-citation: Non-accepted ADR ADR-0001 (status: proposed) cited in docs/specs/patterns.md (docs/specs/patterns.md) → route: intake
  - evidence: `ADR-0001`
  - expected: `only accepted ADRs should be cited as current basis`
