import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

const FILES = {
  "docs/requirements/REQ-001.md": `---
id: REQ-001
title: Sample requirement
governed_by: [IR-001]
---
# Sample requirement

See [decision](../adr/ADR-001.md).
`,
  "docs/adr/ADR-001.md": `---
id: ADR-001
title: Old decision
status: superseded
superseded_by: ADR-002
---
# Old decision
`,
  "docs/adr/ADR-002.md": `---
id: ADR-002
title: Current decision
status: accepted
---
# Current decision

See [specification](../specs/feature.md).
`,
  "docs/specs/feature.md": `---
title: Feature specification
canonical_owner: sample-skill
governed_by: [IR-001]
---
# Feature specification
`,
  "docs/specs/integrity/rules/IR-001-sample.md": `---
id: IR-001
title: Sample rule
related_req: [REQ-001]
related_spec: [feature.md]
---
# IR-001: Sample rule
`,
  "src/opencode/commands/agentdev/sample.md": `---
description: Sample command
delegates_to: [sample-skill]
governed_by: [IR-001]
---
# Sample command
`,
  "src/opencode/skills/sample-skill/SKILL.md": `---
name: sample-skill
description: Sample skill. USE FOR: tests. DO NOT USE FOR: production.
---
# Sample skill
`,
  ".agentdev/extensions/commands/sample.yaml": `id: sample-extension
context:
  paths:
    - docs/specs/feature.md
rules:
  - id: sample-rule
    skill: sample-skill
checks:
  - id: sample-check
    skill: sample-skill
`,
  "scripts/sample.ts": "export const sample = true\n",
} as const

export async function createFixture(root: string): Promise<void> {
  for (const [relativePath, content] of Object.entries(FILES)) {
    const fullPath = join(root, relativePath)
    await mkdir(join(fullPath, ".."), { recursive: true })
    await writeFile(fullPath, content, "utf8")
  }
}
