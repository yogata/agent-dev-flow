# AGENTS.md

Repository guardrails for agents editing AgentDevFlow. Keep this file short: it should contain only rules that are useful on nearly every change. Put detailed workflows in active REQ, ADR, specs, guides, skills, templates, or scripts.

## Project identity

- This repository manages the AgentDevFlow plugin.
- Public commands use the `/agentdev/*` namespace and live under `.opencode/commands/agentdev/`.
- AgentDevFlow skills use the `agentdev-*` prefix and live under `.opencode/skills/`.
- Persistent AgentDevFlow domain state lives under `.agentdev/`.
- Do not reintroduce legacy `/issue/*`, `/tips/*`, `issue-*`, or `tips-*` names unless an active REQ or ADR explicitly requires a compatibility note.

## Source-of-truth priority

When documents disagree, prefer sources in this order:

1. Active REQ: `docs/requirements/REQ-0101.md` through `docs/requirements/REQ-0114.md`.
2. ADR: `docs/adr/ADR-*.md` for accepted architecture decisions.
3. Specs: `docs/specs/*.md` for current system behavior and format rules.
4. Guides and indexes: `docs/guides/*.md`, `docs/DOC-MAP.md`, and README files for navigation and operator-facing explanation.
5. Retired REQ: `docs/requirements/retired/REQ-*.md` and `docs/requirements/mapping-table.md` for history only.

Do not cite retired REQ as current authority. If a retired REQ is mentioned in non-retired material, mark it clearly as historical or point to the active successor.

## Artifact boundaries

- `.agentdev/` is canonical persistent domain state for intake, learning, backlog RU, and integrity artifacts.
- `.sisyphus/` is runtime workspace. Do not treat it as current AgentDevFlow domain state or a current REQ source of truth.
- `.sisyphus/drafts/` may be used only where an active command workflow explicitly defines a working draft handoff.
- Skill support material uses `references/` as the canonical directory. Treat `reference/` as obsolete unless documenting migration history.
- Do not move artifacts across `.agentdev/`, `.sisyphus/`, `docs/`, commands, or skills unless the relevant active REQ, ADR, or command workflow requires it.

## Editing guardrails

- Keep commands thin: public API, inputs, outputs, guardrails, and high-level steps only.
- Put reusable judgment in skills, long detail in skill `references/`, fixed wording in templates, and deterministic checks in scripts.
- When editing commands, keep frontmatter such as `agent`, `implementation_pattern`, and `load_skills` aligned with the command's responsibility.
- When adding or moving canonical documents, update the relevant index, DOC-MAP, links, and cross-references in the same change.
- After documentation edits, check for broken relative links, stale REQ ranges, legacy command names, and `reference/` vs `references/` drift.
- Prefer existing lifecycle states, directory names, and terminology. Do not invent new workflow states unless the change is backed by a new or updated requirement.

## Working style

- Make surgical changes that directly trace to the requested task.
- Match existing style before introducing new structure.
- Avoid adjacent refactors and speculative cleanup.
- State important assumptions when the task is ambiguous.
- For multi-step changes, use a brief plan and verify the result with the narrowest useful check.
