import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

/**
 * Minimal consumer fixture with only the 3 default indexed_paths populated.
 * No AgentDevFlow distribution artifacts, no self-hosting paths.
 * REQ\u002D012-002: default indexed_paths = docs\\u002Frequirements, docs\\u002Fdecisions, docs\\u002Fspecs only.
 * REQ\u002D012-003: default node_types = requirement, decision, specification only.
 */
const FILES = {
  "docs\\u002Frequirements/REQ\u002D001.md": `---
id: REQ\u002D001
title: Sample requirement
status: accepted
---
# Sample requirement

See [decision](../decisions/DEC\u002D001.md) and [spec](../specs/feature.md).
`,
  "docs\\u002Fdecisions/DEC\u002D001.md": `---
id: DEC\u002D001
title: Old decision
status: superseded
superseded_by: DEC\u002D002
---
# Old decision
`,
  "docs\\u002Fdecisions/DEC\u002D002.md": `---
id: DEC\u002D002
title: Current decision
status: accepted
---
# Current decision

See [specification](../specs/feature.md).
`,
  "docs\\u002Fspecs/feature.md": `---
title: Feature specification
canonical_owner: sample-skill
---
# Feature specification
`,
  "docs\\u002Fspecs/README.md": `# Specs index
This README should NOT produce a specification node.
`,
} as const

export async function createFixture(root: string): Promise<void> {
  for (const [relativePath, content] of Object.entries(FILES)) {
    const fullPath = join(root, relativePath)
    await mkdir(join(fullPath, ".."), { recursive: true })
    await writeFile(fullPath, content, "utf8")
  }
}

/**
 * Fixture with project-owned source files NOT in default indexed_paths.
 * Used for discovery_roots testing (REQ\u002D012-007, TS-005).
 */
export async function createSourceFixture(root: string): Promise<void> {
  const sources = {
    "src/module.ts": `import { foo } from "./foo"
export const bar = foo + 1
`,
    "src/foo.ts": `export const foo = 42
export function helper() { return "agentdev-artifact-graph" }
`,
    "tests/test_module.ts": `import { bar } from "../src/module"
test("bar", () => { expect(bar).toBe(43) })
`,
  } as const
  for (const [relativePath, content] of Object.entries(sources)) {
    const fullPath = join(root, relativePath)
    await mkdir(join(fullPath, ".."), { recursive: true })
    await writeFile(fullPath, content, "utf8")
  }
}

/**
 * Augmentation file that adds a project-specific node type and relation type.
 * Used for TS-003 (augmentation adds node_type/relation_type).
 */
export const AUGMENTATION_WITH_GUIDE = `node_types:
  - name: guide
    path_pattern: "^docs\\u002Fguides/([^/]+)\\\\.md$"
    id_template: "guide:{match1}"
    label_source:
      - kind: first_heading
    extraction_rule: frontmatter
relation_types:
  - name: documented_in
    fields:
      - documented_in
    reverse_direction: false
indexed_paths:
  - docs\\u002Fguides
discovery_roots:
  - src
  - tests
`

export async function createGuideFixture(root: string): Promise<void> {
  const guides = {
    "docs\\u002Fguides/quickstart.md": `---
documented_in: REQ\u002D001
---
# Quickstart Guide

See [requirement](../requirements/REQ\u002D001.md).
`,
  } as const
  for (const [relativePath, content] of Object.entries(guides)) {
    const fullPath = join(root, relativePath)
    await mkdir(join(fullPath, ".."), { recursive: true })
    await writeFile(fullPath, content, "utf8")
  }
}
