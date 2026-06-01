# Work Plan: Issue #513

Pattern: D (ドキュメント・雑務)
Branch: chore/issue-513
Worktree: .worktrees/513-chore

## Changes (11 items)

### 1. README or workflow-overview に入口表を追加 (REQ-0101-017)
- File: README.md
- Replace the "ワークフローの入口" section with an entry table: current input state -> next command -> output
- Also add to workflow-overview.md top section

### 2. workflow-overview を生成物中心に再構成 (REQ-0101-019)
- File: docs/guides/workflow-overview.md
- Restructure to show: previous artifact -> command -> next artifact flow
- Remove concept-heavy descriptions, show artifact chain first

### 3. root README を短縮 (REQ-0101-020)
- File: README.md
- Keep: identity, entry table, reference links, quick start
- Remove: duplicated concept explanations, detailed flow descriptions, doc structure tree

### 4. .agentdev/README.md を状態表化 (REQ-0101-022)
- File: .agentdev/README.md
- Convert to state table: path, state, producer, consumer, retention

### 5. .agentdev/.sisyphus 境界を明記 (REQ-0101-023)
- File: .agentdev/README.md
- Explicitly state .agentdev/ = persistent domain state, .sisyphus/ = runtime workspace
- Note that working drafts are not canonical domain state

### 6. artifact-model.md を保守者向けに位置づけ (REQ-0101-024)
- File: docs/guides/artifact-model.md
- Add header note: internal maintainer model, not user entry point
- Remove user-facing positioning

### 7. domain-state-lifecycle.md を詳細版として整理 (REQ-0101-025)
- File: docs/guides/domain-state-lifecycle.md
- Ensure no contradiction with .agentdev/README.md state table
- Focus on state transitions, producer/consumer/retention/failure handling

### 8. command README をリファレンス化 (REQ-0101-026)
- File: .opencode/commands/agentdev/README.md
- Convert to reference table: command, primary input, primary output, next command/action
- Remove concept explanations and flow descriptions

### 9. 旧REQ参照・非推奨command参照・非canonical path参照を除去 (REQ-0101-021)
- Target files: README.md, .agentdev/README.md, workflow-overview.md, artifact-model.md, domain-state-lifecycle.md, DOC-MAP.md, command README
- Remove: REQ-0017 references, REQ-0039 references, deprecated command refs, reference/ (singular) path refs
- Fix: reference/ -> references/ links

### 10. 「本流」「支流」「合流」の使用を排除 (REQ-0101-018)
- Files: README.md, workflow-overview.md, domain-state-lifecycle.md
- Replace "合流" with "結合" or rewrite sentence

### 11. reference/ -> references/ 表記を統一 (REQ-0103-039)
- Files: README.md, artifact-model.md, domain-state-lifecycle.md, specs/system.md, specs/patterns.md
- Fix all `reference/` links to `references/`

## Execution Order

1. Fix reference/ -> references/ (#11) - foundational, affects other changes
2. Remove 合流/本流/支流 (#10) - simple text replacement
3. Rewrite README.md (#3 + #1) - combined: shorten + add entry table
4. Rewrite workflow-overview.md (#2) - artifact-centric restructure
5. Rewrite .agentdev/README.md (#4 + #5) - combined: state table + boundary
6. Update artifact-model.md (#6) - maintainer positioning
7. Update domain-state-lifecycle.md (#7) - detailed version alignment
8. Rewrite command README (#8) - reference table format
9. Final stale reference cleanup (#9) - sweep all files
